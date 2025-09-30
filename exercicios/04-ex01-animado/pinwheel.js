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

    let rotation = 0;

    function drawPinwheel() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); 
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Posições originais das pétalas
        const petalPositions = [
            {x1: 0.0, y1: 0.0, x2: 0.3, y2: 0.1, x3: 0.1, y3: 0.3, color: [1.0, 0.2, 0.2]}, // vermelho
            {x1: 0.0, y1: 0.0, x2: -0.1, y2: 0.3, x3: -0.3, y3: 0.1, color: [0.2, 0.2, 1.0]}, // azul
            {x1: 0.0, y1: 0.0, x2: -0.3, y2: -0.1, x3: -0.1, y3: -0.3, color: [0.2, 1.0, 0.2]}, // verde
            {x1: 0.0, y1: 0.0, x2: 0.1, y2: -0.3, x3: 0.3, y3: -0.1, color: [1.0, 1.0, 0.2]} // amarelo
        ];

        // Desenhar pétalas rotacionadas
        petalPositions.forEach(petal => {
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            
            // Rotacionar os vértices da pétala
            const x1 = petal.x1 * cos - petal.y1 * sin;
            const y1 = petal.x1 * sin + petal.y1 * cos;
            const x2 = petal.x2 * cos - petal.y2 * sin;
            const y2 = petal.x2 * sin + petal.y2 * cos;
            const x3 = petal.x3 * cos - petal.y3 * sin;
            const y3 = petal.x3 * sin + petal.y3 * cos;

            let vertices = triangleVerticesPinwheel(x1, y1, x2, y2, x3, y3);
            let colors = createColorArrayPinwheel(petal.color, 3);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(colorLocation);
            gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
        });

        // centro (não rotaciona)
        const numSides = 12;
        let vertices = circleVerticesPinwheel(0.0, 0.0, 0.05, numSides);
        let colors = createColorArrayPinwheel([1.0, 1.0, 1.0], numSides + 2); 

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides + 2);

        rotation += 0.03; // Velocidade de rotação
        requestAnimationFrame(drawPinwheel);
    }

    drawPinwheel();
}

window.addEventListener('load', mainPinwheel);