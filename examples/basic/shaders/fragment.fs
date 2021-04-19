#version 100
#define PI 3.141592653589793
precision mediump float;

uniform float u_Time;
uniform sampler2D demo;

varying vec2 uv;

void main() {
  vec2 nUV= vec2(sin(u_Time+uv.x*PI)*.5+.5,cos(u_Time+uv.y*PI)*.5+.5)*.2;
  vec4 col = texture2D(demo, uv+nUV);
  gl_FragColor = col;
}
