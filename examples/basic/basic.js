import CanvasGL from '../../src/CanvasGL.js';

let demo = new CanvasGL({canvas:'basicCanvas',mode:'shadertoy'});
demo.setBackground(125,0,0);

const vsSource = CanvasGL.getCode('vertexCode');

const fsSource = CanvasGL.getCode('fragmentCode');;

demo.setShaders({
  vertex:vsSource,
  fragment:fsSource
});

demo.createFillPlane();
demo.play();
