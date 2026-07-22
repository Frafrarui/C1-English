document.getElementById('year').textContent = new Date().getFullYear();

// State
let theoryData = null;
let questionsData = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

// Initialization
async function init() {
    try {
        const [theoryRes, questionsRes] = await Promise.all([
            fetch('/data/teoria_u6.json'),
            fetch('/data/questions_u6.json')
        ]);
        theoryData = await theoryRes.json();
        questionsData = await questionsRes.json();

        renderTheory();
        renderSpeaking();
        loadStats();
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('theory-container').innerHTML = '<p class="text-red-500">Failed to load content. Please ensure the server is running.</p>';
    }
}

// Tab Switching
function switchTab(tabId) {
    // Hide all sections
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Show selected
    document.getElementById(`section-${tabId}`).classList.remove('hidden');
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

// Render Theory with Accordions
function renderTheory() {
    const container = document.getElementById('theory-container');
    container.innerHTML = '';

    const categories = [
        { key: 'reference', title: '1. Reference' },
        { key: 'substitution', title: '2. Substitution' },
        { key: 'ellipsis', title: '3. Ellipsis' }
    ];

    categories.forEach(cat => {
        const section = document.createElement('div');
        section.className = 'bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden';

        const header = document.createElement('button');
        header.className = 'accordion-btn w-full px-6 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none';
        header.setAttribute('aria-expanded', 'true');
        header.innerHTML = `
            <h3 class="text-lg font-semibold text-textMain">${cat.title}</h3>
            <svg class="accordion-icon w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        `;

        header.onclick = () => {
            const expanded = header.getAttribute('aria-expanded') === 'true' || false;
            header.setAttribute('aria-expanded', !expanded);
        };

        const content = document.createElement('div');
        content.className = 'accordion-content px-6 py-4 space-y-6';

        theoryData[cat.key].forEach(item => {
            const ruleBlock = document.createElement('div');
            ruleBlock.innerHTML = `
                <h4 class="text-md font-bold text-primary mb-2">${item.title}</h4>
                <p class="text-sm text-textMuted mb-3">${item.rule}</p>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md space-y-2">
                    ${item.examples.map(ex => `<p class="text-sm text-slate-700 italic">"${ex}"</p>`).join('')}
                </div>
            `;
            content.appendChild(ruleBlock);
        });

        section.appendChild(header);
        section.appendChild(content);
        container.appendChild(section);
    });
}

// Render Speaking Booster
function renderSpeaking() {
    const container = document.getElementById('speaking-container');
    container.innerHTML = '';

    theoryData.speaking.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-surface rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow';
        card.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div class="flex items-center">
                    <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">${item.part}</span>
                </div>
                <span class="text-sm text-primary font-semibold mt-2 sm:mt-0">${item.strategy}</span>
            </div>
            <div class="mb-4">
                <h4 class="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Structure</h4>
                <p class="text-base font-semibold text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">${item.structure}</p>
            </div>
            <div>
                <h4 class="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Example in Use</h4>
                <p class="text-base text-slate-600 italic pl-3 border-l-4 border-indigo-300">"${item.example}"</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Fisher-Yates Shuffle
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Test Logic
function loadStats() {
    const lastScore = localStorage.getItem('u6_last_score');
    const lastDate = localStorage.getItem('u6_last_date');
    
    if (lastScore && lastDate) {
        document.getElementById('stats-container').classList.remove('hidden');
        document.getElementById('last-score').textContent = `Score: ${lastScore}%`;
        document.getElementById('last-date').textContent = `Taken on: ${new Date(lastDate).toLocaleDateString()}`;
    }
}

function startTest() {
    currentQuestions = shuffle([...questionsData]).slice(0, 30); // Use 30 for now
    currentQuestionIndex = 0;
    score = 0;

    document.getElementById('test-intro').classList.add('hidden');
    document.getElementById('test-results').classList.add('hidden');
    document.getElementById('test-area').classList.remove('hidden');

    showQuestion();
}

function showQuestion() {
    const q = currentQuestions[currentQuestionIndex];
    document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    
    const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // Replace the blank with an underscore block
    const textHtml = q.text.replace('___', '<span class="inline-block w-16 border-b-2 border-slate-400 mx-1"></span>');
    document.getElementById('question-text').innerHTML = textHtml;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    const shuffledOptions = shuffle([...q.options]);

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn w-full text-left px-6 py-4 rounded-xl font-medium text-slate-700 focus:outline-none';
        btn.textContent = opt;
        btn.onclick = () => selectOption(opt, btn);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('feedback-container').classList.add('hidden');
}

function selectOption(selectedOpt, btnElement) {
    // Disable all options
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);

    const q = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedOpt === q.correctAnswer;

    if (isCorrect) {
        score++;
        btnElement.classList.add('correct');
        document.getElementById('feedback-message').textContent = 'Correct!';
        document.getElementById('feedback-message').className = 'font-bold text-emerald-600 text-lg';
    } else {
        btnElement.classList.add('incorrect');
        // Find correct option and highlight
        allBtns.forEach(b => {
            if (b.textContent === q.correctAnswer) b.classList.add('correct');
        });
        document.getElementById('feedback-message').textContent = 'Incorrect';
        document.getElementById('feedback-message').className = 'font-bold text-red-600 text-lg';
    }

    document.getElementById('feedback-explanation').innerHTML = `<span class="font-semibold text-slate-800">Rule (${q.type}):</span> ${q.explanation}`;
    document.getElementById('feedback-container').classList.remove('hidden');

    if (currentQuestionIndex === currentQuestions.length - 1) {
        document.getElementById('next-btn').textContent = 'Finish Test';
    } else {
        document.getElementById('next-btn').textContent = 'Next Question';
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        finishTest();
    }
}

function finishTest() {
    document.getElementById('test-area').classList.add('hidden');
    document.getElementById('test-results').classList.remove('hidden');
    
    const percentage = Math.round((score / currentQuestions.length) * 100);
    document.getElementById('final-score-text').textContent = `You scored ${score} out of ${currentQuestions.length} (${percentage}%)`;

    let title = "Test Complete!";
    if(percentage >= 80) title = "Excellent Work! 🏆";
    else if(percentage >= 60) title = "Good Job! 👍";
    else title = "Keep Practicing! 📚";
    
    document.getElementById('final-score-title').textContent = title;

    // Save to LocalStorage
    localStorage.setItem('u6_last_score', percentage);
    localStorage.setItem('u6_last_date', new Date().toISOString());
    loadStats();
}

function resetTest() {
    document.getElementById('test-results').classList.add('hidden');
    document.getElementById('test-intro').classList.remove('hidden');
}

// Start
init();
