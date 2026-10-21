import * as THREE from '../vendor/three.module.js';

// Gameplay positions are world coordinates, including room NPCs. Their layers
// stay at the scene origin; parenting to a translated room would shift physics.
export class ActorLayers{
 constructor(api){this.api=api;this.rooms=new Map();}
 syncEntity(e){
  if(!e.story&&!e.parkedInterior)return;
  this.syncObject(e.g,e.parkedInterior||e.area,e.region);
 }
 syncObject(g,area,region){
  const room=this.api.interiors[area];let root;
  if(room){
   root=this.rooms.get(room.id);
   if(!root){root=new THREE.Group();root.name='story-actors:'+room.id;root.visible=false;this.api.scene.add(root);this.rooms.set(room.id,root);}
  }else root=this.api.outdoor(region);
  if(g.parent!==root)root.add(g);
 }
 sync(){
  for(const e of this.api.entities())this.syncEntity(e);
  for(const {g,area,region}of this.api.props?.()||[])this.syncObject(g,area,region);
  const s=this.api.get();
  for(const [id,root]of this.rooms)root.visible=s.started&&s.interior===id&&(this.api.interiors[id].region||'chapter1_beichen')===s.region;
 }
}
