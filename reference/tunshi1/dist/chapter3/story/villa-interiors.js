import * as THREE from '../../vendor/three.module.js';
import {DetailBatch,roundedBox,material,surface,soft,rod} from '../../visuals/model-kit.js';
import {attachNavigation} from '../../indoor-navigation.js';
import {YUELU} from '../layout.js';
import {GARAGE,GROUND,UPPER,STUDY} from './missions.js';
// All furniture has legs, upholstery, hardware and a matching physics volume.
// Only moving/breakable parts use individual meshes; rigid dressing is instanced.
export function buildVillaInteriors(api){
 const rooms={},props=new Map(),weapons=new Map(),lights=[];let chandelier;
 function room(id,ox,w,d,height,name,drivable=false,floor=0){
  const g=new THREE.Group();g.position.x=ox;g.visible=false;g.name=id;api.scene.add(g);
  const r={id,region:YUELU,g,ox,w,d,height,name,drivable,solids:[],cameraBlocks:[],exits:[],entry:[-785,139],spawn:[ox,floor+.2,d/2-6],heightAt:()=>floor};rooms[id]=r;
  const batch=new DetailBatch(g);
  const b=(x,z,bw,bd,h,c,y=floor+h/2,solid=false,finish)=>{const m=finish?surface(c,finish):material(c);batch.box(bw,h,bd,m,x,y,z);if(solid)r.solids.push({x:ox+x,z,w:bw,d:bd,bottom:y-h/2,top:y+h/2,walkable:h<2.2});};
  const wall=(x,z,bw,bd,h=height-floor,c='#c4baaa',y=floor+h/2)=>{const mesh=api.box(bw,h,bd,surface(c,'stone'),g,x,y,z);r.cameraBlocks.push(mesh);r.solids.push({x:ox+x,z,w:bw,d:bd,bottom:y-h/2,top:y+h/2});b(x,z,bw+.04,bd+.04,.2,'#716251',floor+.15);return mesh;};
  b(0,0,w,d,.2,drivable?'#646b68':'#c2b6a0',floor-.1,false,'stone');if(id===GROUND){b(0,14,w,48,.12,'#d5c9b8',height,false);b(23,-24,32,28,.12,'#d5c9b8',height,false);}else b(0,0,w,d,.12,'#d5c9b8',height,false);
  wall(-w/2,0,.35,d);wall(w/2,0,.35,d);wall(0,-d/2,w,.35);wall(0,d/2,w,.35);
  for(const x of[-w/2+2,w/2-2])for(let z=-d/2+5;z<d/2;z+=14){b(x,z,2.1,1,.09,'#fbe6bc',height-.15);const light=new THREE.PointLight('#ffe5b8',42,24,2);light.position.set(x,height-1,z);g.add(light);lights.push(light);}
  const p=(id,x,z,w,d,h,name,kind='furniture',hp=40,y=floor)=>{
   const pg=new THREE.Group();pg.position.set(x,y,z);g.add(pg);const collider={x:ox+x,z,w,d,bottom:y,top:y+h,walkable:h<2.2};r.solids.push(collider);
   const prop={id,area:r.id,at:[ox+x,z],g:pg,origin:pg.position.clone(),hp,maxHp:hp,collider,name,kind,baseY:y,debris:new THREE.Group()};prop.debris.position.copy(pg.position);g.add(prop.debris);prop.debris.visible=false;
   for(let i=0;i<7;i++){const m=soft(prop.debris,.25+(i%3)*.12,.12,.45,'#8b7860',(i%3-1)*.65,.1,Math.floor(i/3)*.4-.3);m.rotation.y=i*1.5;}
   props.set(id,prop);collider.storyProp=prop;return prop;
  };
  const chair=(id,x,z,color='#76695b',y=floor)=>{const q=p(id,x,z,.95,.95,1.3,'实木餐椅','weapon',30,y);for(const sx of[-.34,.34])for(const sz of[-.34,.34])soft(q.g,.09,.65,.09,'#4b3d30',sx,.325,sz);soft(q.g,.85,.18,.85,surface(color,'fabric'),0,.75,0);soft(q.g,.85,.65,.1,surface(color,'fabric'),0,1.12,-.37);q.collider.top=y+1.48;weapons.set(id,q);return q;};
  const sofa=(id,x,z,w=4.8,y=floor)=>{const q=p(id,x,z,w,1.8,1.35,'真皮沙发','furniture',75,y);for(const sx of[-w/2+.3,w/2-.3])for(const sz of[-.55,.55])soft(q.g,.12,.3,.12,'#504436',sx,.15,sz);soft(q.g,w,.75,1.8,'#716758',0,.65,0);soft(q.g,w-.35,.65,.3,surface('#796d60','fabric'),0,1.14,-.72);for(let i=0;i<3;i++)soft(q.g,(w-.4)/3,.2,1.3,surface('#918575','fabric'),(i-1)*w/3,.96,.07);return q;};
  const table=(id,x,z,w=4,d=2,y=floor)=>{const q=p(id,x,z,w,d,.9,'木桌','furniture',55,y);for(const sx of[-w/2+.25,w/2-.25])for(const sz of[-d/2+.25,d/2-.25])soft(q.g,.15,.75,.15,'#4a3f32',sx,.375,sz);soft(q.g,w,.18,d,surface('#806549','wood'),0,.84,0);if(w<=4){q.kind='weapon';weapons.set(id,q);}return q;};
  const plant=(id,x,z,y=floor)=>{const q=p(id,x,z,.95,.95,1.7,'陶盆绿植','weapon',30,y);api.cyl(.5,.36,.7,'#837463',q.g,0,.35,0);for(let i=0;i<7;i++){const a=i*2.4,m=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6),material('#486248'));m.scale.set(.6,2.4,1);m.position.set(Math.sin(a)*.33,1.1+i*.06,Math.cos(a)*.33);m.rotation.z=Math.sin(a)*.6;q.g.add(m);}weapons.set(id,q);return q;};
  const frame=(x,z,width,paint='#557577',y=floor+3)=>{b(x,z,width,.18,width*.65,'#b18c52',y);b(x,z+.12,width-.17,.035,width*.65-.17,paint,y);for(let i=0;i<6;i++)b(x-width*.35+i*width*.14,z+.15,.2,.02,.4+i*.1,['#b5ab7f','#7e8b76','#48666c'][i%3],y-.3);};
  const medicine=(id,x,z,y=floor)=>{const q=p(id,x,z,.8,.3,.9,'医药柜 · E 取药（一次）','medicine',1,y);soft(q.g,.8,.9,.3,'#e5e4d7',0,1.6,0);soft(q.g,.13,.48,.02,'#a36255',0,1.6,.17);soft(q.g,.45,.13,.02,'#a36255',0,1.6,.18);q.collider.disabled=true;return q;};
  const finish=()=>{batch.finish();attachNavigation(r,{heightAware:true});return r;};return{r,g,b,wall,p,chair,sofa,table,plant,frame,medicine,finish};
 }
 {
  const k=room(GARAGE,4000,48,84,7,'仙人府 · 车库与冬庭',true),{r,b,p,g}=k;
  for(const x of[-17,17])for(const z of[-28,18]){k.wall(x,z,1,1,6.8,'#8a938a');b(x,z,1.04,1.04,.4,'#c9aa64',1.2);}
  for(const x of[-12,12])for(const z of[13,29]){b(x,z,8,.1,.03,'#b8b39b',.02);b(x-4,z+4,.1,8,.03,'#b8b39b',.02);}
  for(const x of[-14,14]){b(x,35,7,.3,.06,'#d4c1a0',.03);b(x,23,7,.3,.06,'#d4c1a0',.03);}
  // Winter garden is separated by a visibly reinforced, vehicle-width glass door.
  k.wall(-15,0,18,.55,6.5,'#6b776c');k.wall(15,0,18,.55,6.5,'#6b776c');
  const q=p('winter-glass',0,0,12,.5,5.4,'冬庭钢架玻璃门','ram',120);
  const glass=new THREE.MeshStandardMaterial({color:'#8ca9a2',transparent:true,opacity:.38,roughness:.15,metalness:.25});
  for(const x of[-5.9,-2,2,5.9])soft(q.g,.18,5.4,.35,'#39473e',x,2.7,0);
  for(const y of[.3,2.8,5.25])soft(q.g,12,.18,.35,'#39473e',0,y,0);
  for(const x of[-4,0,4])soft(q.g,3.8,5,.09,glass,x,2.65,.06);
  q.debris.clear();const shardGeometry=new THREE.BufferGeometry();shardGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.4,0,-.2,.5,0,-.1,0,0,.55],3));shardGeometry.computeVertexNormals();const rubble=new THREE.InstancedMesh(shardGeometry,glass,64),dummy=new THREE.Object3D();
  for(let i=0;i<64;i++){dummy.position.set((i%16-7.5)*.72,.045,Math.floor(i/16)*.7-1.5);dummy.rotation.y=i*2.4;dummy.scale.setScalar(.5+i%4*.18);dummy.updateMatrix();rubble.setMatrixAt(i,dummy.matrix);}q.debris.add(rubble);
  for(const x of[-5.8,5.8]){const beam=soft(q.debris,.15,5.3,.22,'#3f5149',x,2.65,0);beam.rotation.z=x>0?-.18:.18;}
  for(const x of[-3.5,3.5]){const beam=soft(q.debris,4.2,.15,.22,'#3f5149',x,.18,-.5);beam.rotation.y=x>0?.35:-.35;}
  for(const x of[-15,15]){k.plant('garage-plant-'+x,x,-14);k.sofa('winter-sofa-'+x,x,-26,5);}
  for(let x=-20;x<22;x+=4)b(x,-21,.05,38,.03,'#869386',.01);
  b(0,-22,14,20,.04,'#b5aa8d',.02);k.table('winter-table',-12,-19);k.chair('garage-chair',10,-9);k.medicine('garage-med',-22,32);
  for(let z=-38;z<-5;z+=8)k.frame(23.7,z,3.8,'#4b6968');
  r.exits=[{at:[4000,38],out:[-785,139],name:'地下车库坡道 · 返回前院'}, {at:[4014,-36],out:[-785,139],to:GROUND,linkId:'winter-hall',arrival:[4014,-32],name:'冬庭侧廊 · 主厅'}];
  api.label('冬庭',5,.7,'#687568','#efe4c5',g,0,5.8,-.2);k.finish();
 }
 {
  const k=room(GROUND,4200,78,76,9,'仙人府 · 主厅、餐厨与内院'),{r,b,g}=k;
  // Three connected rooms with genuine door-width gaps, no invisible waypoint walls.
  k.wall(7,20,.4,35,8);k.wall(7,-22,.4,31,8); // x=7 arch gap z 2.5..-6.5
  k.wall(-20,-9,23,.4,8);k.wall(11,-9,18,.4,8);k.wall(32,-9,12,.4,8); // cross-hall opening -8.5..2
  for(const x of[-29,-12]){k.sofa('hall-sofa-'+x,x,24);k.table('hall-table-'+x,x,17,3,1.6);}
  b(-19,17,30,28,.03,'#877761',.01,false,'fabric');
  for(const x of[-35,-4]){k.plant('hall-plant-'+x,x,7);k.frame(x,37.75,4,'#6b8278');}
  for(let x=-35;x<0;x+=6)for(let z=2;z<35;z+=6){b(x,z,5.7,5.7,.035,'#c5b9a6',8.7);b(x,z,.09,5.8,.1,'#8e7a60',8.8);}
  chandelier=new THREE.Group();chandelier.position.set(-19,7,18);g.add(chandelier);for(let i=0;i<16;i++){const a=i*Math.PI/8;rod(chandelier,new THREE.Vector3(0,1.2,0),new THREE.Vector3(Math.sin(a)*2,-.5,Math.cos(a)*2),.025,'#bea265');api.sphere(.1,.1,.1,'#fff1cf',chandelier,Math.sin(a)*2,-.6,Math.cos(a)*2);}
  const release=k.p('chandelier-release',-34,14,.35,.45,1.5,'吊灯卸扣 · E 拉下','lever',1);release.collider.disabled=true;soft(release.g,.22,1.6,.22,'#7c7258',0,.8,0);soft(release.g,.65,.12,.18,'#bd9b5d',.15,1.3,0);
  api.label('E 放下吊灯',2.8,.4,'#4e5f4b','#e9d5a4',release.g,0,2.1,0);
  const dining=k.table('dining-table',23,16,10,3.2);for(let i=0;i<4;i++)for(const z of[13,19])k.chair('dining-chair-'+i+'-'+z,19+i*2.6,z,'#77795b');
  for(let i=0;i<8;i++){api.cyl(.22,.22,.025,'#eee7d6',dining.g,-4+i*1.15,.95,0);api.sphere(.1,.1,.1,'#d4bb8c',dining.g,-4+i*1.15,1.02,.32);}
  // Kitchen island, cabinets, hood, sink and mounted wash valve.
  const counter=k.p('kitchen-island',22,-21,11,3,1.1,'厨房操作台','furniture',90);soft(counter.g,11,1,3,surface('#656957','wood'),0,.5,0);soft(counter.g,11.3,.16,3.25,surface('#d1caba','stone'),0,1.06,0);for(const x of[-3,0,3]){soft(counter.g,2.7,.7,.05,'#747a62',x,.6,1.53);soft(counter.g,.45,.06,.07,'#baa57c',x,.7,1.59);}
  b(35,-26,4,19,1,'#5b665c',.5,true);b(35,-26,4.1,19.1,.16,'#bebbae',1.06);for(let i=0;i<8;i++){b(37,-35+i*2.7,.13,2.6,1.2,'#c6c2b3',2.5);b(36.85,-35+i*2.7,.08,.5,.08,'#a39168',2.5);}
  b(35,-22,2.5,4,.08,'#485d5b',1.2);b(23,-21,8,4,.35,'#7c847c',4.5);b(23,-21,1.4,1.4,4,'#687468',6.4);
  const valve=k.p('wash-valve',38,-15,.3,.45,1.1,'红色冲洗阀','valve',1);valve.collider.disabled=true;api.cyl(.12,.12,2,'#7a8174',valve.g,0,1,0);const wheel=new THREE.Mesh(new THREE.TorusGeometry(.3,.04,6,16),material('#af5d46'));wheel.position.set(-.2,1.5,0);wheel.rotation.y=Math.PI/2;valve.g.add(wheel);valve.wheel=wheel;
  k.medicine('kitchen-med',38,-31);k.chair('kitchen-stool',11,-14);
  // Open-sky courtyard: wood deck, planted beds and a long glazed colonnade.
  b(-20,-25,34,21,.045,'#817259',.025,false,'wood');
  for(const x of[-33,-7]){b(x,-23,1.2,25,.3,'#8f977d',.15,true);b(x,-23,1,24,.25,'#4b6a49',.43);for(let z=-33;z<-11;z+=6){k.wall(x,z,.5,.5,8,'#787e68');}}
  for(const x of[-25,-15])k.plant('court-plant-'+x,x,-32);k.table('court-table',-21,-17,3,1.7);k.chair('court-chair',-17,-16);k.chair('court-chair2',-24,-16);
  k.medicine('hall-med',-38,32);
  r.exits=[{at:[4180,32],out:[-751,130],to:GARAGE,linkId:'winter-hall',arrival:[4180,28],name:'冬庭'}, {at:[4184,-33],out:[-751,130],to:UPPER,linkId:'court-stair',arrival:[4184,-29],name:'内院廊门 · 楼梯厅'}];k.finish();
  // Let sky light reach the courtyard: cut away its ceiling instead of painting it black.
  r.g.children.filter(o=>o.isInstancedMesh).forEach(o=>{o.userData.villaRoom=true;});
 }
 {
  const k=room(UPPER,4400,64,76,15,'仙人府 · 楼梯与二层走廊'),{r,b,g}=k;
  // 36 real risers at 19.4 cm. Support, collision and camera use this same field.
  const rise=7/36,run=22/36;
  r.heightAt=(x,z)=>z<=6?7:Math.abs(x-4400)<=7&&z<28?Math.min(7,Math.floor((28-z)/run+1)*rise):0;
  b(0,-16,64,44,.22,'#9f8b6e',6.89,false,'wood');
  for(let i=0;i<36;i++){const z=28-(i+.5)*run,y=(i+1)*rise;b(0,z,14,run+.01,.18,'#c6bda7',y-.09);b(0,z+run*.43,14,.08,.035,'#9a886b',y+.018);}
  for(const x of[-7.6,7.6]){rod(g,new THREE.Vector3(x,1.05,28),new THREE.Vector3(x,8.05,6),.06,'#826f4e');for(let i=0;i<=12;i++){const z=28-i*22/12,y=i*7/12;b(x,z,.07,.07,1.08,'#5c685c',y+.54);}for(let i=0;i<36;i++){const z=28-(i+.5)*run,y=(i+1)*rise;r.solids.push({x:4400+x,z,w:.18,d:run+.015,bottom:y-.2,top:y+1.1});}}
  // Raised floor side edge has a readable parapet; the stair opening remains open.
  for(const x of[-20,20]){b(x,6,24,.3,8,'#6b725f',4,true);b(x,6,24,.4,.14,'#b6a780',8.04);}
  for(const x of[-22,22]){k.sofa('upper-sofa-'+x,x,-18,5,7);k.plant('upper-plant-'+x,x,-30,7);k.frame(x,-37.75,5,'#4c6b78',10);}
  for(let z=-32;z<5;z+=5)b(0,z,11,4.8,.035,'#86745a',7.025,false,'fabric');
  k.medicine('upper-med',-31,-10,7);
  const door=k.p('study-door',0,-35,5,.3,3.4,'书房双扇门','gate',1,7);for(const x of[-1.2,1.2]){soft(door.g,2.35,3.4,.24,surface('#624c37','wood'),x,1.7,0);soft(door.g,.09,.45,.08,'#c3ab72',x<0?-.18:.18,1.6,.17);}door.collider.disabled=true;
  r.exits=[{at:[4400,33],out:[-751,130],to:GROUND,linkId:'court-stair',arrival:[4400,30],name:'内院'}, {at:[4400,-32],out:[-751,130],to:STUDY,linkId:'study',arrival:[4400,-29],name:'推门 · 仙人书房'}];k.finish();
 }
 {
  const k=room(STUDY,4600,30,28,14,'仙人府 · 书房',false,7),{r,b,g}=k;
  r.spawn=[4600,7.2,10];
  for(const x of[-14,14]){b(x,-3,1.2,21,3.8,'#5b4934',8.9,true,false,'wood');for(let i=0;i<6;i++)for(let j=0;j<4;j++){b(x,-12+i*3.5,1.35,3.1,.09,'#9c7e54',7.1+j*.85);for(let a=0;a<5;a++)b(x+(x<0?.6:-.6),-13+i*3.5+a*.5,.6,.35,.6,['#7b6551','#53706a','#918760','#6f4c4b'][a%4],7.45+j*.85);}}
  b(0,-6,17,15,.035,'#8d8465',7.01,false,'fabric');k.table('tea-table',0,-6,4.8,2.2,7);k.chair('tea-chair',0,-8,'#746958',7);k.sofa('study-sofa',7,4,5,7);k.plant('study-plant',-10,8,7);
  const tea=props.get('tea-table');api.cyl(.25,.22,.27,'#a5946e',tea.g,0,1.02,0);api.sphere(.12,.12,.12,'#8a785d',tea.g,0,1.22,0);for(const x of[-.65,.65])api.cyl(.09,.075,.13,'#d8c5a0',tea.g,x,.98,.35);
  soft(tea.g,.9,.03,.65,'#d8d0b9',1.3,.94,-.2);api.label('牢东杰',.8,.35,'#d8d0b9','#4d5048',tea.g,1.3,.96,-.2).rotation.x=-Math.PI/2;
  // Glazing belongs to the rear wall and looks out over an original lake vista.
  b(0,-13.75,17,.14,4,'#436a6b',10);for(const x of[-8.5,-4.25,0,4.25,8.5])b(x,-13.55,.12,.2,4.4,'#b3a789',10);b(0,-13.45,18,.6,.25,'#988b6b',7.8);k.frame(8,13.7,4,'#79826c',10.2);
  r.exits=[{at:[4600,11],out:[-751,130],to:UPPER,linkId:'study',arrival:[4600,8],name:'二层走廊'}, {at:[4611,9],out:[-751,130],name:'侧廊下楼 · 离开别墅'}];k.finish();
 }
 for(const r of Object.values(rooms)){api.interiors[r.id]=r;r.recoverObstructedSave=true;}
 return{rooms,props,weapons,lights,chandelier};
}
