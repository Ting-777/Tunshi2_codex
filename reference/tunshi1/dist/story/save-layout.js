import {CHAPTER1} from './chapter1.js';
import {CHAPTER2} from '../chapter2/missions.js';
import {CHAPTER4} from '../chapter4/story/missions.js';
import {CHAPTER3} from '../chapter3/story/missions.js';
import {CITY,TUNNEL,ROOM_IDS as CITY_ROOMS} from '../chapter4/layout.js';

// Share the actual mission IDs with the transfer validator without loading the game.
export const SAVE_LAYOUTS=[CHAPTER1,CHAPTER2,CHAPTER3,CHAPTER4].map(chapter=>Object.fromEntries(chapter.map(m=>[m.id,m.objectives.map(o=>o.id)])));
export const REGION_IDS=['chapter1_beichen','chapter2_chazishan','connector_yinpenling_bridge','chapter3_yuelu_meixi',CITY,TUNNEL];
export const ROOM_IDS=['home','bank','hotel','library','planning','concert','museum','interior_old_home','interior_old_garage','interior_old_shop','interior_capitaland','interior_commercial_b1','interior_finance_office','villa_garage','villa_ground','villa_upper','villa_study',...CITY_ROOMS];
