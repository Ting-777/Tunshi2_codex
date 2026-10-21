import {chapter2Checkpoint} from '../chapter2/test-checkpoint.js';
import {CHAPTER2} from '../chapter2/missions.js';
import {BEICHEN,CHAZI,BRIDGE} from '../regions/data.js';
export function chapter3Checkpoint(){
 const save=chapter2Checkpoint(),s=save.story,c=s.chapter2;
 for(const m of CHAPTER2){c.missions[m.id]={status:'completed',currentObjective:m.objectives.length,progress:{},attempts:0};Object.assign(c.world,m.worldStateChanges||{});}
 c.chapterComplete=true;c.currentMission=null;c.chapterState.chapter2=10;s.chapterState.chapter2=10;s.dialogue={seen:[],queue:[],history:[]};
 Object.assign(save.game,{position:[-807.3,.2,310],interior:null,money:9999,health:100,driving:false,yaw:Math.PI,lastSafe:[-807.3,.2,310],regions:{layout:2,id:CHAZI,visited:[BEICHEN,BRIDGE,CHAZI],mapTest:true,carRegion:CHAZI,props:{}},rideState:{hp:100,position:[-810,.5,310],angle:0,parkedInterior:null}});
 return save;
}
