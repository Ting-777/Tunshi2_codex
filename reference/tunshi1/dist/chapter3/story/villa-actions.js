import {ENCOUNTERS,distance,position} from './world.js';
import {GARAGE,GROUND,UPPER,STUDY} from './missions.js';
export class VillaActions{
 constructor(rt){this.rt=rt;this.api=rt.api;}
 begin(o,p){
  const rt=this.rt,w=rt.world,state=rt.state().world;
  if(o.type==='battle'&&p.spawned)w.spawn(ENCOUNTERS[o.encounter].actors,p,o.area);
  if(o.type==='tea'){w.contact('仙人',[4600,-8],STUDY);this.api.carry(null);}
  if(o.introLines&&!p.intro){p.intro=true;rt.say(o.id+':intro',o.introLines);}
  if(o.id==='c304-garage')state.opened.garage=true;
  if(o.type==='ram'&&!state.opened.winter&&w.luxury.hp<=0){w.luxury.hp=140;w.luxury.g.position.set(4000,.5,27);w.luxury.g.rotation.y=Math.PI;w.persistCar();}
  w.apply(rt.state());
 }
 near(o,range=3.5){return this.rt.area()===(o.area||'outside')&&distance(this.rt.position(),o.at)<range&&(!o.minHeight||this.api.get().position[1]-.2>=o.minHeight);}
 interact(o,p){
  const rt=this.rt,w=rt.world,state=rt.state().world,g=this.api.get();if(g.driving)return false;
  const med=w.nearest([...w.props.values()].filter(q=>q.kind==='medicine'&&!state.usedMedicine.includes(q.id)).map(q=>q.id));
  if(med){if(g.health>=100){this.api.toast('生命已满，药留到需要时再取');return true;}state.usedMedicine.push(med.id);this.api.heal(55);this.api.toast('医药柜 · 恢复 55 生命');rt.parent.save();return true;}
  if(w.nearest(['villa-supplies'])){if(g.health>=100){this.api.toast('生命已满');return true;}if(g.money<35){this.api.toast('口袋余额不足 ¥35');return true;}this.api.cash(-35);this.api.heal(65);rt.parent.save();return true;}
  if(o?.id==='c304-hall'&&w.nearest(['chandelier-release'])&&!state.opened.chandelier){
   state.opened.chandelier=true;w.chandelierFall=0;w.chandelierLastT=null;
   for(const e of w.enemies)if(e.hp>0&&distance(position(e),[4181,18])<7&&w.lineClear([4181,18],position(e))){this.api.damage(e,125,0,0,'environment');e.stun=2;e.guardOpen=3;e.phase='recover';e.phaseTime=2;}
   w.effects.impact('furniture',[4181,3,18]);this.api.impactSound('furniture');this.api.toast('吊灯砸下来了 · 把守卫引到中央效果更好');w.preserve(p);rt.parent.save();return true;
  }
  if(o?.id==='c304-kitchen'&&w.nearest(['wash-valve'])&&!state.opened.wash){state.opened.wash=true;const valve=w.props.get('wash-valve');valve.wheel.rotation.x=1.5;for(const e of w.enemies){if(distance(position(e),[4222,-18])<22){this.api.damage(e,60,0,0,'environment');e.stun=3;e.phase='recover';e.phaseTime=3;}}w.effects.impact('water',[4222,1.8,-18]);this.api.impactSound('furniture');this.api.toast('冲洗阀开启 · 敌人被水冲散');w.preserve(p);rt.parent.save();return true;}
  if(o?.type==='commit'&&this.near(o)){p.interacted=true;state.villaCommitted=true;w.apply(rt.state());return true;}
  if(o?.type==='tea'&&this.near(o,4)){p.interacted=true;state.opened.study=true;return true;}
  return false;
 }
 tick(o,p){
  const rt=this.rt,w=rt.world,g=this.api.get(),state=rt.state().world;
  switch(o.type){
   case 'commit':case 'tea':return !!p.interacted;
   case 'battle':{
    const set=ENCOUNTERS[o.encounter];if(rt.area()!==set.area)return false;
    if(!p.spawned&&distance(rt.position(),set.at)<22)w.spawn(set.actors,p,set.area);
    if(o.encounter==='court'&&p.spawned&&!p.flankWave&&w.enemies.filter(e=>e.hp>0).length<=1){p.flankWave=true;w.reinforce([[4198,-30,'guard'],[4176,-32,'brawler']],p,GROUND);this.api.toast('廊门里又来两人 · 内院两侧都有花盆');}
    if(o.encounter==='keeper'&&p.spawned&&!p.keeperRage){const boss=w.enemies.find(e=>e.role==='foreman');if(boss?.hp>0&&boss.hp<boss.maxHp*.5){p.keeperRage=true;boss.guardOpen=3;boss.phase='recover';boss.phaseTime=1.4;w.reinforce([[4391,-29,'charger']],p,UPPER);this.api.toast('领队破绽露出来了 · Q 家具破防，小心走廊冲锋');}}
    w.preserve(p);return !!p.spawned&&w.enemies.length>0&&w.enemies.every(e=>e.hp<=0);
   }
   case 'ram':return !!state.opened.winter;
   case 'stairs':return this.near(o,8)&&!g.driving;
   case 'leave':return rt.area()==='outside'&&this.near(o,10);
  }return false;
 }
 finish(o){const s=this.rt.state().world;if(o.encounter)s.opened[o.encounter]=true;if(o.type==='commit')s.villaCommitted=true;this.rt.world.clearEnemies();this.rt.world.apply(this.rt.state());}
 canEnter(id,door){
  const s=this.rt.state()?.world;if(!s)return false;if(this.rt.state().chapterComplete)return true;
  const o=this.rt.manager?.objective;
  if(id===GARAGE)return !!s.opened.garage;
  if(id===GROUND)return !!s.opened.winter;
  if(id===UPPER)return !!s.opened.court;
  if(id===STUDY)return !!s.opened.keeper;
  if(door?.to===GROUND)return !!s.opened.winter;return !o;
 }
 hint(o,p){if(o.type==='battle')return p.spawned?'剩 '+this.rt.world.enemies.filter(e=>e.hp>0).length+' 人 · Q 拿家具 / 再 Q 砸人'+(o.encounter==='hall'?' · E 拉吊灯卸扣':o.encounter==='kitchen'?' · E 开冲洗阀':''):'';if(o.type==='ram')return '豪车向北加速 · 撞击需有车速';if(o.type==='commit')return '右侧桌边可补给 · ¥35';return'';}
 prompt(o){
  const w=this.rt.world,s=this.rt.state().world;if(w.nearest(['villa-supplies']))return '¥35 补给 · 个人余额';
  if(w.nearest([...w.props.values()].filter(p=>p.kind==='medicine'&&!s.usedMedicine.includes(p.id)).map(p=>p.id)))return'取医药柜（一次）';
  if(o?.id==='c304-hall'&&w.nearest(['chandelier-release'])&&!s.opened.chandelier)return'拉吊灯卸扣 · 中央砸落';
  if(o?.id==='c304-kitchen'&&w.nearest(['wash-valve'])&&!s.opened.wash)return'打开红色冲洗阀';
  if(o?.type==='commit'&&this.near(o))return'进入仙人府 · 分段重试';if(o?.type==='tea'&&this.near(o,4))return'与仙人谈旧账';return'';
 }
}
