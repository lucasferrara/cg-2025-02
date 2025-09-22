// circle.js — Bresenham (Midpoint) Circle em WebGL, simples

(function () {
  const canvas = document.getElementById("glCanvasCircle");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("WebGL não suportado.");
    return;
  }

  // --- Shaders mínimos (pontos) ---
  const vsSource = `
    attribute vec2 aPosition;
    uniform float uPointSize;
    void main() {
      gl_PointSize = uPointSize;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
      gl_FragColor = uColor;
    }
  `;

  function compileShader(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function createProgram(vsSrc, fsSrc) {
    const vs = compileShader(gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  const program = createProgram(vsSource, fsSource);
  gl.useProgram(program);

  const aPosition = gl.getAttribLocation(program, "aPosition");
  const uColor = gl.getUniformLocation(program, "uColor");
  const uPointSize = gl.getUniformLocation(program, "uPointSize");

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Cor branca e tamanho de ponto (2 px pra ficar visível)
  gl.uniform4f(uColor, 1.0, 1.0, 1.0, 1.0);
  gl.uniform1f(uPointSize, 2.0);

  // Converte (x,y) em pixels para NDC (-1..1)
  function toNDC(x, y) {
    const ndcX = (x / (canvas.width * 0.5)) - 1.0;
    const ndcY = 1.0 - (y / (canvas.height * 0.5));
    return [ndcX, ndcY];
  }

  // Algoritmo de Bresenham (Midpoint) para circunferência
  // Gera apenas pontos inteiros (8 simetrias).
  function bresenhamCircle(cx, cy, r) {
    const pts = [];

    let x = 0;
    let y = r;
    let d = 1 - r; // decisão inicial

    function plot8(cx, cy, x, y) {
      // oito octantes
      pts.push([cx + x, cy + y]);
      pts.push([cx - x, cy + y]);
      pts.push([cx + x, cy - y]);
      pts.push([cx - x, cy - y]);
      pts.push([cx + y, cy + x]);
      pts.push([cx - y, cy + x]);
      pts.push([cx + y, cy - x]);
      pts.push([cx - y, cy - x]);
    }

    while (x <= y) {
      plot8(cx, cy, x, y);
      if (d < 0) {
        d += 2 * x + 3;
      } else {
        d += 2 * (x - y) + 5;
        y--;
      }
      x++;
    }
    return pts;
  }

  // Desenha os pontos no WebGL
  function drawPoints(pixelPoints) {
    // Converte para NDC
    const ndc = new Float32Array(pixelPoints.length * 2);
    for (let i = 0; i < pixelPoints.length; i++) {
      const [x, y] = pixelPoints[i];
      const [nx, ny] = toNDC(x, y);
      ndc[i * 2] = nx;
      ndc[i * 2 + 1] = ny;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, ndc, gl.STATIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, pixelPoints.length);
  }

  // Clique: pega centro no clique e desenha circunferência de raio fixo
  const RADIUS_PX = 60; // escolha simples; ajuste se quiser
  canvas.addEventListener("click", (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(ev.clientX - rect.left);
    const y = Math.floor(ev.clientY - rect.top);
    const points = bresenhamCircle(x, y, RADIUS_PX);
    drawPoints(points);
  });
})();
