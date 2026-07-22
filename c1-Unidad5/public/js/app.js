// DOM Elements
const sections = {
    theory: document.getElementById('theory-section'),
    practice: document.getElementById('practice-section'),
    stats: document.getElementById('stats-section'),
    speaking: document.getElementById('speaking-section')
};

const navBtns = {
    theory: document.getElementById('nav-theory'),
    practice: document.getElementById('nav-practice'),
    stats: document.getElementById('nav-stats'),
    speaking: document.getElementById('nav-speaking')
};

const theoryContent = document.getElementById('theory-content');
const quizContainer = document.getElementById('quiz-container');
const testSelector = document.querySelector('.test-selector');
const questionCounter = document.getElementById('question-counter');
const currentWord = document.getElementById('current-word');
const exampleSentence = document.getElementById('example-sentence');
const optionBtns = document.querySelectorAll('.option-btn');
const feedbackContainer = document.getElementById('feedback-container');
const ruleReference = document.getElementById('rule-reference');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const statsBody = document.getElementById('stats-body');
const clearStatsBtn = document.getElementById('clear-stats');

// State
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let mistakes = [];
let selectedOption = null;
let currentGroupId = null;

// Initialization
async function init() {
    setupGlobalTabs();
    setupInversionTabs();
    setupComparisonTabs();
    setupAccordions();
    renderInversionExercises();
    renderCambridgeExercises();
    setupNavigation();
    setupQuizListeners();
    await loadTheory();
    renderStats();
}

// Global Tabs Navigation
function setupGlobalTabs() {
    const globalTabBtns = document.querySelectorAll('.global-tab-btn');
    const globalTabContents = document.querySelectorAll('.global-tab-content');

    globalTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            globalTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active content
            const tabId = btn.dataset.tab;
            globalTabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}

// Accordions Logic
function setupAccordions() {
    const accordions = document.querySelectorAll('.accordion-btn');
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            this.classList.toggle('active');
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });
}

// Inversions Sub-Tabs Logic
function setupInversionTabs() {
    const invTabBtns = document.querySelectorAll('.inv-tab-btn');
    const invTabContents = document.querySelectorAll('.inv-tab-content');

    invTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            invTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabId = btn.dataset.tab;
            invTabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });
}

// Inversions Exercises Logic
const ex1Data = [
    { original: "You only come to realise the significance of the murder in the last few pages.", start: "Only in the last...", expected: "Only in the last few pages do you come to realise the significance of the murder.",
      commonErrors: [
        { condition: (val) => (!val.includes('few') || !val.includes('come to')) && val.length > 5, message: "No te dejes palabras de la frase original (revisa few o come to)" }
      ]
    },
    { original: "The demands of her job are such that she is rarely able to take a holiday.", start: "Such...", expected: "Such are the demands of her job that she is rarely able to take a holiday.", commonErrors: [] },
    { original: "The matter could be explained in no other way.", start: "In...", expected: "In no other way could the matter be explained.",
      commonErrors: [
        { condition: (val) => !val.includes('other') && val.length > 3, message: "Te falta la palabra other" }
      ]
    },
    { original: "I have seldom heard such beautiful singing.", start: "Seldom...", expected: "Seldom have I heard such beautiful singing.", commonErrors: [] },
    { original: "Peter didn't realize that he had lost his keys until he got home.", start: "Not...", expected: "Not until Peter got home did he realize that he had lost his keys.",
      commonErrors: [
        { condition: (val) => val.includes('did peter get'), message: "Recuerda: la primera parte se queda normal, la inversión va en la acción principal" }
      ]
    },
    { original: "If Mr Chan had been kinder to his employees, his business would not have collapsed.", start: "Had...", expected: "Had Mr Chan been kinder to his employees, his business would not have collapsed.", commonErrors: [] },
    { original: "If an emergency should arise, dial 999.", start: "Should...", expected: "Should an emergency arise, dial 999.", commonErrors: [] },
    { original: "Audience members may consume alcohol under no circumstances.", start: "Under no circumstances...", expected: "Under no circumstances may audience members consume alcohol.", commonErrors: [] },
    { original: "They had no sooner got married than they started to argue.", start: "No sooner...", expected: "No sooner had they got married than they started to argue.",
      commonErrors: [
        { condition: (val) => val.includes('that '), message: "La partícula para No sooner es THAN" }
      ]
    },
    { original: "You can use my new car at no time.", start: "At no time...", expected: "At no time can you use my new car.",
      commonErrors: [
        { condition: (val) => val.includes('cannot') || val.includes("can't"), message: "Cuidado con el doble negativo" }
      ]
    }
];

