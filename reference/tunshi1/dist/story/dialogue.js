// Speech completion owns the advance clock; names are visual metadata only.
export class Dialogue{
 constructor(root,{onLine=()=>null,seen=[]}={}){this.root=root;this.onLine=onLine;this.seen=new Set(seen);this.queue=[];this.line=null;this.history=[];this.serial=0;root.querySelector('button').onclick=()=>this.next();}
 play(id,lines,channel='面对面'){if(!lines?.length||this.seen.has(id))return;this.seen.add(id);for(const row of lines)this.queue.push({speaker:row[0],text:row[1],channel:row[2]||channel});if(!this.line)this.next();}
 next(){const serial=++this.serial;this.voice?.cancel?.();this.voice=null;this.line=this.queue.shift()||null;this.root.classList.toggle('hidden',!this.line);if(!this.line)return;
 this.root.querySelector('[data-speaker]').textContent=this.line.speaker;this.root.querySelector('[data-text]').textContent=this.line.text;this.root.querySelector('[data-channel]').textContent=this.line.channel;
 this.history.push({...this.line});this.history=this.history.slice(-60);this.elapsed=0;this.readTime=Math.max(4,this.line.text.length/3.8+1.5);this.remaining=this.readTime;this.speaking=false;this.speechDone=false;
 const done=()=>{if(serial!==this.serial)return;this.speaking=false;this.speechDone=true;this.remaining=.65;};
 this.voice=this.onLine(this.line,done);if(this.voice&&!this.speechDone){this.speaking=true;this.remaining=Infinity;}
 this.root.querySelector('button').textContent='E / Enter · 提前下一句（默认播完再继续）';
 }
 tick(dt){if(!this.line)return;this.elapsed+=dt;this.voice?.poll?.();if(this.speaking){if(this.voice?.failed?.()){this.speaking=false;this.remaining=.65;}return;}this.remaining-=dt;if(this.remaining<=0)this.next();}
 clear(){++this.serial;this.voice?.cancel?.();this.voice=null;this.queue=[];this.line=null;this.root.classList.add('hidden');}
 get busy(){return !!this.line;}
 serialize(){return{seen:[...this.seen],history:this.history,queue:this.line?[this.line,...this.queue]:this.queue};}
 restore(data){this.clear();this.seen=new Set(data?.seen||[]);this.history=data?.history||[];this.queue=data?.queue||[];this.next();}
}
