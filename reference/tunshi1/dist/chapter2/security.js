import {distance,position} from './world.js';
import {GARAGE,OFFICE} from './missions.js';
const guarded=new Set(['stealth','infiltrate']);
const patrols={
 [GARAGE]:[[[2370,16],[2370,-17]],[[2430,-16],[2430,15]],[[2400,20],[2425,20]],[[2390,-22],[2410,-22]]],
 [OFFICE]:[[[3000,-7],[3000,-20]],[[3015,-5],[3024,-17]],[[3000,8],[3025,8]]]
};
// Saved alert/search/radio state belongs to the current objective, not a second save.
export class SecondSecurity{
 constructor(actions){this.actions=actions;this.rt=actions.rt;this.api=actions.api;this.world=actions.world;this.o=null;this.p=null;}
 clear(){this.o=this.p=null;for(const e of this.world.pool){e.security=false;e.securityTarget=null;e.securitySees=false;if(e.watchMark)e.watchMark.visible=false;if(e.callMark)e.callMark.visible=false;}}
 begin(o,p){
  if(!guarded.has(o.type))return;this.o=o;this.p=p;
  const legacy=!!p.detected&&!p.security;
  const s=p.security={mode:p.detected?'combat':'patrol',suspicions:[],reported:legacy,waves:0,backupIn:legacy?4:null,lost:0,search:0,radio:null,radioCooldown:0,bodies:{},...p.security};
  const defs=patrols[o.area];this.guards=this.actions.guards;this.routes=this.actions.patrols;
  const count=Math.max(defs.length,p.guards?.length||0);
  for(let i=0;i<count;i++){
   const old=p.guards?.[i],def=defs[i]||[this.entry(i),defs[i%defs.length][0]],role=old?.role||['guard','charger','guard','heavy'][i%4];
   const e=this.world.enemy(i,old?.at||def[0],o.area,old?.hp,role);e.security=true;e.securityMode=s.mode;e.securityTarget=s.lastSeen||null;
   if(old)e.g.rotation.y=old.angle||0;
   let route=[];try{route=this.rt.routeFor(def,o.area);}catch{}
   if(old?.dir===-1)route.reverse();
   this.guards.push(e);this.routes.push({route,index:Math.min(old?.index||1,Math.max(1,route.length-1)),dir:old?.dir||1});
   if(!e.watchMark)e.watchMark=this.api.label('?',.6,.7,'#695b37','#ffe2a2',e.g,0,3.6,0);
   if(!e.callMark)e.callMark=this.api.label('呼叫支援',2.6,.45,'#673e37','#ffe0aa',e.g,0,3.65,0);
   e.watchMark.visible=e.callMark.visible=false;
  }
  this.sync();this.capture();
 }
 entry(i){const exits=this.api.interiors[this.o.area].exits,at=exits[i%exits.length].at;return this.api.safeIn(this.o.area,at[0]+(i%2?1.6:-1.6),at[1]+(at[1]>0?-1.5:1.5),.65);}
 live(){return this.guards.filter(e=>e.enabled&&e.hp>0);}
 sees(e,at=this.rt.position(),crouch=this.api.get().crouching){
  if(e.hp<=0||!e.enabled||e.stun>0||this.rt.area()!==e.area)return false;
  const ep=position(e),gap=distance(ep,at),lit=e.area!==GARAGE||this.rt.state().world.garagePower[at[0]<2400?'west':'east'];
  const range=crouch?(lit?8.5:3.8):(lit?22:10.5),dot=(Math.sin(e.g.rotation.y)*(at[0]-ep[0])+Math.cos(e.g.rotation.y)*(at[1]-ep[1]))/Math.max(.01,gap);
  return gap<range&&(gap<2.1||dot>.45)&&this.api.interiors[e.area].clearLine(ep,at,.18);
 }
 sync(){const s=this.p.security;this.p.detected=s.mode!=='patrol';this.world.enemies=s.mode==='patrol'?[]:[...this.guards];for(const e of this.guards)e.securityMode=s.mode;}
 capture(){if(!this.p)return;this.p.guards=this.guards.map((e,i)=>({hp:e.hp,at:position(e),angle:e.g.rotation.y,role:e.role,index:this.routes[i]?.index||1,dir:this.routes[i]?.dir||1}));}
 alarm(reason='seen',knownAt=null){
  if(!this.p)return false;const s=this.p.security,first=s.mode==='patrol';s.mode='combat';s.lost=s.search=0;
  if(this.rt.area()===this.o.area)s.lastSeen=[...(knownAt||this.rt.position())];
  if(reason==='export'&&!s.reported){s.reported=true;s.backupIn=3.5;this.api.toast('系统报警 · 支援正在赶来，带资料撤离');}
  else if(first)this.api.toast('被发现了 · 打断手台呼叫，或绕墙甩开追击');
  this.sync();this.capture();return true;
 }
 noise(loud=false){
  if(!this.p||this.rt.area()!==this.o.area||this.api.get().region!=='chapter2_chazishan')return;
  const pos=this.rt.position();for(const e of this.live())if(distance(position(e),pos)<(loud?30:18)){this.alarm('noise');return;}
 }
 interrupted(e){
  const s=this.p?.security;if(!s||s.radio?.id!==this.guards.indexOf(e))return;
  s.radio=null;s.radioCooldown=2.2;e.phase='approach';e.phaseTime=0;e.callMark.visible=false;this.api.toast('呼叫被打断 · 趁空当脱离视线');
 }
 radio(dt){
  const s=this.p.security;if(s.reported)return;s.radioCooldown=Math.max(0,s.radioCooldown-dt);
  if(s.radio){const e=this.guards[s.radio.id];if(!e?.enabled){s.radio=null;s.radioCooldown=2;return;}if(e.hp<=0||e.stun>0){this.interrupted(e);return;}
   const known=s.lastSeen||position(e);e.intentX=e.intentZ=0;e.phase='radio';e.callMark.visible=true;e.g.rotation.y=Math.atan2(known[0]-e.g.position.x,known[1]-e.g.position.z);s.radio.time+=dt;
   if(s.radio.time>=2.8){s.radio=null;s.reported=true;s.backupIn=3.5;e.phase='approach';e.callMark.visible=false;this.api.toast('支援已收到呼叫 · 从入口进场');}return;
  }
  if(s.radioCooldown>0)return;
  const known=s.lastSeen||this.rt.position(),callers=this.live().filter(e=>e.stun<=0&&!['windup','recover'].includes(e.phase)).sort((a,b)=>distance(position(b),known)-distance(position(a),known));
  if(callers[0]){const e=callers[0];s.radio={id:this.guards.indexOf(e),time:0};e.phase='radio';e.intentX=e.intentZ=0;}
 }
 backup(dt){
  const s=this.p.security;if(!s.reported||s.waves>=2||s.backupIn===null)return;s.backupIn-=dt;if(s.backupIn>0)return;
  if(this.live().length>4){s.backupIn=2;return;}
  const wave=s.waves++;for(let n=0;n<2;n++){
   const i=this.guards.length,at=this.entry(wave*2+n),role=n===0?'charger':wave===0?'guard':'heavy',e=this.world.enemy(i,at,this.o.area,undefined,role);
   e.security=true;e.securityMode=s.mode;e.securityTarget=s.lastSeen||this.rt.position();this.guards.push(e);
   let route=[];try{route=this.rt.routeFor([at,patrols[this.o.area][i%patrols[this.o.area].length][0]],this.o.area);}catch{}
   this.routes.push({route,index:1,dir:1});if(!e.watchMark)e.watchMark=this.api.label('?',.6,.7,'#695b37','#ffe2a2',e.g,0,3.6,0);if(!e.callMark)e.callMark=this.api.label('呼叫支援',2.6,.45,'#673e37','#ffe0aa',e.g,0,3.65,0);e.watchMark.visible=e.callMark.visible=false;
  }
  s.backupIn=s.waves<2?14:null;this.sync();this.api.toast('支援从入口进入 · 别在原地跟他们耗');this.capture();this.rt.parent.save();
 }
 tick(o,p,dt){
  if(this.o!==o||this.p!==p||this.rt.area()!==o.area){for(const e of this.guards||[])e.intentX=e.intentZ=0;return;}
  const s=p.security,pos=this.rt.position(),room=this.api.interiors[o.area];let seen=false;
  for(let i=0;i<this.guards.length;i++){
   const e=this.guards[i];e.watchMark.visible=e.callMark.visible=false;if(e.hp<=0||!e.enabled)continue;
   const visible=this.sees(e);e.securitySees=visible;seen||=visible;
   if(s.mode==='patrol'){
    const ep=position(e),heard=this.api.get().playerSpeed>4.5&&distance(ep,pos)<8&&room.clearLine(ep,pos,.18);
    s.suspicions[i]=Math.max(0,Math.min(1,(s.suspicions[i]||0)+(visible?dt*(this.api.get().crouching?.85:1.45):-dt*.45)));
    if(heard&&!visible){e.investigate=[...pos];e.investigateTime=2.8;s.suspicions[i]=Math.max(.25,s.suspicions[i]);}
    if(e.investigateTime>0){e.investigateTime-=dt;const target=e.investigate;const d=distance(ep,target);e.intentX=e.intentZ=0;e.g.rotation.y=Math.atan2(target[0]-ep[0],target[1]-ep[1]);if(d>2&&room.clearLine(ep,target,.65)){e.intentX=(target[0]-ep[0])/d*2.2;e.intentZ=(target[1]-ep[1])/d*2.2;}}
    else{const patrol=this.routes[i],route=patrol.route;if(route.length>1){if(patrol.index>=route.length){route.reverse();patrol.index=1;patrol.dir*=-1;}const state={index:patrol.index};this.actions.steer(e,route,state,1.5);patrol.index=state.index;}}
    e.watchMark.visible=s.suspicions[i]>.08;
    if(s.suspicions[i]>=1){this.alarm();break;}
    for(let j=0;j<this.guards.length;j++)if(this.guards[j].hp<=0&&!s.bodies[j]&&this.sees(e,position(this.guards[j]),false)){s.bodies[j]=true;this.alarm('body',position(this.guards[j]));break;}
   }
  }
  p.alert=Math.max(0,...s.suspicions)*1.3;
  if(s.mode!=='patrol'){
   if(seen){s.lastSeen=[...pos];s.lost=0;if(s.mode==='search'){s.mode='combat';s.search=0;}}
   else s.lost+=dt;
   if(s.mode==='combat'&&s.lost>4.5){s.mode='search';s.search=0;if(s.radio){const e=this.guards[s.radio.id];e.phase='approach';e.callMark.visible=false;s.radio=null;s.radioCooldown=2;}}
   if(s.mode==='search'){s.search+=dt;if(s.search>10){s.mode='patrol';p.alert=0;s.suspicions=[];for(const e of this.guards){e.phase='approach';e.investigateTime=0;}this.api.toast('搜索结束 · 守卫还在，保持低姿态');}}
   if(s.mode==='combat')this.radio(dt);this.backup(dt);
   for(let i=0;i<this.guards.length;i++){const e=this.guards[i],target=s.lastSeen||pos;e.securityTarget=s.mode==='search'?room.safePoint(target[0]+Math.cos(i*2.1)*4,target[1]+Math.sin(i*2.1)*4,.65):target;}
   this.sync();
  }
  this.capture();
 }
 takedown(){if(!this.p||this.rt.area()!==this.o.area||!this.api.get().crouching||this.p.security.mode==='combat')return null;const pos=this.rt.position();return this.live().find(e=>{const at=position(e),d=distance(at,pos),dot=(Math.sin(e.g.rotation.y)*(pos[0]-at[0])+Math.cos(e.g.rotation.y)*(pos[1]-at[1]))/Math.max(.01,d);return d<2.05&&dot<-.6&&this.api.interiors[e.area].clearLine(at,pos,.15);});}
 interact(){
  if(!this.p)return undefined;const e=this.takedown();if(e){this.api.animateHeavy();this.api.damage(e,e.hp,0,0,'stealth');this.p.security.suspicions[this.guards.indexOf(e)]=0;this.api.toast('背后制服 · 别让其他巡逻看见倒地的人');this.capture();return true;}
  if(this.o.area===GARAGE){const prop=this.world.nearest(['garage-west','garage-east']);if(prop){const w=this.rt.state().world,zone=prop.id==='garage-west'?'west':'east';if(!this.p.items.includes(prop.id))this.actions.collectClue(prop.id);else{w.garagePower[zone]=!w.garagePower[zone];this.world.apply(this.rt.state());this.api.toast((zone==='west'?'西':'东')+'区照明已'+(w.garagePower[zone]?'打开':'关闭'));}return true;}}
  return undefined;
 }
 prompt(){if(!this.p||this.rt.area()!==this.o.area)return'';if(this.takedown())return'E 背后制服';if(this.o.area===GARAGE){const prop=this.world.nearest(['garage-west','garage-east']);if(prop&&this.p.items.includes(prop.id))return'E 切换'+(prop.id==='garage-west'?'西':'东')+'区照明';}return'';}
 canCopy(){return !this.p||!this.live().some(e=>this.sees(e));}
 hint(o,p,base=''){const s=p.security;if(!s)return base;const mode=s.mode==='combat'?(s.radio?'有人正在呼叫 · 打断或撤离':s.backupIn!==null?'增援 '+Math.max(0,Math.ceil(s.backupIn))+' 秒':'交战中'):s.mode==='search'?'正在搜索 · 绕墙藏住':p.alert>.1?'警觉 '+Math.min(100,Math.round(p.alert/1.3*100))+'%':'蹲下绕背 · E 制服';return [base,mode].filter(Boolean).join(' · ');}
}
