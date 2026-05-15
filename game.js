/* ════════════════════════════════════════
   GEOTREN — Lógica del juego
   ════════════════════════════════════════ */
'use strict';

/* ─────────────────────────────────
   AUDIO
───────────────────────────────── */
var AudioCtx = null;
var soundOn = true;

function getCtx() {
  if (!AudioCtx) AudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (AudioCtx.state === 'suspended') AudioCtx.resume();
  return AudioCtx;
}
function tone(freq, type, dur, vol, delay) {
  if (!soundOn) return;
  delay = delay || 0;
  try {
    var ctx = getCtx();
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.value = freq;
    var t = ctx.currentTime + delay;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  } catch (e) { }
}
function sndSuccess() {
  [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 'sine', .3, .22, i * .09); });
}
function sndError() {
  tone(220, 'sawtooth', .25, .18, 0);
  tone(180, 'sawtooth', .2, .12, .14);
}
function sndLevelUp() {
  [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 'sine', .38, .26, i * .1); });
}
function sndWhistle() {
  [900, 1100, 900, 700, 1100, 900].forEach(function (f, i) { tone(f, 'sine', .22, .3, i * .18); });
}
function sndRotate() { tone(660, 'sine', .1, .14, 0); }

/* ─────────────────────────────────
   COLORES POR FORMA
───────────────────────────────── */
var SHAPE_COLORS = {
  circle: '#FF4757',
  square: '#1E90FF',
  rectangle: '#FFA502',
  triangle: '#FECA57'
};
var SHAPE_NAMES = {
  circle: 'Círculo', square: 'Cuadrado', rectangle: 'Rectángulo', triangle: 'Triángulo'
};

/* ─────────────────────────────────
   DEFINICIÓN DE SLOTS DEL TREN POR NIVEL
───────────────────────────────── */
var SLOTS_BY_LEVEL = {
  1: [
    // Nivel 1: Cabina simple + Vagón simple
    // Locomotora
    { id: 'loco-chimney', shape: 'rectangle', label: 'Chimenea' },
    { id: 'loco-win1', shape: 'square', label: 'Ventana' },
    { id: 'loco-body', shape: 'rectangle', label: 'Cuerpo' },
    { id: 'loco-whl1', shape: 'circle', label: 'Rueda Izq' },
    { id: 'loco-whl2', shape: 'circle', label: 'Rueda Der' },
    // Vagón simple
    { id: 'wag-roof', shape: 'triangle', label: 'Techo' },
    { id: 'wag-body', shape: 'rectangle', label: 'Cuerpo V' },
    { id: 'wag-whl1', shape: 'circle', label: 'Rueda Izq' },
    { id: 'wag-whl2', shape: 'circle', label: 'Rueda Der' },
  ],
  2: [
    // Nivel 2: Igual al nivel 1
    // Locomotora
    { id: 'loco-chimney', shape: 'rectangle', label: 'Chimenea' },
    { id: 'loco-win1', shape: 'square', label: 'Ventana' },
    { id: 'loco-body', shape: 'rectangle', label: 'Cuerpo' },
    { id: 'loco-whl1', shape: 'circle', label: 'Rueda Izq' },
    { id: 'loco-whl2', shape: 'circle', label: 'Rueda Der' },
    // Vagón 1
    { id: 'wag1-roof', shape: 'triangle', label: 'Techo V1' },
    { id: 'wag1-body', shape: 'rectangle', label: 'Cuerpo V1' },
    { id: 'wag1-whl1', shape: 'circle', label: 'Rueda V1 Izq' },
    { id: 'wag1-whl2', shape: 'circle', label: 'Rueda V1 Der' },
    // Vagón 2
    { id: 'wag2-roof', shape: 'triangle', label: 'Techo V2' },
    { id: 'wag2-body', shape: 'rectangle', label: 'Cuerpo V2' },
    { id: 'wag2-whl1', shape: 'circle', label: 'Rueda V2 Izq' },
    { id: 'wag2-whl2', shape: 'circle', label: 'Rueda V2 Der' },
  ],
  3: [
    // Nivel 3: Cabina compleja + 2 Vagones
    // Locomotora
    { id: 'loco-nose', shape: 'triangle', label: 'Punta' },
    { id: 'loco-chimney1', shape: 'rectangle', label: 'Chimenea 1' },
    { id: 'loco-chimney2', shape: 'rectangle', label: 'Chimenea 2' },
    { id: 'loco-win1', shape: 'square', label: 'Ventana' },
    { id: 'loco-roof', shape: 'triangle', label: 'Techo Cabina' },
    { id: 'loco-body', shape: 'rectangle', label: 'Cuerpo' },
    { id: 'loco-whl1', shape: 'circle', label: 'Rueda Izq' },
    { id: 'loco-whl2', shape: 'circle', label: 'Rueda Der' },
    // Vagón 1
    { id: 'wag1-roof', shape: 'triangle', label: 'Techo V1' },
    { id: 'wag1-body', shape: 'rectangle', label: 'Cuerpo V1' },
    { id: 'wag1-whl1', shape: 'circle', label: 'Rueda V1 Izq' },
    { id: 'wag1-whl2', shape: 'circle', label: 'Rueda V1 Der' },
    // Vagón 2
    { id: 'wag2-roof', shape: 'triangle', label: 'Techo V2' },
    { id: 'wag2-body', shape: 'rectangle', label: 'Cuerpo V2' },
    { id: 'wag2-whl1', shape: 'circle', label: 'Rueda V2 Izq' },
    { id: 'wag2-whl2', shape: 'circle', label: 'Rueda V2 Der' },
  ]
  ,
  4: [
    // Nivel 4: Modo libre — ensamblar sin instrucciones (cabina + 2 vagones)
    { id: 'loco-nose', shape: 'triangle', label: 'Punta' },
    { id: 'loco-chimney1', shape: 'rectangle', label: 'Chimenea 1' },
    { id: 'loco-chimney2', shape: 'rectangle', label: 'Chimenea 2' },
    { id: 'loco-win1', shape: 'square', label: 'Ventana' },
    { id: 'loco-roof', shape: 'triangle', label: 'Techo Cabina' },
    { id: 'loco-body', shape: 'rectangle', label: 'Cuerpo' },
    { id: 'loco-whl1', shape: 'circle', label: 'Rueda Izq' },
    { id: 'loco-whl2', shape: 'circle', label: 'Rueda Der' },
    { id: 'wag1-roof', shape: 'triangle', label: 'Techo V1' },
    { id: 'wag1-body', shape: 'rectangle', label: 'Cuerpo V1' },
    { id: 'wag1-whl1', shape: 'circle', label: 'Rueda V1 Izq' },
    { id: 'wag1-whl2', shape: 'circle', label: 'Rueda V1 Der' },
    { id: 'wag2-roof', shape: 'triangle', label: 'Techo V2' },
    { id: 'wag2-body', shape: 'rectangle', label: 'Cuerpo V2' },
    { id: 'wag2-whl1', shape: 'circle', label: 'Rueda V2 Izq' },
    { id: 'wag2-whl2', shape: 'circle', label: 'Rueda V2 Der' },
  ]
};

