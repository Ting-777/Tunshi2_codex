import * as THREE from '../../vendor/three.module.js';
import {rayHit} from '../../physics.js';
import {resetActorPose} from '../../story/actor-pose.js';
import {YUELU} from '../layout.js';
import {GARAGE,GROUND,UPPER,STUDY} from './missions.js';
import {buildThirdSets} from './sets.js';
import {ThirdEffects} from './effects.js';
import {buildVillaInteriors} from './villa-interiors.js';

export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export const position=e=>[e.g.position.x,e.g.position.z];
export const ENCOUNTERS={
 yard:{area:'outside',at:[-747,112],actors:[[-755,106,'brawler'],[-738,112,'guard'],[-749,123,'charger']]},
 garage:{area:GARAGE,at:[4000,20],actors:[[3988,25,'brawler'],[4009,20,'guard'],[4000,10,'heavy']]},
 hall:{area:GROUND,at:[4185,20],actors:[[4181,12,'guard'],[4199,21,'brawler'],[4190,30,'charger']]},
 kitchen:{area:GROUND,at:[4222,-12],actors:[[4214,-15,'brawler'],[4228,-10,'guard'],[4230,-28,'heavy']]},
 court:{area:GROUND,at:[4184,-24],actors:[[4183,-20,'charger'],[4171,-27,'charger'],[4198,-29,'guard']]},
 keeper:{area:UPPER,at:[4400,-22],actors:[[4400,-22,'foreman'],[4410,-24,'guard']]}
};

