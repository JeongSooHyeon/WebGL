var gl;
var points = [];

var bulletStart = []; // 발사 위치
var bulletFire = []; // 발사 방향
var bulletRot = [];
var fireFlag = []; // 발사했는지

var cnt = -1; // 총 인덱스
var cut = cnt; // 컷~!
var bullRot = 0.0; // 총알 회전
var bulletCnt = 3.0; // 총 총알 갯수

var prevTime = new Date();

var viewMatrix, projectionMatrix;
var modelMatrixLoc, viewMatrixLoc, projectionMatrixLoc;
var vertCubeStart, numVertCubeTri, vertGroundStart, numVertGroundTri, numVertGroundLine;
var vertTriangleStart, numVertTriangleTri, vertPyraStart, numVertPyraTri;
var uColorLoc;

const LEG_HEIGHT    = 0.471405 + 0.942809;
const BODY_HEIGHT      = 3.0;
const BODY_WIDTH       = 5.0;
const ARM_HEIGHT      = 3.0;
const ARM_WIDTH       = 1.0;
const HEAD_HEIGHT      = 3.0;
const HEAD_WIDTH       = 3.0;
const HORN_HEIGHT      = 2.0;
const HORN_WIDTH       = 0.5;
const BROW_HEIGHT      = 0.5;
const BROW_WIDTH       = 0.2;

var eyePos = vec3(0.0, 3.0, 10.0);
var atPos = vec3(0.0, 0.0, -1.0);
var upPos = vec3(0.0, 1.0, 0.0);
var cameraVec = vec3(0, -1.41421, -1.41421);

var trballMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if( !gl ) {
        alert("WebGL isn't available!");
    }

    generateAim(); // 에임

    generateHexaPyramid(); // 뿔
    generateTetrahedron(); // 다리
    generateCube(); // 몸통 팔 총알
    generateGround(); // 바닥

    initBullet(); // 총알 관련 배열 초기화

    // virtual trackball
    var trball = trackball(canvas.width, canvas.height);
    var mouseDown = false;

    canvas.addEventListener("mousedown", function(event) {
        trball.start(event.clientX, event.clientY);

        mouseDown = true;
    });

    canvas.addEventListener("mouseup", function(event) {
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", function(event) {
        if (mouseDown) {
            trball.end(event.clientX, event.clientY);

            trballMatrix = mat4(trball.rotationMatrix);
        }
    });

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    // Enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(0.01, 1);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    uColorLoc = gl.getUniformLocation(program, "uColor");
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var modelMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    viewMatrix = lookAt(eyePos, atPos, upPos);
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));



    /*
    // 3D orthographic viewing
    //projectionMatrix = ortho(-1, 1, -1, 1, -1, 1);
    var viewLength = 100.0;
    if(canvas.width > canvas.height) { // landscape view
        var aspectRatio = viewLength * canvas.width / canvas.height;
        projectionMatrix = ortho(-aspectRatio, aspectRatio, -viewLength, viewLength, -viewLength, 1000);
    }
    else { // portrait view
        var aspectRatio = viewLength * canvas.height / canvas.clientWidth;
        projectionMatrix = ortho(-viewLength, viewLength, -aspectRatio, aspectRatio, -viewLength, 1000);
    }
    */

    var aspectRatio = canvas.width / canvas.height;
    projectionMatrix = perspective(90, aspectRatio, 0.1, 1000);

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    document.getElementById("change").onclick = function () {
        if(document.getElementById("ortho").checked) {
            var viewLength = 5.0;
            if(canvas.width > canvas.height) { // landscape view
                var aspectRatio = viewLength * canvas.width / canvas.height;
                projectionMatrix = ortho(-aspectRatio, aspectRatio, -viewLength, viewLength, -viewLength, 1000);
            }
            else { // portrait view
                var aspectRatio = viewLength * canvas.height / canvas.clientWidth;
                projectionMatrix = ortho(-viewLength, viewLength, -aspectRatio, aspectRatio, -viewLength, 1000);
            }
        }
        else{
            var aspectRatio = canvas.width / canvas.height;
            projectionMatrix = perspective(90, aspectRatio, 0.1, 1000);   
        }
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    };


    render();
};

