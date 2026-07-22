document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.exam-section');

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      sections.forEach((s) => s.classList.add('hidden'));
      document.getElementById(btn.dataset.target).classList.remove('hidden');
    });
  });

  const form = document.getElementById('exam-form');
  const scriptTag = document.querySelector('script[data-exam-id]');
  const examId = scriptTag.dataset.examId;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const answers = {};
    new FormData(form).forEach((value, key) => {
      answers[key] = value;
    });

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Corrigiendo...';

    try {
      const res = await fetch(`/api/exam/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error('No se pudo corregir el examen');

      const result = await res.json();
      showResults(result);
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Finalizar y corregir';
    }
  });

  // Misma tabla de conversión que el backend (lib/examService.js), usada aquí
  // para recalcular la media al añadir manualmente Writing y/o Speaking.
  const CS_ANCHORS = [
    { pct: 45, score: 160 },
    { pct: 60, score: 180 },
    { pct: 75, score: 193 },
    { pct: 80, score: 200 },
    { pct: 100, score: 210 },
  ];

  function percentageToCambridgeScale(pct) {
    if (pct < CS_ANCHORS[0].pct) {
      return { score: null, grade: 'Por debajo de B2 (Suspenso)' };
    }
    let score = CS_ANCHORS[CS_ANCHORS.length - 1].score;
    for (let i = 0; i < CS_ANCHORS.length - 1; i++) {
      const lower = CS_ANCHORS[i];
      const upper = CS_ANCHORS[i + 1];
      if (pct >= lower.pct && pct <= upper.pct) {
        const ratio = (pct - lower.pct) / (upper.pct - lower.pct);
        score = Math.round(lower.score + ratio * (upper.score - lower.score));
        break;
      }
    }
    let grade;
    if (score >= 200) grade = 'Grade A';
    else if (score >= 193) grade = 'Grade B';
    else if (score >= 180) grade = 'Grade C';
    else grade = 'Level B2 (Fail)';
    return { score, grade };
  }

  function showResults(result) {
    document.querySelectorAll('.question').forEach((qEl) => {
      const qId = qEl.dataset.questionId;
      const detail = result.details[qId];
      if (!detail) return;

      qEl.classList.remove('correct', 'partial', 'incorrect');
      const state = detail.correct ? 'correct' : detail.partial ? 'partial' : 'incorrect';
      qEl.classList.add(state);

      const feedback = qEl.querySelector('.feedback');
      const isCompact = qEl.classList.contains('inline-question') || qEl.classList.contains('gap-target');
      const pointsNote = detail.pointsPossible > 1 ? ` (${detail.pointsAwarded}/${detail.pointsPossible} puntos)` : '';

      if (isCompact) {
        feedback.textContent = state === 'correct' ? '✓' : state === 'partial' ? '≈' : '✗';
        feedback.title = state === 'correct'
          ? `Correcto${pointsNote}`
          : state === 'partial'
            ? `Parcialmente correcto${pointsNote} — Respuesta modelo: ${detail.correctAnswer}`
            : `Incorrecto — Respuesta correcta: ${detail.correctAnswer}`;

        const existingExplanation = qEl.querySelector('.gap-explanation');
        if (existingExplanation) existingExplanation.remove();

        if (qEl.classList.contains('inline-question') && state !== 'correct') {
          const explEl = document.createElement('span');
          explEl.className = 'gap-explanation';
          const intro = state === 'partial' ? 'Casi correcto.' : 'Incorrecto.';
          explEl.innerHTML = `<strong>${intro}</strong> Respuesta correcta: <strong>${detail.correctAnswer}</strong>.`
            + (detail.explanation ? ` ${detail.explanation}` : '');
          qEl.appendChild(explEl);
        }
      } else {
        feedback.textContent = state === 'correct'
          ? `✓ Correcto${pointsNote}`
          : state === 'partial'
            ? `≈ Parcialmente correcto${pointsNote} — Respuesta modelo: ${detail.correctAnswer}`
            : `✗ Incorrecto — Respuesta correcta: ${detail.correctAnswer}`;
      }
    });

    const resultsEl = document.getElementById('results');
    resultsEl.classList.remove('hidden');

    const partialNote = result.totalPartial ? ` (+${result.totalPartial} parciales)` : '';
    let html = `<h2>Resultados</h2>
      <p class="score-total">Puntuación total: ${result.totalCorrect} / ${result.totalQuestions} (${result.percentage}%)${partialNote}</p>
      <ul class="score-breakdown">`;

    for (const key in result.sections) {
      const s = result.sections[key];
      const hasScoring = s.nominalMax !== null && s.nominalMax !== undefined;
      let line = `<li><strong>${s.title}:</strong> ${s.correct} / ${s.total} ítems`;
      if (s.partial) line += ` (+${s.partial} parciales)`;
      if (hasScoring) {
        line += ` &middot; ${s.earnedPoints} / ${s.maxRawPoints} puntos brutos`
          + ` &middot; ${s.nominalEarned} / ${s.nominalMax} (nota oficial Cambridge)`
          + ` &middot; ${s.percentage}%`;
        if (s.passPercentage !== null) {
          line += ` <span class="pass-badge ${s.passed ? 'pass' : 'fail'}">${s.passed ? 'Apto' : 'No apto'} (mín. ${s.passPercentage}%)</span>`;
        }
      } else {
        line += ` &middot; ${s.percentage ?? Math.round((s.correct / s.total) * 100)}%`;
      }
      line += '</li>';
      html += line;
    }
    html += '</ul>';

    if (result.caeEstimate) {
      html += renderCaeEstimate(result.caeEstimate);
    }

    resultsEl.innerHTML = html;

    if (result.caeEstimate) {
      wireCaeEstimateForm(result.caeEstimate);
    }

    resultsEl.scrollIntoView({ behavior: 'smooth' });
  }

  function renderCaeEstimate(estimate) {
    const scoreText = estimate.score ?? '—';
    return `
      <div class="cae-estimate">
        <h3>Estimación de nota — Cambridge C1 Advanced</h3>
        <p class="cae-note">
          Media de Reading + Use of English + Listening: <strong>${estimate.averagePercentage}%</strong>
          &rarr; Cambridge Scale Score estimado: <strong>${scoreText}</strong>
          &rarr; <strong>${estimate.grade}</strong>
          (provisional — esta app no corrige Writing ni Speaking, que suponen el otro 40% de la nota real, así que el resultado final puede cambiar).
        </p>
        <p class="cae-note">Si ya tienes esas notas (de tu profesor u otra corrección), introduce el porcentaje para calcular la estimación completa de las 5 destrezas:</p>
        <div class="cae-inputs">
          <label>Writing (%)
            <input type="number" id="writing-pct" min="0" max="100" step="0.1" placeholder="ej. 80">
          </label>
          <label>Speaking (%)
            <input type="number" id="speaking-pct" min="0" max="100" step="0.1" placeholder="ej. 68">
          </label>
          <button type="button" id="calc-cae-btn">Calcular nota completa</button>
        </div>
        <p id="cae-final-result" class="cae-final"></p>
      </div>`;
  }

  function wireCaeEstimateForm(estimate) {
    const btn = document.getElementById('calc-cae-btn');
    const out = document.getElementById('cae-final-result');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const writingEl = document.getElementById('writing-pct');
      const speakingEl = document.getElementById('speaking-pct');
      const writing = writingEl.value !== '' ? parseFloat(writingEl.value) : null;
      const speaking = speakingEl.value !== '' ? parseFloat(speakingEl.value) : null;

      // El bloque R+UoE+L ya es la media de 3 destrezas con el mismo peso, así
      // que lo contamos como 3 al combinarlo con Writing y Speaking (1 cada una).
      let sum = estimate.averagePercentage * 3;
      let count = 3;
      if (writing !== null && !Number.isNaN(writing)) { sum += writing; count += 1; }
      if (speaking !== null && !Number.isNaN(speaking)) { sum += speaking; count += 1; }
      const average = Math.round((sum / count) * 10) / 10;

      const scale = percentageToCambridgeScale(average);
      const complete = count === 5;

      out.innerHTML = `Media ${complete ? 'final (5 destrezas)' : `provisional (${count} destrezas)`}: <strong>${average}%</strong>
        &rarr; Cambridge Scale Score estimado: <strong>${scale.score ?? '—'}</strong> &rarr; <strong>${scale.grade}</strong>
        ${!complete ? '<br><span class="cae-note">Añade Writing y Speaking para la estimación completa.</span>' : ''}`;
    });
  }
});
