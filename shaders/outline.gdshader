shader_type spatial;
render_mode unshaded,cull_front;
void vertex(){VERTEX+=NORMAL*.010;}
void fragment(){ALBEDO=vec3(.12,.24,.29);}