export class ThirdWorld{
 constructor(rt){
  this.rt=rt;this.api=rt.api;this.region=this.api.regionData(YUELU);
  this.sets=buildThirdSets(this.api);this.effects=new ThirdEffects(this.api);const interiors=buildVillaInteriors(this.api);this.chandelier=interiors.chandelier;this.chandelierFall=null;
  for(const [id,p]of interiors.weapons)this.sets.weapons.set(id,p);
  this.props=new Map([...this.sets.props,...interiors.props]);this.contacts=new Map();this.actors=[...this.sets.blockCars];this.enemies=[];this.pool=[];
  this.runner=this.person('拿走文件的人',[-176,-176]);this.runnerBag=this.api.box(.65,.5,.2,'#ae9871',this.runner.g,.55,1.05,0);
  this.luxury=this.api.makeCar('仙人的豪车',[4000,27],'#324947',{region:YUELU,area:GARAGE,hp:140});
  Object.assign(this.luxury,{populationKey:'story:c3-luxury',enabled:false,parked:true,homeParked:true,homeRegion:YUELU,parkedInterior:GARAGE});this.actors.push(this.luxury);
  this.api.box(1.4,.12,.3,'#c5b389',this.luxury.g,0,.65,2.08);
  this.marker=new THREE.Group();this.api.scene.add(this.marker);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4,.08,6,30),new THREE.MeshBasicMaterial({color:'#68cfff'}));ring.rotation.x=Math.PI/2;this.marker.add(ring);this.marker.visible=false;
 }
 floor(area,at){return this.api.interiors[area]?.heightAt?.(...at)??this.region.heightAt(...at);}
 safe(area,at,r=.65){return area==='outside'?this.api.safeRegion(YUELU,...at,r):this.api.safeIn(area,...at,r);}
 person(name,at,area='outside',ally=false){const e=this.api.makePerson(name,at,{region:YUELU,area,ally,hp:100,color:ally?'#889b89':'#6d7668'});e.enabled=false;e.g.visible=false;this.actors.push(e);return e;}
 place(e,at,area=e.area){const p=this.safe(area,at);e.area=area;e.region=YUELU;e.g.position.set(p[0],this.floor(area,p)+.2,p[1]);e.intentX=e.intentZ=0;return e;}
 contact(name,at,area='outside'){let e=this.contacts.get(name);if(!e){e=this.person(name,at,area,true);this.contacts.set(name,e);}if(!e.enabled){e.enabled=true;resetActorPose(e);e.hp=e.maxHp;}return this.place(e,at,area);}
 enemy(i,at,area,role='brawler',hp){let e=this.pool[i];if(!e){e=this.person('仙人府守卫',at,area);this.pool[i]=e;}e.enabled=true;e.name=area==='outside'&&at[0]>-700?'尾随者':role==='foreman'?'守卫领队':'仙人府守卫';if(e.nameLabel.userData.caption!==e.name){e.nameLabel.removeFromParent();e.nameLabel=this.api.label(e.name,2.4,.45,'#526044','#eee3c7',e.g,0,e.labelHeight||2.7,0);}resetActorPose(e);this.rt.combat.equip(e,role,hp);e.navPath=null;e.navTime=0;e.kx=e.kz=e.down=0;this.place(e,at,area);return e;}
 spawn(points,p,area='outside'){
  this.clearEnemies();this.enemies=Array.from({length:Math.max(points.length,p.enemies?.length||0)},(_,i)=>{const [x,z,role]=points[i]||points.at(-1),old=p.enemies?.[i],e=this.enemy(i,old?.at||[x,z],area,old?.role||role,old?.hp);if(old?.hp<=0)e.hp=0;return e;});p.spawned=true;this.preserve(p);
 }
 preserve(p){if(p&&this.enemies.length)p.enemies=this.enemies.map(e=>({hp:e.hp,at:position(e),role:e.role}));}
 reinforce(points,p,area='outside',reuseDefeated=false){
  for(const [x,z,role]of points){const slot=reuseDefeated?this.enemies.findIndex(e=>e.hp<=0):-1,i=slot<0?this.enemies.length:slot,e=this.enemy(i,[x,z],area,role);if(slot<0)this.enemies.push(e);else this.enemies[slot]=e;}this.preserve(p);
 }
 clearEnemies(){for(const e of this.pool){e.enabled=false;e.intentX=e.intentZ=0;if(e.roleMark)e.roleMark.visible=false;}this.enemies=[];}
 clear(){this.effects.clear();this.chandelierFall=null;this.clearEnemies();for(const e of this.actors){e.enabled=false;e.intentX=e.intentZ=0;e.g.visible=false;}this.marker.visible=false;}
 apply(s,enabled=this.rt.active&&!this.api.get().mapTest){
  const w=s.world;this.sets.outside.visible=enabled;
  for(const b of this.sets.closures){b.g.visible=enabled&&!!w.roadsClosed;b.collider.disabled=!b.g.visible;}
  for(const [i,e]of this.sets.blockCars.entries()){e.enabled=enabled&&!!w.roadsClosed;const saved=w.blockCars?.[i];e.hp=saved?.hp??100;e.g.position.fromArray(saved?.position||e.home.toArray());e.g.rotation.y=saved?.angle??e.homeAngle;}
  for(const p of this.props.values()){
   p.hp=w.damage[p.id]??p.maxHp;const held=w.heldWeapon===p.id;p.g.visible=held||p.hp>0&&!w.spentWeapons[p.id];if(p.debris)p.debris.visible=p.hp<=0;
   const solid=['furniture','weapon','ram'].includes(p.kind);p.collider.disabled=!enabled||p.hp<=0||!!w.spentWeapons[p.id]||held||!solid;
   if(p.g.visible&&p.kind==='weapon'&&!held){p.g.position.copy(p.origin);p.g.rotation.set(0,0,0);}
  }
  for(const [id,key]of[['trail-gate','trailGate'],['bridge-gate','bridgeGate']]){
   const p=this.props.get(id);p.g.visible=enabled;p.g.position.copy(p.origin);p.g.rotation.y=p.closedAngle+(w.opened[key]?Math.PI/2:0);if(w.opened[key]){p.g.position.x-=2.35;p.g.position.z+=2.35;}p.collider.disabled=!enabled||!!w.opened[key];
  }
  if(this.chandelierFall==null)this.chandelier.position.y=w.opened.chandelier?.35:7;
  const cart=this.props.get('escort-cart');cart.g.visible=enabled&&!!w.escortBlockade&&cart.hp>0;cart.collider.disabled=!cart.g.visible||!!w.opened.escortCart;
  cart.g.position.copy(cart.origin);if(w.opened.escortCart)cart.g.position.z+=4;
  const open=enabled&&(w.opened.garage||s.chapterComplete);this.region.shutter.visible=!open;this.region.shutterCollider.disabled=open;
  if(enabled&&(w.villaCommitted||s.chapterComplete)){
   this.luxury.enabled=true;
   const saved=w.luxury;
   if(this.api.ride!==this.luxury&&saved){this.luxury.hp=saved.hp;this.luxury.g.position.fromArray(saved.position);this.luxury.g.rotation.y=saved.angle;}
   else if(this.api.ride!==this.luxury&&!saved){this.luxury.hp=140;this.luxury.g.position.set(4000,.5,27);this.luxury.g.rotation.y=Math.PI;}
  }
 }
 persistCar(){this.rt.state().world.blockCars=this.sets.blockCars.map(e=>({hp:e.hp,position:e.g.position.toArray(),angle:e.g.rotation.y}));const e=this.luxury;if(e.enabled)this.rt.state().world.luxury={hp:e.hp,position:e.g.position.toArray(),angle:e.g.rotation.y};}
 update(t){
  const g=this.api.get(),area=this.rt.area(),enabled=this.rt.active&&!g.mapTest;
  for(const e of this.actors){if(e===this.api.ride)continue;e.g.visible=enabled&&e.enabled&&g.region===YUELU&&(e.parkedInterior||e.area)===area;}
  if(this.chandelierFall!=null){if(this.chandelierLastT!=null)this.chandelierFall+=Math.max(0,t-this.chandelierLastT);this.chandelierLastT=t;this.chandelier.position.y=Math.max(.35,7-this.chandelierFall*this.chandelierFall*9);this.chandelier.rotation.z=Math.sin(this.chandelierFall*9)*.12;if(this.chandelierFall>1.1){this.chandelierFall=null;this.chandelierLastT=null;}}
  this.effects.update(t,enabled&&g.region===YUELU);
  const nav=this.rt.navigation;this.marker.visible=enabled&&!!nav&&nav.region===g.region&&nav.area===area;
  if(nav)this.marker.position.set(nav.at[0],(g.region===YUELU?this.floor(nav.area,nav.at):0)+.25+Math.sin(t*2)*.04,nav.at[1]);
  this.runnerBag.visible=!this.rt.state()?.world.filesReturned;const contact=this.contacts.get('JC');if(contact&&this.rt.manager?.objective?.type==='escort'&&this.rt.manager.record.progress.passenger)contact.g.visible=false;
 }
 segmentHits(a,b,s){const d=distance(a,b);return rayHit({x:a[0],z:a[1]},{x:(b[0]-a[0])/Math.max(.01,d),z:(b[1]-a[1])/Math.max(.01,d)},{x:s.x,z:s.z,hx:s.w/2,hz:s.d/2,angle:s.angle||0},d)!==null;}
 lineClear(a,b,ignore=null){
  const area=this.rt.area(),room=this.api.interiors[area],floor=this.floor(area,a),targetFloor=this.floor(area,b),d=distance(a,b),dir={x:(b[0]-a[0])/Math.max(.01,d),z:(b[1]-a[1])/Math.max(.01,d)};
  return !(room?.solids||[...this.region.nearby(a[0],a[1],d+1)]).some(s=>s!==ignore&&!s.disabled&&(s.top??Infinity)>Math.min(floor,targetFloor)+1.5&&(s.bottom||0)<Math.max(floor,targetFloor)+2.8&&rayHit({x:a[0],z:a[1]},dir,{x:s.x,z:s.z,hx:s.w/2,hz:s.d/2,angle:s.angle||0},Math.max(0,d-.25))!==null);
 }
 canReach(e,target=this.api.get().position){return Math.abs(e.g.position.y-target[1])<1.7;}
 nearest(ids,range=3){return ids.map(id=>this.props.get(id)).filter(p=>p&&p.area===this.rt.area()&&distance(this.rt.position(),p.at)<range&&Math.abs(this.api.get().position[1]-.2-p.baseY)<2&&this.lineClear(this.rt.position(),p.at,p.collider)).sort((a,b)=>distance(this.rt.position(),a.at)-distance(this.rt.position(),b.at))[0];}
 traceStrike(heading=this.api.get().heading){
  if(this.rt.area()===STUDY)return null;const [x,z]=this.rt.position(),fist=this.api.get().position[1]+1.6,dir={x:Math.sin(heading),z:Math.cos(heading)};let best=null;
  for(const p of this.props.values()){
   const b=p.collider;if(p.area!==this.rt.area()||p.hp<=0||b.disabled||!['furniture','weapon'].includes(p.kind)||fist+.35<(b.bottom||0)||fist-.35>(b.top??Infinity))continue;
   const d=rayHit({x,z},dir,{x:b.x,z:b.z,hx:b.w/2,hz:b.d/2,angle:b.angle||0},2.5);if(d!==null&&(!best||d<best.d))best={p,d};
  }
  if(best&&!this.lineClear([x,z],best.p.at,best.p.collider))return null;return best;
 }
 strike(hit){if(!hit)return false;const p=hit.p;p.hp=Math.max(0,p.hp-(this.rt.state().world.heavyGloves?60:30));this.rt.state().world.damage[p.id]=p.hp;if(!p.hp)this.rt.combat.shock(p.at);this.apply(this.rt.state());this.api.toast(p.hp?'家具开裂':'家具已砸开');this.rt.parent.save();return true;}
 ram(car,collider,impact){
  const cart=this.props.get('escort-cart');if(car.kind==='car'&&car===this.api.ride&&this.api.get().driving&&collider===cart.collider&&impact>=5&&this.rt.manager?.objective?.type==='escort'){
   cart.hp=0;this.rt.state().world.damage[cart.id]=0;this.rt.state().world.opened.escortCart=true;this.apply(this.rt.state());this.effects.impact('furniture',[cart.at[0],3,cart.at[1]]);this.api.impactSound('furniture');this.api.toast('货推车被撞散 · 桥前通路打开');this.rt.parent.save();return true;
  }
  const glass=this.props.get('winter-glass');if(car!==this.luxury||collider!==glass.collider||this.rt.area()!==GARAGE||!this.api.get().driving||impact<6||glass.hp<=0||this.rt.manager?.objective?.type!=='ram')return false;
  this.rt.state().world.damage[glass.id]=0;this.rt.state().world.opened.winter=true;glass.hp=0;glass.g.visible=false;glass.debris.visible=true;collider.disabled=true;
  this.effects.impact('glass',[glass.at[0],2.7,glass.at[1]]);this.api.impactSound('glass');
  this.api.toast('冬庭玻璃碎了 · 松开油门，下车进主厅');this.persistCar();this.rt.parent.save();return true;
 }
}
