import CanvasGL from '../../src/CanvasGL.js';

let demo = new CanvasGL({canvas:'basicCanvas',mode:'shadertoy'});
demo.setBackground(125,0,0);

const vsSource = CanvasGL.getCode('vertexCode');

const fsSource = CanvasGL.getCode('fragmentCode');;

demo.setShaders({
  vertex:vsSource,
  fragment:fsSource
});

let img = new Image();
img.onload = ()=>{
  demo.addTexture('demo',img);
}
img.src = '../textures/BlenderSplashPow2.jpeg';
// img.src = '../textures/GardelPow2.jpeg';

demo.createFillPlane();
demo.play();