// Función para obtener los slots del nivel actual
function getAllSlots() {
  return SLOTS_BY_LEVEL[G.level] || SLOTS_BY_LEVEL[1];
}

/* Nivel 3: slots que requieren rotación exacta */
var SLOT_VALID_ROTS = {
  // Nivel 3: Triángulos y rectángulos con rotaciones específicas
  // Triángulo punta (corta hielo): rotado (cualquier ángulo válido)
  'loco-nose': [0, 90, 180, 270],
  // Techo de cabina: solo apunta arriba (0°)
  'loco-roof': [0],
  // Cuerpos: horizontal (0° o 180°)
  'loco-body': [0, 180],
  'wag-body': [0, 180],
  'wag1-body': [0, 180],
  'wag2-body': [0, 180],
  // Techos de vagones: solo apuntan arriba (0°)
  'wag-roof': [0],
  'wag1-roof': [0],
  'wag2-roof': [0],
  // Default: círculos y cuadrados siempre 0°, otros rectángulos horizontal
  // Por defecto aceptamos los ángulos muertos 0,90,180,270 — los círculos/cuadrados no rotan
  'default': [0, 90, 180, 270]
};

/* ─────────────────────────────────
   PASOS NIVEL 2
───────────────────────────────── */
var LVL2_STEPS = [
  { html: '🔴 Coloca el <b>CÍRCULO</b> en la rueda <b>IZQUIERDA</b> <span class="arrow">←</span> de la locomotora', shape: 'circle', slot: 'loco-whl1' },
  { html: '🔴 Coloca el <b>CÍRCULO</b> en la rueda <b>DERECHA</b> <span class="arrow">→</span> de la locomotora', shape: 'circle', slot: 'loco-whl2' },
  { html: '🟦 Coloca el <b>CUADRADO</b> en la ventana de la <b>CABINA</b>', shape: 'square', slot: 'loco-win1' },
  { html: '🟧 Coloca el <b>RECTÁNGULO</b> en el <b>CUERPO</b> de la locomotora', shape: 'rectangle', slot: 'loco-body' },
  { html: '🟧 Coloca el <b>RECTÁNGULO</b> como <b>CHIMENEA</b> ↑ (arriba)', shape: 'rectangle', slot: 'loco-chimney' },
  { html: '🔺 Coloca el <b>TRIÁNGULO</b> como <b>TECHO</b> del vagón — está <b>ARRIBA</b> ↑', shape: 'triangle', slot: 'wag1-roof' },
  { html: '🟧 Coloca el <b>RECTÁNGULO</b> en el <b>CUERPO</b> del vagón', shape: 'rectangle', slot: 'wag1-body' },
  { html: '🔴 Coloca el <b>CÍRCULO</b> en la rueda <b>IZQUIERDA</b> <span class="arrow">←</span> del vagón', shape: 'circle', slot: 'wag1-whl1' },
  { html: '🔴 Coloca el <b>CÍRCULO</b> en la rueda <b>DERECHA</b> <span class="arrow">→</span> del vagón', shape: 'circle', slot: 'wag1-whl2' },
];

/* ─────────────────────────────────
   ESTADO
───────────────────────────────── */
var G = {
  level: 1,
  step: 0,         // nivel 2
  correct: 0,
  total: 0,
  slots: {},       // slotId → { shape, filled }
  figs: {},        // figId  → { shape, color, rot, used, el }
};

/* ─────────────────────────────────
   INICIO / RESET
───────────────────────────────── */
function startLevel(n) {
  G.level = n;
  G.step = 0;
  G.correct = 0;

  var levelSlots = getAllSlots();
  G.total = levelSlots.length;

  // Resetear slots
  G.slots = {};
  levelSlots.forEach(function (s) {
    G.slots[s.id] = { shape: s.shape, filled: false };
  });

  document.getElementById('lvlTag').textContent =
    n === 1 ? 'Nivel 1 – Reconocimiento' :
      n === 2 ? 'Nivel 2 – Ubicación' :
        n === 3 ? 'Nivel 3 – Rotación' : 'Nivel 4 – Modo Libre';

  document.getElementById('nextBtn').classList.add('hidden');

  buildTrainHTML();
  buildBulbs();
  buildBank();
  setInstruction();
  buildRails();

  showScreen('screen-game');
}

function resetLevel() { startLevel(G.level); }

function nextLevel() {
  if (G.level < 4) startLevel(G.level + 1);
  else showWin();
}

function goMenu() {
  showScreen('screen-menu');
  stopFireworks();
}

function toggleSound() {
  soundOn = !soundOn;
  var txt = soundOn ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
  var mb = document.getElementById('menuSoundBtn');
  var gb = document.getElementById('gameSoundBtn');
  if (mb) { mb.textContent = txt; mb.classList.toggle('off', !soundOn); }
  if (gb) { gb.textContent = soundOn ? '🔊' : '🔇'; }
}

