// let getTime = ()=>{
//   return (new Date()).getTime();
// }
let point = (p)=>{
  return [p.x*2-1,-p.y*2+1]
};
let plane = (p1,p2,p3,p4)=>{
  // return [...triangle(p1,p2,p4),...triangle(p2,p3,p4)];
  return [...point(p1),...point(p2),...point(p3),...point(p4)];
};
const InternalProperties = {
  default:{
    time:'u_Time',
    resolution:'u_Resolution'
  },
  shadertoy:{
    time:'iTime',
    resolution:'iResolution'
  }
};
class CanvasGL {

  running = false;
  fragmentCode = '';
  vertexCode = '';

  static INT = 0;
  static FLOAT = 1;
  static VEC1 = 2;
  static VEC2 = 3;
  static VEC3 = 4;
  static VEC4 = 5;
  static BOOL = 6;
  static COLOR = 7;

  uniformDefaultValues = {
    0:0,
    1:0.,
    2:[0],
    3:[0,0],
    4:[0,0,0],
    4:[0,0,0,0],
    5:false,
    6:[1,1,1,1]
  };
  doUpdateAllUniforms = false;

  static getCode(id){
    return document.getElementById(id).text;
  }

  static getFile(filename){
    return fetch(filename);
  }

  constructor(props={}){
    // if(canvasId) this.canvas = document.getElementById(canvasId);
    this.attributes = {};
    this.uniforms = {};
    this.uniformUpdaters = {};
    this.uniformValues = {};
    this.textures = {};
    this.images = {};
    this.renders = new Array();
    this.internals = (props.compatibility&&InternalProperties[props.compatibility])?InternalProperties[props.compatibility]:InternalProperties.default;
    this.setup(props?.canvas);
  }

