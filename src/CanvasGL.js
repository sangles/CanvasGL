"use strict"

// let getTime = ()=>{
//   return (new Date()).getTime();
// }
let point = (p)=>{
  return [p.x*2-1,-p.y*2+1]
}
let triangle = (p1,p2,p3)=>{
  return [...point(p1),...point(p2),...point(p3)];
}
let plane = (p1,p2,p3,p4)=>{
  // return [...triangle(p1,p2,p4),...triangle(p2,p3,p4)];
  return [...point(p1),...point(p2),...point(p3),...point(p4)];
}


export default class CanvasGL {
  running = false;
  fragmentCode = '';
  vertexCode = '';

  static getCode(id){
    return document.getElementById(id).text;
  }
  static getFile(filename){

  }
  constructor(props={}){

    // if(canvasId) this.canvas = document.getElementById(canvasId);
    this.attributes = {};
    this.uniforms = {};
    this.textures = {};
    this.images = {};
    this.renders = new Array();
    this.setup(props?.canvas)
  }

  setup(canvas=null){
    if(typeof canvas == 'string'){
      this.canvas = document.getElementById(canvas);
    }
    this.webgl = this.canvas.getContext('webgl');
    // console.log(this.context);
    this.resize();
    this.setBackground(0,0,0);
  }

  setBackground(r,g,b){
    this.webgl.clearColor( r/255, g/255, b/255, 1 );
  }

  clear(){
    this.webgl.clear(this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT);
  }

  logic(){

  }

  setVertexShader(source){
    this.vertexSource = source;
    this.vertexShader = this.webgl.createShader(this.webgl.VERTEX_SHADER);
    this.webgl.shaderSource(this.vertexShader, this.vertexSource);
    this.webgl.compileShader(this.vertexShader);

    if (!this.webgl.getShaderParameter(this.vertexShader, this.webgl.COMPILE_STATUS)) {
      console.error(this.webgl.getShaderInfoLog(this.vertexShader))
      console.error(this.webgl.getShaderInfo(this.vertexShader))
      console.error(this.webgl.glGetProgramInfoLog(this.program))
      throw new Error('Failed to compile Vertext shader')
    }
  }

  setFragmentShader(source){
    this.fragmentSource = source;
    this.fragmentShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER);
    this.webgl.shaderSource(this.fragmentShader, this.fragmentSource);
    this.webgl.compileShader(this.fragmentShader);

