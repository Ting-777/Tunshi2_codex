import {MissionManager} from '../../story/mission-manager.js';
import {Navigator} from '../../story/navigation.js';
import {exitTowardInterior} from '../../indoor-navigation.js';
import {ThirdCombat} from './combat.js';
import {BEICHEN,BRIDGE,CHAZI} from '../../regions/data.js';
import {YUELU,bounds} from '../layout.js';
import {CHAPTER3,newThirdState,ROOMS,STUDY,GARAGE} from './missions.js';
import {ThirdWorld,distance,position} from './world.js';
import {ThirdActions} from './actions.js';
import {localCombatPath} from './local-navigation.js';

export class ThirdChapter{
 constructor(parent){
  this.parent=parent;this.api=parent.api;this.$=parent.$;this.regionId=YUELU;this.enemyLabel='仙人府守卫';this.active=false;
  this.combat=new ThirdCombat(this);this.world=new ThirdWorld(this);this.actions=new ThirdActions(this);this.manager=null;this.navigation=null;this.nextTime=0;
  this.nav=new Navigator((x,z)=>this.api.clearRegion(YUELU,x,z,.6),2,bounds);
 }
 boot(saved){this.combat.reset();this.world.clear();this.active=!!saved;this.manager=null;this.navigation=null;this.nextTime=0;if(saved)this.install(saved);else this.world.apply(newThirdState(),false);}
 install(input){
  const base=newThirdState(),state=structuredClone(input);state.world={...base.world,...state.world,damage:{...state.world.damage},opened:{...base.world.opened,...state.world.opened},spentWeapons:{...state.world.spentWeapons},usedMedicine:state.world.usedMedicine||[]};this.active=true;
  this.manager=new MissionManager(CHAPTER3,{
   world:s=>{this.world.apply(s);this.parent.state().chapterState.chapter3=s.chapterState.chapter3;},
   banner:(a,b)=>this.parent.banner(a,b),dialogue:(id,lines,channel)=>this.say(id,lines,channel),
   objective:(o,p,restoring)=>this.activate(o,p,restoring),hud:(m,o,r)=>this.hud(m,o,r),save:()=>this.parent.save(),
   evaluate:(o,p,dt)=>this.evaluate(o,p,dt),event:(type,data)=>this.event(type,data),finishObjective:(o,p)=>this.actions.finish(o,p),
   reward:r=>{if(r.personalMoney)this.api.cash(r.personalMoney);},deferNext:()=>{this.nextTime=2;},
   fail:r=>{this.world.clearEnemies();this.parent.banner('目标中断',r);this.hud(this.manager.mission,this.manager.objective,this.manager.record);},
   reset:()=>{this.parent.dialogue.clear();this.combat.reset();this.world.clearEnemies();this.api.recover(this.manager.record.checkpoint);},complete:s=>this.complete(s)
  },state,{chapterKey:'chapter3',finalStage:4});
  this.manager.begin();this.combat.restoreHeld();if(this.manager.record?.status==='failed')this.manager.retry();
  this.parent.second?.economy.close();this.updateBusinessEntry();
  this.$('#mobileDodge').classList.remove('hidden');this.$('#mobileHeat').classList.remove('hidden');this.markers();
  if(state.chapterComplete||this.manager.objective?.type==='leave')this.world.contact('仙人',[4600,-8],STUDY);
 }
 begin(){if(this.active||this.api.get().mapTest||!this.parent.second?.state()?.chapterComplete)return;const state=newThirdState(),old=this.parent.second.state().world;for(const key of ['vehicleArmor','techniqueTraining','heavyGloves','heatCapacity'])if(old[key]!=null)state.world[key]=old[key];this.install(state);this.parent.save();}
 state(){return this.manager?.state;}
 serialize(){if(!this.active||!this.manager)return null;this.world.persistCar();return this.manager.serialize();}
 updateBusinessEntry(){
  const g=this.api.get(),available=g.region===CHAZI&&!g.mapTest,inline=available&&!this.$('#missionHud').classList.contains('hidden');
  this.parent.second?.economy.showFreeEntry(available&&!inline);this.$('#chapter2Plan').classList.toggle('hidden',!inline);
 }
 area(){return this.api.get().interior||'outside';}
 position(){const p=this.api.get().position;return[p[0],p[2]];}
 combatRoute(points){
  const [a,b]=points;
  const gate=this.world.props.get('bridge-gate');
  if(!gate.collider.disabled&&this.world.segmentHits(a,b,gate.collider))return[];
  return localCombatPath(a,b,{clear:(x,z)=>this.api.clearRegion(YUELU,x,z,.6),heightAt:(x,z)=>this.world.region.heightAt(x,z)});
 }
 routeFor(points,area='outside'){if(area!=='outside')return this.api.interiors[area].route(points);this.nav.cache.clear();return this.nav.route(points);}
 say(id,lines,channel='无线电'){this.parent.dialogue.play(id,lines,channel);}
 activate(o,p,restoring){
  if(!restoring)this.manager.record.checkpoint=this.api.checkpoint();
  try{this.actions.begin(o,p);this.combat.restoreHeld();}catch(e){p.routeError=String(e.message);this.api.toast('路线未接通 · T 重试当前目标');}
  this.world.apply(this.state());this.markers();
 }
 evaluate(o,p,dt){const g=this.api.get();if(g.dead||g.mapTest||g.region!==YUELU||this.parent.dialogue.busy)return false;if(p.routeError)return{fail:'路线未接通 · T 重试当前目标'};return this.actions.tick(o,p,dt);}
 event(type,data){
  if(type==='damage'){const p=this.manager.record?.progress;if(p){this.world.preserve(p);if(data.entity===this.world.runner)p.targetHP=data.entity.hp;}this.world.persistCar();this.parent.save();}
 }
 combatTarget(e){return this.actions.outdoor.combatTarget(e);}
 tick(dt,t){
  const g=this.api.get();this.world.update(t);if(g.dead||g.paused)return;this.parent.dialogue.tick(dt);this.parent.second?.world.update(t);this.parent.second?.economy.tick(dt);if(g.region===CHAZI&&this.parent.second?.workshop.freeProgress)this.parent.second.workshop.tick(this.parent.second.workshop.freeProgress,dt);
  if(this.parent.bannerTime>0){this.parent.bannerTime-=dt;if(this.parent.bannerTime<=0){this.$('#missionBanner').classList.add('hidden');this.$('#chapterResult').classList.add('hidden');}}
  if(this.nextTime>0&&!this.parent.dialogue.busy){this.nextTime-=dt;if(this.nextTime<=0)this.manager.startNext();}
  if(g.region===YUELU&&!g.mapTest){this.combat.tick(dt);if(this.manager.record?.status==='active')this.manager.tick(dt);}
  else{for(const e of this.world.actors)e.intentX=e.intentZ=0;this.$('#chapter2Combat').classList.add('hidden');}
  if(this.parent.dialogue.busy)for(const e of this.world.actors)e.intentX=e.intentZ=0;
  this.world.persistCar();this.markers();this.updateBusinessEntry();this.world.update(t);this.$('#gangMoney').textContent='¥ '+this.parent.state().gangMoney.toLocaleString('en-US');this.$('#gangFunds').classList.remove('hidden');this.$('#hqBadge').classList.remove('hidden');this.$('#hqBadge').textContent=this.state().chapterComplete?'梅溪湖 · 大路已通':'山那边 · 文件随身';
 }
 interact(){if(this.parent.dialogue.busy){this.parent.dialogue.next();return true;}if(this.api.get().region!==YUELU||this.api.get().mapTest)return false;const m=this.manager;
  if(m.record?.status==='active'&&this.actions.interact(m.objective,m.record.progress)){m.tick(0);this.parent.save();return true;}
  if(m.state.chapterComplete&&this.area()===STUDY&&distance(this.position(),[4600,-4])<4){this.say('c3:tea-return',[['仙人','资料带好。去河对面查，路上不用再翻山。']],'面对面');return true;}return false;
 }
 prompt(){if(this.parent.dialogue.busy)return'继续对话';if(this.api.get().region!==YUELU||this.api.get().driving)return'';if(this.manager.record?.status==='failed')return'T 重试当前目标';const o=this.manager.objective,p=this.manager.record?.progress;
  if(o?.type==='escort'&&this.world.nearest(['escort-cart'],3.5)&&this.state().world.escortBlockade&&!this.state().world.opened.escortCart)return'推开桥前货车';
  const jc=this.world.contacts.get('JC');if(o?.type==='escort'&&jc?.enabled&&distance(this.position(),position(jc))<3.2)return p.waiting?'叫 JC 继续跟随':'让 JC 原地等候';
  const villa=this.actions.villa.prompt(o);if(villa)return villa;
  if(this.world.nearest(['trail-gate'])&&!this.state().world.opened.trailGate)return'打开林间侧门';
  if(o?.type==='dock'&&this.world.nearest(['bridge-gate'],3.8))return p.gateBroken?'检修门已损坏':this.state().world.opened.bridgeGate?'关闭桥头检修门':'打开桥头检修门';
  if(['inspect','view','contact'].includes(o?.type)&&this.actions.outdoor.near(o,3.5))return o.type==='contact'?'与JC交谈':this.world.props.get(o.prop)?.name||'查看';
  if(o?.type==='recover'&&distance(this.position(),position(this.world.runner))<3.3)return'截住并拿回文件袋';return'';
 }
 allowAttack(){return !this.parent.dialogue.busy&&this.area()!==STUDY&&!(this.api.get().region===YUELU&&this.manager.objective?.noAttack&&this.area()===this.manager.objective.area);}
 retry(){if(this.manager.record){this.manager.retry();this.parent.save();}}
 onDeath(){this.combat.reset();if(this.manager.record?.status==='active')this.manager.fail('豚师倒下了 · R 重生后继续当前目标');this.parent.save();}
 onRespawn(){if(this.manager.record?.status==='failed')this.manager.retry();this.parent.save();}
 canEnter(id,door){return !ROOMS.includes(id)||this.active&&!this.api.get().mapTest&&this.actions.villa.canEnter(id,door);}
 markers(){
  const o=this.manager?.objective,r=this.manager?.record,g=this.api.get();if(!o||r.status!=='active'||g.mapTest){this.navigation=null;this.updateNavigation();return;}
  let dest=this.actions.destination(o,r.progress),area=dest.area,at=dest.at,label=dest.label;
  if(g.region!==YUELU){area='outside';at=g.region===CHAZI?[-810,318]:g.region===BRIDGE?[-500,0]:[-205,430];label=g.region===CHAZI?'从南向连接路进入岳麓山':'经银盆岭大桥前往观沙岭';}
  else if(area!==this.area()){
   if(this.area()!=='outside'){const door=exitTowardInterior(this.api.interiors,this.area(),area);if(door){at=door.at;label=door.name;area=this.area();}}
   else{at=this.api.interiors[area]?.entry;label='地下车库坡道 · 进入别墅';area='outside';}
  }
  if(!at){this.navigation=null;this.updateNavigation();return;}
  this.navigation={at,area,region:g.region,label,meters:Math.round(distance(this.position(),at))};this.updateNavigation();
 }
 updateNavigation(){const n=this.navigation,node=this.$('#missionNav');node.classList.toggle('hidden',!n);if(!n)return;this.$('#missionNavName').textContent=n.label;this.$('#missionNavDistance').textContent=n.meters+' m';const p=this.position(),angle=Math.atan2(n.at[0]-p[0],p[1]-n.at[1])+(this.api.get().yaw||0);this.$('#missionNavArrow').style.transform='rotate('+angle+'rad)';}
 hud(m,o,r){if(!m||!o)return;this.$('#chapterLabel').textContent='CHAPTER III';this.$('#missionHud').classList.remove('hidden');this.$('#missionTitle').textContent=m.title;const hint=this.actions.hint(o,r.progress);this.$('#missionObjective').textContent=r.status==='failed'?r.failure:o.text+(hint?' · '+hint:'');this.$('#storyRetry').classList.toggle('hidden',r.status!=='failed');this.$('#missionDistance').textContent=this.navigation?this.navigation.meters+' m':'';}
 complete(s){this.world.clearEnemies();this.world.apply(s);this.navigation=null;this.updateNavigation();this.$('#missionHud').classList.add('hidden');this.parent.banner('CHAPTER III COMPLETE','山那边');this.parent.bannerTime=15;this.$('#chapterResult').classList.remove('hidden');this.$('#chapterResult').textContent='封路已撤 · 岳麓山与梅溪湖自由探索 · 线索：牢东杰，河对面';this.parent.state().chapterState.chapter3=4;this.parent.save();}
 drawMap(ctx,m,large){const n=this.navigation;if(!n||n.area!=='outside'||n.region!==this.api.get().region)return;const p=this.area()==='outside'?this.position():this.api.interiors[this.area()].entry;ctx.save();ctx.strokeStyle='#68cfff';ctx.lineWidth=large?3:2;ctx.setLineDash([7,4]);ctx.beginPath();ctx.moveTo(m.x(p[0]),m.z(p[1]));ctx.lineTo(m.x(n.at[0]),m.z(n.at[1]));ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(m.x(n.at[0]),m.z(n.at[1]),large?7:4,0,Math.PI*2);ctx.stroke();ctx.restore();}
}
