const ease=t=>t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t;
function keys(phase,frames){for(let i=1;i<frames.length;i++)if(phase<=frames[i][0]){const a=frames[i-1],b=frames[i];return lerp(a[1],b[1],ease((phase-a[0])/(b[0]-a[0])));}return frames.at(-1)[1];}
export function poseDolphin(hero,{time,walk,moving,airborne,verticalSpeed,attackPhase=-1,hand=0,crouch=false,landing=0}){
 const stride=moving?Math.sin(walk):0,settle=Math.sin(Math.max(0,landing)/.16*Math.PI)*.1;
 hero.body.position.y=(moving?Math.abs(stride)*.055:Math.sin(time*2)*.022)-(crouch?.42:0)-settle;
 hero.body.rotation.set(crouch?.2:moving?.035:0,0,moving?stride*.025:0);
 hero.arms.forEach((a,i)=>{a.position.set((i?1:-1)*.59,2.07,0);a.rotation.set(moving?-Math.sin(walk+i*Math.PI)*.34:Math.sin(time*2+i)*.045,0,(i?1:-1)*.06);});
 hero.legs.forEach((l,i)=>{l.rotation.set(moving?Math.sin(walk+i*Math.PI)*.55:0,0,0);if(hero.knees)hero.knees[i].rotation.x=moving?Math.max(0,-Math.sin(walk+i*Math.PI))*.55:0;});
 hero.elbows?.forEach(e=>e.rotation.x=.08);
 if(airborne){const rising=verticalSpeed>0;hero.body.rotation.x=rising?-.09:.08;hero.legs.forEach((l,i)=>{l.rotation.x=rising?-.58-i*.18:-.15;hero.knees[i].rotation.x=rising?.95:.26;});hero.arms.forEach((a,i)=>{a.rotation.x=-.35;a.rotation.z=(i?1:-1)*-.3;});}
 if(attackPhase>=0){const side=hand?1:-1,arm=hero.arms[hand],guard=hero.arms[1-hand];
  const thrust=keys(attackPhase,[[0,0],[.22,-.15],[.42,.43],[.55,.36],[1,0]]);
  arm.position.z=thrust;arm.rotation.x=keys(attackPhase,[[0,-.18],[.22,-.72],[.42,-1.48],[.56,-1.28],[1,0]]);arm.rotation.z=side*.16;
  hero.elbows[hand].rotation.x=keys(attackPhase,[[0,.1],[.22,-.62],[.42,.1],[.56,.04],[1,.08]]);
  guard.rotation.x=-.82;hero.elbows[1-hand].rotation.x=-.55;
  hero.body.rotation.y=side*keys(attackPhase,[[0,0],[.22,-.26],[.42,.48],[.58,.35],[1,0]]);
  hero.body.rotation.x+=keys(attackPhase,[[0,0],[.22,-.045],[.42,.15],[1,0]]);hero.body.position.y-=Math.sin(attackPhase*Math.PI)*.045;
 }
}
