// Feet heights are measured from the floor; the existing character root has a
// 0.2 m visual offset. The same obstacle height drives blocking and landing.
export const FOOT_OFFSET=.2;
export const BODY_HEIGHT=3.55;
// Heights correspond to the sedan mesh after its 0.4 m visual correction.
// The bonnet/trunk must not support the player at the higher cabin roof.
export function vehicleVolumes(car){
 const p=car.g.position,angle=car.g.rotation.y,at=(z,w,d,top,walkable=true)=>({x:p.x+Math.sin(angle)*z,z:p.z+Math.cos(angle)*z,w,d,angle,bottom:p.y-.5,top:p.y+top,walkable});
 return[at(0,2.1,4.04,.435),at(1.2,1.71,1.13,.54),at(-1.44,1.69,.8,.53),at(-.28,1.43,1.36,1.15),at(-.22,1.65,2.04,1.1,false)];
}
export function containsFoot(volume,x,z){
 const c=Math.cos(volume.angle||0),s=Math.sin(volume.angle||0),dx=x-volume.x,dz=z-volume.z;
 return Math.abs(dx*c-dz*s)<=volume.w/2+.035&&Math.abs(dx*s+dz*c)<=volume.d/2+.035;
}
export function supportHeight(x,z,feet,volumes,floor=0){
 let top=floor;for(const b of volumes)if(!b.disabled&&b.walkable&&Number.isFinite(b.top)&&b.top<=feet+.12&&b.top>top&&containsFoot(b,x,z))top=b.top;return top;
}
export const SAFE_FALL_HEIGHT=4;
export function fallDamage(distance){return Number.isFinite(distance)&&distance>SAFE_FALL_HEIGHT?Math.min(100,Math.ceil((distance-SAFE_FALL_HEIGHT)*10)):0;}
export function stepElevation({x,z,feet,velocity,airborne,fallPeak},dt,volumes,ceiling=Infinity,floor=0){
 const support=supportHeight(x,z,feet,volumes,floor);let landed=false;
 if(!airborne&&Math.abs(feet-support)<(floor===0?.13:.34))return{feet:support,velocity:0,airborne:false,landed,fallPeak:null,fallDistance:0};
 let peak=Math.max(feet,airborne&&Number.isFinite(fallPeak)?fallPeak:feet),fallDistance=0;
 airborne=true;velocity-=20*dt;let next=feet+velocity*dt;
 if(next>ceiling){next=ceiling;velocity=Math.min(velocity,0);}
 peak=Math.max(peak,next);
 let landing=floor;
 if(velocity<=0)for(const b of volumes)if(!b.disabled&&b.walkable&&Number.isFinite(b.top)&&feet>=b.top-.035&&next<=b.top&&containsFoot(b,x,z))landing=Math.max(landing,b.top);
 if(velocity<=0&&next<=landing){next=landing;velocity=0;airborne=false;landed=true;fallDistance=Math.max(0,peak-landing);}
 return{feet:next,velocity,airborne,landed,fallPeak:airborne?peak:null,fallDistance};
}
export function verticalOverlap(feet,height,bottom=0,top=Infinity){return feet<top-.025&&feet+height>bottom+.025;}
