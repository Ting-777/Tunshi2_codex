import * as THREE from '../../vendor/three.module.js';
import {GARAGE} from './missions.js';

// Fixed pools: no meshes, textures or lights are created during the impact.
export class ThirdEffects{
 constructor(api){
  this.api=api;this.root=new THREE.Group();this.root.name='third-impact-pool';api.scene.add(this.root);this.root.visible=false;
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.5,-.35,0,.55,-.2,0,-.12,.6,0],3));geometry.computeVertexNormals();
  this.glassMaterial=new THREE.MeshStandardMaterial({color:'#bfe9e2',roughness:.16,metalness:.6,transparent:true,opacity:.86,side:THREE.DoubleSide});
  this.glass=new THREE.InstancedMesh(geometry,this.glassMaterial,72);this.metal=new THREE.InstancedMesh(new THREE.BoxGeometry(.16,1.6,.16),new THREE.MeshStandardMaterial({color:'#596e66',metalness:.7,roughness:.35}),8);
  this.wood=new THREE.InstancedMesh(new THREE.BoxGeometry(.15,.13,.55),new THREE.MeshStandardMaterial({color:'#a48b64'}),24);
  this.glass.frustumCulled=this.metal.frustumCulled=this.wood.frustumCulled=false;this.root.add(this.glass,this.metal,this.wood);
  this.dustPositions=new Float32Array(120*3);this.dustGeometry=new THREE.BufferGeometry();this.dustGeometry.setAttribute('position',new THREE.BufferAttribute(this.dustPositions,3));
  this.dust=new THREE.Points(this.dustGeometry,new THREE.PointsMaterial({color:'#d4e6dd',size:.13,transparent:true,opacity:.7,depthWrite:false}));this.root.add(this.dust);this.dust.frustumCulled=false;
  this.dummy=new THREE.Object3D();this.parts=Array.from({length:80},()=>({p:new THREE.Vector3(),v:new THREE.Vector3(),r:new THREE.Vector3(),spin:new THREE.Vector3(),scale:1}));this.dustVel=Array.from({length:120},()=>new THREE.Vector3());this.age=99;this.lastT=null;
 }
 clear(){this.age=99;this.root.visible=false;this.lastT=null;}
 impact(kind,at){
  this.kind=kind;this.area=this.api.get().interior||'outside';this.age=0;this.lastT=null;this.root.visible=true;
  this.glassMaterial.opacity=.86;this.dust.material.opacity=.7;this.origin=at;this.floor=at[1]-(kind==='glass'?2.7:1);this.glass.visible=this.metal.visible=kind==='glass';this.wood.visible=kind!=='glass'&&kind!=='water';
  const count=kind==='glass'?80:24;
  for(let i=0;i<count;i++){const part=this.parts[i],a=i*2.399;
   part.p.set(at[0]+(kind==='glass'?(i%12-5.5)*.95:Math.sin(a)*.5),kind==='glass'?.5+Math.floor(i/12)*.78:at[1],at[2]+.06);
   part.v.set(Math.sin(a)*(3+i%4),2.5+i%5,-(5+i%6));part.r.set(a,a*.7,0);part.spin.set(2+i%5,3-i%3,4);part.scale=kind==='glass'?.35+(i%4)*.14:1;
  }
  for(let i=0;i<120;i++){this.dustPositions[i*3]=at[0]+(kind==='glass'?(i%20-9.5)*.55:0);this.dustPositions[i*3+1]=kind==='glass'?.3+(i%9)*.55:at[1];this.dustPositions[i*3+2]=at[2];this.dustVel[i].set(Math.sin(i*2.4)*3,1+i%3,-2-i%7);}
  this.writeMatrices();this.dustGeometry.attributes.position.needsUpdate=true;
 }
 writeMatrices(){
  const count=this.kind==='glass'?80:24;for(let i=0;i<count;i++){const p=this.parts[i];this.dummy.position.copy(p.p);this.dummy.rotation.set(p.r.x,p.r.y,p.r.z);this.dummy.scale.setScalar(i>=72?1:p.scale);this.dummy.updateMatrix();const mesh=this.kind==='glass'?(i<72?this.glass:this.metal):this.wood;mesh.setMatrixAt(this.kind==='glass'&&i>=72?i-72:i,this.dummy.matrix);}
  for(const mesh of[this.glass,this.metal,this.wood])mesh.instanceMatrix.needsUpdate=true;
 }
 update(t,visible){
  if(this.age>6){this.root.visible=false;return;}const dt=this.lastT==null?0:Math.min(.06,Math.max(0,t-this.lastT));this.lastT=t;this.age+=dt;this.root.visible=visible&&this.area===(this.api.get().interior||'outside');
  if(dt<=0)return;const count=this.kind==='glass'?80:24;
  for(let i=0;i<count;i++){const p=this.parts[i];p.v.y-=dt*13;p.p.addScaledVector(p.v,dt);p.r.addScaledVector(p.spin,dt);if(p.p.y<this.floor+.08){p.p.y=this.floor+.08;p.v.y=Math.abs(p.v.y)*.17;p.v.x*=.9;p.v.z*=.9;p.spin.multiplyScalar(.9);}}
  for(let i=0;i<120;i++){const v=this.dustVel[i];this.dustPositions[i*3]+=v.x*dt;this.dustPositions[i*3+1]+=v.y*dt;this.dustPositions[i*3+2]+=v.z*dt;v.multiplyScalar(Math.exp(-dt*1.8));}
  this.dust.material.opacity=Math.max(0,.7-this.age*.2);this.glassMaterial.opacity=Math.max(0,.86-Math.max(0,this.age-4)*.4);this.writeMatrices();this.dustGeometry.attributes.position.needsUpdate=true;
 }
}
