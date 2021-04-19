#version 100
#define PI 3.141592653589793
precision mediump float;

uniform float u_Time;
uniform sampler2D demo;
varying vec2 uv;

void main() {
  vec4 col = texture(demo, uv);
  gl_FragColor = col;
  //vec4(uv.x+sin(u_Time/10.), uv.y, cos(u_Time/2.), 1.0);
}