const ex2Data = [
    { original: "The gang little knew that the police had them under surveillance.", start: "Little...", expected: "Little did the gang know that the police had them under surveillance.", commonErrors: [] },
    { original: "We won't consider you for the basketball team until you grow up.", start: "Not until...", expected: "Not until you grow up will we consider you for the basketball team.",
      commonErrors: [
        { condition: (val) => val.includes('do you grow'), message: "Recuerda invertir en la segunda parte" }
      ]
    },
    { original: "Nobody has won so many matches for his team since 1994.", start: "Not since...", expected: "Not since 1994 has anyone won so many matches for his team.",
      commonErrors: [
        { condition: (val) => val.includes('nobody'), message: "Evita la doble negación, usa anyone" }
      ]
    },
    { original: "You will be allowed to enter the auditorium once the play has started under no circumstances.", start: "Under no circumstances...", expected: "Under no circumstances will you be allowed to enter the auditorium once the play has started.", commonErrors: [] },
    { original: "He would never play in front of a live audience again.", start: "Never...", expected: "Never would he play in front of a live audience again.", commonErrors: [] },
    { original: "Amy had not enjoyed herself so much since she went to the circus as a child.", start: "Not since...", expected: "Not since she went to the circus as a child had Amy enjoyed herself so much.", commonErrors: [] },
    { original: "I have never seen such a terrible performance of Hamlet before.", start: "Never before...", expected: "Never before have I seen such a terrible performance of Hamlet.",
      commonErrors: [
        { condition: (val) => val.endsWith('before'), message: "Ya has puesto before al principio" }
      ]
    },
    { original: "They realized the painting had been hung upside down only when someone complained at reception.", start: "Only when...", expected: "Only when someone complained at reception did they realize the painting had been hung upside down.", commonErrors: [] },
    { original: "I realized that everyone was staring at me only after I had been in the room for a few minutes.", start: "Only after...", expected: "Only after I had been in the room for a few minutes did I realize that everyone was staring at me.", commonErrors: [] },
    { original: "He discovered that he had injured his knee only when he tried to run.", start: "Only when...", expected: "Only when he tried to run did he discover that he had injured his knee.", commonErrors: [] },
    { original: "The new park had hardly been finished when vandals destroyed the flowerbeds.", start: "Hardly...", expected: "Hardly had the new park been finished when vandals destroyed the flowerbeds.",
      commonErrors: [
        { condition: (val) => !val.includes('been') && val.length > 5, message: "Ojo con la voz pasiva (had been finished)" }
      ]
    },
    { original: "You should sign a contract you haven't read thoroughly under no circumstances.", start: "Under no circumstances...", expected: "Under no circumstances should you sign a contract you haven't read thoroughly.", commonErrors: [] }
];

function renderExerciseBlock(containerId, data, blockPrefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '';
    data.forEach((ex, index) => {
        const id = `${blockPrefix}-${index}`;
        html += `
        <div class="exercise-item">
            <p class="ex-original" style="font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-muted);"><strong>Original:</strong> ${ex.original}</p>
            <p style="color: var(--primary-color); font-weight: 600; font-size: 1.15rem; margin-bottom: 1rem;">${ex.start}</p>
            <div class="ex-input-group">
                <input type="text" id="inv-input-${id}" class="ex-input" placeholder="Type here...">
                <button class="action-btn ex-check-btn" data-id="${id}" data-block="${blockPrefix}" data-index="${index}">Check</button>
            </div>
            <div id="inv-feedback-${id}" class="ex-feedback hidden"></div>
        </div>
        `;
    });
    container.innerHTML = html;
}

