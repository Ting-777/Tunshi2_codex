import {STORY_ROOMS} from './story/missions.js';
import {dormEntry} from './campus-layout.js';
// East is +x; north is -z. Distances are compressed, street adjacency is kept.
export const CITY='chapter4_after_school';
export const TUNNEL='connector_nanhu_tunnel';
export const bounds={minX:-490,maxX:440,minZ:-1090,maxZ:650};
export const beichenLink={cityX:350,cityGateZ:-1078,cityArrival:[350,-1064],beichenX:385,beichenGateZ:450,beichenArrival:[385,437]};
export const beichenApproach=[[385,455],[385,390],[331,390],[331,330],[378,327]];
export const perimeterParking=[
 {id:'c4_huangxing_parking',name:'黄兴广场 · 东侧停车',at:[96,-350]},
 {id:'c4_pozi_parking',name:'坡子街 · 西口停车',at:[-442,-325]}
];
export const districts=[
 {id:'c4_shuyuan',name:'南湖路 / 书院路',at:[-330,550],radius:160},
 {id:'c4_changjun',name:'长郡中学 / 学院街',at:[-200,390],radius:135},
 {id:'c4_nanmenkou',name:'南门口',at:[0,220],radius:150},
 {id:'c4_huangxing_south',name:'黄兴南路步行街',at:[0,-70],radius:230},
 {id:'c4_huangxing_square',name:'黄兴广场',at:[0,-350],radius:90},
 {id:'c4_jiefang_west',name:'解放西 / 坡子街',at:[-235,-470],radius:200},
 {id:'c4_taiping',name:'太平街',at:[-360,-760],radius:185},
 {id:'c4_wuyi',name:'五一广场',at:[40,-880],radius:170},
 {id:'c4_heiwado',name:'平和堂 / 优衣库',at:[45,-827],radius:80},
 {id:'c4_ifs',name:'长沙 IFS',at:[180,-695],radius:155}
];
export const roads=[
 ['南湖路',[[-485,575],[-330,575],[-280,550]],22,'motor'],
 ['书院路',[[-330,625],[-330,435],[-330,250],[-330,65]],20,'motor'],
 ['学院街',[[-330,435],[-190,435],[-80,435],[0,320],[0,220]],14,'motor'],
 ['城南通车连接',[[-80,435],[170,435],[350,435],[350,250],[350,80]],20,'motor'],
 ['南门口外围路',[[-330,250],[0,250],[320,250],[350,80],[350,-460]],20,'motor'],
 ['西侧城区车道',[[-330,250],[-462,250],[-462,-325],[-462,-465],[-462,-890]],22,'motor'],
 ['黄兴广场停车连接',[[350,-350],[96,-350]],18,'motor'],
 ['黄兴广场东侧步行入口',[[96,-339],[33,-339]],8,'footway'],
 ['坡子街西口停车连接',[[-462,-325],[-442,-325]],18,'motor'],
 ['黄兴南路步行街',[[0,220],[0,-280],[0,-420]],24,'pedestrian'],
 ['黄兴中路步行段',[[0,-420],[0,-800],[0,-885]],24,'pedestrian'],
 ['坡子街',[[-420,-325],[-240,-325],[-75,-325],[0,-350]],16,'pedestrian'],
 ['解放西路',[[-480,-465],[-350,-465],[-150,-465],[0,-465],[350,-465]],20,'motor'],
 ['解放西后巷',[[-375,-510],[-240,-510],[-115,-510],[-70,-465]],7,'footway'],
 ['太平街',[[-355,-325],[-355,-465],[-355,-760],[-355,-885]],12,'pedestrian'],
 ['五一大道',[[-480,-890],[-355,-890],[0,-890],[210,-890],[420,-890]],26,'motor'],
 ['商场东侧车道',[[350,-465],[350,-690],[350,-890],[350,-1088]],22,'motor'],
 ['五一广场北侧步行环',[[-170,-940],[-170,-1025],[140,-1025],[140,-940],[0,-940],[0,-890]],16,'pedestrian'],
 ['黄兴巷',[[-90,135],[-90,-105],[-90,-260],[-90,-325]],8,'footway'],
 ['市井横巷',[[-90,40],[0,40],[100,40],[100,-100],[0,-100]],8,'footway'],
 ['天井巷',[[-213,-325],[-213,-410],[-150,-410],[-150,-465]],7,'footway'],
 ['IFS 西侧步行广场',[[0,-605],[115,-605],[115,-760],[0,-760]],16,'pedestrian']
];
// Door position is the accessible pavement; facade is 3 m behind it.
// Angle 0 faces south, PI north, +/-PI/2 faces east/west.
export const facilities=[
 {id:'c4_classroom_home',name:'流星雨教师子弟之家 · 学生公寓 2F',at:dormEntry.at,angle:-Math.PI/2,w:28,d:28,h:23,entryFloor:dormEntry.floor,type:'ice',district:'c4_changjun'},
 {id:'c4_stationery',name:'放学文具',at:[-110,420],angle:0,w:20,d:16,h:13,type:'stationery',district:'c4_changjun'},
 {id:'c4_nanmen_snacks',name:'南门口小吃铺',at:[-19,184],angle:Math.PI/2,w:25,d:22,h:15,type:'snack',district:'c4_nanmenkou'},
 {id:'c4_convenience',name:'街角便利店',at:[19,120],angle:-Math.PI/2,w:25,d:23,h:17,type:'store',district:'c4_nanmenkou'},
 {id:'c4_pharmacy',name:'南门口药房',at:[-19,70],angle:Math.PI/2,w:25,d:25,h:18,type:'store',district:'c4_nanmenkou'},
 {id:'c4_tea',name:'黄兴路茶饮铺',at:[19,12],angle:-Math.PI/2,w:25,d:24,h:17,type:'tea',district:'c4_huangxing_south'},
 {id:'c4_net_cafe',name:'云上网咖',at:[-19,-120],angle:Math.PI/2,w:26,d:24,h:20,type:'net',district:'c4_huangxing_south'},
 {id:'c4_arcade',name:'天蝎电玩',at:[19,-205],angle:-Math.PI/2,w:35,d:27,h:21,type:'arcade',district:'c4_huangxing_south'},
 {id:'c4_mahjong',name:'邻里棋牌室',at:[-236,-346],angle:0,w:27,d:22,h:16,type:'mahjong',district:'c4_jiefang_west'},
 {id:'c4_billiards',name:'八号台球厅 · 2F',at:[-130,-443],angle:Math.PI,w:30,d:24,h:22,entryFloor:4,type:'billiards',district:'c4_jiefang_west'},
 {id:'c4_bar',name:'落日酒吧',at:[-205,-487],angle:0,w:36,d:18,h:20,backDoor:true,type:'bar',district:'c4_jiefang_west'},
 {id:'c4_ktv',name:'声浪 KTV',at:[-300,-441],angle:Math.PI,w:35,d:24,h:23,type:'ktv',district:'c4_jiefang_west'},
 {id:'c4_massage',name:'巷里足浴',at:[-372,-620],angle:Math.PI/2,w:30,d:22,h:17,type:'massage',district:'c4_taiping'},
 {id:'c4_night_snacks',name:'坡子街夜宵',at:[-95,-305],angle:Math.PI,w:27,d:22,h:15,type:'snack',district:'c4_jiefang_west'},
 {id:'c4_securities',name:'湘城证券 · 五一营业部',at:[230,-913],angle:0,w:42,d:30,h:42,type:'securities',district:'c4_wuyi'},
 {id:'c4_heiwado_uniqlo',name:'平和堂 · UNIQLO 城市旗舰店',at:[20,-827],angle:-Math.PI/2,w:100,d:75,h:30,type:'clothing',district:'c4_heiwado'},
 {id:'c4_ifs_atrium',name:'长沙 IFS · 商业中庭',at:[134,-688],angle:-Math.PI/2,w:148,d:100,h:48,type:'ifs',district:'c4_ifs'},
 {id:'c4_ifs_parking',name:'IFS · B1 停车 / 后勤',at:[343,-735],angle:Math.PI/2,w:16,d:22,h:8,type:'parking',district:'c4_ifs'}
];
export const undergroundEntrances=[{id:'c4_underground_hx',at:[39,-357],name:'地下商业街 · 黄兴广场口',end:'hx'},{id:'c4_underground_wuyi',at:[-100,-855],name:'地下商业街 · 五一广场口',end:'wuyi'}];
export const ROOM_IDS=[...facilities.map(s=>s.id),'c4_underground',...STORY_ROOMS];
export function densityAt(x,z,night){if(z>305)return night?8:18;if(z>120)return night?16:26;if(x< -100&&z< -290&&z> -840)return night?40:16;return z< -790||Math.abs(z+350)<110?36:32;}
export function project(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return {x:a[0]+dx*t,z:a[1]+dz*t,t,d:Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};}
