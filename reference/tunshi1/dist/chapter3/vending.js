import * as THREE from '../vendor/three.module.js';
import {material,roundedBox} from '../visuals/model-kit.js';
import {YUELU} from './layout.js';

// Rest platforms and road shoulders, away from stairs, car lanes and mission props.
export const vendingSites=[
 {id:'east-parking',name:'东麓停车场',position:[652,196],angle:Math.PI,route:[650,190]},
 {id:'aiwan',name:'爱晚亭步道',position:[590,228],route:[580,235]},
 {id:'temple',name:'麓山寺步道',position:[452,179],angle:Math.PI,route:[430,175]},
 {id:'summit',name:'山顶观景台',position:[275,94],route:[260,94]},
 {id:'west-foot',name:'西麓下山口',position:[22,39],angle:Math.PI,route:[20,29]},
 {id:'arts-road',name:'文化艺术中心路边',position:[-272,-261],angle:Math.PI,route:[-270,-273]},
 {id:'lake-west',name:'梅溪湖西岸路边',position:[-618,60],angle:Math.PI,route:[-618,44]},
 {id:'lake-south',name:'梅溪湖南岸步道',position:[-548,305],route:[-548,322]}
];

export function buildVending(k,terrain){
 const glass=new THREE.MeshStandardMaterial({color:'#9ebbc6',transparent:true,opacity:.15,roughness:.2,depthWrite:false});
 const light=new THREE.MeshStandardMaterial({color:'#d5edbf',emissive:'#8db56a',emissiveIntensity:.45});
 return vendingSites.map(site=>{
  const [x,z]=site.position,y=terrain.heightAt(x,z),angle=site.angle||0,c=Math.cos(angle),s=Math.sin(angle);
  const group=new THREE.Group();group.name='vending:'+site.id;group.position.set(x,y,z);group.rotation.y=angle;k.root.add(group);
  function part(lx,ly,lz,w,h,d,color,round=false){
   const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;
   if(round){const o=new THREE.Object3D();o.position.set(wx,y+ly,wz);o.rotation.y=angle;o.updateMatrix();k.batch.add(roundedBox(w,h,d),material(color,'paint'),o.matrix);}
   else k.box(wx,y+ly,wz,w,h,d,color,false,angle);
  }
  // Beveled steel casing surrounds a real recessed product window.
  part(0,.06,0,1.55,.12,1.1,'#626a64',true);
  part(0,1.23,-.34,1.4,2.22,.18,'#366875',true);
  for(const side of[-1,1])part(side*.65,1.23,0,.1,2.22,.85,'#366875',true);
  part(0,2.19,0,1.4,.3,.85,'#366875',true);part(0,.4,0,1.4,.58,.85,'#366875',true);
  part(.46,1.38,0,.34,1.42,.82,'#b7c9bc',true);
  part(-.19,1.38,-.21,.94,1.43,.035,'#19363e');
  for(const yy of[.91,1.28,1.65])part(-.19,yy,.04,.95,.045,.5,'#a8b7b1');
  for(let column=0;column<3;column++){
   const xx=-.49+column*.3;
   part(xx,1.82,.09,.13,.28,.14,'#83bac8',true);part(xx,1.98,.09,.09,.045,.09,'#eef0d6');
   part(xx,1.44,.09,.2,.23,.16,'#d6b771',true);
   part(xx,1.07,.09,.2,.23,.16,'#e1e7ce',true);part(xx,1.07,.179,.035,.14,.01,'#b66658');part(xx,1.07,.18,.12,.035,.01,'#b66658');
  }
  part(-.19,1.39,.425,.94,1.37,.018,glass);
  part(.46,1.76,.43,.25,.22,.04,'#1e4345');
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)part(.385+col*.074,1.43-row*.075,.435,.05,.05,.025,'#627a77');
  part(.46,1.05,.435,.17,.11,.04,'#263a40');
  part(-.17,.4,.435,.94,.23,.035,'#172b32');part(-.17,.27,.45,.98,.065,.09,'#9dac9f');
  part(0,2.21,.438,1.21,.035,.025,light);
  k.api.label('自动售货机',1.21,.23,'#366875','#e6f2ce',group,0,2.08,.438);
  k.api.label('¥2起',.26,.13,'#1e4345','#c7edc1',group,.46,1.76,.458);
  k.api.label('取货口',.52,.12,'#172b32','#afc5be',group,-.17,.4,.458);
  k.api.label('补给 · E',1.8,.35,'#2d5155','#e8f2cc',group,0,2.67,.04);
  const collider={x,z,w:1.55,d:1.1,angle,bottom:y,top:y+2.34,walkable:false};k.solids.push(collider);
  return {...site,id:'chapter3:vending:'+site.id,type:'vending',region:YUELU,name:site.name+' · 自动售货机',at:[x+s*1.8,z+c*1.8],floor:y,angle,g:group,collider};
 });
}
