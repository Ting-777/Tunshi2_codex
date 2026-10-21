import {D} from './dialogues.js';
export const GARAGE='villa_garage',GROUND='villa_ground',UPPER='villa_upper',STUDY='villa_study';
export const ROOMS=[GARAGE,GROUND,UPPER,STUDY];
const goal=(id,type,text,at,more={})=>({id,type,text,at,area:'outside',...more});
export const CHAPTER3=[
 {id:'c301',title:'此路不通',description:'仙人要见第二章找到的旧文件。通往梅溪湖的路却被同一批车辆封住：先查明封路的人，再把车留在东麓，从书院旁进山。',stage:0,prerequisites:[],dialogues:D.invitation,onStart:{roadsClosed:true},objectives:[
  goal('c301-arrive','arrive','开车进入岳麓山东侧，靠近梅溪湖连接路',[620,-269],{vehicle:true,radius:25}),
  goal('c301-check','inspect','下车打退调度台的拦路者，再 E 查验调度单',[565,-275],{prop:'dispatch',introLines:D.checkpoint,dialogues:D.blockade}),
  goal('c301-park','park','步行到达东麓停车区目标位置',[639,185],{radius:12,dialogues:D.park}),
  goal('c301-foot','arrive','车辆留在停车场，打通书院园路上的拦截',[686,290],{onFoot:true,radius:10})
 ],worldStateChanges:{mountainStarted:true},rewards:{unlockedLocations:['yuelu_academy','aiwan_pavilion','lushan_temple']}},
 {id:'c302',title:'山那边',description:'翻越岳麓山。盘山路稳，石阶捷径快；认清真实的台阶、侧门和护栏，登顶看见梅溪湖，再从西侧下山。',stage:1,prerequisites:['c301'],dialogues:[],objectives:[
  goal('c302-map','inspect','查看书院院门旁的山路图',[708,299],{prop:'trail-map',dialogues:D.route}),
  goal('c302-climb','climb','打通爱晚亭与麓山寺前的拦截：盘山路 / 长台阶任选',[430,165],{minHeight:77,radius:18}),
  goal('c302-view','view','打通山顶，F 拆通信箱阻止增援，再 E 使用望远镜',[245,91],{prop:'viewfinder',minHeight:143,dialogues:D.summit}),
  goal('c302-west','arrive','沿西麓山路或林间短阶下山，别跳落陡坡',[43,8],{onFoot:true,radius:12,dialogues:D.descent})
 ],worldStateChanges:{mountainCrossed:true},rewards:{unlockedLocations:['meixi_arts','festival_island','meixi_city_island']}},
 {id:'c303',title:'梅溪湖是谁的',description:'在艺术中心辨认JC。文件被尾随者抢走后，利用湖岸和木桥截回，再保护 JC到城市岛完成核验。这里的生意认的是关系，不是帮派旗号。',stage:2,prerequisites:['c302'],dialogues:D.lakeStart,objectives:[
  goal('c303-contact','contact','到艺术中心湖侧廊下，找带蓝色文件包的人',[-160,-176],{dialogues:D.contact}),
  goal('c303-recover','recover','截住抢文件的人：切湖岸近路，或到木桥堵他',[-395,7],{dialogues:D.recovered}),
  goal('c303-escort','escort','护送 JC 到城市岛桥头：步行湖岸，或借车走西岸路',[-652,203],{radius:8,dialogues:D.dock}),
  goal('c303-dock','dock','保护 JC 核验文件；桥头检修门能阻挡增援',[-618,203],{seconds:24,dialogues:D.evidence})
 ],worldStateChanges:{villaAccess:true,filesReturned:true},rewards:{personalMoney:400,unlockedContacts:['JC','仙人'],unlockedLocations:['xianren_villa']}},
 {id:'c304',title:'仙人府',description:'仙人在别墅最里面。准备好补给再进去，打通前院、车库、冬庭、主厅、厨房、内院和二楼；用他的豪车撞穿封死的冬庭门，最后去书房问清当年的钱。',stage:3,prerequisites:['c303'],dialogues:D.villaStart,objectives:[
  goal('c304-ready','commit','在前院入口确认进入；可先补给，进入后从分段检查点重试',[-747,93],{prop:'villa-bell',dialogues:D.commit}),
  goal('c304-yard','battle','打通前院，进入西侧地下车库坡道',[-747,112],{encounter:'yard',dialogues:D.garage}),
  goal('c304-garage','battle','地下车库：利用立柱隔开敌人，打通车道',[4000,20],{area:GARAGE,encounter:'garage',dialogues:D.ram}),
  goal('c304-ram','ram','上仙人的豪车，从南侧加速撞穿冬庭玻璃门',[4000,-10],{area:GARAGE,dialogues:D.crashed}),
  goal('c304-hall','battle','下车进主厅：Q 拿家具，再 Q 砸人；E 卸扣可放下吊灯',[4195,20],{area:GROUND,encounter:'hall'}),
  goal('c304-kitchen','battle','穿过餐厅和厨房：红色冲洗阀可冲散敌人',[4222,-12],{area:GROUND,encounter:'kitchen',introLines:D.kitchen}),
  goal('c304-court','battle','内院：避开两侧冲锋与增援，打通楼梯廊门',[4184,-24],{area:GROUND,encounter:'court'}),
  goal('c304-stairs','stairs','沿真实楼梯上二层，进入书房前走廊',[4400,-12],{area:UPPER,minHeight:6.8,introLines:D.upper}),
  goal('c304-keeper','battle','击倒书房门前的守卫领队，留意蓄力与反击',[4400,-22],{area:UPPER,encounter:'keeper'}),
  goal('c304-tea','tea','推门进入书房，与喝茶的仙人谈旧账',[4600,-4],{area:STUDY,noAttack:true,dialogues:D.tea}),
  goal('c304-leave','leave','从书房侧廊离开，带走资料；别墅损坏会保留',[-751,130],{dialogues:D.farewell})
 ],worldStateChanges:{roadsClosed:false,villaCleared:true,chapter4Lead:'牢东杰',nextDistrict:'南门口—黄兴广场—五一广场'},rewards:{unlockedLocations:['chapter4_exit']},completion:D.after,final:true}
];
export function newThirdState(){return{revision:1,chapterState:{chapter3:0},missions:{},currentMission:null,gangMoney:0,unlockedContacts:['听歌','攀哥','老鱼','炫神'],unlockedVehicles:[],unlockedLocations:['yuelu_east_parking'],world:{roadsClosed:false,mountainStarted:false,mountainCrossed:false,villaAccess:false,villaCommitted:false,villaCleared:false,damage:{},opened:{bridgeGate:true},usedMedicine:[],spentWeapons:{},heat:20,heatCapacity:100},chapterComplete:false};}
