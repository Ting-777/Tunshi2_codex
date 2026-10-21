import * as THREE from '../vendor/three.module.js';
import {ExteriorKit} from '../chapter3/scene-kit.js';
import {roundedBox} from '../visuals/model-kit.js';
import {cityMaterial,cityGlass} from './materials.js';
import {buildStreetFacade} from './facades.js';
import {addCityTree} from './vegetation.js';
const signMaterials=new Map(),signPlane=new THREE.PlaneGeometry(1,1);signPlane.userData.citySign=true;
export class UrbanKit extends ExteriorKit{
 constructor(root,api){super(root,api);this.neon=[];this.glass=cityGlass(true);this.trim=cityMaterial('#c8c8c2','stone');this.lightAnchors=[];}
 box(x,y,z,w,h,d,color,solid=false,angle=0,finish){super.box(x,y,z,w,h,d,typeof color==='string'?cityMaterial(color,finish||'plaster'):color,solid,angle);}
 beam(a,b,r,color){super.beam(a,b,r,typeof color==='string'?cityMaterial(color,'metal'):color);}
 roundedOriented(w,h,d,color,matrix,r=.04){this.batch.add(roundedBox(w,h,d,r),typeof color==='string'?cityMaterial(color):color,matrix);}
 text(text,x,y,z,w,h=.9,bg='#394b4c',fg='#fff1d2',angle=0){
  const key=[text,w,h,bg,fg].join('|');let mat=signMaterials.get(key);
  if(!mat){const canvas=document.createElement('canvas');canvas.width=Math.min(1024,Math.max(128,Math.ceil(w*40)));canvas.height=Math.min(512,Math.max(64,Math.ceil(h*56)));const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';const lines=text.includes('\n')?text.split('\n'):h>w*2.2?[...text]:[text],lineHeight=canvas.height/lines.length;ctx.font=`700 ${Math.round(Math.min(lineHeight*.74,canvas.width*.77))}px "Microsoft YaHei",sans-serif`;lines.forEach((t,i)=>ctx.fillText(t,canvas.width/2,lineHeight*(i+.5),canvas.width*.93));const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;mat=new THREE.MeshStandardMaterial({map,emissiveMap:map,emissive:'#ffffff',emissiveIntensity:.08,roughness:.65});signMaterials.set(key,mat);}
  this.nightMaterials.push(mat);const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;g.userData.caption=text;this.root.add(g);const o=new THREE.Object3D();o.position.set(x+Math.sin(angle)*.06,y,z+Math.cos(angle)*.06);o.rotation.y=angle;o.scale.set(w,h,1);o.updateMatrix();this.batch.add(signPlane,mat,o.matrix);return g;
 }
 glow(color){let m=this.neon.find(m=>m.color.getHexString()===new THREE.Color(color).getHexString());if(!m){m=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.08,roughness:.35});this.neon.push(m);this.nightMaterials.push(m);}return m;}
 sign(text,x,z,y=0,w=8,angle=0){
  this.box(x,y+2.7,z,w,.95,.22,cityMaterial('#3f5148','metal'),false,angle);
  for(const side of[-1,1]){const px=x+Math.cos(angle)*side*w*.36,pz=z-Math.sin(angle)*side*w*.36;this.beam([px,y,pz],[px,y+2.7,pz],.065,cityMaterial('#5b6559','metal'));this.text(text,x+Math.sin(angle)*side*.125,y+2.7,z+Math.cos(angle)*side*.125,w-.28,.68,'#3f5148','#eee8cd',angle+(side<0?Math.PI:0));}
 }
 tree(x,z,scale=1){addCityTree(this,x,z,scale);}
 facade(s){return buildStreetFacade(this,s);}
 lamp(x,z,y=0){
  const metal=cityMaterial('#596368','metal');this.beam([x,y,z],[x,y+6.7,z],.095,metal);this.rounded(.43,.3,.43,metal,x,y+.15,z);
  for(const side of[-1,1]){this.beam([x,y+5.8,z],[x+side*.65,y+6.45,z],.06,metal);this.beam([x+side*.65,y+6.45,z],[x+side*1.1,y+6.45,z],.06,metal);this.rounded(.73,.16,.55,metal,x+side*1.08,y+6.41,z);this.box(x+side*1.08,y+6.3,z,.62,.07,.43,this.glow('#e8d2ae'));}
  this.lightAnchors.push({x,y:y+5.7,z,color:'#ffdfb1',strength:32});
 }
 planter(x,z,w=3,d=2){
  const stone=cityMaterial('#a7aaa5','stone');this.rounded(w,.7,d,stone,x,.35,z);this.box(x,.71,z,w-.3,.06,d-.3,'#454738');
  for(let i=0;i<8;i++){const xx=x+Math.sin(i*5.1)*(w-.55)/2,zz=z+Math.cos(i*3.9)*(d-.55)/2;this.rounded(.75,.65,.7,i%2?'#4d6450':'#65765b',xx,.99,zz);}
  this.solids.push({x,z,w,d,bottom:0,top:.75,walkable:true});
 }

 stairs(x,z,w,run,rise,angle=0,floor=0){const count=Math.ceil(Math.abs(rise)/.18),c=Math.cos(angle),s=Math.sin(angle);for(let i=0;i<count;i++){const f=(i+.5)/count,zz=run*f,y=floor+rise*(i+1)/count;this.box(x+s*zz,y-.1,z+c*zz,w,.2,run/count,'#bdb7a9',false,angle,'stone');for(const side of[-1,1]){const px=x+c*side*(w/2+.1)+s*zz,pz=z-s*side*(w/2+.1)+c*zz;this.beam([px,y,pz],[px,y+1,pz],.035,'#758187');if(i>0){const last=run*(i-.5)/count,ly=floor+rise*i/count;this.beam([x+c*side*(w/2+.1)+s*last,ly+1,z-s*side*(w/2+.1)+c*last],[px,y+1,pz],.055,'#758187');}}}return count;}
 rounded(w,h,d,col,x,y,z){const o=new THREE.Object3D();o.position.set(x,y,z);o.updateMatrix();this.batch.add(roundedBox(w,h,d),typeof col==='string'?cityMaterial(col):col,o.matrix);}
 finish(){super.finish();for(const m of this.root.children)if(m.isInstancedMesh&&m.geometry.userData.citySign)m.castShadow=m.receiveShadow=false;}
}
export function indexColliders(solids,heightAt){const grid=new Map(),rotations=new WeakMap();for(const b of solids){rotations.set(b,{c:Math.cos(b.angle||0),s:Math.sin(b.angle||0)});const r=Math.hypot(b.w,b.d)/2;for(let x=Math.floor((b.x-r)/24);x<=Math.floor((b.x+r)/24);x++)for(let z=Math.floor((b.z-r)/24);z<=Math.floor((b.z+r)/24);z++){const key=x+','+z;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(b);}}
 const nearby=(x,z,r=4)=>{const result=new Set();for(let i=Math.floor((x-r)/24);i<=Math.floor((x+r)/24);i++)for(let j=Math.floor((z-r)/24);j<=Math.floor((z+r)/24);j++)for(const b of grid.get(i+','+j)||[])if(!b.disabled)result.add(b);return result;};
 // Intersect each oriented wall once. Sampling every wall every 20 cm made
 // crowded shop corners expensive and could miss very thin glass/railings.
 const cameraClip=(o,d,length)=>{let limit=length;for(const b of nearby(o.x,o.z,length+1)){const hit=rayBoxEntry(o,d,b,rotations.get(b),length);if(hit!==null)limit=Math.min(limit,Math.max(1.3,hit-.3));}for(let t=1.3;t<limit;t+=.2)if(o.y+d.y*t<heightAt(o.x+d.x*t,o.z+d.z*t)+.25)return Math.max(1.3,t-.3);return limit;};return{nearby,cameraClip};}
function rayBoxEntry(o,d,b,{c,s},length){
 const dx=o.x-b.x,dz=o.z-b.z;let near=1.3,far=length;
 const axis=(p,v,lo,hi)=>{if(Math.abs(v)<1e-9)return p>=lo&&p<=hi;const a=(lo-p)/v,q=(hi-p)/v;near=Math.max(near,Math.min(a,q));far=Math.min(far,Math.max(a,q));return near<=far;};
 if(!axis(dx*c-dz*s,d.x*c-d.z*s,-b.w/2-.15,b.w/2+.15)||!axis(dx*s+dz*c,d.x*s+d.z*c,-b.d/2-.15,b.d/2+.15)||!axis(o.y,d.y,b.bottom??-Infinity,b.top??Infinity))return null;
 return near;
}
