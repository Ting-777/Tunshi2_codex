import {bossCheckpoint} from '../story/test-checkpoint.js';
import {CHAPTER1} from '../story/chapter1.js';
import {CHAPTER2,newSecondState,B1} from './missions.js';
import {BEICHEN,CHAZI,BRIDGE} from '../regions/data.js';
// Independent public test slot. Never derives from or overwrites a player's save.
export function chapter2Checkpoint(){
 const save=bossCheckpoint(),s=save.story;s.chapterComplete=true;s.currentMission=null;s.chapterState.chapter1=7;s.gangMoney=20002;
 for(const m of CHAPTER1)s.missions[m.id]={status:'completed',currentObjective:m.objectives.length,progress:{},attempts:0};
 Object.assign(s.world,{control:100,hq:true,night:false});s.chapter2=newSecondState();s.dialogue={seen:CHAPTER1.flatMap(m=>[m.id+':start',m.id+':end']),queue:[],history:[]};
 Object.assign(save.game,{position:[-177,.2,430],interior:null,health:100,money:2,driving:false,lastSafe:[-177,.2,430],rideState:{hp:100,position:[-180,.5,430],angle:-Math.PI/2,parkedInterior:null},regions:{layout:2,id:'chapter1_beichen',visited:['chapter1_beichen'],mapTest:false,carRegion:'chapter1_beichen',props:{}}});
 return save;
}

// Begin at the new mall handoff, with unloading complete and the truck in B1.
export function atriumCheckpoint(){
 const save=chapter2Checkpoint(),s=save.story,c=s.chapter2;
 for(const m of CHAPTER2){
  if(m.id==='c205')break;
  c.missions[m.id]={status:'completed',currentObjective:m.objectives.length,progress:{},attempts:0};
  Object.assign(c.world,m.worldStateChanges||{});
  for(const k of ['unlockedContacts','unlockedVehicles','unlockedLocations'])for(const v of m.rewards?.[k]||[])if(!c[k].includes(v))c[k].push(v);
 }
 const m=CHAPTER2.find(m=>m.id==='c205'),index=m.objectives.findIndex(o=>o.id==='c205-atrium');
 const checkpoint={region:CHAZI,position:[2840,.2,-6],interior:B1,ride:[2837,.5,-6],driving:false};
 c.currentMission=m.id;c.chapterState.chapter2=m.stage;s.chapterState.chapter2=m.stage;
 c.missions[m.id]={status:'active',currentObjective:index,currentObjectiveId:'c205-atrium',progress:{},attempts:0,checkpoint};
 Object.assign(c.world,{...m.onStart,doorOpen:true,shopPower:true,garagePower:{west:true,east:true},ordersServed:3,collectorsCleared:true,deliveryAt:[2837,-6],paidJobs:{'c202-park':60,'c202-run':100,'c202-drunk':40,'workshop:0':60,'workshop:1':60,'workshop:2':60},budget:{total:10300,gangContribution:10002,personalRequired:298,earned:180,paid:false,legacy:false}});
 for(const id of ['window','outside-power','side-entry','shop-power','shop-drawer','old-photo','old-ledger','garage-west','garage-east','locker-04','four-names'])c.world.clues[id]=true;
 s.dialogue.seen.push(...CHAPTER2.filter(m=>m.stage<5).flatMap(m=>[m.id+':start',m.id+':end']),m.id+':start');
 const vehicle={populationKey:'story:c2-delivery',region:CHAZI,parked:true,parkedInterior:B1,hp:100,position:checkpoint.ride,angle:Math.PI};
 Object.assign(save.game,{position:checkpoint.position,interior:B1,health:100,money:9999,driving:false,driveSpeed:0,yaw:0,pitch:.12,lastSafe:checkpoint.position,activeRideKey:vehicle.populationKey,rideState:{hp:100,position:vehicle.position,angle:vehicle.angle,parkedInterior:B1},regions:{layout:2,id:CHAZI,visited:[BEICHEN,BRIDGE,CHAZI],mapTest:false,carRegion:CHAZI,props:{}},cars:[vehicle]});
 return save;
}
