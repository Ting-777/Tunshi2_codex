import * as THREE from '../vendor/three.module.js';
import {cityMaterial,cityGlass} from './materials.js';

const palettes=[['#bfc3bf','#6d7878','#464b4c'],['#c7bfb3','#9e9180','#493b32'],['#a9aeb0','#c3c8c9','#333f47'],['#d1cdc3','#9faaa6','#555d57'],['#bcb4a7','#9c7361','#493d36']];
const hash=s=>[...s].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
// Actual walls, recessed glazing, hardware and display volumes. Decorative
// stores have shut doors; only stable facility IDs get an open E doorway.
export function buildStreetFacade(k,s){
 const a=s.angle||0,c=Math.cos(a),n=Math.sin(a),front=3,w=s.w||26,d=s.d||23,h=s.h||18,ef=s.entryFloor||0,seed=hash(s.id||s.name||''),heritage=s.heritage||s.style==='heritage',mall=['clothing','ifs'].includes(s.type),variant=s.style||['ribbon','bays','balcony','metal'][seed%4];
 const pos=(x,z)=>[s.at[0]+c*x+n*z,s.at[1]-n*x+c*z];
 const b=(x,y,z,bw,bh,bd,col,solid=false,finish)=>{const p=pos(x,z);k.box(p[0],y,p[1],bw,bh,bd,col,solid,a,finish);};
 const txt=(text,x,y,z,width,height,bg,fg)=>{const p=pos(x,z);return k.text(text,p[0],y,p[1],width,height,bg,fg,a);};
 const soft=(x,y,z,bw,bh,bd,col,r=.04)=>{const p=pos(x,z),o=new THREE.Object3D();o.position.set(p[0],y,p[1]);o.rotation.y=a;o.updateMatrix();k.roundedOriented(bw,bh,bd,col,o.matrix,r);};
 const [wall,trim,dark]=heritage?['#d3cec0','#8d7e69','#383330']:palettes[seed%palettes.length],wallMat=cityMaterial(wall,'plaster'),trimMat=cityMaterial(trim,'stone'),metal=cityMaterial('#76817f','metal'),wood=cityMaterial('#85705a','wood');
 const opening=s.type==='ifs'?12:s.type==='clothing'?8:s.type==='parking'?10:4,doorTop=4.1+ef;
 if(mall){
  const displayHeight=s.type==='clothing'?15.6:21,step=s.type==='clothing'?5.3:7;
  for(const side of[-1,1]){
   b(side*w/2,.5,-d/2-front,.5,1,d,trimMat,true);
   b(side*w/2,(h+displayHeight)/2,-d/2-front,.5,h-displayHeight,d,wallMat,true);
   b(side*w/2,(displayHeight+1)/2,-d/2-front,.08,displayHeight-1,d,cityGlass(true),true);
   for(let z=-front-1;z>-d-front;z-=6)b(side*w/2,displayHeight/2,z,.22,displayHeight,.16,metal);
   for(const y of[step,step*2,step*3])b(side*w/2,y,-d/2-front,.65,.28,d,trimMat);
  }
 }else {b(-w/2,h/2,-d/2-front,.5,h,d,wallMat,true);b(w/2,h/2,-d/2-front,.5,h,d,wallMat,true);}
 if(s.backDoor){for(const side of[-1,1])b(side*(w+4)/4,h/2,-d-front,(w-4)/2,h,.5,wallMat,true);b(0,(h+4.1)/2,-d-front,4,h-4.1,.5,wallMat,true);for(const side of[-1,1])b(side*2.1,2,-d-front-.15,.18,4,.25,metal);txt('后门 / 后巷',0,4.65,-d-front-.36,7,.6,'#344b49','#ece8d6');}
 else b(0,h/2,-d-front,w,h,.5,wallMat,true);
 // The upper body remains behind the finished frontage, not a glass overlay
 // covering a solid front. Malls own a genuinely hollow display volume.
 if(!mall)b(0,(h+6.6+ef)/2,-d/2-front-.3,w,h-6.6-ef,d-.6,wallMat,true);
 if(ef)b(0,ef/2,-d/2-front,w,ef,d,wallMat,true);
 for(const side of[-1,1]){
  const width=(w-opening)/2,x=side*(w+opening)/4;
  if(!mall){
   b(x,ef+.55,-front,width,1.1,.55,heritage?cityMaterial('#ded8c9','brick'):trimMat,true);
   b(x,ef+2.8,-front-2.15,width,3.3,.24,'#323c3d');
   // View into a shallow furnished window, rather than a blue painted pane.
   b(x,ef+2.75,-front-1.85,width-.5,2.9,.15,cityMaterial('#c2b6a1','plaster'));
   b(x,ef+1.32,-front-1.1,width-.55,.12,1.4,wood);
   const count=Math.max(2,Math.floor(width/2.3));
   for(let i=0;i<count;i++){
    const xx=x-width/2+1+(i+.5)*(width-2)/count;
    if(['tea','snack','ice'].includes(s.type)){soft(xx,ef+1.65,-front-1,.5,.55,.48,cityMaterial('#d7c3a0','stone'));b(xx,ef+2,-front-.99,.05,.45,.05,'#b7bcae');}
    else if(['store','stationery'].includes(s.type)){for(let y=1.7;y<3.2;y+=.65){b(xx,ef+y,-front-1.5,1.5,.08,.65,wood);for(let j=0;j<4;j++)b(xx-.5+j*.34,ef+y+.24,-front-1.4,.23,.38,.28,['#a7554c','#859474','#c1a271','#719394'][j]);}}
    else {soft(xx,ef+1.68,-front-1.1,.65,.6,.45,cityMaterial(i%2?'#948271':'#707e8c'));b(xx,ef+2.32,-front-1.2,.05,.8,.05,metal);b(xx,ef+2.75,-front-1.2,.8,.05,.06,metal);}
   }
   b(x,ef+2.7,-front+.12,width-.22,3.2,.065,cityGlass(true),true);
   for(let xx=x-width/2;xx<=x+width/2+.1;xx+=Math.max(2.2,width/4))b(xx,ef+2.6,-front+.2,.075,3.25,.14,metal);
   for(const y of[1.1,4.25])b(x,ef+y,-front+.24,width,.11,.16,metal);
  }else{const p=pos(x,-front);k.solids.push({x:p[0],z:p[1],w:width,d:.45,angle:a,bottom:ef,top:ef+4.7,walkable:false});}
 }
 b(0,doorTop+.23,-front,w,.45,.65,trimMat,true);
 for(const side of[-1,1]){b(side*(opening/2+.13),ef+2.05,-front+.18,.22,4.1,.28,metal,true);b(side*(opening/2-.18),ef+1.85,-front-.1,.2,3.7,.07,k.glass);b(side*(opening/2-.32),ef+1.4,-front+.12,.06,.7,.11,cityMaterial('#bbb6a4','metal'));}
 if(!s.id){b(0,ef+1.9,-front-.1,opening-.4,3.8,.09,cityGlass(false),true);b(0,ef+1.9,-front+.02,.085,3.8,.1,metal);}
 // Projecting canopy, supports and underside lights belong to the facade.
 b(0,ef+4.65,-front+.55,w+.5,.24,2.1,trimMat);
 b(0,ef+4.45,-front+.55,w,.09,1.7,'#3b4141');
 for(let x=-w/2+1;x<w/2;x+=4){b(x,ef+4.35,-front+.5,.42,.055,.6,k.glow('#ead8b9'));b(x,ef+4.2,-front,.06,.65,.65,metal);}
 const signColor=heritage?'#4a382e':s.type==='clothing'?'#cc1723':s.type==='store'?'#345e47':s.type==='ice'?'#657688':s.type==='bar'?'#57294a':s.type==='securities'?'#2d485c':['#7c3f32','#365d59','#3a4655','#78654d'][seed%4];
 if(s.name&&!mall){soft(0,ef+5.8,-front+.32,w-.6,1.65,.3,cityMaterial(signColor,'metal'));txt(s.name,0,ef+5.8,-front+.52,w-1.6,1.18,signColor,'#fff1d5');}
 if(!mall){
  const spacing=heritage?3.65:variant==='ribbon'?3.9:4.1;
  for(let y=8.6+ef,row=0;y<h-1.1;y+=spacing,row++){
   b(0,y-1.67,-front+.14,w,.16,.38,trimMat);
   if(variant==='ribbon'&&!heritage){
    b(0,y,-front+.06,w-.75,2.3,.09,cityGlass(false));
    for(let x=-w/2+.6;x<w/2;x+=2.8)b(x,y,-front+.14,.075,2.4,.14,metal);
    b(0,y+1.35,-front+.21,w,.12,.55,trimMat);
   }else for(let x=-w/2+2.8,index=0;x<w/2-1.6;x+=5,index++){
    const ww=heritage?2.7:3.6,frame=heritage?wood:metal;
    b(x,y,-front+.1,ww+.32,2.8,.25,trimMat);
    b(x,y,-front+.25,ww,2.55,.06,(seed+index+row)%5===0?k.glow('#9b835d'):cityGlass(false));
    for(const side of[-1,1])b(x+side*ww/2,y,-front+.3,.1,2.65,.13,frame);
    for(const yy of[-1.28,1.28])b(x,y+yy,-front+.31,ww,.09,.15,frame);
    b(x,y,-front+.33,.08,2.6,.1,frame);b(x,y-1.47,-front+.46,ww+.42,.16,.7,trimMat);
    if(heritage){for(const side of[-1,1]){b(x+side*(ww/2+.35),y,-front+.32,.38,2.75,.12,wood);for(let yy=-1.1;yy<1.2;yy+=.22)b(x+side*(ww/2+.35),y+yy,-front+.42,.36,.035,.1,'#524638');}}
    if(variant==='balcony'&&row%2===0){b(x,y-1.5,-front+.7,4.4,.18,1.6,trimMat);for(let t=-2;t<=2;t+=.5)b(x+t,y-1,-front+1.35,.04,.95,.04,metal);b(x,y-.52,-front+1.35,4.2,.04,.05,metal);}
    if((seed+index+row)%4===0){soft(x+ww/2+.9,y-1,-front+.48,1.1,.65,.52,cityMaterial('#aab0ad','metal'));for(let yy=-.23;yy<.26;yy+=.1)b(x+ww/2+.9,y-1+yy,-front+.78,.9,.025,.04,'#596767');}
   }
  }
  // Side elevations remain articulated at real intersections and alleys.
  // The same windows on concealed party walls cost shared opaque instances.
  for(const side of[-1,1]){
   b(side*(w/2+.06),.45,-d/2-front,.12,.9,d,cityMaterial('#a2998b','brick'));
   for(let y=8.6+ef;y<h-1.1;y+=4.1){
    b(side*(w/2+.08),y-1.65,-d/2-front,.16,.18,d,trimMat);
    for(let z=-front-4;z>-d-front+2;z-=5.7){b(side*(w/2+.14),y,z,.12,2.6,2.7,trimMat);b(side*(w/2+.22),y,z,.045,2.36,2.4,cityGlass(false));for(const zz of[-1.22,0,1.22])b(side*(w/2+.26),y,z+zz,.075,2.45,.055,metal);b(side*(w/2+.28),y-1.38,z,.45,.15,2.8,trimMat);}
   }
  }
 }
 // Roof silhouette, parapet coping, real drainpipes and ground joints.
 b(0,h+.12,-d/2-front,w+.7,.24,d+.7,trimMat);
 for(const z of[-front,-d-front]){b(0,h+.65,z,w,1,.24,wallMat);b(0,h+1.18,z,w+.35,.16,.42,trimMat);}
 for(const side of[-1,1]){b(side*(w/2-.4),h/2,-front-.12,.1,h,.1,metal);for(let y=1;y<h;y+=4)b(side*(w/2-.4),y,-front+.01,.22,.09,.22,metal);}
 if(heritage)heritageRoof(k,{pos,b,w,d,h,a,front});
 if(s.name&&!mall&&w>16){
  const x=-w/2+.7,z=-front+1.05;pylon(k,pos,a,s.type==='bar'?'夜生活':s.type==='net'?'网咖':s.type==='arcade'?'电玩':s.type==='tea'?'茶饮':heritage?'老长沙':'上楼',x,9+ef,z,heritage?'#663b2d':'#435b61');
 }
 k.root.userData.facade={id:s.id||null,style:heritage?'heritage':variant,width:w,height:h,depth:d,entrance:!!s.id,at:s.at,angle:a};
 return {b,txt,pos,soft,opening};
}
function pylon(k,pos,a,text,x,y,z,color){
 const p=pos(x,z);k.box(p[0],y,p[1],.32,4.3,1.2,k.glow(color),false,a);for(const yy of[-1.6,1.6]){const q=pos(x,-3.1);k.beam([q[0],y+yy,q[1]],[p[0],y+yy,p[1]],.04,'#6b706f');}
 for(const side of[-1,1])k.text([...text].join('\n'),p[0]+Math.cos(a)*side*.18,y,p[1]-Math.sin(a)*side*.18,1,3.7,color,'#ffe7ba',a+side*Math.PI/2);
}
export function heritageRoof(k,{pos,b,w,d,h,a,front}){
 const depth=d+1.4,roof=cityMaterial('#626a6c','tile'),pitch=Math.atan(5.2/w);
 // Two actual sloped surfaces, ridge tiles and extending eave brackets.
 for(const side of[-1,1]){const geo=new THREE.BoxGeometry(w/2+1.1,.16,depth),m=new THREE.Mesh(geo,roof),p=pos(side*w/4,-d/2-front);m.position.set(p[0],h+1.99,p[1]);m.rotation.order='YXZ';m.rotation.set(0,a,-side*pitch);m.castShadow=m.receiveShadow=true;m.name='c4-heritage-pitched-roof';k.root.add(m);}
 b(0,h+3.32,-d/2-front,.38,.32,depth+.3,roof);
 for(const side of[-1,1]){b(side*w/2,h+1.2,-d/2-front,.6,2.2,depth,'#d1cec1');b(side*w/2,h+2.2,-d/2-front,.8,.28,depth*.7,'#dad6c9');b(side*w/2,h+2.9,-d/2-front,.85,.26,depth*.4,'#dad6c9');}
 for(let x=-w/2;x<w/2;x+=.7){b(x,h+.6,-front+.2,.25,.16,1.15,'#62574b');b(x,h+1.2,-front+.72,.1,.22,.6,roof);}
}