/* ─────────────────────────────────
   CONSTRUIR EL TREN (HTML)
───────────────────────────────── */
function buildTrainHTML() {
  var wrap = document.getElementById('trainWrap');
  wrap.className = 'train-wrap train-level-' + G.level;
  wrap.innerHTML = '';

  if (G.level === 1) {
    buildTrainHTML_Simple(wrap);
  } else if (G.level === 2) {
    buildTrainHTML_TwoWagons(wrap);
  } else {
    buildTrainHTML_Complex(wrap);
  }
}

function buildTrainHTML_TwoWagons(wrap) {
  // Versión intermedia: cabina simple + 2 vagones (más sencilla que la compleja)
  var loco = el('div', 'loco');
  loco.id = 'trainLoco';

  // loco-front removed per request (SVG front omitted)

  var chiArea = el('div', 'loco-chimney-area');
  chiArea.appendChild(el('div', 'chimney-top'));
  chiArea.appendChild(makeSlotEl('loco-chimney'));
  loco.appendChild(chiArea);

  var locoTop = el('div', 'loco-top');
  locoTop.appendChild(el('div', 'loco-roof-bow'));
  var faceEl = el('div', 'loco-face');
  faceEl.innerHTML = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<g fill="none" fill-rule="evenodd">'
    + '<circle cx="32" cy="28" r="12" fill="#FFDDB6" stroke="#a67c52" stroke-width="1"/>'
    + '<rect x="20" y="8" width="24" height="8" rx="3" fill="#1E90FF"/>'
    + '<circle cx="24" cy="24" r="2" fill="#333"/>'
    + '<circle cx="40" cy="24" r="2" fill="#333"/>'
    + '<path d="M22 36c3 4 14 4 17 0" stroke="#7a4f2a" stroke-width="2" stroke-linecap="round"/>'
    + '</g></svg>';
  locoTop.appendChild(faceEl);
  var wins = el('div', 'loco-wins');
  wins.appendChild(makeSlotEl('loco-win1'));
  locoTop.appendChild(wins);
  loco.appendChild(locoTop);

  var locoBody = el('div', 'loco-body');
  locoBody.appendChild(makeSlotEl('loco-body'));
  loco.appendChild(locoBody);

  loco.appendChild(el('div', 'loco-base'));

  var wRow = el('div', 'loco-wheels');
  wRow.appendChild(makeSlotEl('loco-whl1'));
  wRow.appendChild(el('div', 'axle'));
  wRow.appendChild(makeSlotEl('loco-whl2'));
  wRow.appendChild(el('div', 'wheel-deco'));
  loco.appendChild(wRow);

  wrap.appendChild(loco);

  var conn = el('div', 'connector');
  conn.innerHTML = '<div class="conn-dot"></div><div class="conn-bar"></div><div class="conn-dot"></div>';
  wrap.appendChild(conn);

  // Vagón 1
  var wagon1 = el('div', 'wagon');
  wagon1.id = 'trainWagon1';
  var roofRow1 = el('div', 'wagon-roof-row');
  roofRow1.appendChild(makeSlotEl('wag1-roof'));
  wagon1.appendChild(roofRow1);
  var wagBody1 = el('div', 'wagon-body-row');
  wagBody1.appendChild(makeSlotEl('wag1-body'));
  wagon1.appendChild(wagBody1);
  wagon1.appendChild(el('div', 'wagon-base'));
  var wRow1 = el('div', 'wagon-wheels');
  wRow1.appendChild(makeSlotEl('wag1-whl1'));
  wRow1.appendChild(el('div', 'wagon-axle'));
  wRow1.appendChild(makeSlotEl('wag1-whl2'));
  wRow1.appendChild(el('div', 'wheel-deco'));
  wagon1.appendChild(wRow1);
  wrap.appendChild(wagon1);

  var conn2 = el('div', 'connector');
  conn2.innerHTML = '<div class="conn-dot"></div><div class="conn-bar"></div><div class="conn-dot"></div>';
  wrap.appendChild(conn2);

  // Vagón 2
  var wagon2 = el('div', 'wagon');
  wagon2.id = 'trainWagon2';
  var roofRow2 = el('div', 'wagon-roof-row');
  roofRow2.appendChild(makeSlotEl('wag2-roof'));
  wagon2.appendChild(roofRow2);
  var wagBody2 = el('div', 'wagon-body-row');
  wagBody2.appendChild(makeSlotEl('wag2-body'));
  wagon2.appendChild(wagBody2);
  wagon2.appendChild(el('div', 'wagon-base'));
  var wRow2 = el('div', 'wagon-wheels');
  wRow2.appendChild(makeSlotEl('wag2-whl1'));
  wRow2.appendChild(el('div', 'wagon-axle'));
  wRow2.appendChild(makeSlotEl('wag2-whl2'));
  wRow2.appendChild(el('div', 'wheel-deco'));
  wagon2.appendChild(wRow2);
  wrap.appendChild(wagon2);
}

