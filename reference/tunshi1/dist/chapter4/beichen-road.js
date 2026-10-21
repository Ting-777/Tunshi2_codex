import * as THREE from '../vendor/three.module.js';
import {UrbanKit} from './city-kit.js';
import {cityMaterial} from './materials.js';
import {beichenLink,beichenApproach} from './layout.js';

// Join the southeast edge to the existing Pingsha Road. No building or mission
// is moved: this corridor already lies on accessible, unobstructed land.
export function buildBeichenDowntownRoad({root,city,features,places}){
 const g=new THREE.Group();g.name='beichen-downtown-road';root.add(g);
 const k=new UrbanKit(g,{}),x=beichenLink.beichenX,points=beichenApproach,name='市中心南向连接路';
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),cx=(a[0]+b[0])/2,z=(a[1]+b[1])/2,angle=Math.atan2(dx,dz),width=i<3?18:i===3?16:14;
  k.box(cx,.15,z,width+3.5,.12,len+2,cityMaterial('#c3c4bd','granite'),false,angle);
  k.box(cx,.24,z,width,.1,len+2,cityMaterial('#a5a9ac','asphalt'),false,angle);
  for(const side of[-1,1]){k.box(cx+Math.cos(angle)*side*(width/2-.3),.3,z-Math.sin(angle)*side*(width/2-.3),.14,.025,len,'#e6ded0',false,angle);k.box(cx+Math.cos(angle)*side*(width/2+.4),.25,z-Math.sin(angle)*side*(width/2+.4),.45,.18,len,cityMaterial('#b4b8b1','stone'),false,angle);}
  for(let q=4;q<len;q+=11)k.box(a[0]+dx*q/len,.3,a[1]+dz*q/len,.16,.025,4,'#e6d6ad',false,angle);
  city.roadSegments.push({a,b,width,name,id:'beichen_downtown_road_'+i});
 }
 for(const [cx,z]of points.slice(1,-1))k.box(cx,.3,z,20,.04,20,cityMaterial('#a5a9ac','asphalt'));
 k.sign('市中心 ↓　五一广场 / 长郡',x+16,428,0,18,Math.PI/2);
 k.sign('北辰三角洲 ↑　平沙路 / 秋月路',317,351,0,20,Math.PI/2);
 k.lamp(x+12,402);k.lamp(x+12,446);k.lamp(317,369);k.finish();
 features.push({tags:{highway:'primary',name},points});
 places.push({id:'chapter4_exit',name:'市中心 / 五一广场 · 东南通车连接',short:'市中心',entry:[x,442]});
 return g;
}
