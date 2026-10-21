import {chapter3Checkpoint} from '../test-checkpoint.js';
import {CHAPTER2,SHOP} from '../../chapter2/missions.js';
import {CHAZI} from '../../regions/data.js';
import {YUELU} from '../layout.js';
import {CHAPTER3,newThirdState} from './missions.js';
// One final old-shop conversation remains; Chapter III starts through the normal handoff.
export function chapter3StoryCheckpoint(){
 const save=chapter3Checkpoint(),s=save.story,c=s.chapter2,m=CHAPTER2.find(m=>m.final),index=m.objectives.length-1;
 const checkpoint={region:CHAZI,position:[2550,.2,2.5],interior:SHOP,ride:[-547,.5,-125],driving:false};
 c.chapterComplete=false;c.currentMission=m.id;c.chapterState.chapter2=m.stage;s.chapterState.chapter2=m.stage;
 c.missions[m.id]={status:'active',currentObjective:index,currentObjectiveId:m.objectives[index].id,progress:{},attempts:0,checkpoint};
 Object.assign(c.world,{returned:false,doorOpen:true,shopPower:true,shopBreach:true,finalBagCaught:true,recoveredAt:[265,300]});
 for(const prior of CHAPTER2)for(const k of ['unlockedContacts','unlockedVehicles','unlockedLocations'])for(const v of prior.rewards?.[k]||[])if(!c[k].includes(v))c[k].push(v);
 s.dialogue={seen:CHAPTER2.flatMap(prior=>[prior.id+':start',...(prior===m?[]:[prior.id+':end']),...prior.objectives.slice(0,prior===m?index:prior.objectives.length).map(o=>o.id+':done')]),queue:[],history:[]};
 Object.assign(save.game,{position:checkpoint.position,interior:SHOP,driving:false,driveSpeed:0,health:100,lastSafe:checkpoint.position,yaw:Math.PI,characterMotion:{airborne:false,verticalSpeed:0},rideState:{hp:100,position:checkpoint.ride,angle:0,parkedInterior:null}});
 save.game.regions.mapTest=false;return save;
}

export function chapter3DockCheckpoint(){
 const save=chapter3Checkpoint(),s=save.story,c=newThirdState(),position=[-634.6,2.3,203],ride=[-680,2.5,235];
 c.currentMission='c303';c.chapterState.chapter3=2;c.world.roadsClosed=true;
 for(const m of CHAPTER3.slice(0,2)){c.missions[m.id]={status:'completed',currentObjective:m.objectives.length,progress:{},attempts:0};Object.assign(c.world,m.worldStateChanges||{});for(const key of ['unlockedContacts','unlockedLocations'])for(const name of m.rewards?.[key]||[])if(!c[key].includes(name))c[key].push(name);}
 c.missions.c303={status:'active',currentObjective:3,currentObjectiveId:'c303-dock',progress:{escortHP:100,escortAt:[-619,203],gateHP:100},attempts:0,checkpoint:{region:YUELU,position,interior:null,ride,rideId:save.game.activeRideId,driving:false}};
 Object.assign(c.world,{filesReturned:true,escortBlockade:true,clearedEncounters:Object.fromEntries(['checkpoint','academy','aiwan','temple','summit','escort-junction','escort-bridge'].map(id=>[id,true])),opened:{trailGate:true,escortCart:true,bridgeGate:false}});
 c.unlockedContacts.push('JC');s.chapter3=c;s.chapterState.chapter3=2;s.dialogue={seen:[],queue:[],history:[]};
 Object.assign(save.game,{position,interior:null,health:100,money:9999,driving:false,driveSpeed:0,yaw:Math.PI/2,lastSafe:position,characterMotion:{airborne:false,verticalSpeed:0},rideState:{hp:100,position:ride,angle:0,parkedInterior:null}});
 Object.assign(save.game.regions,{id:YUELU,visited:[...save.game.regions.visited,YUELU],mapTest:false,carRegion:YUELU,chapter3MapRevision:2});return save;
}