function buildTrainHTML_Simple(wrap) {
  /* Niveles 1 y 2: tren simple con cabina y un vagón */
  var loco = el('div', 'loco');
  loco.id = 'trainLoco';

  // loco-front removed per request (SVG front omitted)

  var chiArea = el('div', 'loco-chimney-area');
  chiArea.appendChild(el('div', 'chimney-top'));
  chiArea.appendChild(makeSlotEl('loco-chimney'));
  loco.appendChild(chiArea);

  var locoTop = el('div', 'loco-top');
  locoTop.appendChild(el('div', 'loco-roof-bow'));
  // loco-face as SVG operator
  var faceEl = el('div', 'loco-face');
  faceEl.innerHTML = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<g fill="none" fill-rule="evenodd">'
    + '<circle cx="32" cy="28" r="12" fill="#FFDDB6" stroke="#a67c52" stroke-width="1"/>'
    + '<rect x="20" y="8" width="24" height="8" rx="3" fill="#1E90FF"/>'
    + '<circle cx="24" cy="24" r="2" fill="#333"/>'
    + '<circle cx="40" cy="24" r="2" fill="#333"/>'
    + '<path d="M22 36c3 4 14 4 17 0" stroke="#7a4f2a" stroke-width="2" stroke-linecap="round"/>'
    + '</g></svg>';
  locoTop.appendChild(faceEl);

  var wins = el('div', 'loco-wins');
  wins.appendChild(makeSlotEl('loco-win1'));
  locoTop.appendChild(wins);
  loco.appendChild(locoTop);

  var locoBody = el('div', 'loco-body');
  locoBody.appendChild(makeSlotEl('loco-body'));
  loco.appendChild(locoBody);

  loco.appendChild(el('div', 'loco-base'));

  var wRow = el('div', 'loco-wheels');
  wRow.appendChild(makeSlotEl('loco-whl1'));
  wRow.appendChild(el('div', 'axle'));
  wRow.appendChild(makeSlotEl('loco-whl2'));
  wRow.appendChild(el('div', 'wheel-deco'));
  loco.appendChild(wRow);

  wrap.appendChild(loco);

  var conn = el('div', 'connector');
  conn.innerHTML = '<div class="conn-dot"></div><div class="conn-bar"></div><div class="conn-dot"></div>';
  wrap.appendChild(conn);

  var wagon = el('div', 'wagon');
  wagon.id = 'trainWagon';

  wagon.appendChild(el('div', 'wagon-front-nose'));

  var roofRow = el('div', 'wagon-roof-row');
  roofRow.appendChild(makeSlotEl('wag-roof'));
  wagon.appendChild(roofRow);

  var wagBody = el('div', 'wagon-body-row');
  wagBody.appendChild(makeSlotEl('wag-body'));
  wagon.appendChild(wagBody);

  wagon.appendChild(el('div', 'wagon-base'));

  var wRow2 = el('div', 'wagon-wheels');
  wRow2.appendChild(makeSlotEl('wag-whl1'));
  wRow2.appendChild(el('div', 'wagon-axle'));
  wRow2.appendChild(makeSlotEl('wag-whl2'));
  wRow2.appendChild(el('div', 'wheel-deco'));
  wagon.appendChild(wRow2);

  wrap.appendChild(wagon);
}

function buildTrainHTML_Complex(wrap) {
  /* Nivel 3: tren complejo con cabina mejorada y 2 vagones */
  var loco = el('div', 'loco');
  loco.id = 'trainLoco';

  loco.appendChild(el('div', 'loco-front-angle'));

  var noseRow = el('div', 'loco-nose-area');
  noseRow.appendChild(makeSlotEl('loco-nose'));
  loco.appendChild(noseRow);

  var chimneyRow = el('div', 'loco-chimneys-row');
  chimneyRow.appendChild(makeSlotEl('loco-chimney1'));
  chimneyRow.appendChild(makeSlotEl('loco-chimney2'));
  loco.appendChild(chimneyRow);

  var locoTop = el('div', 'loco-top');
  var faceEl = el('div', 'loco-face');
  faceEl.innerHTML = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<g fill="none" fill-rule="evenodd">'
    + '<circle cx="32" cy="28" r="12" fill="#FFDDB6" stroke="#a67c52" stroke-width="1"/>'
    + '<rect x="20" y="8" width="24" height="8" rx="3" fill="#1E90FF"/>'
    + '<circle cx="24" cy="24" r="2" fill="#333"/>'
    + '<circle cx="40" cy="24" r="2" fill="#333"/>'
    + '<path d="M22 36c3 4 14 4 17 0" stroke="#7a4f2a" stroke-width="2" stroke-linecap="round"/>'
    + '</g></svg>';
  locoTop.appendChild(faceEl);

  var wins = el('div', 'loco-wins');
  wins.appendChild(makeSlotEl('loco-win1'));
  locoTop.appendChild(wins);
  loco.appendChild(locoTop);

  var roofArea = el('div', 'loco-roof-area');
  roofArea.appendChild(makeSlotEl('loco-roof'));
  loco.appendChild(roofArea);

  var locoBody = el('div', 'loco-body');
  locoBody.appendChild(makeSlotEl('loco-body'));
  loco.appendChild(locoBody);

  loco.appendChild(el('div', 'loco-base'));

  var wRow = el('div', 'loco-wheels');
  wRow.appendChild(makeSlotEl('loco-whl1'));
  wRow.appendChild(el('div', 'axle'));
  wRow.appendChild(makeSlotEl('loco-whl2'));
  wRow.appendChild(el('div', 'wheel-deco'));
  loco.appendChild(wRow);

  wrap.appendChild(loco);

  var conn1 = el('div', 'connector');
  conn1.innerHTML = '<div class="conn-dot"></div><div class="conn-bar"></div><div class="conn-dot"></div>';
  wrap.appendChild(conn1);

  var wagon1 = el('div', 'wagon');
  wagon1.id = 'trainWagon1';

  wagon1.appendChild(el('div', 'wagon-front-cut'));

  var roofRow1 = el('div', 'wagon-roof-row');
  roofRow1.appendChild(makeSlotEl('wag1-roof'));
  wagon1.appendChild(roofRow1);

  var wagBody1 = el('div', 'wagon-body-row');
  wagBody1.appendChild(makeSlotEl('wag1-body'));
  wagon1.appendChild(wagBody1);

  wagon1.appendChild(el('div', 'wagon-base'));

  var wRow1 = el('div', 'wagon-wheels');
  wRow1.appendChild(makeSlotEl('wag1-whl1'));
  wRow1.appendChild(el('div', 'wagon-axle'));
  wRow1.appendChild(makeSlotEl('wag1-whl2'));
  wRow1.appendChild(el('div', 'wheel-deco'));
  wagon1.appendChild(wRow1);

  wrap.appendChild(wagon1);

  var conn2 = el('div', 'connector');
  conn2.innerHTML = '<div class="conn-dot"></div><div class="conn-bar"></div><div class="conn-dot"></div>';
  wrap.appendChild(conn2);

  var wagon2 = el('div', 'wagon');
  wagon2.id = 'trainWagon2';

  wagon2.appendChild(el('div', 'wagon-front-cut'));

  var roofRow2 = el('div', 'wagon-roof-row');
  roofRow2.appendChild(makeSlotEl('wag2-roof'));
  wagon2.appendChild(roofRow2);

  var wagBody2 = el('div', 'wagon-body-row');
  wagBody2.appendChild(makeSlotEl('wag2-body'));
  wagon2.appendChild(wagBody2);

  wagon2.appendChild(el('div', 'wagon-base'));

  var wRow2 = el('div', 'wagon-wheels');
  wRow2.appendChild(makeSlotEl('wag2-whl1'));
  wRow2.appendChild(el('div', 'wagon-axle'));
  wRow2.appendChild(makeSlotEl('wag2-whl2'));
  wRow2.appendChild(el('div', 'wheel-deco'));
  wagon2.appendChild(wRow2);

  wrap.appendChild(wagon2);
}

