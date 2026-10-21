export const stocks=[{id:'river_drinks',name:'江湾饮品',base:32},{id:'star_leisure',name:'星潮文娱',base:68},{id:'lushan_digital',name:'麓山数码',base:120},{id:'hedong_retail',name:'河东商贸',base:48},{id:'neon_mobility',name:'霓虹出行',base:76}];
export const QUOTE_SECONDS=1;
const profiles=[{beta:.85,sigma:.0038},{beta:1.15,sigma:.0062},{beta:1.05,sigma:.0053},{beta:.9,sigma:.0042},{beta:1.2,sigma:.0058}];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const cents=n=>Math.round(Math.max(.01,Math.min(10000000,n))*100)/100;
const copy=v=>JSON.parse(JSON.stringify(v));
const pushHistory=(m,id,price)=>{m.history[id].push(price);if(m.history[id].length>30)m.history[id].shift();};

// One continuous sfc32 stream per market, never reseeded from a quote number.
// The full stream and volatility state travel with the save document.
function uniform(model){
 const [a,b,c,d]=model.rng,t=(a+b+d)|0;
 model.rng[0]=(b^(b>>>9))>>>0;model.rng[1]=(c+(c<<3))>>>0;
 model.rng[2]=(((c<<21)|(c>>>11))+t)>>>0;model.rng[3]=(d+1)>>>0;
 return ((t>>>0)+.5)/4294967296;
}
const normal=model=>Math.sqrt(-2*Math.log(uniform(model)))*Math.cos(2*Math.PI*uniform(model));
function freshSeed(){
 if(globalThis.crypto?.getRandomValues)return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
 return (Math.floor(Math.random()*4294967296)^Date.now())>>>0;
}
function regime(model){
 return {remaining:30+Math.floor(uniform(model)*151),volatility:.55+uniform(model)*1.9,drift:clamp(normal(model)*.00022,-.0008,.0008)};
}
const nextNews=model=>Math.min(480,20+Math.floor(-Math.log(uniform(model))*80));
function createModel(seed){
 let x=seed>>>0;const rng=Array.from({length:4},()=>{x=(x+0x9e3779b9)>>>0;let z=x;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return (z^(z>>>15))>>>0;});
 const model={version:1,rng,variance:.0032**2,regime:null,newsIn:0,companies:Object.fromEntries(stocks.map((s,i)=>[s.id,{variance:profiles[i].sigma**2}]))};
 for(let i=0;i<16;i++)uniform(model);
 model.regime=regime(model);model.newsIn=nextNews(model);return model;
}
function legacySeed(m){
 // Migrating/reopening the same old save must not offer a fresh future draw.
 const value=JSON.stringify([m.clock,m.quote,m.period,m.prices,m.history,m.valuations,m.events]);let hash=2166136261;
 for(let i=0;i<value.length;i++)hash=Math.imul(hash^value.charCodeAt(i),16777619);
 return hash>>>0;
}
function emptyMarket(){
 return {clock:0,quote:0,period:0,prices:Object.fromEntries(stocks.map(s=>[s.id,s.base])),history:Object.fromEntries(stocks.map(s=>[s.id,[s.base]])),valuations:Object.fromEntries(stocks.map(s=>[s.id,1])),events:[],event:'五一商圈开市 · 欢迎查看行情'};
}
export function createMarket(seed=freshSeed()){return {...emptyMarket(),model:createModel(seed)};}

export function restoreMarket(saved,legacyClock=0){
 const m={...emptyMarket(),...copy(saved||{})};
 // Old prices, holdings and news survive; no historical ticks are replayed.
 m.clock=saved?.clock??legacyClock;m.quote=saved?.quote??Math.floor(m.clock/QUOTE_SECONDS);
 m.valuations={...emptyMarket().valuations,...m.valuations};
 m.events=copy(saved?.events??[]);
 m.model=saved?.model?copy(saved.model):createModel(legacySeed(m));
 return m;
}

