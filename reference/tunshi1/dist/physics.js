// Contact normals always point from B toward A. Cars use their rotated footprint.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const axes=b=>{let c=Math.cos(b.angle||0),s=Math.sin(b.angle||0);return[{x:c,z:-s},{x:s,z:c}];};
export function contact(a,b){
  if(a.r!=null&&b.r!=null){let dx=a.x-b.x,dz=a.z-b.z,d=Math.hypot(dx,dz),depth=a.r+b.r-d;return depth>0?{x:d?dx/d:1,z:d?dz/d:0,depth}:null;}
  if(a.r==null&&b.r!=null){let c=contact(b,a);return c?{x:-c.x,z:-c.z,depth:c.depth}:null;}
  if(a.r!=null){let [u,v]=axes(b),dx=a.x-b.x,dz=a.z-b.z,lx=dx*u.x+dz*u.z,lz=dx*v.x+dz*v.z;
    let qx=clamp(lx,-b.hx,b.hx),qz=clamp(lz,-b.hz,b.hz),nx=lx-qx,nz=lz-qz,d=Math.hypot(nx,nz),depth;
    if(d>0){depth=a.r-d;if(depth<=0)return null;nx/=d;nz/=d;}else{let ex=b.hx-Math.abs(lx),ez=b.hz-Math.abs(lz);if(ex<ez){nx=lx>=0?1:-1;nz=0;depth=a.r+ex;}else{nx=0;nz=lz>=0?1:-1;depth=a.r+ez;}}
    return{x:u.x*nx+v.x*nz,z:u.z*nx+v.z*nz,depth};
  }
  let aa=axes(a),bb=axes(b),dx=a.x-b.x,dz=a.z-b.z,best=null;
  for(let n of [...aa,...bb]){let ra=a.hx*Math.abs(n.x*aa[0].x+n.z*aa[0].z)+a.hz*Math.abs(n.x*aa[1].x+n.z*aa[1].z),rb=b.hx*Math.abs(n.x*bb[0].x+n.z*bb[0].z)+b.hz*Math.abs(n.x*bb[1].x+n.z*bb[1].z),dot=dx*n.x+dz*n.z,depth=ra+rb-Math.abs(dot);if(depth<=0)return null;if(!best||depth<best.depth){let s=dot>=0?1:-1;best={x:n.x*s,z:n.z*s,depth};}}
  return best;
}
// Segment intersection returns the first surface touched, never a target behind it.
export function rayHit(origin,dir,shape,maxDistance){
  if(shape.r!=null){let dx=origin.x-shape.x,dz=origin.z-shape.z,b=dx*dir.x+dz*dir.z,c=dx*dx+dz*dz-shape.r*shape.r,disc=b*b-c;if(disc<0)return null;let d=Math.max(0,-b-Math.sqrt(disc));return d<=maxDistance&&(-b+Math.sqrt(disc))>=0?d:null;}
  let [u,v]=axes(shape),dx=origin.x-shape.x,dz=origin.z-shape.z,lo=0,hi=maxDistance;
  for(let [axis,extent] of [[u,shape.hx],[v,shape.hz]]){let p=dx*axis.x+dz*axis.z,d=dir.x*axis.x+dir.z*axis.z;if(Math.abs(d)<1e-9){if(Math.abs(p)>extent)return null;}else{let a=(-extent-p)/d,b=(extent-p)/d;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return null;}}
  return lo;
}
