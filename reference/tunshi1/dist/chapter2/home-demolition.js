import * as THREE from '../vendor/three.module.js';

// Mesh, navigation, physical collision and save HP share one demolition record.
export function buildHomeDemolition({home,box,label}){
 const parts=new Map(),original=[...home.g.children];
 const legacy=new Map([['-4,9','plaster-west'],['5,9','plaster-east'],['-4,-9','old-wall'],['-14,10','cabinet']]);
 for(const [index,b]of home.solids.entries()){
  const x=b.x-home.ox;
  if(Math.abs(x)>=home.w/2-.5||Math.abs(b.z)>=home.d/2-.5){b.structural=true;continue;}
  const mesh=original.find(m=>m.isMesh&&Math.abs(m.position.x-x)<.01&&Math.abs(m.position.z-b.z)<.01&&Math.abs((m.geometry.parameters?.width||0)-b.w)<.01&&Math.abs((m.geometry.parameters?.depth||0)-b.d)<.01);
  if(!mesh)continue;
  const id=legacy.get(x+','+b.z)||'home-part-'+index,name=(b.top||0)>3?'隔墙':b.w>3?'家具':'柜子 / 椅子';
  const attached=original.filter(m=>m!==mesh&&m.isMesh&&Math.abs(m.position.x-x)<b.w/2+.1&&Math.abs(m.position.z-b.z)<b.d/2+.1&&m.position.y>mesh.position.y&&m.position.y<3&&m.geometry.parameters?.height<.4);
  const debris=new THREE.Group();home.g.add(debris);debris.position.set(x,0,b.z);debris.visible=false;
  for(let i=0;i<8;i++){const fragment=box(.25+(i%3)*.23,.12,.32+(i%2)*.24,(b.top||0)>3?'#c8baa0':'#8c765c',debris,(i%3-1)*.65,.08,Math.floor(i/3)*.42-.4);fragment.rotation.set(i*.13,i*.8,i*.1);}
  const crack=label('╱  ╲',Math.min(b.w,2.8),.7,'#ac9d84','#514f49',mesh,0,0,b.d/2+.015);crack.visible=false;
  const hp=(b.top||0)>3?60:30;
  parts.set(id,{id,name,g:mesh,attached,collider:b,hp,maxHp:hp,debris,crack,area:home.id,at:[b.x,b.z]});
 }
 // The box has one explicit seal, reachable from the living-room side.
 // It is mounted on the existing kitchen partition, not a board elsewhere.
 const wall=parts.get('home-part-8')||[...parts.values()].find(p=>p.collider.z===-3&&p.collider.x<home.ox);
 if(wall){parts.delete(wall.id);wall.id='seal-panel';wall.name='藏铁盒的隔墙';parts.set(wall.id,wall);}
 const seal=parts.get('seal-panel'),ironAt=[home.ox-7,-4.35];
 const conduit=new THREE.Group();home.g.add(conduit);
 for(const [x,z,w,d]of [[-2,1,4,.09],[-4,-.3,.09,2.6],[-5.5,-1.55,3,.09],[-7,-2.2,.09,1.4]])box(w,.03,d,'#4bcbdf',conduit,x,.14,z);
 const cavity=box(2.4,1.9,.14,'#4d6669',home.g,-7,1.1,-4.9);cavity.visible=false;
 label('04 · 原件铁盒',2.3,.35,'#345d67','#f8dda2',cavity,0,.4,.085);
 return{parts,seal,ironAt,conduit,cavity};
}

export function applyHomeDemolition(sets,world){
 for(const p of sets.parts.values()){
  p.hp=world.demolition?.[p.id]??p.maxHp;
  // Old saves used 75 HP. Clamp remaining HP; zero remains permanently zero.
  p.hp=Math.min(p.hp,p.maxHp);const broken=p.hp<=0;
  p.g.visible=!broken;for(const m of p.attached||[])m.visible=!broken;
  p.collider.disabled=broken;p.debris.visible=broken;if(p.crack)p.crack.visible=!broken&&p.hp<p.maxHp;
 }
 const open=(world.demolition?.['seal-panel']??60)<=0;
 sets.iron.g.visible=open&&!world.originals;sets.demolition.cavity.visible=open;
 sets.demolition.conduit.visible=!world.originals;
}
