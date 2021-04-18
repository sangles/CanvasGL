#version 100
#define PI 3.141592653589793
precision mediump float;

uniform float u_Time;
varying vec2 uv;

void main() {
  gl_FragColor = vec4(uv.x+sin(u_Time/10.), uv.y, cos(u_Time/2.), 1.0);
}
