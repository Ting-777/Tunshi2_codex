import {buildStoryRooms} from './story/interiors.js';
import * as THREE from '../vendor/three.module.js';
import {CITY,facilities,undergroundEntrances} from './layout.js';
import {UrbanKit,indexColliders} from './city-kit.js';
import {attachNavigation} from '../indoor-navigation.js';
import {surface,material} from '../visuals/model-kit.js';
import {humanModel} from '../visuals/characters.js';
import {addClothesRack,addCrownedDolphinDisplay} from './fashion-detail.js';
import {clothingCatalog} from './fashion-catalog.js';
import {dressCityInterior} from './indoor-detail.js';
import {cityMaterial} from './materials.js';
import {buildLeisureInterior} from './leisure-detail.js';
// Stable, fictional rooms. No real school internal/security layout is reproduced.
export function buildChapter4Interiors(api){const rooms={},servicePoints=[],leisurePoints=[];let next=6200;
 function room(s,w=28,d=28,height=7,floor=0){const ox=next;next+=180;const g=new THREE.Group();g.name=s.id;g.visible=false;api.scene.add(g);const k=new UrbanKit(g,api),ceil=floor+height;
  const b=(x,y,z,bw,bh,bd,col,solid=false)=>k.box(ox+x,y,z,bw,bh,bd,col,solid,0,['#8d7156','#b39975','#6f543c','#6d5566'].includes(col)?'wood':['#6b5266','#7e596b','#929b86','#e7dec7','#e4d5bf'].includes(col)?'fabric':['#efe8da','#b9b0a2','#dbd1b8'].includes(col)?'stone':undefined);
  b(0,floor-.08,0,w,.16,d,'#efe8da');b(0,ceil+.08,0,w,.16,d,'#e2dbcd');
  for(const x of[-w/2,w/2])b(x,(floor+ceil)/2,0,.35,height,d,'#d8d1c4',true);
  const rearDoors=s.type==='bar'?[10]:s.type==='clothing'?[-18]:s.type==='ifs'?[-31,31]:s.type==='underground'||s.type==='ktv'||s.type==='warehouse'?[0]:[];let edge=-w/2;
  for(const x of rearDoors){const left=x-2;if(left>edge)b((edge+left)/2,(floor+ceil)/2,-d/2,left-edge,height,.35,'#d3ccc0',true);b(x,floor+(height+4)/2,-d/2,4,height-4,.35,'#d3ccc0',true);edge=x+2;
   // A recessed, open doorway with a short lit vestibule, not a marker in a wall.
   for(const side of[-1,1]){b(x+side*2.05,floor+2,-d/2,.18,4,.3,'#738581',true);b(x+side*2.15,floor+2,-d/2-1.6,.2,4,3.2,'#bdb6a8',true);b(x+side*1.84,floor+1.9,-d/2-.12,.22,3.8,.07,k.glass);}
   b(x,floor+4.06,-d/2,4.3,.16,.34,'#738581');b(x,floor-.08,-d/2-1.6,4.2,.16,3.2,'#efe8da');b(x,floor+4.15,-d/2-1.6,4.4,.16,3.2,'#d3ccc0');b(x,floor+2,-d/2-3.2,4.3,4,.2,'#597471',true);b(x,floor+3.7,-d/2-1.6,3,.08,.15,k.glow('#fff0d0'));
  }
  if(edge<w/2)b((edge+w/2)/2,(floor+ceil)/2,-d/2,w/2-edge,height,.35,'#d3ccc0',true);
  for(const side of[-1,1])b(side*(w+5)/4,(floor+ceil)/2,d/2,(w-5)/2,height,.35,'#d8d1c4',true);b(0,ceil-1,d/2,5,2,.35,'#c9c7bb',true);
  for(const x of[-2.55,2.55])b(x,floor+2.1,d/2-.15,.14,4.2,.25,'#716d62');
  k.text(s.name,ox,floor+4.8,-d/2+.22,w-2,.9,'#e4dece','#5d5b53');k.text(s.type==='ice'?'二楼外廊 · E':'街区出口 · E',ox,floor+3.7,d/2-.22,4,.55,'#4d6b67','#fff4d8',Math.PI);
  for(let x=-w/2+2;x<w/2;x+=4)b(x,ceil-.13,0,.12,.07,d-2,k.glow('#fff0d0'));
  const ambient=new THREE.HemisphereLight('#fff4e3','#aca291',.8);g.add(ambient);const light=new THREE.PointLight('#ffedc9',42,70,1.8);light.position.set(ox,ceil-1,0);g.add(light);
  const r={id:s.id,region:CITY,g,ox,w,d,height:ceil,minFloor:floor,name:s.name,entry:s.at,drivable:s.type==='parking',safeZone:['clothing','ifs','ice'].includes(s.type),spawn:[ox,floor+.2,d/2-5],exit:[ox,d/2-3],exits:[{at:[ox,d/2-3],out:s.at,outFloor:s.entryFloor||0,name:'E · 返回 '+s.name+' 门前',floor}],solids:k.solids,cameraBlocks:[],heightAt:()=>floor,modelDetail:'c4-furnished-'+s.type};rooms[r.id]=r;return {r,k,b,floor};
 }
 function table(k,x,z,floor=0,round=false){k.rounded(2.4,.1,1.4,'#b39975',x,floor+1,z);for(const side of[-1,1])k.box(x+side*.85,floor+.5,z,.12,1,.8,'#626c68',true);k.solids.push({x,z,w:2.4,d:1.4,bottom:floor,top:floor+1.1,walkable:false});for(const side of[-1,1]){k.rounded(.8,.12,.75,'#7d9b8a',x+side*1.8,floor+.56,z);k.rounded(.15,.75,.8,'#7d9b8a',x+side*2.12,floor+.97,z);k.solids.push({x:x+side*1.8,z,w:.8,d:.85,bottom:floor,top:floor+1.35,walkable:false});}}
 function clerk(k,x,z,floor=0,color='#657f7e'){const person=humanModel(color,'');person.g.position.set(x,floor+.2,z);person.g.rotation.y=0;k.root.add(person.g);k.solids.push({x,z,w:.85,d:.85,bottom:floor,top:floor+3,walkable:false});}
 function counter(o,type,name,price,heal){const {r,k,b,floor}=o,x=r.ox-6,z=-r.d/2+4;b(-6,floor+.65,z,8,1.3,1.5,'#8d7156',true);b(-6,floor+1.35,z,8.15,.12,1.7,'#dbd1b8');k.rounded(.7,.7,.45,'#344d50',x-2,floor+1.77,z);k.box(x-2,floor+1.98,z+.24,.6,.32,.04,'#78aea6');clerk(k,x,z-1.8,floor);servicePoints.push({id:r.id+':counter',room:r.id,name:r.name,type,at:[x,z+2.1],floor,mealName:name,price,heal});k.text(name||'收银台',x,floor+3.35,z-2.2,8,.75,'#637d75','#fff2d6');}
 function rack(k,x,z,y=0){addClothesRack(k,x,z,y);}
 function shelves(o,pharmacy=false){const {r,k,b,floor}=o;for(const x of[-r.w/2+1.5,r.w/2-1.5])for(const z of[-3,5]){b(x,floor+1.6,z,1.2,3.2,5,'#8d947e',true);for(let y=.5;y<3;y+=.7){b(x,floor+y,z,1.45,.08,5.05,'#d7cbb0');for(let zz=-2;zz<=2;zz+=.5)k.rounded(.65,.43,.31,pharmacy?['#f2ece0','#71a1a4'][Math.round(zz*2)%2?1:0]:['#a85d54','#dfc295','#7b9d78'][Math.abs(Math.round(zz*2))%3],r.ox+x+(x>0?-.17:.17),floor+y+.26,z+zz);}}}
 for(const s of facilities){const size=s.type==='clothing'?[66,54,19]:s.type==='ifs'?[80,66,20]:s.type==='parking'?[72,66,6]:s.type==='arcade'?[40,34,8]:[28,28,7];const o=room(s,...size,s.type==='parking'?-5:s.entryFloor||0),{r,k,b,floor}=o;
  if(s.type==='ice'){counter(o,'food','牛奶绵绵冰',16,45);servicePoints.at(-1).permanentDefense=true;
   k.text('流星雨教师子弟之家 · 2F',r.ox+4,floor+4.2,-13.6,15,1,'#8f9ea4','#fff2e1');b(3,floor+2.4,-13.65,10,2.4,.12,'#487264');k.text('今日甜品 · 牛奶绵绵冰',r.ox+3,floor+2.6,-13.5,9,.75,'#487264','#f8eddb');
   for(const [x,z]of[[5,-6],[-7,2],[5,2],[-7,8],[5,8]])table(k,r.ox+x,z,floor);
   for(const x of[-13.77,13.77]){b(x,floor+2.7,0,.1,2.6,8,k.glass);for(let z=-4;z<=4;z+=2)b(x,floor+2.7,z,.14,2.75,.1,'#dfded0');}
   milkIce(k,r.ox-4,floor+1.5,-10);b(-11,floor+1.2,-9,1.5,2.4,2,'#dddcca',true);b(-11,floor+1.72,-7.9,1.3,.8,.09,'#719399');k.rounded(.8,.15,.8,'#b9c3c2',r.ox-11,floor+1.05,-7.8);
   r.foodModel='milk-shaved-ice';r.fictionalSchoolSpace=true;r.recoverObstructedSave=true;r.recoverRaisedFloor=true;r.storyFloor=2;
  }else if(['store','snack','tea','stationery'].includes(s.type)){counter(o,['store','stationery'].includes(s.type)?'store':'food',s.type==='tea'?'长沙奶茶':s.type==='snack'?'臭豆腐 + 糖油粑粑':'随身补给',s.type==='tea'?12:6,s.type==='tea'?25:35);if(['store','stationery'].includes(s.type))shelves(o,s.id==='c4_pharmacy');else{for(const x of[-7,6])for(const z of[1,7])table(k,r.ox+x,z);for(let i=0;i<5;i++){k.rounded(.35,.65,.35,s.type==='tea'?'#ceb38e':'#7a6649',r.ox-9+i*1.1,1.73,-10);k.box(r.ox-9+i*1.1,2.12,-10,.04,.5,.04,'#e0d1aa');}}}
  else if(s.type==='clothing'){mallFloors(o);for(const y of[0,5.3,10.6]){for(const x of[-24,-15,15,24])for(const z of[-16,-6,6])rack(k,r.ox+x,z,y);k.text(['1F · 日常衣着','2F · 外套 / 试衣间','3F · 生活 / 校友休息'][Math.round(y/5.3)],r.ox,y+3.6,-26.7,25,1,'#d21e2a','#fff');for(const x of[-27,27]){b(x,y+1.6,-22,6,3.2,5,'#d9d1c2',true);for(let xx=-2;xx<=2;xx+=2)b(x+xx,y+1.45,-19.4,1.6,2.7,.12,'#c3b7a4');}k.text('试衣间',r.ox+25,y+3.5,-19.3,6,.55,'#e5ddcd','#645e54');}
   counter(o,'clothing','衣服浏览 / 购买 / 换装',0,0);r.clothingCatalog=clothingCatalog;servicePoints.at(-1).catalog=r.clothingCatalog;
   addCrownedDolphinDisplay(k,r);servicePoints.push({id:r.id+':crowned-shirt',room:r.id,name:'像素王冠海豚 T恤 · 购买 / 换装',type:'clothing',at:[r.ox+12,21.4],floor:0,catalog:r.clothingCatalog});
   for(const x of[-28,28]){const m=humanModel('#ddd7cd','');m.g.position.set(r.ox+x,.2,18);k.root.add(m.g);k.box(r.ox+x,.08,18,2,.16,2,'#bab2a4',true);}
   r.exits.push({at:[r.ox-18,-24.5],to:'c4_underground',linkId:'c4-uniqlo-underground',floor:0,name:'E · 地下商业街',out:s.at});k.text('B1 · 地下商业街',r.ox-18,4.5,-26.7,8,.7,'#a59e92','#fff4dc');
  }else if(s.type==='ifs'){mallFloors(o,true);for(const y of[0,5.3,10.6])for(const side of[-1,1])for(const z of[-21,0,20]){b(side*33,y+2.1,z,10,4.2,12,'#d7c9b3',true);b(side*27.9,y+2.2,z,.12,3,9,'#64848b');k.text(['花里生活','河湾咖啡','纸间书屋'][Math.abs(z)%3],r.ox+side*27.7,y+4.25,z,8,.65,'#a49a84','#fff2d5',side>0?-Math.PI/2:Math.PI/2);}for(const x of[-15,15])table(k,r.ox+x,23);
   r.exits.push({at:[r.ox-31,-29],to:'c4_underground',linkId:'c4-ifs-underground',floor:0,name:'E · 地下商业街',out:s.at},{at:[r.ox+31,-29],to:'c4_ifs_parking',linkId:'c4-ifs-parking',floor:0,name:'E · 电梯下行 / B1 停车',out:s.at});for(const side of[-1,1])k.text(side>0?'B1 停车 / 后勤':'地下商业街',r.ox+side*31,4.5,-32.7,8,.65,'#e5ddcd','#6b665e');
  }else if(s.type==='parking'){for(const x of[-24,0,24])for(const z of[-22,0]){b(x,floor+2.8,z,1,5.6,1,'#9ba5a1',true);b(x,floor+1,z,1.08,.5,1.08,'#dfc873');}for(let x=-27;x<=27;x+=9)for(const z of[-25,13]){b(x,floor+.02,z,.1,.03,12,'#e9dfc2');b(x+4,floor+.02,z-6,8,.03,.1,'#e9dfc2');}b(27,floor+1.6,-26,16,3.2,8,'#a5ada4',true);r.exits.push({at:[r.ox+25,27],to:'c4_ifs_atrium',linkId:'c4-ifs-parking',floor,name:'E · 电梯上行 / IFS 中庭',out:s.at});k.text('L1 商业中庭 · 电梯 ↗',r.ox+20,floor+4.5,30,16,.8,'#547974','#fff1cf');r.recoverObstructedSave=true;
  }else if(buildLeisureInterior(o,s.type,leisurePoints,{table,clerk})){}
  dressCityInterior(k,r,s.type);finish(o);
 }
 const underground=room({id:'c4_underground',name:'黄兴—五一 · 地下商业街',at:undergroundEntrances[0].at,type:'underground'},48,240,6,-6),{r:ug,k:uk,b:ub}=underground;
 ug.exits=[];ug.spawn=[ug.ox,-5.8,111];for(const e of undergroundEntrances){const z=e.end==='hx'?111:-111,out=[e.at[0],e.at[1]-14];ug.exits.push({at:[ug.ox,z],out,outFloor:-6,floor:-6,name:'E · '+e.name});uk.text(e.end==='hx'?'↑ 黄兴广场':'↑ 五一广场',ug.ox,-2.4,z>0?118.8:-118.8,15,1,'#3f706d','#fff1d2',z>0?Math.PI:0);}
 // Shorter route, furnished storefronts on both sides, mall links in the north.
 for(let z=-96;z<100;z+=24)for(const side of[-1,1]){if(side===1&&[-48,96].includes(z)||side===-1&&z===-24)continue;ub(side*20,-4,z,7,4,18,'#c9bca6',true);ub(side*16.4,-3.9,z,.09,2.8,12,'#5f838a');uk.text(['文创','烘焙','旧书','茶饮'][Math.abs(z/24)%4],ug.ox+side*16.2,-1.6,z,10,.65,'#8c9e90','#fff2d3',side>0?-Math.PI/2:Math.PI/2);for(const zz of[-3,3])table(uk,ug.ox+side*12,z+zz,-6);}
 ug.exits.push({at:[ug.ox+14,-84],to:'c4_heiwado_uniqlo',linkId:'c4-uniqlo-underground',floor:-6,name:'E · 平和堂 / 优衣库',out:facilities.find(s=>s.type==='clothing').at},{at:[ug.ox-14,-60],to:'c4_ifs_atrium',linkId:'c4-ifs-underground',floor:-6,name:'E · IFS 商业中庭',out:facilities.find(s=>s.type==='ifs').at});
 for(const [side,z,name]of[[1,-84,'平和堂 / UNIQLO'],[-1,-60,'IFS 商业中庭']]){for(const end of[-1,1]){ub(side*20,-4.1,z+end*2,7.6,3.8,.24,'#bdb6a8',true);ub(side*16.2,-4.1,z+end*2,.2,3.8,.25,'#738581',true);ub(side*16.1,-4.2,z+end*1.8,.08,3.6,.25,uk.glass);}ub(side*20,-2.1,z,7.6,.16,4.3,'#d3ccc0');ub(side*16.2,-2.08,z,.24,.18,4.4,'#738581');ub(side*20,-2.25,z,3,.08,.14,uk.glow('#fff0d0'));uk.text(name,ug.ox+side*16,-1.6,z,4,.65,'#6a8085','#fff3db',side>0?-Math.PI/2:Math.PI/2);}
 ug.exit=[ug.ox,111];const ugVisitors=[];for(let i=0;i<12;i++){const person=humanModel(['#ad8c78','#7f9b92','#9285a6'][i%3],'');person.g.position.set(ug.ox+(i%2?4:-4),-5.8,-97+i*17);uk.root.add(person.g);ugVisitors.push(person);}ug.visitorPool=ugVisitors;ug.update=(dt,t,minutes)=>{const count=minutes>=22*60||minutes<8*60?3:minutes>=18*60?10:7;for(let i=0;i<ugVisitors.length;i++){const p=ugVisitors[i];p.g.visible=i<count;p.g.position.z=-97+i*17+Math.sin(t*.18+i)*6;if(p.g.visible){p.legs.forEach((l,j)=>l.rotation.x=Math.sin(t*2.7+i+j*Math.PI)*.15);}}};dressCityInterior(uk,ug,'underground');buildStoryRooms({rooms,room,finish,underground,leisurePoints});finish(underground);
 function finish(o){for(const m of o.k.neon)m.emissiveIntensity=.9;o.k.finish();o.r.cameraClip=indexColliders(o.r.solids,o.r.heightAt).cameraClip;attachNavigation(o.r,{heightAware:true});o.r.g.userData.modelDetail=o.r.modelDetail;}
 return {rooms,servicePoints,leisurePoints};
}
export function milkIce(k,x,y,z){
 const bowl=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.12,0),new THREE.Vector2(.43,.08),new THREE.Vector2(.62,.32),new THREE.Vector2(.63,.4)],24),surface('#ece5d7','stone'));bowl.position.set(x,y,z);bowl.name='milk-shaved-ice-bowl';k.root.add(bowl);
 const mound=new THREE.Mesh(new THREE.SphereGeometry(.48,20,14,0,Math.PI*2,0,Math.PI/2),material('#fff1d9'));mound.position.set(x,y+.35,z);mound.scale.y=1.2;k.root.add(mound);
 for(let i=0;i<9;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.47-i*.025,.025,5,22),material(i%2?'#efe5d2':'#fff7e5'));ring.rotation.x=Math.PI/2;ring.position.set(x,y+.36+i*.045,z);k.root.add(ring);}k.beam([x+.32,y+.36,z],[x+.56,y+.93,z+.13],.025,'#aeb8ba');k.rounded(.16,.05,.25,'#bac3c5',x+.59,y+.97,z+.14);
}
function mallFloors(o,ifs=false){const {r,k,b}=o;r.multilevel=true;r.floorSlabs=[];r.ramps=[];const w=r.w,d=r.d,voidW=ifs?32:20,voidD=24;
 for(const y of[5.3,10.6]){for(const side of[-1,1]){const slab={x:r.ox+side*(w+voidW)/4,z:0,w:(w-voidW)/2,d:d-.5,top:y};r.floorSlabs.push(slab);b(slab.x-r.ox,y-.12,0,slab.w,.24,slab.d,'#eee7da',true);k.solids.at(-1).walkable=true;for(let z=-voidD/2;z<=voidD/2;z+=3){b(side*voidW/2,y+.58,z,.07,1.16,3,k.glass,true);b(side*voidW/2,y+1.2,z,.09,.09,3.05,'#b4ab94');}}
  for(const side of[-1,1]){const slab={x:r.ox,z:side*(d+voidD)/4,w:voidW+.2,d:(d-voidD)/2,top:y};r.floorSlabs.push(slab);b(0,y-.12,slab.z,slab.w,.24,slab.d,'#eee7da',true);k.solids.at(-1).walkable=true;for(let x=-voidW/2;x<voidW/2;x+=3){const gap= y===5.3&&side<0&&(Math.abs(x+4)<3||Math.abs(x-4)<3)||y===10.6&&side>0&&Math.abs(x-4)<3;if(gap)continue;b(x,y+.58,side*voidD/2,3,1.16,.07,k.glass,true);b(x,y+1.2,side*voidD/2,3,.09,.09,'#b4ab94');}}
 }
 // Paired escalators: 34 shallow treads, glass sides and continuous handrails.
 // Ramps lie in the central void; the slab openings are matched to the landings.
 for(const [x,base,start,dir]of[[-4,0,11,-1],[4,5.3,-11,1]]){const length=22,ramp={x:r.ox+x,z:start,dir,length,w:3.5,base,rise:5.3};r.ramps.push(ramp);if(base){const lower={x:ramp.x,z:start-1.6,w:3.5,d:4.2,top:base};r.floorSlabs.push(lower);b(x,base-.12,lower.z,3.5,.24,4.2,'#eee7da',true);k.solids.at(-1).walkable=true;}k.stairs(ramp.x,start,3.5,length,5.3,dir>0?0:Math.PI,base);k.text(base?'2F → 3F':'1F → 2F',ramp.x,base+2.7,start,8,.65,'#d4cbbb','#64665f');
  // Raised extensions reach the transverse balcony without a phantom height jump.
  const end=start+dir*length;const zz=end+dir*1.9,slab={x:ramp.x,z:zz,w:3.5,d:4.4,top:base+5.3};r.floorSlabs.push(slab);b(x,base+5.18,zz,3.5,.24,4.4,'#eee7da',true);k.solids.at(-1).walkable=true;
 }
 r.heightAt=(x,z,feet=0)=>{let floor=0;for(const p of r.floorSlabs)if(Math.abs(x-p.x)<=p.w/2&&Math.abs(z-p.z)<=p.d/2&&p.top<=feet+.35)floor=Math.max(floor,p.top);for(const p of r.ramps){const along=(z-p.z)*p.dir;if(Math.abs(x-p.x)<p.w/2&&along>=0&&along<=p.length){const n=Math.ceil(p.rise/.18),y=p.base+p.rise*Math.min(n,Math.floor(along/p.length*n)+1)/n;if(y<=feet+.35&&y>=floor)floor=y;}}return floor;};
 if(ifs){const shape=new THREE.Shape([new THREE.Vector2(-w/2,-d/2),new THREE.Vector2(w/2,-d/2),new THREE.Vector2(w/2,d/2),new THREE.Vector2(-w/2,d/2)]),hole=new THREE.Path();hole.absellipse(0,0,15,11,0,Math.PI*2,true);shape.holes.push(hole);const geo=new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:false});geo.rotateX(-Math.PI/2);for(const y of[5.3,10.6]){const m=new THREE.Mesh(geo,cityMaterial('#eeeae2','stone'));m.position.set(r.ox,y+.02,0);m.name='ifs-oval-atrium-gallery';m.receiveShadow=true;r.g.add(m);}const structuralHeight=r.heightAt;r.heightAt=(x,z,feet=0)=>{let floor=structuralHeight(x,z,feet);if(Math.abs(x-r.ox)<w/2&&Math.abs(z)<d/2&&((x-r.ox)/15)**2+(z/11)**2>1)for(const y of[5.3,10.6])if(y<=feet+.35)floor=Math.max(floor,y);return floor;};for(const [rx,rz,y]of[[25,21,18.4],[22,18,18],[19,15,17.7]]){const curve=new THREE.CatmullRomCurve3(Array.from({length:65},(_,i)=>new THREE.Vector3(r.ox+Math.cos(i/64*Math.PI*2)*rx,y,Math.sin(i/64*Math.PI*2)*rz)),true);const m=new THREE.Mesh(new THREE.TubeGeometry(curve,80,.22,6,true),material('#e1d5c1'));r.g.add(m);}b(0,19,0,42,.06,32,k.glow('#f4ead1'));}else{k.text('UNIQLO',r.ox,16.5,-d/2+.24,26,3.3,'#d31c2b','#fff');}
}
