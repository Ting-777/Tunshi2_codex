import {roads,facilities,undergroundEntrances} from './layout.js';
import {campusBounds} from './campus-layout.js';

export function facadeBounds(s,pad=0){const a=s.angle||0,c=Math.cos(a),n=Math.sin(a),x=s.at[0]-n*(s.d/2+3),z=s.at[1]-c*(s.d/2+3);return{x,z,hx:Math.abs(c)*s.w/2+Math.abs(n)*s.d/2+pad,hz:Math.abs(n)*s.w/2+Math.abs(c)*s.d/2+pad};}
const overlaps=(a,b)=>Math.abs(a.x-b.x)<a.hx+b.hx&&Math.abs(a.z-b.z)<a.hz+b.hz;
function crosses(a,b,rect,pad){let lo=0,hi=1;for(const [axis,centre,half]of[[0,rect.x,rect.hx+pad],[1,rect.z,rect.hz+pad]]){const delta=b[axis]-a[axis],p=a[axis]-centre;if(Math.abs(delta)<1e-8){if(Math.abs(p)>half)return false;}else{const t0=(-half-p)/delta,t1=(half-p)/delta;lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));if(lo>hi)return false;}}return true;}
// Reserve real rectangular footprints and playable lane corridors. The former
// bounding circles discarded most frontage even when neighbouring rectangles
// fitted beside one another, leaving the main shopping spine visibly empty.
export function createFrontagePlanner(){
 const occupied=facilities.map(s=>facadeBounds(s,1));
 occupied.push({x:(campusBounds.minX+campusBounds.maxX)/2,z:(campusBounds.minZ+campusBounds.maxZ)/2,hx:(campusBounds.maxX-campusBounds.minX)/2+2,hz:(campusBounds.maxZ-campusBounds.minZ)/2+2});
 occupied.push({x:0,z:-350,hx:34,hz:57});
 for(const e of undergroundEntrances)occupied.push({x:e.at[0],z:e.at[1]-6,hx:5.3,hz:10.5});
 function clear(s){const r=facadeBounds(s,.22);if(occupied.some(o=>overlaps(r,o)))return false;return roads.every(([,ps,w])=>ps.slice(1).every((end,i)=>!crosses(ps[i],end,r,w/2+1.05)));}
 return {clear,claim(s){occupied.push(facadeBounds(s,.18));},occupied};
}
