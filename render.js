const canvas = document.createElement('canvas');


var cnv = document.getElementById("draw");
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
  };
}

var width = 700;
var height = 600;
console.log(width,height);
canvas.height =width;
canvas.width = width;

cnv.appendChild(canvas);
const gl = canvas.getContext('webgl');


if  (gl === null){
  new Error("Error initialising webgl! Does your browser support it? ");
}

function LoadShaders(gl,vsSource,fsSource){
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);


  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);


  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

const vshader = `
attribute vec3 aPos;
varying highp vec2 c;
precision highp float;
void main()
{
  gl_Position = vec4(aPos,1.0);
  c = vec2(aPos.x,aPos.y);
}
`
const sshader = `
varying highp vec2 c;
precision highp float;
uniform float zoom;
uniform vec2 pan;

vec2 squareImaginary(vec2 number){
	return vec2(
		pow(number.x,2.0)-pow(number.y,2.0),
		2.0*number.x*number.y
	);
}


void main()
{
    //transform coordinates...
   vec2 m = c/zoom + pan;
  


    vec2 z = vec2(0.0,0.0); 
    int i = 0;
    float ESCAPE_RADIUS = 16.0;
    for(int j  = 0; j< 100; j++) {
     
        i = j;
        if(length(z) > ESCAPE_RADIUS) break;

        z = squareImaginary(z) + m;
    }


    float speed;
    if(i == 100)
        //speed = 0.0;
        speed = 255.0;
    else
        speed = float(i)/20.0;


    gl_FragColor = vec4(speed, speed,speed, 1.);
}

`
const program = LoadShaders(gl,vshader,sshader);
var indices = [
  1,1,1,
  1,-1,1,
 -1,-1,1,
  -1,1,1,
  1,1,1,
  -1,-1,1,
];

const inc=2.0
var x= 0.0;
var y=0.0;
var z = 0.5;
window.addEventListener('keydown',function(e){
  if(e.key==='d'){
    this.x +=0.005;
  }
  else if(e.key==='a'){
    this.x -=0.005;
  }
  else if(e.key==='s'){
    this.y-=0.005;
  }else if(e.key==='w' ){
    this.y+=0.005;
  }else if(e.key==='g' ){
    this.z+=0.06*z;
  }

});

function reset(){

  this.x = 0.0;
  this.y = 0.0;
  this.z = 0.5;
}

 const buf = gl.createBuffer();


 window.main = function () {
  window.requestAnimationFrame( main );
  
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(indices),gl.STATIC_DRAW);
  var dd = gl.getAttribLocation(program,"aPos")
  gl.vertexAttribPointer(dd,3,gl.FLOAT,false,0,0);
  var uniform = gl.getUniformLocation(program,"zoom");
  var pan = gl.getUniformLocation(program,"pan");
  gl.enableVertexAttribArray(dd);
 
 
 
 gl.useProgram(program);
 gl.uniform1f(uniform,this.z);
 gl.uniform2f(pan,this.x,this.y);
 
 gl.drawArrays(gl.TRIANGLES,0,6);
  
 
};

main();
