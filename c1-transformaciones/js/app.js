// ─────────────────────────────────────────────
//  LÓGICA PRINCIPAL — c1-transformaciones
// ─────────────────────────────────────────────

const SESSION_SIZE = 10; // preguntas por sesión

// ── Estado global ──
let session     = [];   // índices de preguntas de esta sesión
let current     = 0;    // índice dentro de session[]
let scores      = [];   // 0 | 1 | 2 | null por pregunta de la sesión
let revealed    = [];   // bool: ¿se usó "ver solución"?

// ── Puntuación parcial ──────────────────────────────────────────────
// Compara palabra a palabra. Devuelve:
//   2 → respuesta exacta
//   1 → al menos la mitad de las palabras correctas (en posición)
//   0 → menos de la mitad
function scoreAnswer(userRaw, solutionRaw) {
  const norm = s => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const uWords = norm(userRaw).split(' ');
  const sWords = norm(solutionRaw).split(' ');

  if (norm(userRaw) === norm(solutionRaw)) return 2;

  const total = sWords.length;
  let hits = 0;
  for (let i = 0; i < Math.min(uWords.length, total); i++) {
    if (uWords[i] === sWords[i]) hits++;
  }

  return hits >= Math.ceil(total / 2) ? 1 : 0;
}

// ── Fisher-Yates shuffle ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Iniciar nueva sesión ──
function startSession() {
  const indices = ALL_QUESTIONS.map((_, i) => i);
  const shuffled = shuffle(indices);
  session  = shuffled.slice(0, Math.min(SESSION_SIZE, ALL_QUESTIONS.length));
  current  = 0;
  scores   = new Array(session.length).fill(null);
  revealed = new Array(session.length).fill(false);
  updateHeader();
  render();
}

// ── Helpers ──
function currentQ()  { return ALL_QUESTIONS[session[current]]; }
function totalScore(){ return scores.reduce((s, v) => s + (v ?? 0), 0); }
function maxScore()  { return session.length * 2; }
function donePct()   { return Math.round(scores.filter(v => v !== null).length / session.length * 100); }

function countWords(s) { return s.trim().split(/\s+/).filter(Boolean).length; }

// ── Actualizar stats del header ──
function updateHeader() {
  const done = scores.filter(v => v !== null).length;
  document.getElementById('stat-score').textContent   = totalScore();
  document.getElementById('stat-maxscore').textContent = `/${maxScore()}`;
  document.getElementById('stat-done').textContent    = done;
  document.getElementById('stat-total').textContent   = session.length;
  document.getElementById('progress').style.width     = donePct() + '%';
  updateNav();
}

// ── Nav dots ──
function updateNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  session.forEach((_, i) => {
    const sc = scores[i];
    const d  = document.createElement('div');
    let cls  = 'ndot';
    if (i === current) cls += ' active';
    else if (sc === 2)    cls += ' ok';
    else if (sc === 1)    cls += ' partial';
    else if (sc === 0)    cls += ' fail';
    d.className   = cls;
    d.textContent = i + 1;
    d.title       = `Pregunta ${i + 1}`;
    d.onclick     = () => { current = i; render(); };
    nav.appendChild(d);
  });
}
// ── Explicación opcional ──
function explanationHtml(q) {
  if (!q.explanation) return '';
  return `<div class="explanation"><span class="exp-label">💡 Nota</span>${q.explanation}</div>`;
}
// ── Comprobar respuesta ──
function checkAnswer() {
  const inp = document.getElementById('user-input');
  if (!inp) return;
  const q   = currentQ();
  const sc  = scoreAnswer(inp.value, q.solution);
  scores[current] = sc;

  inp.readOnly = true;
  inp.className = 'answer-input ' + (sc === 2 ? 'correct' : sc === 1 ? 'partial' : 'wrong');

  const sa = document.querySelector('.sentence-area');
  if (sa) sa.className = 'sentence-area ' + (sc === 2 ? 'correct-state' : sc === 1 ? 'partial-state' : 'wrong-state');

  const fb = document.getElementById('feedback');
  fb.className = 'feedback show ' + (sc === 2 ? 'correct' : sc === 1 ? 'partial' : 'wrong');

  if (sc === 2) {
    fb.innerHTML = `<span class="fb-pts">+2 pts</span> ¡Correcto!${explanationHtml(q)}`;
  } else if (sc === 1) {
    fb.innerHTML = `<span class="fb-pts fb-pts-partial">+1 pt</span> Casi — respuesta completa: <strong>${q.solution}</strong>${explanationHtml(q)}`;
  } else {
    fb.innerHTML = `<span class="fb-pts fb-pts-zero">+0 pts</span> La respuesta correcta es: <strong>${q.solution}</strong>${explanationHtml(q)}`;
  }

  document.getElementById('action-check')?.remove();
  document.getElementById('action-reveal')?.remove();
  showNextOrFinish();
  updateHeader();
}

