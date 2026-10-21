import * as THREE from '../vendor/three.module.js';
import {material,surface} from '../visuals/model-kit.js';

// Each interactive station has a physical fixture and an unobstructed approach.
// Static details are batched by UrbanKit; hidden rooms have no update callbacks.
export function buildLeisureInterior(o,type,points,{table,clerk}){
 const {r,k,b,floor:f}=o,X=x=>r.ox+x;
 const point=(id,kind,x,z,name,extra={})=>points.push({id:r.id+':'+id,room:r.id,kind,at:[X(x),z],floor:f,name,...extra});
 const sign=(t,x,y,z,w=5,bg='#2b3d49',fg='#e5ecdf')=>k.text(t,X(x),f+y,z,w,.55,bg,fg);
 const orb=(x,y,z,radius,color,scale=[1,1,1])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(radius,12,8),material(color));m.position.set(X(x),f+y,z);m.scale.set(...scale);k.root.add(m);return m;};
 const glass=(x,y,z,color='#dfac50')=>{const g=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.16,0),new THREE.Vector2(.17,.07),new THREE.Vector2(.2,.58)],16),k.glass);g.position.set(X(x),f+y,z);k.root.add(g);k.rounded(.32,.38,.32,color,X(x),f+y+.25,z);k.rounded(.32,.045,.32,'#f2e4bd',X(x),f+y+.47,z);};
 const monitor=(x,z,angle=0,title='')=>{b(x,f+1,z,3.4,.13,1.7,'#6b574b',true);for(const d of[-1,1])b(x+d*1.3,f+.5,z,.12,1,1.3,'#384950');b(x,f+1.54,z-.28,.16,.9,.17,'#48545c');k.box(X(x),f+2,z-.26,2.15,1.25,.18,'#202933',false,angle);k.box(X(x)+Math.sin(angle)*.11,f+2,z-.26+Math.cos(angle)*.11,1.92,1.04,.03,k.glow('#73aeb4'),false,angle);b(x,f+1.1,z+.48,1.25,.06,.42,'#242d35');for(let i=0;i<5;i++)b(x-.48+i*.24,f+1.14,z+.48,.16,.015,.29,'#697681');if(title)sign(title,x,2,z-.13,1.8);};
 const chair=(x,z,angle=0)=>{k.rounded(1.1,.18,1.1,'#333c48',X(x),f+.82,z);k.box(X(x)-Math.sin(angle)*.5,f+1.55,z-Math.cos(angle)*.5,1.15,1.4,.2,'#4b4058',false,angle);k.beam([X(x),f+.1,z],[X(x),f+.75,z],.09,'#75818a');for(const dx of[-.45,.45])for(const dz of[-.4,.4])k.beam([X(x),f+.17,z],[X(x)+dx,f+.12,z+dz],.035,'#667780');};
 const sofa=(x,z,w=4,color='#67465f')=>{b(x,f+.5,z,w,1,1.8,color,true);b(x,f+1.2,z-.8,w,.65,.24,color,true);for(const dx of[-w/2+.18,w/2-.18])b(x+dx,f+.85,z,.35,.7,1.9,color);for(let dx=-w/2+.6;dx<w/2;dx+=.85)k.rounded(.7,.14,1.3,'#88667c',X(x+dx),f+1.06,z);};
 if(type==='bar'){
  b(-5,f+.7,-9,9,1.4,1.65,'#593b37',true);b(-5,f+1.46,-9,9.3,.14,1.9,'#bfa27a');
  for(const y of[2.1,3.3]){b(-5,f+y,-12.7,9,.13,.85,'#725344');for(let i=0;i<12;i++){const x=-9+i*.73;k.rounded(.23,.7,.23,['#638479','#ae754b','#675969'][i%3],X(x),f+y+.43,-12.7);k.rounded(.13,.24,.13,'#b5aa84',X(x),f+y+.9,-12.7);}}
  for(const x of[-8,-5,-2]){glass(x,1.54,-8.65);chair(x,-6.9);}
  sign('SUNSET · 吧台',-5,4.55,-13.3,9,'#37252f','#e7adc8');clerk(k,X(-5),-11,f,'#79435c');point('bar','bar',-5,-5.6,'吧台 · 喝一杯 / 恢复');
  for(const [x,z]of[[9,-5],[9,4],[-9,4]]){sofa(x,z);table(k,X(x),z+2.5,f);}
  b(1,f+.3,-10.4,3,.6,3,'#4b394c',true);k.beam([X(1),f+.6,-10],[X(1),f+2.8,-10],.045,'#a7a19c');orb(1,2.86,-10,.16,'#292f3b');
  for(const x of[-.1,2.2]){b(x,f+1.2,-12,1.1,2.4,.8,'#292b33',true);orb(x,1.35,-11.54,.3,'#4d5260',[1,1,.3]);}
  clerk(k,X(9),-8.7,f,'#688e8b');point('regular','social',9,-6.7,'常客阿岚 · 聊天',{person:'alan'});
  clerk(k,X(-10),-1,f,'#ab956a');point('friend','social',-7.9,-1,'街坊小陈 · 聊天',{person:'chen'});
  sign('LIVE / 每晚的老朋友',0,5.4,-13.2,10);sign('后门 ↗',10,3,-12.7,4);
  r.exits.push({at:[X(10),-12],out:[r.entry[0],r.entry[1]-24],name:'E · 后门 / 解放西后巷',floor:f});
 }else if(type==='ktv'){
  // A central corridor and two open private rooms, with a separate front desk.
  for(const side of[-1,1]){const x=side*4.1;for(const [z,d]of[[-9,10],[7.5,6]])b(x,f+2.2,z,.22,4.4,d,'#5d3b58',true);b(x,f+4,0,.25,.7,8,'#a36d8e');
   sofa(side*10,-7,5.5);table(k,X(side*10),-3.6,f);b(side*10,f+3,-13.5,5.8,2.6,.15,'#202331');sign(side<0?'包间 A · 湘江晚风':'包间 B · 放学以后',side*10,3,-13.3,5.5,'#28223c','#c79cdd');
   for(const dx of[-2.6,2.6]){b(side*10+dx,f+1.8,-12.5,.75,2,.6,'#222938',true);orb(side*10+dx,1.9,-12.16,.21,'#586474',[1,1,.3]);}
   k.beam([X(side*8),f+.1,-1.5],[X(side*8),f+2.5,-1.5],.04,'#82919c');orb(side*8,2.57,-1.5,.16,'#353841');point('room-'+side,'karaoke',side*8,-.1,side<0?'包间 A · 卡拉 OK':'包间 B · 卡拉 OK');
   for(let z=-12;z<10;z+=3)b(side*3.8,f+3.8,z,.06,.08,2,k.glow('#c17ca7'));
  }b(8,f+.7,10,5,1.4,1.5,'#654d5e',true);b(8,f+1.45,10,5.2,.1,1.7,'#bb999c');clerk(k,X(8),12,f,'#977194');sign('前台 · 声浪 KTV',8,3.5,13.5,8);point('front','karaoke',8,7.6,'KTV 前台 · 选歌 / 开包间');
 }else if(type==='arcade'){
  const cabinets=[[-13,-8,'breaker','街机打砖块'],[12,-8,'race','环城冲刺'],[-13,5,'claw','抓海豚娃娃'],[12,5,'rhythm','霓虹节拍']];
  for(const [x,z,game,name]of cabinets){b(x,f+.09,z,5,.18,4,'#253040');
   if(game==='claw'){b(x,f+.5,z,3.2,1,2.7,'#8b5796',true);for(const dx of[-1.55,1.55])for(const dz of[-1.3,1.3])b(x+dx,f+2.5,z+dz,.12,3,.12,'#adb3c6');for(const dx of[-1.5,1.5])b(x+dx,f+2.5,z,.035,2.85,2.5,k.glass);b(x,f+2.5,z+1.28,2.95,2.85,.03,k.glass);b(x,f+4,z,3.3,.22,2.8,'#b086bd');
    for(let i=0;i<6;i++){const dx=(i%3-1)*.75,dz=Math.floor(i/3)*.7-.35;orb(x+dx,1.28,z+dz,.33,['#80b3cc','#c192c5','#edbf83'][i%3],[1.2,.8,.7]);orb(x+dx-.32,1.35,z+dz,.15,'#8dbcd4',[1.5,.7,.8]);for(const e of[-1,1])orb(x+dx-.14,1.48,z+dz+e*.13,.04,'#242d42');k.beam([X(x+dx+.3),f+1.3,z+dz],[X(x+dx+.53),f+1.46,z+dz+.13],.06,'#76a6c0');k.beam([X(x+dx+.3),f+1.3,z+dz],[X(x+dx+.53),f+1.46,z+dz-.13],.06,'#76a6c0');}
    k.beam([X(x),f+3.84,z],[X(x),f+2.9,z],.025,'#919fb1');for(const e of[-1,1])k.beam([X(x),f+2.9,z],[X(x)+e*.28,f+2.62,z],.035,'#bcc4d2');b(x,f+1,z+1.7,2.8,.18,.65,'#a183b1');orb(x-.5,1.21,z+1.7,.09,'#e3c689');
   }else{b(x,f+1.8,z,3,3.6,1.3,'#333745',true);b(x,f+2.75,z+.7,2.5,1.8,.12,k.glow(game==='race'?'#77b8c9':'#9f7dc2'));b(x,f+1.35,z+1,2.9,.18,1.5,'#525264');
    if(game==='race'){chair(x,z+2.1);const wheel=new THREE.Mesh(new THREE.TorusGeometry(.42,.06,7,22),surface('#252c35','metal'));wheel.position.set(X(x),f+1.58,z+1.5);wheel.rotation.x=-.5;k.root.add(wheel);for(const dx of[-.25,.25])b(x+dx,f+.15,z+1.6,.18,.12,.4,'#8c8d94');}
    else if(game==='rhythm'){for(const dx of[-.85,.85])for(const dz of[2.2,3.3])b(x+dx,f+.23,z+dz,1.4,.08,.85,k.glow(dx<0?'#be81bd':'#70bccc'));}
    else{b(x-.65,f+1.55,z+1,.07,.32,.07,'#ded5b7');orb(x-.65,1.75,z+1,.12,'#c77591');for(const dx of[.2,.55,.9])orb(x+dx,1.5,z+1,.12,'#b5c5bd',[1,.35,1]);}
   }sign(name,x,4.4,z+.9,4);point(game,game,x,z+(game==='rhythm'?4.8:game==='race'?3.8:3.1),name);
  }sign('天蝎电玩 · 四种玩法',0,6.1,-16.6,23,'#283146','#accde7');
 }else if(type==='net'){
  for(const x of[-9,9])for(const z of[-8,0,7]){monitor(x,z,0,'街区网络');chair(x,z+1.8);point('pc-'+x+'-'+z,'net',x,z+3.25,'电脑座位 · 上网 / 街区论坛',{seat:[X(x),f+.2,z+1.8],heading:Math.PI});}
  b(0,f+.7,-11,5,1.4,1.5,'#4e4549',true);clerk(k,X(0),-12.5,f,'#687394');sign('河湾网咖 · 上机无需计时',0,4.5,-13.3,18,'#344150','#9bd0cd');
 }else if(type==='mahjong'){
  for(const [x,z]of[[-7,-5],[6,5]]){table(k,X(x),z,f);b(x,f+1.1,z,2.25,.12,1.32,x<0?'#3b795f':'#344c74');for(let i=0;i<8;i++){b(x-.9+i*.25,f+1.32,z+.5,.19,.34,.13,'#efe6c9');if(x<0)k.text(['一万','二万','三万','四筒'][i%4],X(x-.9+i*.25),f+1.34,z+.575,.15,.2,'#eee6d2','#30624f');else{b(x-.7+i*.2,f+1.2,z-.15,.16,.018,.28,'#e8dfcf');orb(x+.8,1.25,z-.2-i*.02,.09,i%2?'#b58b58':'#688693',[1,.18,1]);}}}
  clerk(k,X(6),2.6,f,'#605477');sign('麻将 · 两组面子 + 一对',-7,3.5,-13.3,11,'#365748','#e3d6b6');sign('扑克 · 德州扑克速局',6,3.5,-13.3,10,'#344159','#d2d9e3');point('mahjong','mahjong',-7,-2.5,'麻将牌桌 · 八张速局');point('poker','poker',6,7.5,'扑克桌 · 德州扑克');
 }else if(type==='billiards'){
  for(const x of[-7,7])for(const z of[-5,5]){b(x,f+.8,z,5,1.6,3,'#6f543c',true);b(x,f+1.63,z,4.6,.12,2.6,'#376b59');for(const dx of[-2.25,0,2.25])for(const dz of[-1.27,1.27])orb(x+dx,1.69,z+dz,.15,'#192e29',[1,.25,1]);for(let i=0;i<7;i++)orb(x+(i%3)*.24-.24,1.8,z+Math.floor(i/3)*.24,.09,['#e9d396','#ad5a55','#6389a6'][i%3]);k.beam([X(x-2),f+1.77,z-.6],[X(x+1.8),f+1.77,z+.6],.025,'#c8ac75');}
  for(let i=0;i<6;i++)k.beam([X(-12.7+i*.28),f+.2,-12.8],[X(-12.7+i*.28),f+3.8,-12.8],.028,'#c2a57a');sign('八号台球厅 · 六球 / 八杆挑战',0,4.5,-13.3,20,'#325448','#dec8a5');point('table','billiards',-7,-1.9,'台球桌 · 六球挑战');point('table2','billiards',7,8.1,'台球桌 · 六球挑战');r.floorLabel='2F';
 }else if(type==='securities'){
  for(const x of[-8,8])for(const z of[-4,5]){monitor(x,z,0,'交易终端');chair(x,z+1.7);}
  b(0,f+3,-13.6,22,3,.12,'#213b4a');sign('湘城证券 · 行情大厅',0,4.8,-13.3,23,'#243d4b','#cedfcd');for(let i=0;i<21;i++)b(-10+i,f+2.3+Math.sin(i*.7)*.4,-13.4,.24,.4+Math.abs(Math.cos(i*.7)),.06,i%3?'#be796c':'#77a990');
  b(0,f+.75,6,4,1.5,1.5,'#536a72',true);b(0,f+1.57,6,4.2,.14,1.65,'#c6c7b8');clerk(k,X(0),3.6,f,'#546377');point('trading','stocks',0,8.7,'证券营业部 · 行情 / 买卖');r.futureService='stocks';
 }else if(type==='massage'){
  for(const x of[-7,6])for(const z of[-6,2]){b(x,f+.5,z,4,1,5,'#8d9582',true);k.rounded(3.9,.26,4.6,'#e5d5b7',X(x),f+1.1,z);k.rounded(2,.25,.8,'#eeead9',X(x),f+1.34,z-1.7);for(let i=0;i<3;i++)k.rounded(.95,.05,1.4,'#b9aa8b',X(x),f+1.27+i*.04,z+.8);const bowl=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.4,0),new THREE.Vector2(.75,.2),new THREE.Vector2(.8,.6)],18),surface('#855e40','wood'));bowl.position.set(X(x),f+.02,z+3);k.root.add(bowl);orb(x,.38,z+3,.7,'#9cafaa',[1,.06,1]);}
  b(5,f+.7,8,4,1.4,1.4,'#7a644d',true);b(5,f+1.47,8,4.2,.14,1.6,'#c3b492');clerk(k,X(5),6,f,'#9a9473');sign('足浴 · 推拿 · 休息',0,4.5,-13.3,18,'#626e59','#ecdfbf');point('reception','massage',5,10.2,'足浴前台 · 恢复生命 / 放松');
 }else return false;
 r.leisureStations=points.filter(p=>p.room===r.id);r.modelDetail='c4-furnished-'+type+'-leisure';return true;
}
