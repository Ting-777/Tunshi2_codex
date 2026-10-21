import {SAVE_LAYOUTS,REGION_IDS,ROOM_IDS} from './save-layout.js';

export const MAX_SAVE_BYTES=512*1024;
export const TRANSFER_ALPHABET='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export function normalizeTransferCode(value){return String(value??'').normalize('NFKC').toUpperCase().replace(/[\s-]/g,'').replace(/O/g,'0').replace(/[IL]/g,'1');}
export function validTransferCode(value){return value.length===8&&[...value].every(c=>TRANSFER_ALPHABET.includes(c));}
export function formatTransferCode(value){const code=normalizeTransferCode(value);return code.slice(0,4)+'-'+code.slice(4);}

const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const strings=value=>Array.isArray(value)&&value.every(v=>typeof v==='string');
const vector=(value,size=3)=>Array.isArray(value)&&value.length===size&&value.every(n=>Number.isFinite(n)&&Math.abs(n)<100000);
const regionIds=REGION_IDS;
const roomIds=ROOM_IDS;
const assertSave=(ok,message)=>{if(!ok)throw new Error(message||'存档数据不完整，无法迁移。');};
const optionalObject=(value,message)=>assertSave(value==null||object(value),message);

function validateEscort(p,checkpoint=false){
 const index=n=>Number.isInteger(n)&&n>=0&&n<=11;
 if(p.escortHP!=null)assertSave(Number.isFinite(p.escortHP)&&p.escortHP>=0&&p.escortHP<=140);
 if(p.escortHurtCooldown!=null)assertSave(Number.isFinite(p.escortHurtCooldown)&&p.escortHurtCooldown>=0&&p.escortHurtCooldown<=1.25);
 if(p.escortWaveRevision!=null)assertSave(p.escortWaveRevision===1);
 if(p.escortSupport!=null){const s=p.escortSupport;assertSave(object(s)&&['idle','punch'].includes(s.phase)&&Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=.64&&Number.isFinite(s.cooldown)&&s.cooldown>=0&&s.cooldown<=2.6&&(s.target===null||Number.isInteger(s.target)&&s.target>=0&&s.target<8)&&Number.isFinite(s.heading)&&Math.abs(s.heading)<=Math.PI&&typeof s.struck==='boolean');}
 if(p.activeWave!=null)assertSave(index(p.activeWave));
 if(p.ambushes!=null)assertSave(Array.isArray(p.ambushes)&&p.ambushes.length<=11&&p.ambushes.every(n=>index(n)&&n>0)&&new Set(p.ambushes).size===p.ambushes.length);
 if(checkpoint){
  assertSave(object(p)&&(p.branch==null||p.branch==='west')&&index(p.pathIndex)&&index(p.escortIndex)&&vector(p.escortAt,2)&&Array.isArray(p.ambushes));
  assertSave(Array.isArray(p.enemies)&&p.enemies.length<=8&&p.enemies.every(e=>object(e)&&vector(e.at,2)&&Number.isFinite(e.hp)&&e.hp>=0&&e.hp<=500&&['brawler','charger','guard','heavy','foreman','caller','thrower'].includes(e.role)));
 }
}

