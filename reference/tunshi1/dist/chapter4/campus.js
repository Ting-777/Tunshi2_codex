import * as THREE from '../vendor/three.module.js';
import {cityMaterial,cityGlass} from './materials.js';
import {campusBounds,campusGate,academicRoad,dormEntry,campusBuildings,campusPlaces} from './campus-layout.js';

const sphere=new THREE.SphereGeometry(1,18,12),bronze=cityMaterial('#82724c','metal'),patina=cityMaterial('#536f60','metal');
const stone=cityMaterial('#b8bab1','stone'),blue=cityMaterial('#4e8dac','metal'),white=cityMaterial('#e4e1d5','stone'),glass=cityGlass(false);
function item(k,name,at,data={}){const g=new THREE.Group();g.name=name;g.position.set(...at);g.userData={campus:true,...data};k.root.add(g);return g;}
function ellipsoid(k,at,scale,mat,angle=0){const m=new THREE.Object3D();m.position.set(...at);m.rotation.y=angle;m.scale.set(...scale);m.updateMatrix();k.batch.add(sphere,mat,m.matrix);}
function line(k,a,b,width=.055,color='#eeeedd',y=.145){const dx=b[0]-a[0],dz=b[1]-a[1];k.box((a[0]+b[0])/2,y,(a[1]+b[1])/2,width,.014,Math.hypot(dx,dz),color,false,Math.atan2(dx,dz));}
function curveLine(k,points,color,width=.04){const p=points.map(v=>new THREE.Vector3(...v));const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p),p.length*2,width,5,false),cityMaterial(color));mesh.name='c4-campus-court-marking';k.root.add(mesh);}

function gate(k){const [x,z]=campusGate,b=campusBounds;
 k.box((b.minX+b.maxX)/2,.025,(b.minZ+b.maxZ)/2,b.maxX-b.minX,.04,b.maxZ-b.minZ,cityMaterial('#c4c2b8','granite'));
 for(const xx of[b.minX,b.maxX]){k.box(xx,1.4,(b.minZ+b.maxZ)/2,.6,2.8,b.maxZ-b.minZ,stone,true);k.box(xx,2.85,(b.minZ+b.maxZ)/2,.84,.15,b.maxZ-b.minZ+.6,'#6f7a77');}
 k.box((b.minX+b.maxX)/2,1.4,b.minZ,b.maxX-b.minX,2.8,.6,stone,true);k.box((b.minX+b.maxX)/2,2.85,b.minZ,b.maxX-b.minX+.6,.15,.84,'#6f7a77');
 for(const [a,c]of[[b.minX,x-24],[x+24,b.maxX]]){k.box((a+c)/2,1.4,z,c-a,2.8,.6,stone,true);k.box((a+c)/2,2.85,z,c-a,.15,.84,'#6f7a77');}
 for(const xx of[-22,-8,8,22])k.box(x+xx,2.5,z,1.6,5,1.8,'#515657',true,0,'stone');k.box(x,5.45,z,49,1.7,3.2,'#515657',true,0,'stone');
 for(let xx=-23;xx<24;xx+=.6)k.box(x+xx,4.65,z+.8,.25,.13,2.9,'#896e48');k.text('长郡中学',x,5.5,z+1.65,27,1.15,'#4e5455','#e5be63');
 for(const xx of[-23,-8,8,23])k.text('朴实沉毅',x+xx,2.85,z+1,1,3.8,'#515657','#d6bc71');
 for(let xx=-18;xx<=18;xx+=6){k.beam([x+xx,6.3,z],[x+xx,8.8,z],.025,'#acb4b4');k.box(x+xx+1,8.25,z,2,.95,.03,'#ae2631');}
 for(const xx of[-229,-197]){k.box(xx,2.6,z-.9,.35,4.3,.2,'#909b96');for(let dx=-4;dx<=4;dx+=.4)k.box(xx+dx,1.9,z-.8,.07,3.5,.09,'#909b96');k.box(xx,3.66,z-.8,8.5,.1,.16,'#909b96');}
 item(k,'c4-campus-rectangular-wall',[x,0,z],{bounds:b,motto:'朴实沉毅'});
}

