import * as THREE from '../vendor/three.module.js';
import {cityMaterial,cityGlass} from './materials.js';

export function dressCityInterior(k,r,type){
 const x=r.ox,floor=r.minFloor||0,h=r.height-floor,w=r.w,d=r.d,wood=cityMaterial('#998570','wood'),trim=cityMaterial('#a9aba5','metal'),stone=cityMaterial('#e0ded6','stone');
 for(const side of[-1,1]){k.box(x+side*(w/2-.23),floor+.15,0,.1,.3,d-.5,stone);k.box(x+side*(w/2-.35),r.height-.36,0,.25,.3,d-.5,trim);}
 for(const side of[-1,1])for(const xx of[-w/4,w/4])k.box(x+xx,floor+.15,side*(d/2-.22),w/2-5,.3,.1,stone);
 for(const side of[-1,1]){k.box(x+side*2.55,floor+2.1,d/2-.25,.11,4.2,.35,trim);k.box(x+side*1.92,floor+1.2,d/2-.34,.05,.55,.15,trim);}
 if(type==='parking'){
  for(const zz of[-20,0,20]){k.box(x,r.height-.4,zz,w-.5,.38,.4,'#7e8987');k.beam([x-w/2+1,r.height-.8,zz],[x+w/2-1,r.height-.8,zz],.065,'#7a6657');}
  for(const side of[-1,1]){k.box(x+side*(w/2-.22),floor+1,0,.08,.24,d-1,'#8eaa9f');k.text(side<0?'B1 · A 区':'B1 · B 区',x+side*(w/2-.15),floor+2.8,-12,8,1.2,'#5c706c','#f0eee1',side<0?Math.PI/2:-Math.PI/2);}
  r.g.userData.interiorDetail='structural-beams-service-pipes-parking-zones';return;
 }
 const mall=type==='clothing'||type==='ifs';
 if(mall){
  for(const y of[0,5.3,10.6])for(const side of[-1,1]){
   const wall=x+side*(w/2-.26);k.box(wall,y+1.65,0,.09,3.3,d-1,wood);
   for(let z=-d/2+3;z<d/2-2;z+=2.5){k.box(wall-side*.12,y+2.1,z,.12,3.3,.055,trim);k.box(wall-side*.23,y+3.8,z,.16,.08,.7,k.glow('#ead5b4'));}
  }
  for(const side of[-1,1])for(const z of[-16,16]){
   k.box(x+side*(w/2-2),r.height/2,z,.45,r.height,.45,stone);
   for(const y of[5.3,10.6])k.box(x+side*(w/2-1),y-.35,z,1.1,.7,1.1,stone);
  }
  if(type==='clothing'){
   // Display shirts and folds are visibly attached to shelving, including the
   // previously empty rear wall above the fitting rooms.
   for(const y of[0,5.3,10.6])for(const side of[-1,1])for(const zz of[-10,0,10]){
    const xx=x+side*(w/2-1.05);k.box(xx,y+1.45,zz,1.2,.1,2.2,wood);
    for(let stack=0;stack<4;stack++)for(let layer=0;layer<3;layer++)k.rounded(.8,.10,.43,cityMaterial(['#d5c4a5','#728594','#98776f','#788370'][stack],'fabric'),xx,y+1.55+layer*.11,zz-.8+stack*.52);
   }
   for(const y of[0,5.3,10.6])for(const xx of[-27,27])for(const z of[-19.3]){
    k.box(x+xx,y+3.17,z,5.6,.12,.22,trim);
    for(let panel=-2.1;panel<=2.1;panel+=.2)k.rounded(.14,2.7,.13,panel% .4===0?'#b3aaa0':'#cbc2b7',x+xx+panel,y+1.48,z-.04);
   }
   for(const side of[-1,1]){k.box(x+side*30,1.8,12,.15,3.3,2.2,trim);k.box(x+side*29.9,1.8,12,.02,3.1,2,cityGlass(false));}
   r.g.userData.interiorDetail='clothing-silhouettes-hangers-folded-stock-curtains';
  }else{
   // Oval gallery guardrails follow the actual gallery opening at each floor.
   for(const y of[5.3,10.6]){
    // Both arcs leave broad gaps at the actual escalator landings. Their thin
    // collision rails follow the visible ellipse, not a hidden rectangle.
    for(const start of[2.06,Math.PI+2.06]){
     const points=Array.from({length:33},(_,i)=>new THREE.Vector3(x+Math.cos(start+i/32*(Math.PI-1.04))*15,y+1.15,Math.sin(start+i/32*(Math.PI-1.04))*11));
     const rail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.055,6,false),trim);rail.name='ifs-oval-gallery-handrail';k.root.add(rail);
     for(let i=1;i<points.length;i+=2){const p=points[i],q=points[i-1],len=p.distanceTo(q);k.beam([p.x,y,p.z],[p.x,y+1.1,p.z],.02,trim);k.solids.push({x:(p.x+q.x)/2,z:(p.z+q.z)/2,w:.12,d:len+.04,angle:Math.atan2(p.x-q.x,p.z-q.z),bottom:y,top:y+1.2,walkable:false});}
    }
   }
   r.g.userData.interiorDetail='oval-gallery-rails-timber-shops-structural-columns';
  }
 }else{
  const night=['bar','ktv','arcade','net'].includes(type),panel=night?cityMaterial('#3d3a42','wood'):wood;
  for(const side of[-1,1])for(let z=-d/2+1;z<d/2-1;z+=.38)k.box(x+side*(w/2-.29),floor+1.35,z,.08,2.5,.11,panel);
  for(const xx of[-w/4,w/4])for(const zz of[-d/4,d/4]){
   k.beam([x+xx,r.height-.22,zz],[x+xx,r.height-1.55,zz],.018,trim);
   const shade=new THREE.Mesh(new THREE.ConeGeometry(.42,.55,16,1,true),cityMaterial(night?'#4d5356':'#b8a78c','metal'));shade.position.set(x+xx,r.height-1.32,zz);shade.name='c4-pendant-lampshade';k.root.add(shade);k.box(x+xx,r.height-1.57,zz,.34,.04,.34,k.glow('#f1d7b1'));
  }
  r.g.userData.interiorDetail='timber-wall-panels-framed-doors-pendant-fixtures';
 }
}