function makeSlotEl(slotId) {
  var levelSlots = getAllSlots();
  var def = levelSlots.find(function (s) { return s.id === slotId; });
  var d = el('div', 'slot');
  d.dataset.slotId = slotId;
  d.dataset.shape = def.shape;

  // Hint de forma
  var hint = el('div', 'slot-hint');
  var inner;
  if (def.shape === 'triangle') {
    inner = el('div', 'sh-triangle');
  } else {
    inner = el('div', 'sh-' + def.shape);
    // Asegurar que la hint ocupe el contenedor del slot para que el tamaño coincida
    inner.style.width = '100%';
    inner.style.height = '100%';
  }
  hint.appendChild(inner);
  d.appendChild(hint);

  // Label
  var lbl = el('span', 'slot-lbl', def.label);
  d.appendChild(lbl);

  return d;
}

/* ─────────────────────────────────
   BANCO DE FIGURAS
───────────────────────────────── */
function buildBank() {
  var row = document.getElementById('bankRow');
  row.innerHTML = '';
  G.figs = {};

  var list = makeFigList();
  list = shuffle(list);

  list.forEach(function (f, i) {
    var id = 'fig' + i;
    var color = SHAPE_COLORS[f.shape];
    G.figs[id] = { shape: f.shape, color: color, rot: f.rot, used: false, el: null };

    var wrap = el('div', 'fig-wrap');
    wrap.id = 'fw_' + id;

    var figEl = el('div', 'fig');
    figEl.dataset.figId = id;
    G.figs[id].el = figEl;

    // La forma visual
    figEl.appendChild(makeShapeEl(f.shape, color, f.rot, id));

    // Botón rotar (solo nivel 3, y solo para rectángulos y triángulos)
    var canRotate = (f.shape === 'rectangle' || f.shape === 'triangle');
    if (G.level === 3 && canRotate) {
      var rb = el('button', 'rot-btn', '🔄');
      rb.title = 'Rotar figura';
      rb.setAttribute('aria-label', 'Rotar figura');
      (function (fid) {
        rb.addEventListener('click', function (e) { e.stopPropagation(); rotateFig(fid); });
        rb.addEventListener('touchend', function (e) { e.stopPropagation(); e.preventDefault(); rotateFig(fid); });
      })(id);
      figEl.appendChild(rb);
    }

    wrap.appendChild(figEl);
    wrap.appendChild(el('span', 'fig-lbl', SHAPE_NAMES[f.shape]));

    if (G.level === 3 && canRotate) {
      var degEl = el('span', 'rot-deg', f.rot + '°');
      degEl.id = 'deg_' + id;
      wrap.appendChild(degEl);
    }

    DragEngine.attach(wrap, id);
    row.appendChild(wrap);
  });
}

/* Lista de figuras según nivel */
function makeFigList() {
  if (G.level === 1) {
    var levelSlots = getAllSlots();
    var list = levelSlots.map(function (s) { return { shape: s.shape, rot: 0 }; });
    list.push({ shape: 'circle', rot: 0 });
    list.push({ shape: 'triangle', rot: 0 });
    return list;
  }
  if (G.level === 2) {
    var step = LVL2_STEPS[G.step];
    var distractors = ['circle', 'square', 'rectangle', 'triangle']
      .filter(function (sh) { return sh !== step.shape; })
      .slice(0, 2);
    var out = [{ shape: step.shape, rot: 0 }];
    distractors.forEach(function (sh) { out.push({ shape: sh, rot: 0 }); });
    return out;
  }
  if (G.level === 3) {
    var levelSlots = getAllSlots();
    return levelSlots.map(function (s) {
      var r = 0;
      if (s.shape === 'rectangle') {
        r = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
      } else if (s.shape === 'triangle') {
        r = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
      }
      // circle y square siempre a 0
      return { shape: s.shape, rot: r };
    });
  }
  if (G.level === 4) {
    // Modo libre: dar todas las piezas necesarias + algunos extras
    var levelSlots = getAllSlots();
    var out = levelSlots.map(function (s) {
      var r = 0;
      if (s.shape === 'rectangle' || s.shape === 'triangle') {
        r = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
      }
      return { shape: s.shape, rot: r };
    });
    // Añadir unos distractores extras para que haya opciones
    out.push({ shape: 'circle', rot: 0 });
    out.push({ shape: 'square', rot: 0 });
    return out;
  }
  return [];
}