function renderInversionExercises() {
    renderExerciseBlock('inversion-exercises-1', ex1Data, 'ex1');
    renderExerciseBlock('inversion-exercises-2', ex2Data, 'ex2');

    // Add listeners
    document.querySelectorAll('.ex-check-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const block = e.target.dataset.block;
            const idx = parseInt(e.target.dataset.index);
            const input = document.getElementById(`inv-input-${id}`);
            const feedback = document.getElementById(`inv-feedback-${id}`);
            
            const data = block === 'ex1' ? ex1Data : ex2Data;
            const ex = data[idx];
            
            // Clean string: remove punctuation, double spaces, trim, lowercase
            const clean = str => str.replace(/[.,!?]/g, '').replace(/\s+/g, ' ').toLowerCase().trim();
            const expectedClean = clean(ex.expected);
            let actualValue = input.value.trim();
            const actualCleanRaw = clean(actualValue);
            
            if (actualCleanRaw.length === 0) return;

            // Handle partial matching if user didn't type the start word
            let fullActual = actualValue;
            const startClean = clean(ex.start);
            if (!actualCleanRaw.startsWith(startClean.substring(0, 4))) {
                fullActual = ex.start + " " + actualValue;
            }
            const actualClean = clean(fullActual);

            // Reset styles
            feedback.classList.remove('hidden', 'correct-feedback', 'wrong-feedback', 'warning-feedback');
            input.classList.remove('correct-input', 'wrong-input', 'warning-input');
            
            if (actualClean === expectedClean) {
                feedback.classList.add('correct-feedback');
                feedback.innerHTML = `<strong>¡Correcto!</strong> <br> ${ex.expected}`;
                input.classList.add('correct-input');
            } else {
                // Check common errors
                let warningMsg = null;
                for (let err of ex.commonErrors) {
                    if (err.condition(actualCleanRaw)) {
                        warningMsg = err.message;
                        break;
                    }
                }
                
                if (warningMsg) {
                    feedback.classList.add('warning-feedback');
                    feedback.innerHTML = `<strong>⚠️ Cuidado:</strong> ${warningMsg}`;
                    input.classList.add('warning-input');
                } else {
                    feedback.classList.add('wrong-feedback');
                    feedback.innerHTML = `<strong>Incorrecto.</strong> Inténtalo de nuevo o revisa la teoría.`;
                    input.classList.add('wrong-input');
                }
            }
        });
    });
}

// Comparisons Sub-Tabs Logic
function setupComparisonTabs() {
    const compTabBtns = document.querySelectorAll('.comp-tab-btn');
    const compTabContents = document.querySelectorAll('.comp-tab-content');

    compTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            compTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabId = btn.dataset.tab;
            compTabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });
}

// Cambridge C1 Exercises Logic for Comparisons
const cambridgeCompData = [
    { 
        original: "She is much smarter than her brother.", 
        keyword: "DEAL", 
        start: "She is",
        end: "her brother.",
        expected: "a great deal smarter than", 
        commonErrors: [
            { condition: (val) => val.includes('much') || val.includes('more'), message: "Usa el intensificador 'a great deal' y el comparativo correcto." }
        ] 
    },
    { 
        original: "I have never seen such a beautiful painting before.", 
        keyword: "FAR", 
        start: "This is",
        end: "painting I have ever seen.",
        expected: "by far the most beautiful", 
        commonErrors: [
            { condition: (val) => !val.includes('most'), message: "No olvides usar el superlativo." }
        ] 
    },
    { 
        original: "As people get older, they become less tolerant.", 
        keyword: "THE", 
        start: "The older people get,",
        end: "become.",
        expected: "the less tolerant they", 
        commonErrors: [
            { condition: (val) => !val.includes('they'), message: "Recuerda incluir el pronombre." }
        ] 
    },
    { 
        original: "My car is much faster than yours.", 
        keyword: "NEAR", 
        start: "Your car is",
        end: "mine.",
        expected: "nowhere near as fast as", 
        commonErrors: [
            { condition: (val) => val.includes('faster'), message: "Con 'nowhere near' usamos 'as + adj + as', sin comparativo (-er)." }
        ] 
    },
    { 
        original: "He is slightly taller than his father.", 
        keyword: "BIT", 
        start: "He is",
        end: "his father.",
        expected: "a bit taller than", 
        commonErrors: [
            { condition: (val) => !val.includes('taller'), message: "Mantén el adjetivo en su forma comparativa." }
        ] 
    }
];

