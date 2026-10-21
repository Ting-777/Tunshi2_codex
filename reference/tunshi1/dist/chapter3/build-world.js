import * as THREE from '../vendor/three.module.js';
import {YUELU,bounds,land,lake,islands,roads,trails,walks,places} from './layout.js';
import {makeTerrain} from './terrain.js';
import {ExteriorKit} from './scene-kit.js';
import {buildMountainLandmarks,buildArtsCentre} from './landmarks.js';
import {buildVilla} from './villa.js';
import {buildStreets} from './streets.js';
import {buildEnvironment} from './environment.js';
import {buildVending} from './vending.js';
export function buildChapter3(api){
 const root=new THREE.Group();root.name=YUELU;root.visible=false;api.scene.add(root);const terrain=makeTerrain(root),k=new ExteriorKit(root,api);
 buildStreets(k,terrain);buildMountainLandmarks(k);buildArtsCentre(k);const villa=buildVilla(k),environment=buildEnvironment(k,terrain),vendingMachines=buildVending(k,terrain);k.finish();
 const features=roads.map(([name,points,w])=>({tags:{highway:'primary',name},points}));features.push(...trails.map(r=>({tags:{highway:r.steps?'steps':'path',name:r.name},points:r.points.map(p=>p.slice(0,2))})),...walks.map(([name,points])=>({tags:{highway:'footway',name},points})));
 for(const p of places.filter(p=>['yuelu_academy','lushan_temple','meixi_arts','xianren_villa'].includes(p.id))){const sz=p.id==='meixi_arts'?25:15;features.push({tags:{building:'yes'},points:[[p.entry[0]-sz,p.entry[1]+8],[p.entry[0]+sz,p.entry[1]+8],[p.entry[0]+sz,p.entry[1]+30],[p.entry[0]-sz,p.entry[1]+30]]});}
 const grid=new Map();function indexSolid(b){const r=Math.hypot(b.w,b.d)/2;for(let i=Math.floor((b.x-r)/24);i<=Math.floor((b.x+r)/24);i++)for(let j=Math.floor((b.z-r)/24);j<=Math.floor((b.z+r)/24);j++){const key=i+','+j;let list=grid.get(key);if(!list){list=[];grid.set(key,list);}list.push(b);}}
 for(const b of k.solids)indexSolid(b);
 villa.addSolid=b=>{k.solids.push(b);indexSolid(b);return b;};
 function nearby(x,z,r=4){const result=new Set();for(let i=Math.floor((x-r)/24);i<=Math.floor((x+r)/24);i++)for(let j=Math.floor((z-r)/24);j<=Math.floor((z+r)/24);j++)for(const b of grid.get(i+','+j)||[])if(!b.disabled)result.add(b);return result;}
 // Sample the same local support field/colliders instead of ray-testing the
 // entire mountain's 170,000 triangles each frame, including on phones.
 function cameraClip(origin,direction,length){const boxes=[...nearby(origin.x,origin.z,length+1)];for(let t=1.3;t<length;t+=.22){const x=origin.x+direction.x*t,z=origin.z+direction.z*t,y=origin.y+direction.y*t;if(y<terrain.heightAt(x,z)+.3)return Math.max(1.3,t-.3);for(const b of boxes){if(y<b.bottom||y>b.top)continue;const dx=x-b.x,dz=z-b.z,c=Math.cos(b.angle||0),s=Math.sin(b.angle||0);if(Math.abs(dx*c-dz*s)<b.w/2+.15&&Math.abs(dx*s+dz*c)<b.d/2+.15)return Math.max(1.3,t-.3);}}return length;}
 const contours=[];for(let level=25;level<=150;level+=25)for(let x=32;x<752;x+=16)for(let z=-160;z<432;z+=16){const ps=[[x,z],[x+16,z],[x+16,z+16],[x,z+16]],hits=[];for(let i=0;i<4;i++){const a=ps[i],b=ps[(i+1)%4],ha=terrain.triangleHeight(...a),hb=terrain.triangleHeight(...b);if((ha<level)===(hb<level))continue;const f=(level-ha)/(hb-ha);hits.push([THREE.MathUtils.lerp(a[0],b[0],f),THREE.MathUtils.lerp(a[1],b[1],f)]);}if(hits.length===2)contours.push({level,points:hits});}
 return{id:YUELU,root,name:'岳麓山—梅溪湖',scale:1,bounds,land,lakes:[lake],islands,contours,cameraClip,terrain,contains:terrain.contains,heightAt:terrain.heightAt,canDrive:terrain.canDrive,nearby,mapOnly:true,nightMaterials:k.nightMaterials,solids:k.solids,cameraBlocks:k.cameraBlocks,props:k.props,vendingMachines,features,places,roads:[...roads,...trails.map(r=>[r.name,r.points.map(p=>p.slice(0,2)),r.width,'trail']),...walks],trails,pedestrians:[],traffic:[],spawn:[650,-319],safe:[650,-319],parkedVehicles:[{at:[639,185],color:'#e5bb57'},{at:[10,29],color:'#e5bb57'},{at:[715,291],color:'#abb8b0'},{at:[-650,-55],color:'#7d8f9b'},{at:[-680,235],color:'#a99b87'},{at:[-725,98],color:'#394743'}],update:environment.update,...villa};
}
