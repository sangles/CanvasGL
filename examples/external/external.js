import CanvasGL from '../../src/CanvasGL.js';


let vsSource, fsSource;
// CanvasGL.getShaders

Promise.all(
  [CanvasGL.getFile('shaders/vertex.vs'),CanvasGL.getFile('shaders/fragment.fs')]
).then(([vsSource,fsSource])=>{
  // vsSource = source;
  vsSource.text().then((text)=>console.log(text))
  fsSource.text().then((text)=>console.log(text))
});
// CanvasGL.getFile('shaders/fragment.fs',(source)=>{
//   fsSource = source;
// });


let demo;
const init = ()=>{
  demo = new CanvasGL({canvas:'basicCanvas',compatibility:'shadertoy',version:1,prefix:'u_'});
  demo.setBackground(125,0,0);
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

  demo.update('u_mode',2);
  demo.update('u_dist',[0.9,0.9]);
  let img = new Image();
  img.onload = ()=>{
    demo.updateTexture('demo',img);
    // demo.addTexture('demo',img);
  }
  img.src = '../textures/BlenderSplashPow2.jpeg';
  // img.src = '../textures/GardelPow2.jpeg';

  demo.createFillPlane();
  demo.play();
}
