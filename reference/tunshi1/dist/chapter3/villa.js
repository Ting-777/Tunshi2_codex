import * as THREE from '../vendor/three.module.js';
import {surface} from '../visuals/model-kit.js';
export function buildVilla(k){
 const y=2;k.box(-745.5,y-.14,155,57,.28,48,'#797a6b',false,0,'stone');
 const wing=(x,z,w,d,h)=>{k.box(x,y+h/2,z,w,h,d,'#aeb0a0',true,0,'stone');k.box(x,y+h+.23,z,w+1.8,.46,d+1.8,'#515958');
  for(const side of[-1,1])for(let i=0;i<Math.floor(w/5);i++)for(const fy of[3.3,7.7]){const xx=x-w/2+2.5+i*5,zz=z+side*(d/2+.08);k.box(xx,y+fy,zz,3.8,2.7,.14,'#243c40');for(const t of[-1.9,0,1.9])k.box(xx+t,y+fy,zz+side*.1,.09,2.9,.16,'#5b5a4f');k.box(xx,y+fy-1.5,zz+side*.18,4.2,.2,.48,'#ddd8c5');}
  for(const s of[-1,1])for(const zside of[-1,1])k.box(x+s*(w/2-.7),y+h/2,z+zside*d/2,1.4,h,.45,'#dedcc9');
 };
 wing(-751,155,45,37,10.5);wing(-783,151,18,33,7);wing(-717,154,19,31,7.6);
 k.box(-751,y+3,136.3,5,5.9,.24,'#493e34');for(const s of[-1,1]){k.box(-751+s*2.8,y+3.1,136.06,.36,6.2,.45,'#d4cdb7');k.beam([-751+s*.4,y+2.8,135.96],[-751+s*.4,y+3.3,135.96],.06,'#c3a875');k.box(-751+s*4.7,y+2.3,131,.5,4.6,.5,'#62665b',true);}
 k.box(-751,y+4.8,133,13,.55,8,'#777f75');k.box(-751,y+.12,131,14,.24,9,'#c2bdab',false);k.box(-751,y+.23,128,10,.22,1.7,'#c2bdab',true);
 // Independent perimeter, open vehicle gate, side passage, closed building.
 const wall=(x,z,w,d)=>{k.box(x,y+1.6,z,w,3.2,d,'#898e7f',true,0,'stone');k.box(x,y+3.25,z,w+.3,.2,d+.3,'#c9c4b1');};
 wall(-781,73,48,1);wall(-715,73,38,1);wall(-805,143,1,142);wall(-751,214,109,1);wall(-696,166,1,94);wall(-696,90,1,26);
 // Gate is physically hinged open beside its piers.
 for(const x of[-759,-735]){k.soft(x,y+2.1,74,2.2,4.2,2.4,'#b4b39e',true);k.soft(x,y+4.3,74,2.6,.35,2.8,'#d2ccbb');}
 for(const s of[-1,1]){const xx=-747+s*12;for(let j=0;j<=12;j++)k.beam([xx,y+.2,75+j*.8],[xx,y+3,75+j*.8],.06,'#394744');for(const h of[.5,2.75])k.beam([xx,y+h,75],[xx,y+h,84.6],.07,'#596353');}
 k.sign('仙人别墅',-780,75,y,13);
 // Forecourt paving, vehicle cover, planters and traversable side lanes.
 // Paving and planting frame the ramp opening instead of covering its descent.
 for(const [x,z,w,d]of[[-747,94,105,34],[-795.8,120,7.4,18],[-736.25,120,83.5,18],[-798.3,132.5,12.4,25],[-773,132.5,10,7]])k.box(x,y-.05,z,w,.1,d,'#999d91',false,0,'stone');
 for(let i=0;i<9;i++){const x=-781+i*9,ramp=x>-792&&x<-778;k.box(x,y+.015,ramp?96:101,.12,.03,ramp?28:39,'#707a71');}
 for(const x of[-773,-724]){k.soft(x,y+.5,118,9,1,3,'#6b7963',true);k.box(x,y+1.03,118,7,.12,2,'#3a5d42');}
 for(const x of[-779,-724])k.bench(x,102,y);
 for(const x of[-796,-690]){k.lamp(x,105,y);k.lamp(x,192,y);}
 k.box(-751,y+.14,191,66,.28,25,'#c1bda7',false,0,'stone');k.rail([-783,203],[-719,203],2.28,2.28);k.bench(-776,195,2.28);k.bench(-727,195,2.28);
 k.box(-751,y+.02,190,24,.04,10,'#8b998d');k.box(-751,y+.35,184.7,25,.7,.45,'#aeb9a6',true);k.box(-751,y+.35,195.3,25,.7,.45,'#aeb9a6',true);for(const x of[-763.4,-738.6])k.box(x,y+.35,190,.45,.7,10,'#aeb9a6',true);
 const pool=new THREE.Mesh(new THREE.PlaneGeometry(24,10),new THREE.MeshStandardMaterial({color:'#668b86',metalness:.4,roughness:.16}));pool.rotation.x=-Math.PI/2;pool.position.set(-751,2.48,190);k.root.add(pool);
 // Only exterior descending ramp exists; the shutter is a physical closed end.
 const p=[[-791,2,111],[-779,2,111],[-791,-3,141],[-779,-3,141],[-791,-3,143],[-779,-3,143]],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.flat(),3));g.setIndex([0,2,1,1,2,3,2,4,3,3,4,5]);g.computeVertexNormals();k.mesh(g,surface('#636b66','stone'),'external-garage-ramp');
 for(const x of[-791.6,-778.4]){k.box(x,.25,126,1,5.5,30,'#8b9386',true,0,'stone');k.box(x,3.15,126,1.25,.2,30,'#b9bcaa');}
 const shutter=new THREE.Group();shutter.position.set(-785,-3,143);k.root.add(shutter);
 k.api.box(12,6.2,1,'#3a4544',shutter,0,3.1,0);for(let i=0;i<19;i++)k.api.box(11.4,.09,.13,'#84918a',shutter,0,.25+i*.3,-.6);
 const shutterCollider={x:-785,z:143,w:12,d:1,bottom:-3,top:3.2};k.solids.push(shutterCollider);
 k.api.label('车库',3,.7,'#404c45','#d9dcc7',k.root,-785,2.5,142.2).rotation.y=Math.PI;
 return{shutter,shutterCollider,exteriorAreas:{front:[-747,99],west:[-796,155],rear:[-775,191],east:[-702,180],garage:[-785,139]},futureEntrances:[{id:'villa-front',at:[-751,135],closed:true},{id:'villa-garage',at:[-785,142],closed:true},{id:'villa-rear',at:[-751,174],closed:true}]};
}