function building(k,s){const {x,z,w,d,h,type}=s;item(k,s.id,[x,0,z],{name:s.name,footprint:{w,d},height:h});
 const plaster=cityMaterial(type==='classroom'?'#d3c6b4':'#e0dfd6','plaster'),trim=cityMaterial('#aab7b9','metal');
 if(type==='dorm'){
  // A real west-facing 2F wall opening; the lower/upper wall bands leave the
  // advertised door clear instead of painting it onto a solid building box.
  for(const side of[-1,1])k.box(x,h/2,z+side*d/2,w,h,.4,plaster,true);
  k.box(x+w/2,h/2,z,.4,h,d,plaster,true);
  for(const zz of[z-8.2,z+8.2])k.box(x-w/2,h/2,zz,.4,h,11.6,plaster,true);
  k.box(x-w/2,2,z,.4,4,4.8,plaster,true);k.box(x-w/2,(h+7.9)/2,z,.4,h-7.9,4.8,plaster,true);
 }else k.box(x,h/2,z,w,h,d,plaster,true);
 k.box(x,h+.12,z,w+.7,.24,d+.7,white);k.box(x,.22,z,w+.35,.44,d+.35,stone);
 const floor=3.5,levels=Math.floor(h/floor),stand=type==='dorm'?.24:0;
 for(let row=0;row<levels;row++){const y=1.9+row*floor;
  for(const side of[-1,1]){
   for(let xx=-w/2+2.5;xx<w/2-1;xx+=4.1){k.box(x+xx,y,z+side*(d/2+.035+stand),2.55,2.12,.08,glass);k.box(x+xx,y,z+side*(d/2+.10+stand),.09,2.2,.13,white);for(const dy of[-1.12,1.12])k.box(x+xx,y+dy,z+side*(d/2+.1+stand),2.8,.1,.2,white);}
   k.box(x,row*floor+.48,z+side*(d/2+.18+stand),w,.24,.42,type==='science'?blue:trim);
  }
  for(const side of[-1,1])for(let zz=-d/2+2.2;zz<d/2-1;zz+=4.1){if(type==='dorm'&&side===-1&&row===1&&Math.abs(zz)<3)continue;k.box(x+side*(w/2+.04+stand),y,z+zz,.08,2.15,2.5,glass);for(const dy of[-1.12,1.12])k.box(x+side*(w/2+.10+stand),y+dy,z+zz,.18,.1,2.7,white);k.box(x+side*(w/2+.11+stand),y,z+zz,.16,2.15,.09,white);}
 }
 for(const side of[-1,1])for(const end of[-1,1]){const xx=x+side*(w/2+.11+stand),zz=z+end*(d/2+.12);k.beam([xx,.4,zz],[xx,h-.3,zz],.06,'#939f9e');}
 if(type==='science'){
  // White projecting end walls, full-height blue glazing and attached blue
  // louvre boxes: the silhouette follows reference 3 rather than a shop grid.
  for(const side of[-1,1]){k.box(x+side*(w/2-5),h/2,z+d/2+.35,9,h,.65,white);k.text(side<0?'科\n学':'求\n真',x+side*(w/2-5),h*.57,z+d/2+.72,3.3,10,'#e4e1d5','#337a9b');}
  k.box(x,h/2,z+d/2+.15,3,h,.14,glass);for(let y=1.5;y<h;y+=3.5)k.box(x,y,z+d/2+.28,3.1,.09,.15,trim);
  for(let y=5.5;y<h;y+=3.5)for(const xx of[-17,-10,10,17]){k.box(x+xx,y,z+d/2+1.2,2.7,2.2,.15,blue);for(let dy=-.85;dy<=.86;dy+=.23)k.box(x+xx,y+dy,z+d/2+1.45,2.8,.055,.5,blue);for(const side of[-1,1])k.box(x+xx+side*1.4,y,z+d/2+.76,.12,2.2,1.3,blue);}
  k.box(x,h+1.05,z,w-5,1.8,d-4,cityMaterial('#dadbd3'));k.text('科学馆',x,h+1,z+d/2+.15,12,1.2,'#e0dfd6','#407993');
 }else if(type==='gym'){
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);for(let i=0;i<=32;i++){const a=Math.PI-i*Math.PI/32;shape.lineTo(Math.cos(a)*w/2,Math.sin(a)*3.7);}shape.lineTo(w/2,0);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:d+.8,bevelEnabled:false});geo.translate(0,0,-d/2-.4);const roof=k.mesh(geo,cityMaterial('#879d9c','metal'),'c4-campus-gym-barrel-roof');roof.position.set(x,h,z);
  for(let xx=-w/2+4;xx<w/2;xx+=7)k.text(['跑','跳','球','游'][Math.floor((xx+w/2)/7)%4],x+xx,h-2,z+d/2+.16,2.1,2.1,'#528b93','#f4f2dc');
  k.text('图强体育馆',x,4.3,z+d/2+.2,19,1.4,'#dcdbd0','#496779');
 }else if(type==='dorm'){
  k.text('学生公寓',x,20.3,z+d/2+.16,17,1.7,'#dcdcd2','#446b7c');
  const doorX=x-w/2-.26;k.box(doorX+2.7,6,z,.2,3.8,4.6,'#425a63');k.box(doorX+1,3.96,z,2.3,.08,4.7,stone);for(const dz of[-2.45,2.45])k.box(doorX,6,z+dz,.25,4.05,.16,trim);
  k.box(doorX,8,z,.35,.2,5.2,trim);k.box(doorX+.2,4.04,z,1,.08,4.7,stone);
  k.text('2F · 流星雨教师子弟之家',doorX-.1,8.55,z,12,.9,'#597b80','#fff4de',-Math.PI/2);
  k.box(doorX-.55,8.12,z,1.8,.18,6.6,blue);k.text('牛奶绵绵冰',doorX-.65,7.2,z-5,5.5,.65,'#597b80','#fff4de',-Math.PI/2);
  for(let y=9;y<20;y+=3.5)for(const zz of[-7,7]){k.box(x-w/2-.55,y,z+zz,1,1,1.7,'#c6cecb');for(let i=-.65;i<=.66;i+=.18)k.box(x-w/2-1.07,y,z+zz+i,.03,.8,.035,'#596e70');}
 }else{k.text(s.name,x,4.4,z+d/2+.2,Math.min(15,w-1),1.3,'#d6cebd','#6a6154');for(let xx=-w/2+3;xx<w/2;xx+=6){k.box(x+xx,h-1.15,z+d/2+.18,3.6,1.3,.16,'#ba6d4e');}}
}

