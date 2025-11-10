const canvas = document.getElementById('glCanvasCircle');
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('WebGL não suportado!');
  throw new Error('WebGL não suportado');
}

// Shaders
const vertexShaderSource = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  
  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uProjectionMatrix;
  
  varying vec3 vColor;
  
  void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    vColor = aColor;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vColor;
  
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

// Compilar shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Criar programa
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Erro ao linkar programa:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Geometria do Cubo
const cubeVertices = new Float32Array([
  // Frente (vermelho)
  -0.5, -0.5,  0.5,  1.0, 0.0, 0.0,
   0.5, -0.5,  0.5,  1.0, 0.0, 0.0,
   0.5,  0.5,  0.5,  1.0, 0.0, 0.0,
  -0.5,  0.5,  0.5,  1.0, 0.0, 0.0,
  
  // Trás (verde)
  -0.5, -0.5, -0.5,  0.0, 1.0, 0.0,
   0.5, -0.5, -0.5,  0.0, 1.0, 0.0,
   0.5,  0.5, -0.5,  0.0, 1.0, 0.0,
  -0.5,  0.5, -0.5,  0.0, 1.0, 0.0,
  
  // Topo (azul)
  -0.5,  0.5, -0.5,  0.0, 0.0, 1.0,
   0.5,  0.5, -0.5,  0.0, 0.0, 1.0,
   0.5,  0.5,  0.5,  0.0, 0.0, 1.0,
  -0.5,  0.5,  0.5,  0.0, 0.0, 1.0,
  
  // Base (amarelo)
  -0.5, -0.5, -0.5,  1.0, 1.0, 0.0,
   0.5, -0.5, -0.5,  1.0, 1.0, 0.0,
   0.5, -0.5,  0.5,  1.0, 1.0, 0.0,
  -0.5, -0.5,  0.5,  1.0, 1.0, 0.0,
  
  // Direita (magenta)
   0.5, -0.5, -0.5,  1.0, 0.0, 1.0,
   0.5,  0.5, -0.5,  1.0, 0.0, 1.0,
   0.5,  0.5,  0.5,  1.0, 0.0, 1.0,
   0.5, -0.5,  0.5,  1.0, 0.0, 1.0,
  
  // Esquerda (ciano)
  -0.5, -0.5, -0.5,  0.0, 1.0, 1.0,
  -0.5,  0.5, -0.5,  0.0, 1.0, 1.0,
  -0.5,  0.5,  0.5,  0.0, 1.0, 1.0,
  -0.5, -0.5,  0.5,  0.0, 1.0, 1.0
]);

const cubeIndices = new Uint16Array([
  0, 1, 2,   0, 2, 3,    // Frente
  4, 6, 5,   4, 7, 6,    // Trás
  8, 9, 10,  8, 10, 11,  // Topo
  12, 14, 13, 12, 15, 14, // Base
  16, 17, 18, 16, 18, 19, // Direita
  20, 22, 21, 20, 23, 22  // Esquerda
]);

// Plano de referência (chão)
const planeVertices = new Float32Array([
  -3.0, -0.51, -3.0,  0.3, 0.3, 0.3,
   3.0, -0.51, -3.0,  0.3, 0.3, 0.3,
   3.0, -0.51,  3.0,  0.3, 0.3, 0.3,
  -3.0, -0.51,  3.0,  0.3, 0.3, 0.3
]);

const planeIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

// Eixos coordenados
const axesVertices = new Float32Array([
  // Eixo X (vermelho)
  0.0, 0.0, 0.0,  1.0, 0.0, 0.0,
  2.0, 0.0, 0.0,  1.0, 0.0, 0.0,
  
  // Eixo Y (verde)
  0.0, 0.0, 0.0,  0.0, 1.0, 0.0,
  0.0, 2.0, 0.0,  0.0, 1.0, 0.0,
  
  // Eixo Z (azul)
  0.0, 0.0, 0.0,  0.0, 0.0, 1.0,
  0.0, 0.0, 2.0,  0.0, 0.0, 1.0
]);

// Criar buffers
function createBuffer(data, type = gl.ARRAY_BUFFER) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, gl.STATIC_DRAW);
  return buffer;
}

const cubeVBO = createBuffer(cubeVertices);
const cubeIBO = createBuffer(cubeIndices, gl.ELEMENT_ARRAY_BUFFER);
const planeVBO = createBuffer(planeVertices);
const planeIBO = createBuffer(planeIndices, gl.ELEMENT_ARRAY_BUFFER);
const axesVBO = createBuffer(axesVertices);

