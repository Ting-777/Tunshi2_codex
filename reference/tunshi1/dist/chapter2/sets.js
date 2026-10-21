import * as THREE from '../vendor/three.module.js';
import {attachNavigation} from '../indoor-navigation.js';
import {CHAZI,compactPoint} from '../regions/data.js';
import {buildHomeDemolition} from './home-demolition.js';
import {buildEquipment} from './equipment.js';
// Enrich the existing Chapter 2 rooms; retain their IDs, entrances and driving routes.
export function buildStorySets(api){
 const {scene,interiors,box,sphere,cyl,label}=api,props=new Map(),lights=[];
 for(const id of ['interior_old_shop','interior_old_garage'])interiors[id].g.traverse(o=>{if(o.isPointLight)lights.push({g:o,area:id,zone:o.position.x<0?'west':'east',base:o.intensity});});
 const add=(id,area,x,z,name,color='#d8bd82',kind='item')=>{
  const r=interiors[area],g=new THREE.Group();r.g.add(g);g.position.set(x,0,z);
  if(kind==='paper'){box(.8,.03,.58,'#eadfc0',g,0,1.08,0);for(let i=0;i<4;i++)box(.52,.004,.025,'#6d7972',g,0,1.104,-.18+i*.09);}
  else if(kind==='photo'){box(.9,.65,.07,'#886b4f',g,0,1.35,0);label('豚师 / 攀哥 / RY / 章鱼',.86,.6,'#e3caa0','#405e60',g,0,1.35,.04);}
  else if(kind==='power'){box(.75,1.2,.25,'#507477',g,0,1,0);box(.5,.6,.02,'#b7c4b6',g,0,1,.14);box(.1,.14,.06,color,g,.12,.88,.17);}
  else if(id==='old-pc'||id==='email-title'){box(1,.72,.12,'#233e4a',g,0,1.6,0);box(.86,.55,.025,id==='old-pc'?'#3a5360':'#92bbb7',g,0,1.6,.08);box(.85,.05,.5,'#5d797f',g,0,1.09,.2);}
  else{box(.7,.5,.55,color,g,0,1.03,0);box(.76,.07,.61,'#e5d4ac',g,0,1.31,0);}
  const caption=label(name,3.2,.4,'#314c55','#ead9aa',g,0,1.95,0);caption.visible=false;
  const p={id,area,at:[r.ox+x,z],g,caption,name,kind};props.set(id,p);return p;
 };
 // Table tops are readable objects, not floating mission arrows.
 add('shop-power','interior_old_shop',6,-5,'恢复旧店配电','#ce9f60','power');
 add('shop-drawer','interior_old_shop',-5,-5,'被翻动的柜子','#887657');
 add('old-photo','interior_old_shop',5,1,'四个人的老照片','#c5a47c','photo');
 add('old-ledger','interior_old_shop',-3,1,'早期账本','#a29678','paper');
 add('wall-photo','interior_old_shop',4,5,'车库涂鸦照片','#c5b688','photo');
 add('shutter','interior_old_shop',0,6.4,'放下卷帘门','#87989b','power');
 const shop=interiors.interior_old_shop;
 for(let x=-7;x<=7;x+=.45)box(.2,.22,.7,'#8c7457',shop.g,x,.12,-7.6);
 for(const x of [-6.5,6.5]){box(.08,3.7,.08,'#584a3b',shop.g,x,1.9,-5);for(let z=-6.5;z<0;z+=2){box(.7,.14,.6,'#a1895f',shop.g,x,1.5,z);cyl(.16,.16,.25,'#c2c7a4',shop.g,x,1.69,z);}}
 label('海豚帮已经搬走了',7,.7,'#526a67','#e5ddbd',shop.g,0,4,-8.75);
 const returnSign=label('偶尔回来。',5,.65,'#526a67','#f2ce78',shop.g,0,3.25,-8.75);returnSign.visible=false;
 for(const x of [-5,5]){cyl(.36,.36,.2,'#bb995d',shop.g,x,4.2,0);const l=new THREE.PointLight('#ffc987',15,15);l.position.set(x,3.9,0);shop.g.add(l);lights.push({g:l,area:shop.id,base:15});}
 // Garage branches retain the real ring road. Local cues are visible before their interaction prompts.
 add('garage-west','interior_old_garage',-30,9,'西区照明','#69bb9e','power');
 add('garage-east','interior_old_garage',30,-10,'东区照明','#69bb9e','power');
 add('locker-04','interior_old_garage',-20,-23,'旧储物柜 04','#8fa3a2');
 add('four-names','interior_old_garage',24,-24,'四个名字','#dbbc80','photo');
 const garage=interiors.interior_old_garage;
 label('豚师  攀哥  RY  章鱼',9,1,'#738481','#e7cc87',garage.g,24,3.4,-27.65);
 const ugly=new THREE.Group();garage.g.add(ugly);ugly.position.set(24,1.7,-27.5);sphere(1.5,.55,.08,'#82acb1',ugly);sphere(.75,.3,.09,'#82acb1',ugly,1.4,.2,.05);sphere(.06,.06,.1,'#263e48',ugly,1.6,.3,.08);
 for(let i=0;i<6;i++){const x=i%2?22:-22,z=-14+Math.floor(i/2)*14,m=box(2.2,.8,4,'#435c67',garage.g,x,.6,z);box(1.8,.7,2,'#76969b',garage.g,x,1.25,z);garage.solids.push({x:garage.ox+x,z,w:2.2,d:4,bottom:0,top:1.65,walkable:true});garage.cameraBlocks.push(m);label('B'+(i+1),1.5,.4,'#405e69','#fff0bc',garage.g,x,3,z);}
 for(let x=-30;x<=30;x+=12){box(5,.05,1,'#d8e8df',garage.g,x,5.75,-15);const l=new THREE.PointLight('#b7d9dd',25,16);l.position.set(x,4.8,-15);garage.g.add(l);lights.push({g:l,area:garage.id,zone:x<0?'west':'east',base:25});}
 // Office is a connected original set: lobby, print room, corridor and meeting room.
 const g=new THREE.Group();g.position.x=3000;g.visible=false;scene.add(g);
 const office={id:'interior_finance_office',region:CHAZI,g,ox:3000,w:62,d:46,height:7,name:'茶湾商厦 · 交易办公室',entry:compactPoint([510,-315]),spawn:[3000,.2,17],exit:[3000,20],exits:[{at:[3000,20],out:compactPoint([510,-315]),name:'返回金融区'},{at:[3019,16],to:'interior_commercial_b1',out:compactPoint([620,-148]),name:'员工楼梯 · B1 后勤层'}],solids:[],cameraBlocks:[]};
 const b=(x,z,w,d,h,c,y=h/2,solid=true)=>{const m=box(w,h,d,c,g,x,y,z);if(solid){office.solids.push({x:3000+x,z,w,d,bottom:y-h/2,top:y+h/2,walkable:h<2.2});office.cameraBlocks.push(m);}return m;};
 b(0,0,62,46,.18,'#b8c4bd',0,false);b(0,0,62,46,.12,'#d8dbcc',6.9,false);
 for(const x of [-31,31])b(x,0,.3,46,7,'#455c68');for(const z of [-23,23])b(0,z,62,.3,7,'#557583');
 for(let x=-28;x<=28;x+=4){b(x,0,.03,45,.01,'#9baaa5',.13,false);b(x,-22.8,2.9,.1,4.5,'#93bbc1',3.2,false);}
 for(let z=-20;z<=20;z+=4)b(0,z,61,.03,.01,'#9baaa5',.13,false);
 b(-16,14,14,2,1.2,'#7a887e');b(-16,14,14.2,2.2,.1,'#e1dbc8',1.25,false);label('茶湾 · 商业事务',10,1,'#63797c','#f1ddab',g,-16,2.8,14.2);
 b(-13,-3,26,.25,4.2,'#839c9e');b(15,-3,28,.25,4.2,'#839c9e');
 const gate=b(0,-3,3.8,.2,4.2,'#507a84');const gateCollider=office.solids.at(-1);
 for(const x of [-10,10]){b(x,-14,.22,17,4.8,'#6f8f98');for(const z of [-12,-5])b(x,z,1.9,.05,2.6,'#9cb7ba',2.7,false);}
 for(const x of [-21,21])for(const z of [-14,-7]){b(x,z,6,2,1.1,'#a7aa91');b(x,z-.3,2,.2,1,'#263f50',1.7,false);b(x,z+2,1.2,1.2,.7,'#617481');}
 b(0,-15,10,5,.9,'#8b9182');for(const x of [-6,6])for(const z of [-17,-13])b(x,z,1.1,1.1,.55,'#496779');
 label('项目代号：H-04 · 原始签字 4/4',9,.9,'#d2dacd','#334d56',g,0,3.4,-22.75);
 for(const [x,z]of [[-22,7],[22,7],[0,-18]]){b(x,z,4,.12,.04,'#fff3d0',6.6,false);const l=new THREE.PointLight('#dde7df',25,26);l.position.set(x,5,z);g.add(l);}
 interiors[office.id]=attachNavigation(office);
 office.recoverObstructedSave=true;
 add('visitor-log',office.id,-15,11,'前台访客记录','#d8bf88','paper');
 add('contract-page',office.id,-18,-7,'打印室合同页','#eee1b6','paper');
 add('project-code',office.id,0,-20,'会议白板 H-04','#c5d4bc','paper');
 add('email-title',office.id,21,-14,'未锁定的邮件电脑','#6e9bad');
 add('staff-pass','interior_commercial_b1',-17,-7,'临时员工门卡','#ddd2a3','paper');
 const backStair={at:[2869,16],to:office.id,linkId:'b1-office',arrival:[2869,12.3],arrivalHeading:Math.PI,out:office.entry,name:'员工楼梯 · 返回交易办公室'};
 Object.assign(office.exits.find(e=>e.to==='interior_commercial_b1'),{linkId:'b1-office',arrival:[3019,12.3],arrivalHeading:Math.PI});
 interiors.interior_commercial_b1.exits.push(backStair);
 // Enclosed service stair lobbies attach to each room's actual south wall.
 // Their door faces and interaction approaches agree on both sides.
 for(const room of [interiors.interior_commercial_b1,office]){
  const depth=room.d/2-17.8,z=17.8+depth/2,body=box(5.8,4.7,depth,'#b6c1bd',room.g,19,2.35,z);
  room.solids.push({x:room.ox+19,z,w:5.8,d:depth,bottom:0,top:4.7,walkable:false});room.cameraBlocks.push(body);
  box(2.9,3.55,.1,'#748a8d',room.g,19,1.82,17.74);box(.055,3.45,.03,'#526c70',room.g,19,1.82,17.67);
  for(const x of [17.45,20.55])box(.1,3.8,.14,'#9faeaa',room.g,x,1.9,17.69);
  box(3.2,.12,.15,'#9faeaa',room.g,19,3.85,17.69);
  label(room===office?'E · 员工楼梯 / B1':'E · 员工楼梯 / 交易办公室',5.4,.58,'#3c6576','#fff1cb',room.g,19,4.25,17.64).rotation.y=Math.PI;
 }
 // Local old-home clutter and removable nonstructural renovation use actual collider HP.
 const home=interiors.interior_old_home;
 const pc=add('old-pc',home.id,10,1,'坏掉的旧电脑','#65838a');box(1.5,.13,1,'#95805e',pc.g,0,1.02,0);for(const x of [-.6,.6])box(.09,1,.09,'#586861',pc.g,x,.5,0);add('takeout',home.id,-11,7,'外卖单与旧衣服','#ccb38c','paper').g.position.y=-.35;add('old-cards',home.id,0,6,'过期卡片与照片','#ae9c7a','paper').g.position.y=-.3;
 const demolition=buildHomeDemolition({home,box,label}),parts=demolition.parts;
 const iron=add('iron-box',home.id,demolition.ironAt[0]-home.ox,demolition.ironAt[1],'铁盒 · 原件和公司章','#736d57');iron.g.position.y=-.7;iron.g.visible=false;
 const workbench=add('workbench',shop.id,5,-2.5,'维修台 · E 开工 / 收手','#a9bfa2');
 for(const child of [...workbench.g.children])if(child!==workbench.caption)workbench.g.remove(child);
 box(2.4,.16,1.3,'#a79069',workbench.g,0,1,0);
 for(const x of [-1,1])for(const z of [-.5,.5])box(.14,1,.14,'#465d61',workbench.g,x,.5,z);
 workbench.device=box(.65,.35,.6,'#779697',workbench.g,0,1.25,0);
 box(.18,.04,.55,'#b4bec1',workbench.g,.7,1.12,0);
 shop.solids.push({x:2555,z:-2.5,w:2.4,d:1.3,bottom:0,top:1.45,walkable:true});
 const equipment=buildEquipment({interiors,box,label,props,gate,gateCollider});
 add('file-case','interior_old_shop',-5,-5.5,'Dina 保管的文件包','#6f9b85');
 for(const r of [home,shop,garage,interiors.interior_commercial_b1])attachNavigation(r);
 const shutter=box(4.2,3.8,.18,'#798c8a',shop.g,0,2,7.8);shutter.visible=false;const shutterCollider={x:2550,z:7.8,w:4.2,d:.18,bottom:.1,top:3.9,disabled:true};shop.solids.push(shutterCollider);shop.cameraBlocks.push(shutter);
 const frontWall=shop.g.children.find(m=>m.isMesh&&m.position.z===9&&m.geometry.parameters?.width===18&&m.geometry.parameters?.height===6);
 const frontWallCollider=shop.solids.find(b=>b.z===9&&b.w===18);
 return{props,parts,demolition,equipment,workbench,lights,gate,gateCollider,returnSign,iron,home,shop,garage,office,shutter,shutterCollider,frontWall,frontWallCollider};
}