/* Crear el elemento visual de la forma */
function makeShapeEl(shape, color, rot, figId) {
  if (shape === 'triangle') {
    var wrap = el('div', 'shape-triangle-wrap');
    var tri = el('div', 'shape-triangle');
    tri.style.borderLeft = '28px solid transparent';
    tri.style.borderRight = '28px solid transparent';
    tri.style.borderBottom = '52px solid ' + color;
    tri.style.transform = 'rotate(' + rot + 'deg)';
    tri.id = 'triinner_' + figId;
    wrap.appendChild(tri);
    return wrap;
  }
  var s = el('div', 'shape shape-' + shape);
  s.id = 'shape_' + figId;
  s.style.transform = 'rotate(' + rot + 'deg)';
  if (shape === 'circle') {
    // Wheel-like visual
    s.style.width = '64px'; s.style.height = '64px';
    s.style.borderRadius = '50%';
    s.style.background = 'radial-gradient(circle at 40% 35%, #fff8 0 8%, rgba(0,0,0,0.06) 12%, ' + color + ' 30%)';
    s.style.border = '4px solid rgba(0,0,0,0.5)';
    s.style.boxShadow = 'inset 0 6px 10px rgba(255,255,255,0.06), 0 6px 12px rgba(0,0,0,0.18)';
  } else if (shape === 'rectangle') {
    // Cylinder-ish body
    s.style.width = '110px'; s.style.height = '56px';
    s.style.borderRadius = '22px';
    s.style.background = 'linear-gradient(180deg,' + color + ', #c87100)';
    s.style.border = '3px solid rgba(0,0,0,0.22)';
    s.style.boxShadow = 'inset 0 8px 0 rgba(255,255,255,0.12), 0 6px 14px rgba(0,0,0,0.18)';
  } else if (shape === 'square') {
    s.style.width = '64px'; s.style.height = '64px';
    s.style.borderRadius = '10px';
    s.style.background = 'linear-gradient(180deg,' + color + ', #1a6bd1)';
    s.style.border = '3px solid rgba(0,0,0,0.22)';
    s.style.boxShadow = 'inset 0 6px 0 rgba(255,255,255,0.08), 0 6px 12px rgba(0,0,0,0.14)';
  }
  return s;
}

function rotateFig(figId) {
  var fig = G.figs[figId];
  if (!fig || fig.used) return;

  // Solo permitir rotación para rectángulos y triángulos
  if (fig.shape !== 'rectangle' && fig.shape !== 'triangle') return;

  fig.rot = (fig.rot + 90) % 360;
  sndRotate();

  // Actualizar visual
  var si = document.getElementById('shape_' + figId);
  if (si) si.style.transform = 'rotate(' + fig.rot + 'deg)';
  var ti = document.getElementById('triinner_' + figId);
  if (ti) ti.style.transform = 'rotate(' + fig.rot + 'deg)';

  var degEl = document.getElementById('deg_' + figId);
  if (degEl) degEl.textContent = fig.rot + '°';
}

/* ─────────────────────────────────
   INSTRUCCIÓN
───────────────────────────────── */
function setInstruction() {
  var box = document.getElementById('instr');
  var lvl = G.level;

  if (lvl === 1) {
    box.innerHTML = '🚂 <b>Arrastra</b> cada figura al espacio de la <b>misma forma</b> en el tren';
  } else if (lvl === 2) {
    var step = LVL2_STEPS[G.step];
    box.innerHTML = step.html +
      '<span class="badge">Paso ' + (G.step + 1) + ' / ' + LVL2_STEPS.length + '</span>';
    // Resaltar slot objetivo
    document.querySelectorAll('.slot').forEach(function (s) { s.classList.remove('target'); });
    var targetEl = document.querySelector('.slot[data-slot-id="' + step.slot + '"]');
    if (targetEl) targetEl.classList.add('target');
  } else if (lvl === 3) {
    box.innerHTML = '🔄 Las figuras están giradas — presiona <b>🔄</b> para rotarlas y ubícalas en el tren';
  } else {
    box.innerHTML = '🛠️ Nivel Libre — construye el tren por ti mismo con las piezas disponibles';
  }
}

/* ─────────────────────────────────
   BULBS (luces de progreso)
───────────────────────────────── */
function buildBulbs() {
  var row = document.getElementById('bulbs');
  row.innerHTML = '';
  var n = Math.min(G.total, 12); // máx 12 bulbs visibles
  for (var i = 0; i < n; i++) {
    var b = el('span', 'bulb', '💡');
    b.id = 'b' + i;
    row.appendChild(b);
  }
}
function lightBulb(i) {
  var b = document.getElementById('b' + i);
  if (!b) return;
  b.style.animation = 'none';
  b.offsetHeight; // reflow
  b.classList.add('on');
}

/* ─────────────────────────────────
   RAILS
───────────────────────────────── */
function buildRails() {
  // Rails ya están en HTML estático, nada que hacer
}

/* ─────────────────────────────────
   DROP LOGIC
───────────────────────────────── */
function attemptDrop(figId, slotId) {
  var fig = G.figs[figId];
  var slot = G.slots[slotId];
  if (!fig || !slot || slot.filled || fig.used) return;

  var slotEl = document.querySelector('.slot[data-slot-id="' + slotId + '"]');
  if (!slotEl || slotEl.classList.contains('filled')) return;

  var valid = false;

  if (G.level === 1) {
    // Solo validar tipo de figura
    valid = (fig.shape === slot.shape);

  } else if (G.level === 2) {
    // Validar tipo + posición correcta (slot correcto del paso actual)
    var step = LVL2_STEPS[G.step];
    valid = (fig.shape === slot.shape) && (slotId === step.slot);

  } else if (G.level === 3 || G.level === 4) {
    // Validar tipo + rotación
    var vRots = SLOT_VALID_ROTS[slotId] || SLOT_VALID_ROTS['default'];
    var r = ((fig.rot % 360) + 360) % 360;
    valid = (fig.shape === slot.shape) && vRots.indexOf(r) !== -1;
  }

  if (valid) onCorrect(figId, slotId, slotEl, fig, slot);
  else onError(figId, slotId, slotEl, fig, slot);
}

