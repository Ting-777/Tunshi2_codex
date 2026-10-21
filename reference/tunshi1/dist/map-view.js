export function createMapView(bounds={minX:-260,maxX:460,minZ:-480,maxZ:480}){
const state={cx:0,cz:0,zoom:1};const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function fit(){state.cx=(bounds.minX+bounds.maxX)/2;state.cz=(bounds.minZ+bounds.maxZ)/2;state.zoom=1;}
function projection(w,h){const scale=Math.max(.01,Math.min(Math.max(1,w-56)/(bounds.maxX-bounds.minX),Math.max(1,h-56)/(bounds.maxZ-bounds.minZ)))*state.zoom;return{...state,scale,x:x=>w/2+(x-state.cx)*scale,z:z=>h/2+(z-state.cz)*scale,world:(x,z)=>[state.cx+(x-w/2)/scale,state.cz+(z-h/2)/scale]};}
function pan(dx,dz,w,h){const p=projection(w,h);state.cx-=dx/p.scale;state.cz-=dz/p.scale;}
function zoomAt(factor,x,z,w,h){const before=projection(w,h).world(x,z);state.zoom=clamp(state.zoom*factor,1,12);const after=projection(w,h).world(x,z);state.cx+=before[0]-after[0];state.cz+=before[1]-after[1];}
fit();return{state,fit,setBounds:b=>{bounds=b;fit();},projection,pan,zoomAt};
}
