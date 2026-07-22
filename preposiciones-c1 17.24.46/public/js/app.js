// ── DUAL-PREP DETECTION ────────────────────────────────────────────────────
// Finds words (adj/verb) that appear with more than one preposition
const _prepMap = {};
CARDS.forEach(c => {
  if (c.c === 'adj' || c.c === 'verb') {
    if (!_prepMap[c.w]) _prepMap[c.w] = new Set();
    _prepMap[c.w].add(c.p);
  }
});
const multiPrepWords = new Set(Object.keys(_prepMap).filter(k => _prepMap[k].size > 1));

// ── RANDOM TEST GENERATION ─────────────────────────────────────────────────
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function describeCards(cards) {
  const ct = {};
  cards.forEach(c => { ct[c.c] = (ct[c.c] || 0) + 1; });
  return ['adj','noun','expr','verb'].filter(k => ct[k]).map(k => `${ct[k]} ${k}`).join(' · ');
}

const TESTS_KEY = 'prep-c1-tests-v1';

function buildAndSaveTests() {
  const allIdx = CARDS.map((_, i) => i);
  shuffle(allIdx);
  const n = allIdx.length;
  const base = Math.floor(n / 6);
  const extra = n % 6;
  const groups = [];
  let pos = 0;
  for (let i = 0; i < 6; i++) {
    const sz = base + (i < extra ? 1 : 0);
    groups.push(allIdx.slice(pos, pos + sz));
    pos += sz;
  }
  localStorage.setItem(TESTS_KEY, JSON.stringify(groups));
  return groups;
}

function loadTests() {
  let groups = null;
  try {
    const stored = localStorage.getItem(TESTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate: 6 groups, all indices valid, total = CARDS.length
      if (Array.isArray(parsed) && parsed.length === 6 &&
          parsed.flat().length === CARDS.length &&
          parsed.flat().every(i => i >= 0 && i < CARDS.length)) {
        groups = parsed;
      }
    }
  } catch(e) {}
  if (!groups) groups = buildAndSaveTests();
  return groups.map((idxArr, i) => {
    const cards = idxArr.map(j => CARDS[j]);
    return { id: i + 1, label: `Test ${i + 1}`, desc: describeCards(cards), cards };
  });
}

let TESTS = loadTests();

// ── STATE ──────────────────────────────────────────────────────────────────
const passed = {};
let currentTest = null;
let qDeck = [], qi = 0, score = 0, answered_count = 0, wrongCards = [];

// ── TEST SELECTOR ──────────────────────────────────────────────────────────
function buildSelector() {
  const el = document.getElementById('test-btns');
  el.innerHTML = '';
  TESTS.forEach(t => {
    const b = document.createElement('button');
    b.className = 'test-btn' + (passed[t.id] ? ' done' : '');
    b.innerHTML = `<strong>${t.label}</strong><span class="test-range">${t.desc} · ${t.cards.length} preguntas</span>`;
    b.onclick = () => startTest(t.id);
    el.appendChild(b);
  });
}

function startTest(id) {
  currentTest = TESTS.find(t => t.id === id);
  qDeck = [...currentTest.cards];
  shuffle(qDeck);
  qi = 0; score = 0; answered_count = 0; wrongCards = [];
  document.getElementById('quiz-title').textContent = currentTest.label;
  document.getElementById('quiz-sub').textContent = currentTest.cards.length + ' preguntas · responde todas para ver el resultado';
  document.getElementById('quiz-area').style.display = 'block';
  document.querySelector('.test-selector').style.display = 'none';
  updateProgress();
  renderQ();
}

function startWrongCards() {
  qDeck = [...wrongCards];
  shuffle(qDeck);
  qi = 0; score = 0; answered_count = 0; wrongCards = [];
  document.getElementById('quiz-title').textContent = currentTest.label + ' — Fallos';
  document.getElementById('quiz-sub').textContent = qDeck.length + ' preguntas falladas · vuelve a responderlas';
  updateProgress();
  renderQ();
}

function backToSelector() {
  document.getElementById('quiz-area').style.display = 'none';
  document.querySelector('.test-selector').style.display = 'block';
  buildSelector();
}

