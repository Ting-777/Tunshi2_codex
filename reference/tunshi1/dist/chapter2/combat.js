import {distance,position} from './world.js';
const roles={
 brawler:{hp:115,speed:3.5,damage:16,reach:2.6,windup:.55,recovery:.8},
 guard:{hp:150,speed:3.2,damage:19,reach:2.8,windup:.65,recovery:1.05},
 charger:{hp:130,speed:4.3,damage:23,reach:3.2,windup:.8,recovery:1.25},
 heavy:{hp:205,speed:2.4,damage:28,reach:3.7,windup:.95,recovery:1.45},
 foreman:{hp:360,speed:3.1,damage:26,reach:3.8,windup:.85,recovery:1.1}
};
export class ChapterCombat{
 constructor(rt){this.rt=rt;this.api=rt.api;this.regionId=rt.regionId||'chapter2_chazishan';this.clock=0;this.combo=0;this.lastHit=-10;this.dodgeTime=0;this.heavyTime=0;this.lastDodge=-10;this.projectiles=[];}
 reset(){this.combo=0;this.lastHit=-10;this.lastDodge=-10;this.dodgeTime=this.heavyTime=0;for(const p of this.projectiles)p.mesh.visible=false;this.projectiles=[];this.rt.$('#chapter2Combat').classList.add('hidden');}
 roleStats(role){return roles[role]||roles.brawler;}
 movementSpeed(e,d,speed){return speed;}
 aggroRange(e){return 42;}
 equip(e,role='brawler',restoreHP){
  const stats=this.roleStats(role);e.security=false;e.securityTarget=null;e.blockCount=0;e.counter=false;e.role=role;e.c2=true;e.maxHp=stats.hp;e.hp=restoreHP??stats.hp;e.phase='approach';e.phaseTime=0;e.recovery=0;e.guardOpen=0;e.stun=0;e.intentX=e.intentZ=0;
  if(e.roleMark)e.roleMark.visible=false;e.roleMarks||={};const mark=role==='charger'?'charge':'windup';
  e.roleMark=e.roleMarks[mark]||=(this.api.label(role==='charger'?'！冲锋':'！蓄力',2.3,.35,'#523b36','#f4d2a4',e.g,0,3,0));
  e.roleMark.visible=false;e.roleMark.userData.role=role;
  // Different postures, sleeves and gloves distinguish the threats before a hit.
  if(e.arms)for(const arm of e.arms)arm.scale.setScalar(role==='heavy'||role==='foreman'?1.24:1);
  return e;
 }
 filterDamage(e,amount,source){
  if(!this.rt.active)return amount;if(e.kind==='car'&&e===this.api.ride&&this.rt.state()?.world.vehicleArmor)return amount*.65;if(!e.c2||source!=='player')return amount;if(this.rt.state().world.techniqueTraining)amount+=6;
  const now=this.clock;if(now-this.lastHit>1.45)this.combo=0;this.combo=this.combo%3+1;this.lastHit=now;
  const at=position(e),p=this.rt.position(),d=Math.max(.01,distance(p,at)),front=(Math.sin(e.g.rotation.y)*(p[0]-at[0])+Math.cos(e.g.rotation.y)*(p[1]-at[1]))/d;
  const blocks=(e.role==='guard'||e.role==='foreman')&&front>.4&&e.guardOpen<=0&&['approach','guard'].includes(e.phase)&&e.stun<=0;
  e.blocked=blocks&&this.combo<3;
  if(e.blocked){this.api.toast('挡住了 · 三连击破防 / 侧后方进攻 / Q 借物重击');return Math.max(3,amount*.16);}
  if(this.combo===3){this.heavyTime=.35;e.guardOpen=2;e.comboFinish=true;amount*=1.65;this.api.toast('第三拳 · 破防');}
  if(e.role==='heavy'&&e.phase==='windup'&&!e.comboFinish)amount*=.65;
  return amount;
 }
 afterDamage(e,amount,source){
  if(!e.c2)return;
  if(source==='player'){const w=this.rt.state().world;w.heat=Math.min(w.heatCapacity||100,(w.heat||0)+Math.max(3,Math.min(15,amount/2)));}
  if(e.blocked){e.stun=0;e.kx*=.2;e.kz*=.2;e.blocked=false;e.blockCount++;if(e.blockCount>=2){e.blockCount=0;e.phase='windup';e.phaseTime=.42;e.windup=.42;e.lockAngle=e.g.rotation.y;e.counter=true;}}
  else if(e.comboFinish){e.blockCount=0;e.counter=false;e.stun=1.2;e.phase='recover';e.phaseTime=1.2;e.comboFinish=false;}
  else if((e.role==='heavy'||e.role==='foreman')&&e.phase==='windup'){e.stun=0;e.kx*=.25;e.kz*=.25;}
  else if(e.hp>0){e.stun=Math.min(e.stun,.22);if(e.phase==='windup'){e.phase='recover';e.phaseTime=.32;}}
 }
 dodge(){
  const g=this.api.get();if(!this.rt.active||g.dead||g.paused||g.driving||this.rt.parent.dialogue.busy||this.clock-this.lastDodge<.8)return false;
  this.lastDodge=this.clock;this.dodgeTime=.42;const motion=this.api.dodge();this.dodgeLean=Math.sign((motion?.x||0)*Math.cos(g.heading)-(motion?.z||0)*Math.sin(g.heading))||1;
  const threat=this.rt.world.enemies.find(e=>e.hp>0&&e.phase==='windup'&&e.phaseTime<.35&&distance(position(e),this.rt.position())<4.5);
  if(threat){const w=this.rt.state().world;w.heat=Math.min(w.heatCapacity||100,(w.heat||0)+18);threat.guardOpen=1.8;this.api.toast('擦身闪避 · 热血 +18，趁恢复时反击');}return true;
 }
 heatAction(){
  const game=this.api.get(),w=this.rt.state()?.world;if(!w||game.region!==this.regionId||game.dead||game.paused||game.driving||this.rt.parent.dialogue.busy)return false;
  const pos=this.rt.position(),room=this.api.interiors[this.rt.area()];
  const targets=this.rt.world.enemies.filter(e=>e.enabled&&e.hp>0&&e.area===this.rt.area()&&distance(position(e),pos)<4.7&&(!this.rt.world.canReach||this.rt.world.canReach(e))&&this.rt.world.lineClear(pos,position(e))).sort((a,b)=>distance(pos,position(a))-distance(pos,position(b)));
  const e=targets[0];if(!e){this.api.toast('靠近敌人才能重击');return false;}if((w.heat||0)<30){this.api.toast('热血不足 · 连击和擦身闪避积攒热血');return false;}
  w.heat-=30;this.heavyTime=.55;e.guardOpen=2.3;
  const prop=[...this.rt.world.sets.weapons.values()].find(p=>p.area===this.rt.area()&&!w.spentWeapons[p.id]&&p.hp>0&&distance(p.at,pos)<2.8&&this.rt.world.lineClear(pos,p.at,p.collider));
  this.api.animateHeavy();if(prop){w.spentWeapons[prop.id]=true;prop.collider.disabled=true;const ox=this.api.interiors[prop.area]?.ox||0;prop.g.position.set(pos[0]-ox,1.4,pos[1]);const start=prop.g.position.clone();start.y=game.position[1]+1.2;this.projectiles.push({mesh:prop.g,start,target:e,t:0,ox:this.api.interiors[prop.area]?.ox||0});this.api.toast('借物重击 · '+prop.name);}
  else{this.api.damage(e,65,0,0,'heat');e.stun=1.7;e.phase='recover';e.phaseTime=1.7;this.api.animateHeavy();this.api.toast('热血重击 · 破防');}
  this.rt.parent.save();return true;
 }
 shock(at){for(const e of this.rt.world.enemies)if(e.enabled&&e.hp>0&&e.area===this.rt.area()&&distance(position(e),at)<3.7){this.api.damage(e,35,0,0,'environment');e.stun=1.3;e.phase='recover';e.phaseTime=1.3;}const w=this.rt.state().world;w.heat=Math.min(w.heatCapacity||100,(w.heat||0)+6);}
 pose(hero,hand=0){if(this.dodgeTime>0){const k=Math.sin((1-this.dodgeTime/.42)*Math.PI);hero.body.position.y-=k*.18;hero.body.rotation.x+=k*.16;hero.body.rotation.z+=k*.28*(this.dodgeLean||1);for(const l of hero.legs)l.rotation.x=-k*.35;hero.knees?.forEach(n=>n.rotation.x=k*.65);for(const a of hero.arms)a.rotation.x=-k*.7;}if(this.heavyTime>0){const k=Math.sin(Math.min(1,(.55-this.heavyTime)/.55)*Math.PI);hero.body.rotation.x+=k*.15;hero.arms[hand].position.z+=k*.16;hero.arms[hand].rotation.x-=k*.25;}}
 tick(dt){
  this.clock+=dt;this.heavyTime=Math.max(0,this.heavyTime-dt);this.dodgeTime=Math.max(0,this.dodgeTime-dt);if(this.api.get().region!==this.regionId){for(const e of this.rt.world.enemies)e.intentX=e.intentZ=0;this.rt.$('#chapter2Combat').classList.add('hidden');return;}
  for(const p of [...this.projectiles]){p.t+=dt;const q=Math.min(1,p.t/.32),end=position(p.target);p.mesh.visible=true;p.mesh.position.set(p.start.x*(1-q)+(end[0]-p.ox)*q,p.start.y*(1-q)+(p.target.g.position.y+1)*q+Math.sin(q*Math.PI)*1.6,p.start.z*(1-q)+end[1]*q);p.mesh.rotation.z+=dt*12;
   if(q>=1){this.api.damage(p.target,85,0,0,'environment');p.target.stun=2;p.target.phase='recover';p.target.phaseTime=2;p.mesh.visible=false;this.projectiles.splice(this.projectiles.indexOf(p),1);}}
  const rt=this.rt,enemies=rt.world.enemies,area=rt.area(),player=rt.position(),room=this.api.interiors[area];
  if(rt.parent.dialogue.busy){for(const e of enemies)e.intentX=e.intentZ=0;return;}
  for(let i=0;i<enemies.length;i++){
   const e=enemies[i];e.intentX=e.intentZ=0;if(!e.enabled||e.hp<=0||e.area!==area){if(e.roleMark)e.roleMark.visible=false;continue;}if(!e.c2)this.equip(e,'brawler',e.hp);
   const base=this.roleStats(e.role),stats=e.role==='foreman'&&e.hp<e.maxHp/2?{...base,speed:3.8,windup:.65,recovery:.8}:base,ep=position(e),p=rt.manager?.record?.progress,dina=rt.world.contacts.get('Dina');
   const rushFile=rt.manager?.objective?.type==='defense'&&i%3===1&&dina?.enabled;
   const contactTarget=rt.combatTarget?.(e);const target=contactTarget?.at||(rushFile?position(dina):e.securityTarget||player),d=distance(ep,target);
   e.guardOpen=Math.max(0,e.guardOpen-dt);e.stun=Math.max(0,e.stun-dt);e.phaseTime-=dt;
   if(e.stun>0){e.roleMark.visible=false;continue;}
   if(e.phase==='radio'){e.roleMark.visible=false;if(e.arms)e.arms[0].rotation.x=-1.5;continue;}
   if(e.phase==='windup'){
    e.windup=Math.max(.001,e.phaseTime);e.roleMark.visible=true;e.roleMark.scale.setScalar(1+Math.sin(this.clock*12)*.1);e.g.rotation.y=e.lockAngle;
    if(e.arms)e.arms[0].rotation.x=-1.4;
    if(e.phaseTime>0&&(e.role==='charger'||e.counter&&e.phaseTime<.23)){const speed=e.role==='charger'?(e.phaseTime>.23?11.5:13):4;e.intentX=Math.sin(e.lockAngle)*speed;e.intentZ=Math.cos(e.lockAngle)*speed;}
    if(e.phaseTime<=0){const hitTarget=contactTarget?target:rushFile?target:player,hitDistance=distance(ep,hitTarget),dx=hitTarget[0]-ep[0],dz=hitTarget[1]-ep[1],dot=(Math.sin(e.lockAngle)*dx+Math.cos(e.lockAngle)*dz)/Math.max(.01,hitDistance);
     const clear=(!room||room.clearLine(ep,hitTarget,.2))&&rt.world.lineClear(ep,hitTarget)&&(!rt.world.canReach||rt.world.canReach(e,contactTarget?[target[0],rt.world.floor(area,target)+.2,target[1]]:this.api.get().position));
     if(hitDistance<stats.reach&&dot>.4&&clear&&(!e.security||e.securitySees)){if(contactTarget)contactTarget.damage(stats.damage);else if(rushFile)p.fileHP=Math.max(0,p.fileHP-stats.damage*(rt.state().world.reinforcedShutter?.6:1));else if(this.dodgeTime<=0)this.api.hurt(stats.damage,e.role==='foreman'?'代理领队的重拳':(rt.enemyLabel||'收购方反击'));}
     e.counter=false;e.phase='recover';e.phaseTime=stats.recovery;e.windup=0;e.roleMark.visible=false;if(e.arms)e.arms[0].rotation.x=0;
    }continue;
   }
   if(e.phase==='guard'){e.windup=.001;e.g.rotation.y=Math.atan2(target[0]-ep[0],target[1]-ep[1]);if(e.arms)for(const arm of e.arms)arm.rotation.x=-.8;if(e.phaseTime<=0){e.phase='windup';e.phaseTime=stats.windup;e.windup=stats.windup;e.lockAngle=e.g.rotation.y;this.api.flashEnemy(e);}continue;}
   if(e.phase==='recover'){e.roleMark.visible=false;if(e.phaseTime<=0)e.phase='approach';continue;}
   e.windup=0;const angle=Math.atan2(target[0]-ep[0],target[1]-ep[1]);e.g.rotation.y=angle;
   if(e.role==='guard'||e.role==='foreman')if(e.arms)for(const arm of e.arms)arm.rotation.x=e.guardOpen>0?0:-.75;
   if((!e.security||e.securitySees&&e.securityMode==='combat')&&d<(e.role==='charger'?6:stats.reach-.5)){if((e.role==='guard'||e.role==='foreman')&&e.guardOpen<=0){e.phase='guard';e.phaseTime=1.05;continue;}e.phase='windup';e.phaseTime=stats.windup;e.windup=stats.windup;e.lockAngle=angle;this.api.flashEnemy(e);continue;}
   if(d>(e.security?75:this.aggroRange(e)))continue;let aim=target;
   if(room&&!room.clearLine(ep,target,.5)||!room&&rt.regionId&&!rt.world.lineClear(ep,target)){e.navTime=(e.navTime||0)-dt;if(!e.navPath||e.navTime<=0){try{e.navPath=room?room.route([ep,target]):(rt.combatRoute?rt.combatRoute([ep,target]):rt.routeFor([ep,target]));e.navIndex=1;}catch{e.navPath=[];}e.navTime=rt.combatRoute?(e.navPath.length?1:2):.7;}while(e.navIndex<e.navPath.length&&distance(ep,e.navPath[e.navIndex])<.8)e.navIndex++;aim=e.navPath[e.navIndex]||ep;}
   else if(!rushFile&&(!e.security||e.securityMode==='combat'&&e.securitySees)&&enemies.filter(x=>x.phase==='windup').length>=2){const side=(i%2?1:-1)*1.2;aim=[target[0]+Math.cos(angle)*side,target[1]-Math.sin(angle)*side];}
   const ad=Math.max(.01,distance(ep,aim)),rawSpeed=e.security&&e.securityMode==='combat'?(e.role==='charger'?8.2:e.role==='heavy'?3.6:5.4):e.role==='charger'&&d>5?6.4:stats.speed,speed=this.movementSpeed(e,d,rawSpeed);e.intentX=(aim[0]-ep[0])/ad*speed;e.intentZ=(aim[1]-ep[1])/ad*speed;
  }
  const w=rt.state().world,hasFight=enemies.some(e=>e.enabled&&e.hp>0&&e.area===area);
  rt.$('#chapter2Combat').classList.toggle('hidden',!hasFight);rt.$('#heatFill').style.width=((w.heat||0)/(w.heatCapacity||100)*100)+'%';rt.$('#heatValue').textContent=Math.floor(w.heat||0);rt.$('#combatMoveHint').textContent='三拳破防 · 右键 / G 闪身 · Q 热血';
 }
}
