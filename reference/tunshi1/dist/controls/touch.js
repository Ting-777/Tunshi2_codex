// Each control owns its pointer. A second finger cannot clear the first finger's
// movement, and actions happen on down rather than secondary-touch click.
export function bindTouchControls({stick,joy,buttons,canAct}){
 let stickPointer=null;
 const clamp=v=>Math.max(-1,Math.min(1,v));
 function move(e){const b=stick.getBoundingClientRect(),radius=Math.max(30,b.width*.36);joy.x=clamp((e.clientX-b.left-b.width/2)/radius);joy.y=clamp((e.clientY-b.top-b.height/2)/radius);const n=Math.max(1,Math.hypot(joy.x,joy.y));joy.x/=n;joy.y/=n;stick.firstElementChild.style.transform=`translate(${joy.x*32}px,${joy.y*32}px)`;}
 stick.onpointerdown=e=>{if(!canAct()||stickPointer!==null)return;e.preventDefault();e.stopPropagation?.();stickPointer=e.pointerId;stick.setPointerCapture?.(e.pointerId);move(e);};
 stick.onpointermove=e=>{if(e.pointerId===stickPointer){e.preventDefault();move(e);}};
 function endStick(e){if(e.pointerId!==stickPointer)return;stickPointer=null;joy.x=joy.y=0;stick.firstElementChild.style.transform='';}
 stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=endStick;
 for(const [node,action]of buttons){let suppressClickUntil=0;node.onpointerdown=e=>{if(!canAct())return;e.preventDefault();e.stopPropagation?.();node.setPointerCapture?.(e.pointerId);suppressClickUntil=Date.now()+500;action();};node.onclick=e=>{if(canAct()&&(!e||e.detail===0&&Date.now()>suppressClickUntil))action();};}
 return{reset(){stickPointer=null;joy.x=joy.y=0;stick.firstElementChild.style.transform='';}};
}
