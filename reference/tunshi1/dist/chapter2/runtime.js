import {MissionManager} from '../story/mission-manager.js';
import {Navigator} from '../story/navigation.js';
import {CHAZI,BEICHEN,BRIDGE,bounds} from '../regions/data.js';
import {CHAPTER2,newSecondState,SHOP,OFFICE,B1,MALL} from './missions.js';
import {SecondWorld,distance} from './world.js';
import {SecondActions} from './actions.js';
import {ChapterEconomy} from './economy.js';
import {Workshop} from './workshop.js';
import {ChapterCombat} from './combat.js';
import {conversations as D} from './dialogues.js';
import {exitTowardInterior} from '../indoor-navigation.js';
export class SecondChapter{
 constructor(parent,sets){this.parent=parent;this.api=parent.api;this.$=parent.$;this.world=new SecondWorld(this,sets);this.combat=new ChapterCombat(this);this.workshop=new Workshop(this);this.economy=new ChapterEconomy(this);this.actions=new SecondActions(this);this.nav=new Navigator((x,z)=>this.api.clearRegion(CHAZI,x,z,.75),2,bounds);this.carNav=new Navigator((x,z,r)=>this.api.clearRegion(CHAZI,x,z,r),4,bounds);this.active=false;this.manager=null;this.navigation=null;this.nextTime=0;}
 boot(saved){this.economy.close();this.economy.showFreeEntry(false);this.workshop.hide();this.workshop.freeProgress=null;this.workshop.active=false;this.combat.reset();this.$('#chapter2Plan').classList.add('hidden');this.$('#mobileDodge').classList.add('hidden');this.$('#mobileHeat').classList.add('hidden');this.api.carry(null);this.world.clear();this.active=!!saved;this.manager=null;this.nextTime=0;this.navigation=null;this.world.apply(saved||newSecondState());if(saved)this.install(structuredClone(saved));}
 install(state){const migrating=(state.revision||1)<3;state.revision=3;if(migrating)this.parent.dialogue.clear();state.world={...newSecondState().world,...state.world};state.world.demolition||={};state.world.clues||={};state.world.garagePower||={};state.world.equipment||={};state.world.paidJobs||={};this.active=true;
  this.manager=new MissionManager(CHAPTER2,{world:s=>{this.world.apply(s);this.parent.state().chapterState.chapter2=s.chapterState.chapter2;},banner:(a,b)=>this.parent.banner(a,b),dialogue:(id,lines,channel)=>this.parent.dialogue.play(id,lines,channel),
   objective:(o,p,restoring)=>this.activate(o,p,restoring),hud:(m,o,r)=>this.hud(m,o,r),save:()=>this.parent.save(),evaluate:(o,p,dt)=>this.evaluate(o,p,dt),event:(type,data)=>this.actions.event(type,data),finishObjective:(o,p)=>this.actions.finish(o,p),reward:r=>{if(r.personalMoney)this.api.cash(r.personalMoney);},
   deferNext:()=>{this.nextTime=2;},fail:r=>{this.world.clearEnemies();this.parent.banner('目标中断',r);this.hud(this.manager.mission,this.manager.objective,this.manager.record);},reset:o=>{this.parent.dialogue.clear();this.api.recover(this.actions.scenes.retryCheckpoint(o,this.manager.record.checkpoint));},complete:s=>this.complete(s)
  },state,{chapterKey:'chapter2',finalStage:10});this.manager.begin();this.economy.funding.initialize();this.workshop.restoreOrder();if(this.manager.record?.status==='failed')this.manager.retry();if(state.chapterComplete)this.residents();this.economy.showFreeEntry(!!state.chapterComplete);if(migrating&&!state.chapterComplete&&state.currentMission)this.say('c2:revision3:'+state.currentMission,D.resumeByObjective?.[this.manager.objective?.id]||this.manager.mission.dialogues);this.$('#chapter2Plan').classList.remove('hidden');this.$('#mobileDodge').classList.remove('hidden');this.$('#mobileHeat').classList.remove('hidden');this.markers();
 }
 begin(){if(this.active||this.api.get().mapTest)return;this.install(newSecondState());this.parent.cinematic=0;this.parent.save();}
 serialize(){return this.active?this.manager.serialize():null;}
 state(){return this.manager?.state;}
 area(){return this.api.get().interior||'outside';}
 position(){const p=this.api.get().position;return[p[0],p[2]];}
 routeFor(points,area='outside',car=false){if(area!=='outside')return this.api.interiors[area].route(points);const nav=car?this.carNav:this.nav;nav.cache.clear();return nav.route(points);}
 say(id,lines,channel='面对面'){this.parent.dialogue.play(id,lines,channel);}
 activate(o,p,restoring){this.economy.funding.initialize();this.workshop.restoreOrder();if(!restoring)this.manager.record.checkpoint=this.api.checkpoint();try{this.actions.begin(o,p);}catch(e){this.api.toast('目标路线未能连接 · T 重试');p.routeError=e.message;}this.world.apply(this.state());this.markers();}
 evaluate(o,p,dt){if(this.parent.dialogue.busy||this.api.get().dead)return false;if(this.api.get().region!==CHAZI&&o.type!=='cross')return false;if(p.routeError)return{fail:'目标路线未能连接 · T 重试'};return this.actions.tick(o,p,dt);}
 tick(dt,t){const game=this.api.get();this.world.update(t);if(game.paused||game.dead)return;this.parent.dialogue.tick(dt);this.economy.tick(dt);this.combat.tick(dt);if(this.workshop.freeProgress)this.workshop.tick(this.workshop.freeProgress,dt);
  if(this.parent.bannerTime>0){this.parent.bannerTime-=dt;if(this.parent.bannerTime<=0){this.$('#missionBanner').classList.add('hidden');this.$('#chapterResult').classList.add('hidden');}}
  if(this.parent.dialogue.busy||game.region!==CHAZI)for(const e of this.world.actors)e.intentX=e.intentZ=0;
  if(this.nextTime>0&&!this.parent.dialogue.busy){this.nextTime-=dt;if(this.nextTime<=0)this.manager.startNext();}
  if(this.manager.record?.status==='active')this.manager.tick(dt);this.markers();this.world.update(t);
  this.$('#gangMoney').textContent='¥ '+this.parent.state().gangMoney.toLocaleString('en-US');this.$('#gangFunds').classList.remove('hidden');this.$('#hqBadge').classList.remove('hidden');this.$('#hqBadge').textContent=this.state().chapterComplete?'观沙岭 · 偶尔回来':'观沙岭 · 老朋友的地方';
 }
 interact(){if(this.parent.dialogue.busy){this.parent.dialogue.next();return true;}if(this.api.get().region!==CHAZI)return false;if(this.workshop.freeProgress&&this.workshop.ready())return this.workshop.interact(this.workshop.freeProgress);const m=this.manager;if(m.record?.status==='active'){const used=this.actions.interact(m.objective,m.record.progress);if(used){m.tick(0);this.parent.save();return true;}}
  if(m.state.chapterComplete&&this.area()===SHOP){const e=this.world.contacts.get('章鱼');if(e&&distance(this.position(),[e.g.position.x,e.g.position.z])<3){this.say('c2-ambient',D.ambient);return true;}}return false;
 }
 prompt(){if(this.parent.dialogue.busy)return'继续对话';if(!this.active)return'';if(this.manager.record?.status==='failed')return'T 重试当前目标';const o=this.manager.objective,p=this.manager.record?.progress;if(this.api.get().region!==CHAZI)return'';
  if(this.workshop.freeProgress&&this.workshop.ready())return this.workshop.active?'E 绿色区间收手':'E 修加急单 · 完工结钱';if(!o)return'';
  const quiet=this.actions.security.prompt();if(quiet)return quiet;
  if(o.id==='c205-atrium'){const e=this.world.contacts.get('夜班调度');return this.area()===MALL&&e?.enabled&&distance(this.position(),[e.g.position.x,e.g.position.z])<3&&this.world.lineClear(this.position(),[e.g.position.x,e.g.position.z])?'E · 核对交接编号':'';}
  if(['investigate','stealth','infiltrate'].includes(o.type)){const prop=this.world.nearest(this.actions.inspectIds(o,p));if(prop)return'E · '+prop.name;}
  if(o.type==='topics')return this.workshop.ready()?(this.workshop.active?'E 绿色区间收手':'E 修设备 · 每单结钱'):'';if(o.type==='runner'&&distance(this.position(),[this.world.runner.g.position.x,this.world.runner.g.position.z])<3.5)return'E 截住 · 拿回货物';if(o.type==='identify'&&distance(this.position(),o.at)<35)return'E 观察车辆 · 镜头朝向目标';if(o.type==='demolition'&&this.world.sets.iron.g.visible&&distance(this.position(),this.world.sets.iron.at)<3)return'E 打开铁盒';if(o.type==='prepare'&&this.area()===SHOP){if(this.world.nearest(['shutter']))return'E 放下卷帘门';if(this.economy.funding.pending)return distance(this.position(),this.actions.dinaAt())<3?'E 与 Dina 结算预算':'K 接维修单 / 收营业款';return'E 提前开始防守';}
  if(o.type==='delivery'&&p.stopped)return'E 夺车 · 先下自己的车';if(o.type==='transport'&&this.area()===B1)return this.api.get().driving?'E 下车':'E 卸文件箱';const target=this.actions.destination(o,p);if(target?.at&&target.area===this.area()&&distance(this.position(),target.at)<4)return o.type==='parking'?'E 上车挪开':o.type==='boundary'?'E 劝离':'E 互动';return'';
 }
 allowAttack(){if(this.parent.dialogue.busy)return false;const o=this.manager.objective,p=this.manager.record?.progress;return !o?.noAttack&&!(o?.type==='boundary'&&!p.pushed);}
 retry(){this.economy.close();this.workshop.hide();if(this.manager.record){this.manager.retry();this.parent.save();}}
 onDeath(){this.economy.close();this.workshop.hide();this.combat.reset();if(this.manager.record?.status==='active')this.manager.fail('豚师倒下了 · R 重生后继续当前目标');this.parent.save();}
 onRespawn(){if(this.manager.record?.status==='failed')this.manager.retry();this.parent.save();}
 residents(){for(const [name,at]of [['章鱼',[2555,4]],['仙人',[2545,4]],['Dina',[2550,-3]]])this.world.contact(name,at,SHOP);}
 complete(s){this.world.apply(s);this.world.clearEnemies();this.residents();this.parent.banner('CHAPTER II COMPLETE','我们以前住这儿');this.parent.bannerTime=15;this.$('#chapterResult').classList.remove('hidden');this.$('#chapterResult').textContent='观沙岭不是海豚帮的 · 旧店：偶尔回来 · 两区自由探索继续';this.$('#missionHud').classList.add('hidden');this.economy.showFreeEntry(true);this.navigation=null;this.parent.state().chapterState.chapter2=10;this.parent.save();}
 canEnter(id){return!(this.active&&id===SHOP&&!this.state().world.doorOpen&&this.manager.mission?.id==='c201');}
 markers(){const o=this.manager?.objective,r=this.manager?.record,g=this.api.get();if(!o||r.status!=='active'){this.navigation=null;this.$('#missionNav').classList.add('hidden');return;}
  let dest=this.actions.destination(o,r.progress),area=dest.area||'outside',at=dest.at,region=CHAZI,label=dest.label||(dest.search?'在这个空间观察与操作':'当前任务目标');
  if(g.region!==CHAZI){region=g.region;area='outside';at=g.region===BRIDGE?[-500,0]:[-205,430];label='经银盆岭大桥前往观沙岭';}
  else if(o.type==='cross'){at=o.at;label='旧店附近停车';}
  else if(area!==this.area()){
   if(this.area()!=='outside'){const door=exitTowardInterior(this.api.interiors,this.area(),area);at=door.at;area=this.area();label=door.name;}
   else{at=this.api.interiors[area]?.entry;label='进入 '+(this.api.interiors[area]?.name||area);area='outside';}
  }
  if(o.type==='intercept'&&!this.state().world.finalBagCaught&&!g.driving&&this.area()==='outside'){const p=this.api.ride.g.position;at=[p.x,p.z];label='炫神送来的黄色车';}
  if(!at){this.navigation=null;return;}this.navigation={at,area,region,label,meters:Math.round(distance(this.position(),at))};this.updateNavigation();
 }
 updateNavigation(){const nav=this.navigation,node=this.$('#missionNav');node.classList.toggle('hidden',!nav);if(!nav)return;this.$('#missionNavName').textContent=nav.label;this.$('#missionNavDistance').textContent=nav.meters+' m';const pos=this.position(),angle=Math.atan2(nav.at[0]-pos[0],pos[1]-nav.at[1])+(this.api.get().yaw||0);this.$('#missionNavArrow').style.transform='rotate('+angle+'rad)';}
 hud(m,o,r){if(!m||!o)return;this.$('#missionHud').classList.remove('hidden');this.$('#chapterLabel').textContent='CHAPTER II';this.$('#missionTitle').textContent=m.title;const hint=this.actions.hint(o,r.progress),text=o.type==='prepare'&&this.economy.funding.pending?'凑齐个人预算，到 Dina 处结算':o.text;this.$('#missionObjective').textContent=r.status==='failed'?r.failure:text+(hint?' · '+hint:'');this.$('#storyRetry').classList.toggle('hidden',r.status!=='failed');this.$('#missionDistance').textContent=this.navigation?this.navigation.meters+' m':'';}
 drawMap(ctx,m,large){const nav=this.navigation;if(nav?.region!==this.api.get().region||nav.area!=='outside')return;const pos=this.area()==='outside'?this.position():this.api.interiors[this.area()].entry;ctx.save();ctx.strokeStyle='#68cfff';ctx.lineWidth=2;ctx.setLineDash([7,4]);ctx.beginPath();ctx.moveTo(m.x(pos[0]),m.z(pos[1]));ctx.lineTo(m.x(nav.at[0]),m.z(nav.at[1]));ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(m.x(nav.at[0]),m.z(nav.at[1]),large?7:4,0,Math.PI*2);ctx.stroke();ctx.restore();}
}
