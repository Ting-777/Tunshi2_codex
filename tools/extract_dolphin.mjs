import * as THREE from '../../web-original/dist/vendor/three.module.js';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../docs/original-dolphin-source.js',import.meta.url),'utf8');
function mesh(geo,c,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c}));m.position.set(x,y,z);parent.add(m);return m;}
function sphere(xr,yr,zr,c,p,x=0,y=0,z=0){const m=mesh(new THREE.SphereGeometry(1,24,16),c,p,x,y,z);m.scale.set(xr,yr,zr);return m;}
const h=new Function('THREE','sphere','mesh',source+';return dolphin();')(THREE,sphere,mesh);
h.g.name='Dolphin';h.body.name='body';for(let i=0;i<2;i++){h.arms[i].name='arm'+i;h.elbows[i].name='elbow'+i;h.legs[i].name='leg'+i;h.knees[i].name='knee'+i;}
function node(o){const n={name:o.name||'part',position:o.position.toArray(),rotation:o.rotation.toArray().slice(0,3),scale:o.scale.toArray(),children:o.children.map(node)};if(o.isMesh)n.mesh={position:Array.from(o.geometry.attributes.position.array),normal:Array.from(o.geometry.attributes.normal.array),index:o.geometry.index?Array.from(o.geometry.index.array):[],color:'#'+o.material.color.getHexString()};return n;}
fs.writeFileSync(new URL('../assets/original_dolphin.json',import.meta.url),JSON.stringify({source:'First web game game.js dolphin()',commit:'05b4c22866a72bc6fedb3f2bdaf89e171d99e2f6',model:node(h.g)}));console.log('Original model extracted');
