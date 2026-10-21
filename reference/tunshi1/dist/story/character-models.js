import * as THREE from '../vendor/three.module.js';
// Sculpted geometry inspired by the supplied lamb-in-a-lion-hood reference.
export function createRY({sphere,box}) {
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  g.userData.characterModel='ry-lion-hood';
  sphere(.48,.66,.32,'#30344b',body,0,1.25,0);
  box(.2,.64,.035,'#f6ecd8',body,0,1.39,.31);
  for(const s of [-1,1]){const lapel=box(.14,.5,.05,'#565674',body,s*.16,1.46,.34);lapel.rotation.z=s*-.3;}
  sphere(.07,.085,.025,'#eab84b',body,.27,1.53,.35);
  const arms=[],legs=[];
  for(const s of [-1,1]){
    const a=new THREE.Group();a.position.set(s*.48,1.6,0);body.add(a);
    sphere(.16,.36,.18,'#383c54',a,s*.05,-.28,0);sphere(.17,.19,.18,'#fff0d5',a,s*.07,-.57,.02);arms.push(a);
    const l=new THREE.Group();l.position.set(s*.24,.8,0);g.add(l);
    sphere(.18,.36,.2,'#30344b',l,0,-.28,0);sphere(.21,.14,.31,'#232a39',l,0,-.66,.09);legs.push(l);
  }
  const head=new THREE.Group();head.name='lion-hood-and-lamb';head.position.set(0,2.42,0);body.add(head);
  // A thick, bevelled twelve-point mane, visible from the side and rear too.
  const outline=new THREE.Shape();for(let i=0;i<24;i++){const a=Math.PI/2+i*Math.PI/12,r=i%2?.77:1.01;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?outline.lineTo(x,y):outline.moveTo(x,y);}outline.closePath();
  const mane=new THREE.Mesh(new THREE.ExtrudeGeometry(outline,{depth:.25,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.075,bevelThickness:.075}),new THREE.MeshStandardMaterial({color:'#f4ad37',roughness:.8}));mane.position.z=-.29;head.add(mane);
  const inner=mane.clone();inner.material=new THREE.MeshStandardMaterial({color:'#ffce51',roughness:.8});inner.scale.set(.9,.9,.9);inner.position.z=-.18;head.add(inner);
  sphere(.77,.81,.48,'#ffcf50',head,0,.04,0);
  // Hood ears, lion eyes and muzzle above the lamb's face opening.
  for(const s of [-1,1]){sphere(.2,.22,.11,'#e5a934',head,s*.49,.48,.34);sphere(.135,.15,.07,'#ffe184',head,s*.49,.48,.43);sphere(.046,.066,.035,'#875520',head,s*.23,.48,.47);for(let j=0;j<2;j++){const whisker=box(.16,.027,.025,'#b87b27',head,s*.43,.29-j*.09,.46);whisker.rotation.z=s*(j?-.2:.05);}}
  sphere(.105,.065,.07,'#9f6824',head,0,.39,.48);box(.027,.12,.025,'#9f6824',head,0,.31,.5);
  sphere(.66,.51,.23,'#dda13a',head,0,-.23,.365);
  sphere(.59,.44,.235,'#fff1d6',head,0,-.23,.43);
  for(const s of [-1,1]){
    const ear=sphere(.18,.3,.1,'#fff0d5',head,s*.57,-.13,.48);ear.rotation.z=s*.65;
    const inset=sphere(.085,.2,.04,'#efb2a4',head,s*.60,-.14,.565);inset.rotation.z=s*.65;
    sphere(.044,.06,.026,'#795027',head,s*.235,-.21,.661);
    sphere(.13,.115,.026,'#f2b8a7',head,s*.32,-.37,.65);
  }
  for(const [x,y,r] of [[-.36,.12,.17],[-.17,.16,.18],[.06,.14,.22],[.29,.14,.17],[.43,.1,.12]])sphere(r,r*.72,.1,'#fff5dd',head,x,y,.56);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.073,.085,3),new THREE.MeshStandardMaterial({color:'#bd8b51'}));nose.rotation.z=Math.PI;nose.position.set(0,-.31,.696);head.add(nose);box(.022,.095,.024,'#976833',head,0,-.39,.682);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  return {g,body,arms,legs,labelHeight:3.8};
}
