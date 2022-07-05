var gl;
var points, colors, sizes;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if( !gl ) {
        alert("WebGL isn't available!");
    }

    points = [];
    colors = [];
    sizes = [];
    var bMouseDown = false;

    canvas.addEventListener("mousedown", function(event) {
        bMouseDown = true;
    });
    canvas.addEventListener("mouseup", function(event) {
        bMouseDown = false;
    });
    canvas.addEventListener("mousemove", function(event) {
        if( bMouseDown ) { // 좌표 변형 클릭 위치 x,y좌표로
            var point = vec2(2 * event.clientX/canvas.width - 1,
                2 * (canvas.height - event.clientY) / canvas.height - 1);
           
            points.push(point);
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW); // point 위치 gpu로 전달, cpu에서만 한 거를

            sizes.push(currentSize);
            gl.bindBuffer(gl.ARRAY_BUFFER, sizeBufferId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(sizes), gl.STATIC_DRAW);  

            colors.push(currentColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, cbufferId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

            render(); // 그림 다시 그려
        }
    });

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU 메모리 잡고 링크
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
     // 포인트 사이즈
     var sizeBufferId = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, sizeBufferId);
     gl.bufferData(gl.ARRAY_BUFFER, flatten(sizes), gl.STATIC_DRAW);  
       
    // 포인트 사이즈
    var vSize = gl.getAttribLocation(program, "vSize");
    gl.vertexAttribPointer(vSize, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vSize);

    // Create a buffer object, initialize it, and associate it with
    // the associated attribute variable in our vertex shader
    var cbufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

   /* // 포인트 사이즈
    var sbufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sbufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sizes), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vSize");
    gl.vertexAttribPointer(vSize, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vSize);*/
    
    /*var pointSize = gl.getUniformLocation(program, "pointSize");
    gl.uniform1f(pointSize, 10.0);*/

    var currentSize = 10.0;
    document.getElementById("pointSize").onchange = function(){
        var size = this.value;
        //gl.uniform1f(pointSize, size);
    
        currentSize = size;
       // render();
    }

    //var fColor = gl.getUniformLocation(program, "fColor");
    //gl.uniform4f(fColor, 1.0, 0.0, 0.0, 1.0);
    var currentColor = vec4(1.0, 0.0, 0.0, 1.0);

    document.getElementById("pointColor").onclick = function(event){
        switch(event.target.value){
            case "red":
                //gl.uniform4f(fColor, 1.0, 0.0, 0.0, 1.0);
                currentColor = vec4(1.0, 0.0, 0.0, 1.0);
                break;
            case "green":
               // gl.uniform4f(fColor, 0.0, 1.0, 0.0, 1.0);
                currentColor = vec4(0.0, 1.0, 0.0, 1.0);
                break;
            case "blue":
                //gl.uniform4f(fColor, 0.0, 0.0, 1.0, 1.0);
                currentColor = vec4(0.0, 0.0, 1.0, 1.0);
                break;
            case "yellow":
                //gl.uniform4f(fColor, 1.0, 1.0, 0.0, 1.0);
                currentColor = vec4(1.0, 1.0, 0.0, 1.0);
                break;
             case "cyan":
                //gl.uniform4f(fColor, 0.0, 1.0, 1.0, 1.0);
                currentColor = vec4(0.0, 1.0, 1.0, 1.0);
                break;   
            case "magenta":
               // gl.uniform4f(fColor, 1.0, 0.0, 1.0, 1.0);
                currentColor = vec4(1.0, 0.0, 1.0, 1.0);
                break;
            case "gray":
               // gl.uniform4f(fColor, 0.5, 0.5, 0.5, 1.0);
                currentColor = vec4(0.5, 0.5, 0.5, 1.0);
                break;
            case "black":
              //  gl.uniform4f(fColor, 0.0, 0.0, 0.0, 1.0);
                currentColor = vec4(0.0, 0.0, 0.0, 1.0);
                break;                
        }
        // render();        
    }
    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points.length); // 포인트 길이만큼 다 찍어
}