function bust(k,x,z,angle,index){const at=(dx,y,dz)=>[x+Math.cos(angle)*dx+Math.sin(angle)*dz,y,z-Math.sin(angle)*dx+Math.cos(angle)*dz];
 k.rounded(2.15,.18,2.15,stone,x,.09,z);k.box(x,1.02,z,1.65,1.85,1.65,cityMaterial('#934c43','stone'),true);k.rounded(1.88,.16,1.88,bronze,x,2.01,z);
 ellipsoid(k,at(0,2.24,0),[.66,.33,.45],bronze,angle);ellipsoid(k,at(0,2.77,0),[.62,.59,.59],bronze,angle);ellipsoid(k,at(0,2.57,.57),[.39,.20,.62],bronze,angle);ellipsoid(k,at(0,2.4,.53),[.38,.10,.51],patina,angle);
 for(const side of[-1,1]){ellipsoid(k,at(side*.36,2.91,.47),[.2,.24,.12],bronze,angle);ellipsoid(k,at(side*.38,2.93,.58),[.075,.11,.045],patina,angle);}
 const p=at(0,1.16,.86);k.text('豚师\n'+['求知','沉毅','朴实','笃行','弘毅'][index%5],p[0],p[1],p[2],.98,1.16,'#934c43','#d7c58f',angle);
 item(k,'c4-dolphin-bronze-bust',[x,0,z],{angle,index,headOnly:true});
}
function avenue(k){const x=academicRoad[0][0];k.box(x,.08,342.5,10,.065,123,cityMaterial('#8f9b9a','asphalt'));k.box(x,.12,342.5,.10,.014,121,'#cfbe79');
 for(const side of[-1,1]){k.box(x+side*5.35,.12,342.5,.35,.18,123,stone);for(let z=391;z>=282;z-=21){k.tree(x+side*8.3,z,1.98);k.box(x+side*8.3,.04,z,3.2,.05,4.5,'#667e55');}for(let i=0;i<5;i++)bust(k,x+side*7.7,380-i*21,side>0?-Math.PI/2:Math.PI/2,i);}
 for(const z of[403,366,335,300]){k.box(x,.1,z,16,.07,4,cityMaterial('#c3c1b6','granite'));}
 for(const z of[396,355,313,283]){k.lamp(x+14,z);k.bench(x-14,z,0,Math.PI/2);}
 k.sign('院士路 · 操场 ↑　校门 ↓',x-15,399,0,10);k.sign('学生公寓 2F · 教师子弟之家 →',-199,402,0,16);
 item(k,'c4-academic-tree-avenue',[x,0,342.5],{route:academicRoad,busts:10});
}

