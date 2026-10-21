import {SHOP} from './missions.js';
import {conversations as D} from './dialogues.js';

// One persistent budget in the chapter's existing world state. Income is recorded
// by the common cash callback, so jobs, business takings and street loot all count.
export class ChapterFunding {
 constructor(rt){this.rt=rt;}
 get budget(){return this.rt.state()?.world.budget;}
 get pending(){return !!this.budget&&!this.budget.paid;}
 initialize(){
  const s=this.rt.state();if(!s||s.world.budget||s.chapterState.chapter2<4)return;
  const grandfather=s.chapterComplete||s.chapterState.chapter2>8||this.rt.manager.objective?.id==='c208-defend';
  const contribution=grandfather?10002:Math.min(10002,Math.max(0,this.rt.parent.state().gangMoney-10000));
  s.world.budget={total:10300,gangContribution:contribution,personalRequired:10300-contribution,earned:0,paid:!!grandfather,legacy:!!grandfather};
 }
 income(amount){const b=this.budget;if(this.pending&&Number.isFinite(amount)&&amount>0)b.earned=Math.round((b.earned+amount)*100)/100;}
 spendableGang(){const balance=this.rt.parent.state().gangMoney,b=this.budget;return b&&!b.legacy?Math.max(0,balance-10000-(this.pending?b.gangContribution:0)):balance;}
 get canSettle(){const b=this.budget;return this.pending&&b.earned>=b.personalRequired&&this.rt.api.get().money>=b.personalRequired&&this.rt.parent.state().gangMoney>=b.gangContribution;}
 get shortfall(){const b=this.budget;return this.pending?Math.max(0,b.personalRequired-b.earned,b.personalRequired-this.rt.api.get().money):0;}
 settle(){
  if(!this.pending)return false;
  if(this.rt.area()!==SHOP||this.rt.manager.objective?.id!=='c208-ready')return false;
  if(!this.canSettle){this.rt.api.toast('预算还差 ¥'+Math.ceil(this.shortfall)+' · K 接维修单 / 收营业款，街头掉钱也计入');return false;}
  const b=this.budget;
  this.rt.parent.state().gangMoney-=b.gangContribution;
  this.rt.api.cash(-b.personalRequired);b.paid=true;
  this.rt.parent.save();this.rt.say('c208:budget-paid',D.events.budgetPaid,'面对面');return true;
 }
 hint(){const b=this.budget;if(!this.pending)return'';return '预算 ¥10,300 · 帮费 ¥'+b.gangContribution.toLocaleString('en-US')+' · 已赚 ¥'+Math.floor(b.earned)+'/'+b.personalRequired+(this.canSettle?' · 找 Dina 结账':' · 还差 ¥'+Math.ceil(this.shortfall));}
}
