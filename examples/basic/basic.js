import CanvasGL from '../../src/CanvasGL.js';

let demo = new CanvasGL({canvas:'basicCanvas',mode:'shadertoy',version:2,addPrefix:true});
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


demo.update('u_mode',2);
demo.update('u_dist',[0.9,-0.9]);
let img = new Image();
img.onload = ()=>{
  demo.addTexture('demo',img);
}
img.src = '../textures/BlenderSplashPow2.jpeg';
// img.src = '../textures/GardelPow2.jpeg';

demo.createFillPlane();
demo.play();
