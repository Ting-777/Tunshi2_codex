export const DOCK_OPENING=[[-647,203,'guard'],[-650,201,'brawler'],[-650,205,'heavy']];
const REINFORCEMENTS=[
 [[-651,202,'charger'],[-652,206,'brawler']],
 [[-651,200,'guard'],[-653,204,'heavy']],
 [[-652,203,'charger'],[-653,206,'guard']]
];
export function tickDockWaves(rt,p,dt){
 const w=rt.world;
 if(!p.spawned){w.spawn(DOCK_OPENING,p);p.arrivals=DOCK_OPENING.length;p.waveClock=0;p.nextWave=3;p.waveIndex=0;}
 p.waveClock=(p.waveClock||0)+dt;p.nextWave??=3;p.waveIndex??=0;
 if(p.waveClock<p.nextWave)return;
 p.nextWave=p.waveClock+3;
 const room=Math.max(0,9-w.enemies.filter(e=>e.enabled&&e.hp>0).length),points=REINFORCEMENTS[p.waveIndex%REINFORCEMENTS.length].slice(0,room);p.waveIndex++;
 if(points.length){w.reinforce(points,p,'outside',true);p.arrivals=(p.arrivals||DOCK_OPENING.length)+points.length;rt.api.toast('桥外又来 '+points.length+' 人 · 守住核验桌');rt.parent.save();}
}
