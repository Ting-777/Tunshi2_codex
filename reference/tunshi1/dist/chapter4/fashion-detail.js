import * as THREE from '../vendor/three.module.js';
import {cityMaterial} from './materials.js';
import {crownedDolphinPrintMaterial} from '../visuals/outfits.js';
import {crownedDolphinTshirt} from './fashion-catalog.js';
let shirt,hanger;
export function shirtGeometry(){
 if(shirt)return shirt;
 const points=[[-.24,-.47],[.24,-.47],[.25,.12],[.48,.02],[.59,.29],[.3,.45],[.15,.49],[.09,.35],[-.09,.35],[-.15,.49],[-.3,.45],[-.59,.29],[-.48,.02],[-.25,.12]],shape=new THREE.Shape(points.map(p=>new THREE.Vector2(...p)));
 shirt=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.022,bevelThickness:.025});shirt.translate(0,0,-.06);shirt.computeVertexNormals();return shirt;
}
function hangerGeometry(){
 if(hanger)return hanger;
 const path=new THREE.CatmullRomCurve3([new THREE.Vector3(-.43,0,0),new THREE.Vector3(0,.23,0),new THREE.Vector3(.43,0,0),new THREE.Vector3(-.43,0,0)]),hooks=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.23,0),new THREE.Vector3(0,.34,0),new THREE.Vector3(.09,.39,0),new THREE.Vector3(.1,.48,0),new THREE.Vector3(0,.52,0)]);
 return hanger={body:new THREE.TubeGeometry(path,12,.012,5,false),hook:new THREE.TubeGeometry(hooks,10,.012,5,false)};
}
export function addClothesRack(k,x,z,y=0,angle=0,{collision=true}={}){
 const c=Math.cos(angle),s=Math.sin(angle),pos=(xx,zz)=>[x+c*xx+s*zz,z-s*xx+c*zz],metal=cityMaterial('#a4aaa7','metal');
 for(const side of[-1,1]){const p=pos(side*1.5,0);k.beam([p[0],y,p[1]],[p[0],y+2.3,p[1]],.025,metal);for(const off of[-.35,.35]){const q=pos(side*1.5,off);k.rounded(.2,.08,.2,metal,q[0],y+.04,q[1]);}k.box(p[0],y+.12,p[1],.08,.16,.8,metal,false,angle);}
 const a=pos(-1.5,0),b=pos(1.5,0);k.beam([a[0],y+2.3,a[1]],[b[0],y+2.3,b[1]],.028,metal);
 const hang=hangerGeometry();for(let i=0;i<6;i++){
  const p=pos(-1.12+i*.45,0),o=new THREE.Object3D();o.position.set(p[0],y+1.63,p[1]);o.rotation.y=angle;o.scale.set(.55,.9,.8);o.updateMatrix();k.batch.add(shirtGeometry(),cityMaterial(['#ddd2b9','#637887','#a67a68','#788277'][i%4],'fabric'),o.matrix);
  o.position.y=y+1.97;o.scale.set(.62,.62,.62);o.updateMatrix();k.batch.add(hang.body,metal,o.matrix);k.batch.add(hang.hook,metal,o.matrix);
 }
 if(collision)k.solids.push({x,z,w:3.2,d:.8,angle,bottom:y,top:y+2.35,walkable:false});
}
export function addCrownedDolphinDisplay(k,r){
 const x=r.ox+12,z=19,metal=cityMaterial('#a4aaa7','metal'),hang=hangerGeometry();
 k.rounded(3.1,.13,1.25,cityMaterial('#d3c5ac','wood'),x,.1,z);k.beam([x,.16,z-.12],[x,3.1,z-.12],.045,metal);k.beam([x-1.35,3.1,z-.12],[x+1.35,3.1,z-.12],.03,metal);
 const display=new THREE.Group();display.name='c4-crowned-dolphin-tshirt-display';display.position.set(x,2.07,z+.1);display.userData.clothingId=crownedDolphinTshirt.id;k.root.add(display);
 const shirt=new THREE.Mesh(shirtGeometry(),cityMaterial(crownedDolphinTshirt.color,'fabric'));shirt.scale.set(1.75,1.75,1.1);shirt.castShadow=shirt.receiveShadow=true;display.add(shirt);
 const print=new THREE.Mesh(new THREE.PlaneGeometry(.33,.37),crownedDolphinPrintMaterial());print.position.set(.32,.22,.1);print.name='shop-crowned-dolphin-chest-print';print.receiveShadow=true;display.add(print);
 for(const geo of[hang.body,hang.hook]){const m=new THREE.Mesh(geo,metal);m.scale.setScalar(1.6);m.position.y=.44;display.add(m);}
 k.text('像素王冠海豚 T恤 · ¥59',x,3.55,z-.14,6,.65,'#cf1f2b','#fff');
 k.solids.push({x,z,w:3.1,d:1.25,bottom:0,top:3.15,walkable:false});return display;
}
