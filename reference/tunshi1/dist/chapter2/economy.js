import {SHOP,HOME} from './missions.js';
import {conversations as D} from './dialogues.js';
import {ChapterFunding} from './funding.js';
const offers=[
 {id:'workbenchUpgrade',price:180,title:'维修台配件',detail:'定位绿色区间变宽，主线和自由接单每单多赚 ¥30。',area:SHOP,minStage:4},
 {id:'shopStock',price:200,title:'采购一批零件',detail:'正常营业结余每分钟 ¥40，柜台上限 ¥600；自由订单也能接。',area:SHOP,minStage:4},
 {id:'techniqueTraining',price:240,title:'练习组合拳',detail:'近战伤害 +6，持续连击仍需要把握敌人的格挡与蓄力。',area:SHOP,minStage:3},
 {id:'vehicleArmor',price:250,title:'加装车辆防撞杠',detail:'当前驾驶车辆碰撞损伤减少 35%，适合截货、载货和街头驾驶。',area:SHOP,minStage:4},
 {id:'heavyGloves',price:150,title:'重型拆卸手套',detail:'旧宅隔墙一拳拆，家具能震倒近处敌人；加快拆卸，也增强近战。',areas:[SHOP,HOME],minStage:6},
 {id:'hiredHelp',price:220,title:'请阿松、阿福守店',detail:'两人实际参战保护文件；面对格挡手、冲锋手和领队，自己也要出手。',area:SHOP,mission:'c208'},
 {id:'reinforcedShutter',price:120,title:'加固卷帘与柜台',detail:'文件耐久提高，受到的伤害减少。守店敌人仍会全数进攻。',area:SHOP,mission:'c208'}
];
export class ChapterEconomy{
 constructor(rt){this.rt=rt;this.$=rt.$;this.funding=new ChapterFunding(rt);this.wasPaused=false;this.$('#chapter2Plan').onclick=()=>this.open();this.$('#chapter2FreePlan').onclick=()=>this.open();this.$('#chapter2PlanClose').onclick=()=>this.close();this.$('#chapter2PlanActions').addEventListener('click',event=>{const button=event.target.closest('[data-plan]');if(button)this.buy(button.dataset.plan);});this.$('#chapter2PlanPanel').addEventListener('keydown',event=>{if(event.code==='Escape'){event.stopPropagation();this.close();}});}
 get world(){return this.rt.state()?.world;}
 showFreeEntry(show){this.$('#chapter2FreePlan').classList.toggle('hidden',!show);}
 get openNow(){return !this.$('#chapter2PlanPanel').classList.contains('hidden');}
 balance(){return this.rt.api.get().money;}
 income(amount){this.funding.income(amount);}
 pay(amount){if(!Number.isFinite(amount)||amount<0||this.balance()<amount)return false;this.rt.api.cash(-amount);return true;}
 canOrder(){const o=this.rt.manager?.objective;return this.rt.area()===SHOP&&this.world.shopBusiness&&(this.rt.state().chapterComplete||this.rt.state().chapterState.chapter2>=4&&!['topics','defense','fight'].includes(o?.type));}
 credit(id,amount){const w=this.world;w.paidJobs||={};if(w.paidJobs[id])return false;w.paidJobs[id]=amount;this.rt.api.cash(amount);this.rt.api.toast('结账 +¥'+amount);this.rt.parent.save();return true;}
 available(){const id=this.rt.manager?.mission?.id,stage=this.rt.state()?.chapterState.chapter2;return offers.filter(o=>!this.world[o.id]&&(!o.mission||o.mission===id)&&(!o.minStage||stage>=o.minStage)&&(!o.area||o.area===this.rt.area())&&(!o.areas||o.areas.includes(this.rt.area())));}
 open(){if(!this.rt.active||this.rt.api.get().dead||!this.rt.api.get().started)return;this.wasPaused=this.rt.api.get().paused;this.rt.api.menuPause(true);if(!this.rt.api.get().paused)return;this.$('#chapter2PlanPanel').classList.remove('hidden');this.render();this.$('#chapter2PlanClose').focus?.();}
 close(){if(!this.openNow)return;this.$('#chapter2PlanPanel').classList.add('hidden');this.rt.api.menuPause(this.wasPaused);}
 render(){const w=this.world;if(!w)return;const game=this.rt.api.get();this.$('#chapter2PlanBalance').textContent='口袋余额 ¥'+game.money.toFixed(2);
  const entries=this.available().map(o=>({...o,title:o.title+' · ¥'+o.price}));
  if(this.rt.area()===SHOP&&w.shopBusiness){entries.push({id:'collect',title:'收营业款 · ¥'+Math.floor(w.businessCash||0),detail:'接单和营业都有收入，店面撞坏会降低结余。'});if(this.canOrder())entries.push({id:'order',title:this.rt.workshop.freeProgress?'继续已接订单':'接一笔加急订单',detail:'到维修台操作，按完成质量结算。主线期间也可以回来接单。'});}
  if(this.rt.area()===SHOP&&w.shopBreach&&!this.rt.manager?.mission)entries.push({id:'repairShop',title:'修复店面 · ¥80',detail:'恢复正常营业，修补撞坏的门面。旧宅的拆毁痕迹保留。'});
  if(game.health<100)entries.push({id:'meds',title:'补给 · ¥40',detail:'恢复 45 点生命，街头便利店和餐馆也能补给。'});
  this.$('#chapter2PlanActions').innerHTML=entries.map(o=>'<button data-plan="'+o.id+'"><strong>'+o.title+'</strong><small>'+o.detail+'</small></button>').join('');this.$('#chapter2PlanNote').textContent='装备、采购、补给和维修使用口袋余额。升级增强你处理任务的能力，不代替现场操作。';
 }
 buy(id){const w=this.world;if(!w)return false;
  if(id==='order'){if(!this.canOrder())return false;this.close();this.rt.workshop.freeOrder();return true;}
  if(id==='collect'){if(this.rt.area()!==SHOP||!w.shopBusiness)return false;const n=Math.floor(w.businessCash||0);if(n<=0)return false;w.businessCash=0;this.rt.api.cash(n);this.rt.parent.save();this.render();return true;}
  const offer=this.available().find(o=>o.id===id),price=offer?.price??(id==='meds'?40:id==='repairShop'?80:Infinity);if(!offer&&!['meds','repairShop'].includes(id))return false;
  if(id==='meds'&&this.rt.api.get().health>=100||id==='repairShop'&&(this.rt.area()!==SHOP||!w.shopBreach||this.rt.manager?.mission))return false;
  if(!this.pay(price)){this.$('#chapter2PlanNote').textContent='口袋余额不足。可以接维修单，或领取柜台营业款。';return false;}
  if(id==='meds')this.rt.api.heal(45);else if(id==='repairShop')w.shopBreach=false;else{w[id]=true;if(id==='heavyGloves')this.rt.api.equipGloves();}
  this.rt.world.apply(this.rt.state());this.rt.actions.applyPurchase?.(id);this.rt.parent.save();this.close();if(D.purchases[id])this.rt.say('purchase:'+id,D.purchases[id],'电话');else this.rt.api.toast('已支付 ¥'+price);return true;
 }
 tick(dt){const w=this.world;if(!w?.shopBusiness||this.rt.api.get().paused||this.rt.api.get().dead)return;w.businessClock=(w.businessClock||0)+dt;if(w.businessClock>=60){const n=Math.floor(w.businessClock/60);w.businessClock%=60;w.businessCash=Math.min(w.shopStock?600:200,(w.businessCash||0)+n*(w.shopBreach?5:w.shopStock?40:20));}}
}
