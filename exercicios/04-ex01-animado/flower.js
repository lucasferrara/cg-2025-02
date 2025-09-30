// Vertex shader source code
const vertexShaderFlower = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderFlower = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

function createShaderFlower(gl, type, source) {
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

function createProgramFlower(gl, vertexShader, fragmentShader) {
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

function circleVertices(xc,yc,radius,numSides) {
    const vertices = [];

    // Center point of the pentagon
    vertices.push(0.0+xc, 0.0+yc);

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x+xc, y+yc);
    }

    return new Float32Array(vertices);
}

function circleColor(numSides,color) {
  const colors = [];

  colors.push(...color);

  for (let i = 0; i <= numSides; i++) {
    colors.push(...color);
  }

  return new Float32Array(colors);
}

function mainFlower() {
    const canvas = document.getElementById('glCanvasFlower');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShaderFlower(gl, gl.VERTEX_SHADER, vertexShaderFlower);
    const fragmentShader = createShaderFlower(gl, gl.FRAGMENT_SHADER, fragmentShaderFlower);

    const program = createProgramFlower(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    let vertices = [];
    let colors = [];

    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    let numSides = 20;
    let radius = 0.1;
    let rotation = 0;

    function drawFlower() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Centro da flor (amarelo) - não rotaciona
        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(0.0,0.0,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[1.0,1.0,0.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        // Pétalas que rotacionam
        const petalPositions = [
            {x: 0.2, y: 0.0},
            {x: -0.2, y: 0.0},
            {x: 0.0, y: 0.2},
            {x: 0.0, y: -0.2}
        ];

        petalPositions.forEach(pos => {
            // Aplicar rotação
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            const rotatedX = pos.x * cos - pos.y * sin;
            const rotatedY = pos.x * sin + pos.y * cos;

            gl.enableVertexAttribArray(positionLocation);
            vertices = circleVertices(rotatedX, rotatedY, radius, numSides);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(colorLocation);
            colors = circleColor(numSides,[1.0,0.0,0.0]);
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
            gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);
        });

        rotation += 0.02; // Velocidade de rotação
        requestAnimationFrame(drawFlower);
    }

    drawFlower();
}

window.addEventListener('load', mainFlower);