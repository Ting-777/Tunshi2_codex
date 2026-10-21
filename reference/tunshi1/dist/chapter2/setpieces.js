import {SHOP,GARAGE,HOME,OFFICE,B1,MALL} from './missions.js';
import {distance,position} from './world.js';
import {conversations as D} from './dialogues.js';

// Each scene keeps its own phases inside the existing saved objective. Travel is
// connective tissue; the phase ends on an action, escape, cargo or defence result.
export class SecondScenes{
 constructor(rt){this.rt=rt;this.world=rt.world;this.api=rt.api;this.pursuerRoutes=new Map();}
 // Old saves stored a position without vehicle identity. Transport always
 // restarts in the cargo truck, even after the player has hijacked another car.
 retryCheckpoint(o,cp){
  if(o.type!=='transport')return cp;
  const e=this.world.delivery,start=this.rt.state().world.deliveryAt||[110,-145],at=cp?.ride||[start[0],.5,start[1]];
  e.enabled=true;e.region=cp?.region||e.region;e.area=cp?.interior||'outside';e.parkedInterior=cp?.interior||null;e.parked=true;e.scripted=false;e.hp=e.maxHp;
  e.intentX=e.intentZ=e.vx=e.vz=e.kx=e.kz=e.stun=0;e.g.position.fromArray(at);
  return{...cp,position:at.slice(),ride:at.slice(),rideId:e.id,rideKey:e.populationKey,driving:true};
 }
 begin(o,p){
  this.api.carry(null);this.pursuerRoutes.clear();
  if(o.id==='c202-run'&&p.carrying){this.api.carry('货箱');this.world.spawn([-609,-150],3,p);}
  if(o.type==='delivery'){
   const e=this.world.delivery;e.enabled=true;e.area='outside';e.parkedInterior=null;e.scripted=true;e.hp=p.deliveryHP??100;
   const at=p.deliveryAt||[85,-145];e.g.position.set(at[0],.5,at[1]);this.deliveryRoute=this.rt.routeFor([[85,-145],[120,-120],[-160,-120],[-162.5,100]],'outside',true);p.deliveryIndex??=1;
   if(!this.api.get().driving)this.api.storyCar([125,-133]);
  }
  if(o.type==='transport'){
   const e=this.world.delivery;e.enabled=true;e.scripted=false;e.parked=true;
   if(e!==this.api.ride){const r=this.api.interiors[B1],inside=this.rt.area()===B1;e.area=inside?B1:'outside';e.parkedInterior=inside?B1:null;const at=p.deliveryAt||this.rt.state().world.deliveryAt||(inside?[2850,10]:[110,-145]);e.g.position.set(at[0],.5,at[1]);e.hp=p.deliveryHP??100;}
   else{e.area=this.rt.area();e.enabled=true;}
   if(p.unloading){this.world.spawn([2843,-6],4,p,B1);this.api.carry('文件箱');}
  }
  if(o.id==='c205-atrium'){
   const e=this.world.contact('夜班调度',o.at,MALL);e.g.rotation.y=Math.PI/2;
   if(!p.briefed){p.briefed=true;this.rt.say('c205:atrium-route',D.events.atriumRoute,'无线电');}
  }
  if(o.id==='c204-topics'&&p.collectors&&!p.collectionDone){this.world.spawn([2550,5],3,p,SHOP);this.world.contact('攀哥',[2545,4],SHOP);}
  if(o.id==='c206-office'&&p.escaping){this.api.carry('资料');this.rt.actions.forceAlarm('export');}
  if(o.id==='c207-break'&&p.opened){this.api.carry('铁盒');this.world.spawn([2200,8],4,p,HOME);}
 }
 tick(o,p,dt){
  const rt=this.rt,g=this.api.get(),w=rt.state().world;
  if(o.id==='c202-run'){
   if(p.caught&&!p.carrying){p.carrying=true;p.caught=false;this.api.carry('货箱');this.world.spawn([-609,-150],3,p);rt.say('c202:chasecrew',D.events.cargoCrew);}
   if(p.carrying){this.world.preserve(p);return rt.area()==='outside'&&distance(rt.position(),[-603,-140])<4;}
  }
  if(o.id==='c203-garage'){
   const found=o.items.every(id=>p.items.includes(id));
   if(found&&!p.escaping){p.escaping=true;rt.say('c203:escape',p.security?.reported||p.detected?D.events.garageEscape:D.events.garageQuietEscape);}
   if(p.escaping){if(rt.area()==='outside'){this.api.carry(null);return true;}return false;}
  }
  if(o.id==='c204-topics'){
   if(p.served>=2&&!p.collectors){p.collectors=true;this.world.spawn([2550,5],3,p,SHOP);this.world.contact('攀哥',[2545,4],SHOP);rt.workshop.active=false;rt.workshop.hide();rt.say('c204:collectors',D.events.collectors);}
   if(p.collectors&&!p.collectionDone){this.world.preserve(p);if(this.world.enemies.every(e=>e.hp<=0)){p.collectionDone=true;w.collectorsCleared=true;this.world.clearEnemies();rt.say('c204:clear',D.events.collectorsClear);this.rt.parent.save();}return false;}
  }
  if(o.type==='delivery')return this.delivery(o,p,dt);
  if(o.type==='transport')return this.transport(o,p,dt);
  if(o.id==='c206-office'){
   if(p.copy){const prop=this.world.props.get(p.copy.id);if(rt.area()!==prop.area||distance(rt.position(),p.copy.start)>.7){p.copy=null;this.api.toast('复制中断 · 回设备旁重新操作');}
    else if(!rt.actions.security.canCopy()){p.copy=null;this.api.toast('守卫正盯着设备 · 先脱离视线，再回来复制');}
    else{p.copy.time+=dt;if(p.copy.time>=p.copy.duration){const id=p.copy.id;p.copy=null;rt.actions.collectClue(id);if(id==='email-title')rt.actions.forceAlarm('export');}}}
   if(o.items.every(id=>p.items.includes(id))){if(!p.escaping){p.escaping=true;this.api.carry('资料');rt.say('c206:exit',D.events.officeEscape);rt.actions.forceAlarm('export');}return rt.area()==='outside';}return false;
  }
  if(o.id==='c207-break'&&p.opened){this.world.preserve(p);return rt.area()==='outside';}
  return undefined;
 }
 delivery(o,p,dt){
  const e=this.world.delivery,g=this.api.get(),gap=distance(this.rt.position(),position(e));p.engaged||=gap<45;
  if(g.driving&&this.api.ride===e){e.scripted=false;this.rt.state().world.deliveryAt=position(e);return true;}
  if(e.hp<=0)return{fail:'配送车报废 · T 重试截车，先逼停再上车'};
  if(p.engaged){const stopped=e.hp<=60||p.deliveryIndex>=this.deliveryRoute.length;
   const own=g.driving?position(this.api.ride):this.rt.position(),ep=position(e),f=[Math.sin(e.g.rotation.y),Math.cos(e.g.rotation.y)];
   const blocked=g.driving&&g.carSpeed<2&&gap<8&&(own[0]-ep[0])*f[0]+(own[1]-ep[1])*f[1]>0;
   if(blocked){p.block=(p.block||0)+dt;}else p.block=0;if(p.block>1.5)p.stopped=true;
   if(stopped||p.stopped){e.intentX=e.intentZ=0;e.parked=true;e.scripted=false;p.stopped=true;if(!p.notice){p.notice=true;this.rt.say('c205:stopped',D.events.deliveryStopped);}}
   else{e.parked=false;this.rt.actions.steer(e,this.deliveryRoute,{get index(){return p.deliveryIndex},set index(v){p.deliveryIndex=v}},e.stun>0?0:6.8);}
  }
  p.deliveryAt=position(e);p.deliveryHP=e.hp;return false;
 }
 transport(o,p,dt){
  const rt=this.rt,g=this.api.get(),e=this.world.delivery;const at=position(e);p.deliveryAt=at;p.deliveryHP=e.hp;
  if(e.hp<=0)return{fail:'载货车辆报废 · T 从夺车后重新运货'};
  if(g.driving&&this.api.ride===e&&rt.area()==='outside'){
   p.started=true;for(const [i,car]of this.world.pursuers.entries()){
    if(!car.enabled){car.enabled=true;car.area='outside';car.scripted=true;car.hp=100;const loc=this.api.safeRegion('chapter2_chazishan',at[0]+(i?9:-9),at[1]+16,2.5);car.g.position.set(loc[0],.5,loc[1]);}
    this.chase(car,at,dt,i);}
  }else for(const car of this.world.pursuers)car.intentX=car.intentZ=0;
  if(rt.area()===B1&&distance(at,[2837,-6])<7&&g.driving&&this.api.ride===e&&!p.parked){p.parked=true;this.api.toast('到卸货区了 · E 下车，再到车边 E 卸文件箱');}
  if(p.unloading){this.world.preserve(p);return this.world.enemies.every(x=>x.hp<=0)&&distance(rt.position(),[2837,-6])<4&&!g.driving;}
  return false;
 }
 chase(e,target,dt,i){
  if(e.hp<=0){e.intentX=e.intentZ=0;return;}const ep=position(e),gap=distance(ep,target);e.navClock=(e.navClock||0)-dt;
  let track=this.pursuerRoutes.get(e);
  if(!track||e.navClock<=0){try{track={route:this.rt.routeFor([ep,target],'outside',true),index:1};this.pursuerRoutes.set(e,track);}catch{track={route:[ep,target],index:1};}e.navClock=1.3;}
  if(gap>120||gap<3){e.intentX=e.intentZ=0;return;}this.rt.actions.steer(e,track.route,track,i?6.5:7.5);
 }
 interact(o,p){
  const rt=this.rt,g=this.api.get(),pos=rt.position();
  if(o.id==='c205-atrium'){
   const e=this.world.contacts.get('夜班调度');if(rt.area()!==MALL||g.driving||!e?.enabled||distance(pos,position(e))>=3||!this.world.lineClear(pos,position(e)))return false;
   p.talked=true;rt.state().world.mallReceipt=true;return true;
  }
  if(o.type==='delivery'&&!g.driving&&p.stopped&&distance(pos,position(this.world.delivery))<4.2){this.world.delivery.scripted=false;this.api.board(this.world.delivery);return true;}
  if(o.type==='transport'&&rt.area()==='outside'&&!g.driving&&distance(pos,position(this.world.delivery))<3.7){this.api.board(this.world.delivery);return true;}
  if(o.type==='transport'&&rt.area()===B1&&!g.driving&&distance(pos,position(this.world.delivery))<4.2&&!p.unloading){p.unloading=true;this.api.carry('文件箱');this.world.spawn([2843,-6],4,p,B1);rt.say('c205:unload',D.events.unloadAmbush);return true;}
  if(o.id==='c206-office'){
   if(p.copy)return true;const prop=this.world.nearest(o.items.filter(id=>!p.items.includes(id)));if(prop){if(!rt.state().world.staffPass){this.api.toast('取 B1 门卡，或 F 破门');return true;}
    if(!rt.actions.security.canCopy()){this.api.toast('守卫正盯着这里 · 蹲下绕行，等他转身再操作');return true;}p.copy={id:prop.id,start:pos,time:0,duration:prop.id==='email-title'?7:4};this.api.toast('复制中 · 保持在设备旁，移动会中断');return true;}
  }
  if(o.id==='c207-break'&&this.world.sets.iron.g.visible&&rt.area()===HOME&&distance(pos,this.world.sets.iron.at)<3){p.opened=true;rt.state().world.originals=true;this.api.carry('铁盒');this.world.apply(rt.state());this.world.spawn([2200,8],4,p,HOME);rt.say('c207:ambush',D.events.homeAmbush);return true;}
  return undefined;
 }
 destination(o,p){
  if(o.id==='c202-run'&&p.carrying)return{at:[-603,-140],area:'outside',label:'把货带回店主 · 追来的人可打可甩'};
  if(o.id==='c203-garage'&&p.escaping)return{at:[2400,-24],area:GARAGE,label:'带记录从北侧坡道撤离'};
  if(o.id==='c204-topics'&&p.collectors&&!p.collectionDone)return{at:[2550,4],area:SHOP,label:'保护开张现场 · 击退收账的人'};
  if(o.type==='delivery')return{at:position(this.world.delivery),area:'outside',label:p.stopped?'配送车已停 · 下车靠近按 E 夺车':'逼停配送车 · 碰撞 / 超车堵路'};
  if(o.type==='transport')return{at:this.rt.area()===B1?[2837,-6]:this.api.interiors[B1].entry,area:this.rt.area()===B1?B1:'outside',label:p.unloading?'清掉卸货区的人，把文件箱交到后勤台':'载货车开进 B1 · 西侧卸货区'};
  if(o.id==='c205-atrium')return{at:position(this.world.contacts.get('夜班调度')),area:MALL,label:'茶湾咖啡 · 夜班调度'};
  if(o.id==='c206-office'&&p.escaping)return{at:this.rt.area()===B1?[2850,18]:[3019,16],area:this.rt.area()===B1?B1:OFFICE,label:'带复印件走员工楼梯，再从 B1 出街'};
  if(o.id==='c207-break'&&p.opened)return{at:this.api.interiors[HOME].exits[0].at,area:HOME,label:'抱铁盒离开旧宅 · 拆家具能震倒近处敌人'};
  return undefined;
 }
 hint(o,p){
  if(o.id==='c202-run'&&p.carrying)return'货箱在身上 · 追兵可用栏杆、车辆甩开';
  if(o.id==='c203-garage'&&p.escaping)return'出口真实连通街区 · 可从车库开车撤离';
  if(o.id==='c204-topics'&&p.collectors&&!p.collectionDone)return'格挡手用三连击破防，冲锋手等蓄力后闪身';
  if(o.type==='delivery')return'车还要用 · 损伤到 60 耐久即停，别把它撞报废';
  if(o.type==='transport')return'载货车耐久 '+Math.ceil(this.world.delivery.hp)+' · 到 B1 卸货，摆脱追车';
  if(o.id==='c205-atrium')return this.rt.area()===MALL?'中庭西侧茶湾咖啡 · 从玻璃店面的中央开口进去':this.rt.area()===B1?'B1 北侧电梯 · 上到商业中庭':'进入凯德壹中心一层 · 茶湾咖啡';
  if(o.id==='c206-office'&&p.copy)return'复制 '+Math.ceil(p.copy.time)+'/'+p.copy.duration+' 秒 · 可中断躲避，再回来';
  if(o.id==='c206-office'&&p.escaping)return'已取资料 · 不必清光守卫，带出办公楼';
  if(o.id==='c207-break'&&p.opened)return'铁盒拿到了 · 打通门口撤离，破坏痕迹保留';
  return undefined;
 }
 finish(){this.api.carry(null);for(const car of this.world.pursuers)car.enabled=false;}
}
