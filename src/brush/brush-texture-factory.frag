precision highp float;

uniform float size;
uniform vec3 color;
uniform float hardness;

void main(){
    vec2 uv = gl_FragCoord.xy / size;

    float radius = distance(uv, vec2(0.5));
    float alpha = 1.0 - smoothstep(hardness - 0.5, 0.5, radius);

    gl_FragColor = vec4(color, 1.0) * alpha;
}
