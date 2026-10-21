shader_type spatial;
render_mode specular_disabled;
uniform vec4 stone:source_color=vec4(.77,.81,.84,1.0);
uniform vec4 road_segments[6];
uniform float road_widths[6];
uniform vec4 grass_rects[4];
uniform vec4 curb_bands[2];
varying vec3 p;
void vertex(){p=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;}
void fragment(){
 vec2 q=p.xz/1.2;vec2 d=abs(fract(q-.5)-.5);vec2 aa=fwidth(q)*1.0;
 float line=1.0-min(smoothstep(.007-aa.x,.007+aa.x,d.x),smoothstep(.007-aa.y,.007+aa.y,d.y));
 float tile=fract(sin(dot(floor(q),vec2(12.9898,78.233)))*43758.5453);
 float detail=1.0-smoothstep(.25,1.0,max(length(dFdx(q)),length(dFdy(q))));
 vec3 paving=stone.rgb*(1.0+(tile-.5)*.025*detail)-line*.023*detail;
 float edge=max(length(fwidth(p.xz)),.015);
 float promenade=1.0-smoothstep(-edge,edge,max(abs(p.x+161.0)-8.5,abs(p.z+60.0)-235.0));
 paving=mix(paving,vec3(.8941,.9098,.9098),promenade);
 for(int i=0;i<4;i++){
  vec2 d=abs(p.xz-grass_rects[i].xy)-grass_rects[i].zw*.5;
  float grass=1.0-smoothstep(-edge,edge,max(d.x,d.y));
  paving=mix(paving,i==3?vec3(.3765,.7255,.5608):vec3(.3059,.6667,.5255),grass);
 }
 float road_distance=10000.0;
 for(int i=0;i<6;i++){
  vec2 a=road_segments[i].xy;vec2 b=road_segments[i].zw;vec2 segment=b-a;
  float len=max(length(segment),.001);vec2 delta=p.xz-a;
  float along=dot(delta,segment)/len;
  float across=abs(delta.x*segment.y-delta.y*segment.x)/len-road_widths[i]*.5;
  road_distance=min(road_distance,max(across,max(-along,along-len)-1.0));
 }
 float asphalt=1.0-smoothstep(-edge,edge,road_distance);
 ALBEDO=mix(paving,vec3(.2078,.2706,.3725),asphalt);
 for(int i=0;i<2;i++){
  vec2 band=abs(p.xz-curb_bands[i].xy)-curb_bands[i].zw*.5;
  float paint=(1.0-smoothstep(-edge,edge,max(band.x,band.y)))*(1.0-asphalt);
  ALBEDO=mix(ALBEDO,vec3(.9529,.7765,.3569),paint);
 }
 ROUGHNESS=1.0;
}
#include "res://shaders/urban-light.gdshaderinc"
