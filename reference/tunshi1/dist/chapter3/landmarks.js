import * as THREE from '../vendor/three.module.js';
import {surface,material} from '../visuals/model-kit.js';
import {trails,platforms} from './layout.js';
import {routeSample} from './terrain.js';
// Original curved hips: broad eaves, tapered ridge and raised corners.
function tiledRoof(k,x,z,y,w,d,rise,color='#586d63'){
 const pos=[],uv=[],idx=[],n=16;
 for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const u=(i/n-.5)*2,v=(j/n-.5)*2,e=Math.max(Math.abs(u),Math.abs(v)),h=rise*(1-e)**.75+Math.abs(u*v)**3*.9;pos.push(x+u*w/2,y+h,z+v*d/2);uv.push(i/n*8,j/n*6);}
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i;idx.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=surface(color,'brick').clone();m.side=THREE.DoubleSide;k.mesh(g,m,'curved-tiled-roof');
 for(const a of[-1,1]){k.beam([x-w*.5,y+.15,z+a*d*.5],[x+w*.5,y+.15,z+a*d*.5],.11,'#806246');k.beam([x+a*w*.5,y+.15,z-d*.5],[x+a*w*.5,y+.15,z+d*.5],.11,'#806246');}
 k.beam([x-w*.22,y+rise+.13,z],[x+w*.22,y+rise+.13,z],.14,'#8c8d74');
 for(let i=-Math.floor(w/1.5);i<=Math.floor(w/1.5);i++)if(Math.abs(i*.75)<w/2){const px=x+i*.75;k.beam([px,y+.17,z-d*.49],[px,y+rise-.08,z-d*.08],.035,'#87977e');k.beam([px,y+rise-.08,z+d*.08],[px,y+.17,z+d*.49],.035,'#87977e');}
}
function hall(k,x,z,y,w,d,h,name){
 k.box(x,y+.24,z,w+2,.48,d+2,'#afa896',true,0,'stone');k.box(x,y+h/2+.45,z,w,h,d,'#d6cbb3',true,0,'brick');
 for(let i=0;i<Math.floor(w/3);i++){const px=x-w/2+1.5+i*3;k.box(px,y+2.5,z-d/2-.18,1.8,3.4,.16,'#3e3730');for(let t of[-.7,0,.7])k.box(px+t,y+2.5,z-d/2-.29,.055,3.4,.1,'#986448');for(let t of[-1.3,0,1.3])k.box(px,y+2.5+t,z-d/2-.3,1.8,.06,.1,'#986448');}
 for(const px of[x-w/2-1,x+w/2+1])k.beam([px,y,z-d*.42],[px,y+h+.25,z-d*.42],.29,'#773e30');
 tiledRoof(k,x,z,y+h+.5,w+5,d+5,3.5);if(name)k.api.label(name,10,1.4,'#534132','#ecd7a6',k.root,x,y+h-.5,z-d/2-.4).rotation.y=Math.PI;
}
export function buildMountainLandmarks(k){
 // Academy: open forecourt, attached main gateway, side halls. Entry is south.
 const {x,z,y,w,d}=platforms.find(p=>p.id==='academy');k.box(x,y-.2,z,w,.4,d,'#b9b3a1',false,0,'stone');
 const apron=platforms.find(p=>p.id==='academy-apron');k.box(apron.x,apron.y-.2,apron.z,apron.w,.4,apron.d,'#b9b3a1',false,0,'stone');
 hall(k,x,321,y,30,13,7.3,'岳麓书院');for(const s of[-1,1])hall(k,x+s*24,312,y,10,25,5.5);
 k.box(x,y+1.9,313.8,5.1,3.8,.14,'#47342a',false);for(const s of[-1,1]){k.box(x+s*2.7,y+2.1,313.55,.27,4.2,.36,'#9b6549');k.beam([x+s*1.45,y+1.8,313.36],[x+s*1.45,y+2.25,313.36],.085,'#ad9468');}
 k.sign('岳麓书院',731,289,y,9);k.bench(737,290,y);k.bench(695,294,y);
 // Aiwan: open eight posts, two green tiled roofs and raised stone platform.
 const ax=580,az=235,ay=21;k.box(ax,ay-.16,az,15,.32,15,'#aaa795',false,0,'stone');
 for(const s of[-1,1])for(const t of[-1,1]){k.beam([ax+s*5.2,ay,az+t*5.2],[ax+s*5.2,ay+5.1,az+t*5.2],.3,'#aaa89c');k.beam([ax+s*3.2,ay,az+t*3.2],[ax+s*3.2,ay+7.5,az+t*3.2],.25,'#994932');}
 tiledRoof(k,ax,az,ay+5,16,16,2.3,'#466b54');tiledRoof(k,ax,az,ay+8,10.5,10.5,2.3,'#4d795c');
 k.api.label('爱晚亭',4,.95,'#603c2b','#f3d7a2',k.root,ax,ay+4,az+5.5);k.bench(ax-12,az+3,ay);k.sign('爱晚亭 · 西向麓山寺',ax+11,az+10,ay,13);
 // Lushan temple: the foot route reaches its south courtyard, never a hall wall.
 k.box(430,79.88,160,96,.24,77,'#b6b2a1',false,0,'stone');hall(k,430,139,80,34,20,8,'麓山寺');for(const s of[-1,1])hall(k,430+s*37,148,80,15,35,6.3);
 for(const s of[-1,1]){k.box(430+s*10,80.35,165,3,.7,3,'#837f6d',true);const m=k.mesh(new THREE.SphereGeometry(1.15,14,10),surface('#9c9b83'),'stone-guardian');m.position.set(430+s*10,82,165);m.scale.set(.8,1.1,.85);}
 k.sign('麓山寺 · 西向山顶',454,189,80,13);k.bench(400,186,80);k.bench(466,176,80);
 for(const [cx,cz,cy,w,d]of[[215,175,130,42,40],[260,80,146,46,44]]){k.box(cx,cy-.08,cz,w,.16,d,'#b7b4a2',false,0,'stone');for(const s of[-1,1])k.bench(cx+s*13,cz+6,cy);const edges=[[[cx-w/2,cz-d/2],[cx+w/2,cz-d/2]],[[cx-w/2,cz-d/2],[cx-w/2,cz+d/2-5]],[[cx+w/2,cz-d/2],[cx+w/2,cz+d/2-5]]];for(const [a,b]of edges){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let i=0;i<n;i++){const at=t=>[THREE.MathUtils.lerp(a[0],b[0],t),THREE.MathUtils.lerp(a[1],b[1],t)],middle=at((i+.5)/n);if(trails.some(r=>routeSample(...middle,r).d<r.width/2+1.8))continue;k.rail(at(i/n),at((i+1)/n),cy,cy);}}}
 k.sign('岳麓山观景台',269,92,146,13);k.sign('半山平台 · 西向下山口',211,183,130,17);
}
function shell(k,cx,cz,rx,rz,height,variant){
 const n=72,rings=18,p=[],uv=[],index=[];
 for(let j=0;j<=rings;j++)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,s=j/rings,r=.28+.72*s,mod=1+.13*Math.cos(a*3+variant),shift=(1-s)*.12,x=cx+Math.cos(a)*rx*r*mod+rx*shift*Math.sin(variant),z=cz+Math.sin(a)*rz*r*mod+rz*shift*Math.cos(variant);
  const edge=2+4*(.5+.5*Math.sin(a*2+variant)),fold=.28+.72*(.5+.5*Math.cos(a-variant))**1.4,y=2+height*(1-s)**.78*fold+edge*s**3+4*Math.sin(a*3+variant)*s*(1-s);
  p.push(x,y,z);uv.push(i/n*4,s*3);
 }
 for(let j=0;j<rings;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i;index.push(a,a+1,a+n+1,a+1,a+n+2,a+n+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();const mat=surface('#e4e5df','stone').clone();mat.side=THREE.DoubleSide;mat.roughness=.42;k.mesh(g,mat,'meixi-flowing-shell');
 const glass=material('#263c48','paint'),corePos=[cx,2+height*.38,cz],coreIndex=[];for(let i=0;i<=n;i++)corePos.push(p[i*3],p[i*3+1]-.25,p[i*3+2]);for(let i=0;i<n;i++)coreIndex.push(0,i+2,i+1);const core=new THREE.BufferGeometry();core.setAttribute('position',new THREE.Float32BufferAttribute(corePos,3));core.setIndex(coreIndex);core.computeVertexNormals();k.mesh(core,glass,'curved-skylight-core');
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,at=q=>[cx+Math.cos(q)*rx*(1+.13*Math.cos(q*3+variant)),cz+Math.sin(q)*rz*(1+.13*Math.cos(q*3+variant))],aa=at(a),bb=at(b),h=2+4*(.5+.5*Math.sin(a*2+variant));k.box((aa[0]+bb[0])/2,2+h/2,(aa[1]+bb[1])/2,.18,h,Math.hypot(aa[0]-bb[0],aa[1]-bb[1]),glass,true,Math.atan2(bb[0]-aa[0],bb[1]-aa[1]));k.beam([aa[0],2,aa[1]],[aa[0],2+h,aa[1]],.065,'#adb8bc');}
 for(let i=0;i<n;i++){const at=j=>{const q=(rings*(n+1)+j)*3;return[p[q],p[q+1],p[q+2]];};k.beam(at(i),at(i+1),.13,'#d6dbd7');}
 for(let i=0;i<36;i++){const col=[];for(let j=0;j<=rings;j++)col.push([p[(j*(n+1)+i*2)*3],p[(j*(n+1)+i*2)*3+1]+.045,p[(j*(n+1)+i*2)*3+2]]);for(let j=1;j<col.length;j++)k.beam(col[j-1],col[j],.035,'#c4cecf');}
}
export function buildArtsCentre(k){
 k.box(-211,1.85,-202,204,.3,68,'#b3bdba',false,0,'stone');
 shell(k,-132,-214,35,27,28,.4);shell(k,-210,-215,22,25,20,2.3);shell(k,-268,-211,30,29,25,4.5);
 for(let i=0;i<8;i++)k.box(-200+i*12,2.055,-176,.25,.07,19,'#707d80');k.sign('梅溪湖国际文化艺术中心',-184,-166,2,30);
 for(const x of[-285,-235,-135]){k.bench(x,-173,2);k.lamp(x,-170,2);}k.box(-215,2.3,-172,15,.6,2,'#596e61',true);
}
