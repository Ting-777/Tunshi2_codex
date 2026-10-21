import {distance,position} from './world.js';
import {TianBoSupport} from './ally-combat.js';

export const ESCORT_HP=140;
const mainWaves=[
 [3,'学院街出口',['charger','brawler','guard']],
 [5,'黄兴南路',['brawler','thrower','guard','charger']],
 [8,'步行街回口',['brawler','charger','guard','heavy']],
 [10,'黄兴广场西口',['brawler','charger','guard','thrower']]
];
const westWaves=[
 ...mainWaves.slice(0,2).map(([id,name,roles])=>[id,name,roles,0]),
 [8,'西巷南口',['brawler','thrower','guard','charger'],3],
 [10,'黄兴广场西口',['charger','thrower','guard','heavy'],7]
];
export const escortWaves=p=>p.branch==='west'?westWaves:mainWaves;
export const escortCanFight=p=>p.branch==='west'||(p.pathIndex||0)>=3;

// Route groups never overwrite a living ambush. Checkpoints retain the current
// fight and completed groups, so a local retry does not repeat the whole chase.
export class TianBoEscort{
 constructor(encounters){this.enc=encounters;this.rt=encounters.rt;this.support=new TianBoSupport(this);}
 get live(){return this.enc.live;}
 get w(){return this.enc.w;}
 remember(p){this.rt.world.preserve(p);this.w.escortCheckpoint={branch:p.branch||null,pathIndex:p.pathIndex||0,escortIndex:p.escortIndex||0,escortAt:[...p.escortAt],ambushes:[...p.ambushes],activeWave:p.activeWave??null,enemies:structuredClone(p.enemies||[])};}
 checkpoint(o,p){this.remember(p);this.enc.a.checkpoint(o,p);}
 begin(o,p){
  const rt=this.rt,route=this.enc.a.route(o,p),cp=this.w.escortCheckpoint;
  if(!p.enemies&&cp&&cp.pathIndex===(p.pathIndex||0)&&cp.branch===(p.branch||null)){
   p.escortIndex=cp.escortIndex;p.escortAt=[...cp.escortAt];p.ambushes=[...cp.ambushes];p.activeWave=cp.activeWave;p.escortWaveRevision=1;
   p.enemies=cp.enemies.map(e=>({...e,hp:e.hp>0?rt.combat.roleStats(e.role).hp:0,called:false,callTime:0,aim:null}));
  }
  p.escortHP??=ESCORT_HP;p.escortHurtCooldown??=0;p.escortIndex??=Math.max(0,(p.pathIndex||0)-1);
  p.escortWaveRevision=1;
  p.ambushes||=[];p.activeWave??=null;
  p.escortAt||=[...route[Math.max(0,(p.pathIndex||0)-1)]];
  const ally=rt.world.contact('田博',p.escortAt,'outside');ally.hp=p.escortHP;ally.maxHp=ESCORT_HP;this.w.escortHP=p.escortHP;
 }
 markEnemies(o,p){
  for(const e of this.rt.world._enemies){
   e.pursuit=true;e.escortPursuit=true;
   e.escortMark||=this.rt.api.label('目标：田博',2.2,.34,'#714733','#ffe1a8',e.g,0,3.45,0);
   e.escortMark.visible=e.enabled&&e.hp>0&&!!this.target(e,o,p);
  }
 }
 spawnWave(o,p,wave){
  const [gate,name,roles]=wave,rt=this.rt,route=this.enc.a.route(o,p),ally=rt.world.contacts.get('田博'),a=position(ally),aim=route[Math.min(p.pathIndex||0,route.length-1)];
  let dx=aim[0]-a[0],dz=aim[1]-a[1],d=Math.hypot(dx,dz);if(d<1){const prev=route[Math.max(0,(p.pathIndex||0)-1)];dx=aim[0]-prev[0];dz=aim[1]-prev[1];d=Math.hypot(dx,dz)||1;}dx/=d;dz/=d;
  const slots=[[17,-3],[-12,3],[15,6],[21,-5]],points=[];
  for(let i=0;i<roles.length;i++){
   const [forward,side]=slots[i],offsets=[[forward,side],[forward,side/2],[forward,0],[forward*.65,side/2],[Math.sign(forward)*8,0]];
   for(const radius of [8,12,18])for(let turn=0;turn<12;turn++)offsets.push([Math.cos(turn*Math.PI/6)*radius,Math.sin(turn*Math.PI/6)*radius]);
   const point=offsets.map(([f,s])=>[a[0]+dx*f-dz*s,a[1]+dz*f+dx*s]).find(v=>rt.api.clearRegion(rt.regionId,...v,.75)&&Math.abs(rt.world.floor('outside',v)-ally.g.position.y+.2)<.6&&rt.world.lineClear(a,v)&&points.every(q=>distance(q,v)>2));
   if(!point)return false;
   points.push([...point,roles[i]]);
  }
  p.enemies=[];rt.world.spawn(points,p,'outside');p.ambushes.push(gate);p.activeWave=gate;
  this.support.settle(p);
  this.markEnemies(o,p);rt.api.toast(name+'有人堵路 · 先护住田博，再打退拦截');this.checkpoint(o,p);return true;
 }
 tick(o,p,dt){
  const rt=this.rt,ally=rt.world.contacts.get('田博');if(!ally?.enabled)return false;
  p.escortHurtCooldown=Math.max(0,(p.escortHurtCooldown||0)-dt);ally.intentX=ally.intentZ=0;
  if(p.escortHP<=0)return{fail:'田博被围住了。重试这个路口，先把冲着他来的人打退。'};
  if(p.activeWave!=null&&!this.live.length){
   p.activeWave=null;
   this.support.settle(p);
   // The short breather settles once with the cleared wave, never on refresh.
   p.escortHP=Math.min(ESCORT_HP,p.escortHP+16);ally.hp=p.escortHP;rt.api.heal(6);this.w.escortHP=p.escortHP;
   rt.api.toast('这拨人退了 · 田博缓了口气，继续走');this.checkpoint(o,p);
  }
  if(!p.branch&&[5,6].includes(p.pathIndex)&&rt.position()[0]<-45&&p.activeWave==null&&!this.live.length){
   p.branch='west';p.pathIndex=1;p.escortIndex=0;p.activeWave=null;p.escortAt=position(ally);ally.navPath=null;this.checkpoint(o,p);
  }
  const route=this.enc.a.route(o,p);let n=p.pathIndex||0;
  if(p.activeWave==null&&n<route.length&&distance(rt.position(),route[n])<5&&distance(position(ally),route[n])<11){
   p.pathIndex=++n;p.escortIndex=Math.max(p.escortIndex,n-1);p.escortAt=position(ally);this.checkpoint(o,p);
  }
  const pending=escortWaves(p).find(([id,,,gate=id])=>gate<=n&&!p.ambushes.includes(id));
  if(pending&&!this.live.length&&p.activeWave==null&&!this.spawnWave(o,p,pending))return{fail:'这个路口被堵住了 · T 从当前路口重新接应田博'};
  this.markEnemies(o,p);
  // Tian Bo holds his ground and counters nearby hunters when blocked.
  // Running ahead still leaves him in the ambush instead of skipping it.
  if(p.activeWave==null){
   while(p.escortIndex<Math.min(n,route.length)&&distance(position(ally),route[p.escortIndex])<3)p.escortIndex++;
   const aim=p.escortIndex<n?route[p.escortIndex]:distance(position(ally),rt.position())>4?rt.position():null;
   if(aim){let target=aim;if(!rt.world.lineClear(position(ally),aim)){p.escortNavTime=(p.escortNavTime||0)-dt;if(p.escortNavTime<=0||!ally.navPath){ally.navPath=rt.combatRoute([position(ally),aim]);ally.navIndex=1;p.escortNavTime=1;}while(ally.navIndex<ally.navPath.length&&distance(position(ally),ally.navPath[ally.navIndex])<1.4)ally.navIndex++;target=ally.navPath[ally.navIndex]||position(ally);}this.enc.moveActor(ally,target,13,dt);}
  }
  p.escortAt=position(ally);this.w.escortHP=p.escortHP;rt.world.preserve(p);
  return n>=route.length&&distance(position(ally),route.at(-1))<12&&!this.live.length&&!pending&&p.activeWave==null;
 }
 allyTarget(o,p){
  if(!(o?.encounter==='escort'&&escortCanFight(p)||o?.id==='c405-fight'))return null;
  const ally=this.rt.world.contacts.get('田博');if(!ally?.enabled||ally.area!==this.rt.area()||(p.escortHP??ESCORT_HP)<=0)return null;
  return{at:position(ally),escort:true,actor:ally,damage:n=>this.hurt(o,p,n)};
 }
 // Two attackers pursue Tian Bo; the remaining one or two occupy the hero.
 target(e,o,p){const i=this.rt.world._enemies.indexOf(e);return i>=0&&i<2?this.allyTarget(o,p):null;}
 hurt(o,p,amount){
  if(!this.allyTarget(o,p)||(p.escortHurtCooldown||0)>0)return;
  const ally=this.rt.world.contacts.get('田博'),damage=Math.max(1,Math.round(amount*.5));
  p.escortHP=Math.max(0,(p.escortHP??ESCORT_HP)-damage);p.escortHurtCooldown=1.2;
  ally.hp=p.escortHP;ally.flash=.5;this.w.escortHP=p.escortHP;this.rt.api.impactSound('furniture');
  this.rt.api.toast('田博挨了一下 · 生命 '+Math.ceil(p.escortHP));this.rt.parent.save();
 }
 hint(o,p){const total=escortWaves(p).length,count=p.ambushes?.filter(g=>g>0).length||0;return' · 田博 '+Math.ceil(p.escortHP??ESCORT_HP)+'/'+ESCORT_HP+' · 拦截 '+count+'/'+total+(p.activeWave!=null?' · 先打退他身边的人':' · 跟紧田博');}
}
