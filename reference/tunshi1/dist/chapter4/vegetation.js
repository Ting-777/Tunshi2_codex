import * as THREE from '../vendor/three.module.js';
import {cityMaterial} from './materials.js';

const crowns=new Map(),leafMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide});
function crownGeometry(seed){
 if(crowns.has(seed))return crowns.get(seed);
 let state=seed+731;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;},vertices=[],colors=[];
 const shades=['#425f43','#5a7350','#74845c','#4d674b'].map(c=>new THREE.Color(c));
 // Solid leaf silhouettes avoid alpha overdraw. Several branch clusters give
 // the canopy an irregular edge without using large green spheres.
 for(let i=0;i<680;i++){
  const cluster=i%11,theta=cluster/11*Math.PI*2,r=cluster%3===0?.55:1.6,cx=Math.cos(theta)*r,cz=Math.sin(theta)*r,cy=4.65+(cluster%3)*.65;
  const az=random()*Math.PI*2,rr=Math.sqrt(random())*1.25,x=cx+Math.cos(az)*rr,z=cz+Math.sin(az)*rr,y=cy+(random()-.5)*1.6;
  const a=random()*Math.PI*2,span=.20+random()*.18,len=.32+random()*.25,tilt=(random()-.5)*.45,c=Math.cos(a),s=Math.sin(a),col=shades[i%4];
  const p=[[x-c*len,y-tilt,z-s*len],[x-s*span,y,z+c*span],[x,y+.085,z],[x+c*len,y+tilt,z+s*len],[x+s*span,y,z-c*span]];
  for(const tri of[[0,1,2],[1,3,2],[3,4,2],[4,0,2]])for(const id of tri){vertices.push(...p[id]);colors.push(col.r,col.g,col.b);}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();crowns.set(seed,geo);return geo;
}
export function addCityTree(k,x,z,scale=1){
 const variant=Math.abs(Math.round(x+z))%3,bark=cityMaterial('#746759','wood');
 k.beam([x,0,z],[x+.05*scale,4.7*scale,z],.12*scale,bark);
 for(let i=0;i<11;i++){
  const a=i/11*Math.PI*2,reach=(i%3===0?.6:1.6)*scale,p=[x+Math.cos(a)*reach,(4.65+(i%3)*.65)*scale,z+Math.sin(a)*reach];
  k.beam([x,2.7*scale,z],p,(i%3===0?.035:.047)*scale,bark);
  for(const side of[-1,1])k.beam(p,[p[0]+Math.cos(a+side*.7)*.7*scale,p[1]+.55*scale,p[2]+Math.sin(a+side*.7)*.7*scale],.02*scale,bark);
 }
 const o=new THREE.Object3D();o.position.set(x,0,z);o.rotation.y=variant*.7;o.scale.setScalar(scale);o.updateMatrix();k.batch.add(crownGeometry(variant),leafMaterial,o.matrix);
 k.solids.push({x,z,w:.5*scale,d:.5*scale,bottom:0,top:3*scale,walkable:false});
}