function onCorrect(figId, slotId, slotEl, fig, slot) {
  fig.used = true;
  slot.filled = true;
  G.correct++;

  // Marcar figura usada en banco
  var wrap = document.getElementById('fw_' + figId);
  if (wrap) wrap.style.opacity = '0.2';
  if (fig.el) fig.el.classList.add('fig-used');

  // Llenar slot visualmente
  fillSlot(slotEl, fig);

  // Quitar target highlight
  slotEl.classList.remove('target');

  // Bulb
  lightBulb(G.correct - 1);
  sndSuccess();

  // Flash
  slotEl.classList.add('slot-correct-flash');
  setTimeout(function () { slotEl.classList.remove('slot-correct-flash'); }, 600);

  // Avanzar paso en nivel 2
  if (G.level === 2) {
    G.step++;
    if (G.step < LVL2_STEPS.length) {
      setTimeout(function () { buildBank(); setInstruction(); }, 500);
    }
  }

  // Verificar completado
  setTimeout(checkComplete, 350);
}

function onError(figId, slotId, slotEl, fig, slot) {
  sndError();
  slotEl.classList.add('error');
  setTimeout(function () { slotEl.classList.remove('error'); }, 500);

  var msg = '¡Esa figura no encaja ahí! Inténtalo de nuevo 😊';
  if (G.level === 2) {
    var step = LVL2_STEPS[G.step];
    if (fig.shape !== slot.shape) {
      msg = '¡Necesitas un ' + SHAPE_NAMES[step.shape] + '! Busca esa figura 🔍';
    } else {
      msg = '¡Figura correcta pero en el lugar incorrecto! Fíjate en la instrucción 👀';
    }
  } else if (G.level === 3 && fig.shape === slot.shape) {
  } else if ((G.level === 3 || G.level === 4) && fig.shape === slot.shape) {
    // Mostrar ángulo correcto para figuras rotables
    var vRots = SLOT_VALID_ROTS[slotId] || SLOT_VALID_ROTS['default'];
    if (fig.shape === 'circle' || fig.shape === 'square') {
      msg = '¡Esa forma no se puede rotar! ¡Ya está en la posición correcta! 🔄';
    } else if (vRots.length === 1) {
      msg = '¡Gira la figura a ' + vRots[0] + '°! Usa el botón 🔄';
    } else {
      msg = '¡Gira la figura! Ángulos válidos: ' + vRots.join(', ') + '° 🔄';
    }
  }
  showToast(msg);
}

function fillSlot(slotEl, fig) {
  slotEl.classList.add('filled');
  slotEl.innerHTML = '';

  var placed = el('div', 'placed');

  if (fig.shape === 'circle') {
    var c = makeShapeEl('circle', fig.color, 0, 'placed_' + slotEl.dataset.slotId);
    // ajustar al contenedor
    c.style.width = '90%'; c.style.height = '90%'; c.style.borderWidth = '3px';
    placed.appendChild(c);
  } else if (fig.shape === 'square') {
    var s = makeShapeEl('square', fig.color, 0, 'placed_' + slotEl.dataset.slotId);
    s.style.width = '88%'; s.style.height = '88%';
    placed.appendChild(s);
  } else if (fig.shape === 'rectangle') {
    var r = makeShapeEl('rectangle', fig.color, fig.rot, 'placed_' + slotEl.dataset.slotId);
    r.style.width = '92%'; r.style.height = '88%';
    placed.appendChild(r);
  } else if (fig.shape === 'triangle') {
    var tw = makeShapeEl('triangle', fig.color, fig.rot, 'placed_' + slotEl.dataset.slotId);
    // triangle wrap already sized to content; expand to fit
    tw.style.width = '100%'; tw.style.height = '100%';
    placed.appendChild(tw);
  }

  slotEl.appendChild(placed);

  var chk = el('span', 'placed-check', '✅');
  slotEl.appendChild(chk);
}

/* ─────────────────────────────────
   COMPLETADO
───────────────────────────────── */
function checkComplete() {
  if (G.correct < G.total) return;
  setTimeout(function () {
    sndWhistle();
    animateTrain();
    setTimeout(function () {
      if (G.level < 3) showLvlDone();
      else showWin();
    }, 2400);
  }, 300);
}

function animateTrain() {
  var loco = document.getElementById('trainLoco');
  if (!loco) return;
  loco.style.transition = 'transform 2s ease-in-out';
  loco.style.transform = 'translateX(16px) rotate(-1.5deg)';

  // Humo en chimenea
  var chiArea = loco.querySelector('.loco-chimney-area');
  if (chiArea) {
    for (var i = 0; i < 6; i++) {
      (function (delay) {
        setTimeout(function () {
          var puff = document.createElement('div');
          var sz = 16 + Math.random() * 14;
          puff.style.cssText = 'position:absolute;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;' +
            'background:rgba(200,200,200,.55);top:' + (-sz) + 'px;left:' + (6 - sz / 2) + 'px;pointer-events:none;' +
            'animation:smokePuff 1.8s ease-out forwards;';
          chiArea.style.position = 'relative';
          chiArea.appendChild(puff);
          setTimeout(function () { puff.remove(); }, 2200);
        }, delay);
      })(i * 280);
    }
  }
}

function showLvlDone() {
  var msgs = ['¡Nivel 1 completado!', '¡Nivel 2 completado!', '¡Nivel 3 completado!', '¡Nivel 4 completado!'];
  document.getElementById('lvlMsg').textContent = msgs[G.level - 1] + ' ¡Excelente trabajo! 🎊';
  makeConfetti('modalConfetti');
  sndLevelUp();
  showScreen('screen-lvl');
  // Auto-avanzar al siguiente nivel tras mostrar la modal (mejora UX)
  setTimeout(function () {
    if (G.level < 4) nextLevel();
  }, 1600);
}

function showWin() {
  makeFireworks();
  sndWhistle();
  setTimeout(sndLevelUp, 700);
  showScreen('screen-win');
}