function validateLeisure(l){
 const stockIds=['river_drinks','star_leisure','lushan_digital','hedong_retail','neon_mobility'],types=['karaoke','rhythm','race','claw','breaker','mahjong','poker','billiards','massage'];
 const integer=(n,max=1000000000)=>Number.isInteger(n)&&n>=0&&n<=max,positive=n=>Number.isFinite(n)&&n>=0;
 assertSave(object(l)&&l.version===1&&positive(l.clock)&&integer(l.rounds));
 if(l.account!=null)assertSave(object(l.account)&&typeof l.account.opened==='boolean'&&positive(l.account.openedAt));
 for(const key of['visits','friends','highScores','holdings','buffs','forum','market'])assertSave(object(l[key]));
 assertSave(positive(l.buffs.regenUntil)&&positive(l.buffs.relaxedUntil));
 assertSave(strings(l.forum.read)&&l.forum.read.length<=20&&object(l.forum.replies)&&Number.isFinite(l.forum.lastReply)&&Number.isInteger(l.forum.checkinDay));
 assertSave(Array.isArray(l.trades)&&l.trades.length<=30&&l.trades.every(t=>object(t)&&stockIds.includes(t.stock)&&['buy','sell'].includes(t.side)&&integer(t.qty,10000)&&t.qty>0&&positive(t.price)&&positive(t.at)));
 assertSave(Array.isArray(l.prizes)&&l.prizes.length<=50&&l.prizes.every(p=>p.id==='crowned_dolphin'&&positive(p.at)));
 assertSave(integer(l.market.period)&&object(l.market.prices)&&object(l.market.history)&&typeof l.market.event==='string');
 for(const id of stockIds){assertSave(positive(l.market.prices[id])&&l.market.prices[id]>0&&Array.isArray(l.market.history[id])&&l.market.history[id].length>=1&&l.market.history[id].length<=30&&l.market.history[id].every(n=>positive(n)&&n>0));}
 if(l.market.clock!=null)assertSave(positive(l.market.clock));
 if(l.market.quote!=null)assertSave(integer(l.market.quote));
 if(l.market.model!=null){
  const m=l.market.model,v=n=>Number.isFinite(n)&&n>=1e-7&&n<=.0025;
  assertSave(object(m)&&m.version===1&&Array.isArray(m.rng)&&m.rng.length===4&&m.rng.every(n=>integer(n,4294967295))&&v(m.variance)&&integer(m.newsIn,480));
  assertSave(object(m.regime)&&integer(m.regime.remaining,180)&&Number.isFinite(m.regime.volatility)&&m.regime.volatility>=.55&&m.regime.volatility<=2.45&&Number.isFinite(m.regime.drift)&&Math.abs(m.regime.drift)<=.0008);
  assertSave(object(m.companies)&&Object.keys(m.companies).length===stockIds.length&&stockIds.every(id=>object(m.companies[id])&&v(m.companies[id].variance)));
 }
 const multiplier=n=>Number.isFinite(n)&&n>=.01&&n<=100;
 if(l.market.valuations!=null)assertSave(object(l.market.valuations)&&Object.keys(l.market.valuations).length===stockIds.length&&stockIds.every(id=>multiplier(l.market.valuations[id])));
 if(l.market.events!=null){
  assertSave(Array.isArray(l.market.events)&&l.market.events.length<=128&&new Set(l.market.events.map(e=>e?.id)).size===l.market.events.length);
  for(const e of l.market.events){assertSave(object(e)&&typeof e.id==='string'&&e.id.length>0&&e.id.length<=80&&typeof e.label==='string'&&e.label.length>0&&e.label.length<=200&&positive(e.at)&&object(e.changes)&&Object.keys(e.changes).length>0);
   for(const [id,v]of Object.entries(e.changes))assertSave(stockIds.includes(id)&&object(v)&&multiplier(v.valuationMultiplier)&&multiplier(v.priceMultiplier));
  }
 }
 for(const [id,v]of Object.entries(l.holdings))assertSave(stockIds.includes(id)&&object(v)&&integer(v.qty,10000)&&positive(v.cost));
 for(const [id,v]of Object.entries(l.highScores))assertSave(types.includes(id)&&object(v)&&positive(v.score)&&integer(v.plays)&&Number.isFinite(v.earned));
 for(const [id,n]of Object.entries(l.visits))assertSave(roomIds.includes(id)&&integer(n));
 for(const v of Object.values(l.friends))assertSave(object(v)&&integer(v.level)&&Number.isFinite(v.last));
 const a=l.activeRound;if(a==null)return;assertSave(object(a)&&types.includes(a.type)&&roomIds.includes(a.room)&&a.room.startsWith('c4_')&&positive(a.paid)&&positive(a.time)&&positive(a.score)&&a.done===false);
 const tiles=t=>Array.isArray(t)&&t.every(n=>integer(n,26)),cards=t=>Array.isArray(t)&&t.every(n=>integer(n,51));
 if(['karaoke','rhythm'].includes(a.type))assertSave(Array.isArray(a.notes)&&a.notes.length===32&&a.notes.every(n=>object(n)&&positive(n.at)&&integer(n.lane,3)&&typeof n.judged==='boolean'&&typeof n.hit==='boolean')&&integer(a.hits,32)&&integer(a.combo,32)&&integer(a.bestCombo,32)&&integer(a.track,2)&&positive(a.bpm)&&positive(a.duration));
 if(a.type==='karaoke'&&(a.songId!=null||a.audioVersion!=null))assertSave(a.audioVersion===1&&a.songId===['chui-feng','lan-nao-ke-er','nian-tun-shi'][a.track]);
 if(a.type==='mahjong'){assertSave(tiles(a.hand)&&a.hand.length===8&&tiles(a.wall)&&tiles(a.discards)&&integer(a.draws,12)&&a.discards.length===a.draws&&a.maxDraws===12);const all=[...a.hand,...a.wall,...a.discards];assertSave(all.length===108&&Array.from({length:27},(_,i)=>all.filter(t=>t===i).length).every(n=>n===4));}
 if(a.type==='poker')assertSave(cards(a.hand)&&a.hand.length===2&&cards(a.opponent)&&a.opponent.length===2&&cards(a.community)&&a.community.length===5&&new Set([...a.hand,...a.opponent,...a.community]).size===9&&integer(a.street,2)&&a.shown===a.street+3&&positive(a.pot)&&[0,5].includes(a.toCall)&&Array.isArray(a.aiBets)&&a.aiBets.length===3&&a.aiBets.every(v=>typeof v==='boolean'));
 if(a.type==='race')assertSave(positive(a.x)&&positive(a.distance)&&positive(a.stun)&&integer(a.crashes,24)&&Array.isArray(a.obstacles)&&a.obstacles.length===24&&a.obstacles.every(o=>positive(o.at)&&positive(o.lane)&&typeof o.passed==='boolean')&&positive(a.duration));
 if(a.type==='claw')assertSave(positive(a.x)&&positive(a.y)&&positive(a.drop)&&['aim','drop'].includes(a.phase)&&Array.isArray(a.toys)&&a.toys.length===8&&a.toys.every(t=>positive(t.x)&&positive(t.y)&&integer(t.color,2))&&a.caught===-1&&positive(a.duration));
 if(a.type==='breaker')assertSave(positive(a.paddle)&&object(a.ball)&&['x','y','vx','vy'].every(k=>Number.isFinite(a.ball[k]))&&integer(a.lives,3)&&Array.isArray(a.blocks)&&a.blocks.length===24&&a.blocks.every(b=>positive(b.x)&&positive(b.y)&&typeof b.alive==='boolean')&&typeof a.launched==='boolean'&&positive(a.duration));
 if(a.type==='billiards')assertSave(integer(a.shots,8)&&a.maxShots===8&&Number.isFinite(a.angle)&&a.power>=.15&&a.power<=1&&typeof a.moving==='boolean'&&Array.isArray(a.balls)&&a.balls.length===7&&a.balls.every(b=>object(b)&&['x','y','vx','vy'].every(k=>Number.isFinite(b[k]))&&typeof b.pocket==='boolean'&&typeof b.cue==='boolean'));
 if(a.type==='massage')assertSave(a.duration===5&&['foot','body'].includes(a.service)&&[45,100].includes(a.heal));
}

