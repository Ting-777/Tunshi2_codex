import {ChapterCombat} from '../../chapter2/combat.js';
import {distance,position} from './world.js';

// Q is a visible two-step action in Chapter III: pick up, then smash. A chair
// does not require stored heat or an enemy to be standing beside the chair.
export class ThirdCombat extends ChapterCombat{
 constructor(rt){super(rt);this.held=null;this.swing=null;}
 reset(){super.reset();this.detach();this.swing=null;}
 detach(){if(!this.held)return;const p=this.held;if(p.homeParent)p.homeParent.add(p.g);p.g.position.copy(p.origin);p.g.rotation.set(0,0,0);p.g.scale.copy(p.homeScale);p.g.visible=false;this.held=null;}
 restoreHeld(){const id=this.rt.state()?.world.heldWeapon,p=this.rt.world.sets.weapons.get(id);if(p&&!this.rt.state().world.spentWeapons[id]&&p.hp>0)this.hold(p,false);}
 hold(p,save=true){
  p.homeParent||=p.g.parent;p.homeScale||=p.g.scale.clone();this.held=p;p.collider.disabled=true;
  this.api.weaponGrip.add(p.g);p.g.position.set(.65,1.65,.45);p.g.rotation.set(.25,-.55,.2);p.g.scale.copy(p.homeScale).multiplyScalar(p.name==='木桌'?.65:1);p.g.visible=true;
  this.rt.state().world.heldWeapon=p.id;if(save){this.api.toast('拿起'+p.name+' · 靠近敌人再按 Q 砸');this.rt.parent.save();}
 }
 nearbyWeapon(){
  const pos=this.rt.position(),w=this.rt.state().world;
  return [...this.rt.world.sets.weapons.values()].filter(p=>!w.spentWeapons[p.id]&&p.hp>0&&p.area===this.rt.area()&&distance(p.at,pos)<2.8&&Math.abs(this.api.get().position[1]-.2-p.baseY)<1.7&&this.rt.world.lineClear(pos,p.at,p.collider)).sort((a,b)=>distance(a.at,pos)-distance(b.at,pos))[0];
 }
 heatAction(){
  const g=this.api.get(),state=this.rt.state()?.world;if(!state||!this.rt.active||g.region!==this.regionId||g.dead||g.paused||g.driving||this.rt.parent.dialogue.busy||this.swing)return false;
  if(!this.held){const p=this.nearbyWeapon();if(p){this.hold(p);return true;}return super.heatAction();}
  const pos=this.rt.position(),target=this.rt.world.enemies.filter(e=>e.enabled&&e.hp>0&&e.area===this.rt.area()&&distance(position(e),pos)<3.8&&this.rt.world.canReach(e)&&this.rt.world.lineClear(pos,position(e))).sort((a,b)=>distance(pos,position(a))-distance(pos,position(b)))[0];
  if(!target){this.api.toast('已拿着'+this.held.name+' · 靠近敌人按 Q 砸');return false;}
  const prop=this.held;state.spentWeapons[prop.id]=true;state.heldWeapon=null;this.swing={target,prop,t:0,hit:false};this.heavyTime=.55;this.api.face(position(target));this.api.animateHeavy();this.rt.parent.save();return true;
 }
 pose(hero,hand=0){
  super.pose(hero,hand);if(this.held){const q=this.swing?Math.min(1,this.swing.t/.32):0;for(const arm of hero.arms)arm.rotation.x=-1.2+q*2.1;this.held.g.position.set(.5,1.65+Math.sin(q*Math.PI)*.5,.4+q*1.5);this.held.g.rotation.x=.25-q*2;}
 }
 tick(dt){
  super.tick(dt);if(this.held){this.held.g.visible=!this.api.get().driving&&!this.api.get().dead;}
  if(this.swing){
   const s=this.swing;s.t+=dt;
   if(s.t>=.2&&!s.hit){s.hit=true;const at=position(s.target),pos=this.rt.position();
    if(s.target.enabled&&s.target.hp>0&&s.target.area===this.rt.area()&&distance(pos,at)<4.7&&this.rt.world.canReach(s.target)&&this.rt.world.lineClear(pos,at)){
     const dx=at[0]-pos[0],dz=at[1]-pos[1],d=Math.max(.01,Math.hypot(dx,dz));this.api.damage(s.target,s.prop.name==='木桌'?125:100,dx/d,dz/d,'environment');s.target.kx+=dx/d*7;s.target.kz+=dz/d*7;s.target.stun=2;s.target.guardOpen=3;s.target.phase='recover';s.target.phaseTime=2;
     for(const other of this.rt.world.enemies)if(other!==s.target&&other.enabled&&other.hp>0&&other.area===s.target.area&&distance(position(other),at)<2.1&&this.rt.world.lineClear(at,position(other))){this.api.damage(other,30,0,0,'environment');other.stun=1;other.phase='recover';other.phaseTime=1;}
     const w=this.rt.state().world;w.heat=Math.min(w.heatCapacity||100,(w.heat||0)+10);this.rt.world.effects?.impact('furniture',[at[0],s.target.g.position.y+1,at[1]]);this.api.impactSound?.('furniture');this.api.toast(s.prop.name+'砸中 · 破防！');
    }else this.api.toast('砸空了 · 椅子散了');
   }
   if(s.t>=.42){this.detach();this.swing=null;this.rt.parent.save();}
  }
  const w=this.rt.state()?.world,hasFight=this.rt.world.enemies.some(e=>e.enabled&&e.hp>0&&e.area===this.rt.area()),available=this.nearbyWeapon();
  this.rt.$('#chapter2Combat').classList.toggle('hidden',!hasFight&&!this.held&&!available);
  this.rt.$('#combatMoveHint').textContent=this.held?'手持'+this.held.name+' · 靠近敌人 Q 砸':available?'Q 拿起'+available.name+' · 再 Q 砸人':'三拳破防 · G 闪身 · Q 热血重击';
  const button=this.rt.$('#mobileHeat');button.textContent=this.held?'砸下':available?'拿物':'热血';button.setAttribute('aria-label',this.held?'砸下手持家具':available?'拿起附近家具':'热血重击');
 }
}
