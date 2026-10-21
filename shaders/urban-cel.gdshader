shader_type spatial;
render_mode specular_disabled;
uniform vec4 tint : source_color = vec4(1.0);
uniform bool vertex_paint = false;
uniform float rim_strength = 0.0;
void fragment() {
    ALBEDO = tint.rgb * (vertex_paint ? COLOR.rgb : vec3(1.0));
    ROUGHNESS = 1.0;
    EMISSION = ALBEDO * rim_strength * pow(1.0 - max(dot(NORMAL, VIEW), 0.0), 4.0);
}
#include "res://shaders/urban-light.gdshaderinc"