function garden(k){const x=-282,z=335;const water=new THREE.MeshStandardMaterial({color:'#4d8d88',roughness:.25,metalness:.12,transparent:true,opacity:.83});
 const shape=new THREE.Shape();shape.moveTo(-17,-8);shape.quadraticCurveTo(-23,-6,-19,3);shape.quadraticCurveTo(-16,11,-6,8);shape.quadraticCurveTo(8,11,17,5);shape.quadraticCurveTo(23,-6,11,-8);shape.quadraticCurveTo(-1,-12,-17,-8);
 const pool=new THREE.Mesh(new THREE.ShapeGeometry(shape,28),water);pool.rotation.x=-Math.PI/2;pool.position.set(x,.13,z);pool.name='c4-cheng-pond-water';k.root.add(pool);
 const points=shape.getPoints(56).map(p=>new THREE.Vector3(x+p.x,.16,z-p.y));const rim=k.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,true),90,.21,6,true),stone,'c4-cheng-pond-stone-rim');
 k.solids.push({x,z,w:34,d:14,bottom:0,top:.35,walkable:false});
 for(const [xx,zz,s]of[[-302,322,1.05],[-294,345,.95],[-266,324,1.1],[-264,345,1.25]])k.tree(xx,zz,s);
 for(const zz of[323.5,345.6]){k.box(-277,.043,zz,31,.03,2.3,'#728358');for(const xx of[-288,-282,-274,-267]){k.rounded(2.5,.65,1.35,cityMaterial('#527352'),xx,.38,zz);k.rounded(1.3,.58,1.0,cityMaterial('#738453'),xx+.7,.57,zz-.3);}}
 k.box(-243,.08,z,39,.06,4.6,cityMaterial('#c4c2b8','granite'));k.box(-255,.06,333,6,.06,28,cityMaterial('#c4c2b8','granite'));
 // Actual curved masonry with an open arch, tiered caps and pyramidal finials.
 const ax=-244,az=z,angle=Math.PI/2,pos=(dx,y,dz)=>[ax+Math.cos(angle)*dx+Math.sin(angle)*dz,y,az-Math.sin(angle)*dx+Math.cos(angle)*dz],granite=cityMaterial('#8b9da4','granite');
 for(const side of[-1,1]){const p=pos(side*4.8,2.35,0);k.box(...p,.72,4.7,.72,granite,true);for(const [y,w,h]of[[.15,1.02,.3],[.45,.87,.22],[4.55,1.22,.24],[4.88,1.08,.25],[5.18,.67,.42]]){const q=pos(side*4.8,y,0);k.box(...q,w,h,w,granite);}const fin=new THREE.Mesh(new THREE.ConeGeometry(.66,1.05,4),granite);fin.position.set(...pos(side*4.8,5.85,0));fin.rotation.y=Math.PI/4;k.root.add(fin);}
 const arch=new THREE.Shape();for(let i=0;i<=36;i++){const xx=-4.8+i*9.6/36;const yy=6.2-1.4*(xx/4.8)**2;if(i)arch.lineTo(xx,yy);else arch.moveTo(xx,yy);}for(let i=36;i>=0;i--){const xx=-4.8+i*9.6/36;arch.lineTo(xx,5-1.4*(xx/4.8)**2);}arch.closePath();const ag=new THREE.ExtrudeGeometry(arch,{depth:.52,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:1});ag.translate(0,0,-.26);const am=k.mesh(ag,granite,'c4-cheng-pond-stone-arch');am.position.set(ax,0,az);am.rotation.y=angle;
 for(let i=0;i<6;i++){const xx=(i-2.5)*1.04,p=pos(xx,5.58-1.4*(xx/4.8)**2,.3);k.text([...'長沙府中學堂'][i]||'',p[0],p[1],p[2],.82,.78,'#8b9da4','#5d7179',angle);}
 for(let i=0;i<12;i++){const dx=-4.4+(i+.5)*8.8/12,p=pos(dx,5.6-1.4*(dx/4.8)**2,0);k.solids.push({x:p[0],z:p[2],w:.8,d:.55,angle,bottom:p[1]-.56,top:p[1]+.56,walkable:false});}
 item(k,'c4-cheng-pond-arch',[ax,0,az],{opening:7.8,inscription:'長沙府中學堂'});
 // Pond pavilion, attached octagonal eaves and a clearly supported timber deck.
 const px=-295,pz=334,wood=cityMaterial('#865e43','wood'),roof=cityMaterial('#5b7772','tile');k.box(px,.10,pz,6.4,.2,6.4,stone);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,xx=px+Math.cos(a)*2.3,zz=pz+Math.sin(a)*2.3;k.beam([xx,.2,zz],[xx,3.7,zz],.12,wood);if(i!==0)k.beam([xx,1,zz],[px+Math.cos(a+Math.PI/3)*2.3,1,pz+Math.sin(a+Math.PI/3)*2.3],.045,wood);}
 for(const [r,y,h]of[[3.9,3.7,1.5],[2.3,4.8,1.1]]){const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,6),roof);m.position.set(px,y+h/2,pz);m.rotation.y=Math.PI/6;m.name='c4-cheng-pond-pavilion-roof';k.root.add(m);}ellipsoid(k,[px,6.05,pz],[.16,.36,.16],bronze);
 // The bridge joins both banks and passes above the water's blocking envelope.
 const bx=-295;for(let i=0;i<28;i++){const zz=323+i*22.8/27,yy=pondBridgeHeight(bx,zz);k.box(bx,yy-.065,zz,2.4,.13,.87,wood);for(const side of[-1,1]){k.beam([bx+side*1.32,yy,zz],[bx+side*1.32,yy+1,zz],.035,wood);if(i)k.beam([bx+side*1.32,pondBridgeHeight(bx,zz-22.8/27)+1,zz-22.8/27],[bx+side*1.32,yy+1,zz],.04,wood);}}
 for(const side of[-1,1])k.solids.push({x:bx+side*1.34,z:334.4,w:.15,d:22.8,bottom:.05,top:1.9,walkable:false});
 const rock=k.mesh(new THREE.SphereGeometry(1,8,6),cityMaterial('#a0a79c','stone'),'c4-cheng-pond-name-stone');rock.position.set(-257,.65,343);rock.scale.set(1.8,.9,.75);k.text('澄池',-257,.85,343.7,2.2,.8,'#a0a79c','#965c48');
 item(k,'c4-cheng-pond',[x,0,z],{pavilion:[px,pz],bridge:[bx,335]});
}
export function pondBridgeHeight(x,z){if(Math.abs(x+295)>1.2||z<322.5||z>346.3)return 0;const t=Math.min(1,Math.max(0,(z-323)/22.8));return Math.round(Math.sin(t*Math.PI)*.75*1000)/1000;}

