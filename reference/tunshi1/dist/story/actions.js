import * as THREE from '../vendor/three.module.js';
import {rayHit} from '../physics.js';
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const position=e=>[e.g.position.x,e.g.position.z];
// Objective mechanics share the real scene, collisions and combat. Progress is saved by MissionManager.
export class ActionDirector{
 constructor(rt){this.rt=rt;this.api=rt.api;this.root=new THREE.Group();this.api.scene.add(this.root);this.props=[];this.using=null;this.escort=null;this.pursuer=this.api.makeCar('RY 追货车',[92,-162],'#6c526c');this.pursuer.scripted=true;this.pursuer.enabled=false;}
 clear(){this.pursuer.enabled=false;this.pursuer.g.visible=false;this.pursuitPath=null;this.pursuitClock=0;this.using=null;this.escort=null;this.escortPath=null;this.escortGoal=null;for(let x of this.props){x.g.traverse(n=>n.geometry?.dispose());this.root.remove(x.g);}this.props=[];}
 begin(o,p){this.clear();const defs=o.actions||(o.type==='defend'?o.sites.map(s=>({id:s.id,at:[s.at[0]+5,s.at[1]],name:s.name+' · 调度继电器',seconds:4,hits:3})):[]);
 for(let a of defs){const at=this.api.safeIn(o.area||'outside',...a.at,.8),g=new THREE.Group();g.position.set(at[0],0,at[1]);this.root.add(g);const body=this.api.box(1.2,1.5,.9,'#526d77',g,0,.75,0);this.api.box(.8,.12,.95,'#e6b653',g,0,1.05,0);this.api.label(a.name,4,.6,'#213a46','#e7f2ce',g,0,2.6,0);this.props.push({...a,at,g,body});}
 if(o.type==='escort'){this.escort=this.rt.world.contact(o.speaker,p.escortAt||o.at,o.area||'outside');p.escortHealth??=100;this.escort.hp=100;}
 if(o.type==='cargo'){p.integrity??=100;p.lastCarHP=this.api.get().carHealth;this.rt.world.crate.visible=true;if(p.pursuer&&!p.pursuitEscaped){this.pursuer.enabled=true;this.pursuer.hp=p.pursuer.hp;this.pursuer.g.position.set(p.pursuer.at[0],.5,p.pursuer.at[1]);}}
 }
 nearest(){if(!this.rt.manager?.record)return null;return this.props.find(a=>!(this.rt.manager.record.progress.doneActions?.includes(a.id)||this.rt.manager.record.progress.done?.includes(a.id))&&distance(a.at,this.rt.position())<3);}
 interact(o,p){if(!['operation','defend'].includes(o.type))return false;const a=this.nearest();if(!a)return false;if(o.type==='defend'&&this.rt.activeSite?.id!==a.id)return false;this.using=this.using===a.id?null:a.id;this.useStart=[...this.rt.position()];p.useTime=0;this.api.toast(this.using?'正在操作 · 走开、挥拳或受击会打断':'已停止操作');return true;}
 traceStrike(heading=this.api.get().heading){const o=this.rt.manager?.objective,p=this.rt.manager?.record?.progress;if(!o||this.rt.manager.record.status!=='active'||this.rt.dialogue.busy||this.rt.area()!==(o.area||'outside')||this.api.get().position[1]+1.6-.35>1.5)return null;const [x,z]=this.rt.position(),dir={x:Math.sin(heading),z:Math.cos(heading)};let best=null;
  for(const a of this.props){if(p.doneActions?.includes(a.id)||p.done?.includes(a.id))continue;const d=rayHit({x,z},dir,{x:a.at[0],z:a.at[1],hx:.6,hz:.45,angle:0},2.3);if(d!==null&&(!best||d<best.d))best={a,d};}return best;
 }
 strike(hit=this.traceStrike()){if(!hit)return false;const {a}=hit,o=this.rt.manager.objective,p=this.rt.manager.record.progress;
 this.using=null;p.hits||={};p.hits[a.id]=(p.hits[a.id]||0)+1;a.g.rotation.z=(p.hits[a.id]%2?.1:-.1);this.api.toast(a.name+' · '+p.hits[a.id]+'/'+(a.hits||3));
 if(o.type==='operation'&&!p.spawned){this.rt.world.spawnEnemies(o.at,o.count||3,p,false,o.area||'outside');p.noisy=true;this.rt.dialogue.play(o.id+':alarm',[['听歌','柜子报警了！东西在里面，你拿了就走，不一定要把人全打倒。']]);}
 if(p.hits[a.id]>=(a.hits||3))this.finishAction(a,p);return true;
 }
 finishAction(a,p){p.doneActions||=[];if(!p.doneActions.includes(a.id))p.doneActions.push(a.id);this.using=null;a.g.rotation.z=.8;a.body.material=this.api.mat('#3c4247');this.api.toast(a.name+' · 已处理');this.rt.save();}
 event(type,data,o,p){if(type==='hurt'||type==='attack'){this.using=null;if(p.useTime)p.useTime=0;}if(type==='damage'&&o.type==='intercept'&&data.entity===this.rt.world.car){p.targetHP=data.entity.hp;}}
 tick(o,p,dt){const rt=this.rt,game=this.api.get(),pos=rt.position();this.root.visible=rt.area()===(o.area||'outside');this.pursuer.g.visible=this.pursuer.enabled&&rt.area()==='outside';for(let a of this.props){a.g.visible=!p.doneActions?.includes(a.id)&&!p.done?.includes(a.id);}
 if(this.using){let a=this.props.find(a=>a.id===this.using);if(!a||distance(a.at,pos)>3||distance(this.useStart||pos,pos)>.5||game.driving){this.using=null;p.useTime=0;}else{p.useTime=(p.useTime||0)+dt;if(p.useTime>=(a.seconds||4)){this.finishAction(a,p);p.useTime=0;}}}
 if(o.type==='operation'){if(rt.area()!==(o.area||'outside'))return false;rt.world.preserveEnemies(p);return this.props.every(a=>p.doneActions?.includes(a.id));}
 if(o.type==='intercept'){let car=rt.world.car,d=distance(pos,position(car));if(!p.engaged)return false;if(!rt.route.length)return{fail:'路线建立失败 · T 重试'};if(game.driving&&game.carHealth<=0)return{fail:'黄车损坏 · T 重试或下车 Y 救援'};p.targetHP=car.hp;let forward=[Math.sin(car.g.rotation.y),Math.cos(car.g.rotation.y)],relative=[pos[0]-car.g.position.x,pos[1]-car.g.position.z];let inFront=relative[0]*forward[0]+relative[1]*forward[1]>0;let stopped=game.driving&&game.carSpeed<2&&d<9&&inFront;
 p.block=stopped?(p.block||0)+dt:Math.max(0,(p.block||0)-dt*.5);if(stopped){car.intentX=car.intentZ=0;}
 p.lost=d>125?(p.lost||0)+dt:0;if(p.lost>12)return{fail:'收款车甩开了你 · T 重试这次拦截'};
 if(car.hp<=35||p.block>=3){p.intercepted=true;car.intentX=car.intentZ=0;return true;}
 // No mandatory tour: intercepted anywhere; an endpoint is a final blockade opportunity.
 if(p.routeIndex>=rt.route.length){p.escapeTime=(p.escapeTime||0)+dt;if(p.escapeTime>25)return{fail:'收款车等到了接应 · T 重试，可撞击或超车堵停'};}return false;
 }
 if(o.type==='escort'){if(rt.area()!==(o.area||'outside'))return false;const e=this.escort;if(!p.spawned&&distance(pos,o.at)<22)rt.world.spawnEnemies(o.at,o.count||3,p,false,o.area||'outside');rt.world.preserveEnemies(p);
 const ep=position(e),gap=distance(pos,ep);e.intentX=e.intentZ=0;if(gap>3&&gap<35&&!game.driving){let target=pos;try{if(!this.escortPath||distance(this.escortGoal||pos,pos)>4){this.escortPath=rt.routeFor([ep,pos],o.area||'outside');this.escortGoal=[...pos];this.escortIndex=1;}while(this.escortIndex<this.escortPath.length&&distance(this.escortPath[this.escortIndex],ep)<2)this.escortIndex++;target=this.escortPath[this.escortIndex]||pos;}catch{}const d=distance(ep,target);e.intentX=(target[0]-ep[0])/Math.max(.1,d)*4.8;e.intentZ=(target[1]-ep[1])/Math.max(.1,d)*4.8;e.g.rotation.y=Math.atan2(e.intentX,e.intentZ);}
 p.escortAt=ep;if(p.escortHealth<=0)return{fail:o.speaker+'受伤倒下 · T 重试，先吸引追兵再带人撤离'};return distance(ep,o.destination)<9&&distance(pos,o.destination)<12;
 }
 if(o.type==='escape'&&o.area){if(rt.area()==='outside'&&p.entered)return true;if(rt.area()!==o.area)return false;p.entered=true;if(!p.spawned&&!rt.state().world.roadbookQuiet)rt.world.spawnEnemies(o.at,o.count||3,p,false,o.area);rt.world.preserveEnemies(p);return false;}
 if(o.type==='escape'){if(rt.area()!==(o.area||'outside'))return false;if(o.id==='m05-3'&&rt.state().world.roadbookQuiet)return distance(pos,o.at)>15;if(!p.spawned&&distance(pos,o.at)<22)rt.world.spawnEnemies(o.at,o.count||3,p,false,o.area||'outside');rt.world.preserveEnemies(p);if(!p.spawned)return false;const threat=rt.world.enemies.some(e=>e.hp>0&&distance(pos,position(e))<16);p.clearTime=!threat?(p.clearTime||0)+dt:0;return p.clearTime>=5||rt.world.enemies.every(e=>e.hp<=0);}
 if(o.type==='cargo'){if(rt.area()!==(o.area||'outside'))return false;const loss=Math.max(0,(p.lastCarHP??game.carHealth)-game.carHealth);p.integrity=Math.max(0,p.integrity-loss*.65);p.lastCarHP=game.carHealth;
 if(!p.pursuer&&!p.pursuitEscaped&&distance(pos,o.at)>18){const at=this.api.safePoint(...o.at,2.6);this.pursuer.hp=100;this.pursuer.enabled=true;this.pursuer.g.position.set(at[0],.5,at[1]);p.pursuer={hp:100,at};rt.dialogue.play(o.id+':pursuit',[['听歌','后面有辆追货车，正朝你过来。可以加速甩掉，也可以回头撞停它；箱子还在车里，别硬换血。']]);}
 if(this.pursuer.enabled){const e=this.pursuer,ep=position(e),gap=distance(pos,ep);e.intentX=e.intentZ=0;this.pursuitClock-=dt;if(this.pursuitClock<=0){this.pursuitClock=2;try{this.pursuitPath=rt.nav.route([ep,pos]);this.pursuitIndex=1;}catch{this.pursuitPath=[];}}
 while(this.pursuitIndex<this.pursuitPath?.length&&distance(ep,this.pursuitPath[this.pursuitIndex])<2)this.pursuitIndex++;
 const target=this.pursuitPath?.[this.pursuitIndex];if(target&&e.hp>0){const d=distance(ep,target);e.intentX=(target[0]-ep[0])/Math.max(.1,d)*10;e.intentZ=(target[1]-ep[1])/Math.max(.1,d)*10;e.g.rotation.y=Math.atan2(e.intentX,e.intentZ);}p.pursuer={hp:e.hp,at:ep};p.pursuitLost=gap>65?(p.pursuitLost||0)+dt:0;if(p.pursuitLost>6||e.hp<=0){p.pursuitEscaped=true;e.enabled=false;this.api.toast('追货车已甩开 · 把旧物安全送回家');}}
 const crate=rt.world.crate;rt.world.crateWanted=true;rt.world.crateArea='outside';crate.visible=true;crate.position.set(pos[0],game.driving?1.7:1,pos[1]);if(!p.spawned&&distance(pos,o.at)>12){const at=this.api.safePoint(pos[0]+8,pos[1]+8);rt.world.spawnEnemies(at,3,p);}rt.world.preserveEnemies(p);if(p.integrity<=0)return{fail:'货箱被撞散了 · T 从装车点重试'};
 return game.driving&&distance(pos,o.destination)<18;
 }
 return undefined;
 }
 hurtEscort(amount){const p=this.rt.manager.record.progress;p.escortHealth=Math.max(0,p.escortHealth-amount);this.api.toast(this.rt.manager.objective.speaker+'遭到攻击 · 保护 '+Math.ceil(p.escortHealth)+'%');}
 points(o,p){if(o.type==='escape'&&o.area)return[o.destination];if(o.type==='operation')return this.props.filter(a=>!p.doneActions?.includes(a.id)).map(a=>a.at);if(o.type==='escort'||o.type==='cargo')return[o.destination];return null;}
 hint(o,p){if(this.using)return'操作中 '+Math.floor((p.useTime||0)/(this.props.find(a=>a.id===this.using)?.seconds||4)*100)+'% · 移动/受击中断';if(o.type==='intercept')return'目标耐久 '+Math.ceil(this.rt.world.car.hp)+' · 堵停 '+Math.min(3,p.block||0).toFixed(1)+'/3 秒';if(o.type==='escort')return o.speaker+'状态 '+Math.ceil(p.escortHealth??100)+'% · 靠近带路，超过 35m 会等你';if(o.type==='cargo')return'旧物完整度 '+Math.ceil(p.integrity??100)+'% · 避免碰撞';if(o.type==='escape'&&o.area)return'沿展厅通道到员工侧门，E 出门';if(o.type==='escape')return'脱离追兵 '+Math.min(5,p.clearTime||0).toFixed(1)+'/5 秒 · 也可击退全部';if(o.type==='operation')return'已处理 '+(p.doneActions?.length||0)+'/'+this.props.length+' · E 操作 / F 砸开';return'';}
}
