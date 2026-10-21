shader_type spatial;
render_mode specular_disabled;
uniform vec4 stone:source_color=vec4(.77,.81,.84,1.0);
varying vec3 p;
void vertex(){p=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;}
void fragment(){
 vec2 q=p.xz/1.2;vec2 d=abs(fract(q-.5)-.5);vec2 aa=fwidth(q)*1.0;
 float line=1.0-min(smoothstep(.007-aa.x,.007+aa.x,d.x),smoothstep(.007-aa.y,.007+aa.y,d.y));
 float tile=fract(sin(dot(floor(q),vec2(12.9898,78.233)))*43758.5453);
 ALBEDO=stone.rgb*(.99+tile*.025)-line*.023;
 ROUGHNESS=1.0;
}
#include "res://shaders/urban-light.gdshaderinc"
