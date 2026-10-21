import {CITY,TUNNEL,densityAt} from '../chapter4/layout.js';
import {YUELU} from '../chapter3/layout.js';
import {BEICHEN,CHAZI,BRIDGE} from '../regions/data.js';

const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const point=e=>[e.g.position.x,e.g.position.z];
const budgets={
 [BEICHEN]:{people:24,walking:18,cars:10,driving:7},
 [CHAZI]:{people:44,walking:22,cars:12,driving:9},
 [BRIDGE]:{people:6,walking:4,cars:6,driving:5},
 [YUELU]:{people:28,walking:15,cars:12,driving:7},
 [CITY]:{people:56,walking:36,cars:10,driving:6},
 [TUNNEL]:{people:0,walking:0,cars:4,driving:2}
};

// Sample the actual paved streets. Split at buildings/rails instead of drawing
// straight-line shortcuts through a block. Each car run has two separate lanes.
export function streetPaths(roads,clear,contains){
 const walking=[],traffic=[];
 for(const [,ps,width,kind] of roads)for(let j=1;j<ps.length;j++){
  const a=ps[j-1],b=ps[j],length=distance(a,b);if(length<12)continue;
  const dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,nx=-dz,nz=dx;
  const sample=offset=>{
   const chunks=[];let run=[];const steps=Math.ceil(length/(Math.abs(offset)<width/2?3:1));
   for(let i=1;i<steps;i++){
    const p=[a[0]+dx*length*i/steps+nx*offset,a[1]+dz*length*i/steps+nz*offset];
    if(contains(...p)&&clear(...p,Math.abs(offset)<width/2?2.1:.6))run.push(p);
    else{if(run.length>2)chunks.push(run);run=[];}
   }
   if(run.length>2)chunks.push(run);return chunks;
  };
  for(const side of kind==='trail'?[0]:[-1,1])for(const run of sample(side*(kind==='pedestrian'||kind==='footway'?Math.max(1.2,width*.23):width/2+1.5))){
   for(let k=0;k<run.length-9;k+=70){const path=run.slice(k,k+72);if(path.length>=10)walking.push([path[0],path.at(-1)]);}
  }
  if(width<5||['trail','pedestrian','footway'].includes(kind))continue;
  const lane=Math.min(3,Math.max(1.25,width*.22));
  for(const run of sample(lane)){
   // The reverse lane must also be clear, including the turning area.
   let part=[];
   const finish=()=>{if(part.length>=12){const back=part.map(p=>[p[0]-nx*lane*2,p[1]-nz*lane*2]).reverse();traffic.push([part[0],part.at(-1),back[0],back.at(-1),part[0]]);}part=[];};
   for(const p of run){const q=[p[0]-nx*lane*2,p[1]-nz*lane*2];if(contains(...q)&&clear(...q,2.1))part.push(p);else finish();}finish();
  }
 }
 return{walking,traffic};
}

