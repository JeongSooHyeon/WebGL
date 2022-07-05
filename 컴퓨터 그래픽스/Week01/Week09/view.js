var gl;
var points = [];
var colors = [];

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye = vec3(2.0, 2.0, 2.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var trballMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if( !gl ) {
        alert("WebGL isn't available!");
    }

    generateColorCube();
    generateGround();

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

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create a buffer object, initialize it, and associate it with 
    // the associated attribute variable in our vertex shader
    var cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    
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
    


    // Event listeners for buttons
    document.getElementById("left").onclick = function () {
        
    };
    document.getElementById("right").onclick = function () {
        
    };
    document.getElementById("up").onclick = function () {
        
    };
    document.getElementById("down").onclick = function () {
        
    };

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var modelView = mult(modelViewMatrix, trballMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelView));

    // draw a color cube
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // draw the ground
    gl.drawArrays(gl.TRIANGLES, 36, 6);
    gl.drawArrays(gl.LINES, 42, 84);

    requestAnimationFrame(render);
}

function generateColorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
    quad(6, 5, 1, 2);
}

const vertexPos = [
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4( 0.5, -0.5, -0.5, 1.0),
    vec4( 0.5,  0.5, -0.5, 1.0),
    vec4(-0.5,  0.5, -0.5, 1.0),
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4( 0.5, -0.5,  0.5, 1.0),
    vec4( 0.5,  0.5,  0.5, 1.0),
    vec4(-0.5,  0.5,  0.5, 1.0)
];

const vertexColor = [
    vec4(0.0, 0.0, 0.0, 1.0),   // black
    vec4(1.0, 0.0, 0.0, 1.0),   // red
    vec4(1.0, 1.0, 0.0, 1.0),   // yellow
    vec4(0.0, 1.0, 0.0, 1.0),   // green
    vec4(0.0, 0.0, 1.0, 1.0),   // blue
    vec4(1.0, 0.0, 1.0, 1.0),   // magenta
    vec4(1.0, 1.0, 1.0, 1.0),   // white
    vec4(0.0, 1.0, 1.0, 1.0)    // cyan
];

function quad(a, b, c, d) {
    points.push(vertexPos[a]);
    colors.push(vertexColor[a]);
    points.push(vertexPos[b]);
    colors.push(vertexColor[b]);
    points.push(vertexPos[c]);
    colors.push(vertexColor[c]);
    points.push(vertexPos[a]);
    colors.push(vertexColor[a]);
    points.push(vertexPos[c]);
    colors.push(vertexColor[c]);
    points.push(vertexPos[d]);
    colors.push(vertexColor[d]);
}

function generateGround() {
    var scale = 10;
    // two triangles
    points.push(vec4(scale, -1.0, -scale, 1.0));
    colors.push(vec4(0.8, 0.8, 0.8, 1.0));
    points.push(vec4(-scale, -1.0, -scale, 1.0));
    colors.push(vec4(0.8, 0.8, 0.8, 1.0));
    points.push(vec4(-scale, -1.0, scale, 1.0));
    colors.push(vec4(0.8, 0.8, 0.8, 1.0));
    
    points.push(vec4(scale, -1.0, -scale, 1.0));
    colors.push(vec4(0.8, 0.8, 0.8, 1.0));
    points.push(vec4(-scale, -1.0, scale, 1.0));
    colors.push(vec4(0.8, 0.8, 0.8, 1.0));
    points.push(vec4(scale, -1.0, scale, 1.0));
    colors.push(vec4(0.8, 0.8, 0.8, 1.0));

    // grid lines
    for(var x=-scale; x<=scale; x++){
        points.push(vec4(x, -1.0, -scale, 1.0));
        colors.push(vec4(0.0, 0.0, 0.0, 1.0));
        points.push(vec4(x, -1.0, scale, 1.0));
        colors.push(vec4(0.0, 0.0, 0.0, 1.0));
    }
    for(var z=-scale; z<=scale; z++){
        points.push(vec4(-scale, -1.0, z, 1.0));
        colors.push(vec4(0.0, 0.0, 0.0, 1.0));
        points.push(vec4(scale, -1.0, z, 1.0));
        colors.push(vec4(0.0, 0.0, 0.0, 1.0));
    }
}