export function advanceMarket(m,dt,chapterProgress=0){
 if(!Number.isFinite(dt)||dt<=0)return false;
 m.model??=createModel(legacySeed(m));
 m.clock+=dt;const quote=Math.floor((m.clock+1e-7)/QUOTE_SECONDS);let changed=false;
 while(m.quote<quote){
  m.quote++;changed=true;const model=m.model;
  if(--model.regime.remaining<=0)model.regime=regime(model);
  // Irregular company/common news jumps. Neither direction nor company rotates.
  let company=-1,jump=0,commonJump=0;
  if(--model.newsIn<=0){
   const positive=uniform(model)<.5;
   if(uniform(model)<.75){company=Math.floor(uniform(model)*stocks.length);jump=(positive?1:-1)*(.025+uniform(model)*.055);m.event=stocks[company].name+(positive?' · 新订单提振预期':' · 经营调整引发观望');}
   else{commonJump=(positive?1:-1)*(.012+uniform(model)*.028);m.event=positive?'五一商圈 · 客流回暖，交易活跃':'五一商圈 · 资金观望，市场承压';}
   m.period++;model.newsIn=nextNews(model);
  }
  const base=.0032*model.regime.volatility,commonShock=Math.sqrt(model.variance)*normal(model)+commonJump;
  const common=commonShock+model.regime.drift;
  // GARCH-style shock memory produces quiet stretches and clustered turbulence.
  model.variance=clamp(.05*base*base+.10*commonShock*commonShock+.85*model.variance,1e-7,.0025);
  for(let i=0;i<stocks.length;i++){
   const s=stocks[i],last=m.prices[s.id],fair=s.base*m.valuations[s.id]*(1+chapterProgress*.025);
   const profile=profiles[i],asset=model.companies[s.id],sigma=profile.sigma*model.regime.volatility;
   const shock=Math.sqrt(asset.variance)*normal(model)+(i===company?jump:0);
   const pull=clamp(Math.log(fair/last)*.00035,-.001,.001);
   // Log returns keep prices positive; the weak valuation anchor respects story
   // repricing rather than rapidly erasing it. A safety cap bounds rare extremes.
   const change=clamp(profile.beta*common+shock+pull,-.16,.16);
   asset.variance=clamp(.05*sigma*sigma+.10*shock*shock+.85*asset.variance,1e-7,.0025);
   m.prices[s.id]=cents(last*Math.exp(change));pushHistory(m,s.id,m.prices[s.id]);
  }
 }
 return changed;
}

// Story callers supply a stable event ID. Validate all changes before applying
// any; repeat IDs cannot change prices a second time after retry/save transfer.
export function applyMarketEvent(m,event){
 if(!event||typeof event.id!=='string'||!event.id.length||event.id.length>80||typeof event.label!=='string'||!event.label.length||event.label.length>200||!event.changes||typeof event.changes!=='object'||Array.isArray(event.changes)||m.events.length>=128||m.events.some(e=>e.id===event.id))return false;
 const entries=Object.entries(event.changes);if(!entries.length)return false;
 const next=[];
 for(const [id,impact] of entries){
  if(!stocks.some(s=>s.id===id)||!impact||typeof impact!=='object'||Array.isArray(impact)||Object.keys(impact).some(k=>!['valuationMultiplier','priceMultiplier'].includes(k)))return false;
  const valuationMultiplier=impact.valuationMultiplier??impact.priceMultiplier,priceMultiplier=impact.priceMultiplier??impact.valuationMultiplier;
  if(![valuationMultiplier,priceMultiplier].every(n=>Number.isFinite(n)&&n>=.01&&n<=100))return false;
  const valuation=m.valuations[id]*valuationMultiplier;if(valuation<.01||valuation>100)return false;
  next.push({id,valuation,price:cents(m.prices[id]*priceMultiplier),valuationMultiplier,priceMultiplier});
 }
 for(const n of next){m.valuations[n.id]=n.valuation;m.prices[n.id]=n.price;pushHistory(m,n.id,n.price);}
 m.event=event.label;m.events.push({id:event.id,label:event.label,at:m.clock,changes:Object.fromEntries(next.map(n=>[n.id,{valuationMultiplier:n.valuationMultiplier,priceMultiplier:n.priceMultiplier}]))});
 return true;
}
