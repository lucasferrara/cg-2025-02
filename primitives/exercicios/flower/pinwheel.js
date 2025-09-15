// Vertex shader source code
const vertexShaderPinwheel = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderPinwheel = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

function createShaderPinwheel(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgramPinwheel(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// Function to create triangle vertices
function triangleVerticesPinwheel(x1, y1, x2, y2, x3, y3) {
    return new Float32Array([
        x1, y1,
        x2, y2,
        x3, y3
    ]);
}

// Function to create circle vertices for center
function circleVerticesPinwheel(xc, yc, radius, numSides) {
    const vertices = [];

    // Center point
    vertices.push(xc, yc);

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x + xc, y + yc);
    }

    return new Float32Array(vertices);
}

// Function to create uniform color array
function createColorArrayPinwheel(color, numVertices) {
    const colors = [];
    for (let i = 0; i < numVertices; i++) {
        colors.push(...color);
    }
    return new Float32Array(colors);
}

function mainPinwheel() {
    const canvas = document.getElementById('glCanvas4');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShaderPinwheel(gl, gl.VERTEX_SHADER, vertexShaderPinwheel);
    const fragmentShader = createShaderPinwheel(gl, gl.FRAGMENT_SHADER, fragmentShaderPinwheel);

    const program = createProgramPinwheel(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 1 petala (direita cima)
    let vertices = triangleVerticesPinwheel(0.0, 0.0, 0.3, 0.1, 0.1, 0.3);
    let colors = createColorArrayPinwheel([1.0, 0.2, 0.2], 3); // vermelho

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 2 petala (esquerda cima)
    vertices = triangleVerticesPinwheel(0.0, 0.0, -0.1, 0.3, -0.3, 0.1);
    colors = createColorArrayPinwheel([0.2, 0.2, 1.0], 3); // azul

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 3 petala (esquerda baixo)
    vertices = triangleVerticesPinwheel(0.0, 0.0, -0.3, -0.1, -0.1, -0.3);
    colors = createColorArrayPinwheel([0.2, 1.0, 0.2], 3); // verde

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 4 petala (direita baixo)
    vertices = triangleVerticesPinwheel(0.0, 0.0, 0.1, -0.3, 0.3, -0.1);
    colors = createColorArrayPinwheel([1.0, 1.0, 0.2], 3); // amarelo

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // centro
    const numSides = 12;
    vertices = circleVerticesPinwheel(0.0, 0.0, 0.05, numSides);
    colors = createColorArrayPinwheel([1.0, 1.0, 1.0], numSides + 2); 

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides + 2);
}

window.addEventListener('load', mainPinwheel);