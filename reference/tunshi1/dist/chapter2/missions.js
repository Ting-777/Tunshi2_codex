import {conversations as D} from './dialogues.js';
export const SHOP='interior_old_shop',GARAGE='interior_old_garage',HOME='interior_old_home',OFFICE='interior_finance_office',B1='interior_commercial_b1',MALL='interior_capitaland';
const objective=(id,type,text,extra={})=>({id,type,text,...extra});
const mission=(n,title,description,objectives,extra={})=>({id:'c20'+n,title,description,stage:n,prerequisites:n>1?['c20'+(n-1)]:[],objectives,dialogues:D['c20'+n].start,completion:D['c20'+n].end,...extra});
export const CHAPTER2=[
 mission(1,'旧锁','从北辰过桥回观沙岭，找出旧店为什么被翻过。',[
  objective('c201-cross','cross','自己开车经银盆岭大桥，抵达旧店附近',{at:[-547,-125],radius:26}),
  objective('c201-alley','investigate','正门换了锁 · 绕后巷看侧窗、电箱和旧板入口',{area:'outside',items:['window','outside-power','side-entry'],at:[-529,-154]}),
  objective('c201-shop','investigate','恢复店内配电，再检查柜子、旧照片和账本',{area:SHOP,items:['shop-power','shop-drawer','old-photo','old-ledger'],at:[2550,0]})
 ],{worldStateChanges:{shopOpen:true},rewards:{unlockedLocations:[SHOP],unlockedContacts:['仙人','章鱼']}}),
 mission(2,'这里谁说了算','御园门口三件事：挪车、追货、让人停止闹事。',[
  objective('c202-park','parking','把堵车库的车挪出入口，然后下车',{at:[-680,-175]}),
  objective('c202-run','runner','截住拿货者，再抱货回店 · 追兵可打可甩，矮栏可跳',{at:[-615,-143],route:[[-615,-143],[-600,-152],[-600,-205],[-626,-205],[-633,-225]],speed:3.5}),
  objective('c202-drunk','boundary','先劝离或推开醉汉，别在店门口直接动手',{at:[-585,-167]}),
  objective('c202-zhang','interact','回旧店门口帮章鱼看车',{at:[-537,-145],speaker:'章鱼'})
 ],{rewards:{}}),
 mission(3,'地下四个名字','打开地下车库两路照明，沿旧编号找到没刷过的墙。',[
  objective('c203-garage','stealth','黑灯车库取证 · 切换照明、开柜，带记录从北坡道撤离',{area:GARAGE,at:[2400,20],items:['garage-west','garage-east','locker-04','four-names']})
 ],{worldStateChanges:{garageKnown:true}}),
 mission(4,'谁还记得海豚','重新开工：修设备接单，靠做事认识旧朋友。',[
  objective('c204-topics','topics','在旧店维修台接三单 · E 开工，绿色区间 E 收手',{area:SHOP,at:[2550,0]})
 ],{worldStateChanges:{rightsKnown:true,shopBusiness:true}}),
 mission(5,'茶子山夜班','认出配送车，夺车运货，再到商业中庭核对签收底单。',[
  objective('c205-identify','identify','到茶子山停车区 · 面向车辆按 E 观察，核对文件袋与标签',{at:[85,-142]}),
  objective('c205-tail','delivery','逼停配送车，再下车夺车 · 超前堵路 / 控制撞击',{at:[85,-145]}),
  objective('c205-tail-b1','transport','夺车运货 · 摆脱追车，开进 B1 西侧卸货区',{area:B1,at:[2837,-6]}),
  objective('c205-atrium','interact','乘电梯到商业中庭，在茶湾咖啡核对交接编号',{area:MALL,at:[2674.4,0],speaker:'夜班调度',channel:'面对面',dialogues:D.events.atriumReceipt})
 ],{onStart:{night:true},worldStateChanges:{night:false}}),
 mission(6,'账不会骗人','潜入复印资料，复制邮件时躲避巡逻，再从后勤通道撤出。',[
  objective('c206-office','infiltrate','复制合同和邮件，带资料撤出 · B1 门卡 / F 破门',{area:OFFICE,at:[3000,17],items:['contract-page','email-title']})
 ],{worldStateChanges:{sourceKnown:true},rewards:{personalMoney:100}}),
 mission(7,'旧家','小朋友陪你看旧宅；装修下面藏着当年的原件。',[
  objective('c207-search','investigate','查看照片背面的藏盒记号 · 电脑、旧物可以自由看',{area:HOME,at:[2200,5],items:['old-cards'],dialogues:D.demolition}),
  objective('c207-break','demolition','顺蓝线打穿厨房隔墙，抱铁盒撤离 · 拆家具震退堵门的人',{area:HOME,at:[2193,-5.8]})
 ],{worldStateChanges:{originals:true}}),
 mission(8,'不签','守住旧店和 Dina 抱着的原件。',[
  objective('c208-ready','prepare','准备 30 秒：挪车挡口、放卷帘；在旧店按 E 提前开战',{at:[-547,-145],area:SHOP}),
  objective('c208-defend','defense','守三波不同入口，保护 Dina 的文件包',{area:SHOP,at:[2550,4],ally:'肝脏'})
 ],{worldStateChanges:{defended:true}}),
 mission(9,'四个人','四个早期成员在湘江边重聚，找回那只装着原件的包。',[
  objective('c209-meet','interact','到湘江步道见三位老朋友 · 先谈，别动手',{at:[254,-80],speaker:'章鱼',noAttack:true,dialogues:D.four}),
  objective('c209-fight','fight','四人短暂并肩，击退抢包的人',{at:[247,-92],count:6,allies:['攀哥','章鱼','RY']}),
  objective('c209-run','runner','追上拿包的人按 E 截住 · 可以提前拿包，不必跑完路线',{at:[248,-100],route:[[248,-100],[236,-112],[210,-136],[180,-145],[120,-149]],speed:4.5,carEscape:true}),
  objective('c209-car','intercept','上黄色车截停收购方车辆 · 撞击或超前堵停，不用跟着绕圈',{at:[120,-149],route:[[120,-149],[120,-120],[-30,-120],[-160,-120],[-162.5,100],[-137.5,250],[-137.5,300],[275,300]],speed:7}),
  objective('c209-files','interact','拿回原件，与 RY 结清这一笔',{at:[265,300],speaker:'RY'}),
  objective('c209-return','interact','回旧店，和仙人聊聊门上的字',{area:SHOP,at:[2550,5],speaker:'仙人'})
 ],{final:true,worldStateChanges:{returned:true,night:false}})
];
export function newSecondState(){return{revision:3,chapterState:{chapter2:0},currentMission:null,missions:{},chapterComplete:false,gangMoney:0,unlockedContacts:[],unlockedVehicles:[],unlockedLocations:[],world:{budget:null,pendingOrder:null,spentWeapons:{},heat:0,heatCapacity:100,clues:{},demolition:{},equipment:{},paidJobs:{},garagePower:{},shopBusiness:false,businessCash:0,businessClock:0,shopPower:false,doorOpen:false,night:false,shopBreach:false}};}
