// The actor lifecycle runs independently of a mission's encounter list. A cleared
// encounter must not leave its last rendered mesh upright in the scene.
export function resetActorPose(e){
 e.fallAge=null;e.flash=0;e.g.rotation.z=0;e.g.position.y=(e.floorHeight||0)+.2;e.windup=0;e.heavy=false;
 for(const a of e.arms||[])a.rotation.x=0;
 for(const l of e.legs||[])l.rotation.x=0;
 if(e.nameLabel)e.nameLabel.visible=true;
}
export function knockDown(e,restored=false){
 e.fallAge=restored?.7:0;e.intentX=e.intentZ=e.vx=e.vz=0;e.windup=0;e.heavy=false;
 e.g.rotation.z=restored?-Math.PI/2:-.3;
 if(e.nameLabel)e.nameLabel.visible=false;
 for(const a of e.arms||[])a.rotation.x=-.18;
 for(const l of e.legs||[])l.rotation.x=.08;
}
export function tickActorPose(e,dt,t,inScope){
 if(e.hp<=0){
  if(e.fallAge==null)knockDown(e,true);
  e.fallAge+=dt;e.intentX=e.intentZ=e.vx=e.vz=0;e.windup=0;
  const k=Math.min(1,e.fallAge/.45),smooth=1-(1-k)**3;
  e.g.rotation.z=-.3-(Math.PI/2-.3)*smooth;
  const lift=e.g.userData.characterModel==='ry-lion-hood'?1.12:e.g.userData.characterModel?.includes('dolphin')?.8:.52;
  e.g.position.y=(e.floorHeight||0)+.2+(lift-.2)*smooth;
  e.g.visible=inScope&&(!e.story||e.fallAge<2.8);
  return true;
 }
 if(e.fallAge!=null)resetActorPose(e);
 if(e.story)e.g.visible=inScope&&e.enabled!==false;
 if(!inScope||e.enabled===false)return true;
 const moving=Math.hypot(e.intentX||e.vx||0,e.intentZ||e.vz||0)>.2;
 if(!e.windup){e.g.rotation.z=Math.sin(t*45)*e.flash*.035;for(const a of e.arms||[])a.rotation.x=moving?Math.sin(t*5)*.16:0;}
 e.legs?.forEach((l,i)=>l.rotation.x=moving?Math.sin(t*5+i*Math.PI)*.3:0);
 return false;
}