// ── QUIZ ───────────────────────────────────────────────────────────────────
function renderQ() {
  const c = qDeck[qi];
  const correct = c.p;
  const wrong = ALL_PREPS.filter(p => p !== correct);
  shuffle(wrong);
  const opts = [correct, wrong[0], wrong[1], wrong[2]];
  shuffle(opts);

  const sentHtml = c.s
    ? c.s.replace('___', '<span class="blank" id="blank">___</span>')
    : `${c.w} <span class="blank" id="blank">___</span> …`;

  const multiNote = multiPrepWords.has(c.w)
    ? `<div class="multi-note">⚠️ Esta palabra acepta más de una preposición según el contexto</div>`
    : '';

  const explHtml = c.expl
    ? `<div class="expl" id="expl">💡 ${c.expl}</div>`
    : `<div id="expl"></div>`;

  document.getElementById('quiz-root').innerHTML = `
    <div class="q-card">
      <div class="q-label">${CAT_LABELS[c.c]} · Pregunta ${qi + 1} de ${qDeck.length}</div>
      <div class="q-sentence">${sentHtml}</div>
      ${c.n ? `<div class="q-note">${c.n}</div>` : ''}
      ${multiNote}
    </div>
    <div class="opts">
      ${opts.map(o => `<button class="opt" onclick="answer(this,'${o}','${correct}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="fb"></div>
    ${explHtml}
    <div class="next-row">
      <button class="btn-primary" onclick="nextQ()">Siguiente →</button>
    </div>
  `;
}

function answer(btn, chosen, correct) {
  if (document.querySelector('.opt:disabled')) return;
  answered_count++;
  document.getElementById('blank').textContent = chosen;
  document.querySelectorAll('.opt').forEach(b => b.disabled = true);
  const fb = document.getElementById('fb');
  if (chosen === correct) {
    btn.classList.add('correct'); score++;
    fb.textContent = '✓ Correcto'; fb.className = 'feedback ok';
  } else {
    btn.classList.add('wrong');
    fb.textContent = `✗ Era: ${correct}`; fb.className = 'feedback ko';
    document.querySelectorAll('.opt').forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    wrongCards.push(qDeck[qi]);
  }
  // Always show expl after answering (dual-prep info or contextual note)
  const expl = document.getElementById('expl');
  if (expl && expl.textContent.trim()) expl.classList.add('show');
  updateProgress();
}

function nextQ() {
  qi++;
  if (qi >= qDeck.length) { showResult(); return; }
  renderQ();
}

function showResult() {
  const total = qDeck.length;
  const pct = Math.round(score / total * 100);
  const perfect = score === total;
  if (perfect) passed[currentTest.id] = true;
  const emoji = perfect ? '🏆' : pct >= 70 ? '📈' : '📚';
  const msg = perfect ? '¡Test superado! Puedes pasar al siguiente.' : pct >= 70 ? 'Casi — repite para conseguir el 100%.' : 'Repasa los patrones e inténtalo de nuevo.';

  document.getElementById('quiz-root').innerHTML = `
    <div class="result-card">
      <div class="result-emoji">${emoji}</div>
      <div class="result-score">${score} / ${total}</div>
      <div class="result-msg">${msg}</div>
      ${perfect ? `<div class="result-perfect">✓ Test ${currentTest.id} completado al 100%</div>` : ''}
      <div class="result-btns">
        <button class="btn-primary" onclick="startTest(${currentTest.id})">Repetir test</button>
        ${wrongCards.length > 0 ? `<button class="btn-red" onclick="startWrongCards()">Repetir fallos (${wrongCards.length})</button>` : ''}
        <button onclick="backToSelector()">Ver todos los tests</button>
        ${perfect && currentTest.id < 6 ? `<button class="btn-green" onclick="startTest(${currentTest.id + 1})">Test ${currentTest.id + 1} →</button>` : ''}
      </div>
    </div>
  `;
  // Show final score in progress bar
  document.getElementById('pr-label').textContent = `${score} / ${total}`;
  document.getElementById('pr-fill').style.width = '100%';
  document.getElementById('pr-score').textContent = pct + '%';
}

function updateProgress() {
  const total = qDeck.length;
  const progress = total ? Math.round(answered_count / total * 100) : 0;
  const accuracy = answered_count ? Math.round(score / answered_count * 100) : null;
  document.getElementById('pr-label').textContent = `${answered_count} / ${total}`;
  document.getElementById('pr-fill').style.width = progress + '%';
  document.getElementById('pr-score').textContent = accuracy !== null ? accuracy + '%' : '—';
}

// ── FLASHCARDS ─────────────────────────────────────────────────────────────
let activeCats = new Set(['adj', 'noun', 'expr', 'verb']);
let deck = [], fi = 0;

function buildDeck() {
  deck = CARDS.filter(c => activeCats.has(c.c));
  shuffle(deck); fi = 0;
}

function showCard() {
  if (!deck.length) return;
  const c = deck[fi];
  document.getElementById('fc-cat').textContent = CAT_LABELS[c.c];
  document.getElementById('fc-word').textContent = c.w;
  document.getElementById('fc-note').textContent = c.n ? `(${c.n})` : '';
  document.getElementById('fc-bcat').textContent = CAT_LABELS[c.c];
  document.getElementById('fc-prep').textContent = c.p;
  document.getElementById('fc-eg').textContent = c.s ? c.s.replace('___', `[${c.p}]`) : `${c.w} ${c.p} …`;
  document.getElementById('fc-prog').textContent = `${fi + 1} / ${deck.length}`;
  document.getElementById('scene').classList.remove('flipped');
  document.getElementById('flipper').style.transform = '';
}

function flipCard() {
  const s = document.getElementById('scene');
  const f = document.getElementById('flipper');
  if (s.classList.contains('flipped')) {
    s.classList.remove('flipped'); f.style.transform = '';
  } else {
    s.classList.add('flipped'); f.style.transform = 'rotateY(180deg)';
  }
}

function fcNext() { fi = (fi + 1) % deck.length; showCard(); }
function fcPrev() { fi = (fi - 1 + deck.length) % deck.length; showCard(); }

function buildFilters() {
  const el = document.getElementById('fc-filters');
  Object.entries(CAT_LABELS).forEach(([k, v]) => {
    const b = document.createElement('button');
    b.className = 'filter-btn active';
    b.textContent = v;
    b.onclick = () => {
      if (activeCats.has(k)) {
        if (activeCats.size > 1) {
          activeCats.delete(k);
          b.classList.remove('active');
        }
      } else {
        activeCats.add(k);
        b.classList.add('active');
      }
      buildDeck(); showCard();
    };
    el.appendChild(b);
  });
}

function showTab(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  btn.classList.add('active');
}

// ── INIT ───────────────────────────────────────────────────────────────────
buildSelector();
buildFilters();
buildDeck();
showCard();
