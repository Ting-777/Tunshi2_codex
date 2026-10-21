// Compressed playable campus, informed by the user's five reference images.
// Keep the established gate/Academy Street approach and facility/save IDs.
export const campusBounds={minX:-309,maxX:-126,minZ:268,maxZ:414};
export const campusGate=[-213,413];
export const academicRoad=[[-213,404],[-213,281]];
export const dormEntry={at:[-167,387],floor:4,stairs:[-176,403],run:16,width:3.6,landing:{x:-171.5,z:386.5,w:12.8,d:4.4}};
export const homeApproach=[[-213,404],[-176,404],[-176,385.5],dormEntry.at];
export const homeReturn=[[-176,385.5],[-176,404],[-213,404],[-213,405]];
export const campusBuildings=[
 {id:'c4_campus_gym',name:'图强体育馆',x:-273,z:283,w:64,d:22,h:12,type:'gym'},
 {id:'c4_campus_science',name:'科学馆',x:-273,z:310,w:58,d:16,h:22,type:'science'},
 {id:'c4_campus_hongyi',name:'弘毅楼',x:-279,z:355,w:52,d:13,h:21,type:'classroom'},
 {id:'c4_campus_office',name:'办公楼',x:-242,z:355,w:14,d:16,h:20,type:'office'},
 {id:'c4_campus_chenyong',name:'沉勇楼',x:-271,z:375,w:66,d:13,h:21,type:'classroom'},
 {id:'c4_campus_dushi',name:'笃实楼',x:-267,z:397,w:68,d:12,h:21,type:'classroom'},
 {id:'c4_campus_baopu',name:'抱朴楼',x:-301,z:401,w:12,d:20,h:21,type:'classroom'},
 {id:'c4_campus_dorm',name:'学生公寓',x:-150,z:387,w:28,d:28,h:23,type:'dorm'}
];
export const campusPlaces=[
 {id:'c4_academic_road',name:'长郡 · 院士路',short:'院士路',entry:[-213,379]},
 {id:'c4_cheng_pond',name:'长郡 · 澄池 / 长沙府中学堂石拱门',short:'澄池',entry:[-250,335]},
 {id:'c4_campus_track',name:'长郡 · 蓝色跑道与足球场',short:'长郡操场',entry:[-199,341]},
 {id:'c4_campus_basketball',name:'长郡 · 篮球场',short:'篮球场',entry:[-200,371]}
];
export const withinCampus=(x,z)=>x>campusBounds.minX&&x<campusBounds.maxX&&z>campusBounds.minZ&&z<campusBounds.maxZ;
export function homeNavigation(position){
 const [x,y,z]=position,corner=[-176,385.5],nearCorner=Math.hypot(x-corner[0],z-corner[1])<.25;
 if(y<3.4){const climbing=Math.abs(x-dormEntry.stairs[0])<.8&&z<=404.5&&z>=385;
  return{at:climbing?corner:[-176,404],label:climbing?'沿学生公寓外楼梯上二楼':'校门右侧 · 学生公寓二楼楼梯'};
 }
 if(x< -173.5&&!nearCorner)return{at:corner,label:'走到二楼平台，绕过扶手向右'};
 return{at:dormEntry.at,label:'2F · 进入流星雨教师子弟之家'};
}
export function homeDescent(position){
 const [x,y,z]=position,l=dormEntry.landing,corner=[-176,385.5];
 if((y<.3&&(Math.abs(x+176)>1.8||z>403.75||z<386.5))||x<l.x-l.w/2-.5||x>l.x+l.w/2+.5||z<l.z-l.d/2-.5||z>404.1)return null;
 const onStairs=(Math.abs(x+176)<.45&&z>=386)||Math.hypot(x-corner[0],z-corner[1])<.6;
 return{at:onStairs?[-176,404]:corner,label:onStairs?'沿外楼梯下到校内道路':'二楼外廊 · 先走到下楼梯口'};
}
