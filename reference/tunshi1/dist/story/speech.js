// Keep a strong reference to each utterance and also detect engines that omit onend.
export function speakLine(text,done,enabled=true){
 const synth=globalThis.speechSynthesis;if(!enabled||!synth||typeof globalThis.SpeechSynthesisUtterance!=='function')return null;
 const chunks=(text.match(/[^。！？；\n]+[。！？；\n]?/g)||[text]).flatMap(s=>s.match(/.{1,48}/gu)||[]);
 let cancelled=false,ended=false,current=null,index=0,sawActive=false,since=0,idleSince=0,timer;
 const now=()=>Date.now();
 function finish(){if(cancelled||ended)return;ended=true;clearInterval(timer);done();}
 function advance(){if(cancelled||ended)return;if(index>=chunks.length){finish();return;}sawActive=false;idleSince=0;since=now();const u=current=new SpeechSynthesisUtterance(chunks[index++]);u.lang='zh-CN';u.rate=1;u.pitch=.92;let settled=false;
 const end=()=>{if(settled||cancelled||current!==u)return;settled=true;advance();};
 u.onstart=()=>{sawActive=true;};u.onend=end;u.onerror=()=>{if(current===u&&!cancelled)finish();};
 u._complete=end;synth.speak(u);
 }
 function poll(){if(cancelled||ended||synth.paused)return;const active=synth.speaking||synth.pending;if(active){sawActive=true;idleSince=0;}else{idleSince||=now();if((sawActive&&now()-idleSince>=250)||(!sawActive&&now()-since>1800))current?._complete();}}
 synth.cancel();timer=setInterval(poll,150);advance();
 return{get utterance(){return current;},poll,cancel(){cancelled=true;clearInterval(timer);synth.cancel();current=null;},failed:()=>ended};
}
