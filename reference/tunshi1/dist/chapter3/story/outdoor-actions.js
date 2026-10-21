import {distance,position} from './world.js';
import {D} from './dialogues.js';
import {OutdoorEncounters} from './outdoor-encounters.js';
import {DOCK_OPENING,tickDockWaves} from './dock-defense.js';

const chase=[[-178,-176],[-233,-181],[-320,-160],[-400,-137],[-430,-58],[-411,-30],[-395,-7]];
const escort=[[-395,7],[-411,-30],[-430,-58],[-485,-29],[-569,75],[-640,92],[-668,145],[-655,215],[-650,203]];
export class OutdoorActions{
 constructor(rt){this.rt=rt;this.api=rt.api;this.route=[];this.followRoute=[];this.encounters=new OutdoorEncounters(rt);}
 begin(o,p){
  const w=this.rt.world;
  if(o.type==='inspect'&&o.introLines&&!p.intro){p.intro=true;this.rt.say(o.id+':intro',o.introLines);}
  if(o.type==='contact')w.contact('JC',[-160,-176]);
  if(o.type==='recover'){
   this.route=this.rt.routeFor(chase);const e=w.runner;e.enabled=true;e.maxHp=100;e.hp=p.targetHP??100;p.routeIndex??=1;p.grace??=8;
   w.place(e,p.actorAt||this.route[0]);if(p.enemies)w.spawn([[-190,-174,'brawler'],[-205,-179,'guard']],p);
  }
  if(o.type==='escort'||o.type==='dock'){
   if(o.type==='escort')this.followRoute=this.rt.routeFor(escort);const at=p.escortAt||(o.type==='dock'?[-619,203]:[-395,7]);w.contact('JC',at);
   p.escortHP??=100;p.routeIndex??=1;if(p.passenger)w.contacts.get('JC').enabled=false;
   if(p.spawned&&!p.encounterId)w.spawn(o.type==='dock'?DOCK_OPENING:[[-520,18,'brawler'],[-536,32,'charger']],p);
  }
  this.encounters.begin(o,p);
 }
 near(o,r=3){return this.rt.area()===(o.area||'outside')&&distance(this.rt.position(),o.at)<r&&(!o.minHeight||this.api.get().position[1]-.2>=o.minHeight);}
 interact(o,p){
  const rt=this.rt,w=rt.world,state=rt.state().world,g=this.api.get();
  if(g.driving)return false;
  const gate=w.nearest(['trail-gate']);if(gate&&!state.opened.trailGate){state.opened.trailGate=true;w.apply(rt.state());this.rt.say('c3:side-gate',D.watcher);rt.parent.save();return true;}
  if(o?.type==='dock'&&w.nearest(['bridge-gate'],3.8)){
   if(p.gateBroken){this.api.toast('检修门已被砸坏 · 守住桥口');return true;}
   state.opened.bridgeGate=!state.opened.bridgeGate;w.apply(rt.state());rt.nav.cache.clear();this.api.toast(state.opened.bridgeGate?'检修门已打开':'检修门已关上 · 桥外的人进不来');rt.parent.save();return true;
  }
  if(o?.type==='escort'&&w.nearest(['escort-cart'],3.5)&&state.escortBlockade&&!state.opened.escortCart){state.opened.escortCart=true;w.apply(rt.state());this.api.toast('货推车已推到路边 · JC 可以过桥');rt.parent.save();return true;}
  const jc=w.contacts.get('JC');if(o?.type==='escort'&&jc?.enabled&&distance(rt.position(),position(jc))<3.2){p.waiting=!p.waiting;this.api.toast(p.waiting?'JC：我在这里等，你先探路。':'JC：好，跟你走。');rt.parent.save();return true;}
  if(['inspect','view','contact'].includes(o?.type)&&this.near(o,3.5)){if(!this.encounters.allows(o)){this.api.toast('先打通这里，再操作');return true;}if(o.prop&&!w.nearest([o.prop],3.5))return false;p.interacted=true;return true;}
  if(o?.type==='recover'&&w.runner.enabled&&distance(rt.position(),position(w.runner))<3.3&&w.lineClear(rt.position(),position(w.runner))){p.caught=true;state.filesReturned=true;this.api.carry('原件');this.api.toast('文件袋拿回来了');return true;}
  return false;
 }
 move(e,route,p,dt,speed,key='actorAt'){
  const here=position(e);while(p.routeIndex<route.length&&distance(here,route[p.routeIndex])<.9)p.routeIndex++;
  const target=route[p.routeIndex];e.intentX=e.intentZ=0;
  if(target){const d=Math.max(.01,distance(here,target));e.intentX=(target[0]-here[0])/d*speed;e.intentZ=(target[1]-here[1])/d*speed;e.g.rotation.y=Math.atan2(e.intentX,e.intentZ);}
  p[key]=here;
 }
 tick(o,p,dt){
  const rt=this.rt,g=this.api.get(),w=rt.world,pos=rt.position(),state=rt.state().world;
  const fighting=this.encounters.tick(o,p,dt);
  switch(o.type){
   case 'arrive':return !fighting&&this.encounters.allows(o)&&this.near(o,o.radius||8)&&(!o.vehicle||g.driving)&&(!o.onFoot||!g.driving);
   case 'inspect':case 'view':case 'contact':return !!p.interacted;
   case 'park':return !g.driving&&this.near(o,o.radius||12);
   case 'climb':return !fighting&&this.encounters.allows(o)&&this.near(o,o.radius||12)&&!g.driving;
   case 'recover':{
    if(p.caught)return true;const e=w.runner,d=distance(pos,position(e));p.grace=Math.max(0,p.grace-dt);
    p.targetHP=e.hp;if(e.hp>0)this.move(e,this.route,p,dt,p.routeIndex<this.route.length-2?6.2:4.8);else{e.intentX=e.intentZ=0;p.actorAt=position(e);}
    if(!p.spawned&&p.routeIndex>this.route.length*.42)w.spawn([[-400,-123,'brawler'],[-411,-119,'guard']],p);
    w.preserve(p);p.lost=p.grace<=0&&d>110?(p.lost||0)+dt:0;
    if(p.lost>12)return{fail:'文件被带走了 · T 从艺术中心重试'};
    if(p.routeIndex>=this.route.length){e.intentX=e.intentZ=0;if(d<24&&!p.bridgeFight){p.bridgeFight=true;this.api.toast('他被堵在岛上了 · 靠近按 E 拿回文件');}}
    return false;
   }
   case 'escort':{
    const e=w.contacts.get('JC'),d=distance(pos,position(e));e.intentX=e.intentZ=0;
    if(g.driving){
     if(d<6||p.passenger){if(!p.passenger)this.api.toast('JC已上车 · 到城市岛桥头再下车');p.passenger=true;e.enabled=false;e.g.visible=false;w.place(e,[pos[0]+3,pos[1]]);p.escortAt=position(e);}
    }else{
     if(p.passenger){p.passenger=false;e.enabled=true;const closest=this.followRoute.reduce((best,a,i)=>distance(a,pos)<distance(this.followRoute[best],pos)?i:best,0);p.routeIndex=closest;}
     if(d<18&&!p.waiting&&!fighting)this.move(e,this.followRoute,p,dt,Math.min(5.6,3.5+d*.12),'escortAt');
    }
    w.preserve(p);if(p.escortHP<=0)return{fail:'JC受伤倒下了 · T 重新护送，文件不会丢失'};
    return !p.waiting&&!fighting&&this.encounters.cleared('escort-bridge')&&(!state.escortBlockade||state.opened.escortCart||w.props.get('escort-cart').hp<=0)&&!g.driving&&this.near(o,10)&&distance(position(e),o.at)<12;
   }
   case 'dock':{
    const e=w.contacts.get('JC');e.intentX=e.intentZ=0;p.escortAt=position(e);
    tickDockWaves(rt,p,dt);
    p.verifyBlocked=w.enemies.some(enemy=>enemy.enabled&&enemy.hp>0&&distance(position(enemy),position(e))<5&&w.lineClear(position(enemy),position(e)));
    p.time=(p.time||0)+(distance(pos,[-618,203])<28&&!p.verifyBlocked?dt:0);
    w.preserve(p);if(p.escortHP<=0)return{fail:'核验被打断，JC倒下了 · T 从桥头重试'};
    return p.time>=o.seconds&&this.near(o,16);
   }
  }return false;
 }
 hurtContact(amount){const p=this.rt.manager?.record?.progress;if(!p||!['escort','dock'].includes(this.rt.manager.objective?.type))return;p.escortHP=Math.max(0,(p.escortHP??100)-amount);this.api.toast('JC受伤 · 生命 '+Math.ceil(p.escortHP));this.rt.parent.save();}
 combatTarget(e){
  const rt=this.rt,o=rt.manager?.objective,p=rt.manager?.record?.progress,contact=rt.world.contacts.get('JC');
  if(!['escort','dock'].includes(o?.type)||!contact?.enabled||p?.passenger)return null;
  if(o.type==='dock'&&!rt.state().world.opened.bridgeGate&&e.g.position.x<-638){const gate=rt.world.props.get('bridge-gate');return{at:[gate.at[0]-.4,gate.at[1]],damage:amount=>{p.gateHP=Math.max(0,(p.gateHP??100)-amount);this.api.toast('检修门被攻击 · 耐久 '+Math.ceil(p.gateHP));if(!p.gateHP){p.gateBroken=true;rt.state().world.opened.bridgeGate=true;rt.world.apply(rt.state());rt.world.effects.impact('furniture',[gate.at[0],3,gate.at[1]]);this.api.impactSound('furniture');this.api.toast('检修门被冲开了 · 守住 JC 的核验桌');}rt.parent.save();}};}

  if(distance(position(e),position(contact))<distance(position(e),rt.position())+1)return{at:position(contact),damage:amount=>this.hurtContact(amount)};return null;
 }
 finish(o,p){
  const w=this.rt.world;if(o.type==='recover'){w.runner.enabled=false;this.rt.state().world.filesReturned=true;}
  if(o.type==='dock'){this.rt.state().world.opened.bridgeGate=true;w.apply(this.rt.state());}
  if(!['recover','escort'].includes(o.type))w.clearEnemies();
 }
 destination(o,p){const fight=this.encounters.destination(p);if(fight)return fight;if(o.type==='recover')return{at:position(this.rt.world.runner),label:'截住文件袋 · 湖岸与木桥'};if(o.type==='dock')return{at:[-618,203],label:'保护核验桌边的JC'};return{at:o.at,label:o.type==='climb'?'沿盘山路或台阶到麓山寺':o.type==='view'?'山顶西侧望远镜':o.text};}
 hint(o,p){const fight=this.encounters.hint(p);if(fight)return fight;if(o.type==='park')return this.api.get().driving?'到目标区域后 E 下车 · 自动完成':'步行到达目标区域 · 自动完成';if(o.type==='recover')return '靠近按 E 夺回 · 可借车切路';if(['escort','dock'].includes(o.type))return 'JC '+Math.ceil(p.escortHP??100)+' 生命'+(o.type==='dock'?' · 核验 '+Math.min(o.seconds,p.time||0).toFixed(0)+'/'+o.seconds+' 秒'+(p.verifyBlocked?' · 桌边有敌人，核验暂停':'')+(!this.rt.state().world.opened.bridgeGate?' · 门 '+Math.ceil(p.gateHP??100)+' 耐久':''):(p.waiting?' · 等候中，靠近 E 跟随':' · 靠近 E 等候 / 跟随'));return'';}
}