function stadium(k){const x=-166,z=317,r=25,straight=18,inner=18.2,blueTrack=cityMaterial('#5b9db5','fabric');
 const stadiumPath=radius=>{const p=[];for(let i=0;i<=44;i++){const a=Math.PI-i*Math.PI/44;p.push([x+Math.cos(a)*radius,z-straight-Math.sin(a)*radius]);}for(let i=0;i<=44;i++){const a=-i*Math.PI/44;p.push([x+Math.cos(a)*radius,z+straight-Math.sin(a)*radius]);}return p;};
 const outer=stadiumPath(r),shape=new THREE.Shape(outer.map(p=>new THREE.Vector2(p[0],-p[1]))),track=k.mesh(new THREE.ShapeGeometry(shape),blueTrack,'c4-changjun-blue-running-track');track.rotation.x=-Math.PI/2;track.position.y=.065;
 const fieldShape=new THREE.Shape(stadiumPath(inner).map(p=>new THREE.Vector2(p[0],-p[1]))),field=k.mesh(new THREE.ShapeGeometry(fieldShape),cityMaterial('#639951','fabric'),'c4-changjun-football-infield');field.rotation.x=-Math.PI/2;field.position.y=.09;
 for(let i=0;i<=8;i++){const rr=inner+(r-inner)*i/8,ps=stadiumPath(rr);ps.push(ps[0]);curveLine(k,ps.map(p=>[p[0],.11,p[1]]),'#e4eee9',.025);}
 for(let i=0;i<10;i++)k.box(x,.116,z-24.5+i*5.45,26.8,.015,5.45,cityMaterial(i%2?'#74a45f':'#63934f','fabric'));
 const w=27,d=55;for(const side of[-1,1]){line(k,[x+side*w/2,z-d/2],[x+side*w/2,z+d/2]);line(k,[x-w/2,z+side*d/2],[x+w/2,z+side*d/2]);}line(k,[x-w/2,z],[x+w/2,z]);
 curveLine(k,Array.from({length:49},(_,i)=>[x+Math.cos(i/48*Math.PI*2)*4.7,.146,z+Math.sin(i/48*Math.PI*2)*4.7]),'#eeeedd',.025);
 for(const side of[-1,1]){const goal=z+side*d/2;for(const [hw,depth]of[[8,8],[3.3,3]]){line(k,[x-hw,goal],[x-hw,goal-side*depth]);line(k,[x+hw,goal],[x+hw,goal-side*depth]);line(k,[x-hw,goal-side*depth],[x+hw,goal-side*depth]);}
  for(const dx of[-2.6,2.6]){k.beam([x+dx,.12,goal],[x+dx,2.2,goal],.065,'#e2e9e2');k.beam([x+dx,2.2,goal],[x+dx,1.8,goal+side*1.4],.04,'#e2e9e2');}k.beam([x-2.6,2.2,goal],[x+2.6,2.2,goal],.065,'#e2e9e2');for(let dx=-2.6;dx<=2.61;dx+=.43)k.beam([x+dx,1.8,goal+side*1.4],[x+dx,.12,goal+side*1.4],.008,'#d9e4d7');for(let y=.12;y<1.9;y+=.35)k.beam([x-2.6,y,goal+side*1.4],[x+2.6,y,goal+side*1.4],.009,'#d9e4d7');
 }
 for(const zz of[306,317,328]){for(const side of[-1,1]){line(k,[-147+side*2.3,zz-4.1],[-147+side*2.3,zz+4.1],.03,'#d1e2d8',.139);line(k,[-149.3,zz+side*4.1],[-144.7,zz+side*4.1],.03,'#d1e2d8',.139);}line(k,[-149.3,zz],[-144.7,zz],.03,'#d1e2d8',.139);}
 k.text('朴实沉毅 · 强健体魄',-165,1.8,268.35,33,1.5,'#657e80','#f1e8d1');
 item(k,'c4-campus-athletics', [x,0,z],{outerRadius:r,straightHalf:straight,lanes:8,trackColor:'blue',football:true});
 for(const zz of[371.5,393.5])basketball(k,-190,zz);
}
function basketball(k,x,z){const w=14,d=19;k.box(x,.07,z,w,.04,d,cityMaterial('#7faaa0','fabric'));k.box(x,.094,z,w-2,.014,d-2,cityMaterial('#a86352','fabric'));for(const side of[-1,1]){line(k,[x+side*w/2,z-d/2],[x+side*w/2,z+d/2]);line(k,[x-w/2,z+side*d/2],[x+w/2,z+side*d/2]);}line(k,[x-w/2,z],[x+w/2,z]);curveLine(k,Array.from({length:33},(_,i)=>[x+Math.cos(i/32*Math.PI*2)*1.6,.146,z+Math.sin(i/32*Math.PI*2)*1.6]),'#efeada',.025);
 for(const side of[-1,1]){const end=z+side*8.1;for(const dx of[-1.8,1.8])line(k,[x+dx,end],[x+dx,end-side*4.2]);line(k,[x-1.8,end-side*4.2],[x+1.8,end-side*4.2]);k.beam([x,0,end+side*.8],[x,3.8,end+side*.8],.07,'#53766d');k.box(x,3.5,end,2.2,1.35,.11,white);const rim=new THREE.Mesh(new THREE.TorusGeometry(.38,.04,6,24),cityMaterial('#b06c4a','metal'));rim.position.set(x,3,end-side*.6);rim.rotation.x=Math.PI/2;k.root.add(rim);for(let i=0;i<8;i++){const a=i*Math.PI/4;k.beam([x+Math.cos(a)*.35,3,end-side*.6+Math.sin(a)*.35],[x+Math.cos(a)*.2,2.55,end-side*.6+Math.sin(a)*.2],.011,'#dbdfd1');}}
 item(k,'c4-campus-basketball-court',[x,0,z],{replacement:'teacher-apartments',w,d});
}

