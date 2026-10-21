import {distance,position} from './world.js';
import {withinCampus} from '../campus-layout.js';
// Bounded outdoor encounters, integrated with the existing combat/physics.
// Random choices and cooldown survive saves; interiors and cutscenes freeze it.
export class CityPressure{
 constructor(rt){this.rt=rt;this.pool=[];this.saveTime=0;}
 state(){const w=this.rt.state().world;return w.pressure||=( {seed:741103,cooldown:24,escaped:0,encounters:0,enemies:[]} );}
 random(){const s=this.state();s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
 clear(){for(const e of this.pool){e.enabled=false;e.intentX=e.intentZ=0;}this.rt.world.streetEnemies=[];}
 restore(){this.clear();const s=this.state();if(s.enemies?.length)this.spawn(s.enemies,true);}
 spawn(points,restoring=false){const rt=this.rt;rt.world.streetEnemies=points.map((v,i)=>{let e=this.pool[i];if(!e){e=rt.world.person('追账打手',v.at);this.pool[i]=e;}e.enabled=true;rt.combat.equip(e,v.role,v.hp);e.street=true;rt.world.place(e,v.at);return e;});if(!restoring){this.state().encounters++;rt.api.toast('“就是他，别让他进店！” · 打退追兵，或绕巷甩开他们');}this.save();}
 save(){const s=this.state();s.enemies=this.rt.world.streetEnemies.map(e=>({at:position(e),role:e.role,hp:e.hp}));this.rt.parent.save();}
 tick(dt){const rt=this.rt,g=rt.api.get(),s=this.state(),o=rt.manager?.objective;if(g.region!==rt.regionId||g.interior||g.driving||g.paused||g.dead||rt.parent.dialogue.busy||g.mapTest)return;
  const pack=rt.world.streetEnemies;if(pack.length&&(o?.noAttack||withinCampus(...rt.position()))){this.clear();s.enemies=[];s.cooldown=Math.max(s.cooldown,30);this.save();return;}if(pack.length){this.saveTime+=dt;if(this.saveTime>2){this.saveTime=0;this.save();}if(pack.every(e=>e.hp<=0)){this.clear();s.enemies=[];s.cooldown=45+this.random()*40;rt.api.cash(12);rt.api.heal(5);rt.api.toast('追兵散了 · 拿回 ¥12，缓一口气');this.save();return;}s.escaped=pack.every(e=>distance(position(e),rt.position())>45&&!rt.world.lineClear(position(e),rt.position()))?s.escaped+dt:0;if(s.escaped>=7||pack.every(e=>distance(position(e),rt.position())>80)){this.clear();s.enemies=[];s.escaped=0;s.cooldown=30+this.random()*30;this.save();}return;}
  if(rt.state().chapterState.chapter4<1||o?.noAttack||o?.encounter||['fight','upload','copy'].includes(o?.type)||rt.pendingActivation||rt.world.region.canDrive(...rt.position())||withinCampus(...rt.position())||distance(rt.position(),[-205,405])<55)return;
  s.cooldown=Math.max(0,s.cooldown-dt);if(s.cooldown>0)return;
  const points=[];for(let attempt=0;attempt<18&&points.length<3;attempt++){const a=this.random()*Math.PI*2,r=18+this.random()*8,at=rt.world.safe('outside',[rt.position()[0]+Math.sin(a)*r,rt.position()[1]+Math.cos(a)*r]);if(distance(at,rt.position())<13||rt.world.region.canDrive(...at)||withinCampus(...at)||points.some(p=>distance(p.at,at)<3))continue;points.push({at,role:points.length===2?'thrower':points.length?'charger':'brawler'});}
  if(points.length)this.spawn(points);else s.cooldown=12;
 }
}