// ── Ver solución ──
function revealAnswer() {
  const q  = currentQ();
  revealed[current] = true;
  if (scores[current] === null) scores[current] = 0;

  const inp = document.getElementById('user-input');
  if (inp) { inp.value = q.solution; inp.readOnly = true; inp.className = 'answer-input revealed'; }

  const sa = document.querySelector('.sentence-area');
  if (sa) sa.className = 'sentence-area revealed-state';

  const fb = document.getElementById('feedback');
  fb.className = 'feedback show revealed';
  fb.innerHTML = `<span class="fb-pts fb-pts-zero">+0 pts</span> Solución: <strong>${q.solution}</strong>${explanationHtml(q)}`;

  document.getElementById('action-check')?.remove();
  document.getElementById('action-reveal')?.remove();
  showNextOrFinish();
  updateHeader();
}

// ── Mostrar botón siguiente o finalizar ──
function showNextOrFinish() {
  const actions = document.getElementById('actions');
  if (!actions) return;

  if (current < session.length - 1) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.id = 'action-next';
    btn.textContent = 'Siguiente →';
    btn.onclick = () => { current++; render(); };
    actions.appendChild(btn);
  } else {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.id = 'action-finish';
    btn.textContent = 'Ver resultados';
    btn.onclick = showSummary;
    actions.appendChild(btn);
  }
}

// ── Render de la pregunta actual ──
function render() {
  const qa    = document.getElementById('question-area');
  const sumEl = document.getElementById('summary');
  qa.style.display  = 'block';
  sumEl.style.display = 'none';

  const q       = currentQ();
  const sc      = scores[current];
  const rev     = revealed[current];
  const done    = sc !== null;
  const wordCnt = countWords(q.solution);

  let inputCls = '';
  let saCls    = '';
  let fbCls    = '';
  let fbHtml   = '';
  let inputVal = '';

  if (done) {
    inputVal = q.solution;
    const exp = explanationHtml(q);
    if (sc === 2)       { inputCls = 'correct';  saCls = 'correct-state';  fbCls = 'correct';  fbHtml = `<span class="fb-pts">+2 pts</span> ¡Correcto!${exp}`; }
    else if (sc === 1)  { inputCls = 'partial';  saCls = 'partial-state';  fbCls = 'partial';  fbHtml = `<span class="fb-pts fb-pts-partial">+1 pt</span> Casi — respuesta completa: <strong>${q.solution}</strong>${exp}`; }
    else if (rev)       { inputCls = 'revealed'; saCls = 'revealed-state'; fbCls = 'revealed'; fbHtml = `<span class="fb-pts fb-pts-zero">+0 pts</span> Solución: <strong>${q.solution}</strong>${exp}`; }
    else                { inputCls = 'wrong';    saCls = 'wrong-state';    fbCls = 'wrong';    fbHtml = `<span class="fb-pts fb-pts-zero">+0 pts</span> La respuesta correcta es: <strong>${q.solution}</strong>${exp}`; }
  }

  qa.innerHTML = `
    <div class="tanda-tag">
      <span></span>
      Sesión · Pregunta ${current + 1} de ${session.length}
      &nbsp;·&nbsp; Tanda ${q.tanda}
      <span></span>
    </div>

    <div class="q-card">
      <div class="q-original-label">Oración original</div>
      <div class="q-original">${q.original}</div>

      <div class="keyword-row">
        <div class="kw-label">Palabra clave</div>
        <div class="keyword">${q.keyword}</div>
        <div class="kw-hint">(solución: ${wordCnt} palabra${wordCnt !== 1 ? 's' : ''} · total 2–6)</div>
      </div>

      <div class="scoring-hint">
        <span class="sh-item sh-2">2 pts → correcta</span>
        <span class="sh-item sh-1">1 pt → mitad bien</span>
        <span class="sh-item sh-0">0 pts → incorrecta</span>
      </div>

      <div class="sentence-area ${saCls}">
        <span class="s-part">${q.before}</span>
        <input
          class="answer-input ${inputCls}"
          id="user-input"
          type="text"
          value="${inputVal}"
          placeholder="2–6 palabras…"
          ${done ? 'readonly' : ''}
          autocomplete="off"
          spellcheck="false"
        />
        <span class="s-part">${q.after}</span>
      </div>

      <div class="feedback ${done ? 'show ' + fbCls : ''}" id="feedback">${fbHtml}</div>
    </div>

    <div class="actions" id="actions">
      ${!done ? `<button class="btn btn-primary" id="action-check" onclick="checkAnswer()">Comprobar</button>` : ''}
      ${!done ? `<button class="btn btn-ghost"   id="action-reveal" onclick="revealAnswer()">Ver solución</button>` : ''}
      ${current > 0 ? `<button class="btn" onclick="go(${current - 1})">← Anterior</button>` : ''}
    </div>
  `;

  // Si ya estaba hecha, vuelve a añadir el botón siguiente
  if (done) showNextOrFinish();

  const inp = document.getElementById('user-input');
  if (inp && !done) {
    inp.focus();
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });
  }

  updateHeader();
}

