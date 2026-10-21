import {buildChangjunCampus} from './campus.js';
import {addStoryScreen} from './story/screens.js';
import * as THREE from '../vendor/three.module.js';
import {CITY,bounds,districts,roads,facilities,undergroundEntrances,project,perimeterParking,beichenLink} from './layout.js';
import {UrbanKit,indexColliders} from './city-kit.js';
import {material,surface} from '../visuals/model-kit.js';
import {humanModel} from '../visuals/characters.js';
import {cityMaterial,cityGlass} from './materials.js';
import {createFrontagePlanner} from './frontage-layout.js';
import {packCityInstances} from './static-cells.js';
import {addLandmarkDress,makeHuangxingStatue,dressHeiwado,dressIFS,dressStreetGround,dressWuyiLandscape} from './landmark-detail.js';
export function buildChapter4(api){
 const root=new THREE.Group();root.name=CITY;root.visible=false;api.scene.add(root);const kits=[],chunks=[],nightMaterials=[],solids=[],props=[],features=[],stairZones=[];
 function kit(name,x=0,z=0,radius=150){const g=new THREE.Group();g.name=name;root.add(g);const k=new UrbanKit(g,api);kits.push(k);chunks.push({g,x,z,radius});return k;}
 const streets=kit('c4-streets',0,-220,2000),groundShape=new THREE.Shape([new THREE.Vector2(bounds.minX,-bounds.minZ),new THREE.Vector2(bounds.maxX,-bounds.minZ),new THREE.Vector2(bounds.maxX,-bounds.maxZ),new THREE.Vector2(bounds.minX,-bounds.maxZ)]);
 for(const e of undergroundEntrances){const x=e.at[0],z=e.at[1];groundShape.holes.push(new THREE.Path([new THREE.Vector2(x-2.9,-z-.2),new THREE.Vector2(x+2.9,-z-.2),new THREE.Vector2(x+2.9,-z+14.5),new THREE.Vector2(x-2.9,-z+14.5)]));}
 const groundGeo=new THREE.ShapeGeometry(groundShape);groundGeo.rotateX(-Math.PI/2);const ground=new THREE.Mesh(groundGeo,cityMaterial('#c1c0b8','granite'));ground.position.y=-.01;ground.receiveShadow=true;ground.name='c4-ground-with-open-stairwells';root.add(ground);
 for(const [name,ps,width,kind]of roads){for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
  streets.box(x,.02,z,width+5,.08,len+3,cityMaterial('#c3c4bd','granite'),false,angle);streets.box(x,.07,z,width,.045,len+2,kind==='motor'?cityMaterial('#a5a9ac','asphalt'):cityMaterial('#c1c2bb','granite'),false,angle,undefined);
  if(kind==='motor'){for(let d=4;d<len-2;d+=11){const f=d/len;streets.box(a[0]+dx*f,.099,a[1]+dz*f,.16,.018,4,'#e6d6ad',false,angle);}for(const side of[-1,1])streets.box(x+Math.cos(angle)*side*(width/2-.3),.1,z-Math.sin(angle)*side*(width/2-.3),.13,.02,len,'#e6ded0',false,angle);}
  else {streets.box(x,.103,z,1.8,.018,len-.4,cityMaterial('#929b9b','granite'),false,angle);for(let d=4;d<len;d+=12){const f=d/len;streets.box(a[0]+dx*f,.104,a[1]+dz*f,width,.025,.12,'#919a98',false,angle);}}
 }features.push({tags:{highway:kind==='motor'?'primary':'footway',name},points:ps});}
 // Zebra crossings are real connections across the two remaining car streets.
 for(const z of[-465,-890,250])for(let i=-5;i<=5;i++)streets.box(i*1.5,.13,z,.72,.04,z===-890?26:20,'#e8e3d3');
 const junctions=[[-330,575],[-330,435],[-330,250],[0,320],[0,250],[320,250],[350,80],[350,-465],[-355,-465],[0,-465],[-355,-890],[0,-890],[350,-890],[-80,435],[170,435],[350,435],[350,250],[350,-350],[-462,250],[-462,-325],[-462,-465],[-462,-890]];
 for(const [x,z]of junctions){streets.box(x,.02,z,35,.08,35,'#b7b5ab',false,0,'stone');streets.box(x,.09,z,31,.055,31,'#454c53');}
 const motor=(x,z)=>junctions.some(p=>Math.hypot(x-p[0],z-p[1])<16)||perimeterParking.some(p=>Math.abs(x-p.at[0])<10.5&&Math.abs(z-p.at[1])<12)||roads.some(([,ps,w,kind])=>kind==='motor'&&ps.slice(1).some((b,i)=>project(x,z,ps[i],b).d<w/2+.15));
 for(const p of perimeterParking){const [x,z]=p.at;streets.box(x,.11,z,21,.05,24,cityMaterial('#a5a9ac','asphalt'));for(const side of[-1,1])for(let i=0;i<3;i++){const zz=z-8+i*8;streets.box(x+side*7,.15,zz,6,.025,.12,'#e8e3d3');streets.box(x+side*10,.15,zz+3.8,.12,.025,7.6,'#e8e3d3');}streets.sign(p.name,x+13,z-8,0,14,Math.PI/2);}
 streets.sign('北辰三角洲 ↑　五一广场 / IFS ↓',378,-1010,0,22,Math.PI/2);
 streets.sign('五一 / IFS ↑　黄兴广场 ←',378,-332,0,21,Math.PI/2);
 streets.sign('中北部车道 →　长郡 / 南门口 ←',160,455,0,25,Math.PI);
 streets.sign('解放西 / 五一 ↑　坡子街 →',-478,-285,0,22,Math.PI/2);
 for(let z=220;z> -1060;z-=70){streets.lamp(365,z);if(z> -890)streets.lamp(-478,z);}
 // Bollards reinforce the pedestrian boundary, while leaving a clear centre
 // for people. Cars cannot pass even if the bollards are destroyed.
 for(const z of[211,-433,-487,-871])for(const x of[-10,-6,-2,2,6,10]){streets.rounded(.32,.95,.32,'#555b5b',x,.48,z);streets.box(x,.69,z,.36,.14,.36,'#dac289',true);solids.push({x,z,w:.32,d:.32,bottom:0,top:1,walkable:false});}
 // Pavement furniture is spaced into pockets rather than filling the walk lane.
 for(let z=195;z> -845;z-=42)for(const side of[-1,1]){streets.lamp(side*13.8,z,0);if(Math.round(z)%3===0)streets.bench(side*14,z-7,0,side>0?Math.PI/2:-Math.PI/2);if(Math.round(z)%5===0)streets.bin(side*14,z+5,0,'c4:bin:'+side+':'+z);}
 for(let x=-420;x<320;x+=42){streets.lamp(x,-479,0);streets.lamp(x,-906,0);}
 const planner=createFrontagePlanner();let serial=0;
 function frontage(s,radius=200){if(!planner.clear(s))return false;planner.claim(s);const p=s.at,k=kit('c4-shop-block-'+serial,p[0],p[1],radius);k.facade(s);serial++;return true;}
 const firePalace={name:'火宫殿',at:[-302,-341],angle:0,w:46,d:28,h:20,style:'heritage',heritage:true,type:'snack'};
 if(frontage(firePalace,250))addLandmarkDress(kits.at(-1),firePalace,'fire-palace');
 // Two photographed-style corner volumes frame the statue view instead of
 // stopping the street walls a hundred metres before the plaza.
 for(const side of[-1,1]){const s={name:side<0?'司门口 · 城市生活':'黄兴路 · 商业街',at:[side*(side<0?41:49),-393],angle:side>0?-Math.PI/2:Math.PI/2,w:45,d:26,h:31,style:'ribbon',type:'retail'};if(frontage(s,300)){const k=kits.at(-1);addLandmarkDress(k,s,side<0?'pavilion':'corner-screen');if(side<0){k.box(s.at[0]+2.6,20,s.at[1],.55,14.4,43,'#343b3e');addStoryScreen(k,{x:s.at[0]+3,z:s.at[1],y:20,w:41,h:14,angle:Math.PI/2});}else k.root.traverse(e=>{if(e.userData.cityScreen)e.userData.mainScreen=true;});for(const end of[-1,1]){const z=s.at[1]+end*14;k.box(s.at[0]-side*2.4,9.4,z,.4,4.4,10,'#343b3e');addStoryScreen(k,{x:s.at[0]-side*2.8,z,y:9.4,w:9.6,h:4,angle:s.angle});}}}
 // Near-continuous frontage with mixed shop bay widths and real side alleys.
 const shopNames=['长沙米粉','河岸鞋履','旧书与新茶','街角咖啡','日常衣着','炊烟小馆','手作甜品','暮色影像','银饰小铺','生活杂货','城市运动','湘味食堂'];
 for(const phase of[0,12.75])for(let z=207-phase;z> -870;z-=25.5)for(const side of[-1,1]){
  const index=Math.round((207-z)/25.5)+(side>0?3:0),south=z>120;
  frontage({name:shopNames[index%shopNames.length],at:[side*15.4,z],angle:side>0?-Math.PI/2:Math.PI/2,w:phase?12:24.8,d:22+(index%3)*2,h:south?15+(index%3)*3:23+(index%4)*3.2,type:index%4===0?'snack':index%4===1?'tea':'retail',style:south?'bays':['ribbon','bays','metal','balcony'][index%4]});
 }
 for(const [streetX,start,end]of[[-355,-355,-870],[-90,133,-285]])for(const phase of[0,11])for(let z=start-phase;z>end;z-=23)for(const side of[-1,1]){
  frontage({name:['老长沙茶铺','手作小店','巷口面馆','书与日常'][serial%4],at:[streetX+side*9.3,z],angle:side>0?-Math.PI/2:Math.PI/2,w:phase?10:22.4,d:19,h:11.5+(serial%3)*1.6,heritage:streetX===-355,style:streetX===-355?'heritage':'balcony',type:serial%3===0?'tea':'retail'},185);
 }
 // Shop walls along the car avenue do not turn it into a pedestrian road.
 for(const z of[-449,-482])for(let x=-455;x<290;x+=29){frontage({name:['夜色唱片','晚风餐厅','精酿小馆','街角酒馆','长沙夜食','现场 LIVE'][serial%6],at:[x,z],angle:z===-449?Math.PI:0,w:28.3,d:z===-449?18:15,h:19+(serial%3)*4,type:serial%4===0?'bar':'retail',style:serial%2?'ribbon':'metal'},220);}
 for(const [z,angle]of[[-312,Math.PI],[-340,0]])for(let x=-419;x< -47;x+=28){frontage({name:['湘味食堂','糖油粑粑','坡子街老茶铺','夜宵小馆'][serial%4],at:[x,z],angle,w:27.4,d:19,h:15+(serial%3)*3.4,type:'snack',style:'bays'},200);}
 for(const x of[-440,-270,265,403])for(let z=495;z> -1030;z-=93){frontage({name:'',at:[x,z+22],w:52,d:38,h:32+(serial%5)*8,angle:0,style:'ribbon'},380);}
 dressStreetGround(streets,{roads,motor,facilities});
 for(const s of facilities){if(s.id==='c4_classroom_home')continue;const k=kit(s.id,s.at[0],s.at[1],s.type==='ifs'?850:s.type==='clothing'?260:155);const f=k.facade(s);
  if(s.type==='clothing')heiwado(k,f,s);
  if(s.type==='ifs')ifs(k,f,s);
  if(['bar','ktv','arcade','net','billiards'].includes(s.type)){const p=f.pos(-s.w/2+1,-1.6);k.box(p[0],9,p[1],.6,7,.6,k.glow(s.type==='bar'?'#df5aab':'#64bdd1'));const q=f.pos(s.w/2-2,-2);k.text(s.type==='bar'?'BAR':s.type==='ktv'?'KTV':s.type==='billiards'?'BILLIARDS':'PLAY',q[0],8.8,q[1],6,1.2,'#273442','#f59acc',s.angle);}
  if(s.type==='billiards'){const x=s.at[0],z=s.at[1]-14;k.stairs(x,z,3.6,14,4,0);stairZones.push({x,z,w:3.6,run:14,rise:4,dir:1});f.txt('2F ↗ 台球',0,7.2,0,7,.8,'#394b4c','#f7e8c7');}
  features.push({tags:{building:'yes',name:s.name},points:[[s.at[0]-s.w/2,s.at[1]-s.d],[s.at[0]+s.w/2,s.at[1]-s.d],[s.at[0]+s.w/2,s.at[1]],[s.at[0]-s.w/2,s.at[1]]]});
 }
 const campus=kit('c4-changjun-campus',-217,341,235),campusInfo=buildChangjunCampus(campus);stairZones.push(campusInfo.zone);features.push(...campusInfo.features);
 const square=kit('c4-huangxing-square',0,-350,240);square.box(0,.06,-350,66,.08,112,cityMaterial('#bdc0b9','granite'));
 for(const x of[-29,-25,25,29])square.box(x,.12,-350,.48,.035,110,cityMaterial('#828d8d','granite'));
 for(const z of[-398,-302])square.box(0,.12,z,58,.035,.5,cityMaterial('#828d8d','granite'));
 // Huang Xing's coat, upright body, raised right hand and plinth are recognisable
 // from the photographed landmark, rather than a geometric objective marker.
 makeHuangxingStatue(square);
 square.sign('南 · 南门口 / 长郡　北 · 五一广场',22,-329,0,25);square.sign('← 解放西 / 坡子街　地下商业街 ↘',23,-392,0,24);
 const park=kit('c4-wuyi-park',80,-970,220);dressWuyiLandscape(park);
 const wuyi=kit('c4-wuyi-hub',-80,-900,350);wuyi.bench(-25,-916,0);for(const x of[-215,-120]){const s={name:x===-215?'城市百货':'五一 · 商业中心',at:[x,-954],w:55,d:48,h:x===-215?44:36,angle:0,style:'metal',type:'retail'};wuyi.facade(s);addLandmarkDress(wuyi,s,'corner-screen');}
 for(const e of undergroundEntrances){const k=kit(e.id,e.at[0],e.at[1],100),x=e.at[0],z=e.at[1];k.stairs(x,z,5,14,-6,Math.PI,0);stairZones.push({x,z,w:5,run:14,rise:-6,angle:Math.PI});
  // Stairs have open heads and matching retaining walls down both sides.
  for(const side of[-1,1])for(let i=0;i<28;i++){const f=(i+.5)/28,zz=z-14*f,fy=-6*f;k.box(x+side*2.85,(fy+1.05)/2,zz,.5,1.05-fy,.52,'#797f7b',true);}
  k.box(x,4.4,z-1.5,6.5,.16,4.2,k.glass);for(const side of[-1,1]){k.box(x+side*2.95,2.1,z-1.5,.13,4.2,.13,'#b3c2ba');k.box(x+side*2.8,2.05,z-2.1,.07,4.1,3.8,k.glass);for(const off of[-3.8,0])k.beam([x+side*2.95,0,z+off],[x+side*2.95,4.35,z+off],.04,'#8b9c9b');}for(const off of[-3.6,-1.5,.6])k.box(x,4.47,z+off,6.45,.09,.12,'#849393');k.text(e.name,x,3.9,z+.3,10,.8,'#345c68','#e8f2d7');}
 const heightAt=(x,z)=>{for(const s of stairZones){const along=(z-s.z)*(s.dir||-1);if(Math.abs(x-s.x)<s.w/2+.05&&along>=0&&along<=s.run+.4){const n=Math.ceil(Math.abs(s.rise)/.18);const step=s.rise<0?Math.ceil(along/s.run*n-1e-7):Math.floor(along/s.run*n)+1;return s.rise*Math.min(n,Math.max(0,step))/n;}}return campusInfo.heightAt(x,z);};
 const contains=(x,z)=>x>bounds.minX&&x<bounds.maxX&&z>bounds.minZ&&z<bounds.maxZ;
 const lightAnchors=[];for(const k of kits){k.finish();solids.push(...k.solids);props.push(...k.props);nightMaterials.push(...k.nightMaterials);lightAnchors.push(...k.lightAnchors);}
 const packed=packCityInstances(root,kits);chunks.push(...packed.chunks);
 // Night uses a fixed three-light layout; daytime uses the prewarmed zero-light
 // layout. Anchor changes never change the shader layout or daytime GPU cost.
 const collision=indexColliders(solids,heightAt),lights=[];for(let i=0;i<3;i++){const l=new THREE.PointLight('#ffe5b5',0,34,2);l.visible=false;root.add(l);l.castShadow=false;lights.push(l);}let lastLights=-Infinity,lastX=Infinity,lastZ=Infinity,near=[];
 const places=[...campusInfo.places,...districts.map(s=>({id:s.id,name:s.name,short:s.name,entry:s.at})),...facilities.map(s=>({id:s.id,name:s.name,short:s.name,entry:s.at})),...undergroundEntrances.map(e=>({id:e.id,name:e.name,short:'地下入口',entry:e.at})),...perimeterParking.map(p=>({id:p.id,name:p.name,short:'停车',entry:p.at})),{id:'c4_beichen_exit',name:'北辰三角洲 · 北向通车连接',short:'北辰方向',entry:[beichenLink.cityX,-1038]},{id:'c4_tunnel_exit',name:'南湖路湘江隧道 · 返回岳麓山',short:'湘江隧道',entry:[-475,575]}];
 return{id:CITY,name:'第四章 · 放学以后 / 长沙市中心',root,mapOnly:true,bounds,land:[[bounds.minX,bounds.minZ],[bounds.maxX,bounds.minZ],[bounds.maxX,bounds.maxZ],[bounds.minX,bounds.maxZ]],contains,heightAt,canDrive:(x,z)=>contains(x,z)&&motor(x,z)&&heightAt(x,z)===0,...collision,roads,features,places,solids,props,nightMaterials,pedestrians:[],traffic:[],spawn:[-470,575],safe:[-330,575],parkedVehicles:[{at:[-324,556],color:'#abb8b0'},{at:[345,-712],color:'#5b7892'}],chunks,stairZones,campus:campusInfo,
 update(dt,t,p,night){if(!p)return;for(const c of chunks)c.g.visible=Math.hypot(p.x-c.x,p.z-c.z)<c.radius+140;if(night&&(t-lastLights>.25||Math.hypot(p.x-lastX,p.z-lastZ)>8)){near=[];for(const a of lightAnchors){const d=(p.x-a.x)**2+(p.z-a.z)**2;if(d>55**2)continue;let i=0;while(i<near.length&&near[i].d<d)i++;if(i<3){near.splice(i,0,{a,d});near.length=Math.min(near.length,3);}}lastLights=t;lastX=p.x;lastZ=p.z;}for(let i=0;i<lights.length;i++){const l=lights[i],a=night&&near[i]?.a;l.visible=!!night;l.intensity=a&&Math.hypot(p.x-a.x,p.z-a.z)<55?a.strength:0;if(a){l.position.set(a.x,a.y,a.z);l.color.set(a.color);}}},lightAnchors,
 stats:{blocks:serial,facilities:facilities.length,landmarks:districts.length,rigidPacking:packed.stats}};
}
function heiwado(k,f,s){dressHeiwado(k,f,s);}
function ifs(k,f,s){dressIFS(k,f,s);}
