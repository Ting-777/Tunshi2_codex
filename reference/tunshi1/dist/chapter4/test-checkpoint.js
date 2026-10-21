import {chapter3Checkpoint} from '../chapter3/test-checkpoint.js';
import {YUELU} from '../chapter3/layout.js';
import {CITY,TUNNEL} from './layout.js';
export function chapter4Checkpoint(){const s=chapter3Checkpoint();Object.assign(s.game,{position:[690,2.2,-15],lastSafe:[690,2.2,-15],driving:true,driveSpeed:0,yaw:Math.PI,rideState:{hp:100,position:[690,2.5,-15],angle:.6,parkedInterior:null}});Object.assign(s.game.regions,{id:YUELU,carRegion:YUELU,visited:[...s.game.regions.visited,YUELU],cityClock:15*60});return s;}
export function chapter4VisualCheckpoint(){const s=chapter4Checkpoint();Object.assign(s.game,{position:[0,.2,-330],lastSafe:[0,.2,-330],driving:false,driveSpeed:0,yaw:0,pitch:.22,rideState:{hp:100,position:[80,.5,-470],angle:Math.PI/2,parkedInterior:null}});Object.assign(s.game.regions,{id:CITY,carRegion:CITY,visited:[...s.game.regions.visited,TUNNEL,CITY],cityClock:16*60});return s;}
