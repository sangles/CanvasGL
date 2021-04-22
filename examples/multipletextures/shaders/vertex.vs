#version 100
precision mediump float;
attribute vec2 a_Position;
attribute vec2 a_UV;

varying vec2 uv;
void main(void) {
  uv = a_UV;
  gl_Position = vec4(a_Position, 0, 1);
}
