import {SHOP,GARAGE,HOME,OFFICE,B1} from './missions.js';
export function buildWeapons({interiors,box,cyl,label,outside}){
 const map=new Map(),defs=[[SHOP,-3,5,'凳子'],[SHOP,6,6,'灭火器'],[GARAGE,-29,20,'垃圾桶'],[GARAGE,29,-20,'灭火器'],[OFFICE,6,12,'凳子'],[OFFICE,-27,-18,'灭火器'],[HOME,3,2,'凳子'],[B1,-23,12,'垃圾桶'],['outside',246,-87,'垃圾桶'],['outside',239,-107,'垃圾桶'],['outside',-588,-155,'凳子']];
 for(const [i,[area,x,z,name]]of defs.entries()){
  const parent=area==='outside'?outside:interiors[area].g,ox=interiors[area]?.ox||0,g=box(.05,.05,.05,'#586e68',parent,x,0,z);const id='weapon-'+i;
  if(name==='凳子'){box(.75,.12,.7,'#a1825e',g,0,.75,0);for(const a of [-.28,.28])for(const b of [-.25,.25])box(.08,.75,.08,'#57605a',g,a,.37,b);}
  else{cyl(name==='垃圾桶'?.35:.16,name==='垃圾桶'?.32:.16,name==='垃圾桶'?.9:.65,name==='垃圾桶'?'#536d64':'#ad5747',g,0,.5,0);cyl(.38,.38,.06,'#819386',g,0,1,0);box(.28,.06,.08,'#334e51',g,0,1.08,0);}
  const collider={x:ox+x,z,w:.7,d:.65,bottom:0,top:1.1,walkable:true};if(area!=='outside')interiors[area].solids.push(collider);
  map.set(id,{id,g,origin:g.position.clone(),collider,at:[ox+x,z],area,name,hp:30,maxHp:30,equipment:true});
 }
 return map;
}