function dormStairs(k){const {at,floor,stairs:[x,z],run,width,landing:l}=dormEntry;
 k.stairs(x,z,width,run,floor,Math.PI);const zone={x,z,w:width,run,rise:floor,dir:-1};
 k.box(l.x,floor-.1,l.z,l.w,.2,l.d,stone);for(const xx of[-177,-166])k.box(xx,1.9,386,.22,3.8,.22,'#7c9396');
 // Rails follow the landing boundary and leave a 3.6 m gap at the top tread.
 for(const side of[-1,1]){const sx=x+side*(width/2+.1);k.rail([sx,z],[sx,z-run],0,floor,'#7c9396');}
 k.rail([-178,384.3],[-165.1,384.3],floor,floor,'#7c9396');k.rail([-173.8,388.7],[-165.1,388.7],floor,floor,'#7c9396');k.rail([-178,384.3],[-178,388.7],floor,floor,'#7c9396');
 k.text('2F ↑ 教师子弟之家',x,2.7,z+.5,8,.8,'#597b80','#fff4de');
 item(k,'c4-home-real-second-floor-stairs',[x,0,z],{zone,landing:l,entry:at,floor});return{zone,landing:{...l,top:floor}};
}

export function buildChangjunCampus(k){gate(k);for(const s of campusBuildings)building(k,s);avenue(k);garden(k);stadium(k);const stairs=dormStairs(k);
 // Maintain the familiar street-side stop, outside the campus walls.
 k.box(-102,2.1,448,18,.3,4,'#51736b');for(const xx of[-108,-96])k.box(xx,1,448,.14,2,.14,'#45565c');k.text('学院街 · 公交站',-102,2.7,450.1,13,.65,'#365955','#f7f0d8');k.bench(-102,448,0);
 k.root.userData.landmarkDetail='walled-campus-academic-bust-avenue-science-cheng-pond-blue-track-2f-home';
 const features=campusBuildings.map(s=>({tags:{building:'yes',name:s.name},points:[[s.x-s.w/2,s.z-s.d/2],[s.x+s.w/2,s.z-s.d/2],[s.x+s.w/2,s.z+s.d/2],[s.x-s.w/2,s.z+s.d/2]]}));features.push({tags:{highway:'footway',name:'院士路'},points:academicRoad},{tags:{leisure:'pitch',name:'长郡操场'},points:[[-194,270],[-138,270],[-138,363],[-194,363]]},{tags:{natural:'water',name:'澄池'},points:[[-303,325],[-262,325],[-262,346],[-303,346]]});
 return{...stairs,features,places:campusPlaces,heightAt:(x,z)=>Math.abs(x-stairs.landing.x)<=stairs.landing.w/2&&Math.abs(z-stairs.landing.z)<=stairs.landing.d/2?stairs.landing.top:pondBridgeHeight(x,z)};
}
