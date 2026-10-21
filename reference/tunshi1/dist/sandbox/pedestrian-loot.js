import * as THREE from '../vendor/three.module.js';
import {BEICHEN} from '../regions/data.js';

// Ordinary pedestrians carry pocket change. Player punches and driven vehicles trigger one drop per cooldown.
export class PedestrianLoot{
 constructor(api){this.api=api;this.drops=[];this.cooldowns={};this.nextId=1;}
 knockdown(person,source){
  if(source!=='player'||person.kind!=='person'||person.story||person.ally||person.hp>0)return;
  const region=person.region||BEICHEN,key=region+':'+person.id;
  if((this.cooldowns[key]||0)>this.api.clock()||this.drops.some(d=>d.key===key))return;
  const amount=3+Math.floor(Math.random()*10),p=person.g.position;
  this.cooldowns[key]=this.api.clock()+120;
  this.add({id:this.nextId++,key,region,amount,at:[p.x,p.z]});this.api.save();
 }
 add(data){
  const root=this.api.root(data.region);if(!root)return;
  const g=new THREE.Group();g.position.set(data.at[0],(this.api.height?.(data.region,...data.at)||0)+.12,data.at[1]);root.add(g);
  for(let i=0;i<3;i++){const note=this.api.box(.8,.065,.42,i%2?'#d4d8a0':'#79b96d',g,i*.04,.12+i*.08,0);note.rotation.y=i*.16;}
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.62,.04,6,24),new THREE.MeshBasicMaterial({color:'#c7f586'}));halo.userData.cashMaterial=true;halo.rotation.x=Math.PI/2;halo.position.y=.07;g.add(halo);
  this.api.label('¥'+data.amount,1.3,.4,'#2d5942','#f3f6b9',g,0,.8,0);
  this.drops.push({...data,g});
 }
 tick(){
  const s=this.api.get();if(!s.started||s.paused||s.dead||s.interior)return;
  let amount=0;
  for(let i=this.drops.length-1;i>=0;i--){const d=this.drops[i];if(d.region!==s.region||Math.hypot(s.position[0]-d.at[0],s.position[2]-d.at[1])>(s.driving?3:1.9))continue;amount+=d.amount;this.remove(i);}
  if(amount){this.api.cash(amount);this.api.toast('拾取现金 +¥'+amount);this.api.save();}
 }
 remove(i){const [d]=this.drops.splice(i,1);d.g.removeFromParent();d.g.traverse(o=>{o.geometry?.dispose();if(o.userData.cashMaterial)o.material?.dispose();if(o.material?.map){o.material.map.dispose();o.material.dispose();}});}
 serialize(){return{nextId:this.nextId,cooldowns:{...this.cooldowns},drops:this.drops.map(({g,...d})=>d)};}
 restore(s){while(this.drops.length)this.remove(0);this.nextId=s?.nextId||1;this.cooldowns={...s?.cooldowns};for(const d of s?.drops||[])this.add(d);}
}
