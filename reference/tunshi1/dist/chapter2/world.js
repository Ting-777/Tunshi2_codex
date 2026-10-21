import * as THREE from '../vendor/three.module.js';
import {rayHit} from '../physics.js';
import {CHAZI} from '../regions/data.js';
import {SHOP,HOME,GARAGE,OFFICE} from './missions.js';
import {buildWeapons} from './weapons.js';
import {applyHomeDemolition} from './home-demolition.js';
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export const position=e=>[e.g.position.x,e.g.position.z];
export class SecondWorld{
 constructor(rt,sets){this.rt=rt;this.api=rt.api;this.sets=sets;this.contacts=new Map();this.pool=[];this.enemies=[];this.actors=[];this.props=new Map(sets.props);this.outside=new THREE.Group();this.api.regionRoot(CHAZI).add(this.outside);sets.weapons=buildWeapons({...this.api,outside:this.outside});for(const p of sets.weapons.values())if(p.area==='outside')this.api.regionData(CHAZI).solids.push(p.collider);
  this.shopShell=this.api.regionData(CHAZI).oldShop;for(const [id,name]of [['window','侧窗：灰尘被踩过'],['outside-power','墙上的旧电箱'],['side-entry','掀开侧窗旧木板']]){const anchor=this.shopShell.approach[id],caption=this.api.label(name,3.8,.42,'#344f57','#f6ddae',anchor.g,.22,1.32,id==='outside-power'?0:2.075);caption.rotation.y=Math.PI/2;caption.visible=false;this.props.set(id,{id,at:anchor.at,g:anchor.g,caption,name,area:'outside'});}
  this.blockCar=this.car('堵门的旧车',[-680,-175],'#9caaa3');this.blockCar.story=false;this.blockCar.parked=true;this.blockCar.homeParked=true;this.blockCar.homeRegion=CHAZI;
  this.runner=this.person('拿货的年轻人',[-615,-143]);this.tail=this.person('收购中间人',[85,-145]);this.drunk=this.person('醉汉',[-585,-167]);this.carrier=this.car('收购方车辆',[120,-149],'#6b7c86');this.carrier.scripted=true;
  this.delivery=this.car('海豚旧友配送车',[85,-145],'#9b956e');this.delivery.populationKey='story:c2-delivery';this.delivery.parked=false;this.delivery.scripted=true;this.deliveryCrates=[];for(const x of [-.52,.52])this.deliveryCrates.push(this.api.box(.82,.58,.82,'#b59c6f',this.delivery.g,x,1.45,1));this.pursuers=[this.car('代理追车一',[90,-130],'#846960'),this.car('代理追车二',[80,-130],'#7d7a89')];for(const c of this.pursuers)c.scripted=true;
  this.armor=new Map();this.roadblockCar=this.car('炫神的封路车',[-25,-120],'#e8bf4f');this.roadblockCar.g.rotation.y=Math.PI/2;
  this.candidates=[[60,-142],[85,-142],[110,-142]].map((at,i)=>{const e=this.car('停车区 '+(i+1),at,['#9caaa7','#869da0','#a98b76'][i]);this.api.label(i===1?'海豚旧友 · 物流':'一般配送',2.4,.45,'#365761','#f5dfad',e.g,0,1.6,-1.95).rotation.y=Math.PI;const bag=this.api.box(.45,.7,.12,i===1?'#cdae79':'#67939d',e.g,1.4,1.1,0);e.g.userData.documentBag=bag;return e;});
  this.marker=new THREE.Group();this.api.scene.add(this.marker);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4,.08,6,30),new THREE.MeshBasicMaterial({color:'#68cfff'}));ring.rotation.x=Math.PI/2;this.marker.add(ring);this.marker.visible=false;
  this.vaults=[];for(const [x,z,w]of [[-600,-182,9],[235,-118,12]]){const m=this.api.box(w,.9,.2,'#78938c',this.outside,x,.45,z);const collider={x,z,w,d:.2,bottom:0,top:.9,walkable:true,vaultHeight:1.05};this.api.regionData(CHAZI).solids.push(collider);this.vaults.push({m,collider});}
  this.breach=new THREE.Group();this.outside.add(this.breach);this.breach.position.set(-547,0,-146);for(let i=0;i<9;i++){const m=this.api.box(.4+i*.05,.2,.8,'#a18b6d',this.breach,(i%3-1)*1.8,.15,Math.floor(i/3));m.rotation.y=i*.7;}this.breach.visible=false;
 }
 person(name,at,area='outside',ally=false){const e=this.api.makePerson(name,at,{region:CHAZI,area,ally,hp:60,color:ally?'#c6b679':'#6c728b'});e.enabled=false;e.g.visible=false;this.actors.push(e);return e;}
 car(name,at,color){const e=this.api.makeCar(name,at,color,{region:CHAZI});e.region=CHAZI;e.area='outside';e.enabled=false;e.g.visible=false;e.parked=true;this.actors.push(e);return e;}
 contact(name,at,area='outside'){let e=this.contacts.get(name);if(!e){e=this.person(name,at,area,true);this.contacts.set(name,e);}e.enabled=true;e.area=area;e.region=CHAZI;e.hp=e.maxHp;e.intentX=e.intentZ=0;const p=area==='outside'?this.api.safeRegion(CHAZI,...at,.7):this.api.safeIn(area,...at,.7);e.g.position.set(p[0],.2,p[1]);return e;}
 enemy(i,at,area='outside',hp,role=['brawler','guard','charger'][i%3]){let e=this.pool[i];if(!e){e=this.person('收购方的人',at,area);this.pool[i]=e;}e.enabled=true;e.area=area;this.rt.combat.equip(e,role,hp);e.kx=e.kz=e.stun=0;e.g.rotation.z=0;e.hitCooldown=1.2;e.windup=0;e.intentX=e.intentZ=0;const p=area==='outside'?this.api.safeRegion(CHAZI,...at,.6):this.api.safeIn(area,...at,.6);e.g.position.set(p[0],.2,p[1]);return e;}
 spawn(at,count,p,area='outside'){this.clearEnemies();this.enemies=Array.from({length:count},(_,i)=>{const old=p.enemies?.[i],e=this.enemy(i,old?.at||[at[0]+Math.cos(i*2)*4,at[1]+Math.sin(i*2)*4],area,undefined,old?.role||(i===count-1&&count>=5?'foreman':['brawler','guard','charger','heavy'][i%4]));if(old)e.hp=old.hp;return e;});p.spawned=true;}
 preserve(p){p.enemies=this.enemies.map(e=>({hp:e.hp,at:position(e),role:e.role}));}
 clearEnemies(){for(const e of this.pool){e.enabled=false;e.intentX=e.intentZ=0;if(e.roleMark)e.roleMark.visible=false;if(e.watchMark)e.watchMark.visible=false;if(e.callMark)e.callMark.visible=false;}this.enemies=[];}
 clear(){this.clearEnemies();for(const e of this.actors){if(e!==this.api.ride&&e.story!==false)e.enabled=false;e.intentX=e.intentZ=0;}this.marker.visible=false;for(const e of this.contacts.values())e.enabled=false;}
 apply(s){const w=s.world;applyHomeDemolition(this.sets,w);
  for(const part of this.sets.equipment.values()){part.hp=Math.max(0,Math.min(part.maxHp,w.equipment?.[part.id]??part.maxHp));part.g.visible=part.hp>0;part.debris.visible=part.hp<=0;part.collider.disabled=part.hp<=0;}
  if(w.staffPass){this.sets.gate.visible=false;this.sets.gateCollider.disabled=true;}
  this.sets.returnSign.visible=!!w.returned;this.breach.visible=!!w.shopBreach;this.shopShell.panel.visible=!w.doorOpen;this.shopShell.sash.rotation.y=w.doorOpen?.5:0;this.shopShell.front.visible=!w.shopBreach;this.sets.shutter.visible=!!w.shutterClosed&&!w.shopBreach;this.sets.shutterCollider.disabled=!this.sets.shutter.visible;if(this.sets.frontWall)this.sets.frontWall.visible=!w.shopBreach;if(this.sets.frontWallCollider)this.sets.frontWallCollider.disabled=!!w.shopBreach;
  for(const p of this.sets.weapons.values()){p.hp=w.equipment?.[p.id]??30;p.g.visible=!w.spentWeapons?.[p.id]&&p.hp>0;if(p.g.visible){p.g.position.copy(p.origin);p.g.rotation.set(0,0,0);}p.collider.disabled=!!w.spentWeapons?.[p.id]||p.hp<=0;}this.roadblockCar.enabled=!!w.roadblock&&!s.chapterComplete;this.sets.workbench.device.material.color.set(w.workbenchUpgrade?'#d4b363':'#779697');
  for(const l of this.sets.lights)l.g.intensity=l.base*(l.area===GARAGE?(w.garagePower?.[l.zone]?1:.15):w.shopPower?1:.12);
  this.api.setNight(!!w.night);
 }
 update(t){const rt=this.rt,area=rt.area(),region=this.api.get().region;if(rt.state()?.world.vehicleArmor){let bumper=this.armor.get(this.api.ride);if(!bumper){bumper=this.api.box(1.8,.16,.18,'#54636a',this.api.ride.g,0,.8,-2.2);this.armor.set(this.api.ride,bumper);}for(const [car,m]of this.armor)m.visible=car===this.api.ride;}else for(const m of this.armor.values())m.visible=false;for(const e of this.actors){if(e===this.api.ride)continue;e.g.visible=e.enabled&&e.region===region&&(e.parkedInterior||e.area)===area;}
  for(const p of this.props.values())p.caption.visible=p.area===area&&region===CHAZI&&distance(rt.position(),p.at)<5;
  const nav=rt.navigation;this.marker.visible=!!nav&&nav.region===region&&nav.area===area;if(nav)this.marker.position.set(nav.at[0],.25+Math.sin(t*2)*.04,nav.at[1]);
 }
 lineClear(a,b,ignore=null){const room=this.api.interiors[this.rt.area()];if(!room)return true;const d=distance(a,b),dir={x:(b[0]-a[0])/Math.max(.01,d),z:(b[1]-a[1])/Math.max(.01,d)};return !room.solids.some(s=>s!==ignore&&!s.disabled&&(s.top||0)>2&&rayHit({x:a[0],z:a[1]},dir,{x:s.x,z:s.z,hx:s.w/2,hz:s.d/2,angle:s.angle||0},d)!==null);}
 nearest(ids,range=3){return ids.map(id=>this.props.get(id)).filter(p=>p&&p.area===this.rt.area()&&distance(this.rt.position(),p.at)<range).sort((a,b)=>distance(this.rt.position(),a.at)-distance(this.rt.position(),b.at))[0];}
 traceStrike(heading=this.api.get().heading){const area=this.rt.area();if(![HOME,GARAGE,OFFICE].includes(area))return null;
  const [x,z]=this.rt.position(),fist=this.api.get().position[1]+1.6,dir={x:Math.sin(heading),z:Math.cos(heading)};let best=null;
  for(const p of [...this.sets.parts.values(),...this.sets.equipment.values(),...this.sets.weapons.values()]){if(p.hp<=0||(p.area||HOME)!==area||p.collider.disabled)continue;const b=p.collider;if(fist+.35<(b.bottom||0))continue;const d=rayHit({x,z},dir,{x:b.x,z:b.z,hx:b.w/2,hz:b.d/2,angle:b.angle||0},2.5);if(d!==null&&(!best||d<best.d))best={p,d};}
  if(!best)return null;for(const b of this.api.interiors[area].solids){if(b.disabled||b===best.p.collider||fist+.35<(b.bottom||0)||fist-.35>(b.top??Infinity))continue;const d=rayHit({x,z},dir,{x:b.x,z:b.z,hx:b.w/2,hz:b.d/2,angle:b.angle||0},2.5);if(d!==null&&d<best.d-.02)return null;}return best;
 }
  strike(hit=this.traceStrike()){if(!hit)return false;this.rt.actions.security.noise(true);const p=hit.p,w=this.rt.state().world;p.hp=Math.max(0,p.hp-(w.heavyGloves?60:30));(p.equipment?w.equipment:w.demolition)[p.id]=p.hp;
  if(p.hp===0)this.rt.combat.shock(p.at);if(p.hp===0&&p.id==='office-gate'){w.staffPass=true;this.rt.actions.forceAlarm('noise');}if(p.hp===0&&p.clue)this.rt.actions.collectClue(p.clue);if(p.hp===0&&p.id==='locker-door')this.rt.actions.collectClue('locker-04');
  this.apply(this.rt.manager.state);this.api.toast(p.hp>0?p.name+'开裂 · 再打一拳':p.id==='seal-panel'?'墙拆开了！蓝线尽头的铁盒 · E 拿取':p.name+'已拆掉，通路打开');this.rt.parent.save();return true;
 }
 allies(names,dt){for(const name of names||[]){const a=this.contacts.get(name);if(!a?.enabled||a.area!==this.rt.area())continue;a.intentX=a.intentZ=0;a.aiTimer=(a.aiTimer||0)-dt;const e=this.enemies.find(e=>e.hp>0);if(!e)continue;const ap=position(a),ep=position(e),d=distance(ap,ep);a.g.rotation.y=Math.atan2(ep[0]-ap[0],ep[1]-ap[1]);if(d>2&&d<30){a.intentX=(ep[0]-ap[0])/d*3;a.intentZ=(ep[1]-ap[1])/d*3;}else if(d<=2&&a.aiTimer<=0){a.aiTimer=1.6;this.api.damage(e,18);}}}
}