// Câmera
const camera = {
  position: [0, 1, 5],
  rotation: 0,
  near: 0.1,
  far: 100.0,
  left: -1.0,
  right: 1.0,
  bottom: -1.0,
  top: 1.0
};

const controls = {
  w: false, s: false,
  a: false, d: false,
  q: false, e: false,
  left: false, right: false
};

// Eventos de teclado
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key in controls) controls[key] = true;
  if (key === 'arrowleft') controls.left = true;
  if (key === 'arrowright') controls.right = true;
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key in controls) controls[key] = false;
  if (key === 'arrowleft') controls.left = false;
  if (key === 'arrowright') controls.right = false;
});

// Funções de matriz
function perspectiveMatrix(left, right, bottom, top, near, far) {
  const matrix = new Float32Array(16);
  matrix[0] = (2 * near) / (right - left);
  matrix[5] = (2 * near) / (top - bottom);
  matrix[8] = (right + left) / (right - left);
  matrix[9] = (top + bottom) / (top - bottom);
  matrix[10] = -(far + near) / (far - near);
  matrix[11] = -1;
  matrix[14] = -(2 * far * near) / (far - near);
  matrix[15] = 0;
  return matrix;
}

function lookAt(eye, target, up) {
  const zAxis = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);
  
  return new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
  ]);
}

function normalize(v) {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function identityMatrix() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
}

// Atualizar câmera
function updateCamera(deltaTime) {
  const speed = 2.0 * deltaTime;
  const rotSpeed = 1.5 * deltaTime;
  
  const forward = [
    Math.sin(camera.rotation),
    0,
    -Math.cos(camera.rotation)
  ];
  const right = [
    Math.cos(camera.rotation),
    0,
    Math.sin(camera.rotation)
  ];
  
  if (controls.w) {
    camera.position[0] += forward[0] * speed;
    camera.position[2] += forward[2] * speed;
  }
  if (controls.s) {
    camera.position[0] -= forward[0] * speed;
    camera.position[2] -= forward[2] * speed;
  }
  if (controls.a) {
    camera.position[0] -= right[0] * speed;
    camera.position[2] -= right[2] * speed;
  }
  if (controls.d) {
    camera.position[0] += right[0] * speed;
    camera.position[2] += right[2] * speed;
  }
  if (controls.q) camera.position[1] -= speed;
  if (controls.e) camera.position[1] += speed;
  
  if (controls.left) camera.rotation += rotSpeed;
  if (controls.right) camera.rotation -= rotSpeed;
}

// Renderizar
let lastTime = 0;

function render(time) {
  time *= 0.001;
  const deltaTime = time - lastTime;
  lastTime = time;
  
  updateCamera(deltaTime);
  
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  
  gl.useProgram(program);
  
  const target = [
    camera.position[0] + Math.sin(camera.rotation),
    camera.position[1],
    camera.position[2] - Math.cos(camera.rotation)
  ];
  
  const viewMatrix = lookAt(camera.position, target, [0, 1, 0]);
  const projectionMatrix = perspectiveMatrix(
    camera.left, camera.right, camera.bottom, camera.top, camera.near, camera.far
  );
  
  const uViewMatrix = gl.getUniformLocation(program, 'uViewMatrix');
  const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
  const uModelMatrix = gl.getUniformLocation(program, 'uModelMatrix');
  
  gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
  
  const aPosition = gl.getAttribLocation(program, 'aPosition');
  const aColor = gl.getAttribLocation(program, 'aColor');
  
  // Desenhar cubo
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0);
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 24, 12);
  gl.enableVertexAttribArray(aPosition);
  gl.enableVertexAttribArray(aColor);
  
  gl.uniformMatrix4fv(uModelMatrix, false, identityMatrix());
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
  
  // Desenhar plano
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVBO);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0);
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 24, 12);
  
  gl.uniformMatrix4fv(uModelMatrix, false, identityMatrix());
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIBO);
  gl.drawElements(gl.TRIANGLES, planeIndices.length, gl.UNSIGNED_SHORT, 0);
  
  // Desenhar eixos
  gl.bindBuffer(gl.ARRAY_BUFFER, axesVBO);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0);
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 24, 12);
  
  gl.uniformMatrix4fv(uModelMatrix, false, identityMatrix());
  gl.drawArrays(gl.LINES, 0, 6);
  
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

console.log('Controles:');
console.log('W/S - Frente/Trás');
console.log('A/D - Esquerda/Direita');
console.log('Q/E - Baixo/Cima');
console.log('Setas ←/→ - Rotacionar câmera');
console.log('\nExperimente alterar os valores da câmera no código:');
console.log('camera.left, camera.right, camera.bottom, camera.top');
console.log('camera.near, camera.far');