export class StreetPopulation{
 constructor(api){
  this.api=api;this.paths={};this.samples=new WeakMap();this.serial=0;this.timer=0;this.lastRegion=null;this.pendingFill=null;this.fillingRegion=null;
  for(const region of Object.keys(budgets)){
   this.paths[region]=streetPaths(api.roads(region),(x,z,r)=>api.clear(region,x,z,r),(x,z)=>api.contains(region,x,z));
   for(const e of api.people.filter(e=>!e.story&&(e.region||BEICHEN)===region))this.walker(e,region);
   for(const e of api.cars.filter(e=>!e.story&&!e.scripted&&!e.homeParked&&(e.homeRegion||e.region||BEICHEN)===region))this.traffic(e,region);
   while(this.walkers(region).length<budgets[region].people)this.walker(api.person(region),region);
   this.reserve(region);
  }
 }
 walkers(region){return this.api.people.filter(e=>e.streetWalker&&e.region===region);}
 vehicles(region){return this.api.cars.filter(e=>e.streetTraffic&&e.homeRegion===region);}
 walker(e,region){Object.assign(e,{region,streetWalker:true,ambient:true,nightHidden:false,populationHidden:true,walkRoute:null});e.populationHome=e.home.clone();}
 traffic(e,region){Object.assign(e,{region,homeRegion:region,streetTraffic:true,ambient:true,populationHidden:true,trafficLoop:true});}
 createCar(region,key){const e=this.api.car(region);e.populationKey=key||region+':traffic:'+this.serial++;this.traffic(e,region);return e;}
 reserve(region){
  // Taken cars and wrecks remain in the world. Replacement traffic gets its own
  // identity, so stealing a vehicle cannot gradually empty every road.
  let available=this.vehicles(region).filter(e=>!e.parked&&e.hp>0).length;
  while(available<budgets[region].cars&&this.vehicles(region).length<60){this.createCar(region);available++;}
 }
 claim(e){if(!e.streetTraffic)return;e.populationHidden=false;this.reserve(e.homeRegion);}
 reset(){
  this.timer=0;this.lastRegion=null;this.pendingFill=null;this.fillingRegion=null;
  for(const e of this.api.people)if(e.streetWalker){e.populationHidden=true;e.walkRoute=null;e.home.copy(e.populationHome);e.g.position.copy(e.home);}
  for(const e of this.api.cars)if(e.streetTraffic){e.populationHidden=true;e.trafficAssigned=false;e.trafficStalled=0;}
 }
 restore(records=[]){
  // Runtime replacements share the existing game save, including adopted cars.
  for(const data of records)if(data.populationKey){
   const serial=Number(data.populationKey.split(':').at(-1));if(Number.isFinite(serial))this.serial=Math.max(this.serial,serial+1);
   if(!this.api.cars.some(e=>e.populationKey===data.populationKey))this.createCar(data.homeRegion||data.region,data.populationKey);
  }
  this.timer=0;this.lastRegion=null;this.pendingFill=null;this.fillingRegion=null;
 }
 restored(){for(const region of Object.keys(budgets))this.reserve(region);}
 refresh(){this.timer=0;this.lastRegion=null;this.pendingFill=null;this.fillingRegion=null;}
 candidate(paths,pos,min,max,skip,kind){
  let samples=this.samples.get(paths);
  if(!samples){samples=[];for(const route of paths)for(let i=1;i<route.length;i++){
   const a=route[i-1],b=route[i],steps=Math.max(1,Math.ceil(distance(a,b)/16));
   for(let j=0;j<steps;j++){const f=(j+.5)/steps;samples.push({route,index:i,p:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]});}
  }this.samples.set(paths,samples);}
  const region=this.api.get().region,choices=[],obstacles=this.api.obstacles().filter(e=>e!==skip&&e.enabled!==false&&!e.populationHidden&&e.g.visible&&(e.region||BEICHEN)===region&&(!e.area||e.area==='outside')&&!e.parkedInterior);
  for(const sample of samples){
    const p=sample.p,d=distance(p,pos);
    if(d<min||d>max||!this.api.clear(region,...p,kind==='car'?2.1:.6))continue;
    if(obstacles.some(e=>distance(point(e),p)<(kind==='car'?9:3)))continue;
    choices.push(sample);
   }
  if(!choices.length)return null;return choices[Math.floor(Math.random()*choices.length)];
 }
 place(e,p){e.g.position.set(p.p[0],(this.api.height?.(e.region,p.p[0],p.p[1])||0)+(e.kind==='car'?.5:.2),p.p[1]);e.kx=e.kz=e.vx=e.vz=0;e.populationHidden=false;e.stun=0;e.g.visible=true;}
 tick(dt){
  const s=this.api.get();if(!s.started||s.paused||s.dead||s.interior)return;
  this.timer-=dt;const changed=this.lastRegion!==s.region,maintenance=changed||this.timer<=0;
  if(!maintenance&&this.pendingFill!==s.region)return;if(maintenance)this.timer=.8;
  const staged=s.region===CITY||s.region===TUNNEL;
  if(changed){this.fillingRegion=s.region;this.pendingFill=null;}this.lastRegion=s.region;
  const fresh=staged?this.fillingRegion===s.region:changed;
  // Fill the existing actor pools over several frames, retaining full density.
  let placements=staged?2:Infinity,attempts=staged?4:Infinity,spawned=0;
  const candidate=(...args)=>attempts>0?(attempts--,this.candidate(...args)):null;
  const pos=s.position,paths=this.paths[s.region],budget=budgets[s.region];if(!paths||!budget)return;
  if(this.vehicles(s.region).some(e=>e.enabled!==false&&!e.parked&&e.hp<=0&&distance(point(e),pos)>190))this.reserve(s.region);
  const walking=s.region===CITY?densityAt(...pos,s.night):Math.round(budget.walking*(s.night?.65:1));
  const walkers=this.walkers(s.region),vehicles=this.vehicles(s.region);
  if(maintenance)for(const e of walkers)if(distance(point(e),pos)>185)e.populationHidden=true;
  if(s.region===CITY){const active=walkers.filter(e=>!e.populationHidden&&e.hp>0).sort((a,b)=>distance(point(b),pos)-distance(point(a),pos));for(let i=0;i<active.length-walking;i++)if(distance(point(active[i]),pos)>35)active[i].populationHidden=true;}
  let present=walkers.filter(e=>e.enabled!==false&&!e.populationHidden&&e.hp>0&&distance(point(e),pos)<145).length;
  for(const e of walkers){
   if(present>=walking||placements<=0||attempts<=0)break;if(e.enabled===false||e.hp<=0||e.angry>0||(!e.populationHidden&&distance(point(e),pos)<185))continue;
   const pick=(fresh&&present<6?candidate(paths.walking,pos,14,70,e,'person'):null)||candidate(paths.walking,pos,fresh?24:65,135,e,'person');if(!pick)break;
   this.place(e,pick);e.walkRoute=pick.route;e.walkIndex=pick.index;e.home.copy(e.g.position);present++;placements--;spawned++;
  }
  if(maintenance)for(const e of vehicles){
   if(e.parked||e===s.ride||e.enabled===false)continue;
   const d=distance(point(e),pos);
   if(d>215)e.populationHidden=true;
   const moved=e.trafficLast?distance(point(e),e.trafficLast):10;
   e.trafficStalled=moved<.3?(e.trafficStalled||0)+.8:0;e.trafficLast=point(e);
   // Recover only beyond view. Never teleport an on-screen jam or repair a wreck.
   if(d>180&&e.trafficStalled>12)e.populationHidden=true;
  }
  let flowing=vehicles.filter(e=>e.enabled!==false&&!e.parked&&e.hp>0&&!e.populationHidden&&distance(point(e),pos)<195).length;
  for(const e of vehicles){
   if(flowing>=budget.driving||placements<=0||attempts<=0)break;if(e.enabled===false||e.parked||e===s.ride||e.hp<=0||!e.populationHidden)continue;
   const pick=(fresh&&flowing<3?candidate(paths.traffic,pos,28,90,e,'car'):null)||candidate(paths.traffic,pos,fresh?42:95,175,e,'car');if(!pick)break;
   this.place(e,pick);e.route=pick.route;e.routeIndex=pick.index;e.trafficLoop=true;e.trafficAssigned=true;e.trafficStalled=0;flowing++;placements--;spawned++;
  }
  const missing=present<walking||flowing<budget.driving;
  this.pendingFill=staged&&missing&&spawned>0?s.region:null;
  if(!missing)this.fillingRegion=null;
 }
 walk(e){
  if(!e.walkRoute)return false;
  let target=e.walkRoute[e.walkIndex];if(distance(point(e),target)<.65){e.walkIndex=1-e.walkIndex;target=e.walkRoute[e.walkIndex];}
  const dx=target[0]-e.g.position.x,dz=target[1]-e.g.position.z,d=Math.max(.01,Math.hypot(dx,dz)),speed=1.1+(e.id%4)*.13;
  e.vx=dx/d*speed;e.vz=dz/d*speed;e.g.rotation.y=Math.atan2(dx,dz);return true;
 }
 drive(e){
  if(!e.route?.length)return;
  let target=e.route[e.routeIndex],p=point(e);if(!target){e.routeIndex=1;target=e.route[1];}if(!target)return;
  if(distance(p,target)<1.15){e.routeIndex=e.routeIndex<e.route.length-1?e.routeIndex+1:1;target=e.route[e.routeIndex];}
  const dx=target[0]-p[0],dz=target[1]-p[1],d=Math.max(.01,Math.hypot(dx,dz)),ux=dx/d,uz=dz/d;
  let speed=e.speed;
  for(const other of this.api.obstacles()){
   if(other===e||other.enabled===false||other.populationHidden||!other.g.visible||other.hp<=0)continue;
   if((other.region||BEICHEN)!==e.region||other.parkedInterior||(other.area&&other.area!=='outside'))continue;
   const ox=other.g.position.x-p[0],oz=other.g.position.z-p[1],ahead=ox*ux+oz*uz,side=Math.abs(ox*uz-oz*ux);
   const clearance=other.kind==='car'?5:3.1;
   if(ahead>0&&ahead<clearance+e.speed*1.1&&side<(other.kind==='car'?1.85:1.25))speed=Math.min(speed,Math.max(0,(ahead-clearance)*.8));
  }
  e.vx=ux*speed;e.vz=uz*speed;e.g.rotation.y=Math.atan2(dx,dz);
 }
}