window.onkeydown = function(event){
    var sinTheta = Math.sin(0.1);
    var cosTheta = Math.cos(0.1);

    switch (event.keyCode){   
        case 32:  // bullet 발사            
            if(cnt+1 == bulletCnt){
                alert("총알 다씀!\n'R'키를 눌러 재장전하쇼!");
                break;
            }
            cnt++;
            if(cut < cnt){
                var start = bulletStart[cnt]; // 발사 지점
                start[0] = eyePos[0];
                start[2] = eyePos[2];
                var dir = bulletFire[cnt]; // 발사 방향
                dir[0] = atPos[0] - start[0];
                dir[2] = atPos[2] - start[2];
                bulletRot[cnt] = bullRot; // 회전값
                fireFlag[cnt] = true;
                cut++;
            }
            break;
        case 82: // r : 재장전
        case 114:
            alert("재장전했땨!\n총알 갯수 : " + bulletCnt);
            cnt = -1;
            cut = -1;
            break;
        case 65:    // 'A'
        case 97:    // 'a'
            var newVecX = cosTheta*cameraVec[0] + sinTheta*cameraVec[2];
            var newVecZ = -sinTheta*cameraVec[0] + cosTheta*cameraVec[2];
            cameraVec[0] = newVecX;
            cameraVec[2] = newVecZ;
            bullRot -= 5.7;
            break;
        case 68:    // 'D'
        case 100:   // 'd'
            var newVecX = cosTheta*cameraVec[0] - sinTheta*cameraVec[2];
            var newVecZ = sinTheta*cameraVec[0] + cosTheta*cameraVec[2];
            cameraVec[0] = newVecX;
            cameraVec[2] = newVecZ;
            bullRot += 5.7;
            break;
        case 87:    // 'W'
        case 119:   // 'w'
            var newPosX = eyePos[0] + 0.5 * cameraVec[0];
            var newPosZ = eyePos[2] + 0.5 * cameraVec[2];
            if(newPosX > -10 && newPosX < 10 && newPosZ > -10 && newPosZ < 10){
                eyePos[0] = newPosX;
                eyePos[2] = newPosZ;                
            }
            break;
        case 83:    // 'S'
        case 115:   // 's'
            var newPosX = eyePos[0] - 0.5 * cameraVec[0];
            var newPosZ = eyePos[2] - 0.5 * cameraVec[2];
            if(newPosX > -10 && newPosX < 10 && newPosZ > -10 && newPosZ < 10){
                eyePos[0] = newPosX;
                eyePos[2] = newPosZ;
            }
            break;
    }
    render();
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var modelMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    
    gl.uniform4f(uColorLoc, 0.0, 0.0, 1.0, 1.0); // blue

     // left leg
    // modelMatrix = mult(modelMatrix, rotate(theta[Base], 0, 1, 0));
     var tx = 1.5;
     leg(modelMatrix, tx);    
   
     // right leg
     tx = -1.5;
     leg(modelMatrix, tx);
 
     // body
     modelMatrix = mult(modelMatrix, translate(0.0, LEG_HEIGHT, 0.0)); // 다리 위로
     // modelMatrix = mult(modelMatrix, rotate(theta[Base], 0, 1, 0));
     body(modelMatrix);
    
     // leg arm
     // modelMatrix = mult(modelMatrix, rotate(theta[Base], 0, 1, 0));
    tx = -0.75*BODY_WIDTH;
     arm(modelMatrix, tx);
 
     // right arm
     tx = 0.75*BODY_WIDTH;
     arm(modelMatrix, tx);
 
     // head
     modelMatrix = mult(modelMatrix, translate(0.0, BODY_HEIGHT, 0.0)); // 몸통 위로
     // modelMatrix = mult(modelMatrix, rotate(theta[Base], 0, 1, 0));
     head(modelMatrix);
    
     gl.uniform4f(uColorLoc, 0.0, 0.0, 0.0, 1.0); // blue
     // brow
     tx = 1.0;
     var rz = -50.0;
     brow(modelMatrix, tx, rz);

     // brow
     tx = -1.0;
     var rz = 50.0;
     brow(modelMatrix, tx, rz);

     // 뿔
     modelMatrix = mult(modelMatrix, translate(0.0, HEAD_HEIGHT, 0.0));
    // modelMatrix = mult(modelMatrix, rotate(theta[Base], 0, 1, 0));
     tx = -1.0;
      horn(modelMatrix, tx);
     
     // 뿔
     tx = 1.0;
     horn(modelMatrix, tx);
 












    let currTime = new Date();
    let elapsedTime = currTime.getTime() - prevTime.getTime();
    //theta += (elapsedTime / 10);
    prevTime = currTime;

    atPos[0] = eyePos[0] + cameraVec[0];
    atPos[1] = eyePos[1] + cameraVec[1]+1.5;
    atPos[2] = eyePos[2] + cameraVec[2];
    viewMatrix = lookAt(eyePos, atPos, upPos);
    var modelView = mult(viewMatrix, trballMatrix); // 트랙볼 먼저 곱해야 함
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(modelView));
    
    var modelMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    gl.uniform4f(uColorLoc, 0.5, 0.5, 0.5, 1.0); // gray
    ground(modelMatrix);
    
    //modelMatrix = mult(modelMatrix, translate(atPos));
    modelMatrix = mult(translate(atPos), rotateY(bullRot)); 
    modelMatrix = mult(modelMatrix, rotateX(34)); // 카메라 회전만큼
    gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0); // red
    aim(modelMatrix);

    for(var i = 0; i <= cnt; i++){
        var start = bulletStart[i];
        var dist = 0.001; // 이동 거리
        var dir = bulletFire[i]; // 발사 방향
        
        modelMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        
        modelMatrix = mult(modelMatrix, translate(start)); // 생성 위치

        dir[0] += normalize(dir[0]) * elapsedTime/100;
        dir[2] += normalize(dir[2]) * elapsedTime/100;            
        
        modelMatrix = mult(modelMatrix, translate(dir)); // 발사 방향  
        modelMatrix = mult(modelMatrix, rotateY(bulletRot[i])); 
        gl.uniform4f(uColorLoc, 1.0, 1.0, 0.0, 1.0); // gray
        bullet(modelMatrix);
    }
    requestAnimationFrame(render);
}



