import * as THREE from '../../vendor/three.module.js';
import {soft,surface,material,rod} from '../../visuals/model-kit.js';
import {YUELU} from '../layout.js';

// Mission scenery is independently switchable, leaving the map-only slot intact.
export function buildThirdSets(api){
 const region=api.regionData(YUELU),outside=new THREE.Group();region.root.add(outside);
 const props=new Map(),weapons=new Map(),closures=[],blockCars=[];
 function prop(id,at,name,w=.8,d=.7,h=1,kind='inspect'){
  const g=new THREE.Group(),y=region.heightAt(...at);g.position.set(at[0],y,at[1]);outside.add(g);
  const collider={x:at[0],z:at[1],w,d,bottom:y,top:y+h,disabled:true};region.addSolid(collider);
  const p={id,at,area:'outside',g,name,kind,collider,hp:40,maxHp:40,baseY:y,origin:g.position.clone()};props.set(id,p);return p;
 }
 function gate(id,at,w,angle,name){
  const p=prop(id,at,name,w,.22,3.5,'gate');p.g.rotation.y=angle;p.closedAngle=angle;p.collider.angle=angle;
  for(const x of[-w/2,w/2])soft(p.g,.2,3.5,.3,'#53625a',x,1.75,0);
  for(let x=-w/2+.25;x<w/2;x+=.3)rod(p.g,new THREE.Vector3(x,.2,0),new THREE.Vector3(x,3,0),.045,'#5a6d62');
  for(const y of[.3,2.85])soft(p.g,w,.1,.16,'#637b6a',0,y,0);
  api.label(name,Math.min(w,5),.55,'#3c5148','#eee2b9',p.g,0,3.25,0);return p;
 }
 for(const [at,angle]of[[[552,-275],-.052],[[12,-215],-.55]]){
  const g=new THREE.Group();g.position.set(at[0],2,at[1]);g.rotation.y=angle;outside.add(g);
  const collider=region.addSolid({x:at[0],z:at[1],w:2,d:32,angle,bottom:2,top:5,disabled:true});
  for(let z=-14;z<=14;z+=4){soft(g,1,1.4,3.5,'#b99b58',0,.7,z);soft(g,1.08,.2,3.55,'#3a4541',0,1.2,z);}
  for(const z of[-12,12]){const car=api.makeCar('私人调度车辆',[at[0]-4,at[1]+z],'#62716c',{region:YUELU});Object.assign(car,{enabled:false,parked:true,homeParked:true});car.g.position.y=2.5;car.g.rotation.y=Math.PI/2;car.home.copy(car.g.position);car.homeAngle=car.g.rotation.y;blockCars.push(car);}
  api.label('临时封路 · 私人调度',10,.8,'#454c43','#f4db94',g,0,4,0).rotation.y=Math.PI/2;closures.push({g,collider});
 }
 const dispatch=prop('dispatch',[565,-275],'调度单');
 soft(dispatch.g,2.4,.12,1.4,surface('#867450','wood'),0,1,0);for(const x of[-.9,.9])for(const z of[-.5,.5])soft(dispatch.g,.1,.95,.1,'#4a4f48',x,.475,z);
 soft(dispatch.g,.7,.025,.5,'#d9d4b5',0,1.08,0);api.label('私人场地调度 / 签收',1,.3,'#d9d4b5','#535845',dispatch.g,0,1.1,0).rotation.x=-Math.PI/2;
 const map=prop('trail-map',[708,299],'山路图');soft(map.g,3,2,.22,'#4c6653',0,2,0);for(const x of[-1.2,1.2])soft(map.g,.16,2.8,.18,'#685845',x,1.4,0);
 api.label('书院—爱晚亭—麓山寺—山顶',3,.7,'#e4d5a7','#49624f',map.g,0,2.35,-.14).rotation.y=Math.PI;
 const shortcut=gate('trail-gate',[558,235],5.2,Math.PI/2,'林间侧门 · E 手动打开');
 const finder=prop('viewfinder',[245,91],'西侧望远镜');
 for(const x of[-.45,.45])rod(finder.g,new THREE.Vector3(x,0,.45),new THREE.Vector3(0,1.6,0),.08,'#5e6b67');rod(finder.g,new THREE.Vector3(0,0,-.5),new THREE.Vector3(0,1.6,0),.08,'#5e6b67');
 soft(finder.g,1.3,.4,.6,'#87958d',-.3,1.85,0);soft(finder.g,.2,.48,.65,'#2b4040',-.93,1.85,0);
 const bridgeGate=gate('bridge-gate',[-638,203],4.7,Math.PI/2,'桥头检修门');
 const bell=prop('villa-bell',[-747,93],'进入仙人府 · E 确认');soft(bell.g,.7,1.8,.5,'#929b80',0,.9,0);soft(bell.g,.14,.24,.06,'#bb9b63',0,1.45,-.28);
 api.label('进入后分段重试',3,.45,'#425446','#eee4bf',bell.g,0,2.3,0);
 const supplies=prop('villa-supplies',[-735,93],'补给 · ¥35 恢复 65 生命',2,1,1,'supply');
 soft(supplies.g,2,.16,1,'#6c6451',0,.8,0);for(const x of[-.6,.6])soft(supplies.g,.12,.8,.7,'#475246',x,.4,0);soft(supplies.g,.6,.5,.5,'#eee7d3',0,1.13,0);soft(supplies.g,.08,.24,.02,'#a94f44',0,1.15,-.27);
 const dockTable=prop('dock-table',[-618,208],'核验桌',3,1.4,.85,'furniture');soft(dockTable.g,3,.15,1.4,surface('#87764e','wood'),0,.8,0);for(const x of[-1.2,1.2])soft(dockTable.g,.12,.75,1,'#56634d',x,.375,0);
 for(const [id,at]of[['dock-chair',[-617,205]],['dock-planter',[-621,209]],['yard-chair',[-733,112]]]){const p=prop(id,at,id.includes('planter')?'陶盆绿植':'木椅',.9,.9,1.35,'weapon');soft(p.g,.9,.2,.9,'#8a785c',0,.75,0);soft(p.g,.9,.6,.13,'#7c6b53',0,1.1,.4);for(const x of[-.32,.32])for(const z of[-.32,.32])soft(p.g,.09,.7,.09,'#485446',x,.35,z);weapons.set(id,p);}
 const cart=prop('escort-cart',[-648,203],'货推车 · E 推开 / 驾车撞碎',3.4,2.1,1.25,'furniture');cart.maxHp=cart.hp=55;
 soft(cart.g,3.4,.15,2.1,'#6d7568',0,.55,0);for(const x of[-1.35,1.35])for(const z of[-.8,.8]){const wheel=api.cyl(.28,.28,.12,'#343e3a',cart.g,x,.28,z,10);wheel.rotation.z=Math.PI/2;}for(const x of[-.9,0,.9])soft(cart.g,.75,.6,1.5,'#987b50',x,.9,0);
 api.label('E 推车 / 撞开',3.2,.45,'#435548','#ece3bc',cart.g,0,1.8,0);
 const radio=prop('summit-radio',[269,91],'通信箱 · F 砸掉阻止增援',1,.8,1.8,'furniture');radio.maxHp=radio.hp=30;
 soft(radio.g,.9,1.3,.7,'#62766b',0,.8,0);soft(radio.g,.6,.6,.03,'#cfac66',0,1,-.37);rod(radio.g,new THREE.Vector3(0,1.4,0),new THREE.Vector3(0,3.1,0),.025,'#a5aca2');
 api.label('F 截断通信',2.5,.4,'#4b5644','#f3d88e',radio.g,0,2.5,0);
 for(const [id,at]of[['checkpoint-crate',[569,-280]],['academy-chair',[697,294]],['aiwan-chair',[578,240]],['temple-chair',[434,194]],['summit-chair',[257,89]],['escort-junction-chair',[-487,-24]],['escort-bridge-chair',[-652,188]]]){
  const p=prop(id,at,id.endsWith('crate')?'木货箱':'木凳',.9,.9,1,'weapon');soft(p.g,.95,.2,.9,'#897451',0,.75,0);for(const x of[-.33,.33])for(const z of[-.33,.33])soft(p.g,.1,.7,.1,'#5b5341',x,.35,z);weapons.set(id,p);
  api.label('Q 拿起',1.7,.35,'#455d4c','#d7efaa',p.g,0,1.25,0);
 }
 return{outside,props,weapons,closures,blockCars,shortcut,bridgeGate};
}
