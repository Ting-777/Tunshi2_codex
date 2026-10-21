void light() {
    float facing = dot(NORMAL, LIGHT);
    float band = smoothstep(0.22, 0.27, facing) * smoothstep(0.35, 0.6, ATTENUATION);
    vec3 shade = mix(vec3(0.43, 0.48, 0.72), vec3(1.0, 0.98, 0.90), band);
    DIFFUSE_LIGHT += ALBEDO * shade * LIGHT_COLOR / PI;
}