function leg(modelMatrix, tx){
    modelMatrix = mult(modelMatrix, translate(tx, 0.0, 0.0));
    var tMatrix = mult(translate(0.0, LEG_HEIGHT, 0.0), rotateX(160));
    var instanceMatrix = mult(modelMatrix, tMatrix);
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(instanceMatrix));
    gl.drawArrays(gl.TRIANGLES, vertTriangleStart, numVertTriangleTri);
}

function body(modelMatrix){
    var sMatrix = scalem(BODY_WIDTH, BODY_HEIGHT, BODY_WIDTH);
    var tMatrix = mult(translate(0.0, 0.5*BODY_HEIGHT, 0.0), sMatrix);
    var instanceMatrix = mult(modelMatrix, tMatrix);
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(instanceMatrix));
    gl.drawArrays(gl.TRIANGLES, vertCubeStart, numVertCubeTri);
}

function arm(modelMatrix, tx){
    modelMatrix = mult(modelMatrix, translate(tx, 0.0, 0.0));    
    var sMatrix = scalem(ARM_WIDTH, ARM_HEIGHT, ARM_WIDTH);
    var tMatrix = mult(translate(0.0, 0.5*ARM_HEIGHT, 0.0), sMatrix);
    var instanceMatrix = mult(modelMatrix, tMatrix);
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(instanceMatrix));
    gl.drawArrays(gl.TRIANGLES, vertCubeStart, numVertCubeTri);
}

function head(modelMatrix){
    var sMatrix = scalem(HEAD_WIDTH, HEAD_HEIGHT, HEAD_WIDTH);
     var tMatrix = mult(translate(0.0, 0.5*HEAD_HEIGHT, 0.0), sMatrix);
     var instanceMatrix = mult(modelMatrix, tMatrix);
     gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(instanceMatrix));
     gl.drawArrays(gl.TRIANGLES, vertCubeStart, numVertCubeTri);
}

function horn(modelMatrix, tx){
    modelMatrix = mult(modelMatrix, translate(0.0, 1.5, 0.0)); // 원래 길이
    modelMatrix = mult(modelMatrix, translate(tx, 0.0, 0.0)); 
    modelMatrix = mult(modelMatrix, rotateX(180));   
    var sMatrix = scalem(HORN_WIDTH, HORN_HEIGHT, HORN_WIDTH);
     var tMatrix = mult(translate(0.0, 0.5*HORN_HEIGHT, 0.0), sMatrix);
     var instanceMatrix = mult(modelMatrix, tMatrix);
     gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(instanceMatrix));
     gl.drawArrays(gl.TRIANGLES, vertPyraStart, numVertPyraTri);    
}

function brow(modelMatrix, tx, rz){
    modelMatrix = mult(modelMatrix, rotateZ(rz));
    modelMatrix = mult(modelMatrix, translate(tx, 0.0, 0.0));         
    var sMatrix = scalem(BROW_WIDTH, BROW_HEIGHT, BROW_WIDTH);
    var tMatrix = mult(translate(0.0, 2.0, 0.5*HEAD_WIDTH + 0.5*BROW_WIDTH), sMatrix);
    var instanceMatrix = mult(modelMatrix, tMatrix);
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(instanceMatrix));
    gl.drawArrays(gl.TRIANGLES, vertCubeStart, numVertCubeTri);
}

function aim(modelMatrix){    
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    gl.drawArrays(gl.LINES, 0, 4);
}

function ground(modelMatrix){
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    // draw the ground
    gl.drawArrays(gl.TRIANGLES, vertGroundStart, numVertGroundTri);
    gl.drawArrays(gl.LINES, vertGroundStart+numVertGroundTri, numVertGroundLine);
}

function bullet(modelMatrix){
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    gl.drawArrays(gl.TRIANGLES, vertCubeStart, numVertCubeTri);
}

