shader_type spatial;
render_mode unshaded;
varying vec3 p;
void vertex() { p = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz; }
void fragment() {
    float ripple = sin(p.z * .21 + sin(p.x * .06) + TIME * .42) * .5 + .5;
    float reflection = (1.0 - smoothstep(8.0, 60.0, abs(p.x + 68.0))) * smoothstep(.62, .9, ripple);
    vec3 water = mix(vec3(.23, .40, .47), vec3(.39, .54, .56), ripple * .34);
    ALBEDO = mix(water, vec3(.90, .70, .46), reflection * .58);
}
