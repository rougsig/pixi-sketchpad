precision highp float;

uniform float size;
uniform vec3 color;
uniform float hardness;

void main(){
    vec2 uv = gl_FragCoord.xy / size;
    float dst = distance(uv, vec2(0.5)) * 2.0;
    float alpha = pow(max(0.0, 1.0 - dst), 1.01 - hardness);

    gl_FragColor = vec4(color, 1.0) * alpha;
}
