import {GARAGE,OFFICE,HOME} from './missions.js';

// Interactive equipment uses the same mesh, damage state and physics envelope.
export function buildEquipment({interiors,box,label,props,gate,gateCollider}){
 const parts=new Map(),locker=props.get('locker-04'),room=interiors[GARAGE];
 for(const child of [...locker.g.children])if(child!==locker.caption)locker.g.remove(child);
 box(2.1,2.3,.8,'#657e82',locker.g,0,1.15,0);
 const door=box(1.92,2.12,.06,'#9cac9f',locker.g,0,1.15,.44);
 box(.1,.45,.12,'#354c52',door,.72,0,.06);
 label('04',.65,.4,'#9cac9f','#314751',door,0,.55,.04);
 const collider={x:locker.at[0],z:locker.at[1],w:2.1,d:.8,bottom:0,top:2.3};
 room.solids.push(collider);room.cameraBlocks.push(door);
 for(const [id,g,b,area,name,hp]of [['locker-door',locker.g,collider,GARAGE,'04 号柜门',60],['office-gate',gate,gateCollider,OFFICE,'办公门禁',90]]){
  const r=interiors[area],debris=box(b.w,.12,Math.max(.5,b.d),'#7b8885',r.g,b.x-r.ox,.1,b.z);debris.visible=false;
  parts.set(id,{id,g,collider:b,area,name,maxHp:hp,hp,debris,at:[b.x,b.z],equipment:true});
 }
 for(const id of ['old-pc','takeout','old-cards']){const p=props.get(id),r=interiors[HOME],b={x:p.at[0],z:p.at[1],w:id==='old-pc'?1.5:1,d:id==='old-pc'?1:.7,bottom:0,top:id==='old-pc'?1.1:.8,walkable:true};r.solids.push(b);const debris=box(.9,.1,.7,'#8a816e',r.g,b.x-r.ox,.1,b.z);debris.visible=false;parts.set('home-object-'+id,{id:'home-object-'+id,g:p.g,collider:b,area:HOME,name:p.name,maxHp:30,hp:30,debris,at:p.at,equipment:true,clue:id});}
 return parts;
}
