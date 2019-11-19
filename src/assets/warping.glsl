#ifdef GL_ES
  precision mediump float;
#endif

uniform vec4 u_resolution;
uniform vec2 u_threshold;
uniform float u_time;
uniform float u_pixelRatio;
uniform sampler2D u_image0;

vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}

void main() {
  
  // vec4 image = texture2D(u_image0, vUv);
  // gl_FragColor = vec4(image.x + sin(abs(u_time)), image.y, image.z, image.w);
  // vec2 uv = vec2(gl_FragCoord.xy / u_resolution.xy);
  vec2 uv = u_pixelRatio * gl_FragCoord.xy / u_resolution.xy ;
  vec2 vUv = (uv - vec2(0.5)) * sin(abs((u_time / 100.0) / u_resolution.zw)) + vec2(0.5);
  vUv.y = 1. - vUv.y;
  vec2 direction = vec2(100.0 - u_time);
  vec4 image = blur(u_image0, vUv, u_resolution.xy, direction);
  gl_FragColor = image;
}