    if (!this.webgl.getShaderParameter(this.fragmentShader, this.webgl.COMPILE_STATUS)) {
      console.error(this.webgl.getShaderInfoLog(this.fragmentShader))
      console.error(this.webgl.getShaderInfo(this.fragmentShader))
      console.error(this.webgl.glGetProgramInfoLog(this.program))
      throw new Error('Failed to compile shader')
    }
  }
  setShaders(shaders={}){
    this.setVertexShader(shaders.vertex);
    this.setFragmentShader(shaders.fragment);

  }

  createShaderProgram(){
    console.log('create shader program');
    this.program = this.webgl.createProgram()
    this.webgl.attachShader(this.program, this.vertexShader);
    this.webgl.attachShader(this.program, this.fragmentShader);
    this.webgl.linkProgram(this.program);
    // this.webgl.detachShader(this.program, this.vertexShader);
    // this.webgl.detachShader(this.program, this.fragmentShader);
    // this.webgl.deleteShader(this.vertexShader);
    // this.webgl.deleteShader(this.fragmentShader);
    if (!this.webgl.getProgramParameter(this.program, this.webgl.LINK_STATUS)) {
      var linkErrLog = this.webgl.getProgramInfoLog(this.program);
      // this.release();
      alert("Shader program did not link successfully. \n" + "Error log: " + linkErrLog);
    }
      //
      // this.createRectangle();
      // this.webgl.drawArrays(this.webgl.POINTS, 0, 1);
      // this.release();

  }

  createBuffer( bufferType, data ){
    let type, converter;
    switch(bufferType.toLowerCase()){
      case 'vertex':
        type = this.webgl.ARRAY_BUFFER;
        converter = Float32Array;
        break;
      case 'index':
        type = this.webgl.ELEMENT_ARRAY_BUFFER;
        converter = Uint16Array;
        break;
    }
    return this.setBuffer(type,converter,data);
  }
  setBuffer( type, converter, data ){
    let buffer = this.webgl.createBuffer();
    this.webgl.bindBuffer( type, buffer);
    this.webgl.bufferData( type, new converter(data), this.webgl.STATIC_DRAW );
    this.webgl.bindBuffer( type, null);
    buffer.data = data;
    return buffer;
  }

  createVertexBuffer(data){
    return this.createBuffer('vertex',data)
  }

  createIndexBuffer(data){
    return this.createBuffer('index',data)
  }

  createFillPlane(){
    let pTL = { x:0, y:0 };
    let pTR = { x:1, y:0 };
    let pBL = { x:0, y:1 };
    let pBR = { x:1, y:1 };
    let planeArr = plane(pTL,pTR,pBR,pBL);
    let UVArr = [0,0,1,0,1,1,0,1];
    let planeIndex = [0,1,2,];

    this.fillVBuffer = this.createVertexBuffer(planeArr)
    this.fillIBuffer = this.createIndexBuffer([0,1,3,1,2,3]);
    this.fillUVBuffer = this.createVertexBuffer(UVArr);
    // this.webgl.bindBuffer(gl.ARRAY_BUFFER, this.data)
    // this.webgl.enableVertexAttribArray(this.uvAttribute)
    // this.webgl.vertexAttribPointer(this.uvAttribute, this.size, this.webgl.FLOAT, false, 0, 0)
    this.renders.push(()=>this.renderFillPlane());
  }

  compile(){
    this.createShaderProgram();
    this.linkAttributes();
    this.linkUniforms();
  }
  resize(){
    this.webgl.viewport( 0, 0, this.webgl.canvas.width, this.webgl.canvas.height );
  }

  renderFillPlane(){
    // console.log('plane '+Math.random())
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.fillVBuffer);
    this.webgl.enableVertexAttribArray(this.attributes.position);
    this.webgl.vertexAttribPointer(this.attributes.position, 2, this.webgl.FLOAT, false, 0, 0);
    this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, this.fillIBuffer);

    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.fillUVBuffer);
    this.webgl.enableVertexAttribArray(this.attributes.uv);
    this.webgl.vertexAttribPointer(this.attributes.uv, 2, this.webgl.FLOAT, false, 0, 0);
    this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, this.fillIBuffer);

    this.webgl.drawElements(this.webgl.TRIANGLES, this.fillIBuffer.data.length, this.webgl.UNSIGNED_SHORT,0);

    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, null);
    this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, null);

  }

  // uniform vec3 iResolution;
  // uniform float iTime;
  // uniform float iTimeDelta;
  // uniform float iFrame;
  // uniform float iChannelTime[4];
  // uniform vec4 iMouse;
  // uniform vec4 iDate;
  // uniform float iSampleRate;
  // uniform vec3 iChannelResolution[4];
  // uniform samplerXX iChanneli;

  linkAttributes(){
    this.attributes.position = this.webgl.getAttribLocation(this.program, "a_Position");
    this.attributes.uv = this.webgl.getAttribLocation(this.program, "a_UV");
  }

  linkUniforms(){
    this.uniforms.time = this.webgl.getUniformLocation(this.program, "u_Time");
  }

  addTexture( name, image ){

    // this.texturesIds.push(name);// = {texture:this.webgl.createTexture(),key:name,id:this.textures};
    this.images[name] = {texture:this.webgl.createTexture(), key:name, id:Object.keys(this.images).length, src:image.src };
    this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.images[name].texture);
    this.webgl.texImage2D(this.webgl.TEXTURE_2D, 0, this.webgl.RGBA, this.webgl.RGBA, this.webgl.UNSIGNED_BYTE, image);
    // this.webgl.generateMipmap(this.webgl.TEXTURE_2D);
    // this.uniformTexture = this.webgl.getUniformLocation(this.program, 'diffuse')

    // this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.LINEAR);
    // this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR);

    this.textures[name] = this.webgl.getUniformLocation(this.program, name);
        // this.program.diffuse = this.webgl.getUniformLocation(this.program, "diffuse");
        // this.program.diffuse2 = this.webgl.getUniformLocation(this.program, "diffuse2");
    // this.texturesUni.push = [this.program.diffuse,this.program.diffuse2];
    this.webgl.generateMipmap(this.webgl.TEXTURE_2D);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.LINEAR_MIPMAP_NEAREST);//_MIPMAP_NEAREST);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR_MIPMAP_NEAREST);//_MIPMAP_NEAREST);

    this.webgl.bindTexture(this.webgl.TEXTURE_2D,null);



  }
  bindTextures(){
    for(let key in this.images){
      let texture = this.images[key];
      this.webgl.activeTexture(this.webgl['TEXTURE' + texture.id])
      this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture.texture)
      this.webgl.uniform1i(texture.name, texture.id);
    }
  }
  bindUniforms(time){
    // Uniforms
    this.webgl.uniform1f( this.uniforms.time, time/1000. );
  }
  render(time){
    if(!this.program){
      this.compile();
    }
    this.clear();
    this.webgl.useProgram( this.program );
    this.bindUniforms(time);
    this.bindTextures();
    this.renders.forEach((ren) => ren())
    // this.renderFillPlane();

  }

  loop(time){
    this.logic(time);
    this.render(time);
    if(this.running) requestAnimationFrame((t)=>this.loop(t));
  }

  play(){
    this.running = true;
    this.loop();
  }

  stop(){
    this.running = false;
  }

}