function initBullet(){
    for(var i = 0; i < 3; i++){
        bulletStart[i] = vec3(0.0, 0.0, 0.0);
        bulletFire[i] = vec3(0.0, 0.0, 0.0);
        bulletRot[i] = 0.0;
        fireFlag[i] = false;
    }
}

function generateAim(){
    points.push(vec4(-0.2, 0.0, -1.0, 1.0));
    points.push(vec4(0.2, 0.0, -1.0, 1.0));

    points.push(vec4(0.0, -0.2, -1.0, 1.0));
    points.push(vec4(0.0, 0.2, -1.0, 1.0));
}

function generateHexaPyramid(){    
    vertPyraStart = points.length;
    numVertPyraTri = 0;
    const vertexPos = [
        vec4(0.0, 0.5, 0.0, 1.0),
        vec4(1.0, 0.5, 0.0, 1.0),
        vec4(0.5, 0.5, -0.866, 1.0),
        vec4(-0.5, 0.5, -0.866, 1.0), 
        vec4(-1.0, 0.5, 0.0, 1.0),
        vec4(-0.5, 0.5, 0.866, 1.0),
        vec4(0.5, 0.5, 0.866, 1.0),
        vec4(0.0, -1.0, 0.0, 1.0)
    ];

    for(var i=1; i<6; i++){
        points.push(vertexPos[0]);
        numVertPyraTri++;
        points.push(vertexPos[i]);
        numVertPyraTri++;
        points.push(vertexPos[i+1]);
        numVertPyraTri++;

        points.push(vertexPos[7]);
        numVertPyraTri++;
        points.push(vertexPos[i+1]);
        numVertPyraTri++;
        points.push(vertexPos[i]);
        numVertPyraTri++;
    }
    points.push(vertexPos[0]);
    numVertPyraTri++;
    points.push(vertexPos[6]);
    numVertPyraTri++;
    points.push(vertexPos[1]);
    numVertPyraTri++;
    
    points.push(vertexPos[7]);
    numVertPyraTri++;
    points.push(vertexPos[1]);
    numVertPyraTri++;
    points.push(vertexPos[6]);
    numVertPyraTri++;
}

function generateTetrahedron() {
    vertTriangleStart = points.length;
    numVertTriangleTri = 0;
    var va = vec4(0.0, 0.471405, 1.0, 1.0);
    var vb = vec4(0.0, 0.942809 + 0.471405, -0.333333, 1.0);
    var vc = vec4(-0.816497, 0.0 , -0.333333, 1.0);
    var vd = vec4(0.816497, 0.0 , -0.333333, 1.0);

    divideTriangle(va, vb, vc);
    divideTriangle(va, vc, vd);
    divideTriangle(va, vd, vb);
    divideTriangle(vd, vc, vb);
}

function divideTriangle(a, b, c) {
    points.push(a);
    numVertTriangleTri++;
    points.push(b);
    numVertTriangleTri++;
    points.push(c);
    numVertTriangleTri++;
}

function generateCube() {
    vertCubeStart = points.length;
    numVertCubeTri = 0;
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
    quad(6, 5, 1, 2);
}

function quad(a, b, c, d) {
    vertexPos = [
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4( 0.5, -0.5, -0.5, 1.0),
        vec4( 0.5,  0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4( 0.5, -0.5,  0.5, 1.0),
        vec4( 0.5,  0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0)
    ];

    var index = [ a, b, c, a, c, d ];
    for(var i=0; i<index.length; i++) {
        points.push(vertexPos[index[i]]);
        numVertCubeTri++;
    }
}

function generateGround() {
    vertGroundStart = points.length;
    numVertGroundTri = 0;
    var scale = 10;
    // two triangles
    points.push(vec4(scale, -1.0, -scale, 1.0));
    numVertGroundTri++;
    points.push(vec4(-scale, -1.0, -scale, 1.0));
    numVertGroundTri++;
    points.push(vec4(-scale, -1.0, scale, 1.0));
    numVertGroundTri++;
    
    points.push(vec4(scale, -1.0, -scale, 1.0));
    numVertGroundTri++;
    points.push(vec4(-scale, -1.0, scale, 1.0));
    numVertGroundTri++;
    points.push(vec4(scale, -1.0, scale, 1.0));
    numVertGroundTri++;

    // grid lines
    numVertGroundLine = 0;
    for(var x=-scale; x<=scale; x++){
        points.push(vec4(x, -1.0, -scale, 1.0));
        numVertGroundLine++;
        points.push(vec4(x, -1.0, scale, 1.0));
        numVertGroundLine++;
    }
    for(var z=-scale; z<=scale; z++){
        points.push(vec4(-scale, -1.0, z, 1.0));
        numVertGroundLine++;
        points.push(vec4(scale, -1.0, z, 1.0));
        numVertGroundLine++;
    }
}
