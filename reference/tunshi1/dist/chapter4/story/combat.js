import * as THREE from '../../vendor/three.module.js';
import {ThirdCombat} from '../../chapter3/story/combat.js';
import {distance,position} from './world.js';
const special={thrower:{hp:105,speed:3.4,damage:12,reach:2.3,windup:.6,recovery:.8},caller:{hp:120,speed:3.8,damage:13,reach:2.5,windup:.6,recovery:.8}};
export class FourthCombat extends ThirdCombat{
 constructor(rt){super(rt);this.bottles=[];}
 roleStats(role){return special[role]||super.roleStats(role);}
 equip(e,role,hp){super.equip(e,role,hp);e.throwTime=2;e.callTime=0;e.called=false;e.aim=null;e.pursuit=false;e.escortPursuit=false;if(e.escortMark)e.escortMark.visible=false;if(special[role]){e.roleMarks[role]||=this.api.label(role==='thrower'?'！掷瓶 · 躲开落点':'！呼叫增援 · 打断他',3.5,.42,'#633f37','#ffe0a3',e.g,0,3,0);e.roleMark.visible=false;e.roleMark=e.roleMarks[role];e.roleMark.visible=false;}return e;}
 movementSpeed(e,d,speed){return e.pursuit?(d>18?15:d>5?13.1:speed):e.street?(d>9?13.3:speed):speed;}
 aggroRange(e){return e.escortPursuit?240:e.pursuit?90:e.street?65:42;}
 reset(){super.reset();for(const b of this.bottles||[]){b.active=false;b.mesh.visible=b.mark.visible=false;}}
 heatAction(){if(!this.rt.allowAttack()||this.api.get().safeZone){this.api.toast('先离开校门这段，别把学生卷进来。');return false;}return super.heatAction();}
 afterDamage(e,n,source){super.afterDamage(e,n,source);if(special[e.role]&&e.hp>0){e.aim=null;e.callTime=0;e.throwTime=Math.max(e.throwTime,1.2);e.phase='recover';e.phaseTime=.5;e.roleMark.visible=false;}}
 projectile(e,target,escort=false){let b=this.bottles.find(b=>!b.active);if(!b){if(this.bottles.length>=8)return;const mesh=new THREE.Mesh(new THREE.SphereGeometry(.17,8,5),new THREE.MeshStandardMaterial({color:'#88aea4',roughness:.35})),mark=new THREE.Mesh(new THREE.RingGeometry(1.4,1.55,24),new THREE.MeshBasicMaterial({color:'#ef9b58',side:THREE.DoubleSide}));mark.rotation.x=-Math.PI/2;this.api.scene.add(mesh,mark);b={mesh,mark};this.bottles.push(b);}Object.assign(b,{active:true,area:e.area,escort,start:[...position(e)],end:[...target],time:0,originY:e.g.position.y+1.6});b.mark.position.set(target[0],this.rt.world.floor(e.area,target)+.08,target[1]);b.mesh.visible=b.mark.visible=true;}
 tick(dt){
  const g=this.api.get(),rt=this.rt;if(!rt.allowAttack()){for(const e of rt.world.enemies)e.intentX=e.intentZ=0;return;}if(rt.parent.dialogue.busy)return super.tick(dt);
  for(const e of rt.world.enemies){if(!e.enabled||e.hp<=0||e.area!==rt.area()||!special[e.role]||e.stun>0)continue;const contact=rt.combatTarget(e),aim=contact?.escort?contact.at:rt.position(),d=distance(position(e),aim);
   if(e.role==='thrower'&&d>4&&d<26&&rt.world.lineClear(position(e),aim)){e.phase='radio';e.intentX=e.intentZ=0;e.throwTime-=dt;if(!e.aim&&e.throwTime<=0){e.aim=[...aim];e.throwTime=.9;e.roleMark.visible=true;}else if(e.aim&&e.throwTime<=0){this.projectile(e,e.aim,!!contact?.escort);e.aim=null;e.throwTime=3.6;e.roleMark.visible=false;}}
   else if(e.role==='caller'&&!e.called&&d<30){e.phase='radio';e.callTime+=dt;e.roleMark.visible=true;if(e.callTime>=7){e.called=true;e.roleMark.visible=false;e.phase='approach';rt.actions.callReinforcements(e);}}
   else if(e.phase==='radio'){e.phase='approach';e.roleMark.visible=false;}
  }
  super.tick(dt);
  // Stop near a protected target rather than charging past its hit range.
  for(const e of rt.world.enemies){
   if(!e.enabled||e.hp<=0||e.area!==rt.area())continue;
   if(e.phase==='radio'&&special[e.role])e.roleMark.visible=true;
   if(e.role==='charger'&&e.phase==='windup'){
    const target=rt.combatTarget(e);if(!target?.stationary&&!target?.escort)continue;
    const remaining=Math.max(0,distance(position(e),target.at)-(this.roleStats(e.role).reach-1.1));
    const speed=Math.min(Math.hypot(e.intentX,e.intentZ),remaining/Math.max(.001,dt));
    e.intentX=Math.sin(e.lockAngle)*speed;e.intentZ=Math.cos(e.lockAngle)*speed;
   }
  }
  for(const b of this.bottles){if(!b.active)continue;b.time+=dt;const q=Math.min(1,b.time/.85),floor=rt.world.floor(b.area,b.end);b.mesh.position.set(b.start[0]*(1-q)+b.end[0]*q,b.originY*(1-q)+(floor+.3)*q+Math.sin(q*Math.PI)*2.7,b.start[1]*(1-q)+b.end[1]*q);b.mesh.visible=b.mark.visible=b.area===rt.area();if((b.area===rt.area()&&!rt.world.lineClear(b.start,b.end))||q>=1){if(q>=1&&b.area===rt.area()&&rt.world.lineClear(b.start,b.end)){if(b.escort){const target=rt.actions.encounters.tianBo.allyTarget(rt.manager?.objective,rt.manager?.record?.progress);if(target&&distance(target.at,b.end)<1.8&&Math.abs(target.actor.g.position.y-.2-floor)<1.5)target.damage(12);}else if(distance(rt.position(),b.end)<1.8&&this.dodgeTime<=0)this.api.hurt(12,'飞来的酒瓶');}b.active=false;b.mesh.visible=b.mark.visible=false;}}
  rt.actions.encounters.tianBo.support.tick(rt.manager?.objective,rt.manager?.record?.progress,dt);
 }
}
