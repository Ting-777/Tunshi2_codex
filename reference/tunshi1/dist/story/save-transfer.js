import {CHAPTER1} from './chapter1.js';
import {CHAPTER2} from '../chapter2/missions.js';
import {CHAPTER4} from '../chapter4/story/missions.js';
import {CHAPTER3} from '../chapter3/story/missions.js';
import {normalizeTransferCode,validTransferCode,formatTransferCode,validateSaveDocument} from './save-document.js';

const date=value=>new Date(value).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
export function describeSave(save){
 const fourth=!!save.story.chapter4,third=!!save.story.chapter3,second=!!save.story.chapter2,state=save.story.chapter4||save.story.chapter3||save.story.chapter2||save.story;
 const mission=(fourth?CHAPTER4:third?CHAPTER3:second?CHAPTER2:CHAPTER1).find(m=>m.id===state.currentMission);
 const progress=state.chapterComplete?'已通关 · 自由探索':mission?'《'+mission.title+'》':'任务间歇';
 const testing=save.game.regions?.mapTest?'地图测试 · ':'';
 return testing+(fourth?'第四章':third?'第三章':second?'第二章':'第一章')+' · '+progress+'\n保存于 '+date(save.savedAt)+'\n生命 '+Math.round(save.game.health)+'/100 · 口袋 ¥'+save.game.money.toFixed(2)+' · 帮费 ¥'+save.story.gangMoney.toLocaleString('zh-CN');
}

// A code is an immutable snapshot, not a second autosave/synchronization system.
export function setupSaveTransfer({store,continueSave,fetcher=(...args)=>fetch(...args),root=document}){
 const $=id=>root.querySelector('#'+id),panel=$('saveTransfer'),input=$('transferInput');
 let preview=null,generated=null,busy=false,request=null,serial=0;
 const status=(text,error=false)=>{const node=$('transferStatus');node.textContent=text;node.classList.toggle('transferError',error);};
 const buttons=()=>{ $('transferGenerate').disabled=busy||!store.read();$('transferLookup').disabled=busy;$('transferContinue').disabled=busy||!preview;$('transferCopy').disabled=busy||!generated;};
 function clearPreview(){preview=null;$('transferPreview').classList.add('hidden');buttons();}
 function cancel(){++serial;request?.abort();request=null;busy=false;buttons();}
 function close(){cancel();panel.classList.add('hidden');$('transferToggle').focus?.();}
 function open(){
  cancel();clearPreview();const save=store.read();
  $('transferLocal').textContent=save?describeSave(save):'本机还没有存档。开始游玩后会自动保存；也可以在下方输入另一台设备的迁移码。';
  if(generated?.source!==JSON.stringify(save)||generated?.expiresAt<=Date.now()){generated=null;$('transferExport').classList.add('hidden');}
  status('');panel.classList.remove('hidden');buttons();(save?$('transferGenerate'):input).focus?.();
 }
 async function call(path,options){
  const id=++serial;request=new AbortController();const controller=request;busy=true;buttons();
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetcher(path,{...options,signal:controller.signal,cache:'no-store',credentials:'same-origin'});
   let data;try{data=await response.json();}catch{throw new Error('迁移服务没有返回可读取的数据，请稍后重试。');}
   if(!response.ok)throw new Error(data.error||'迁移服务暂时不可用，请稍后重试。');
   if(id!==serial)return null;return data;
  }catch(error){if(id===serial)status(error.name==='AbortError'?'连接超时，请检查网络后重试。本机存档保留。':error.message||'连接失败，请检查网络后重试。',true);return null;}
  finally{clearTimeout(timer);if(id===serial){busy=false;request=null;buttons();}}
 }
 $('transferToggle').onclick=open;$('transferClose').onclick=close;
 $('transferGenerate').onclick=async()=>{
  if(busy)return;const save=store.read();if(!save){status('本机还没有可导出的存档。',true);return;}
  try{validateSaveDocument(save);}catch(error){status(error.message,true);return;}
  status('正在保存进度快照…');const result=await call('/api/save-transfers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({save})});
  if(!result)return;
  if(!validTransferCode(normalizeTransferCode(result.code))||!Number.isFinite(result.expiresAt)){status('迁移服务返回的代码无效，请重试。',true);return;}
  generated={...result,source:JSON.stringify(save)};$('transferOutput').value=formatTransferCode(result.code);$('transferExpiry').textContent='有效至 '+date(result.expiresAt)+' · 对应上方保存时刻';$('transferExport').classList.remove('hidden');buttons();status('迁移码已生成。在另一台设备打开本站，输入这 8 位代码。');
 };
 $('transferCopy').onclick=async()=>{
  if(!generated)return;const code=$('transferOutput').value;
  try{await navigator.clipboard.writeText(code);status('已复制迁移码：'+code);}catch{$('transferOutput').focus?.();$('transferOutput').select?.();status('请复制上方迁移码；手机可长按选中。');}
 };
 $('transferForm').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;clearPreview();const code=normalizeTransferCode(input.value);
  if(!validTransferCode(code)){status('请输入 8 位迁移码，横线和大小写都不影响。',true);input.focus?.();return;}
  input.value=formatTransferCode(code);status('正在读取迁移存档…');const result=await call('/api/save-transfers/'+code,{method:'GET'});
  if(!result)return;
  try{validateSaveDocument(result.save);if(normalizeTransferCode(result.code)!==code)throw new Error('迁移码与返回存档不一致，请重试。');}catch(error){status(error.message,true);return;}
  preview=result.save;$('transferRemote').textContent=describeSave(preview);$('transferPreview').classList.remove('hidden');buttons();status('存档已找到。点“从此存档继续”开始，原有正常存档保留。');
 });
 input.addEventListener('input',()=>{if(request)cancel();clearPreview();status('');});
 $('transferContinue').onclick=()=>{
  if(busy||!preview)return;
  try{
   validateSaveDocument(preview);
   if(!store.importSnapshot(preview))throw new Error('设备无法保存迁入进度，请允许浏览器本地存储后重试。');
   const save=preview;close();continueSave(save);
  }catch(error){status(error.message,true);panel.classList.remove('hidden');}
 };
 panel.addEventListener('keydown',event=>{
  if(event.code==='Escape'){event.preventDefault();event.stopPropagation();close();}
  if(event.code==='Tab'){
   const nodes=[...panel.querySelectorAll('button,input')].filter(n=>!n.disabled&&n.offsetParent!==null),first=nodes[0],last=nodes.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
 });
 return {open,close};
}
