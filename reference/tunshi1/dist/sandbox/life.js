import {dressService,dressCourt} from '../visuals/street-detail.js';
import * as THREE from '../vendor/three.module.js';
import {CHAZI,compactPoint} from '../regions/data.js';
import {YUELU} from '../chapter3/layout.js';
export const items={water:{name:'瓶装水',price:2,heal:12},bread:{name:'面包',price:5,heal:30},kit:{name:'急救包',price:15,heal:65}};
export const services=[
 {id:'frxs',name:'芙蓉兴盛 · 便利店',at:[-700,-98],color:'#408765',type:'store'},
 {id:'noodles',name:'巷口粉馆 · 肉丝粉',at:[-530,-97],color:'#b46342',type:'meal'},
 {id:'snacks',name:'江边夜宵 · 臭豆腐',at:[675,-88],color:'#6b608a',type:'snack'},
 {id:'repair',name:'老街汽修',at:[-720,205],color:'#507c95',type:'repair'},
 {id:'recycle',name:'八方废品回收',at:[-850,135],color:'#707d53',type:'recycle'},
 {id:'basket',name:'八方球场 · 投篮赢零钱',at:[-895,160],color:'#c18a46',type:'basket'},
 {id:'parking',name:'滨江泊车挑战',at:[660,40],color:'#4b8394',type:'parking'},
 {id:'tools',name:'桥下旧货摊 · 加固拳套',at:[250,-20],color:'#765f77',type:'tools'}
].map(s=>({...s,at:compactPoint(s.at)}));
const cans=[[-874,107],[-853,178],[-806,98],[-610,-160],[-599,-290],[-697,-215],[749,44],[764,102],[743,-184],[640,100],[559,-145],[174,207]].map(compactPoint);
const parkingSpots=[[660,18],[665,60],[660,95]].map(compactPoint);
const fresh=()=>({clock:0,inventory:{water:0,bread:0,kit:0},scrap:0,gloves:false,milkIcePurchased:false,cooldowns:{},collected:{},round:0,wardrobe:{owned:[],equipped:null}});
export const newStreetLifeState=fresh;
export class StreetLife{
 constructor(api){this.api=api;this.data=fresh();this.panel=false;this.selected=null;this.activity=null;this.pickups=[];this.$=s=>document.querySelector(s);this.build();
  this.$('#lifeClose').onclick=()=>this.close();this.$('#bagToggle').onclick=()=>this.openBag();
  this.$('#lifeActions').addEventListener('click',e=>{const action=e.target.closest?.('[data-life]')?.dataset.life;if(action)this.action(action);});
 }
 build(){const {root,box,label,solids}=this.api;for(const s of services){const [x,z]=s.at;
  if(s.type==='basket')continue;
  box(8,3.8,4,s.color,root,x,1.9,z-5);box(8.8,.2,5,'#e3cf9d',root,x,3.9,z-4.5);box(6.5,1.4,.2,'#293e48',root,x,2,z-2.9);label(s.name,9,1,s.color,'#fff4ca',root,x,3.2,z-2.8);solids.push({x,z:z-5,w:8,d:4});
  for(let i=0;i<6;i++)box(.35,.6,.3,['#e6b46b','#8aa786','#c68662'][i%3],root,x-2+i*.75,1.4,z-2.65);
  box(6,.8,.65,'#b5a184',root,x,.4,z-2.5);dressService(s,{root,box,label});
 }
 const h=services.find(s=>s.type==='basket').at;this.hoop=h;dressCourt(root,h);
 box(14,.08,20,'#758e83',root,h[0],.23,h[1]-2);box(.25,4,.25,'#3c515a',root,h[0],2,h[1]-7);box(3,1.5,.2,'#e3e7d5',root,h[0],3.5,h[1]-6.7);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.06,6,20),new THREE.MeshStandardMaterial({color:'#c77743'}));ring.rotation.x=Math.PI/2;ring.position.set(h[0],3,h[1]-6);root.add(ring);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;box(.03,.6,.03,'#e3ddba',root,h[0]+Math.cos(a)*.45,2.7,h[1]-6+Math.sin(a)*.45);}
 label('E 投篮 · 五球计分',10,1,'#596f63','#fff3cc',root,h[0],4.8,h[1]-7);
 this.ball=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),new THREE.MeshStandardMaterial({color:'#da8a43'}));root.add(this.ball);this.ball.visible=false;
 this.bay=new THREE.Group();root.add(this.bay);this.bay.visible=false;
 for(const [x,z,w,d]of [[-1.6,0,.13,6],[1.6,0,.13,6],[0,-3,3.3,.13],[0,3,3.3,.13]])box(w,.1,d,'#65e4d0',this.bay,x,.26,z);
 label('停稳 3 秒 · 车头朝北',10,1,'#27685f','#d6ffdf',this.bay,0,3.5,-4);
 for(let i=0;i<cans.length;i++){const [x,z]=cans[i],g=new THREE.Group();g.position.set(x,.2,z);root.add(g);box(.38,.6,.38,'#cead5d',g,0,.3,0);box(.3,.04,.3,'#e3e0c9',g,0,.63,0);this.pickups.push(g);}
 }
 get enabled(){const s=this.api.get();return s.started&&!s.dead&&!s.interior&&s.region===CHAZI;}
 distance(p){const s=this.api.get().position;return Math.hypot(s[0]-p[0],s[2]-p[1]);}
 near(){if(!this.enabled)return null;return services.find(s=>this.distance(s.at)<4.7);}
 nearVending(){const state=this.api.get(),p=state.position;if(!state.started||state.dead||state.interior||state.driving||state.dialogueBusy||state.region!==YUELU)return null;
  return this.api.vendingMachines?.find(v=>this.distance(v.at)<2.8&&Math.abs(p[1]-.2-v.floor)<1.5&&(p[0]-v.position[0])*Math.sin(v.angle)+(p[2]-v.position[1])*Math.cos(v.angle)>.65&&this.api.vendingLine(v.at))||null;
 }
 nearIndoor(){const s=this.api.get();if(!s.started||s.dead||s.driving||s.dialogueBusy||!s.interior)return null;return this.api.indoorServices?.find(p=>p.room===s.interior&&this.distance(p.at)<3&&Math.abs(s.position[1]-.2-p.floor)<1.2)||null;}
 prompt(){const service=this.nearIndoor();if(service)return 'E · '+service.name;const vending=this.nearVending();if(vending)return'E · '+vending.name;if(!this.enabled)return '';if(this.activity)return this.activity.type==='basket'?'E · 出手投篮（绿色区最准）':'把车倒入青色车位，车头朝北并停稳';const s=this.near();if(s)return 'E · '+s.name;const i=cans.findIndex((p,i)=>this.pickups[i].visible&&this.distance(p)<2);return i>=0?'E · 捡起可回收物（回收站换钱）':'';}
 interact(){const service=this.nearIndoor();if(service){this.selected=service;this.show(service.name);return true;}const vending=this.nearVending();if(vending){this.selected=vending;this.show(vending.name);return true;}if(!this.enabled)return false;if(this.activity?.type==='basket'){this.shoot();return true;}const s=this.near();if(s){if(!this.api.get().driving&&['repair','parking'].includes(s.type)&&this.api.nearCar())return false;if(this.api.get().driving&&!['repair','parking'].includes(s.type))return false;this.selected=s;this.show(s.name);return true;}if(!this.api.get().driving){const i=cans.findIndex((p,i)=>this.pickups[i].visible&&this.distance(p)<2);if(i>=0){if(this.data.scrap>=20)this.api.toast('背包可回收物已满，去八方回收站换钱');else{this.data.scrap++;this.data.collected[i]=this.data.clock+240;this.pickups[i].visible=false;this.api.toast('可回收物 +1 · 回收站每件 ¥3');this.save();}return true;}}return false;}
 show(title){if(!this.api.get().started||this.api.get().dead)return;this.notice="";this.panel=true;this.api.modal(true);this.$('#lifePanel').classList.remove('hidden');this.$('#lifeTitle').textContent=title;this.render();}
 close(){if(!this.panel)return;this.panel=false;this.$('#lifePanel').classList.add('hidden');this.api.modal(false);}
 openBag(){if(!this.api.get().started||this.api.get().dead||this.api.get().paused&&!this.panel)return;if(this.panel){this.close();return;}this.selected=null;this.show('随身补给');}
 render(){const s=this.selected,state=this.api.get(),d=this.data,btn=(id,text,disabled=false)=>`<button data-life="${id}" ${disabled?'disabled':''}>${text}</button>`;let html='';
 this.$('#lifeBalance').textContent=`口袋 ¥${state.money.toFixed(2)} · 生命 ${Math.ceil(state.health)}/100 · 回收物 ${d.scrap}/20${d.milkIcePurchased?' · 永久减伤 25%':''}`;
 if(!s||['store','vending'].includes(s.type)){for(const [id,i]of Object.entries(items)){if(s)html+=btn('buy:'+id,`${i.name} ¥${i.price} · 存入背包 / +${i.heal} 生命`);html+=btn('use:'+id,`使用${i.name}（${d.inventory[id]}）`);}}
 if(s?.type==='food')html+=s.permanentDefense?btn('food',d.milkIcePurchased?`${s.mealName} · 已购买 · 永久减伤 25%`:`${s.mealName} ¥${s.price} · 生命 +${s.heal} · 永久减伤 25% · 仅限一次`,d.milkIcePurchased):btn('food',`${s.mealName} ¥${s.price} · 生命 +${s.heal}`);
 if(s?.type==='clothing'){for(const item of s.catalog){const owned=d.wardrobe.owned.includes(item.id),worn=d.wardrobe.equipped===item.id,caption=`${item.name}${worn?' · 已穿着':owned?' · 换上':' ¥'+item.price+' · 购买并换上'}`;html+=item.preview?`<button class="printedOutfit" data-life="${(owned?'equip:':'clothes:')+item.id}"><span class="outfitSwatch"><img src="${item.preview}" alt="" width="48" height="48"></span><span>${caption}</span></button>`:btn((owned?'equip:':'clothes:')+item.id,caption);}html+=btn('outfit-off','穿回原来的样子');}
 if(s?.type==='meal')html+=btn('meal','肉丝粉 ¥8 · 生命 +55');
 if(s?.type==='snack')html+=btn('snack','臭豆腐 + 糖油粑粑 ¥6 · 生命 +35');
 if(s?.type==='repair')html+=btn('repair','修好当前驾驶车辆 ¥12');
 if(s?.type==='recycle')html+=btn('sell',`卖掉 ${d.scrap} 件回收物 · ¥${d.scrap*3}`);
 if(s?.type==='tools')html+=btn('gloves',d.gloves?'加固拳套 · 已装备':'加固拳套 ¥40 · 徒手伤害 +10');
 if(s?.type==='basket')html+=btn('basket','五次投篮 · 命中每球 ¥4 · 不收报名费');
 if(s?.type==='parking')html+=btn('parking','停车挑战 · 停正停稳赚 ¥18 · 不收报名费');
 this.$('#lifeActions').innerHTML=html;
 this.$('#lifeNote').textContent=this.notice||(s?.permanentDefense?(d.milkIcePurchased?'已获得永久防御提升，不可重复购买；刷新、重生和迁移存档后仍然有效。':'每份存档仅限购买一次，购买后永久减少 25% 受到的伤害。'):s?.type==='clothing'?'首次购买从口袋扣款并直接换上；买过的衣服可以免费重穿。':s?.type==='basket'?'E 或触屏「互动」出手。把游标留在绿色区，五球后结算。':s?.type==='parking'?'用自己驾驶的车倒入附近青色车位，车头朝北。90 秒内完成。':s?.type==='recycle'?'公园、社区、江边的金色易拉罐可以捡起来换钱。':'B / 顶部背包按钮打开随身补给。');
 }
 message(t){this.api.toast(t);this.notice=t;if(this.panel)this.render();}
 pay(n){if(this.api.get().money<n){this.message(this.selected?.type==='vending'?'口袋余额不足 ¥'+n:'钱不够，先试试投篮、泊车或捡回收物');return false;}this.api.cash(-n);return true;}
 action(action){if(!this.panel||this.api.get().dead)return;const [op,id]=action.split(':'),s=this.selected,d=this.data,state=this.api.get();
 if(op==='buy'&&['store','vending'].includes(s?.type)&&items[id]){if(d.inventory[id]>=9)return this.message('这一类补给最多带 9 件');if(!this.pay(items[id].price))return;d.inventory[id]++;this.message(items[id].name+'已放入背包');}
 else if(op==='use'&&items[id]){if(state.health>=100)return this.message('生命已满，无需消耗补给');if(!d.inventory[id])return this.message('背包里没有这种补给');d.inventory[id]--;this.api.heal(items[id].heal);this.message('使用'+items[id].name+' · 生命恢复');}
 else if(['meal','snack'].includes(op)&&s?.type===op){if(state.health>=100)return this.message('生命已满，吃不下了');if(!this.pay(op==='meal'?8:6))return;this.api.heal(op==='meal'?55:35);this.api.eat();this.message(op==='meal'?'嗦完一碗粉，舒服了。':'外焦里嫩，再配一口甜的。');}
 else if(op==='food'&&s?.type==='food'){if(s.permanentDefense&&d.milkIcePurchased)return this.message('牛奶绵绵冰已购买 · 永久减伤 25%，不可重复购买。');if(!this.pay(s.price))return;if(s.permanentDefense)d.milkIcePurchased=true;this.api.heal(s.heal);this.api.eat(s.mealName);this.message('吃完'+s.mealName+' · 生命恢复'+(s.permanentDefense?' · 永久防御提升：减伤 25%':''));}
 else if(['clothes','equip'].includes(op)&&s?.type==='clothing'){const item=s.catalog.find(c=>c.id===id);if(!item)return;if(op==='clothes'&&!d.wardrobe.owned.includes(id)){if(!this.pay(item.price))return;d.wardrobe.owned.push(id);}if(!d.wardrobe.owned.includes(id))return;d.wardrobe.equipped=id;this.api.outfit?.(item);this.message('已换上'+item.name);}
 else if(op==='outfit-off'&&s?.type==='clothing'){d.wardrobe.equipped=null;this.api.outfit?.(null);this.message('已穿回原来的样子');}
 else if(op==='repair'&&s?.type==='repair'){if(!state.driving)return this.message('把要修的车开到摊前再按 E');if(state.carHealth>=100)return this.message('车况很好，不用花钱');if(!this.pay(12))return;this.api.repair();this.message('车辆耐久恢复到 100');}
 else if(op==='sell'&&s?.type==='recycle'){if(!d.scrap)return this.message('先在街区捡一些金色易拉罐');this.api.cash(d.scrap*3);this.message(`回收结算 +¥${d.scrap*3}`);d.scrap=0;}
 else if(op==='gloves'&&s?.type==='tools'){if(d.gloves)return this.message('拳套已经装备');if(!this.pay(40))return;d.gloves=true;this.message('装备加固拳套 · 拳击伤害 +10');}
 else if(['basket','parking'].includes(op)&&s?.type===op){if((d.cooldowns[op]||0)>d.clock)return this.message(`休息 ${Math.ceil(d.cooldowns[op]-d.clock)} 秒，再来一轮`);if(op==='basket'&&state.driving)return this.message('先下车再投篮');if(op==='parking'&&!state.driving)return this.message('先开一辆车到这里报名');
  this.close();this.activity={type:op,time:0,shots:0,score:0,phase:0,hold:0,hp:state.health,car:this.api.carId()};if(op==='parking'){this.activity.target=parkingSpots[d.round++%parkingSpots.length];this.bay.position.set(this.activity.target[0],0,this.activity.target[1]);this.bay.visible=true;this.activity.carHp=state.carHealth;this.api.toast('青色车位就在旁边 · 车头朝北，松开油门停稳 3 秒');}this.save();return;
 }else return;
 this.api.refresh();this.save();this.render();if(op==='food')this.close();
 }
 shoot(){const a=this.activity;if(!a||a.type!=='basket'||a.flight)return;const good=Math.abs(a.phase-.5)<.14;a.shots++;if(good)a.score++;a.flight={time:0,good,from:[...this.api.get().position]};this.ball.visible=true;this.api.toast(good?'空心！':'偏了一点，下一球');}
 finish(success=true){const a=this.activity;if(!a)return;const reward=success?(a.type==='basket'?a.score*4:18):0;this.activity=null;this.bay.visible=false;this.ball.visible=false;this.$('#lifeActivity').classList.add('hidden');if(reward)this.api.cash(reward);this.data.cooldowns[a.type]=this.data.clock+(success?60:10);this.message(success?(a.type==='basket'?`五球结束 · 命中 ${a.score}/5 · +¥${reward}`:`停得稳！泊车结算 +¥${reward}`):'挑战中断 · 没有扣钱，可以稍后再来');this.save();}
 tick(dt){const s=this.api.get();if(s.started&&!s.paused&&!s.dead)this.data.clock+=dt;
 for(let i=0;i<this.pickups.length;i++)this.pickups[i].visible=(this.data.collected[i]||0)<=this.data.clock;
 this.$('#bagToggle').classList.toggle('hidden',!s.started);if(this.api.glove)this.api.glove.visible=this.data.gloves;
 const a=this.activity;if(!a)return;if(!this.enabled||s.dead){this.finish(false);return;}if(s.paused)return;
 a.time+=dt;if(s.health<a.hp-.5){this.finish(false);return;}
 if(a.type==='basket'){
  if(this.distance(this.hoop)>7||s.driving){this.finish(false);return;}a.phase=(Math.sin(a.time*3.8)+1)/2;
  if(a.flight){a.flight.time+=dt;const f=a.flight,u=Math.min(1,f.time/.85),to=[this.hoop[0]+(f.good?0:1.7),3,this.hoop[1]-6];this.ball.position.set(f.from[0]+(to[0]-f.from[0])*u,1.6+(to[1]-1.6)*u+Math.sin(u*Math.PI)*2.8,f.from[2]+(to[2]-f.from[2])*u);if(u===1){a.flight=null;this.ball.visible=false;if(a.shots>=5){this.finish(true);return;}}}
  if(a.time>45){this.finish(true);return;}
  this.$('#lifeActivityText').textContent=`投篮 ${a.shots}/5 · 命中 ${a.score} · E 出手`;
  this.$('#shotMeter').classList.remove('hidden');this.$('#shotCursor').style.left=(a.phase*100)+'%';
 }else{
  if(a.time>90||this.api.carId()!==a.car||!s.driving||s.carHealth<a.carHp-1){this.finish(false);return;}
  const angle=Math.abs(Math.atan2(Math.sin(s.heading-Math.PI),Math.cos(s.heading-Math.PI)));
  const parked=Math.abs(s.position[0]-a.target[0])<.65&&Math.abs(s.position[2]-a.target[1])<1&&angle<.18&&Math.abs(s.speed)<.4;
  a.hold=parked?a.hold+dt:0;if(a.hold>=3){this.finish(true);return;}
  this.$('#shotMeter').classList.add('hidden');this.$('#lifeActivityText').textContent=`泊车 · ${Math.ceil(90-a.time)}秒 · ${Math.ceil(this.distance(a.target))}m · 停稳 ${a.hold.toFixed(1)}/3秒`;
 }
 this.$('#lifeActivity').classList.remove('hidden');
 }
 save(){this.api.save();}
 serialize(){return JSON.parse(JSON.stringify(this.data));}
 restore(s){this.close();this.activity=null;this.ball.visible=false;this.bay.visible=false;this.$('#lifeActivity').classList.add('hidden');this.data={...fresh(),...s,inventory:{...fresh().inventory,...s?.inventory},wardrobe:{...fresh().wardrobe,...s?.wardrobe}};const catalog=this.api.indoorServices?.find(p=>p.type==='clothing')?.catalog;this.api.outfit?.(catalog?.find(c=>c.id===this.data.wardrobe.equipped)||null);}
}
