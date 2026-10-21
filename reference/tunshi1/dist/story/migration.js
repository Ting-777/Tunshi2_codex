import {CHAPTER1} from './chapter1.js';
export const STORY_REVISION=3;
export function migrateStory(input){const s=structuredClone(input);if(s.revision===STORY_REVISION)return s;
 // Keep money, ruins, completed missions and world state. Only reset a changed active objective.
 for(const m of CHAPTER1){const r=s.missions[m.id];if(!r||r.status==='completed')continue;const old=r.currentObjectiveId||m.id+'-'+r.currentObjective;let index=m.objectives.findIndex(o=>o.id===old);if(index<0){const oldIndex=Number(old.split('-').at(-1));index=m.objectives.findIndex(o=>Number(o.id.split('-').at(-1))>=oldIndex);if(index<0)index=m.objectives.length-1;}r.currentObjective=index;r.currentObjectiveId=m.objectives[index].id;r.progress={};r.status='active';}
 const current=CHAPTER1.find(m=>m.id===s.currentMission);s.revision=STORY_REVISION;s.dialogue={seen:current?[current.id+':start']:[],queue:(current?.dialogues||[]).map(([speaker,text])=>({speaker,text,channel:'剧情回顾'})),history:s.dialogue?.history||[]};return s;}
