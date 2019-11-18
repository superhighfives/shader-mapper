#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 v_texcoord;

uniform float u_time;
uniform sampler2D u_image0;

void main() {
  gl_FragColor = texture2D(u_image0, v_texcoord);
}