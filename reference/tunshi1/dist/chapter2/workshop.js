import {SHOP} from './missions.js';
import {conversations as D} from './dialogues.js';
const customers=['阿松','阿福','小武'];
export class Workshop{
 constructor(rt){this.rt=rt;this.$=rt.$;this.active=false;this.elapsed=0;this.phase=0;this.freeProgress=null;}
 begin(p){this.active=false;this.freeProgress=null;this.hide();p.served=Math.min(3,Math.max(p.served??p.topics?.length??0,this.rt.state().world.ordersServed||0));if(p.served>=2){p.collectors=true;p.collectionDone=!!this.rt.state().world.collectorsCleared;}p.quality??=100;for(const [i,name]of customers.entries())this.rt.world.contact(name,[2545+i*5,4],SHOP);this.rt.world.sets.workbench.g.visible=true;}
 hide(){this.$('#storyActionMeter').classList.add('hidden');}
 restoreOrder(){const w=this.rt.state().world;this.active=false;this.hide();this.freeProgress=w.pendingOrder||null;if(this.freeProgress&&w.paidJobs?.['free-order:'+this.freeProgress.serial]){w.orderSerial=Math.max(w.orderSerial||0,this.freeProgress.serial+1);w.pendingOrder=this.freeProgress=null;}}
 ready(){return this.rt.area()===SHOP&&Math.hypot(this.rt.position()[0]-2555,this.rt.position()[1]+.75)<2.3;}
 freeOrder(){const w=this.rt.state().world;this.freeProgress=w.pendingOrder||{free:true,serial:w.orderSerial||0,served:0,quality:100};w.pendingOrder=this.freeProgress;this.active=false;this.rt.parent.save();this.rt.api.toast('加急单接好了 · 到维修台开工，失误会降低结算');}
 interact(p){
  if(!p.free&&p.served>=3)return false;if(!this.ready()||p.collectors&&!p.collectionDone)return false;
  if(!this.active){this.active=true;this.elapsed=0;this.phase=0;this.start=this.rt.position();this.$('#storyActionMeter').classList.remove('hidden');return true;}
  const width=this.rt.state().world.workbenchUpgrade?.24:.13;
  if(Math.abs(this.phase-.5)>width){p.quality=Math.max(40,(p.quality||100)-15);this.rt.api.toast('接触不稳 · 品质 '+p.quality+'%，重新调，绿色区间收手');this.elapsed=0;return true;}
  this.active=false;this.hide();const n=p.served++,name=customers[n%3],base=this.rt.state().world.workbenchUpgrade?90:60,pay=Math.round(base*(p.quality||100)/100);
  this.rt.economy.credit(p.free?'free-order:'+p.serial:'workshop:'+n,pay);p.quality=100;
  if(p.free){this.rt.state().world.orderSerial=(p.serial||0)+1;this.rt.state().world.pendingOrder=this.freeProgress=null;this.rt.api.toast('加急订单完成 · +¥'+pay);}
  else{this.rt.state().world.ordersServed=p.served;p.topics=customers.slice(0,p.served);this.rt.world.contacts.get(name).intentZ=2;if(D.orders[name])this.rt.say('workshop:order:'+n,D.orders[name]);}
  this.rt.parent.save();return true;
 }
 tick(p,dt){
  if(!this.active)return;if(!this.ready()||Math.hypot(this.rt.position()[0]-this.start[0],this.rt.position()[1]-this.start[1])>.6){this.active=false;this.hide();this.rt.api.toast('修理中断 · 回维修台再试');return;}
  this.elapsed+=dt;this.phase=(Math.sin(this.elapsed*2.6-Math.PI/2)+1)/2;this.rt.world.sets.workbench.device.rotation.z=Math.sin(this.elapsed*2.6)*.1;
  this.$('#storyActionCursor').style.left=(this.phase*100)+'%';this.$('#storyActionGreen').style.width=(this.rt.state().world.workbenchUpgrade?48:26)+'%';this.$('#storyActionText').textContent=(p.free?'加急订单':customers[p.served%3]+'的设备')+' · 品质 '+(p.quality||100)+'% · 绿色区间收手';
 }
}