function renderCambridgeExercises() {
    const container = document.getElementById('cambridge-comp-exercises');
    if (!container) return;
    
    let html = '';
    cambridgeCompData.forEach((ex, index) => {
        const id = `cambridge-${index}`;
        html += `
        <div class="exercise-item" style="border-left-color: #f43f5e;">
            <p class="ex-original" style="font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-muted);"><strong>Original:</strong> ${ex.original}</p>
            <div style="background: rgba(244, 63, 94, 0.1); display: inline-block; padding: 0.3rem 0.8rem; border-radius: 4px; margin-bottom: 1rem;">
                <span style="color: #f43f5e; font-weight: 700; letter-spacing: 1px;">KEYWORD: ${ex.keyword}</span>
            </div>
            <div class="ex-input-group" style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="color: var(--primary-color); font-weight: 600;">${ex.start}</span>
                <input type="text" id="camb-input-${id}" class="ex-input" style="flex: 1; min-width: 200px;" placeholder="(3 - 6 words)">
                <span style="color: var(--primary-color); font-weight: 600;">${ex.end}</span>
                <button class="action-btn ex-check-btn" style="background: var(--secondary-color); color: var(--bg-dark);" data-id="${id}" data-index="${index}">Check</button>
            </div>
            <div id="camb-feedback-${id}" class="ex-feedback hidden"></div>
        </div>
        `;
    });
    container.innerHTML = html;

    // Add listeners
    document.querySelectorAll('#cambridge-comp-exercises .ex-check-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const idx = parseInt(e.target.dataset.index);
            const input = document.getElementById(`camb-input-${id}`);
            const feedback = document.getElementById(`camb-feedback-${id}`);
            
            const ex = cambridgeCompData[idx];
            
            // Clean string
            const clean = str => str.replace(/[.,!?]/g, '').replace(/\s+/g, ' ').toLowerCase().trim();
            const expectedClean = clean(ex.expected);
            let actualValue = input.value.trim();
            const actualClean = clean(actualValue);
            
            if (actualClean.length === 0) return;

            const wordCount = actualValue.split(/\s+/).length;

            feedback.classList.remove('hidden', 'correct-feedback', 'wrong-feedback', 'warning-feedback');
            input.classList.remove('correct-input', 'wrong-input', 'warning-input');
            
            if (!actualValue.toUpperCase().includes(ex.keyword)) {
                feedback.classList.add('warning-feedback');
                feedback.innerHTML = `<strong>⚠️ Cuidado:</strong> Debes usar la palabra <strong>${ex.keyword}</strong> exactamente como se muestra.`;
                input.classList.add('warning-input');
                return;
            }

            if (wordCount < 3 || wordCount > 6) {
                feedback.classList.add('warning-feedback');
                feedback.innerHTML = `<strong>⚠️ Cuidado:</strong> Has usado ${wordCount} palabras. Tienes que usar entre 3 y 6 palabras.`;
                input.classList.add('warning-input');
                return;
            }

            if (actualClean === expectedClean) {
                feedback.classList.add('correct-feedback');
                feedback.innerHTML = `<strong>¡Correcto!</strong> <br> ${ex.start} <strong>${ex.expected}</strong> ${ex.end}`;
                input.classList.add('correct-input');
            } else {
                let warningMsg = null;
                for (let err of ex.commonErrors) {
                    if (err.condition(actualClean)) {
                        warningMsg = err.message;
                        break;
                    }
                }
                
                if (warningMsg) {
                    feedback.classList.add('warning-feedback');
                    feedback.innerHTML = `<strong>⚠️ Cuidado:</strong> ${warningMsg}`;
                    input.classList.add('warning-input');
                } else {
                    feedback.classList.add('wrong-feedback');
                    feedback.innerHTML = `<strong>Incorrecto.</strong> Inténtalo de nuevo. Pista: ¿Has usado el comparativo/superlativo correcto?`;
                    input.classList.add('wrong-input');
                }
            }
        });
    });
}

