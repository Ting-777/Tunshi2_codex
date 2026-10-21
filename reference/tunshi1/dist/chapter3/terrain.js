import * as THREE from '../vendor/three.module.js';
import {bounds,land,lake,islands,lakeBridges,roads,trails,platforms} from './layout.js';
import {surface} from '../visuals/model-kit.js';
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
export function inside(x,z,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
export function project(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(len*len||1),0,1);return{d:Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t),t,len,x:a[0]+dx*t,z:a[1]+dz*t};}
export function routeSample(x,z,r){let best=null;for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],q=project(x,z,a,b);if(best&&q.d>=best.d)continue;const rise=b[2]-a[2],count=Math.max(1,Math.ceil(Math.abs(rise)/.19)),flat=Math.min(4,q.len*.25),progress=clamp((q.t*q.len-flat)/(q.len-flat*2||1),0,1),t=r.steps?Math.floor(progress*count+1e-7)/count:progress;best={...q,y:lerp(a[2],b[2],t),segment:i,a,b,count};}return best;}
export function makeTerrain(root){
 const spacing=4,nx=Math.ceil((bounds.maxX-bounds.minX)/spacing),nz=Math.ceil((bounds.maxZ-bounds.minZ)/spacing),sx=(bounds.maxX-bounds.minX)/nx,sz=(bounds.maxZ-bounds.minZ)/nz;
 const grid=new Float32Array((nx+1)*(nz+1));
 function raw(x,z){
  let h=2+137*Math.exp(-(((x-277)/213)**2+((z-152)/201)**2))+41*Math.exp(-(((x-455)/174)**2+((z-58)/226)**2));
  h+=Math.sin(x*.033)*Math.cos(z*.027)*Math.min(5,Math.max(0,h-7)*.065);
  if(x<50)h=2+Math.max(0,h-2)*clamp((x+20)/70,0,1);
  for(const [,ps,w]of roads)for(let i=1;i<ps.length;i++){const q=project(x,z,ps[i-1],ps[i]);if(q.d<w/2+15){const y=roadHeight(q.x,q.z);h=lerp(h,y,1-clamp((q.d-w/2-2)/13,0,1));}}
  for(const p of platforms){const d=Math.max(Math.abs(x-p.x)-p.w/2,Math.abs(z-p.z)-p.d/2);if(d<14)h=lerp(h,p.y-.1,1-clamp(d/14,0,1));}
  let best=null;for(const r of trails){const q=routeSample(x,z,r);const alpha=1-clamp((q.d-r.width/2-3)/18,0,1);if(alpha>0&&(!best||alpha>best.alpha+.0001||Math.abs(alpha-best.alpha)<.0001&&q.d<best.d))best={alpha,d:q.d,y:q.y};}if(best)h=lerp(h,best.y-.5,best.alpha);
  // The external garage ramp cuts the visible ground, not just its support API.
  if(x>-793&&x<-777&&z>107&&z<147)h=2-5*clamp((z-111)/30,0,1)-.35;
  if(inside(x,z,lake))h=-3;return h;
 }
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)grid[j*(nx+1)+i]=raw(bounds.minX+i*sx,bounds.minZ+j*sz);
 const geo=new THREE.PlaneGeometry(bounds.maxX-bounds.minX,bounds.maxZ-bounds.minZ,nx,nz);geo.rotateX(-Math.PI/2);geo.translate((bounds.minX+bounds.maxX)/2,0,(bounds.minZ+bounds.maxZ)/2);const pos=geo.attributes.position,colors=[];
 for(let i=0;i<pos.count;i++){pos.setY(i,grid[i]);const h=grid[i],v=.92+.08*Math.sin(pos.getX(i)*.5+pos.getZ(i)*.73),col=new THREE.Color(h>105?'#69725c':h>15?'#657354':'#78896b').multiplyScalar(v);colors.push(col.r,col.g,col.b);}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mat=surface('#d7d4b8','stone').clone();mat.vertexColors=true;mat.roughness=.97;mat.bumpScale=.07;mat.map=mat.map.clone();mat.map.repeat.set(180,95);mat.bumpMap=mat.map;const mesh=new THREE.Mesh(geo,mat);mesh.receiveShadow=true;mesh.name='yuelu-heightfield';root.add(mesh);
 function triangleHeight(x,z){const gx=clamp((x-bounds.minX)/sx,0,nx-.000001),gz=clamp((z-bounds.minZ)/sz,0,nz-.000001),i=Math.floor(gx),j=Math.floor(gz),u=gx-i,v=gz-j,a=grid[j*(nx+1)+i],b=grid[(j+1)*(nx+1)+i],c=grid[j*(nx+1)+i+1],d=grid[(j+1)*(nx+1)+i+1];return u+v<=1?a+(c-a)*u+(b-a)*v:d+(b-d)*(1-u)+(c-d)*(1-v);}
 function heightAt(x,z){
  const garage=garageHeight(x,z);if(garage!==null)return garage;
  if(x>-784&&x<-718&&z>178.5&&z<203.5)return 2.28;
  for(const p of platforms)if(Math.abs(x-p.x)<=p.w/2&&Math.abs(z-p.z)<=p.d/2)return p.y;
  if(islands.some(poly=>inside(x,z,poly)))return 2.1;
  for(const bridge of lakeBridges)for(let i=1;i<bridge.length;i++)if(project(x,z,bridge[i-1],bridge[i]).d<2.5)return 2.1;
  let closest=null;for(const r of trails){const q=routeSample(x,z,r);if(q.d<=r.width/2+(r.id==='academy-approach'?0:.12)&&(!closest||q.d<closest.d))closest=q;}if(closest)return closest.y;
  for(const [name,ps,w]of roads)for(let i=1;i<ps.length;i++){
   const a=ps[i-1],b=ps[i],q=project(x,z,a,b);
   // The academy road ends at a rectangular sidewalk, not an invisible round
   // landing beyond its endpoint. The visible stone connector joins the stairs.
   if(name==='书院街'&&z>275){const along=((x-a[0])*(b[0]-a[0])+(z-a[1])*(b[1]-a[1]))/q.len;if(along<0||along>q.len)continue;if(q.d<=w/2+2.5)return roadHeight(x,z);}
   else if(q.d<=w/2+3)return roadHeight(x,z);
  }
  return triangleHeight(x,z);
 }
 function contains(x,z){if(!inside(x,z,land))return false;if(!inside(x,z,lake)||islands.some(poly=>inside(x,z,poly)))return true;return lakeBridges.some(bridge=>bridge.slice(1).some((b,i)=>project(x,z,bridge[i],b).d<=2.45));}
 const motorDistance=(x,z)=>Math.min(...roads.flatMap(([,ps,w])=>ps.slice(1).map((b,i)=>project(x,z,ps[i],b).d-w/2)));
 function canDrive(x,z){if(!contains(x,z))return false;if(garageHeight(x,z)!==null)return true;return motorDistance(x,z)<4||heightAt(x,z)<11&&Math.hypot(heightAt(x+.5,z)-heightAt(x-.5,z),heightAt(x,z+.5)-heightAt(x,z-.5))<.45;}
 return{mesh,heightAt,triangleHeight,contains,canDrive,motorDistance};
}
export function roadHeight(x,z){if(x>598&&x<705&&z>120&&z<210)return 2+5*clamp((z-120)/48,0,1);if(x>685&&z>248)return 2+4*clamp((z-248)/32,0,1);return 2;}
export function garageHeight(x,z){return x>-791&&x<-779&&z>=111&&z<=143?2-5*clamp((z-111)/30,0,1):null;}