function go(idx) { current = idx; render(); }

// ── Resumen final ──
function showSummary() {
  document.getElementById('question-area').style.display = 'none';
  const total = totalScore();
  const max   = maxScore();
  const pct   = Math.round(total / max * 100);
  const full  = scores.filter(v => v === 2).length;
  const part  = scores.filter(v => v === 1).length;
  const zero  = scores.filter(v => v === 0).length;

  let msg;
  if (pct >= 85) msg = '¡Nivel C1 conseguido! 🎯';
  else if (pct >= 65) msg = '¡Buen trabajo, sigue así! 💪';
  else msg = '¡Sigue practicando, tú puedes! 📚';

  const sumEl = document.getElementById('summary');
  sumEl.style.display = 'block';
  sumEl.innerHTML = `
    <div class="summary-score">${total}<span class="summary-max">/${max}</span></div>
    <div class="summary-pct">${pct}% de acierto</div>
    <div class="summary-msg">${msg}</div>
    <div class="summary-grid">
      <div class="summary-card ok">
        <div class="n">${full}</div>
        <div class="l">Completas (+2)</div>
      </div>
      <div class="summary-card partial">
        <div class="n">${part}</div>
        <div class="l">Parciales (+1)</div>
      </div>
      <div class="summary-card fail">
        <div class="n">${zero}</div>
        <div class="l">Falladas (+0)</div>
      </div>
    </div>
    <div class="summary-actions">
      <button class="btn btn-primary" onclick="startSession()">Nueva sesión (10 aleatorias)</button>
      <button class="btn" onclick="reviewFailed()">Repasar falladas / parciales</button>
    </div>
  `;
}

// ── Repasar falladas y parciales ──
function reviewFailed() {
  // Construir lista de índices originales que fallaron o fueron parciales
  const failedOriginal = session.filter((_, i) => scores[i] !== 2);
  if (failedOriginal.length === 0) { startSession(); return; }

  session  = shuffle(failedOriginal).slice(0, Math.min(SESSION_SIZE, failedOriginal.length));
  current  = 0;
  scores   = new Array(session.length).fill(null);
  revealed = new Array(session.length).fill(false);

  document.getElementById('summary').style.display = 'none';
  updateHeader();
  render();
}

// ── Arrancar ──
window.addEventListener('DOMContentLoaded', startSession);
