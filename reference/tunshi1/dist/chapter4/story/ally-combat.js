import {distance,position} from './world.js';

const DURATION=.64,HIT_TIME=.3,COOLDOWN=2.6,REACH=3;

// Tian Bo holds his ground during an ambush. His punch helps create an opening,
// but does not chase a bottle thrower or replace the player's protection.
export class TianBoSupport{
 constructor(escort){this.escort=escort;this.rt=escort.rt;}
 begin(o,p){
  p.escortSupport??={phase:'idle',elapsed:0,cooldown:.7,target:null,heading:0,struck:false};
  this.pose(p,this.escort.allyTarget(o,p)?.actor);
 }
 settle(p){
  const s=p.escortSupport;if(s)Object.assign(s,{phase:'idle',elapsed:0,target:null,struck:false});
  const ally=this.rt.world.contacts.get('田博');if(ally){ally.windup=0;for(const arm of ally.arms||[])arm.rotation.x=0;}
 }
 pose(p,ally){
  if(!ally)return;
  const s=p.escortSupport,active=s?.phase==='punch';
  ally.windup=active ? .001 : 0;
  if(active){
   ally.g.rotation.y=s.heading;
   const q=s.elapsed/DURATION,k=q<.47?q/.47:Math.max(0,(1-q)/.53);
   ally.arms[0].rotation.x=-.65-k*1.3;ally.arms[1].rotation.x=-.75;
  }
 }
 tick(o,p,dt){
  const rt=this.rt,g=rt.api.get(),target=this.escort.allyTarget(o,p);
  if(!target||rt.manager.record?.status!=='active'||g.driving||g.dead||g.paused||g.region!==rt.regionId||document.hidden||rt.parent.dialogue.busy)return;
  const ally=target.actor,s=p.escortSupport;
  if(!s)return;
  s.cooldown=Math.max(0,s.cooldown-dt);
  const enemies=rt.world._enemies,at=position(ally),reachable=e=>e?.enabled&&e.hp>0&&e.area===ally.area&&distance(at,position(e))<REACH&&rt.world.canReach(e,ally.g.position.toArray())&&rt.world.lineClear(at,position(e));
  if(s.phase==='idle'&&s.cooldown<=0){
   const candidates=enemies.filter(reachable).sort((a,b)=>(this.escort.target(a,o,p)?-10:0)-(this.escort.target(b,o,p)?-10:0)+distance(at,position(a))-distance(at,position(b)));
   const e=candidates[0];
   if(e){Object.assign(s,{phase:'punch',elapsed:0,cooldown:COOLDOWN,target:enemies.indexOf(e),heading:Math.atan2(e.g.position.x-at[0],e.g.position.z-at[1]),struck:false});rt.parent.save();}
  }
  if(s.phase==='punch'){
   ally.intentX=ally.intentZ=0;s.elapsed=Math.min(DURATION,s.elapsed+dt);
   if(s.elapsed>=HIT_TIME&&!s.struck){
    // Set the impact latch before damage emits its save event. Refreshing an
    // extended arm must never deliver the same punch twice.
    s.struck=true;const e=enemies[s.target];
    if(reachable(e)){
     const a=position(e),d=Math.max(.01,distance(at,a)),dx=(a[0]-at[0])/d,dz=(a[1]-at[1])/d;
     if(Math.sin(s.heading)*dx+Math.cos(s.heading)*dz>.45){
      const front=(Math.sin(e.g.rotation.y)*(at[0]-a[0])+Math.cos(e.g.rotation.y)*(at[1]-a[1]))/d;
      e.blocked=['guard','foreman'].includes(e.role)&&front>.4&&e.guardOpen<=0&&['approach','guard'].includes(e.phase)&&e.stun<=0;
      const damage=e.blocked?6:e.role==='heavy'&&e.phase==='windup'?12:18;
      rt.api.damage(e,damage,dx*.55,dz*.55,'ally');rt.api.impactSound('furniture');
     }
    }
    rt.world.preserve(p);rt.parent.save();
   }
   if(s.elapsed>=DURATION)this.settle(p);
  }
  this.pose(p,ally);
 }
}
