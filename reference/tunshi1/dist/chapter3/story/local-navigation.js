// Combat only searches the immediate arena. A sealed bridge is a real boundary,
// not a reason to run the campaign's full-map A* again every few frames.
export function localCombatPath(start,end,{clear,heightAt,maxNodes=420,step=2}){
 if(Math.hypot(end[0]-start[0],end[1]-start[1])>55)return[];
 const margin=10,minX=Math.floor((Math.min(start[0],end[0])-margin)/step),maxX=Math.ceil((Math.max(start[0],end[0])+margin)/step),minZ=Math.floor((Math.min(start[1],end[1])-margin)/step),maxZ=Math.ceil((Math.max(start[1],end[1])+margin)/step);
 const key=(x,z)=>x+','+z,freeCache=new Map(),heights=new Map();
 const height=(x,z)=>{const k=key(x,z);if(!heights.has(k))heights.set(k,heightAt(x*step,z*step));return heights.get(k);};
 const free=(x,z)=>{const k=key(x,z);if(!freeCache.has(k))freeCache.set(k,x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ&&clear(x*step,z*step));return freeCache.get(k);};
 const snap=p=>{const x=Math.round(p[0]/step),z=Math.round(p[1]/step);for(let r=0;r<3;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(Math.max(Math.abs(a),Math.abs(b))===r&&free(x+a,z+b))return[x+a,z+b];return null;};
 const a=snap(start),b=snap(end);if(!a||!b)return[];
 const heap=[],push=n=>{let i=heap.length;heap.push(n);while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p;}heap[i]=n;};
 const pop=()=>{const n=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return n;};
 const target=key(...b),first=key(...a),best=new Map([[first,0]]),parent=new Map(),done=new Set();push({x:a[0],z:a[1],k:first,g:0,f:0});
 let count=0;while(heap.length&&count++<maxNodes){const n=pop();if(done.has(n.k))continue;done.add(n.k);
  if(n.k===target){const path=[end.slice()];let k=target;while(k){path.push(k.split(',').map(v=>Number(v)*step));k=parent.get(k);}return path.reverse();}
  for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=n.x+dx,z=n.z+dz;if(!free(x,z)||(dx&&dz&&(!free(x,n.z)||!free(n.x,z)))||Math.abs(height(x,z)-height(n.x,n.z))>2.6)continue;
   const k=key(x,z),g=n.g+Math.hypot(dx,dz);if(g>=(best.get(k)??Infinity))continue;best.set(k,g);parent.set(k,n.k);push({x,z,k,g,f:g+Math.hypot(x-b[0],z-b[1])});
  }
 }return[];
}
