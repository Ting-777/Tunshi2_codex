import {distance} from './world.js';
export const OUTDOOR_ENCOUNTERS={
 'checkpoint':{at:[572,-275],actors:[[572,-270,'guard'],[579,-278,'brawler']],line:'调度台有人拦着。先打退他们，再拿调度单。'},
 'academy':{at:[685,294],actors:[[680,292,'brawler'],[691,289,'charger'],[688,299,'guard']],line:'书院旁又有人堵路。别站在台阶口挨冲锋，旁边的木凳可以 Q 拿起。'},
 'aiwan':{at:[575,235],actors:[[573,228,'guard'],[583,230,'brawler'],[563,236,'charger']],line:'山腰有人追来。把他们引到亭旁的平台，椅子和花盆都能拿来砸。'},
 'temple':{at:[430,188],actors:[[423,190,'guard'],[438,187,'charger'],[432,181,'brawler']],line:'麓山寺前有人守路。台阶口窄，先侧闪，再到平台上反击。'},
 'summit':{at:[260,80],actors:[[254,81,'guard'],[267,75,'charger']],line:'山顶还有一组。F 砸掉通信箱，就能截住他们的增援；打通后再看望远镜。'},
 'escort-junction':{at:[-485,-29],actors:[[-484,-35,'guard'],[-492,-21,'charger'],[-477,-26,'brawler']],line:'JC：前面有人截路！你挡住他们，我先靠边。开车可以撞开或甩掉他们。'},
 'escort-bridge':{at:[-654,192],actors:[[-654,197,'guard'],[-662,190,'charger'],[-645,191,'brawler']],line:'JC：桥前的货推车堵住了。打退截路的人，E 推开车，或者把它撞碎。'}
};
export class OutdoorEncounters{
 constructor(rt){this.rt=rt;}
 cleared(id){return !!this.rt.state().world.clearedEncounters?.[id];}
 begin(o,p){if(p.encounterId&&OUTDOOR_ENCOUNTERS[p.encounterId])this.rt.world.spawn(OUTDOOR_ENCOUNTERS[p.encounterId].actors,p);}
 start(id,p){
  if(this.cleared(id)||p.encounterId)return false;const rt=this.rt,set=OUTDOOR_ENCOUNTERS[id];
  p.encounterId=id;p.encounterTime=0;p.enemies=null;p.spawned=false;rt.world.spawn(set.actors,p);
  if(id==='escort-bridge'){rt.state().world.escortBlockade=true;rt.world.apply(rt.state());}
  rt.api.toast(set.line);rt.parent.save();return true;
 }
 finish(p,escaped=false){
  const rt=this.rt,id=p.encounterId;if(!id)return;
  rt.state().world.clearedEncounters||={};rt.state().world.clearedEncounters[id]=true;
  p.encounterId=null;p.enemies=null;p.spawned=false;rt.world.clearEnemies();
  if(!escaped){rt.api.heal(12);rt.state().world.heat=Math.min(rt.state().world.heatCapacity||100,(rt.state().world.heat||0)+12);}
  if(['aiwan','temple'].includes(id)&&!rt.api.get().driving)rt.manager.record.checkpoint=rt.api.checkpoint();
  rt.api.toast(escaped?'甩掉截路者 · JC 继续指路':'这段路打通了 · 恢复 12 生命');rt.parent.save();
 }
 tick(o,p,dt){
  const rt=this.rt,pos=rt.position(),g=rt.api.get(),w=rt.world;
  if(p.encounterId){
   p.encounterTime=(p.encounterTime||0)+dt;w.preserve(p);
   if(w.enemies.length&&w.enemies.every(e=>e.hp<=0))this.finish(p);
   else if(p.encounterId==='escort-junction'&&p.passenger&&distance(pos,OUTDOOR_ENCOUNTERS['escort-junction'].at)>95)this.finish(p,true);
   else if(p.encounterId==='summit'&&p.encounterTime>9&&!p.summitBackup){p.summitBackup=true;if(w.props.get('summit-radio').hp>0){w.reinforce([[270,90,'brawler']],p);rt.api.toast('通信箱还在响 · 山脊增援到了');}}
   if(p.encounterId)return true;
  }
  let id;
  if(o.id==='c301-check')id='checkpoint';
  if(o.id==='c301-foot')id='academy';
  if(o.id==='c302-climb'){
   if(!this.cleared('aiwan')&&distance(pos,OUTDOOR_ENCOUNTERS.aiwan.at)<28)id='aiwan';
   else if(distance(pos,OUTDOOR_ENCOUNTERS.temple.at)<32)id='temple';
  }
  if(o.id==='c302-view')id='summit';
  if(o.type==='escort'){
   if(!this.cleared('escort-junction')&&distance(pos,OUTDOOR_ENCOUNTERS['escort-junction'].at)<44)id='escort-junction';
   else if(distance(pos,OUTDOOR_ENCOUNTERS['escort-bridge'].at)<49)id='escort-bridge';
  }
  if(id&&!this.cleared(id)&&rt.area()==='outside'&&distance(pos,OUTDOOR_ENCOUNTERS[id].at)<(o.type==='escort'?49:34))this.start(id,p);
  return !!p.encounterId;
 }
 allows(o){const needed={'c301-check':'checkpoint','c301-foot':'academy','c302-climb':'temple','c302-view':'summit'}[o.id];return !needed||this.cleared(needed);}
 destination(p){const set=OUTDOOR_ENCOUNTERS[p.encounterId];return set?{at:set.at,label:p.encounterId.startsWith('escort')?'保护 JC · 清掉截路的人':'打通这一段 · Q 拿家具 / Q 砸人'}:null;}
 hint(p){return p.encounterId?'拦路者 '+this.rt.world.enemies.filter(e=>e.hp>0).length+' 人 · Q 拿物 / 再 Q 砸人':'';}
}
