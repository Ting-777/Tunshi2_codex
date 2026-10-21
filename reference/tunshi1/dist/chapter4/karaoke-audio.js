import {karaokeTrack} from './karaoke-tracks.js';

// Fresh challenges play a prepared original-song excerpt from zero. No startup
// seek into a large MP3 is required. Resume still follows the real playhead.
export class KaraokeAudio {
 constructor({createAudio=()=>typeof Audio==='undefined'?null:new Audio(),changed=()=>{}}={}) {
  this.createAudio=createAudio;this.changed=changed;this.audio=null;this.track=null;
  this.mode=null;this.round=null;this.state='idle';this.wanted=false;this.pending=false;this.epoch=0;this.target=null;
  this.source=null;this.prepared=false;this.seekIssued=false;this.stallTime=0;this.lastPlayhead=-1;
 }
 notify(state){this.state=state;this.changed();}
 ensure(index,mode){
  const track=karaokeTrack(index),source=new URL(mode==='round'?track.challengeSrc:track.src,import.meta.url).href;
  if(!this.audio){this.audio=this.createAudio();if(!this.audio)return false;
   const audio=this.audio;audio.loop=false;audio.preload='auto';audio.volume=.65;
   for(const event of ['loadedmetadata','seeked','canplay','timeupdate','playing','waiting','stalled','ended','error'])audio.addEventListener(event,()=>{
    if(!this.mode)return;
    if(audio.currentSrc&&audio.currentSrc!==this.source)return;
    if(event==='loadedmetadata'){this.prepared=true;this.seek();this.changed();return;}
    if(['seeked','canplay','timeupdate'].includes(event)){this.confirmSeek();this.seek();this.changed();return;}
    if(event==='error'){this.wanted=false;audio.pause();this.notify('error');return;}
    if(event==='ended'){this.wanted=false;this.notify(this.mode==='listen'?'ended':'error');return;}
    if(!this.wanted){audio.pause();return;}
    this.notify(event==='playing'?'playing':'loading');
   });
  }
  if(this.source!==source){this.stop();this.track=track;this.source=source;this.audio.src=source;}
  return true;
 }
 seek(){
  if(this.target===null||!this.prepared||this.seekIssued)return;
  if(!this.audio.seeking&&Math.abs(this.audio.currentTime-this.target)<.05){this.target=null;return;}
  try{this.audio.currentTime=this.target;this.seekIssued=true;}catch{}
 }
 confirmSeek(){
  // A completed seek event may reach us after playback has already advanced.
  // Requiring a 50 ms match used to leave scoring locked for the whole song.
  if(this.target!==null&&this.seekIssued&&!this.audio.seeking&&this.audio.currentTime>=this.target-.15){this.target=null;this.seekIssued=false;}
 }
 reload(){this.prepared=false;this.seekIssued=false;this.audio.load();}
 watch(dt){
  if(!this.audio||!this.wanted)return;
  const time=this.audio.currentTime;
  if(Number.isFinite(time)&&time>this.lastPlayhead+.001){this.lastPlayhead=time;this.stallTime=0;}else this.stallTime+=dt;
  if(this.stallTime>=10){this.wanted=this.pending=false;++this.epoch;this.audio.pause();this.notify('error');}
 }
 play(){
  if(!this.audio)return;this.wanted=true;this.stallTime=0;this.lastPlayhead=this.audio.currentTime;const epoch=++this.epoch;this.pending=true;this.notify('loading');
  try{Promise.resolve(this.audio.play()).then(()=>{
   if(epoch!==this.epoch){if(!this.wanted)this.audio.pause();return;}
   this.pending=false;if(!this.wanted){this.audio.pause();return;}
   this.notify('playing');
  },()=>{if(epoch===this.epoch){this.pending=false;this.wanted=false;this.audio.pause();this.notify('blocked');}});
  }catch{this.pending=false;this.wanted=false;this.audio.pause();this.notify('blocked');}
 }
 beginRound(round){
  if(!this.ensure(round.track,'round'))return;
  this.audio.pause();this.mode='round';this.round=round;
  if(this.state==='error')this.reload();
  this.target=round.time;this.seekIssued=false;this.seek();this.play();
 }
 toggleListen(index){
  const track=karaokeTrack(index);
  if(this.mode==='listen'&&this.track===track&&this.wanted){this.pause();return;}
  const continuing=this.mode==='listen'&&this.track===track&&this.state==='paused';
  if(!this.ensure(index,'listen'))return;this.mode='listen';this.round=null;
  if(!continuing){this.audio.pause();if(this.state==='error')this.reload();this.target=0;this.seekIssued=false;this.seek();}
  this.play();
 }
 pause(){this.wanted=false;this.pending=false;++this.epoch;this.audio?.pause();if(this.mode)this.notify('paused');}
 stop(){this.pause();this.mode=null;this.round=null;this.target=null;this.state='idle';this.prepared=false;this.seekIssued=false;if(this.source){this.audio?.removeAttribute?.('src');this.audio?.load();}this.source=this.track=null;this.changed();}
 mute(muted){if(this.audio)this.audio.muted=muted;}
 ready(round){this.confirmSeek();return !this.audio||this.mode==='round'&&this.round===round&&this.wanted&&this.state==='playing'&&this.prepared&&!this.audio.paused&&!this.audio.seeking&&this.audio.readyState>=3&&this.target===null;}
 time(round){
  if(!this.audio)return undefined; // Media-free engine harness only.
  if(!this.ready(round))return round.time;
  const time=this.audio.currentTime;
  return Number.isFinite(time)?Math.max(round.time,Math.min(round.duration,time)):round.time;
 }
 status(){return ({idle:'',loading:'音频正在加载，节拍会等音乐就绪。',playing:'原曲播放中',paused:'音乐已暂停',blocked:'播放被浏览器拦住了，点击「重试播放」。',error:'音频暂时未接通，点击「重试播放」。',ended:'全曲播放完毕'})[this.state];}
}
