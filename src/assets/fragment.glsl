#ifdef GL_ES
  precision mediump float;
#endif

uniform vec4 u_resolution;
uniform vec2 u_threshold;
uniform float u_time;
uniform float u_pixelRatio;
uniform sampler2D u_image0;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v,2.);
  return mix(m,2.0 - m, step(1.0, m));
}

void main() {
  vec2 uv = u_pixelRatio * gl_FragCoord.xy / u_resolution.xy ;
  vec2 vUv = (uv - vec2(0.5)) * u_resolution.zw + vec2(0.5);
  vUv.y = 1. - vUv.y;
  vec4 image = texture2D(u_image0, mirrored(vUv));
  gl_FragColor = vec4(image.x + sin(abs(u_time)), image.y, image.z, image.w);
}
