import {distance,position} from './world.js';
import {SHOP,GARAGE,HOME,OFFICE,B1} from './missions.js';
import {conversations as D} from './dialogues.js';
import {SecondScenes} from './setpieces.js';
import {SecondSecurity} from './security.js';
const guarded=new Set(['stealth','infiltrate']);
export class SecondActions{
 constructor(rt){this.rt=rt;this.api=rt.api;this.world=rt.world;this.scenes=new SecondScenes(rt);this.security=new SecondSecurity(this);this.handlers={cross:this.cross,investigate:this.inspect,parking:this.parking,runner:this.runner,boundary:this.boundary,stealth:this.inspect,topics:this.topics,identify:this.identify,infiltrate:this.inspect,demolition:this.demolition,prepare:this.prepare,defense:this.defense,fight:this.fight,intercept:this.intercept,interact:this.talk};}
 begin(o,p){
  this.rt.workshop.hide();this.security.clear();this.route=[];if(o.id==='c207-break'&&this.rt.state().world.originals)p.opened=true;this.guards=[];this.patrols=[];this.world.clear();p.items||=[];
  for(const id of o.items||[])if(this.rt.state().world.clues[id]&&!p.items.includes(id))p.items.push(id);
  if(o.type==='parking'){const e=this.world.blockCar;e.enabled=true;e.parked=true;const at=p.carAt||o.at;e.g.position.set(at[0],.5,at[1]);}
  if(['runner','intercept'].includes(o.type)){
   this.route=this.rt.routeFor(o.route,o.area||'outside',o.type==='intercept');const e=this.actor(o);e.enabled=true;e.area=o.area||'outside';e.hp=p.actorHp??e.maxHp;
   const at=p.actorAt||this.route[0]||o.at;e.g.position.set(at[0],e.kind==='car'?.5:.2,at[1]);p.index??=1;e.intentX=e.intentZ=0;
   if(o.type==='intercept'&&!this.api.get().driving&&!this.rt.state().world.finalBagCaught)this.api.storyCar([125,-133]);
  }
  if(o.type==='boundary'){const e=this.world.drunk;e.enabled=true;e.hp=p.actorHp??60;const at=p.actorAt||o.at;e.g.position.set(at[0],.2,at[1]);}
  if(o.type==='topics')this.rt.workshop.begin(p);
  if(o.type==='prepare')this.world.contact('Dina',[2545,-3],SHOP);
  if(o.type==='identify')for(const e of this.world.candidates){e.enabled=true;e.hp=e.maxHp;}
  if(guarded.has(o.type))this.security.begin(o,p);
  if(o.type==='fight'||o.type==='defense'&&p.spawned)this.world.spawn(o.at,o.count||p.enemies?.length||3,p,o.area||'outside');
  if(o.type==='defense'){p.wave??=0;p.fileHP??=this.rt.state().world.reinforcedShutter?140:100;this.world.contact('Dina',[2545,-3],SHOP);this.world.contact('肝脏',[2555,4],SHOP);this.applyPurchase('hiredHelp');}
  if(o.id==='c209-meet'||o.id==='c209-fight')for(const [name,at]of [['章鱼',[251,-80]],['攀哥',[257,-82]],['RY',[252,-87]]])this.world.contact(name,at);
  if(o.id==='c202-zhang')this.world.contact('章鱼',o.at);
  if(o.id==='c209-files')this.world.contact('RY',this.rt.state().world.recoveredAt||o.at);
  if(o.id==='c209-return')this.world.contact('仙人',o.at,SHOP);
  if(o.area===HOME)this.world.contact('小朋友',[2203,1],HOME);this.scenes.begin(o,p);
 }
 actor(o){return o?.type==='runner'?this.world.runner:this.world.carrier;}
 tick(o,p,dt){
  if(guarded.has(o.type))this.security.tick(o,p,dt);
  if(this.world.enemies.length){
   const helpers=o.allies||(o.ally?[o.ally]:o.type==='topics'?['攀哥']:[]);this.world.allies(o.type==='defense'&&this.rt.state().world.hiredHelp?[...helpers,'阿松','阿福']:helpers,dt);
  }
  const scene=this.scenes.tick(o,p,dt);return scene!==undefined?scene:this.handlers[o.type]?.call(this,o,p,dt)??false;
 }
 finish(o,p){
  const pay={'c202-park':60,'c202-run':100,'c202-drunk':40};if(pay[o.id])this.rt.economy.credit(o.id,pay[o.id]);if(o.id==='c202-run')this.rt.say('c202:delivered',D.events.cargoCaught);
  if(o.type==='topics')this.rt.workshop.hide();this.scenes.finish();this.world.clearEnemies();this.rt.navigation=null;
 }
 applyPurchase(id){
  if(!this.rt.state().world[id])return;
    if(id==='hiredHelp'&&this.rt.manager?.objective?.type==='defense')for(const [name,at]of [['阿松',[2547,1]],['阿福',[2553,1]]])this.world.contact(name,at,SHOP);
 }
 forceAlarm(reason='seen'){return this.security.alarm(reason);}
 collectClue(id){
  const rt=this.rt,w=rt.state().world,p=rt.manager?.record?.progress;if(!p)return false;p.items||=[];
  if(!p.items.includes(id))p.items.push(id);const fresh=!w.clues[id];w.clues[id]=true;
  if(id==='shop-power')w.shopPower=true;if(id==='garage-west')w.garagePower.west=true;if(id==='garage-east')w.garagePower.east=true;if(id==='staff-pass')w.staffPass=true;
  if(id==='side-entry'){w.doorOpen=true;this.api.enter(SHOP);}this.world.apply(rt.state());
  if(fresh&&D.clues[id])rt.say('c2:clue:'+id,D.clues[id]);return true;
 }
 cross(o){const g=this.api.get();return g.region==='chapter2_chazishan'&&g.visited?.includes('connector_yinpenling_bridge')&&g.driving&&distance(this.rt.position(),o.at)<o.radius;}
 inspect(o,p){return(o.id==='c201-alley'||this.rt.area()===o.area)&&o.items.every(id=>p.items.includes(id));}
 parking(o,p){const e=this.world.blockCar;p.carAt=position(e);return distance(p.carAt,o.at)>10&&!this.api.get().driving;}
 steer(e,route,p,speed){if(!route.length)return;const pos=position(e);while(p.index<route.length&&distance(pos,route[p.index])<1.2)p.index++;const at=route[p.index];e.intentX=e.intentZ=0;if(at){const d=distance(pos,at);e.intentX=(at[0]-pos[0])/Math.max(.01,d)*speed;e.intentZ=(at[1]-pos[1])/Math.max(.01,d)*speed;e.g.rotation.y=Math.atan2(e.intentX,e.intentZ);}p.actorAt=pos;p.actorHp=e.hp;}
 runner(o,p){
  if(this.rt.area()!==(o.area||'outside')||this.api.get().driving)return false;const e=this.world.runner,gap=distance(this.rt.position(),position(e));p.engaged||=gap<35;if(!p.engaged)return false;
  if(e.hp>0&&!p.caught)this.steer(e,this.route,p,gap>45?1.5:o.speed);else e.intentX=e.intentZ=0;
  if(o.carEscape){if(p.caught||e.hp<=0&&gap<3.5){this.keepBag(p);return true;}if(p.index>=this.route.length&&gap<18){if(!p.notice){p.notice=true;this.rt.state().world.roadblock=true;this.world.apply(this.rt.state());this.rt.say('c209:transfer',D.events.bagTransfer);}return true;}return false;}
  return !!p.caught||e.hp<=0&&gap<10;
 }
 keepBag(p){p.caught=true;const w=this.rt.state().world;w.finalBagCaught=true;w.recoveredAt=position(this.world.runner);this.world.runner.intentX=this.world.runner.intentZ=0;this.rt.say('c209:bagCaught',D.events.bagCaught);}
 boundary(o,p,dt){
  if(this.rt.area()!=='outside'||this.api.get().driving)return false;const e=this.world.drunk;p.actorAt=position(e);p.actorHp=e.hp;
  if(p.persuaded&&!p.pushed){const target=[-590,-154],d=distance(position(e),target);e.intentX=(target[0]-e.g.position.x)/Math.max(d,.01)*1.7;e.intentZ=(target[1]-e.g.position.z)/Math.max(d,.01)*1.7;}
  if(distance(position(e),o.at)>8&&!p.pushed){p.pushed=true;e.intentX=e.intentZ=0;this.rt.say(o.id+':fight',D.events.drunkFight);this.world.enemies=[e];e.hitCooldown=0;e.windup=.6;}
  if(p.pushed){this.world.enemies=[e];return e.hp<=0;}return false;
 }
 topics(o,p,dt){this.rt.workshop.tick(p,dt);return(p.served||0)>=3;}
 identify(o,p,dt){
  if(this.rt.area()!=='outside'||this.api.get().driving||p.scan===undefined)return false;const e=this.world.candidates[p.scan],at=position(e),pos=this.rt.position(),gap=distance(at,pos),yaw=this.api.get().yaw;
  const facing=(-(at[0]-pos[0])*Math.sin(yaw)-(at[1]-pos[1])*Math.cos(yaw))/Math.max(.01,gap);
  if(gap>22||facing<.65||distance(pos,p.scanStart)>.8){p.scan=undefined;p.scanTime=0;this.api.toast('观察中断 · 站稳并把镜头朝向车辆，再按 E');return false;}
  p.scanTime=(p.scanTime||0)+dt;
  if(p.scanTime>=2.2){const id=p.scan;p.scanned||=[];if(!p.scanned.includes(id))p.scanned.push(id);p.scan=undefined;p.scanTime=0;if(id===1){p.identified=true;this.rt.say('c205:match',D.events.deliveryMatch);}else this.rt.say('c205:wrong:'+id,D.events.wrongCar);}
  return !!p.identified;
 }
 demolition(o,p){return !!p.opened;}
 dinaAt(){const e=this.world.contacts.get('Dina');return e?position(e):[2545,-3];}
 prepare(o,p,dt){if(this.rt.economy.funding.pending)return false;if(this.rt.area()!==SHOP&&!p.started)return false;p.started=true;p.time=(p.time||0)+dt;return p.ready||p.time>=30;}
 defense(o,p,dt){
  if(this.rt.area()!==SHOP)return false;const w=this.rt.state().world;
  if(p.fileHP<=0)return{fail:'文件包被夺走 · T 重试防守，装修破坏保留'};
  if(!p.spawned){const sites=[[2549,6],[2557,-4],[2544,5]],blocked=distance(position(this.world.blockCar),[-547,-145])<7;
   const reductions=0;this.world.spawn(sites[p.wave],Math.max(1,3+p.wave-reductions),p,SHOP);
   if(p.wave===0&&w.shutterClosed)for(const e of this.world.enemies)e.hitCooldown=4;
   if(p.wave===2&&!w.shopBreach){w.shopBreach=true;this.world.apply(this.rt.state());const car=this.world.carrier;car.enabled=true;car.area=SHOP;car.hp=100;car.g.position.set(2550,.5,7);car.g.rotation.y=Math.PI;car.intentZ=-5;this.rt.say('c208:breach',D.events.breach);}}
  if(this.world.carrier.enabled&&this.world.carrier.area===SHOP)this.world.carrier.intentZ=this.world.carrier.g.position.z>4.8?-5:0;
  this.world.preserve(p);const dina=this.world.contacts.get('Dina');p.fileClock=(p.fileClock||0)+dt;
  if(this.world.enemies.every(e=>e.hp<=0)){p.wave++;p.spawned=false;p.enemies=null;this.world.clearEnemies();if(p.wave<3)this.rt.say('c208:wave:'+p.wave,D.events['wave'+p.wave]);this.rt.parent.save();}
  return p.wave>=3;
 }
 fight(o,p){if(this.rt.area()!==(o.area||'outside'))return false;this.world.preserve(p);return p.spawned&&this.world.enemies.every(e=>e.hp<=0);}
 intercept(o,p,dt){
  if(this.rt.state().world.finalBagCaught)return true;if(this.rt.area()!=='outside')return false;
  const e=this.world.carrier,pos=this.rt.position(),ep=position(e),gap=distance(pos,ep);p.engaged||=gap<45;if(!p.engaged)return false;
  const g=this.api.get(),forward=[Math.sin(e.g.rotation.y),Math.cos(e.g.rotation.y)];
  const block=g.driving&&g.carSpeed<2&&gap<9&&(pos[0]-ep[0])*forward[0]+(pos[1]-ep[1])*forward[1]>0;
  const trap=this.rt.state().world.roadblock&&distance(ep,position(this.world.roadblockCar))<8;
  p.block=block?(p.block||0)+dt:Math.max(0,(p.block||0)-dt);this.steer(e,this.route,p,block||trap||gap>95?0:o.speed);
  if(e.hp<=35&&gap<18||p.block>=3||trap&&gap<4){this.rt.state().world.recoveredAt=ep;this.rt.state().world.roadblock=false;return true;}
  p.lost=gap>160?(p.lost||0)+dt:0;if(p.lost>15)return{fail:'收购车已经走远 · T 重试，可走短路到前面堵停'};return false;
 }
 talk(o,p){return !!p.talked;}
 inspectIds(o,p){const extras=o.type==='infiltrate'?['staff-pass','visitor-log','project-code']:o.id==='c207-search'?['old-pc','takeout']:[];return [...o.items,...extras].filter(id=>!(p.items||[]).includes(id));}
 interact(o,p){
  const rt=this.rt,w=rt.state().world,pos=rt.position();if(guarded.has(o.type)){const quiet=this.security.interact();if(quiet!==undefined)return quiet;}const scene=this.scenes.interact(o,p);if(scene!==undefined)return scene;
  if(['investigate','stealth','infiltrate'].includes(o.type)){
   const prop=this.world.nearest(this.inspectIds(o,p));if(!prop)return false;const id=prop.id;
   if(o.id==='c201-alley'&&id==='outside-power'&&!p.items.includes('window')||o.id==='c201-alley'&&id==='side-entry'&&!p.items.includes('outside-power')){this.api.toast('先看看侧窗和线路，再动旧板');return true;}
   if(o.id==='c201-shop'&&id!=='shop-power'&&!w.shopPower){this.api.toast('先恢复店内配电，黑着灯看不清柜子');return true;}
   if(id==='four-names'&&(!w.clues['garage-west']||!w.garagePower.east||!p.items.includes('locker-04'))){this.api.toast('先记下西区柜号，打开东区照明，沿 04 柜的旧编号找');return true;}
   if(['contract-page','project-code','email-title'].includes(id)&&!w.staffPass){this.api.toast('门禁未开 · B1 员工门卡，或 F 拆门');return true;}
   return this.collectClue(id);
  }
  if(o.type==='parking'&&!this.api.get().driving&&distance(pos,position(this.world.blockCar))<4){this.api.board(this.world.blockCar);return true;}
  if(o.type==='runner'&&distance(pos,position(this.world.runner))<3.5&&!this.api.get().driving){if(o.carEscape)this.keepBag(p);else{p.caught=true;this.world.runner.intentX=this.world.runner.intentZ=0;rt.say(o.id+':caught',D.events.cargoGrab);}return true;}
  if(o.type==='boundary'&&!p.pushed&&distance(pos,position(this.world.drunk))<3.5){p.persuaded=true;rt.say(o.id+':persuade',D.events.persuade);return true;}
  if(o.type==='topics')return rt.workshop.interact(p);
  if(o.type==='identify'&&rt.area()==='outside'){const i=this.world.candidates.map(e=>distance(pos,position(e))).reduce((a,d,i,arr)=>d<arr[a]?i:a,0);if(distance(pos,position(this.world.candidates[i]))<22){p.scan=i;p.scanTime=0;p.scanStart=[...pos];return true;}return false;}
  if(o.type==='demolition'&&rt.area()===HOME&&this.world.sets.iron.g.visible&&distance(pos,this.world.sets.iron.at)<3){p.opened=true;w.originals=true;this.world.apply(rt.state());return true;}
  if(o.type==='prepare'&&rt.area()===SHOP){if(this.world.nearest(['shutter'])){p.shutter=true;w.shutterClosed=true;this.world.apply(rt.state());this.api.toast('卷帘门已落下，侧门还留着');return true;}if(rt.economy.funding.pending){if(distance(pos,this.dinaAt())<3)rt.economy.funding.settle();else this.api.toast('先凑齐预算，再到 Dina 面前结算 · K 接单 / 收营业款');return true;}p.ready=true;return true;}
  if(o.type==='interact'&&rt.area()===(o.area||'outside')&&distance(pos,this.destination(o,p).at)<4){p.talked=true;return true;}return false;
 }
 event(type,data={}){
  const o=this.rt.manager.objective,p=this.rt.manager.record?.progress;if(!o||!p)return;
  if(type==='hurt'){if(p.copy){p.copy=null;this.api.toast('受伤，复制中断 · 躲开后回设备重试');}if(this.rt.workshop.active){this.rt.workshop.active=false;this.rt.workshop.hide();}}
  if(type==='damage'){if(data.entity===this.actor(o))p.actorHp=data.entity.hp;if(this.guards.includes(data.entity)){this.security.interrupted(data.entity);this.security.capture();if(data.source==='player'||data.source==='heat'||data.source==='environment')this.security.noise();}if(this.world.enemies.includes(data.entity))this.world.preserve(p);}
  if(type==='attack'&&guarded.has(o.type))this.security.noise();
 }
 destination(o,p){
  const w=this.rt.state().world,scene=this.scenes.destination(o,p);if(scene)return scene;
  if(['investigate','stealth','infiltrate'].includes(o.type)){
   if(o.type==='infiltrate'&&!w.staffPass)return{...this.world.props.get('staff-pass'),label:'B1 门卡 · 也可从大厅拆门'};
   const id=o.items.find(id=>!(p.items||[]).includes(id));const prop=this.world.props.get(id);return prop?{...prop,label:prop.name}:{at:o.at,area:o.area};
  }
  if(o.type==='topics')return{at:[2555,-.75],area:SHOP,label:'维修台 · 接单赚钱'};
  if(o.type==='prepare'&&this.rt.economy.funding.pending)return this.rt.economy.funding.canSettle?{at:this.dinaAt(),area:SHOP,label:'Dina · 结算 ¥10,300 预算'}:{at:[2555,-.75],area:SHOP,label:'维修台 · K 接加急单 / 收营业款'};
  if(o.type==='identify')return{at:[95,-125],area:'outside',label:'辨认海豚旧友的物流车'};
  if(o.type==='demolition')return{at:this.world.sets.iron.g.visible?this.world.sets.iron.at:[2193,-1.25],area:HOME,label:this.world.sets.iron.g.visible?'拿取露出的铁盒':'蓝线尽头 · 藏铁盒的隔墙'};
  if(o.type==='runner'||o.type==='intercept')return{at:position(this.actor(o)),area:o.area||'outside',label:o.type==='runner'?'追上按 E · 可以提前截住':'截停收购车'};
  if(o.type==='parking')return{at:position(this.world.blockCar),area:'outside'};
  if(o.type==='boundary')return{at:position(this.world.drunk),area:'outside'};
  if(o.id==='c209-files')return{at:w.recoveredAt||o.at,area:'outside'};
  return{at:o.at,area:o.area||'outside'};
 }
 hint(o,p){
  const scene=this.scenes.hint(o,p);if(guarded.has(o.type))return this.security.hint(o,p,scene??o.items.filter(id=>p.items?.includes(id)).length+'/'+o.items.length);if(scene!==undefined)return scene;
  if(o.type==='demolition')return this.world.sets.iron.g.visible?'铁盒已露出 · E 拿走':'全部室内隔墙和家具能拆 · F 挥拳，蓝线指向藏盒墙';
  if(o.items)return o.items.filter(id=>p.items?.includes(id)).length+'/'+o.items.length+(p.detected?' · 已暴露，仍能取证':'');
  if(o.type==='topics')return(p.served||0)+'/3 单 · 台前 E 开工，绿色区 E 收手';
  if(o.type==='identify')return p.scan!==undefined?'观察 '+Math.min(100,Math.round((p.scanTime||0)/2.2*100))+'%':'核对文件袋和车身标签';
  if(o.type==='defense')return'第 '+Math.min(3,(p.wave||0)+1)+'/3 波 · 文件耐久 '+Math.ceil(p.fileHP??100);
  if(o.type==='prepare'){const f=this.rt.economy.funding;return f.pending?'已赚 ¥'+Math.floor(f.budget.earned)+'/'+f.budget.personalRequired+' · '+(f.canSettle?'E 找 Dina 结账':'还差 ¥'+Math.ceil(f.shortfall)+' · K 接单'):Math.max(0,30-Math.ceil(p.time||0))+' 秒 · K 买帮手 / 加固，E 开战';}

  if(o.type==='boundary')return p.pushed?'拦住他，不必追出街口':'E 劝离，再拦下闹事的人';return'';
 }
}
