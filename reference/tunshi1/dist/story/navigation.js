// Cached A* over the existing solid map. Paths never cut through building footprints.
export class Navigator{
 constructor(clear,step=4,bounds={minX:-224,maxX:420,minZ:-444,maxZ:456}){this.clear=clear;this.step=step;this.cache=new Map();this.bounds=bounds;}
 key(x,z){return x+','+z;}
 free(x,z){let k=this.key(x,z),b=this.bounds,s=this.step;if(!this.cache.has(k))this.cache.set(k,x*s>=b.minX&&x*s<=b.maxX&&z*s>=b.minZ&&z*s<=b.maxZ&&this.clear(x*s,z*s,2.5));return this.cache.get(k);}
 snap(p){let x=Math.round(p[0]/this.step),z=Math.round(p[1]/this.step);for(let r=0;r<12;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(Math.max(Math.abs(a),Math.abs(b))===r&&this.free(x+a,z+b))return[x+a,z+b];return null;}
 path(start,end){let a=this.snap(start),b=this.snap(end);if(!a||!b)return[];let target=this.key(...b),first=this.key(...a),open=[{p:a,k:first,g:0,f:0}],best=new Map([[first,0]]),parent=new Map(),done=new Set();let count=0;
 while(open.length&&count++<30000){let idx=0;for(let i=1;i<open.length;i++)if(open[i].f<open[idx].f)idx=i;let n=open.splice(idx,1)[0];if(done.has(n.k))continue;done.add(n.k);if(n.k===target){let out=[],k=target;while(k){out.push(k.split(',').map(v=>Number(v)*this.step));k=parent.get(k);}return out.reverse();}
 for(let [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){let x=n.p[0]+dx,z=n.p[1]+dz;if(!this.free(x,z)||(dx&&dz&&(!this.free(x,n.p[1])||!this.free(n.p[0],z))))continue;let k=this.key(x,z),g=n.g+Math.hypot(dx,dz);if(g>=(best.get(k)??Infinity))continue;best.set(k,g);parent.set(k,n.k);open.push({p:[x,z],k,g,f:g+Math.hypot(x-b[0],z-b[1])});}}
 return[];}
 route(points){let out=[];for(let i=1;i<points.length;i++){let p=this.path(points[i-1],points[i]);if(!p.length)throw new Error('无法生成路线 '+JSON.stringify(points[i]));out.push(...p.slice(out.length?1:0));}return out;}
}
