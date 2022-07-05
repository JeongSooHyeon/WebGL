var gl;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if( !gl ) {
        alert("WebGL isn't available!");
    }

    var vertices = [ 
        // head
        vec2(-0.8, 0.3), vec2(-0.8, -0.3),
        vec2(-0.2, -0.3), vec2(-0.2, 0.3),

        // body
        vec2(-0.2, 0.15), vec2(-0.2, -0.15),
        vec2(0.1, -0.15), vec2(0.1, 0.15),

        vec2(0.1, 0.15), vec2(0.1, -0.15),
        vec2(0.4, -0.15), vec2(0.4, 0.15),

        vec2(0.4, 0.15), vec2(0.4, -0.15),
        vec2(0.7, -0.15), vec2(0.7, 0.15),

        // eye
        vec2(-0.7, 0.2), vec2(-0.7, 0),
        vec2(-0.5, 0), vec2(-0.5, 0.2),

        // mouse
        vec2(-0.8, -0.15), vec2(-0.8, -0.25),
        vec2(-0.3, -0.1), 

        //line
        vec2(-0.8, 0.3), vec2(-0.8, -0.3),
        vec2(-0.2, -0.3),
        vec2(-0.2, -0.15), vec2(0.4, -0.15), vec2(0.7, -0.15),vec2(0.7, 0.15),
        vec2(0.4, 0.15),vec2(0.1, 0.15), vec2(-0.2, 0.15),
        vec2(-0.2, 0.3),

        // legs
        vec2(0.1, -0.15), vec2(0.1, -0.25), 
        vec2(0.4, -0.15), vec2(0.4, -0.25),
        vec2(0.7, -0.15),vec2(0.7, -0.25),

        // foot
        vec2(0.1, -0.25), vec2(0.05, -0.29), vec2(0.12, -0.29),
        vec2(0.4, -0.25), vec2(0.35, -0.29), vec2(0.42, -0.29),
        vec2(0.7, -0.25), vec2(0.65, -0.29), vec2(0.72, -0.29),

        // tail
        vec2(0.7, 0.15), vec2(0.9, 0.35), vec2(0.75, 0.25),

        // eye
        vec2(-0.65, 0.15), vec2(-0.65, 0.1),
        vec2(-0.6, 0.1), vec2(-0.6, 0.15),

        // hair
        vec2(-0.5, 0.3),vec2(-0.5, 0.4),
        vec2(-0.52, 0.3),vec2(-0.55, 0.4),
        vec2(-0.48, 0.3),vec2(-0.45, 0.4),

    ];
    var colors = [
        vec4(0.3, 0.5, 1, 1), vec4(0.3, 0.5, 1, 1),
        vec4(0.3, 0.5, 1, 1), vec4(0.3, 0.5, 1, 1),

        vec4(0.01, 0.01, 1, 1), vec4(0.01, 0.01, 1, 1),
        vec4(0.01, 0.01, 1, 1),vec4(0.01, 0.01, 1, 1),

        vec4(0.5, 0.6, 0.8, 1),  vec4(0.5, 0.6, 0.8, 1),
        vec4(0.5, 0.6, 0.8, 1), vec4(0.5, 0.6, 0.8, 1),
        
        vec4(0.2, 0.5, 0.8, 1), vec4(0.2, 0.5, 0.8, 1),
        vec4(0.2, 0.5, 0.8, 1),vec4(0.2, 0.5, 0.8, 1),
        //eye
        vec4(0, 0, 0, 1),vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1),vec4(0,0,0, 1),        
         
        // mouse
        vec4(1, 0, 0, 1), vec4(1, 0, 0, 1),
        vec4(1, 0, 0, 1), 

        // line
        vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),

        // leg
        vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),vec4(0, 0, 0, 1),  vec4(0, 0, 0, 1),
   
        // foot
        vec4(0, 0, 0, 1), vec4(0, 0, 0, 1), vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1), vec4(0, 0, 0, 1), vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1), vec4(0, 0, 0, 1), vec4(0, 0, 0, 1),

        // tail
        vec4(0, 0, 0, 1), vec4(0, 0, 0, 1), vec4(0, 0, 0, 1),

        // eye
        vec4(1, 1, 1, 1),vec4(1, 1, 1, 1),
        vec4(1, 1, 1, 1),vec4(1, 1, 1, 1),

        // hair
        vec4(0, 0, 0, 1), vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1), vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1), vec4(0, 0, 0, 1)
    ];

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //Create a buffer object, initialize it, and associate it with
    // the associated attribute variable in our vertex shader
    var cbufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 20, 3);
    gl.drawArrays(gl.LINE_LOOP, 23, 11);
    gl.drawArrays(gl.LINES, 34, 6);
    gl.drawArrays(gl.TRIANGLES, 40, 12);
    gl.drawArrays(gl.TRIANGLE_FAN, 52, 4);
    gl.drawArrays(gl.LINES, 56, 6);
}
