shader_type spatial;
render_mode unshaded;
varying vec3 p;
float hash(vec2 v){return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);}
void vertex(){p=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;}
void fragment(){
 vec2 grid=p.xz/vec2(18.,5.);float h=hash(floor(grid));
 vec2 cell=fract(grid);float line=abs(cell.y-.32-h*.33+sin(p.x*.03+TIME*.2)*.04);
 float span=1.-smoothstep(.16+h*.18,.19+h*.18,abs(cell.x-.5));
 float glint=(1.-smoothstep(.015,.036,line))*span*step(.31,h);
 vec3 water=mix(vec3(.055,.40,.59),vec3(.08,.62,.73),clamp((p.x+700.)/580.,0.,1.));
 ALBEDO=mix(water,vec3(.59,.88,.91),glint*.45);
}
