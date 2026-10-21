import {validateSaveDocument} from './save-document.js';

export const SAVE_KEY='dolphin-city-save';
export const SAVE_VERSION=1;
const slots={main:SAVE_KEY,boss:SAVE_KEY+'-boss',transfer:SAVE_KEY+'-transfer',chapter2test:SAVE_KEY+'-chapter2test',atriumtest:SAVE_KEY+'-atriumtest',chapter3test:SAVE_KEY+'-chapter3test',chapter3story:SAVE_KEY+'-chapter3story',chapter3dock:SAVE_KEY+'-chapter3dock',chapter4test:SAVE_KEY+'-chapter4test',chapter4story:SAVE_KEY+'-chapter4story',chapter4arrival:SAVE_KEY+'-chapter4arrival',chapter4escort:SAVE_KEY+'-chapter4escort'};
export class SaveStore{
  constructor(storage,onError=()=>{}){this.storage=storage;this.onError=onError;this.key=SAVE_KEY;try{this.key=slots[storage?.getItem(SAVE_KEY+'-slot')]||SAVE_KEY;}catch{}}
  selectSlot(slot){const name=slots[slot]?slot:'main';this.key=slots[name];try{this.storage?.setItem(SAVE_KEY+'-slot',name);}catch{}}
  readKey(key){for(const k of [key,key+'-backup']){try{const value=JSON.parse(this.storage?.getItem(k)||'null');if(value?.version===SAVE_VERSION&&value.story?.chapterState&&value.game&&Array.isArray(value.game.position))return value;}catch{}}return null;}
  read(){return this.readKey(this.key);}
  readSlot(slot){return this.readKey(slots[slot]||SAVE_KEY);}
  importSnapshot(save){
   validateSaveDocument(save);const storage=this.storage,key=slots.transfer,slotKey=SAVE_KEY+'-slot',previous=new Map();
   try{
    if(!storage)throw new Error('storage unavailable');
    for(const k of [key,key+'-backup',slotKey])previous.set(k,storage.getItem(k));
    const old=previous.get(key);if(old)storage.setItem(key+'-backup',old);
    storage.setItem(key,JSON.stringify(save));storage.setItem(slotKey,'transfer');this.key=key;return true;
   }catch{
    for(const [k,value]of previous)try{if(value===null)storage.removeItem(k);else storage.setItem(k,value);}catch{}
    this.onError('无法保存迁入进度，请在允许本地存储的浏览器中重试。原有正常存档保留。');return false;
   }
  }
  write(story,game){try{if(!this.storage)throw new Error('storage unavailable');const old=this.storage.getItem(this.key);if(old){try{if(JSON.parse(old)?.version===SAVE_VERSION)this.storage.setItem(this.key+'-backup',old);}catch{}}this.storage.setItem(this.key,JSON.stringify({version:SAVE_VERSION,savedAt:Date.now(),story,game}));return true;}catch{this.onError('无法保存到浏览器；请勿刷新，或在允许本地存储的浏览器中游玩。');return false;}}
}