// Sub-app Navigation
function setupNavigation() {
    Object.keys(navBtns).forEach(key => {
        navBtns[key].addEventListener('click', () => {
            // Update active button
            Object.values(navBtns).forEach(btn => btn.classList.remove('active'));
            navBtns[key].classList.add('active');

            // Show corresponding section
            Object.values(sections).forEach(section => section.classList.remove('active'));
            sections[key].classList.add('active');

            if (key === 'stats') {
                renderStats();
            }
        });
    });

    document.querySelectorAll('.test-btn').forEach(btn => {
        btn.addEventListener('click', () => startTest(btn.dataset.group));
    });
}

// Fisher-Yates Shuffle
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Load Theory Data
async function loadTheory() {
    try {
        const response = await fetch('/api/teoria');
        const data = await response.json();
        
        theoryContent.innerHTML = '';
        
        // Render Gerund
        theoryContent.appendChild(createTheoryCard(data.gerund));
        // Render Infinitive
        theoryContent.appendChild(createTheoryCard(data.infinitive));
        
    } catch (error) {
        console.error('Error loading theory:', error);
        theoryContent.innerHTML = '<p>Error loading theory content.</p>';
    }
}

function createTheoryCard(data) {
    const card = document.createElement('div');
    card.className = 'theory-card';
    
    let html = `<h3>${data.title}</h3>`;
    
    data.rules.forEach(rule => {
        html += `<div class="theory-rule">
            <h4>${rule.type}</h4>`;
            
        if (rule.description) html += `<p>${rule.description}</p>`;
        if (rule.example) html += `<p><em>Example: ${rule.example}</em></p>`;
        
        const items = rule.verbs || rule.nouns || rule.expressions || rule.structures;
        if (items) {
            html += `<div>`;
            items.forEach(item => {
                html += `<span class="word-chip">${item}</span>`;
            });
            html += `</div>`;
        }
        
        html += `</div>`;
    });
    
    card.innerHTML = html;
    return card;
}

// Quiz Logic
async function startTest(groupId) {
    try {
        currentGroupId = groupId;
        const response = await fetch(`/api/test/${groupId}`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            alert('No questions available for this test group.');
            return;
        }

        currentQuestions = shuffle(data);
        currentQuestionIndex = 0;
        score = 0;
        mistakes = [];
        
        testSelector.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        
        showQuestion();
    } catch (error) {
        console.error('Error starting test:', error);
    }
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    questionCounter.textContent = `Question ${currentQuestionIndex + 1}/${currentQuestions.length}`;
    currentWord.textContent = question.word;
    exampleSentence.textContent = question.example_sentence || '';
    
    // Reset options
    selectedOption = null;
    optionBtns.forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong', 'disabled');
    });
    
    feedbackContainer.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    nextBtn.classList.add('hidden');
    finishBtn.classList.add('hidden');
}

function setupQuizListeners() {
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('disabled')) return;
            
            optionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedOption = btn.dataset.option;
            
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        });
    });

    submitBtn.addEventListener('click', correctQuestion);
    
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        showQuestion();
    });

    finishBtn.addEventListener('click', finishTest);
    
    document.getElementById('back-to-tests-btn').addEventListener('click', () => {
        document.getElementById('test-results-container').classList.add('hidden');
        testSelector.classList.remove('hidden');
    });

    document.getElementById('retry-mistakes-btn').addEventListener('click', () => {
        if (!mistakes || mistakes.length === 0) return;
        
        // Ensure we only pass valid question objects
        const validMistakes = mistakes.filter(m => m && m.question);
        if (validMistakes.length === 0) {
            console.error('No valid questions found in mistakes array', mistakes);
            alert('Hubo un error al cargar los fallos. Por favor, vuelve a iniciar el test.');
            return;
        }

        currentQuestions = shuffle(validMistakes.map(m => m.question));
        currentQuestionIndex = 0;
        score = 0;
        mistakes = [];
        
        document.getElementById('test-results-container').classList.add('hidden');
        quizContainer.classList.remove('hidden');
        showQuestion();
    });
}

