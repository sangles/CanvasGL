import CanvasGL from '../../src/CanvasGL.js';

let demo = new CanvasGL({canvas:'basicCanvas',version:1,prefix:'u_'});
demo.setBackground(125,0,0);

const vsSource = CanvasGL.getCode('vertexCode');
const fsSource = CanvasGL.getCode('fragmentCode');


window.demo = demo;
demo.setShaders({
  vertex:vsSource,
  fragment:fsSource
});
// demo.addUniform( 'mode', CanvasGL.INT );
// demo.addUniformInt( 'mode', 1 );
// demo.addUniformInt( 'mode' );
// demo.addUniformVec2( 'dist' );
demo.addUniforms(
  {
    'u_mode': CanvasGL.INT,
    'transition': CanvasGL.FLOAT,
    'u_dist': CanvasGL.VEC2
  }
);
// demo.addTexture('demo','../textures/BlenderSplashPow2.jpeg');
demo.addTexture('demo');
demo.addTexture('demo2');

demo.update('u_mode',2);
demo.update('u_dist',[0.9,0.9]);
let img = new Image();
img.onload = ()=>{
  demo.updateTexture('demo',img);
  // demo.addTexture('demo',img);
}
img.src = '../textures/BlenderSplashPow2.jpeg';
let img2 = new Image();
img2.onload = ()=>{
  // demo.updateTexture('demo',img);
  // demo.addTexture('demo',img);
}
// img.src = '../textures/BlenderSplashPow2.jpeg';
img2.src = '../textures/GardelPow2.jpeg';
let img3 = new Image();
img3.onload = ()=>{
  demo.updateTexture('demo2',img3);
  // demo.addTexture('demo',img);
}
// img.src = '../textures/BlenderSplashPow2.jpeg';
img3.src = '../textures/WavesPow2.png';

demo.createFillPlane();
demo.play();
demo.switcher = false;
demo.switchTextures = ()=>{
  demo.switcher = !demo.switcher;
  demo.updateTexture('demo2',demo.switcher?img3:img2);

}


demo.switcher2 = false;
demo.switchTextures2 = ()=>{
  demo.switcher2 = !demo.switcher2;
  demo.updateTexture('demo',demo.switcher2?img:img2);

}
