import {rayHit} from '../physics.js';
const offsets=[0,-.12,.12,-.26,.26,-.43,.43,-.62,.62];
// A broad hand sweep, with line-of-sight for each ray. Targets behind a wall or
// beyond the actual reach never become hits merely because they are nearby.
export function meleeTarget(origin,heading,targets,blockers,shape,{reach=2.15,fistHeight=origin.y+1.6,personOnly=false}={}){
 let best=null;
 for(const offset of offsets){const angle=heading+offset,dir={x:Math.sin(angle),z:Math.cos(angle)};let limit=reach;
  for(const b of blockers){if(b.disabled||fistHeight+.35<(b.bottom||0)||fistHeight-.35>(b.top??Infinity))continue;const d=rayHit(origin,dir,{x:b.x,z:b.z,hx:b.w/2,hz:b.d/2,angle:b.angle||0},reach);if(d!==null)limit=Math.min(limit,d);}
  for(const e of targets){if(e.hp<=0||e.ally||personOnly&&e.kind!=='person')continue;
   const top=e.kind==='car'?e.g.position.y+1.15:e.g.position.y+(e.g.userData.characterModel?.includes('dolphin')?3.35:e.boss?3.5:2.3);
   if(fistHeight-.55>top||fistHeight+.55<e.g.position.y-.2)continue;
   const s=shape(e),expanded=s.r!=null?{...s,r:s.r+.16}:{...s,hx:s.hx+.12,hz:s.hz+.12},d=rayHit(origin,dir,expanded,reach);
   if(d===null||d>limit+.015)continue;
   // The actual target sightline, not just the widened hull, must be clear.
   const dx=e.g.position.x-origin.x,dz=e.g.position.z-origin.z,len=Math.hypot(dx,dz),sight={x:dx/Math.max(.01,len),z:dz/Math.max(.01,len)},edge=rayHit(origin,sight,s,reach+.6)??len;
   if(blockers.some(b=>!b.disabled&&fistHeight+.35>=(b.bottom||0)&&fistHeight-.35<=(b.top??Infinity)&&((rayHit(origin,sight,{x:b.x,z:b.z,hx:b.w/2,hz:b.d/2,angle:b.angle||0},edge)??Infinity)<edge-.025)))continue;
   const score=d+Math.abs(offset)*.6;if(!best||score<best.score)best={e,d,dir,score};
  }
 }
 return best;
}
