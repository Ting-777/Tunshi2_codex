import * as THREE from '../vendor/three.module.js';
import {TUNNEL} from './layout.js';
import {UrbanKit,indexColliders} from './city-kit.js';
import {surface} from '../visuals/model-kit.js';
export const tunnelFloor=x=>x< -490?2:x< -370?2-12*(x+490)/120:x<70?-10:x<190?-10+10*(x-70)/120:0;
export function buildNanhuTunnel(api){const root=new THREE.Group();root.name=TUNNEL;root.visible=false;api.scene.add(root);const k=new UrbanKit(root,api),roads=[['潇湘大道 / 阜埠河引道',[[-710,0],[-490,0]],20,'motor'],['南湖路湘江隧道',[[-490,0],[-370,0],[70,0],[190,0]],20,'motor'],['南湖路 / 书院路分岔',[[190,0],[345,0]],20,'motor']];
 for(let x=-710;x<350;x+=5){const y=tunnelFloor(x),slope=(tunnelFloor(x+2.5)-tunnelFloor(x-2.5))/5;const road=new THREE.Mesh(new THREE.BoxGeometry(5.02,.22,22),surface('#3c464b','stone'));road.position.set(x,y-.11,0);road.rotation.z=Math.atan(slope);road.receiveShadow=true;root.add(road);for(const z of[-10.6,10.6])k.box(x,y+.3,z,5.1,.6,.55,'#b6b9b0',true);for(const z of[-8,-3,3,8])if(Math.round(x/5)%2===0)k.box(x,y+.01,z,3,.025,.12,'#e7e2cf');}
 for(const z of[-10.8,10.8])for(let x=-690;x< -470;x+=22){k.lamp(x,z,2);if(x< -530)k.tree(x,z+(z<0?-4:4),1.2);}
 // Two bores, each with two lanes, tiled retaining panels and a real curved roof.
 const white=k.glow('#dfe6d7');white.emissiveIntensity=1.3;const green=k.glow('#67b78a');green.emissiveIntensity=1.2;
 const archGeo=new THREE.CylinderGeometry(5.25,5.25,12,20,1,true,0,Math.PI),archMat=surface('#525d60','stone').clone();archMat.side=THREE.DoubleSide;
 for(let x=-370;x<70;x+=12){const y=tunnelFloor(x);for(const z of[-5.25,5.25]){const shell=new THREE.Mesh(archGeo,archMat);shell.rotation.z=Math.PI/2;shell.name='nanhu-bore-vault';shell.position.set(x,y+2,z);shell.castShadow=shell.receiveShadow=true;root.add(shell);
  for(const side of[-1,1]){k.box(x,y+2,z+side*5.05,12,4,.28,'#d0cbb9',true);k.box(x,y+1,z+side*4.89,11.8,.12,.07,'#9ba8a3');k.box(x,y+3.5,z+side*4.89,11.8,.1,.06,'#999f95');}
  for(const off of[-2.5,2.5])k.box(x,y+5.95,z+off,9,.11,.2,white);k.box(x,y+5.1,z+4.45,12,.09,.09,'#ab4244');
  if(Math.round(x/12)%4===0){k.box(x,y+4.8,z,2.8,.8,.18,'#344743');k.text('↓　↓',x,y+4.8,z+.12,2.4,.7,'#344743','#83e2ac');}
 }}
 // Matching entrances, not a dark text banner. Curved roof and retaining wall
 // continue down both ramps to the eastern city approach.
 for(const [x,dir,name]of[[-370,1,'南湖路湘江隧道 · 河东 / 长郡 / 南门口'],[70,-1,'南湖路湘江隧道 · 潇湘大道 / 岳麓山']]){const y=tunnelFloor(x);for(const side of[-1,1])k.box(x,y+3,side*11.5,5,6,1.4,'#acb4b0',true);k.box(x,y+7.2,0,5,1.3,25,'#a5aaa4');k.text(name,x+dir*2.6,y+6,0,22,1.1,'#355d5e','#f1eacc',dir*Math.PI/2);}
 for(const [a,b]of[[-490,-370],[70,190]])for(let x=a;x<b;x+=6){const y=tunnelFloor(x);for(const z of[-11.4,11.4])k.box(x,(y+2)/2,z,6.1,2-y+.6,.8,'#aeb4ab',true);}
 k.sign('↖ 书院路（北）　南湖路 / 南门口 →',246,26,0,24,-Math.PI/2);
 for(const [x,z]of[[-570,27],[-620,-29],[230,40],[285,-35]]){k.facade({name:x<0?'潇湘大道':'南湖路',at:[x,z],angle:z<0?0:Math.PI,w:38,d:25,h:20});}
 // Portal seams match road/floor and headings. Continuous drive preserves speed.
 k.finish();const heightAt=(x,z)=>tunnelFloor(x),contains=(x,z)=>x> -725&&x<355&&Math.abs(z)<13,collision=indexColliders(k.solids,heightAt),lights=[];
 const localClip=collision.cameraClip;collision.cameraClip=(o,d,length)=>{let limit=localClip(o,d,length);for(let t=1.3;t<limit;t+=.2){const x=o.x+d.x*t,z=o.z+d.z*t,y=o.y+d.y*t;if(x< -376||x>76)continue;const centre=z<0?-5.25:5.25,side=Math.abs(z-centre),ceiling=tunnelFloor(x)+2+Math.sqrt(Math.max(0,5.25**2-side**2));if(y>ceiling-.25)return Math.max(1.3,t-.3);}return limit;};
 for(let i=0;i<3;i++){const l=new THREE.PointLight('#d6e5d8',28,38);root.add(l);lights.push(l);}
 return{id:TUNNEL,root,name:'南湖路湘江隧道 · 湘江江底',mapOnly:true,bounds:{minX:-725,maxX:355,minZ:-65,maxZ:65},land:[[-725,-13],[355,-13],[355,13],[-725,13]],heightAt,contains,canDrive:contains,...collision,nightMaterials:k.nightMaterials,props:k.props,solids:k.solids,cameraBlocks:[],roads,features:roads.map(([name,points])=>({tags:{highway:'primary',name},points})),places:[{id:'nanhu_west',name:'阜埠河 / 潇湘大道',entry:[-660,0]},{id:'nanhu_under_river',name:'南湖路湘江隧道',entry:[-150,0]},{id:'nanhu_east',name:'书院路 / 南湖路',entry:[280,0]}],pedestrians:[],traffic:[],spawn:[-690,0],safe:[-650,0],
 update(dt,t,p){if(!p)return;const covered=p.x> -370&&p.x<70;api.scene.background.set(covered?'#25343d':'#9caab6');api.scene.fog.near=covered?110:250;api.scene.fog.far=covered?290:800;api.scene.children.find(o=>o.isDirectionalLight).intensity=covered?.2:1.4;for(let i=0;i<3;i++){const x=p.x+(i-1)*20;lights[i].position.set(x,tunnelFloor(x)+4,0);lights[i].intensity=x> -370&&x<70?28:0;}}};
}
