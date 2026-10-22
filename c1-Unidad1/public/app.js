// State
let theoryData = null;
let exercisesData = null;
const quizzes = {};

const TABS = ['theory', 'like_as', 'preference', 'past', 'book', 'transformations', 'speaking'];

const QUIZ_INFO = {
    like_as: {
        title: 'Like vs As',
        instructions: 'Choose the correct option or write the missing word(s).',
        color: 'sky'
    },
    preference: {
        title: 'Showing Preference (Present & Past)',
        instructions: 'Choose the correct option or write the correct form of the verb in brackets.',
        color: 'indigo'
    },
    past: {
        title: 'Past Tenses',
        instructions: 'Choose the correct tense or write the correct form of the verb in brackets.',
        color: 'purple'
    },
    book: {
        title: 'Complete Advanced: Grammar Reference Practice',
        instructions: 'Exercises adapted from the Grammar reference of Complete Advanced (Unit 1: verb forms to talk about the past). Choose the correct form or write the verb in brackets.',
        color: 'purple'
    },
    transformations: {
        title: 'Keyword Transformation (Part 4)',
        instructions: 'Complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and six words, including the word given.',
        color: 'sky'
    }
};

const COLORS = {
    sky: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-100', icon: 'text-sky-900', btn: 'bg-sky-600 hover:bg-sky-700', ring: 'ring-sky-500', solid: 'bg-sky-600', mark: 'bg-sky-100 text-sky-900', chip: 'bg-white text-sky-800 border-sky-200' },
    indigo: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-900', btn: 'bg-indigo-600 hover:bg-indigo-700', ring: 'ring-indigo-500', solid: 'bg-indigo-600', mark: 'bg-indigo-100 text-indigo-900', chip: 'bg-white text-indigo-800 border-indigo-200' },
    purple: { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-900', btn: 'bg-purple-600 hover:bg-purple-700', ring: 'ring-purple-500', solid: 'bg-purple-600', mark: 'bg-purple-100 text-purple-900', chip: 'bg-white text-purple-800 border-purple-200' },
    rose: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-900', btn: 'bg-rose-600 hover:bg-rose-700', ring: 'ring-rose-500', solid: 'bg-rose-600', mark: 'bg-rose-100 text-rose-900', chip: 'bg-white text-rose-800 border-rose-200' }
};

const ICON_CHECK = '<svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
const ICON_CROSS = '<svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

window.switchTab = function(tabId) {
    TABS.forEach(id => {
        document.getElementById(`content-${id}`).classList.remove('block');
        document.getElementById(`content-${id}`).classList.add('hidden');

        const btn = document.getElementById(`tab-${id}`);
        btn.classList.remove('active-tab');
        btn.classList.add('inactive-tab');
    });

    document.getElementById(`content-${tabId}`).classList.remove('hidden');
    document.getElementById(`content-${tabId}`).classList.add('block');

    const activeBtn = document.getElementById(`tab-${tabId}`);
    activeBtn.classList.remove('inactive-tab');
    activeBtn.classList.add('active-tab');

    if (quizzes[tabId]) focusInput(tabId);
};

async function loadData() {
    try {
        // Unidad1.html embeds the data so it works without a server
        if (window.UNIT_DATA) {
            theoryData = window.UNIT_DATA.teoria;
            exercisesData = window.UNIT_DATA.ejercicios;
        } else {
            const [theoryRes, exercisesRes] = await Promise.all([
                fetch('/api/teoria'),
                fetch('/api/ejercicios')
            ]);
            theoryData = await theoryRes.json();
            exercisesData = await exercisesRes.json();
        }

        renderTheory();
        renderSpeaking();
        Object.keys(QUIZ_INFO).forEach(key => initQuiz(key));
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('theory-container').innerHTML = `<div class="text-red-500 p-4 bg-red-50 rounded-lg">Error loading content. Please make sure the server is running.</div>`;
    }
}

// ---------- Helpers ----------

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function normalize(str) {
    return str
        .toLowerCase()
        .replace(/[’‘`´]/g, "'")
        .replace(/\bwon't\b/g, 'will not')
        .replace(/\bcan't\b/g, 'cannot')
        .replace(/n't\b/g, ' not')
        .replace(/[.,!?;:"()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function focusInput(key) {
    const input = document.getElementById(`answer-${key}`);
    if (input && !input.readOnly) input.focus();
}

// **text** → highlighted key part
function fmt(text, c) {
    return text.replace(/\*\*(.+?)\*\*/g, `<strong class="${c.mark} font-semibold px-1 rounded not-italic">$1</strong>`);
}

// "Never + AUX + SUJETO + verbo" → chips; UPPERCASE tokens are the key slots
function renderFormula(formula, c) {
    // Split on " + " and ", " keeping the separator so commas still read as clause breaks
    const parts = formula.split(/(\s\+\s|,\s)/);
    return `
        <div class="flex flex-wrap items-center gap-1.5 font-mono text-sm">
            ${parts.map(p => {
                if (/^\s\+\s$/.test(p)) return '<span class="text-gray-400 font-bold">+</span>';
                if (/^,\s$/.test(p)) return '<span class="text-gray-400 font-bold">,</span>';
                const t = p.trim();
                const isKey = !/[a-z]/.test(t) && /[A-Z]{2,}/.test(t);
                const cls = isKey ? `${c.solid} text-white border-transparent` : c.chip;
                return `<span class="px-2.5 py-1 rounded-md border ${cls}">${escapeHtml(t)}</span>`;
            }).join('')}
        </div>
    `;
}

// ---------- Theory ----------

function renderTheory() {
    const sections = theoryData.sections;

    let html = `
        <div class="flex flex-wrap gap-2 mb-2">
            ${sections.map(s => {
                const c = COLORS[s.color] || COLORS.sky;
                return `<button onclick="document.getElementById('sec-${s.id}').scrollIntoView({behavior:'smooth', block:'start'})" class="px-3 py-1.5 rounded-full text-sm font-medium border ${c.border} ${c.bg} ${c.text} hover:shadow-sm transition">${s.title}</button>`;
            }).join('')}
        </div>
    `;

    sections.forEach(section => {
        const c = COLORS[section.color] || COLORS.sky;
        html += `
            <div id="sec-${section.id}" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-40">
                <div class="${c.bg} border-b ${c.border} px-6 py-4 flex flex-wrap justify-between items-center gap-2">
                    <button onclick="toggleSection('${section.id}')" class="text-left flex items-center gap-3 group">
                        <svg id="chev-${section.id}" class="w-5 h-5 ${c.text} transition-transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        <span>
                            <span class="block text-lg font-bold text-gray-900">${section.title}</span>
                            ${section.subtitle ? `<span class="block text-sm text-gray-500">${section.subtitle}</span>` : ''}
                        </span>
                    </button>
                    <button onclick="switchTab('${section.id}')" class="text-sm font-semibold px-3 py-1.5 rounded-md text-white ${c.btn} shadow-sm">Practise this →</button>
                </div>
                <div id="body-${section.id}" class="p-4 sm:p-6 grid gap-4">
                    ${section.blocks.map(block => renderBlock(block, c)).join('')}
                </div>
            </div>
        `;
    });

    document.getElementById('theory-container').innerHTML = html;
}

window.toggleSection = function(id) {
    const body = document.getElementById(`body-${id}`);
    body.hidden = !body.hidden;
    document.getElementById(`chev-${id}`).classList.toggle('rotate-90', !body.hidden);
};

function renderBlock(block, c) {
    const formulas = block.formulas || (block.formula ? [block.formula] : []);

    return `
        <div class="rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
            <h4 class="font-bold ${c.text} text-base mb-3">${block.heading}</h4>

            ${formulas.length ? `<div class="space-y-2 mb-3">${formulas.map(f => renderFormula(f, c)).join('')}</div>` : ''}

            ${block.rule ? `<p class="text-gray-700 leading-relaxed mb-3">${fmt(block.rule, c)}</p>` : ''}

            ${block.compare ? `
                <div class="grid sm:grid-cols-2 gap-3 mb-3">
                    ${block.compare.map(cmp => `
                        <div class="rounded-lg border ${c.border} ${c.bg} p-3">
                            <p class="text-xs font-bold uppercase tracking-wider ${c.text} mb-1">${cmp.label}</p>
                            <p class="text-gray-800 italic">${fmt(cmp.text, c)}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${block.chips ? `
                <div class="mb-3">
                    ${block.chipsLabel ? `<p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">${block.chipsLabel}</p>` : ''}
                    <div class="flex flex-wrap gap-1.5">
                        ${block.chips.map(ch => `<span class="px-2 py-0.5 rounded-full text-sm border ${c.chip}">${ch}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${block.examples ? `
                <ul class="space-y-1.5 mb-3">
                    ${block.examples.map(ex => `
                        <li class="flex items-start gap-2 text-gray-800">
                            <svg class="w-4 h-4 mt-1 flex-shrink-0 ${c.text}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                            <span class="italic">${fmt(ex, c)}</span>
                        </li>
                    `).join('')}
                </ul>
            ` : ''}

            ${block.table ? renderTable(block.table, c) : ''}

            ${block.wrong ? `
                <div class="grid gap-2 mt-3">
                    ${block.wrong.map(w => `
                        <div class="rounded-lg border border-gray-100 overflow-hidden text-sm">
                            <p class="bg-red-50 text-red-700 px-3 py-1.5"><span class="font-bold">✗</span> <span class="line-through decoration-red-300">${escapeHtml(w.bad)}</span></p>
                            <p class="bg-green-50 text-green-800 px-3 py-1.5"><span class="font-bold">✓</span> ${escapeHtml(w.good)}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${block.tip ? `
                <p class="mt-3 text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2"><span class="font-semibold">💡 Tip:</span> ${fmt(block.tip, c)}</p>
            ` : ''}
        </div>
    `;
}

function renderTable(table, c) {
    return `
        <div class="overflow-x-auto rounded-lg border ${c.border} mt-1">
            <table class="min-w-full text-sm">
                <thead class="${c.bg} ${c.text}">
                    <tr>${table.headers.map(h => `<th class="text-left font-semibold px-4 py-2 whitespace-nowrap">${h}</th>`).join('')}</tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    ${table.rows.map(row => `
                        <tr class="hover:bg-gray-50">
                            ${row.map((cell, i) => `<td class="px-4 py-2 align-top ${i === 0 ? 'font-semibold text-gray-800 whitespace-nowrap' : 'text-gray-700'}">${fmt(escapeHtml(cell), c)}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ---------- Speaking ----------

function renderSpeaking() {
    const colors = [
        { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', textLight: 'text-sky-500' },
        { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', textLight: 'text-indigo-500' },
        { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', textLight: 'text-purple-500' },
        { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', textLight: 'text-rose-500' }
    ];

    let html = '';

    theoryData.speaking.forEach((item, index) => {
        const c = colors[index % colors.length];
        const structureHtml = item.structure.replace(/\[(.*?)\]/g, `<span class="${c.textLight} ${c.bg} px-1 rounded border border-white">[$1]</span>`);

        html += `
            <div class="bg-white rounded-xl shadow-sm border ${c.border} overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div class="${c.bg} px-5 py-3 border-b ${c.border} flex justify-between items-center">
                    <span class="text-xs font-bold uppercase tracking-wider ${c.text}">Strategy ${index + 1}</span>
                    <span class="bg-white ${c.text} text-xs px-2 py-1 rounded shadow-sm font-semibold">${item.part.split(' (')[0]}</span>
                </div>
                <div class="p-6">
                    <p class="text-sm font-medium text-gray-500 mb-4">${item.part}</p>
                    <div class="mb-5">
                        <div class="text-gray-800 font-semibold text-lg leading-snug">${structureHtml}</div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4">
                        <p class="text-gray-700 italic">"${item.example}"</p>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                        ${item.translation}
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById('speaking-container').innerHTML = html;
}

// ---------- Quiz engine (shared by all practice tabs) ----------

function initQuiz(key, onlyIndices) {
    const all = exercisesData[key];
    const indices = onlyIndices || all.map((_, i) => i);

    quizzes[key] = {
        questions: indices.map(i => {
            const q = all[i];
            // Shuffle multiple-choice options so the answer isn't always first
            return q.type === 'mc' ? { ...q, options: shuffle(q.options), sourceIndex: i } : { ...q, sourceIndex: i };
        }),
        current: 0,
        answers: {},
        showSummary: false
    };

    renderQuizShell(key);
    showQuestion(key);
}

function renderQuizShell(key) {
    const info = QUIZ_INFO[key];
    const c = COLORS[info.color];

    document.getElementById(`content-${key}`).innerHTML = `
        <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="${c.bg} border-b ${c.border} p-6">
                <h2 class="text-xl font-bold text-gray-900">${info.title}</h2>
                <p class="text-sm text-gray-600 mt-2">${info.instructions}</p>
            </div>

            <div class="p-6">
                <div class="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <span class="text-sm font-medium text-gray-500">Question <span id="qnum-${key}">1</span> of <span>${quizzes[key].questions.length}</span></span>
                    <span id="score-${key}" class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded shadow-sm">Score: 0/${quizzes[key].questions.length}</span>
                </div>

                <div class="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                    <div id="progress-${key}" class="h-1.5 rounded-full ${c.btn.split(' ')[0]} transition-all duration-300" style="width: 0%"></div>
                </div>

                <div id="dots-${key}" class="flex flex-wrap gap-1.5 mb-6"></div>

                <div id="question-${key}" class="min-h-[200px]"></div>

                <div id="controls-${key}" class="mt-8 flex justify-between items-center border-t pt-6">
                    <button onclick="prevQuestion('${key}')" id="prev-${key}" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                    <button onclick="checkAnswer('${key}')" id="check-${key}" class="px-6 py-2 ${c.btn} text-white rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Check Answer</button>
                    <button onclick="nextQuestion('${key}')" id="next-${key}" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
                </div>
            </div>
        </div>
    `;
}

function getScore(quiz) {
    return Object.values(quiz.answers).filter(a => a.isCorrect).length;
}

function updateHeader(key) {
    const quiz = quizzes[key];
    const total = quiz.questions.length;
    const answered = Object.keys(quiz.answers).length;

    document.getElementById(`qnum-${key}`).textContent = quiz.current + 1;
    document.getElementById(`score-${key}`).textContent = `Score: ${getScore(quiz)}/${total}`;
    document.getElementById(`progress-${key}`).style.width = `${(answered / total) * 100}%`;

    const c = COLORS[QUIZ_INFO[key].color];
    document.getElementById(`dots-${key}`).innerHTML = quiz.questions.map((_, i) => {
        const a = quiz.answers[i];
        let cls = 'bg-gray-100 text-gray-500 hover:bg-gray-200';
        if (a) cls = a.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
        const active = i === quiz.current && !quiz.showSummary ? `ring-2 ${c.ring}` : '';
        return `<button onclick="goToQuestion('${key}', ${i})" class="w-7 h-7 rounded text-xs font-semibold ${cls} ${active} transition-colors">${i + 1}</button>`;
    }).join('');
}

function showQuestion(key) {
    const quiz = quizzes[key];
    if (quiz.showSummary) return showSummary(key);

    const index = quiz.current;
    const q = quiz.questions[index];
    const answer = quiz.answers[index];
    const isAnswered = answer !== undefined;
    const container = document.getElementById(`question-${key}`);

    document.getElementById(`controls-${key}`).classList.remove('hidden');
    document.getElementById(`prev-${key}`).disabled = index === 0;
    const allAnswered = Object.keys(quiz.answers).length === quiz.questions.length;
    const btnNext = document.getElementById(`next-${key}`);
    btnNext.disabled = index === quiz.questions.length - 1 && !allAnswered;
    btnNext.textContent = allAnswered ? 'See results' : 'Next';

    const btnCheck = document.getElementById(`check-${key}`);
    btnCheck.disabled = isAnswered;
    btnCheck.textContent = isAnswered ? 'Checked' : 'Check Answer';
    // Multiple choice checks on click, so the button is only needed for typed answers
    btnCheck.classList.toggle('invisible', q.type === 'mc');

    let body = '';
    if (q.type === 'mc') body = renderMC(key, q, answer);
    else if (q.type === 'gap') body = renderGap(key, q, answer);
    else body = renderKWT(key, q, answer);

    container.innerHTML = `
        <div class="space-y-6">
            ${body}
            ${isAnswered ? renderFeedback(q, answer) : ''}
        </div>
    `;

    updateHeader(key);

    if (!isAnswered && q.type !== 'mc') {
        const input = document.getElementById(`answer-${key}`);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAnswer(key);
        });
        if (!document.getElementById(`content-${key}`).classList.contains('hidden')) input.focus();
    }
}

function sentenceWithBlank(sentence, filled, state) {
    const blank = `<span class="gap-blank ${state || ''}">${filled ? escapeHtml(filled) : '&nbsp;'}</span>`;
    return sentence.replace('___', blank);
}

function renderMC(key, q, answer) {
    const isAnswered = answer !== undefined;
    const filled = isAnswered ? (answer.isCorrect ? q.answer : answer.text) : '';
    const state = isAnswered ? (answer.isCorrect ? 'correct' : 'incorrect') : '';

    const options = q.options.map((opt, i) => {
        let cls = 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 text-gray-800';
        if (isAnswered) {
            if (opt === q.answer) cls = 'border-green-400 bg-green-50 text-green-800';
            else if (opt === answer.text) cls = 'border-red-400 bg-red-50 text-red-800';
            else cls = 'border-gray-100 bg-white text-gray-400';
        }
        return `<button onclick="selectOption('${key}', ${i})" ${isAnswered ? 'disabled' : ''} class="px-4 py-3 border-2 rounded-lg text-left font-medium transition-colors ${cls}">${escapeHtml(opt)}</button>`;
    }).join('');

    return `
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p class="text-lg text-gray-800 leading-loose">${sentenceWithBlank(q.sentence, filled, state)}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${options}</div>
    `;
}

function renderGap(key, q, answer) {
    const isAnswered = answer !== undefined;
    const state = isAnswered ? (answer.isCorrect ? 'correct' : 'incorrect') : '';
    const input = `<input type="text" id="answer-${key}" class="input-kt ${state}" autocomplete="off" spellcheck="false"
        value="${isAnswered ? escapeHtml(answer.text) : ''}" ${isAnswered ? 'readonly' : ''} placeholder="your answer">`;

    return `
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p class="text-lg text-gray-800 leading-loose">${q.sentence.replace('___', input)}</p>
        </div>
    `;
}

function renderKWT(key, q, answer) {
    const isAnswered = answer !== undefined;
    const state = isAnswered ? (answer.isCorrect ? 'correct' : 'incorrect') : '';

    return `
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p class="text-lg text-gray-800">${q.lead_in}</p>
        </div>

        <div class="flex justify-center">
            <span class="inline-block bg-gray-800 text-white font-bold py-1 px-4 rounded shadow-sm tracking-widest text-lg">${q.keyword}</span>
        </div>

        <div class="text-lg text-gray-800 leading-loose flex flex-wrap items-center gap-2">
            <span>${q.before}</span>
            <input type="text" id="answer-${key}" class="input-kt ${state}" autocomplete="off" spellcheck="false"
                value="${isAnswered ? escapeHtml(answer.text) : ''}" ${isAnswered ? 'readonly' : ''} placeholder="(3-6 words)">
            <span>${q.after}</span>
        </div>
    `;
}

function renderFeedback(q, answer) {
    const correctText = q.type === 'mc' ? q.answer : q.answers.join('  /  ');

    return `
        <div class="p-4 rounded-lg ${answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
            <p class="text-sm ${answer.isCorrect ? 'text-green-800' : 'text-red-800'} font-medium flex items-center">
                ${answer.isCorrect ? ICON_CHECK + ' Correct!' : ICON_CROSS + ' Incorrect.'}
            </p>
            ${!answer.isCorrect ? `
                <p class="mt-2 text-sm text-gray-700">Correct answer: <span class="font-bold text-green-700">${escapeHtml(correctText)}</span></p>
            ` : ''}
            ${q.explanation ? `<p class="mt-2 text-sm text-gray-600">${q.explanation}</p>` : ''}
        </div>
    `;
}

function recordAnswer(key, text, isCorrect) {
    const quiz = quizzes[key];
    quiz.answers[quiz.current] = { text, isCorrect };
    showQuestion(key);
}

window.selectOption = function(key, optionIndex) {
    const quiz = quizzes[key];
    if (quiz.answers[quiz.current]) return;
    const q = quiz.questions[quiz.current];
    const choice = q.options[optionIndex];
    recordAnswer(key, choice, choice === q.answer);
};

window.checkAnswer = function(key) {
    const quiz = quizzes[key];
    if (quiz.answers[quiz.current]) return; // Already checked

    const q = quiz.questions[quiz.current];
    if (q.type === 'mc') return;

    const inputEl = document.getElementById(`answer-${key}`);
    const userAnswer = inputEl.value.trim();

    if (!userAnswer) {
        inputEl.classList.remove('shake');
        void inputEl.offsetWidth;
        inputEl.classList.add('shake');
        inputEl.focus();
        return;
    }

    const normalizedUser = normalize(userAnswer);
    const isCorrect = q.answers.some(a => normalize(a) === normalizedUser);
    recordAnswer(key, userAnswer, isCorrect);
};

window.prevQuestion = function(key) {
    const quiz = quizzes[key];
    if (quiz.current > 0) {
        quiz.current--;
        showQuestion(key);
    }
};

window.nextQuestion = function(key) {
    const quiz = quizzes[key];
    const total = quiz.questions.length;

    if (Object.keys(quiz.answers).length === total) {
        quiz.showSummary = true;
        showQuestion(key);
        return;
    }
    if (quiz.current < total - 1) {
        quiz.current++;
        showQuestion(key);
    }
};

window.goToQuestion = function(key, index) {
    const quiz = quizzes[key];
    quiz.showSummary = false;
    quiz.current = index;
    showQuestion(key);
};

function showSummary(key) {
    const quiz = quizzes[key];
    const total = quiz.questions.length;
    const score = getScore(quiz);
    const pct = Math.round((score / total) * 100);
    const mistakes = quiz.questions.filter((_, i) => !quiz.answers[i].isCorrect);

    let message = 'Keep practising — review the theory and try again.';
    if (pct >= 90) message = 'Excellent! You have mastered this topic.';
    else if (pct >= 70) message = 'Very good! Just a few points to review.';
    else if (pct >= 50) message = 'Not bad, but there is room for improvement.';

    document.getElementById(`controls-${key}`).classList.add('hidden');
    updateHeader(key);

    document.getElementById(`question-${key}`).innerHTML = `
        <div class="text-center py-6">
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Final score</p>
            <p class="text-5xl font-bold mt-2 ${pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-500' : 'text-red-600'}">${score}/${total}</p>
            <p class="text-gray-600 mt-3">${message}</p>
        </div>

        ${mistakes.length ? `
            <div class="mt-4">
                <h3 class="font-semibold text-gray-800 mb-3">Review your mistakes</h3>
                <div class="space-y-3">
                    ${mistakes.map(q => {
                        const i = quiz.questions.indexOf(q);
                        const prompt = q.type === 'kwt' ? `${q.lead_in} <span class="font-bold">(${q.keyword})</span>` : q.sentence.replace('___', '_____');
                        const correct = q.type === 'mc' ? q.answer : q.answers[0];
                        return `
                            <button onclick="goToQuestion('${key}', ${i})" class="w-full text-left p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors">
                                <p class="text-sm text-gray-800">${i + 1}. ${prompt}</p>
                                <p class="text-sm mt-1"><span class="text-red-700 line-through">${escapeHtml(quiz.answers[i].text)}</span> → <span class="text-green-700 font-semibold">${escapeHtml(correct)}</span></p>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : ''}

        <div class="mt-8 flex flex-wrap justify-center gap-3 border-t pt-6">
            ${mistakes.length ? `<button onclick="retryMistakes('${key}')" class="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Retry mistakes (${mistakes.length})</button>` : ''}
            <button onclick="restartQuiz('${key}')" class="px-5 py-2 ${COLORS[QUIZ_INFO[key].color].btn} text-white rounded-md text-sm font-medium transition-colors shadow-sm">Restart (shuffled)</button>
        </div>
    `;
}

window.retryMistakes = function(key) {
    const quiz = quizzes[key];
    const wrong = quiz.questions.filter((_, i) => !quiz.answers[i].isCorrect).map(q => q.sourceIndex);
    initQuiz(key, wrong);
};

window.restartQuiz = function(key) {
    initQuiz(key, shuffle(exercisesData[key].map((_, i) => i)));
};
