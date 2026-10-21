import {addStoryScreen} from './story/screens.js';
import * as THREE from '../vendor/three.module.js';
import {cityMaterial,cityGlass,worldTiling} from './materials.js';
import {humanModel} from '../visuals/characters.js';
import {addClothesRack} from './fashion-detail.js';
let dome,perforated;
function local(k,s){const a=s.angle||0,c=Math.cos(a),n=Math.sin(a),pos=(x,z)=>[s.at[0]+c*x+n*z,s.at[1]-n*x+c*z];return{pos,b:(x,y,z,w,h,d,m,solid=false)=>{const p=pos(x,z);k.box(p[0],y,p[1],w,h,d,m,solid,a);},txt:(t,x,y,z,w,h,bg,fg)=>{const p=pos(x,z);k.text(t,p[0],y,p[1],w,h,bg,fg,a);}};}
function sphereBatch(k,x,y,z,sx,sy,sz,mat){dome??=new THREE.SphereGeometry(1,16,12);const o=new THREE.Object3D();o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.updateMatrix();k.batch.add(dome,mat,o.matrix);}
function roofGeometry(radius,rise,sides=8){const pos=[],idx=[];const rings=[[radius,0],[radius*.72,rise*.45],[radius*.36,rise*.83],[.15,rise]];for(const [r,y]of rings)for(let i=0;i<sides;i++){const a=(i+.5)/sides*Math.PI*2;pos.push(Math.cos(a)*r,y+(r===radius?.32:0),Math.sin(a)*r);}for(let ring=0;ring<rings.length-1;ring++)for(let i=0;i<sides;i++){const a=ring*sides+i,b=ring*sides+(i+1)%sides,c=a+sides,d=b+sides;idx.push(a,c,b,b,c,d);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;}
export function addLandmarkDress(k,s,kind){const {b,txt,pos}=local(k,s),metal=cityMaterial('#8b9492','metal');
 if(kind==='fire-palace'){
  const red=cityMaterial('#8b372a','wood'),tile=cityMaterial('#405e59','tile'),gold=cityMaterial('#b99352','metal');
  // A compressed Pozi Street landmark facade, based on the completed 2025
  // photographed red columns, tiered green eaves and lantern identity.
  for(const x of[-s.w/2+1,-10,10,s.w/2-1])b(x,10,-2.65,.55,20,.55,red);
  for(const y of[5.3,11.5,17.7]){
   b(0,y,-2.4,s.w+2,.28,2.8,gold);b(0,y+.25,-2.85,s.w+3,.35,2.9,tile);
   for(const side of[-1,1])for(let t=0;t<5;t++)b(side*(s.w/2+t*.45),y+.4+t*t*.055,-2.6,1,.13,3.2,tile);
   for(let x=-s.w/2;x<=s.w/2;x+=.8){b(x,y-.32,-2.7,.23,.3,2.1,red);b(x,y-.08,-1.65,.06,.08,.22,gold);}
  }
  b(0,12.7,-2.95,12,19,.5,red);txt('火\n宫\n殿',0,13,-2.53,5.8,13,'#8d3526','#e8c27e');
  for(const x of[-8,8])for(let y=5.5;y<21;y+=1.4){const p=pos(x,-2.1);sphereBatch(k,p[0],y,p[1],.49,.58,.49,k.glow('#c57735'));b(x,y-.68,-2.08,.12,.18,.12,gold);}
  txt('坡子街 · 湘味老街',0,3.5,-2.01,25,1.2,'#62402d','#f0d8a7');k.root.userData.landmarkId='c4_fire_palace_facade';
 }else if(kind==='pavilion'){
  const p=pos(0,-s.d/2-3),base=s.h+1;k.box(p[0],base,p[1],18,.3,17,cityMaterial('#b6b3aa','stone'));
  for(const x of[-6,6])for(const z of[-5,5]){const q=pos(x,-s.d/2-3+z);k.beam([q[0],base,q[1]],[q[0],base+4.6,q[1]],.22,cityMaterial('#86413a','wood'));}
  for(const [radius,y,rise]of[[12,base+4.3,3.6],[7.4,base+7.2,2.6]]){const m=new THREE.Mesh(roofGeometry(radius,rise),cityMaterial('#627273','tile'));m.position.set(p[0],y,p[1]);m.castShadow=m.receiveShadow=true;m.name='c4-simenkou-rooftop-pavilion';k.root.add(m);}
  sphereBatch(k,p[0],base+10.2,p[1],.3,.75,.3,metal);
  for(const x of[-6,0,6]){const q=pos(x,-s.d/2-3+s.d*.22);sphereBatch(k,q[0],base+4.05,q[1],.45,.55,.45,k.glow('#b85734'));}
 }else{
  const screenY=Math.max(20,s.h*.57);b(0,screenY,-2.6,s.w-.8,14.4,.55,'#343b3e');const at=pos(0,-2.15);addStoryScreen(k,{x:at[0],z:at[1],y:screenY,w:s.w-2,h:14,angle:s.angle});
  for(let x=-s.w/2+2;x<s.w/2;x+=1.3)b(x,screenY,-1.93,.025,14.2,.015,'#829b9c');
 }
 for(const y of[6.8,11,15]){b(0,y,-2.35,s.w,.14,.44,metal);}
}
export function dressWuyiLandscape(k){
 const paving=cityMaterial('#c0c2bc','granite'),stone=cityMaterial('#9ca39b','stone');
 k.box(60,.07,-966,135,.1,106,paving);
 // Curved planting islands and intersecting walkways replace the raised
 // checkerboard of opaque green slabs. Only planted areas have edging.
 for(const [cx,cz,rx,rz]of[[28,-981,24,20],[98,-977,24,28],[61,-944,15,8]]){
  const curve=new THREE.EllipseCurve(0,0,rx,rz,0,Math.PI*2,false),shape=new THREE.Shape(curve.getPoints(48)),geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);const ground=new THREE.Mesh(geo,cityMaterial('#6b785c'));ground.position.set(cx,.14,cz);ground.name='c4-wuyi-planted-island';k.root.add(ground);
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2,b=(i+1)/48*Math.PI*2;const p=[cx+Math.cos(a)*rx,.19,cz+Math.sin(a)*rz],q=[cx+Math.cos(b)*rx,.19,cz+Math.sin(b)*rz];k.beam(p,q,.09,stone);}
  for(const side of[-1,1])k.tree(cx+side*rx*.45,cz,1.3);
 }
 for(const x of[18,46,80,110]){k.bench(x,-928,0);k.lamp(x,-931);}
 k.text('五一广场',70,3.2,-920,18,1.6,'#445456','#efeadd');
}
export function makeHuangxingStatue(k){
 const stone=cityMaterial('#656863','stone'),bronze=cityMaterial('#716754','metal');bronze.roughness=.56;bronze.metalness=.64;
 k.box(-15,.18,-349,6,.36,5.5,stone,true);k.box(-15,1.23,-349,3.7,1.75,3.2,stone,true);k.box(-15,2.15,-349,4.1,.16,3.6,stone,true);
 for(const side of[-1,1])k.box(-15+side*1.8,1.26,-347.34,.045,1.6,.08,'#333c3d');
 const figure=humanModel('#716754','');figure.g.position.set(-15,2.24,-349);figure.g.scale.setScalar(2.5);figure.g.rotation.y=Math.PI/2;
 figure.g.traverse(o=>{if(o.isMesh)o.material=bronze;});figure.arms[1].rotation.z=-.26;
 // Draped overcoat on the forearm, lapels, seams and buttons, matching the
 // statue's standing suited silhouette rather than an armed mission actor.
 const coat=new THREE.LatheGeometry([new THREE.Vector2(.15,-.92),new THREE.Vector2(.23,-.7),new THREE.Vector2(.2,-.43),new THREE.Vector2(.28,-.05),new THREE.Vector2(.18,.12)],16),m=new THREE.Mesh(coat,bronze);m.position.set(.42,1.31,.035);m.scale.z=.7;figure.g.add(m);
 const shape=new THREE.Shape([new THREE.Vector2(-.23,1.67),new THREE.Vector2(-.04,1.18),new THREE.Vector2(.08,1.44),new THREE.Vector2(.02,1.72)]),lapel=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),bronze);lapel.position.z=.19;figure.g.add(lapel);const other=lapel.clone();other.scale.x=-1;figure.g.add(other);
 figure.g.name='c4-huangxing-bronze-overcoat';k.root.add(figure.g);k.solids.push({x:-15,z:-349,w:4,d:3.6,bottom:0,top:8.1,walkable:false});k.text('黄兴',-15,1.4,-347.32,3.15,.62,'#555d58','#d7c9a5');
}
function perforatedMetal(){
 if(perforated)return perforated;const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#d6d8d5';ctx.fillRect(0,0,256,256);ctx.fillStyle='#838985';for(let x=4;x<256;x+=8)for(let y=4;y<256;y+=8){ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill();}const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;perforated=worldTiling(new THREE.MeshStandardMaterial({color:'#efefeb',map,bumpMap:map,bumpScale:.005,roughness:.52,metalness:.32}),1.8);return perforated;
}
export function dressHeiwado(k,f,s){
 const white=cityMaterial('#e7e5df','stone'),metal=cityMaterial('#acb4b3','metal');
 for(let y=0;y<15;y+=5.3){
  f.b(0,y-.12,-s.d/2-3,s.w,.24,s.d-.5,cityMaterial('#d7c5a6','wood'));f.b(0,y+4.75,-s.d/2-3,s.w,.16,s.d-.5,cityMaterial('#c1b4a2'));
  if(y===0)for(const side of[-1,1])f.b(side*(s.w+8)/4,y+2.45,-3.01,(s.w-8)/2-.25,4.6,.065,k.glass);
  else f.b(0,y+2.45,-3.01,s.w-.45,4.6,.065,k.glass);
  for(let x=-s.w/2+1;x<s.w/2;x+=5.3)if(y||Math.abs(x)>4.1)f.b(x,y+2.45,-2.88,.085,4.7,.14,metal);
  for(const x of[-s.w/2+1,-32,0,32,s.w/2-1])if(y||x)f.b(x,y+2.45,-2.5,1.1,4.8,.6,white);
  f.b(0,y+5.03,-2.48,s.w+1.3,.38,1.3,white);f.b(0,y+4.82,-2.16,s.w,.1,.1,k.glow('#e7cb9a'));
  for(const x of[-36,-24,22,35]){const p=f.pos(x,-8.3);addClothesRack(k,p[0],p[1],y,s.angle,{collision:false});}
  for(const side of[-1,1])for(const z of[-18,-37,-57,-69]){const p=f.pos(side*(s.w/2-3.6),z);addClothesRack(k,p[0],p[1],y,s.angle+Math.PI/2,{collision:false});}
  for(const x of[-42,42]){const p=f.pos(x,-6.5),man=humanModel('#d5cabc','');man.g.position.set(p[0],y+.1,p[1]);man.g.rotation.y=s.angle;man.g.traverse(o=>{if(o.isMesh)o.material=cityMaterial('#d6d1c7');});man.g.name='c4-uniqlo-window-mannequin';k.root.add(man.g);}
 }
 f.b(0,23,-3.1,s.w,14,.4,perforatedMetal());
 for(const side of[-1,1]){f.b(side*(s.w/2+.13),23,-s.d/2-3,.28,14,s.d,perforatedMetal());const p=f.pos(side*(s.w/2+.34),-s.d*.57);k.text('UNI\nQLO',p[0],23,p[1],11.5,11.5,'#d71929','#ffffff',s.angle+side*Math.PI/2);for(const y of[5.03,10.33,15.63])f.b(side*(s.w/2+.3),y,-s.d/2-3,1,.24,s.d,white);}
 // The rounded end wraps with the facade instead of a separate cylinder.
 for(const y of[7.75,23]){const geometry=new THREE.CylinderGeometry(4.5,4.5,y<10?15.5:14,24,1,true,0,Math.PI/2),corner=new THREE.Mesh(geometry,y<10?k.glass:perforatedMetal()),p=f.pos(s.w/2-4.25,-7.3);corner.position.set(p[0],y,p[1]);corner.rotation.y=s.angle;corner.castShadow=corner.receiveShadow=true;corner.name='heiwado-rounded-glass-corner';k.root.add(corner);}
 f.b(s.w/2-11,23,-2.7,13.4,13.4,.28,k.glow('#d71929'));f.txt('UNI\nQLO',s.w/2-11,23,-2.45,12.5,12.5,'#d71929','#ffffff');
 f.b(0,15.9,-2.5,s.w,2.3,.38,'#d9ded9');for(let x=-s.w/2+4;x<s.w/2-9;x+=6.2)f.txt('UNI\nQLO',x,15.9,-2.23,5.8,2,'#ce1b2c','#ffffff');f.txt('LifeWear',s.w/2-11,15.9,-2.22,16,1.4,'#e9e9df','#ba2730');
 for(const x of[-32,0,32]){f.txt('UNI\nQLO',x,3.6,-2.04,1.3,1.3,'#d21c28','#ffffff');}
 f.txt('平和堂',-28,22.5,-2.71,20,2.7,'#d9dcd6','#4a5a5b');
 // Accessible level thresholds remain unchanged; thin dark stone bands are
 // in the apron, not phantom stairs above the shared floor height.
 for(let z=-1.25;z<1.1;z+=.8)f.b(0,.105,z,s.w+1,.035,.65,cityMaterial('#7a7d78','stone'));
 k.root.userData.landmarkDetail='three-storey-displays-rounded-perforated-metal';
}
export function dressIFS(k,f,s){
 const white=cityMaterial('#d8d8ce','stone'),dark=cityMaterial('#424d54','metal'),glazing=cityGlass(false);
 for(let y=0;y<42;y+=7){f.b(0,y-.1,-s.d/2-3,s.w,.22,s.d,white);if(y===0)for(const side of[-1,1])f.b(side*(s.w+12)/4,y+3.2,-3.02,(s.w-12)/2-.25,6.3,.08,k.glass);else f.b(0,y+3.2,-3.02,s.w-.5,6.3,.08,y<21?k.glass:glazing);for(let x=-s.w/2+.8;x<s.w/2;x+=4.1)if(y||Math.abs(x)>6.2)f.b(x,y+3.2,-2.89,.14,6.5,.18,dark);f.b(0,y+6.5,-2.4,s.w+2,.8,1.5,y<21?white:dark);f.b(0,y+6.12,-1.64,s.w,.07,.1,k.glow('#d7d7c2'));if(y<21)for(const x of[-58,-35,32,55]){const p=f.pos(x,-8);addClothesRack(k,p[0],p[1],y,s.angle,{collision:false});f.b(x,y+4.7,-7,12,.1,.4,k.glow('#e4cfa5'));}}
 f.b(0,44,-3.1,s.w,7,.55,perforatedMetal());f.txt('IFS',-s.w*.27,27,-1.62,29,7,'#414b51','#f4eddd');f.txt('国金中心',-s.w*.27,21.7,-1.58,26,2.5,'#414b51','#d4d2c5');
 for(const [x,z,w,h]of[[54,-46,42,168],[-44,-52,36,121]]){
  const p=f.pos(x,z);k.box(p[0],h/2+43,p[1],w,h,38,glazing,true,s.angle);
  // Fins on all four sides, stepped crowns and restrained lit office bays.
  for(let y=47;y<h+43;y+=4.2){for(const side of[-1,1])f.b(x,y,z+side*19.15,w+.1,.08,.12,'#7b8e98');}
  for(let xx=-w/2;xx<=w/2;xx+=2.8)for(const side of[-1,1])f.b(x+xx,h/2+43,z+side*19.25,.12,h,.18,cityMaterial('#96a1a4','metal'));
  for(let zz=-17;zz<19;zz+=2.8)for(const side of[-1,1])f.b(x+side*w/2,h/2+43,z+zz,.16,h,.12,cityMaterial('#96a1a4','metal'));
  for(let crown=0;crown<3;crown++)f.b(x+(crown%2?1.6:0),h+43+crown*2.6,z,w-3-crown*3,2.5,36-crown*2,glazing);
 }
 // Frozen rooftop art: actual paired head/ear silhouettes, not gameplay NPCs.
 for(const [x,color]of[[-21,'#829b9e'],[21,'#737b75']]){const p=f.pos(x,-21),m=cityMaterial(color),at=(xx,zz)=>f.pos(x+xx,-21+zz);sphereBatch(k,p[0],56,p[1],3.7,5.9,2.8,m);sphereBatch(k,p[0],64,p[1],3.8,3.7,2.8,m);for(const side of[-1,1]){const ear=at(side*3.6,0);sphereBatch(k,ear[0],64.5,ear[1],1.55,1.65,1.35,m);f.soft( x+side*3.9,55.6,-21,2.2,6.3,2.2,m);f.soft(x+side*1.7,49.8,-21,2.7,4.1,3.2,m);}for(const side of[-1,1]){const a=at(side*1.6-.65,2.55),b=at(side*1.6+.65,2.55);k.beam([a[0],64.8,a[1]],[b[0],63.5,b[1]],.15,'#404a4b');k.beam([a[0],63.5,a[1]],[b[0],64.8,b[1]],.15,'#404a4b');}}
 k.root.userData.landmarkDetail='six-level-podium-finned-twin-towers';
}
export function dressStreetGround(k,{roads,motor,facilities}){
 // Concrete curb joints, drains and tactile bands make the shop edges legible.
 for(const [,ps,w,kind]of roads)for(let i=1;i<ps.length;i++){
  const a=ps[i-1],b=ps[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),c=Math.cos(angle),n=Math.sin(angle);
  if(kind==='motor')for(const side of[-1,1]){
   const x=(a[0]+b[0])/2+c*side*(w/2+.18),z=(a[1]+b[1])/2-n*side*(w/2+.18);k.box(x,.14,z,.32,.18,len-.5,cityMaterial('#a1a4a0','stone'),false,angle);k.box(x+c*side*1.5,.133,z-n*side*1.5,.5,.025,len-.8,'#ae965e',false,angle);
   for(let t=7;t<len-5;t+=23){const x=a[0]+dx*t/len+c*side*(w/2+.48),z=a[1]+dz*t/len-n*side*(w/2+.48);k.box(x,.16,z,.5,.025,.95,'#525e63',false,angle);for(let q=-.35;q<=.36;q+=.12)k.box(x+n*q,.179,z+c*q,.46,.012,.03,'#1f2b30',false,angle);}
  }
 }
 for(const z of[-478,-452])for(let x=-441;x< -22;x+=37){if(Math.abs(x+355)<22)continue;k.tree(x,z+(z===-478?-4:4),1.25);k.planter(x,z+(z===-478?-4:4),2.1,2);}
 for(let z=201;z> -280;z-=81)for(const side of[-1,1])if(!facilities.some(s=>Math.hypot(s.at[0]-side*14.5,s.at[1]-z)<8))k.planter(side*14.5,z,2.8,1.4);
 // Short curb rail panels leave actual pedestrian crossings and lane mouths.
 for(const z of[-476,-454])for(let x=-427;x< -25;x+=18){if(Math.abs(x+355)<25)continue;for(const side of[-1,1])k.beam([x+side*3,0,z],[x+side*3,1.04,z],.035,'#929c9d');for(const y of[.33,.97])k.beam([x-3,y,z],[x+3,y,z],.035,'#929c9d');}
}
