import {CHAPTER1} from './chapter1.js';
import {newChapterState} from './mission-manager.js';
// A reviewable canonical fixture, independent of one developer's localStorage.
export function bossCheckpoint(){
 const story=newChapterState();story.chapterState.chapter1=6;story.currentMission='final';
 for(const m of CHAPTER1){if(m.id==='final')break;story.missions[m.id]={status:'completed',currentObjective:m.objectives.length,progress:{},attempts:0};Object.assign(story.world,m.worldStateChanges||{});for(const k of ['unlockedContacts','unlockedVehicles','unlockedLocations'])for(const x of m.rewards?.[k]||[])if(!story[k].includes(x))story[k].push(x);story.gangMoney+=m.rewards?.gangMoney||0;}
 const final=CHAPTER1.find(m=>m.id==='final'),index=final.objectives.findIndex(o=>o.id==='final-8');
 const checkpoint={region:'chapter1_beichen',position:[-57,.2,-412],interior:null,ride:[-50,.5,-400],driving:false};
 story.missions.final={status:'active',currentObjective:index,currentObjectiveId:'final-8',progress:{},attempts:0,checkpoint};
 Object.assign(story.world,{blackout:true,night:true,hq:true,hqBusy:true,mapUpgraded:true,gangVisible:true,finance:true,rescued:['home','garage','business'],damage:{blackoutApplied:true,home:true,garage:true,business:true}});
 story.dialogue={seen:CHAPTER1.flatMap(m=>[m.id+':start',m.id+':end']),queue:[],history:[]};
 const game={position:checkpoint.position,interior:null,health:100,money:2,driving:false,yaw:0,pitch:.34,lastSafe:checkpoint.position,bankHealth:0,shopHealth:120,rideState:{hp:100,position:checkpoint.ride,angle:0,parkedInterior:null},regions:{layout:2,id:'chapter1_beichen',visited:['chapter1_beichen'],mapTest:false,carRegion:'chapter1_beichen',props:{}},cars:[]};
 return{version:1,story,game};
}
