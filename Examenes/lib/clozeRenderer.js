function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMultipleChoiceGap(question) {
  const options = question.options
    .map((opt) => `<option value="${escapeHtml(opt.label)}">${escapeHtml(opt.label)}) ${escapeHtml(opt.text)}</option>`)
    .join('');
  return `<span class="question inline-question" data-question-id="${escapeHtml(question.id)}">`
    + `<select name="${escapeHtml(question.id)}" class="gap-select">`
    + `<option value="" selected>(${question.number})</option>${options}</select>`
    + `<span class="feedback inline-feedback"></span></span>`;
}

function renderOpenGap(question) {
  return `<span class="question inline-question" data-question-id="${escapeHtml(question.id)}">`
    + `<input type="text" name="${escapeHtml(question.id)}" class="gap-input" autocomplete="off" placeholder="(${question.number})">`
    + `<span class="feedback inline-feedback"></span></span>`;
}

function renderGapTarget(question) {
  return `<span class="question gap-target" data-question-id="${escapeHtml(question.id)}">`
    + `<span class="gap-target-label">Hueco ${question.number}</span>`
    + `<span class="gap-target-content hidden"></span>`
    + `<span class="feedback inline-feedback"></span>`
    + `<input type="hidden" name="${escapeHtml(question.id)}" value="">`
    + `</span>`;
}

function buildInlineClozeText(part) {
  let html = part.text;
  part.questions.forEach((question) => {
    const marker = `(${question.number})___`;
    if (!html.includes(marker)) return;
    html = html.split(marker).join(renderMultipleChoiceGap(question));
  });
  return html.replace(/\n/g, '<br>');
}

function buildInlineOpenText(part) {
  let html = part.text;
  part.questions.forEach((question) => {
    const marker = `(${question.number})___`;
    if (!html.includes(marker)) return;
    html = html.split(marker).join(renderOpenGap(question));
  });
  return html.replace(/\n/g, '<br>');
}

function buildGappedText(part) {
  let html = part.text;
  part.questions.forEach((question) => {
    const marker = `[${question.number}]`;
    if (!html.includes(marker)) return;
    html = html.split(marker).join(renderGapTarget(question));
  });
  return html.replace(/\n/g, '<br>');
}

// Añade `renderedText` (HTML con huecos interactivos) e `inlineQuestions: true`
// a las partes que lo soportan, para que la vista no repita la lista de
// preguntas por separado. Muta y devuelve el mismo objeto exam.
function prepareExamForRender(exam) {
  for (const section of Object.values(exam.sections)) {
    for (const part of section.parts) {
      if (!part.text) continue;

      if (part.type === 'multiple-choice-cloze') {
        part.renderedText = buildInlineClozeText(part);
        part.inlineQuestions = true;
      } else if (part.type === 'open-cloze') {
        part.renderedText = buildInlineOpenText(part);
        part.inlineQuestions = true;
      } else if (part.type === 'gapped-text' && Array.isArray(part.paragraphOptions)) {
        part.renderedText = buildGappedText(part);
        part.inlineQuestions = true;
        part.gapBank = part.paragraphOptions;
      }
    }
  }
  return exam;
}

module.exports = { prepareExamForRender };
