import * as THREE from '../vendor/three.module.js';
const coloredMaterials=new Map();
function rigidMaterial(m){
 if(!m.userData.cityMaterial)return{material:m,key:m.uuid,color:null};
 const key=[m.userData.cityMaterial,m.map?.uuid,m.bumpMap?.uuid,m.envMap?.uuid,m.envMapIntensity,m.roughness,m.metalness,m.bumpScale,m.customProgramCacheKey(),m.side].join(':');let material=coloredMaterials.get(key);
 if(!material){material=m.clone();material.color.set('#ffffff');material.onBeforeCompile=m.onBeforeCompile;material.customProgramCacheKey=m.customProgramCacheKey;coloredMaterials.set(key,material);}
 return{material,key,color:m.color};
}

// Chapter IV only: opaque rigid instances from neighbouring facades can share
// one draw instead of repeating an identical material draw for every shop.
// Glass, signs, movable props, people and room geometry retain their hierarchy.
export function packCityInstances(root,kits){
 const size=144,cells=new Map(),local=new THREE.Matrix4(),world=new THREE.Matrix4(),box=new THREE.Box3(),centre=new THREE.Vector3();let beforeMeshes=0,instances=0;
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert();
 for(const k of kits)for(const mesh of [...k.root.children]){
  if(!mesh.isInstancedMesh||mesh.material.transparent||mesh.material.depthWrite===false)continue;
  beforeMeshes++;mesh.geometry.computeBoundingBox();const finish=rigidMaterial(mesh.material);
  for(let i=0;i<mesh.count;i++){
   mesh.getMatrixAt(i,local);world.multiplyMatrices(inverse,mesh.matrixWorld).multiply(local);box.copy(mesh.geometry.boundingBox).applyMatrix4(world);box.getCenter(centre);
   const gx=Math.floor(centre.x/size),gz=Math.floor(centre.z/size),key=gx+','+gz;let cell=cells.get(key);
   if(!cell){cell={gx,gz,box:new THREE.Box3(),sets:new Map()};cells.set(key,cell);}cell.box.union(box);
   const group=mesh.geometry.uuid+':'+finish.key+':'+mesh.castShadow+':'+mesh.receiveShadow;let set=cell.sets.get(group);if(!set){set={geometry:mesh.geometry,material:finish.material,matrices:[],colors:finish.color?[]:null,castShadow:mesh.castShadow,receiveShadow:mesh.receiveShadow};cell.sets.set(group,set);}set.matrices.push(world.clone());if(set.colors)set.colors.push(finish.color.clone());instances++;
  }
  mesh.removeFromParent();mesh.dispose();
 }
 const chunks=[];let afterMeshes=0,afterInstances=0;
 for(const cell of cells.values()){
  const g=new THREE.Group();g.name='c4-static-cell-'+cell.gx+':'+cell.gz;root.add(g);const x=(cell.box.min.x+cell.box.max.x)/2,z=(cell.box.min.z+cell.box.max.z)/2;
  // Tall landmark fins and tower silhouettes remain visible against the sky
  // while small shop cells use their own conservative horizontal envelope.
  const radius=cell.box.max.y>70?850:Math.hypot(cell.box.max.x-cell.box.min.x,cell.box.max.z-cell.box.min.z)/2+90;
  chunks.push({g,x,z,radius});
  for(const set of cell.sets.values()){
   const mesh=new THREE.InstancedMesh(set.geometry,set.material,set.matrices.length);set.matrices.forEach((m,i)=>{mesh.setMatrixAt(i,m);if(set.colors)mesh.setColorAt(i,set.colors[i]);});mesh.castShadow=set.castShadow;mesh.receiveShadow=set.receiveShadow;mesh.name='c4-shared-street-instances';mesh.userData.cityStaticCell=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();g.add(mesh);afterMeshes++;afterInstances+=mesh.count;
  }
 }
 if(instances!==afterInstances)throw Error('Chapter IV rigid-instance packing lost geometry');
 return{chunks,stats:{beforeMeshes,afterMeshes,instances,cellCount:cells.size}};
}
