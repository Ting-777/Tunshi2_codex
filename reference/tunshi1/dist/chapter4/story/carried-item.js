import * as THREE from '../../vendor/three.module.js';

// Keep earlier parcel silhouettes; Chapter IV carries a card pouch and a data case.
export function carryStoryItem({hero,box,label},name){
 let cargo=hero.g.userData.storyCargo;
 if(!cargo){cargo=new THREE.Group();cargo.position.set(.78,1.15,.05);hero.g.add(cargo);cargo.userData.models=new Map();hero.g.userData.storyCargo=cargo;}
 cargo.visible=!!name;cargo.userData.name=name;if(!name)return;
 const kind=name==='蓝袋校验卡'?'card-pouch':name==='电子总账'?'data-case':'parcel';
 let model=cargo.userData.models.get(kind);
 if(!model){model=new THREE.Group();model.name='story-carry-'+kind;cargo.add(model);cargo.userData.models.set(kind,model);
  if(kind==='parcel'){box(.6,.5,.48,'#aa9470',model,0,0,0);box(.63,.05,.5,'#ded1ae',model,0,.23,0);}
  else if(kind==='card-pouch'){
   box(.54,.38,.13,'#547ea1',model,0,0,0);box(.55,.035,.14,'#b3c2c4',model,0,.18,0);
   for(const x of[-.15,.15])box(.045,.12,.055,'#334d60',model,x,.25,0);box(.34,.035,.055,'#334d60',model,0,.31,0);
   box(.22,.15,.025,'#dfdfc5',model,.08,.1,.09);box(.025,.1,.035,'#d3b362',model,-.2,.16,.08);label('钥匙',.2,.06,'#dfdfc5','#365263',model,.08,.1,.106);
  }else{
   box(.7,.46,.2,'#51646e',model,0,0,0);box(.71,.018,.21,'#a8b6b6',model,0,.07,0);
   for(const x of[-.31,.31])for(const y of[-.2,.2])box(.08,.08,.21,'#8b9a9e',model,x,y,0);
   for(const x of[-.14,.14])box(.05,.12,.08,'#263d49',model,x,.28,0);box(.33,.05,.08,'#263d49',model,0,.34,0);
   box(.28,.14,.03,'#2d4955',model,0,.08,.12);label('总账',.24,.075,'#2d4955','#c6dcce',model,0,.08,.138);box(.06,.04,.025,'#8ab09d',model,.24,-.1,.116);
  }
 }
 for(const [key,item]of cargo.userData.models)item.visible=key===kind;
 cargo.userData.kind=kind;
}
