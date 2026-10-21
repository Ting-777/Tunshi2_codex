import * as THREE from '../vendor/three.module.js';
import {texture} from '../visuals/model-kit.js';

const maps=new Map(),materials=new Map(),loads=[];let invalidate=()=>{},sky;
export async function cityTexturesReady(){if(!loads.length)return;let timeout;try{await Promise.race([Promise.allSettled(loads),new Promise(resolve=>{timeout=setTimeout(resolve,8000);})]);}finally{clearTimeout(timeout);}}
export function setCityMaterialInvalidator(fn){invalidate=fn;}
const files={granite:'huangxing-granite',brick:'city-brick',asphalt:'city-asphalt'};
function imageMap(kind){
 if(maps.has(kind))return maps.get(kind);
 if(!files[kind])return texture(kind==='wood'?'wood':kind==='tile'?'brick':kind==='fabric'?'fabric':kind==='plaster'?'plaster':'stone');
 const canvas=document.createElement('canvas');canvas.width=canvas.height=32;const ctx=canvas.getContext('2d');ctx.fillStyle=kind==='asphalt'?'#5e6062':kind==='brick'?'#b3a293':'#d2d2ce';ctx.fillRect(0,0,32,32);
 const map=new THREE.CanvasTexture(canvas);map.wrapS=THREE.RepeatWrapping;map.wrapT=kind==='brick'?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping;map.anisotropy=8;map.colorSpace=THREE.SRGBColorSpace;maps.set(kind,map);
 // Node geometry checks retain a bounded canvas fallback. Browser textures are
 // shared, and a completed load wakes one paused draw rather than a frame loop.
 if(typeof globalThis.Image==='function')loads.push(new Promise(resolve=>{new THREE.TextureLoader().load(new URL('../assets/chapter4/'+files[kind]+'.png',import.meta.url).href,t=>{map.image=t.image;map.needsUpdate=true;t.dispose();resolve();invalidate();},undefined,()=>{map.userData.loadError=true;resolve();invalidate();});}));
 map.userData.asset=files[kind]&&'assets/chapter4/'+files[kind]+'.png';return map;
}
// Physical world coordinates make the same masonry/paving scale independent
// of wall length and instance scale. No fragment triplanar sampling or pass.
export function worldTiling(material,period=4,brick=false){
 material.userData.cityWorldTiling={period,brick};
 material.onBeforeCompile=shader=>{
  shader.uniforms.c4TilePeriod={value:period};
  shader.vertexShader='uniform float c4TilePeriod;\n'+shader.vertexShader;
  const project=`
vec4 c4Position=vec4(position,1.0);
vec3 c4Normal=normal;
#ifdef USE_INSTANCING
c4Position=instanceMatrix*c4Position;
c4Normal=mat3(instanceMatrix)*c4Normal;
#endif
c4Position=modelMatrix*c4Position;
c4Normal=normalize(mat3(modelMatrix)*c4Normal);
vec3 c4Axis=abs(c4Normal);
vec2 c4UV=c4Axis.y>max(c4Axis.x,c4Axis.z)?c4Position.xz:(c4Axis.x>c4Axis.z?c4Position.zy:c4Position.xy);
c4UV/=c4TilePeriod;
${brick?'c4UV.y=clamp(c4Position.y/c4TilePeriod,0.004,0.996);':''}
#ifdef USE_MAP
vMapUv=c4UV;
#endif
#ifdef USE_BUMPMAP
vBumpMapUv=c4UV;
#endif
`;
  shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n'+project);
 };
 material.customProgramCacheKey=()=>`c4-world-tile-v1:${period}:${brick}`;return material;
}
export function cityMaterial(color='#c7c3bb',kind='plaster'){
 const key=color+':'+kind;if(materials.has(key))return materials.get(key);
 const textured=['granite','brick','asphalt','stone','wood','tile','plaster','fabric'].includes(kind),map=textured?imageMap(kind):null;
 const m=new THREE.MeshStandardMaterial({color,map,bumpMap:map,bumpScale:kind==='brick'?.022:kind==='asphalt'?.009:.012,roughness:kind==='metal'?.32:kind==='wood'?.68:kind==='stone'?.54:kind==='tile'?.48:.88,metalness:kind==='metal'?.62:0});
 if(kind==='metal'){m.envMap=skyMap();m.envMapIntensity=.35;}
 if(map)worldTiling(m,kind==='fabric'?.35:kind==='plaster'?2:kind==='wood'?2:kind==='tile'?2:4,kind==='brick');m.userData.cityMaterial=kind;materials.set(key,m);return m;
}
function skyMap(){
 if(sky)return sky;const images=[];
 for(let i=0;i<6;i++){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createLinearGradient?.(0,0,0,64);if(g?.addColorStop){g.addColorStop(0,'#c0d2df');g.addColorStop(.48,'#b6c2c9');g.addColorStop(.65,'#6e777c');g.addColorStop(1,'#39454d');}ctx.fillStyle=g||'#9aa9b2';ctx.fillRect(0,0,64,64);images.push(c);}
 sky=new THREE.CubeTexture(images);sky.colorSpace=THREE.SRGBColorSpace;sky.needsUpdate=true;return sky;
}
export function cityGlass(transparent=false){
 const key='glass:'+transparent;if(materials.has(key))return materials.get(key);
 const m=new THREE.MeshStandardMaterial({color:transparent?'#b6cbd2':'#51636b',transparent,opacity:transparent?.2:1,depthWrite:!transparent,roughness:transparent?.12:.21,metalness:.32,envMap:skyMap(),envMapIntensity:.65,side:transparent?THREE.DoubleSide:THREE.FrontSide});m.userData.cityGlass=true;materials.set(key,m);return m;
}