function correctQuestion() {
    if (!selectedOption) return;
    
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === question.correct_answer;
    
    if (isCorrect) {
        score++;
    } else {
        mistakes.push({
            question: question,
            userAnswer: selectedOption
        });
    }

    optionBtns.forEach(btn => {
        btn.classList.add('disabled');
        if (btn.dataset.option === question.correct_answer) {
            btn.classList.add('correct');
        } else if (btn.dataset.option === selectedOption && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    // Show feedback
    feedbackContainer.classList.remove('hidden', 'correct-feedback', 'wrong-feedback');
    feedbackContainer.classList.add(isCorrect ? 'correct-feedback' : 'wrong-feedback');
    
    ruleReference.innerHTML = isCorrect 
        ? `<strong>Correct!</strong> <br> ${question.rule_reference}` 
        : `<strong>Incorrect.</strong> <br> ${question.rule_reference}`;

    submitBtn.classList.add('hidden');
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
        nextBtn.classList.remove('hidden');
    } else {
        finishBtn.classList.remove('hidden');
    }
}

function finishTest() {
    const stats = getStats();
    stats.unshift({
        testId: currentGroupId,
        score: score,
        totalQuestions: currentQuestions.length,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
    });
    
    localStorage.setItem('gerundStats', JSON.stringify(stats));
    
    quizContainer.classList.add('hidden');
    
    showTestResults();
}

function showTestResults() {
    const resultsContainer = document.getElementById('test-results-container');
    const resultsScore = document.getElementById('results-score');
    const resultsMistakes = document.getElementById('results-mistakes');
    const retryBtn = document.getElementById('retry-mistakes-btn');
    
    resultsContainer.classList.remove('hidden');
    resultsScore.textContent = `Tu puntuación: ${score} / ${currentQuestions.length}`;
    
    resultsMistakes.innerHTML = '';
    if (mistakes.length === 0) {
        retryBtn.classList.add('hidden');
        resultsMistakes.innerHTML = '<p class="perfect-score">¡Perfecto! No has cometido ningún error.</p>';
    } else {
        retryBtn.classList.remove('hidden');
        let html = '<h3>Errores a repasar:</h3>';
        mistakes.forEach(m => {
            html += `
            <div class="mistake-card">
                <p><strong>${m.question.word}</strong></p>
                <p class="mistake-example"><em>${m.question.example_sentence || ''}</em></p>
                <p>Tu respuesta: <span class="wrong-answer">${m.userAnswer}</span></p>
                <p>Respuesta correcta: <span class="correct-answer">${m.question.correct_answer}</span></p>
                <p class="rule-ref"><em>${m.question.rule_reference}</em></p>
            </div>
            `;
        });
        resultsMistakes.innerHTML = html;
    }
}

// Stats Logic
function getStats() {
    const stats = localStorage.getItem('gerundStats');
    return stats ? JSON.parse(stats) : [];
}

function renderStats() {
    const stats = getStats();
    statsBody.innerHTML = '';
    
    if (stats.length === 0) {
        statsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No tests taken yet.</td></tr>';
        return;
    }
    
    stats.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stat.date}</td>
            <td>Test ${stat.testId}</td>
            <td><strong>${stat.score}/${stat.totalQuestions}</strong></td>
        `;
        statsBody.appendChild(row);
    });
}

clearStatsBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to clear your history?')) {
        localStorage.removeItem('gerundStats');
        renderStats();
    }
});

// Run Init
document.addEventListener('DOMContentLoaded', init);
