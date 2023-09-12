precision highp float;

uniform vec4 inputPixel;

uniform float hardness;

void main() {
    vec2 uv = gl_FragCoord.xy / inputPixel.xy;

    float d = length(uv);
    float radius = distance(uv, vec2(0.5));
    float alpha = 1.0 - smoothstep(hardness - inputPixel.z - 0.5, 0.5, radius);

    gl_FragColor = vec4(1.0) * alpha;
}
