export const MISSION_COLOR='#68cfff';
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
// Resolve the next actionable destination, including portals, without changing manual map selection.
export function resolveMissionNavigation(rt){
 const o=rt.manager?.objective,record=rt.manager?.record,current=rt.area(),pos=rt.position(),rooms=rt.api.interiors;
 if(!o||record.status!=='active'||rt.api.get().dead)return null;
 const p=record.progress,t=rt.target(o);let points=t.at?[t.at]:[],area=t.area,label=o.speaker&&o.speaker!=='豚师'?'任务目标 · '+o.speaker:'当前任务目标';
 if(o.type==='wait'||o.type==='attack')return null;
 if(o.type==='area'){
  if(o.area===current)return null;
  if(o.area==='outside'){points=[rooms[current]?.exit].filter(Boolean);area=current;label='出门回到街头';}
  else{points=[rooms[o.area]?.entry].filter(Boolean);area='outside';label='进入 '+(rooms[o.area]?.name||o.area);}
 }
 if(o.type==='drive'||(['intercept','chase','cargo'].includes(o.type)&&!rt.api.get().driving)){const car=rt.api.ride.g.position;points=[[car.x,car.z]];area='outside';label='上黄色车';}
 else if(['chase','follow','intercept'].includes(o.type)){const actor=o.type==='follow'?rt.world.follow:rt.world.car;points=[[actor.g.position.x,actor.g.position.z]];area=o.area||'outside';label=o.type==='follow'?'跟踪调度员':'拦截目标车辆';}
 else if(o.type==='defend'){const sites=o.sites.filter(s=>!p.done?.includes(s.id));points=rt.activeSite?[rt.activeSite.at]:sites.map(s=>s.at);area='outside';label=rt.activeSite?'救援 · '+rt.activeSite.name:'就近救援点 · 可自行改顺序';}
 else if(o.type==='escort'){const ally=rt.actions.escort,at=ally?[ally.g.position.x,ally.g.position.z]:o.at;if(!p.spawned||current!==(o.area||'outside')||distance(pos,at)>28){points=[at];label='接应 '+o.speaker;}else{points=[o.destination];label='护送 '+o.speaker+' 到出口';}area=o.area||'outside';}
 else if(o.type==='fight'&&p.spawned){points=rt.world.enemies.filter(e=>e.hp>0).map(e=>[e.g.position.x,e.g.position.z]);label='当前交战目标';}
 else{const extra=rt.actions.points(o,p);if(extra){points=extra;area=o.area||'outside';}if(o.type==='cargo')label='把旧物送回家';if(o.type==='operation')label='任务设备';if(o.type==='demolish')label='RY 的临时调度点';}
 if(!points.length)return null;
 // An interior destination first leads to its street entrance; leaving a room leads to its usable exit.
 if(area!==current){if(current!=='outside'){const room=rooms[current];if(!room)return null;const exterior=area==='outside'?points[0]:rooms[area]?.entry;const exit=exterior?room.exits.reduce((a,b)=>distance(a.out,exterior)<distance(b.out,exterior)?a:b):room.exits[0];points=[exit.at];label=exit.name;area=current;}
 else{const room=rooms[area];if(!room)return null;points=[room.entry];label='进入 '+room.name;area='outside';}}
 points=[...points].sort((a,b)=>distance(pos,a)-distance(pos,b));const at=points[0];return{points,area,at,label,meters:Math.round(distance(pos,at)/(current==='outside'?.65:1))};
}
