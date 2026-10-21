import {D} from './dialogues.js';
import {distance} from './world.js';
export const SHOW_AT=[0,-365];
export class StreetFinale{
 constructor(rt){this.rt=rt;this.replay=null;}
 progress(){const m=this.rt.manager;return m?.objective?.type==='streetShow'?m.record.progress:this.replay;}
 active(){return !!this.progress()?.started&&!this.progress()?.finished;}
 ready(){const rt=this.rt,g=rt.api.get();return g.region===rt.regionId&&!g.interior&&!g.driving&&distance(rt.position(),SHOW_AT)<15;}
 interact(){const rt=this.rt,p=this.progress();if(!this.ready())return false;if(p?.started)return true;if(!p&&!rt.state().chapterComplete)return false;const q=p||{};if(!p)this.replay=q;Object.assign(q,{started:true,time:0,cameraTime:0,ad:false,public:false,response:false,ending:false,finished:false});rt.pressure.clear();rt.world.clearEnemies();rt.api.face([38,-393]);rt.api.toast('黄兴广场 · 抬头看');rt.parent.save();return true;}
 tick(dt){const rt=this.rt,p=this.progress(),g=rt.api.get();if(!p?.started||p.finished||g.region!==rt.regionId||g.interior||g.paused||g.dead)return;p.cameraTime=(p.cameraTime??p.time??0)+dt;const held=!this.replay&&rt.parent.dialogue.busy&&(p.ad&&!p.public&&(p.time||0)>=9.99||p.response&&!p.ending&&(p.time||0)>=31.99);if(!held)p.time=(p.time||0)+dt;
  if(p.time>=2&&!p.ad){p.ad=true;rt.state().world.screenStage='dolphin';rt.world.apply();if(!this.replay)rt.say('c407:street-lights',D.screenOn,'街区大屏');rt.parent.save();}
  if(p.time>=10&&!p.public){p.public=true;rt.state().world.networkPublic=true;rt.state().world.screenStage='public';rt.world.apply();if(!this.replay)rt.market('c407');rt.parent.save();}
  if(p.time>=21&&!p.response){p.response=true;rt.state().world.mainScreenTaken=true;rt.state().world.screenStage='hijack';rt.world.apply();if(!this.replay)rt.say('c407:screen-response',D.screenReply,'街区大屏');rt.parent.save();}
  if(p.time>=32&&!p.ending){p.ending=true;if(!this.replay)rt.say('c407:river-ending',D.ending,'面对面');rt.parent.save();}
  if(p.cameraTime>=40&&!p.cameraReturned){p.cameraReturned=true;rt.api.lookToward?.([38,18,-393]);}if(p.time>=40&&(!rt.parent.dialogue.busy||this.replay)){p.finished=true;rt.state().world.screenStage='hijack';rt.world.apply();if(this.replay)this.replay=null;rt.parent.save();}
 }
 shot(){const p=this.progress();if(!p?.started||(p.cameraTime??p.time)>=40||p.finished||!this.ready())return null;const t=p.cameraTime??p.time??0,phase=t<7?0:t<14?1:t<21?2:t<30?3:4,q=phase===0?t/7:phase===1?(t-7)/7:phase===2?(t-14)/7:phase===3?(t-21)/9:(t-30)/10;
  const shots=[{from:[-2,2.8,-352],to:[3,5,-359],look:[38,18,-393]}, {from:[0,11,-340],to:[0,14,-350],look:[0,17,-393]}, {from:[-2,5,-380],to:[2,7,-383],look:[-38,18,-393]}, {from:[0,7,-358],to:[-5,6,-367],look:[38,18,-393]}, {from:[8,8,-345],to:[0,3,-356],look:[0,15,-393]}];const s=shots[phase];return{position:s.from.map((n,i)=>n+(s.to[i]-n)*q),look:s.look,phase};
 }
 prompt(){if(this.ready())return this.rt.state().chapterComplete?'E · 重看黄兴广场大屏演出':this.progress()?.started?'豚师的广告正在街区播放':'E · 看向街区大屏';return'';}
}