// Validate the existing v1 document at the network boundary. Never strip progress fields.
export function validateSaveDocument(save){
 assertSave(object(save)&&save.version===1,'此存档版本暂不支持迁移，请更新游戏页面后重试。');
 let nodes=0;
 function walk(value,depth=0){
  assertSave(++nodes<=80000&&depth<=48,'存档内容过大或结构异常。');
  if(typeof value==='number')assertSave(Number.isFinite(value));
  if(typeof value==='string')assertSave(value.length<=30000,'存档文字过长。');
  if(value&&typeof value==='object')for(const [key,item]of Object.entries(value)){
   assertSave(!['__proto__','constructor','prototype'].includes(key),'存档结构异常。');walk(item,depth+1);
  }
 }
 walk(save);
 assertSave(Number.isFinite(save.savedAt)&&save.savedAt>0);
 function chapter(state,index){
  assertSave(object(state)&&object(state.chapterState)&&object(state.missions)&&object(state.world));
  assertSave(Number.isInteger(state.chapterState['chapter'+(index+1)])&&state.chapterState['chapter'+(index+1)]>=0&&state.chapterState['chapter'+(index+1)]<=[7,10,4,7][index]);
  assertSave(Number.isFinite(state.gangMoney)&&state.gangMoney>=0);
  for(const key of ['unlockedContacts','unlockedVehicles','unlockedLocations'])assertSave(strings(state[key]));
  assertSave(typeof state.chapterComplete==='boolean');
  for(const [id,record]of Object.entries(state.missions)){
   const layout=SAVE_LAYOUTS[index][id];assertSave(layout&&object(record)&&['active','completed','failed'].includes(record.status));
   assertSave(Number.isInteger(record.currentObjective)&&record.currentObjective>=0&&object(record.progress));
   if(index||state.revision===3)assertSave(record.currentObjective<layout.length||(record.status==='completed'&&record.currentObjective===layout.length),'任务进度与当前游戏版本不匹配。');
   if(record.checkpoint){const c=record.checkpoint;assertSave(object(c)&&vector(c.position)&&vector(c.ride));assertSave(!c.interior||roomIds.includes(c.interior));assertSave(!c.region||regionIds.includes(c.region));}
   for(const key of ['items','done','doneActions','topics'])if(record.progress[key]!=null)assertSave(strings(record.progress[key]));
   for(const key of ['enemies','guards'])if(record.progress[key]!=null)assertSave(Array.isArray(record.progress[key])&&record.progress[key].every(e=>object(e)&&Number.isFinite(e.hp)&&vector(e.at,2)));
   for(const key of ['actorAt','carAt','escortAt','scanStart'])if(record.progress[key]!=null)assertSave(vector(record.progress[key],2));
   if(index===3&&record.progress.enemies!=null)assertSave(record.progress.enemies.length<=8,'第四章场景敌人数量异常。');
   if(index===3){validateEscort(record.progress);if(record.progress.gateTime!=null)assertSave(Number.isFinite(record.progress.gateTime)&&record.progress.gateTime>=0&&record.progress.gateTime<=30);if(record.progress.gateUsed!=null)assertSave(typeof record.progress.gateUsed==='boolean');}
   if(record.progress.pursuer!=null)assertSave(object(record.progress.pursuer)&&Number.isFinite(record.progress.pursuer.hp)&&vector(record.progress.pursuer.at,2));
   if(record.progress.scan!=null)assertSave(Number.isInteger(record.progress.scan)&&record.progress.scan>=0&&record.progress.scan<=2&&vector(record.progress.scanStart,2));
   if(record.progress.scanned!=null)assertSave(Array.isArray(record.progress.scanned)&&record.progress.scanned.every(n=>Number.isInteger(n)&&n>=0&&n<=2));
   if(record.progress.wave!=null)assertSave(Number.isInteger(record.progress.wave)&&record.progress.wave>=0&&record.progress.wave<(index===3?4:3));
   if(index===1&&record.progress.held)assertSave(['old-ledger','old-photo','wall-photo'].includes(record.progress.held));
  }
  if(state.currentMission!=null)assertSave(typeof state.currentMission==='string'&&SAVE_LAYOUTS[index][state.currentMission]&&state.missions[state.currentMission]?.status!=='completed'&&object(state.missions[state.currentMission]));
  for(const key of ['nodes','damage','clues','demolition','garagePower'])optionalObject(state.world[key]);
  if(state.world.rescued!=null)assertSave(strings(state.world.rescued));
  if(state.world.residual!=null)assertSave(Array.isArray(state.world.residual)&&state.world.residual.every(e=>object(e)&&Number.isFinite(e.hp)&&vector(e.at,2)));
  if(state.world.recoveredAt!=null)assertSave(vector(state.world.recoveredAt,2));
  if(index===3&&state.world.escortCheckpoint!=null)validateEscort(state.world.escortCheckpoint,true);
  if(index===3&&state.world.escortSquareHP!=null)assertSave(Number.isFinite(state.world.escortSquareHP)&&state.world.escortSquareHP>0&&state.world.escortSquareHP<=140);
  if(index===3){const w=state.world;if(w.boots!=null)assertSave(typeof w.boots==='boolean');if(w.screenStage!=null)assertSave(['ads','dolphin','public','hijack'].includes(w.screenStage));if(w.dialogueActors!=null)assertSave(Array.isArray(w.dialogueActors)&&w.dialogueActors.length<=12&&w.dialogueActors.every(a=>object(a)&&typeof a.name==='string'&&a.name.length<=80&&vector(a.at,2)&&(a.area==='outside'||roomIds.includes(a.area))));if(w.pressure!=null){const p=w.pressure;assertSave(object(p)&&Number.isInteger(p.seed)&&p.seed>=0&&p.seed<=4294967295&&Number.isFinite(p.cooldown)&&p.cooldown>=0&&Number.isFinite(p.escaped)&&p.escaped>=0&&Number.isInteger(p.encounters)&&p.encounters>=0&&p.encounters<=1000000&&Array.isArray(p.enemies)&&p.enemies.length<=3&&p.enemies.every(e=>object(e)&&vector(e.at,2)&&Number.isFinite(e.hp)&&['brawler','charger','thrower'].includes(e.role)));}assertSave(Number.isFinite(w.time)&&w.time>=0&&w.time<1440&&Number.isFinite(w.cycleElapsed)&&w.cycleElapsed>=0&&w.cycleElapsed<600&&typeof w.cycleNight==='boolean'&&strings(w.events)&&w.events.length<=16&&new Set(w.events).size===w.events.length);for(const key of ['opened','spentWeapons','pathCheckpoints','pathBranches'])optionalObject(w[key]);if(w.cycleTime!=null)assertSave(Number.isFinite(w.cycleTime)&&w.cycleTime>=0&&w.cycleTime<1440);if(w.completionPending!=null)assertSave(typeof w.completionPending==='boolean');}
 }
 chapter(save.story,0);if(save.story.chapter2!=null)chapter(save.story.chapter2,1);if(save.story.chapter3!=null)chapter(save.story.chapter3,2);if(save.story.chapter4!=null)chapter(save.story.chapter4,3);
 if(save.story.dialogue!=null){
  const d=save.story.dialogue;assertSave(object(d)&&strings(d.seen)&&Array.isArray(d.queue)&&Array.isArray(d.history));
  for(const line of [...d.queue,...d.history])assertSave(object(line)&&typeof line.speaker==='string'&&typeof line.text==='string'&&typeof line.channel==='string');
 }
 const g=save.game;assertSave(object(g)&&vector(g.position)&&Number.isFinite(g.health)&&g.health>=0&&g.health<=100&&Number.isFinite(g.money)&&g.money>=0);
 assertSave(!g.interior||roomIds.includes(g.interior),'存档中的室内场景当前不可用。');
 if(g.lastSafe!=null)assertSave(vector(g.lastSafe));
 if(g.regions){assertSave(object(g.regions)&&regionIds.includes(g.regions.id)&&regionIds.includes(g.regions.carRegion)&&strings(g.regions.visited)&&g.regions.visited.every(id=>regionIds.includes(id)));optionalObject(g.regions.props);}
 const car=c=>{assertSave(object(c)&&vector(c.position)&&Number.isFinite(c.hp)&&Number.isFinite(c.angle));assertSave(!c.region||regionIds.includes(c.region));assertSave(!c.homeRegion||regionIds.includes(c.homeRegion));assertSave(!c.parkedInterior||roomIds.includes(c.parkedInterior));if(c.populationKey!=null)assertSave(typeof c.populationKey==='string');if(c.streetRoute!=null)assertSave(Array.isArray(c.streetRoute)&&c.streetRoute.every(p=>vector(p,2)));};
 if(g.rideState!=null)car(g.rideState);
 if(g.cars!=null){assertSave(Array.isArray(g.cars));g.cars.forEach(car);}
 if(g.pedestrianLoot!=null){const loot=g.pedestrianLoot;assertSave(object(loot));optionalObject(loot.cooldowns);assertSave(Array.isArray(loot.drops)&&loot.drops.every(d=>object(d)&&vector(d.at,2)&&Number.isFinite(d.amount)&&regionIds.includes(d.region)));}
 optionalObject(g.streetLife);optionalObject(g.streetLife?.inventory);optionalObject(g.characterMotion);
 if(g.streetLife?.milkIcePurchased!=null)assertSave(typeof g.streetLife.milkIcePurchased==='boolean');
 if(g.cityLeisure!=null)validateLeisure(g.cityLeisure);
 if(g.characterMotion){for(const key of ['verticalSpeed','fallPeak'])if(g.characterMotion[key]!=null)assertSave(Number.isFinite(g.characterMotion[key]));if(g.characterMotion.airborne!=null)assertSave(typeof g.characterMotion.airborne==='boolean');}
 for(const key of ['bankHealth','shopHealth','yaw','pitch','driveSpeed','recoveryDelay'])if(g[key]!=null)assertSave(Number.isFinite(g[key]));
 assertSave(new TextEncoder().encode(JSON.stringify(save)).byteLength<=MAX_SAVE_BYTES,'存档超过迁移大小上限。');
 return save;
}
