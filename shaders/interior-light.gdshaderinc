void light() {
    float facing = dot(NORMAL, LIGHT);
    if (LIGHT_IS_DIRECTIONAL) {
        // Keep the existing outdoor cel bands, including their blue shadow fill.
        float band = smoothstep(0.22, 0.27, facing) * smoothstep(0.35, 0.6, ATTENUATION);
        vec3 shade = mix(vec3(0.43, 0.48, 0.72), vec3(1.0, 0.98, 0.90), band);
        DIFFUSE_LIGHT += ALBEDO * shade * LIGHT_COLOR / PI;
    } else {
        // Local fixtures must attenuate to zero. Repeating the directional
        // shadow floor for every point light overexposes the entire building.
        float soft = mix(0.15, 1.0, smoothstep(-0.1, 0.45, facing));
        DIFFUSE_LIGHT += ALBEDO * LIGHT_COLOR * ATTENUATION * soft * 0.45 / PI;
    }
}
