var gl;
var points;
var numTimes = 5;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if( !gl ) {
        alert("WebGL isn't available!");
    }

    document.getElementById("level").onchange = function(event){
        numTimes = event.target.value;

        generateTriangles();

        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        render();
        
    }
    // Sierpinski Gasket
    generateTriangles();

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function generateTriangles() {
    // Initialize the data for the Sierpinski Gasket
    // First, initialize the corners of a gasket with three points
    var vertices = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];

    points = [];

    divideTriangle(vertices[0], vertices[1], vertices[2], numTimes);
}

function divideTriangle(a,b,c,count){
    // check for the end of recursion
    if(count == 0){
        points.push(a,b,c);
    }
    else{
        // bisect the sides
        var ab = mix(a,b,0.5);
        var bc = mix(b,c,0.5);
        var ca = mix(c,a,0.5);

        count--;

        // three new triangles
        divideTriangle(a, ab, ca, count);
        divideTriangle(b, bc, ab, count);
        divideTriangle(c, ca, bc, count);
    }
}