export function createImpactAudio(getContext,isEnabled){
 let buffer,bufferContext;
 return{play(kind){
  const ctx=getContext();if(!isEnabled()||!ctx)return false;
  const glass=kind==='glass',now=ctx.currentTime;
  function note(freq,duration,volume,type='sine',delay=0){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,now+delay);osc.frequency.exponentialRampToValueAtTime(Math.max(25,freq*.45),now+delay+duration);gain.gain.setValueAtTime(volume,now+delay);gain.gain.exponentialRampToValueAtTime(.001,now+delay+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start(now+delay);osc.stop(now+delay+duration);}
  note(glass?58:92,glass?1.2:.3,glass?.12:.06,'triangle');note(glass?110:170,.25,.055,'sawtooth');
  if(glass)for(let i=0;i<6;i++)note(850+i*410,.25+i*.06,.023,'sine',i*.045);
  if(ctx.createBuffer&&ctx.createBufferSource&&ctx.createBiquadFilter){
   if(!buffer||bufferContext!==ctx){buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate),ctx.sampleRate);const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(1-i/samples.length);bufferContext=ctx;}
   const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type=glass?'highpass':'lowpass';filter.frequency.value=glass?1800:900;gain.gain.setValueAtTime(glass?.18:.09,now);gain.gain.exponentialRampToValueAtTime(.001,now+(glass?.85:.35));source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.start(now);source.stop(now+(glass?.9:.4));
  }return true;
 }};
}
