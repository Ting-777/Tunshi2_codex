import {D} from './dialogues.js';
import {CONTROL,WAREHOUSE} from './missions.js';
import {distance,position} from './world.js';
import {TianBoEscort} from './escort.js';
const inside=(rt,area,at)=>[(rt.api.interiors[area]?.ox||0)+at[0],at[1]];
export class FourthEncounters{
 constructor(actions){this.a=actions;this.rt=actions.rt;this.tianBo=new TianBoEscort(this);}
 get w(){return this.rt.state().world;}
 get live(){return this.rt.world._enemies.filter(e=>e.enabled&&e.hp>0);}
 spawn(o,p,points=o.enemies||[],restore=false){const rt=this.rt;rt.world.spawn(restore&&p.enemies?.length?p.enemies.map(e=>[...e.at,e.role]):points.map(([x,z,role])=>[...(o.local?inside(rt,o.area,[x,z]):[x,z]),role]),p,o.area);}
 begin(o,p){const rt=this.rt,w=this.w;
  if(['defend','holdout','upload'].includes(o.type)){p.fileHP??=o.type==='holdout'?200:180;p.elapsed??=0;p.started??=false;p.wave??=0;}
  if(o.encounter==='escort')this.tianBo.begin(o,p);
  if(o.encounter==='tail'||o.encounter==='runner'){p.elapsed??=0;if(!p.enemies){const route=this.a.route(o,p),a=route[Math.min(1,route.length-1)],points=o.encounter==='tail'?[[-230,-492,'charger'],[-294,-465,'thrower']]:[[a[0]-3,a[1]-4,'charger'],[a[0]+3,a[1]+5,'thrower']];this.spawn(o,p,points.map(([x,z,role])=>[x-(o.local?rt.api.interiors[o.area].ox:0),z,role]));}}
  if(o.encounter==='parking'){p.carStopped??=false;p.carHP??=100;p.elapsed??=0;const v=rt.world.van;v.hp=p.carHP;v.g.position.set(...[p.carAt?.[0]??rt.api.interiors[o.area].ox,-4.5,p.carAt?.[1]??17]);v.g.rotation.y=Math.PI;v.intentX=v.intentZ=0;w.opened.parkingGate??=true;}
  if(o.encounter==='breach'){for(const id of['warehouse-power-left','warehouse-power-right'])if(!p.enemies&&!p.spawned){w.opened[id]=false;w.damage[id]=60;}}
  if(o.encounter==='crossfire'){w.opened.warehouseGateLeft??=true;w.opened.warehouseGateRight??=true;}
  if(o.encounter==='relays'&&!p.enemies)this.spawn(o,p,[[-6,7,'guard'],[6,6,'charger'],[8,-4,'caller']]);
  if(p.enemies?.length)this.spawn(o,p,[],true);for(const e of rt.world._enemies)e.pursuit=['escort','tail','runner'].includes(o.encounter);
  if(o.id==='c405-fight'){
   const arriving=w.escortSquareHP==null;
   w.escortSquareHP??=(p.escortHP??w.escortHP)>0?(p.escortHP??w.escortHP):140;
   // First arrival carries damage. A local retry restores the ally; refresh
   // retains the exact saved progress, like the preceding road checkpoints.
   p.escortHP??=arriving?w.escortSquareHP:140;
   const ally=rt.world.contact('田博',p.escortAt||[-10,-336],'outside');ally.hp=p.escortHP;ally.maxHp=140;w.escortHP=p.escortHP;
  }
  if(o.encounter==='escort'||o.id==='c405-fight'){this.tianBo.markEnemies(o,p);this.tianBo.support.begin(o,p);}
 }
 start(o,p){if(p.started)return;if(o.requiredGame&&!p.facilityDone){this.rt.api.toast('先完成'+(o.requiredGame==='drink'?'吧台碰杯':'店里的这局')+'，给店员腾出备份时间。');return;}p.started=true;p.elapsed??=0;p.fileHP??=180;this.spawn(o,p);this.rt.api.toast(o.type==='holdout'?'文件正在复制。打退砸电脑的人，回来接着拷。':'备份已启动。别让他们砸掉机子！');}
 checkpoint(o,p){this.rt.world.preserve(p);this.a.checkpoint(o,p);}
 tick(o,p,dt){const rt=this.rt;if(rt.area()!==o.area||rt.api.get().driving){if(o.encounter==='escort'){const ally=rt.world.contacts.get('田博');if(ally)ally.intentX=ally.intentZ=0;}return false;}
  const brief={ 'c402-race':'raceBrief','c402-bar':'barBrief','c402-table':'tableBrief','c404-office':'officeBrief','c404-offline':'offlineBrief','c406-tail':'tailBrief','c406-song':'ktvBrief','c406-breaker':'breachBrief','c406-parking':'parkingBrief'}[o.id];if(brief&&!p.briefed){p.briefed=true;rt.say(o.id+':action',D[brief],'面对面');rt.parent.save();return false;}
  for(const k of Object.keys(p.cooldowns||{}))p.cooldowns[k]=Math.max(0,p.cooldowns[k]-dt);
  if(p.escapeGateTime>0){p.escapeGateTime=Math.max(0,p.escapeGateTime-dt);if(!p.escapeGateTime){this.w.opened.escapeGate=true;rt.world.apply();}}if(o.encounter==='escort')return this.tianBo.tick(o,p,dt);
  if(['tail','runner'].includes(o.encounter)){p.elapsed+=dt;const d=distance(rt.position(),position(rt.world.runner));if(p.intercepted)return true;if(rt.world.runner.hp<=0){p.intercepted=true;rt.api.carry('蓝袋校验卡');return true;}if(p.pathIndex>=this.a.route(o,p).length){p.exitTime=(p.exitTime||0)+dt;if(o.encounter==='tail'&&d<12)return true;if(p.exitTime>8)return{fail:'蓝袋被接走了。重试这段，先绕过拦路的人、再截住蓝袋子。'};}p.lost=d>85?(p.lost||0)+dt:0;if(p.lost>8||p.elapsed>95)return{fail:o.encounter==='runner'?'拿蓝袋的人已经跑远。重试，先落闸再追过去。':'拿蓝袋的人已经跑远。重试，别被巷口的人拖住。'};rt.world.preserve(p);return false;}
  if(o.encounter==='parking')return this.parking(o,p,dt);
  if(['defend','holdout'].includes(o.type)){if(p.fileHP<=0)return{fail:'原始记录被砸毁了。重试，先护住正在备份的机子。'};if(!p.started)return false;
   if(o.type==='holdout'){p.copyPause=Math.max(0,(p.copyPause||0)-dt);if(this.a.near(o,3.8)&&p.copyPause===0)p.elapsed+=dt;}
   else p.elapsed+=dt;
   if(p.wave===0&&p.elapsed>o.seconds/2&&!p.assist){p.wave=1;const a=inside(rt,o.area,[-6,8]);rt.world.reinforce([[...a,'brawler']],p,o.area);rt.parent.save();}
   rt.world.preserve(p);return p.elapsed>=o.seconds&&!this.live.length;}
  if(['raid','ktv','breach','crossfire','relays'].includes(o.encounter)){if(!p.spawned&&this.a.near(o,28)&&(!o.requiredGame||p.facilityDone||['ktv','breach'].includes(o.encounter)))this.spawn(o,p);rt.world.preserve(p);
   if(o.encounter==='ktv')return!!p.facilityDone&&!this.live.length;
   if(o.encounter==='breach')return!!p.facilityDone&&['warehouse-power-left','warehouse-power-right'].every(id=>this.w.opened[id]||this.w.damage[id]===0)&&!this.live.length;
   if(o.encounter==='relays')return['relay-left','relay-right'].every(id=>this.w.opened[id]||this.w.damage[id]===0)&&!this.live.length;
   return o.encounter==='raid'?(!o.requiredGame||!!p.facilityDone)&&!!p.interacted&&!this.live.length:!!p.spawned&&!this.live.length;}
  if(o.type==='upload'){if(p.fileHP<=0)return{fail:'播出服务器被砸停了。重试，利用两侧电箱分开敌人。'};if(!p.started)return false;p.elapsed+=dt;
   const blocked=this.live.some(e=>distance(position(e),rt.point(o))<3);if(!blocked)p.upload=(p.upload||0)+dt;
   if(p.wave<3&&p.elapsed>10+p.wave*10&&this.live.length<=4){p.wave++;rt.world.reinforce(this.uploadWave(p.wave),p,o.area);rt.parent.save();}
   rt.world.preserve(p);return p.upload>=o.seconds-(this.w.musicHelp||0)&&!this.live.length;}
  return null;
 }
 uploadWave(wave){const rt=this.rt,r=rt.api.interiors[CONTROL];return wave===0?[[r.ox-6,8,'charger'],[r.ox+6,8,'guard']]:[[r.ox+(wave%2?7:-7),8,wave===3?'foreman':'thrower'],[r.ox-(wave%2?7:-7),7,'charger']];}
 moveActor(e,aim,speed,dt){const a=position(e),d=distance(a,aim);e.intentX=(aim[0]-a[0])/Math.max(.01,d)*Math.min(speed,d/Math.max(dt,.001));e.intentZ=(aim[1]-a[1])/Math.max(.01,d)*Math.min(speed,d/Math.max(dt,.001));if(d>.1)e.g.rotation.y=Math.atan2(e.intentX,e.intentZ);}
 parking(o,p,dt){const rt=this.rt,v=rt.world.van;if(!p.spawned&&this.a.near(o,30))this.spawn(o,p);p.elapsed+=dt;v.intentX=v.intentZ=0;
  if(v.hp<=40||this.w.opened.parkingGate===false){if(!p.carStopped)rt.api.toast(v.hp<=40?'车轮撑不住了！总账还在后箱。':'出库闸落下了，车走不了。');p.carStopped=true;}
  if(!p.carStopped&&p.elapsed>5)v.intentZ=-.65;
  if(v.g.position.z<-7&&!p.carStopped)return{fail:'灰车已经出了停车场。重试，砸停车轮或先落出库闸。'};
  p.carAt=position(v);p.carHP=v.hp;rt.world.preserve(p);return!!p.interacted&&!this.live.length&&p.carStopped;
 }
 target(e,o,p){const rt=this.rt;if(o?.encounter==='escort'||o?.id==='c405-fight')return this.tianBo.target(e,o,p);if(rt.world._enemies.indexOf(e)%3!==1)return null;
  if(['defend','holdout','upload'].includes(o?.type)&&p.started){const machine=rt.world.props.get(o.prop);return{at:machine?.at||rt.point(o),stationary:true,damage:n=>{p.fileHP=Math.max(0,p.fileHP-n);if(machine)machine.hitUntil=rt.combat.clock+.18;rt.api.impactSound('furniture');rt.parent.save();}};}

  return null;
 }
 switches(o,p){const rt=this.rt;let ids=[];if(o.encounter==='breach')ids=['warehouse-power-left','warehouse-power-right'];if(o.encounter==='crossfire')ids=['warehouse-switch-left','warehouse-switch-right'];if(o.encounter==='parking')ids=['parking-switch'];if(o.type==='upload')ids=['emergency-left','emergency-right'];if(o.encounter==='escort')ids=['escape-switch'];if(o.encounter==='relays')ids=['relay-left','relay-right'];const b=rt.world.nearest(ids);return b;}
 interact(o,p){const rt=this.rt,b=this.switches(o,p);if(b){p.cooldowns||={};if(p.cooldowns[b.id]>0){rt.api.toast('电机还在复位，稍等。');return true;}p.cooldowns[b.id]=6;
   const gates={'warehouse-switch-left':'warehouseGateLeft','warehouse-switch-right':'warehouseGateRight','parking-switch':'parkingGate','escape-switch':'escapeGate'};
   if(gates[b.id]){const key=gates[b.id];this.w.opened[key]=!this.w.opened[key];if(key==='escapeGate')p.escapeGateTime=6;if(key==='parkingGate')p.carStopped=true;const box=rt.world.props.get(b.id);rt.combat.shock([box.at[0],box.at[1]-4]);rt.api.toast(this.w.opened[key]?'卷闸升起':'卷闸落下 · 另一侧仍能通行');}
   else if(b.id.startsWith('emergency')){rt.combat.shock([b.at[0],8]);p.fileHP=Math.min(180,p.fileHP+12);rt.api.toast('应急断电 · 这一侧保全被闪停，播出电源稳住了');}
   else {this.w.opened[b.id]=true;this.w.damage[b.id]=0;rt.combat.shock(b.at);}rt.api.impactSound('furniture');rt.world.apply();return true;}
  if(['defend','holdout'].includes(o.type)&&this.a.near(o,3.8)){this.start(o,p);return true;}
  if(o.type==='upload'&&this.a.near(o,3.8)){if(!p.started){p.started=true;p.upload??=0;p.elapsed??=0;rt.world.spawn(this.uploadWave(0),p,o.area);}return true;}
  if(['raid','ktv'].includes(o.encounter)&&this.a.near(o,3.8)){if(this.live.length)rt.api.toast(o.encounter==='ktv'?'先打退后场看守，再去包房唱一段掩护听歌。':'抢东西的人还在旁边，先让他松手。');else if(o.requiredGame&&!p.facilityDone)rt.api.toast('牌局还没结束，老板的凭证还没拿出来。');else p.interacted=true;return true;}
  if(o.encounter==='parking'&&distance(rt.position(),position(rt.world.van))<5&&rt.area()===o.area){if(!p.carStopped)rt.api.toast('它还在往出口开！落闸，或者打坏车轮。');else if(this.live.length)rt.api.toast('先打退保全，再开后箱。');else{p.interacted=true;rt.api.carry('电子总账');}return true;}
  return false;
 }
 event(type,data,o,p){const rt=this.rt;if(type==='hurt'&&o.type==='holdout'&&p.started){p.copyPause=1.6;rt.api.toast('复制暂时停住了，已拷下来的还在。');}
  if(o.encounter&&(type==='leisureFinish'&&!data.abandoned&&data.type===(o.requiredGame||o.optionalGame)||type==='leisureDrink'&&(o.requiredGame||o.optionalGame)==='drink')&&data.room===o.area&&!p.assist){p.assist=true;p.facilityDone=true;if(o.encounter==='ktv'){p.facilityDone=true;this.w.musicHelp=Math.min(5,Math.floor((data.hits||0)/6));}else if(o.encounter==='breach'){this.w.warehouseOpen=true;}else p.fileHP=Math.min(220,(p.fileHP||180)+40);rt.api.toast(o.encounter==='ktv'?'听歌找到下一站了，走后场！':'店里的人腾出了手，帮你护住证据。');rt.world.apply();rt.parent.save();}
 }
 call(e){const o=this.rt.manager?.objective,p=this.rt.manager?.record?.progress;if(!o||!p||this.live.length>=6)return;const a=position(e);this.rt.world.reinforce([[a[0]-3,a[1]+4,'brawler'],[a[0]+3,a[1]+4,'charger']],p,e.area);this.rt.api.toast('增援来了 · 下次先打断拿电话的人');}
 prompt(o,p){const b=this.switches(o,p);if(b)return'E · '+b.name;if(['defend','holdout'].includes(o.type)&&this.a.near(o,3.8))return p.started?'守住证据 · 可以反击':'E · 开始备份';if(['raid','ktv'].includes(o.encounter)&&this.a.near(o,3.8))return'E · '+(o.encounter==='ktv'?'查看登记台 / 去包房唱一段':'取回凭证');if(o.encounter==='parking'&&distance(this.rt.position(),position(this.rt.world.van))<5)return'E · 打开总账后箱';return'';}
 hint(o,p){if(['defend','holdout'].includes(o.type))return' · 备份 '+Math.min(o.seconds,p.elapsed||0).toFixed(1)+'/'+o.seconds+' 秒 · 记录 '+Math.ceil(p.fileHP??180);if(o.encounter==='escort')return this.tianBo.hint(o,p);if(o.id==='c405-fight')return' · 田博 '+Math.ceil(p.escortHP??140)+'/140';if(o.encounter==='parking')return p.carStopped?' · 车辆已拦停':' · 车正在准备出库';return'';}
}
