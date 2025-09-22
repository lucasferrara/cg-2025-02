// ====== Elementos básicos ======
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const modoEl = document.getElementById("modo");
const espEl = document.getElementById("esp");
const corNomeEl = document.getElementById("corNome");
const swatchEl = document.getElementById("swatch");

// ====== Estado ======
let modo = "linha";            // 'linha' | 'triangulo' | 'cor' | 'esp'
let corIndex = 0;              // 0..9
let espessura = 2;             // 1..9

const cores = [
  "#000000", "#e11d48", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#2563eb", "#7c3aed", "#db2777", "#64748b"
];

let desenhando = false;
let ultimo = null;
let triPts = [];

// ====== Utilitários ======
function atualizaPainel() {
  modoEl.textContent =
    modo === "linha" ? "Retas" :
    modo === "triangulo" ? "Triângulo" :
    modo === "cor" ? "Cor (digite 0–9)" :
    "Espessura (digite 1–9)";
  espEl.textContent = espessura;
  corNomeEl.textContent = String(corIndex);
  swatchEl.style.background = cores[corIndex];
}

function posRelativa(evt) {
  const r = canvas.getBoundingClientRect();
  return { x: evt.clientX - r.left, y: evt.clientY - r.top };
}

// ====== Desenho básico ======
function desenharLinha(a, b) {
  ctx.strokeStyle = cores[corIndex];
  ctx.lineWidth = espessura;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function desenharTriangulo(pts) {
  ctx.strokeStyle = cores[corIndex];
  ctx.lineWidth = espessura;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  ctx.lineTo(pts[1].x, pts[1].y);
  ctx.lineTo(pts[2].x, pts[2].y);
  ctx.closePath();
  ctx.stroke();
}

// ====== Eventos de mouse ======
canvas.addEventListener("mousedown", (e) => {
  const p = posRelativa(e);
  if (modo === "linha") {
    desenhando = true;
    ultimo = p;
  } else if (modo === "triangulo") {
    triPts.push(p);
    if (triPts.length === 3) {
      desenharTriangulo(triPts);
      triPts = [];
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!desenhando || modo !== "linha") return;
  const p = posRelativa(e);
  desenharLinha(ultimo, p);
  ultimo = p;
});

window.addEventListener("mouseup", () => {
  desenhando = false;
  ultimo = null;
});

// ====== Teclado ======
window.addEventListener("keydown", (e) => {
  const k = e.key;

  // Seleção de modo
  if (k === "r" || k === "R") modo = "linha";
  else if (k === "t" || k === "T") modo = "triangulo";
  else if (k === "k" || k === "K") modo = "cor";
  else if (k === "e" || k === "E") modo = "esp";
  else if (k === "c" || k === "C") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    triPts = [];
  }

  // Valores conforme o modo
  if (modo === "cor" && /^[0-9]$/.test(k)) {
    corIndex = parseInt(k, 10);          // 0..9
  } else if (modo === "esp" && /^[1-9]$/.test(k)) {
    espessura = parseInt(k, 10);         // 1..9
  }

  atualizaPainel();
});

// ====== Inicialização ======
atualizaPainel();
