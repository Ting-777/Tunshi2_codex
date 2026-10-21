import * as THREE from '../vendor/three.module.js';
import {NODES} from './chapter1.js';
export class StoryWorld{
 constructor(api){this.api=api;this.root=new THREE.Group();api.scene.add(this.root);this.phase=-1;this.contacts=new Map();this.enemies=[];this.nodes=[];this.targetMeshes=[];this.props=new THREE.Group();this.root.add(this.props);this.damageRoot=new THREE.Group();this.root.add(this.damageRoot);this.stains={};this.flags=[];this.extraCars=[];this.blockers=[];this.barricades=new THREE.Group();this.root.add(this.barricades);for(let x of [3,12]){api.box(7,1.2,1.2,'#c9b66d',this.barricades,x,.6,-143);api.box(7,.18,1.23,'#524848',this.barricades,x,1,-143);this.blockers.push({x,z:-143,w:7,d:1.2,disabled:true});}this.barricades.visible=false;
 for(let n of NODES){if(n.id==='unknown')continue;const g=new THREE.Group();g.position.set(n.at[0],0,n.at[1]);this.root.add(g);api.box(.15,4,.15,'#587175',g,0,2,0);let flag=api.box(3,1.4,.12,'#b7595a',g,1.5,3.1,0);api.label(n.name,5,.6,'#25434d','#e6f1df',g,0,4.3,0);this.nodes.push({n,g,flag});}
 for(let i=0;i<4;i++){const g=new THREE.Group();api.scene.add(g);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.8,.09,6,32),new THREE.MeshBasicMaterial({color:i?'#8cbfe9':'#68cfff'}));ring.rotation.x=Math.PI/2;g.add(ring);let cone=new THREE.Mesh(new THREE.ConeGeometry(.5,.8,5),ring.material);cone.position.y=4;cone.rotation.z=Math.PI;g.add(cone);this.targetMeshes.push(g);g.visible=false;}
 this.car=api.makeCar('引导车',[0,65],'#577888');this.car.enabled=false;this.car.scripted=true;
 this.follow=api.makePerson('调度员',[5,-128],{color:'#6e617c',hp:60});this.follow.enabled=false;
 this.targetLabel=api.label('任务目标',5,.65,'#283f4b','#f0ffab',this.props,0,3,0);this.targetLabel.visible=false;
 // Physical props stay separate from the batched city and preserve marks after blackout.
 this.crate=api.box(2,1.6,1.6,'#8f724d',this.props,92,.8,-162);this.crate.visible=false;this.crate.removeFromParent();api.scene.add(this.crate);
 this.cabinet=api.box(1.4,2.2,.8,'#546871',this.props,86,1.1,-185);this.cabinet.visible=false;
 this.contract=api.box(.7,.02,.5,'#e6dfc7',api.interiors.hotel.g,-8,1.12,-6);this.contract.visible=false;
 this.homeFlag=api.label('海豚帮 · 旧旗',5,1.9,'#426c7a','#f1d881',api.interiors.home.g,-10.79,3,-2);this.homeFlag.rotation.y=Math.PI/2;this.homeFlag.visible=false;this.ledger=api.box(.65,.12,.9,'#89784c',api.interiors.home.g,-6,.83,3);this.ledger.visible=false;this.hqSign=api.label('海豚帮 · 北辰 HQ',5.5,.7,'#325560','#f6dc82',api.interiors.home.g,-3,4.2,-9.8);this.hqSign.visible=false;this.patrols=[];for(let p of [[8,58],[101,-162]]){let at=api.safePoint(...p),e=api.makePerson('RY 看场人',at,{color:'#6e5968',hp:60});e.story=false;this.patrols.push(e);}
 this.exit=api.label('前往下一城区 · CHAPTER II',13,1.2,'#263f4c','#eaffb2',this.root,280,4,430);this.exit.visible=false;
 }
 contact(name,at,area='outside'){let e=this.contacts.get(name);if(!e){e=this.api.makePerson(name,at,{color:name==='RY'?'#574e65':name==='小朋友'?'#e2b69b':'#d1b35b',ally:true,area});this.contacts.set(name,e);}e.enabled=true;e.area=area;e.g.position.set(at[0],.2,at[1]);e.intentX=e.intentZ=0;return e;}
 clearEncounter(){for(let e of this.contacts.values())e.intentX=e.intentZ=0;for(let e of this.enemies){e.enabled=false;if(e.hp>0)e.g.visible=false;}this.enemies=[];this.car.enabled=false;this.car.g.visible=false;this.follow.enabled=false;this.follow.g.visible=false;this.crateWanted=false;this.crate.visible=this.cabinet.visible=false;}
 spawnEnemies(at,count,progress,boss=false,area='outside'){this.enemies=[];for(let i=0;i<count;i++){let saved=progress.enemies?.[i];let p=saved?.at||this.api.safeIn(area,at[0]+Math.cos(i/count*Math.PI*2)*4,at[1]+Math.sin(i/count*Math.PI*2)*4);let e=this.api.enemyPool(i,boss?'RY':'RY 手下',p,boss?200:50);e.enabled=true;e.hp=saved?.hp??e.maxHp;e.boss=boss;e.heavy=false;e.windup=0;e.hitCooldown=1+i*.2;e.area=area;this.enemies.push(e);}progress.spawned=true;}
 preserveEnemies(progress){progress.enemies=this.enemies.map(e=>({hp:e.hp,at:[e.g.position.x,e.g.position.z]}));}
 scar(id,at){if(this.stains[id])return;const g=new THREE.Group();this.damageRoot.add(g);g.position.set(at[0],0,at[1]);for(let i=0;i<7;i++){let m=this.api.box(.4+i*.1,.25,.8,'#615b51',g,(i%3-1)*1.5,.16,Math.floor(i/3)-1);m.rotation.y=i*.8;}let sign=this.api.box(3,.8,.12,'#473f38',g,0,.6,0);sign.rotation.z=.32;this.stains[id]=g;}
 apply(state){const w=state.world;for(let {n,g,flag}of this.nodes){g.visible=n.id==='hq'?!!w.hq:!!(w.ryNodes||w.mapUpgraded);flag.material=this.api.mat(w.control===100||n.id==='hq'?'#e6c64f':'#b7595a');}
 for(let [id,at]of [['home',[160,214]],['garage',[2,67]],['business',[92,-160]]])if(w.damage[id])this.scar(id,at);
 for(let [id,g]of Object.entries(this.stains))g.visible=!!w.damage[id];
 const phase=state.chapterState.chapter1;this.barricades.visible=phase===6;for(let b of this.blockers)b.disabled=phase!==6;
 if(phase!==this.phase){this.phase=phase;for(let e of this.contacts.values())e.enabled=false;
 this.contact('小朋友',[997,-3],'home');
 if(w.hq){this.contact('攀哥',[998,3],'home');this.contact('Dina',[1005,3],'home');}
 if(w.hqBusy){this.contact('轩轩',[1000,-5],'home');this.contact('肝脏',[1007,0],'home');this.contact('老鱼',[-113,-151]);}
 if(w.gangVisible){this.contact('炫神',[0,65]);}
 if(w.control===100){this.contact('听歌',[4,-183]);this.contact('轩轩',[92,-162]);}
 }
 if(w.yellowCars&&!this.extraCars.length){for(let p of [[4,72],[166,200]]){let e=this.api.makeCar('海豚帮黄车',p,'#e5be59');e.parked=true;this.extraCars.push(e);}}
 for(let e of this.extraCars)e.enabled=!!w.yellowCars;
 this.exit.visible=state.chapterComplete;this.homeFlag.visible=!!w.memorabilia;this.ledger.visible=!!w.memorabilia;this.hqSign.visible=!!w.hq;for(let e of this.patrols)e.enabled=phase<3;
 this.api.setNight(!!w.night);
 }
 targets(points,area){this.points=points;this.targetArea=area;}
 update(t,area){this.root.visible=area==='outside';this.crate.visible=!!this.crateWanted&&area===(this.crateArea||'outside');for(let e of this.contacts.values())e.g.visible=e.enabled&&e.area===area;for(let e of [this.car,this.follow,...this.enemies,...this.extraCars,...this.patrols])e.g.visible=e.enabled&&e.area===area;this.targetMeshes.forEach((g,i)=>{const p=this.points?.[i];g.visible=!!p&&area===(this.targetArea||'outside');if(p){g.position.set(p[0],.25,p[1]);g.children[1].position.y=3.8+Math.sin(t*2)*.25;}});}
 drawMap(ctx,m,large,state){if(state.world.ryNodes||state.world.mapUpgraded)for(let n of NODES){if(n.id==='unknown'&&!state.chapterComplete)continue;if(n.id==='alley'&&!state.world.mapUpgraded)continue;let x=m.x(n.at[0]),z=m.z(n.at[1]);ctx.fillStyle=n.id==='hq'||state.world.control===100?'#efcf57':'#e88c87';ctx.fillRect(x-4,z-4,8,8);if(large){ctx.font='12px sans-serif';ctx.fillText(n.kind+' · '+n.name,x+8,z+12);}}
 if(large&&state.world.mapUpgraded)for(let [name,e]of this.contacts){if(!e.enabled||e.area!=='outside')continue;let x=m.x(e.g.position.x),z=m.z(e.g.position.z);ctx.fillStyle='#a5d9cc';ctx.beginPath();ctx.arc(x,z,4,0,Math.PI*2);ctx.fill();ctx.font='12px sans-serif';ctx.fillText(name,x+7,z-8);}
 for(let p of this.points||[]){if(this.targetArea!=='outside')continue;let x=m.x(p[0]),z=m.z(p[1]);ctx.strokeStyle='#68cfff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,z,large?10:6,0,Math.PI*2);ctx.stroke();}
 }
}
