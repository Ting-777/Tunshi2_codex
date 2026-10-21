import {chapter3Checkpoint} from '../../chapter3/test-checkpoint.js';
import {CHAPTER3,newThirdState,STUDY} from '../../chapter3/story/missions.js';
import {YUELU} from '../../chapter3/layout.js';
import {CITY,TUNNEL} from '../layout.js';
import {CHAPTER4,newFourthState,MARKET_EVENTS} from './missions.js';
import {newCityLeisureState} from '../leisure.js';
import {applyMarketEvent} from '../stock-market.js';
import {newStreetLifeState} from '../../sandbox/life.js';
// Leave the study through its real side exit; the normal Chapter III ending
// supplies the final rewards and hands over to Chapter IV after its dialogue.
export function chapter4StoryCheckpoint(){
 const save=chapter3Checkpoint(),c=newThirdState(),last=CHAPTER3.find(m=>m.final),index=last.objectives.length-1;
 for(const m of CHAPTER3){
  if(m===last)break;
  c.missions[m.id]={status:'completed',currentObjective:m.objectives.length,progress:{},attempts:0};
  Object.assign(c.world,m.worldStateChanges||{});
  for(const k of ['unlockedContacts','unlockedVehicles','unlockedLocations'])for(const v of m.rewards?.[k]||[])if(!c[k].includes(v))c[k].push(v);
 }
 const at=[4607,7.2,9],ride=[-747,2.5,70],checkpoint={region:YUELU,position:at,interior:STUDY,ride,rideId:save.game.activeRideId,driving:false};
 c.currentMission=last.id;c.chapterState.chapter3=last.stage;
 c.missions[last.id]={status:'active',currentObjective:index,currentObjectiveId:last.objectives[index].id,progress:{},attempts:0,checkpoint};
 Object.assign(c.world,{roadsClosed:true,villaCommitted:true,filesReturned:true,escortBlockade:true,damage:{'winter-glass':0},opened:{bridgeGate:true,trailGate:true,escortCart:true,yard:true,garage:true,winter:true,hall:true,wash:true,kitchen:true,court:true,keeper:true,study:true},clearedEncounters:Object.fromEntries(['checkpoint','academy','aiwan','temple','summit','escort-junction','escort-bridge'].map(id=>[id,true]))});
 save.story.chapter3=c;save.story.chapterState.chapter3=last.stage;
 save.story.dialogue={seen:CHAPTER3.flatMap(m=>[m.id+':start',...(m===last?[]:[m.id+':end']),...m.objectives.slice(0,m===last?index:m.objectives.length).map(o=>o.id+':done')]),queue:[],history:[]};
 Object.assign(save.game,{position:at,lastSafe:at,interior:STUDY,health:100,money:600,driving:false,driveSpeed:0,yaw:-Math.PI/2,characterMotion:{airborne:false,verticalSpeed:0},rideState:{hp:100,position:ride,angle:Math.PI,parkedInterior:null}});
 Object.assign(save.game.regions,{id:YUELU,carRegion:YUELU,mapTest:false,visited:[...save.game.regions.visited,YUELU],chapter3MapRevision:2,cityClock:930});
 return save;
}

// The arrival mirrors the normal tunnel→city connector, before the first
// parking objective. School, boots, account and all C4 rewards remain unearned.
export function chapter4ArrivalCheckpoint(){
 const save=chapter4StoryCheckpoint(),third=save.story.chapter3,last=CHAPTER3.find(m=>m.final);
 Object.assign(third.missions[last.id],{status:'completed',currentObjective:last.objectives.length});
 Object.assign(third.world,last.worldStateChanges);third.chapterComplete=true;third.currentMission=null;third.chapterState.chapter3=4;
 for(const k of ['unlockedContacts','unlockedVehicles','unlockedLocations'])for(const v of last.rewards?.[k]||[])if(!third[k].includes(v))third[k].push(v);
 save.story.chapterState.chapter3=4;save.story.chapterState.chapter4=0;
 const fourth=newFourthState(),mission=CHAPTER4[0];fourth.currentMission=mission.id;
 fourth.missions[mission.id]={status:'active',currentObjective:0,currentObjectiveId:mission.objectives[0].id,progress:{},attempts:0};
 save.story.chapter4=fourth;
 save.story.dialogue.seen.push('c304-leave:done',last.id+':end',mission.id+':start');
 Object.assign(save.game,{position:[-477,.5,575],lastSafe:[-477,.2,575],interior:null,driving:true,driveSpeed:0,yaw:Math.PI*1.5,pitch:.34,rideState:{hp:100,position:[-477,.5,575],angle:Math.PI/2,parkedInterior:null}});
 Object.assign(save.game.regions,{id:CITY,carRegion:CITY,visited:[...save.game.regions.visited,TUNNEL,CITY],mapTest:false,cityClock:930});
 return save;
}

// Independent start before school pickup. Earlier clues and unlocks are earned;
// this escort has not begun and its rewards/one-time milk ice are not granted.
export function chapter4EscortCheckpoint(){
 const save=chapter4ArrivalCheckpoint(),s=save.story.chapter4,leisure=newCityLeisureState(),life=newStreetLifeState();
 for(const m of CHAPTER4.slice(0,4)){
  s.missions[m.id]={status:'completed',currentObjective:m.objectives.length,progress:{},attempts:0};
  Object.assign(s.world,m.worldStateChanges);
  for(const k of ['unlockedContacts','unlockedVehicles','unlockedLocations'])for(const v of m.rewards?.[k]||[])if(!s[k].includes(v))s[k].push(v);
 }
 const m=CHAPTER4[4],at=[-213,.2,419],ride=[-330,.5,556];
 s.currentMission=m.id;s.chapterState.chapter4=m.stage;
 s.missions[m.id]={status:'active',currentObjective:0,currentObjectiveId:'c405-school',progress:{},attempts:0,checkpoint:{region:CITY,position:at,interior:null,ride,driving:false}};
 Object.assign(s.world,{time:1260,boots:true,clothingFee:true,informationCut:true});
 for(const key of ['c402','sync','cut']){const event=MARKET_EVENTS[key];applyMarketEvent(leisure.market,event);s.world.events.push(event.id);}
 leisure.account={opened:true,openedAt:0};life.wardrobe={owned:['c4_blue_shirt'],equipped:'c4_blue_shirt'};
 Object.assign(save.game,{position:at,lastSafe:at,interior:null,driving:false,driveSpeed:0,health:100,money:821,yaw:0,characterMotion:{airborne:false,verticalSpeed:0},rideState:{hp:100,position:ride,angle:0,parkedInterior:null},streetLife:life,cityLeisure:leisure});
 Object.assign(save.game.regions,{id:CITY,carRegion:CITY,mapTest:false,cityClock:1260});
 save.story.chapterState.chapter4=m.stage;
 save.story.dialogue={seen:CHAPTER4.slice(0,4).flatMap(m=>[m.id+':start',m.id+':end',...m.objectives.map(o=>o.id+':done')]),queue:[],history:[]};
 return save;
}