/* ─────────────────────────────────
   EFECTOS VISUALES
───────────────────────────────── */
function makeConfetti(cid) {
  var c = document.getElementById(cid);
  if (!c) return;
  c.innerHTML = '';
  var cols = ['#FF4757', '#FFD700', '#2ED573', '#1E90FF', '#A55EEA', '#FF6B81', '#FFA502'];
  for (var i = 0; i < 45; i++) {
    var p = document.createElement('div');
    p.className = 'confetti-bit';
    p.style.cssText = 'background:' + cols[i % cols.length] + ';left:' + (Math.random() * 100) + '%;' +
      'animation-duration:' + (1.2 + Math.random() * 1.4) + 's;animation-delay:' + (Math.random() * .7) + 's;' +
      'border-radius:' + (Math.random() > .5 ? '50%' : '2px') + ';' +
      'width:' + (6 + Math.random() * 7) + 'px;height:' + (6 + Math.random() * 7) + 'px;';
    c.appendChild(p);
  }
}

var _fwInterval = null;
function makeFireworks() {
  stopFireworks();
  var bg = document.getElementById('fwBg');
  if (!bg) return;
  var emojis = ['🎆', '🎇', '✨', '🌟', '💫', '🎉', '🎊'];
  var emit = function () {
    bg.innerHTML = '';
    for (var i = 0; i < 12; i++) {
      (function (delay) {
        setTimeout(function () {
          var fw = document.createElement('div');
          fw.className = 'fw';
          fw.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          fw.style.left = (8 + Math.random() * 84) + '%';
          fw.style.top = (5 + Math.random() * 65) + '%';
          fw.style.animationDuration = (1 + Math.random() * .8) + 's';
          bg.appendChild(fw);
          setTimeout(function () { fw.remove(); }, 2200);
        }, delay);
      })(i * 220);
    }
  };
  emit();
  _fwInterval = setInterval(emit, 4000);
}
function stopFireworks() {
  if (_fwInterval) { clearInterval(_fwInterval); _fwInterval = null; }
}

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
}

/* ─────────────────────────────────
   DRAG ENGINE (mouse + touch)
───────────────────────────────── */
var DragEngine = {
  active: null,

  init: function () {
    document.addEventListener('mousemove', function (e) { DragEngine._move(e.clientX, e.clientY); });
    document.addEventListener('touchmove', function (e) {
      if (DragEngine.active) e.preventDefault();
      var t = e.touches[0];
      DragEngine._move(t.clientX, t.clientY);
    }, { passive: false });
    document.addEventListener('mouseup', function (e) { DragEngine._end(e.clientX, e.clientY); });
    document.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      DragEngine._end(t.clientX, t.clientY);
    });
  },

  attach: function (wrapEl, figId) {
    var start = function (cx, cy) {
      var fig = G.figs[figId];
      if (!fig || fig.used) return;

      // Encontrar el elemento de forma dentro del wrap
      var shapeEl = wrapEl.querySelector('.fig');
      if (!shapeEl) return;
      var rect = shapeEl.getBoundingClientRect();

      var ghost = document.getElementById('ghost');
      // Copiar contenido visual al ghost
      ghost.innerHTML = shapeEl.innerHTML;
      ghost.style.width = rect.width + 'px';
      ghost.style.height = rect.height + 'px';
      ghost.style.display = 'block';

      wrapEl.style.opacity = '0.25';

      DragEngine.active = {
        figId: figId, wrapEl: wrapEl, ghost: ghost,
        ox: cx - rect.left, oy: cy - rect.top
      };
      DragEngine._posGhost(cx, cy);
    };

    wrapEl.addEventListener('mousedown', function (e) {
      e.preventDefault(); start(e.clientX, e.clientY);
    });
    wrapEl.addEventListener('touchstart', function (e) {
      e.preventDefault();
      start(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
  },

  _move: function (cx, cy) {
    if (!this.active) return;
    this._posGhost(cx, cy);
    document.querySelectorAll('.slot:not(.filled)').forEach(function (s) { s.classList.remove('over'); });
    var s = this._slotAt(cx, cy);
    if (s) s.classList.add('over');
  },

  _end: function (cx, cy) {
    if (!this.active) return;
    var figId = this.active.figId;
    var wrapEl = this.active.wrapEl;
    var ghost = this.active.ghost;

    document.querySelectorAll('.slot').forEach(function (s) { s.classList.remove('over'); });
    ghost.style.display = 'none';
    wrapEl.style.opacity = '1';

    var slotEl = this._slotAt(cx, cy);
    if (slotEl && !slotEl.classList.contains('filled')) {
      attemptDrop(figId, slotEl.dataset.slotId);
    }

    this.active = null;
  },

  _posGhost: function (cx, cy) {
    if (!this.active) return;
    var g = this.active.ghost;
    g.style.left = (cx - this.active.ox) + 'px';
    g.style.top = (cy - this.active.oy) + 'px';
  },

  _slotAt: function (cx, cy) {
    var slots = document.querySelectorAll('.slot:not(.filled)');
    for (var i = 0; i < slots.length; i++) {
      var r = slots[i].getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return slots[i];
    }
    return null;
  }
};

/* ─────────────────────────────────
   UTILIDADES
───────────────────────────────── */
function el(tag, cls, txt) {
  var d = document.createElement(tag);
  if (cls) d.className = cls;
  if (txt !== undefined) d.textContent = txt;
  return d;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (s) {
    s.classList.toggle('active', s.id === id);
  });
  if (id !== 'screen-win') stopFireworks();
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

/* Smoke animation keyframe added dynamically */
(function () {
  var s = document.createElement('style');
  s.textContent = [
    '@keyframes smokePuff{0%{transform:scale(.4) translateY(0);opacity:.7}100%{transform:scale(2.2) translateY(-55px);opacity:0}}',
    '.slot-correct-flash{animation:cFlash .5s ease !important}',
    '@keyframes cFlash{0%,100%{box-shadow:0 0 0 0 rgba(46,213,115,0)}50%{box-shadow:0 0 0 14px rgba(46,213,115,.3)}}'
  ].join('');
  document.head.appendChild(s);
})();

/* ─────────────────────────────────
   INICIO
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  DragEngine.init();
  showScreen('screen-menu');
  window.startLevel = startLevel;
  window.resetLevel = resetLevel;
  window.nextLevel = nextLevel;
  window.goMenu = goMenu;
  window.toggleSound = toggleSound;
  console.log('🚂 GeoTren listo!');
});
