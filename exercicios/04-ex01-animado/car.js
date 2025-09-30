// Vertex shader source code
const vertexShaderCar = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderCar = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

function createShaderCar(gl, type, source) {
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

function createProgramCar(gl, vertexShader, fragmentShader) {
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

// Function to create rectangle vertices
function rectangleVertices(x, y, width, height) {
    return new Float32Array([
        x, y,
        x + width, y,
        x, y + height,
        x + width, y,
        x + width, y + height,
        x, y + height
    ]);
}

// Function to create circle vertices for wheels
function circleVerticesCar(xc, yc, radius, numSides) {
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
function createColorArray(color, numVertices) {
    const colors = [];
    for (let i = 0; i < numVertices; i++) {
        colors.push(...color);
    }
    return new Float32Array(colors);
}

function mainCar() {
    const canvas = document.getElementById('glCanvas2');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShaderCar(gl, gl.VERTEX_SHADER, vertexShaderCar);
    const fragmentShader = createShaderCar(gl, gl.FRAGMENT_SHADER, fragmentShaderCar);

    const program = createProgramCar(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    let carX = 0;
    let direction = 1; // 1 para direita, -1 para esquerda

    function drawCar() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Atualizar posição do carro
        carX += direction * 0.01;
        
        // Inverter direção quando chegar nas bordas
        if (carX > 0.3) {
            direction = -1;
        } else if (carX < -0.3) {
            direction = 1;
        }

        // corpo
        let vertices = rectangleVertices(-0.4 + carX, -0.1, 0.8, 0.25);
        let colors = createColorArray([0.8, 0.1, 0.1], 6); 

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // teto
        vertices = rectangleVertices(-0.3 + carX, 0.15, 0.5, 0.2);
        colors = createColorArray([0.6, 0.1, 0.1], 6); 

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // parabrisa
        vertices = rectangleVertices(-0.2 + carX, 0.2, 0.3, 0.1);
        colors = createColorArray([0.7, 0.9, 1.0], 6); 

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // roda esquerda
        const numSides = 16;
        vertices = circleVerticesCar(-0.25 + carX, -0.25, 0.1, numSides);
        colors = createColorArray([0.8, 0.8, 0.8], numSides + 2); 

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides + 2);

        // roda direita
        vertices = circleVerticesCar(0.25 + carX, -0.25, 0.1, numSides);
        colors = createColorArray([0.8, 0.8, 0.8], numSides + 2); 

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides + 2);

        requestAnimationFrame(drawCar);
    }

    drawCar();
}

window.addEventListener('load', mainCar);