  setup(canvas=null){
    if(typeof canvas == 'string'){
      this.canvas = document.getElementById(canvas);
    }
    this.webgl = this.canvas.getContext('webgl');
    this.addUniformFloat(this.internals.time);
    this.addUniformVec2(this.internals.resolution);
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
      console.error(this.webgl.getShaderInfoLog(this.vertexShader));
      console.error(this.webgl.getShaderInfo(this.vertexShader));
      console.error(this.webgl.glGetProgramInfoLog(this.program));
      throw new Error('Vertex Shader compiler error')
    }
  }

  setFragmentShader(source){
    this.fragmentSource = source;
    this.fragmentShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER);
    this.webgl.shaderSource(this.fragmentShader, this.fragmentSource);
    this.webgl.compileShader(this.fragmentShader);

    if (!this.webgl.getShaderParameter(this.fragmentShader, this.webgl.COMPILE_STATUS)) {
      console.error(this.webgl.getShaderInfoLog(this.fragmentShader));
      console.error(this.webgl.getShaderInfo(this.fragmentShader));
      console.error(this.webgl.glGetProgramInfoLog(this.program));
      throw new Error('Fragment Shader compiler error')
    }
  }

  setShaders(shaders={}){
    this.setVertexShader(shaders.vertex);
    this.setFragmentShader(shaders.fragment);
  }

  createShaderProgram(){
    this.program = this.webgl.createProgram();
    this.webgl.attachShader(this.program, this.vertexShader);
    this.webgl.attachShader(this.program, this.fragmentShader);
    this.webgl.linkProgram(this.program);
    // this.webgl.detachShader(this.program, this.vertexShader);
    // this.webgl.detachShader(this.program, this.fragmentShader);
    // this.webgl.deleteShader(this.vertexShader);
    // this.webgl.deleteShader(this.fragmentShader);
    if (!this.webgl.getProgramParameter(this.program, this.webgl.LINK_STATUS)) {
      let error = this.webgl.getProgramInfoLog(this.program);
      alert("Error linking shader program. \n" + "Error log: " + error);
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

    this.fillVBuffer = this.createVertexBuffer(planeArr);
    this.fillIBuffer = this.createIndexBuffer([0,1,3,1,2,3]);
    this.fillUVBuffer = this.createVertexBuffer(UVArr);
    this.renders.push(()=>this.renderFillPlane());
  }

  compile(){
    this.createShaderProgram();
    this.linkAttributes();
    this.linkUniforms();
  }
  linkProgram(){
    if(!this.program) this.compile();
    this.webgl.useProgram( this.program );
  }
  resize(){
    this.webgl.viewport( 0, 0, this.webgl.canvas.width, this.webgl.canvas.height );
    this.update(this.internals.resolution,[this.webgl.canvas.width, this.webgl.canvas.height]);
  }
  renderFillPlane(){

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
    Object.entries(this.uniforms).forEach(([key, uniform]) => {
      if(uniform.location=='unlinked') uniform.location = this.webgl.getUniformLocation(this.program, key);
    });
    this.doUpdateAllUniforms = true;
  }

  updateAllUniforms(){
    Object.entries(this.uniforms).forEach(([key, value]) => {
      this.updateUniform(key);
    });
    this.doUpdateAllUniforms = false;
  }

  addUniform( key, type ){
    let uniform = {};
    uniform.location = 'unlinked';
    let updater = this.webgl.uniform1f;
    switch(type){
      case CanvasGL.BOOL:
      case CanvasGL.INT:
        updater = this.webgl.uniform1i; break;
      case CanvasGL.FLOAT:
        updater = this.webgl.uniform1f; break;
      case CanvasGL.VEC1:
        updater = this.webgl.uniform1fv; break;
      case CanvasGL.VEC2:
        updater = this.webgl.uniform2fv; break;
      case CanvasGL.VEC3:
        updater = this.webgl.uniform3fv; break;
      case CanvasGL.VEC4:
      case CanvasGL.COLOR:
        updater = this.webgl.uniform4fv; break;
    }
    uniform.value = this.uniformDefaultValues[type];
    uniform.updater = updater;
    this.uniforms[key] = uniform;

  }

  addUniforms(ulist){
    Object.entries(ulist).forEach(([key, value]) => {
      this.addUniform(key,value);
    });
  }

  addUniformFloat(key){ this.addUniform(key,CanvasGL.FLOAT); }
  addUniformVec1(key){  this.addUniform(key,CanvasGL.VEC1); }
  addUniformVec2(key){  this.addUniform(key,CanvasGL.VEC2); }
  addUniformVec3(key){  this.addUniform(key,CanvasGL.VEC3); }
  addUniformVec4(key){  this.addUniform(key,CanvasGL.VEC4); }
  addUniformColor(key){ this.addUniform(key,CanvasGL.COLOR); }
  addUniformInt(key){   this.addUniform(key,CanvasGL.INT); }
  setColorTexture( name , color=[255, 255, 255, 0]){
    this.webgl.texImage2D(this.webgl.TEXTURE_2D, 0, this.webgl.RGBA, 1, 1, 0, this.webgl.RGBA, this.webgl.UNSIGNED_BYTE, new Uint8Array(color));
  }
  addTexture( name, image=null ){
    this.images[name] = {texture:this.webgl.createTexture(), key:name, id:Object.keys(this.images).length };
    this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.images[name].texture);
    if(typeof image == 'string'){
      let tempImg = new Image();
      tempImg.onload = ()=> this.updateTexture(name,tempImg);
      tempImg.src = image;
    }else if(image instanceof Image){
      this.updateTexture(name,image);
    }else if(image==null){
      this.setColorTexture(name);
    }else {
      this.setColorTexture(name,[255,0,0,255]);
    }
    this.webgl.bindTexture(this.webgl.TEXTURE_2D,null);
  }
  updateTexture( name, image ){
    if(this.images[name]==undefined) return this.addTexture(name,image);
    this.images[name].src = image.src;
    this.images[name].image = image;
    this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.images[name].texture);
    this.webgl.texImage2D(this.webgl.TEXTURE_2D, 0, this.webgl.RGBA, this.webgl.RGBA, this.webgl.UNSIGNED_BYTE, image);
    // this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.LINEAR);
    // this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR);
    // this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_S, this.webgl.CLAMP_TO_EDGE);
    // this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_T, this.webgl.CLAMP_TO_EDGE);
    this.webgl.generateMipmap(this.webgl.TEXTURE_2D);
    // this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.LINEAR_MIPMAP_NEAREST);//_MIPMAP_NEAREST);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR_MIPMAP_NEAREST);//_MIPMAP_NEAREST);

    this.webgl.bindTexture(this.webgl.TEXTURE_2D,null);
  }

  bindTextures(){
    for(let key in this.images){
      let texture = this.images[key];
      if(this.textures[key]==undefined) this.textures[key] = this.webgl.getUniformLocation(this.program, key);
      this.webgl.activeTexture(this.webgl['TEXTURE' + texture.id]);
      this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture.texture);
      this.webgl.uniform1i(texture.name, texture.id);
    }
  }

  bindUniforms(time){
    // Uniforms
    if(this.doUpdateAllUniforms) this.updateAllUniforms();
    this.update(this.internals.time, time/1000. );
  }

  updateUniform(key){
    let uniform = this.uniforms[key];
    uniform.updater.call(this.webgl,uniform.location,uniform.value);
  }

  update( key, value ){
    this.setUniform( key, value );
  }

  setUniform( key, value ){
    let uniform = this.uniforms[key];
    uniform.value = value;
    if(uniform.location!='unlinked'){
      this.updateUniform(key);
    }else {
      if(this.program){
        this.uniforms.location = this.webgl.getUniformLocation(this.program, "u_"+key);
        this.updateUniform(key);
      }
    }
  }

  render(time){
    this.clear();
    this.linkProgram();
    this.bindUniforms(time);
    this.bindTextures();
    this.renders.forEach((ren) => ren());
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

export default CanvasGL;
