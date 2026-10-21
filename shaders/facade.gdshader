shader_type spatial;
render_mode specular_disabled;
uniform vec4 glass:source_color=vec4(.10,.42,.57,1.0);
uniform vec4 frame:source_color=vec4(.12,.25,.39,1.0);
varying vec3 p;
varying vec3 n;
void vertex(){p=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;n=normalize(MODEL_NORMAL_MATRIX*NORMAL);}
void fragment(){
 float u=abs(n.x)>.5?p.z:p.x;
 float row=fract(p.y/3.4);float col=fract(u/2.7);
 vec2 cell=vec2(u/2.7,p.y/3.4);vec2 dd=min(fract(cell),1.-fract(cell));
 vec2 aa=max(fwidth(cell),vec2(.001));
 float seam=max(1.-smoothstep(.01,.01+aa.x,dd.x),1.-smoothstep(.018,.018+aa.y,dd.y));
 float detail=1.-smoothstep(.045,.13,max(aa.x,aa.y));
 float stripe=step(.61,fract((u*.6+p.y*.46)/26.0));
 vec3 reflection=mix(glass.rgb,glass.rgb*1.25+vec3(.09,.15,.14),stripe*.65);
 reflection*=mix(.72,1.0,step(.20,row));
 ALBEDO=mix(reflection,mix(reflection,frame.rgb,.40),seam*detail);
 if(n.y>.6)ALBEDO=vec3(.71,.82,.82);
 ROUGHNESS=1.0;
}
#include "res://shaders/urban-light.gdshaderinc"
