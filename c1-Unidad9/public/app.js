// State
let theoryData = null;
let exercisesData = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let score = 0;

// DOM Elements
const contentTheory = document.getElementById('content-theory');
const contentSpeaking = document.getElementById('content-speaking');
const contentPractice = document.getElementById('content-practice');

const theoryContainer = document.getElementById('theory-container');
const speakingContainer = document.getElementById('speaking-container');
const questionContainer = document.getElementById('question-container');

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnCheck = document.getElementById('btn-check');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

window.switchTab = function(tabId) {
    // Hide all contents
    ['theory', 'speaking', 'practice'].forEach(id => {
        document.getElementById(`content-${id}`).classList.remove('block');
        document.getElementById(`content-${id}`).classList.add('hidden');
        
        const btn = document.getElementById(`tab-${id}`);
        btn.classList.remove('active-tab');
        btn.classList.add('inactive-tab');
    });

    // Show active content
    document.getElementById(`content-${tabId}`).classList.remove('hidden');
    document.getElementById(`content-${tabId}`).classList.add('block');
    
    const activeBtn = document.getElementById(`tab-${tabId}`);
    activeBtn.classList.remove('inactive-tab');
    activeBtn.classList.add('active-tab');
};

async function fetchData() {
    try {
        const [theoryRes, exercisesRes] = await Promise.all([
            fetch('/api/teoria'),
            fetch('/api/ejercicios')
        ]);
        
        theoryData = await theoryRes.json();
        exercisesData = await exercisesRes.json();
        
        renderTheory();
        renderSpeaking();
        renderPractice();
    } catch (error) {
        console.error('Error fetching data:', error);
        theoryContainer.innerHTML = '<p class="text-red-500">Error loading data. Please make sure the server is running.</p>';
    }
}

function renderTheory() {
    if (!theoryData) return;

    const sections = [
        { title: 'A) FUTURE TENSES (PLAN)', data: theoryData.future_tenses_plan, classes: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-100', icon: 'text-sky-900' } },
        { title: 'B) FUTURE TENSES (Ø PLAN / NO PLAN)', data: theoryData.future_tenses_noplan, classes: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-900' } },
        { title: 'C) MODAL VERBS FOR THE FUTURE', data: theoryData.modal_verbs_future, classes: { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-900' } }
    ];

    let html = '';

    sections.forEach(section => {
        html += `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="bg-gray-50 border-b border-gray-100 px-6 py-4">
                    <h3 class="text-lg font-bold text-gray-800">${section.title}</h3>
                </div>
                <div class="divide-y divide-gray-100">
        `;
        
        section.data.forEach(item => {
            html += `
                <div class="p-6 hover:bg-gray-50 transition-colors">
                    <h4 class="font-semibold ${section.classes.text} mb-2">${item.structure}</h4>
                    <div class="${section.classes.bg} ${section.classes.icon} p-3 rounded-lg border ${section.classes.border} flex items-start">
                        <svg class="w-5 h-5 mr-2 mt-0.5 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span class="italic">"${item.example}"</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    theoryContainer.innerHTML = html;
}

function renderSpeaking() {
    if (!theoryData || !theoryData.cambridge_speaking_strategies) return;

    let html = '';
    
    const colors = [
        { name: 'sky', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', textLight: 'text-sky-500' },
        { name: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', textLight: 'text-indigo-500' },
        { name: 'purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', textLight: 'text-purple-500' },
        { name: 'rose', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', textLight: 'text-rose-500' }
    ];

    theoryData.cambridge_speaking_strategies.forEach((item, index) => {
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
                        <div class="text-gray-800 font-semibold text-lg leading-snug">
                            ${structureHtml}
                        </div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4">
                        <p class="text-gray-700 italic">"${item.example}"</p>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                        ${item.translation}
                    </div>
                </div>
            </div>
        `;
    });

    speakingContainer.innerHTML = html;
}

function renderPractice() {
    if (!exercisesData.length) return;
    
    document.getElementById('total-q-num').textContent = exercisesData.length;
    showQuestion(currentQuestionIndex);
}

function showQuestion(index) {
    const q = exercisesData[index];
    document.getElementById('current-q-num').textContent = index + 1;
    
    // Update button states
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === exercisesData.length - 1;
    
    const isAnswered = userAnswers[index] !== undefined;
    const isCorrect = isAnswered && userAnswers[index].isCorrect;
    const userAnswerText = isAnswered ? userAnswers[index].text : '';
    
    if (isAnswered) {
        btnCheck.disabled = true;
        btnCheck.textContent = 'Checked';
        btnCheck.classList.add('opacity-50');
    } else {
        btnCheck.disabled = false;
        btnCheck.textContent = 'Check Answer';
        btnCheck.classList.remove('opacity-50');
    }
    
    let html = `
        <div class="space-y-6">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-lg text-gray-800">${q.lead_in_sentence}</p>
            </div>
            
            <div class="flex justify-center">
                <span class="inline-block bg-gray-800 text-white font-bold py-1 px-4 rounded shadow-sm tracking-widest text-lg">${q.keyword}</span>
            </div>
            
            <div class="text-lg text-gray-800 leading-loose flex flex-wrap items-center gap-2">
                <span>${q.second_sentence_start}</span>
                <input type="text" id="answer-input" class="input-kt ${isAnswered ? (isCorrect ? 'correct' : 'incorrect') : ''}" 
                    autocomplete="off" spellcheck="false" 
                    value="${userAnswerText}" 
                    ${isAnswered ? 'readonly' : ''}
                    placeholder="(3-6 words)"
                >
                <span>${q.second_sentence_end}</span>
            </div>
            
            ${isAnswered ? `
                <div class="mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
                    <p class="text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'} font-medium flex items-center">
                        ${isCorrect ? 
                            '<svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Correct!' : 
                            '<svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Incorrect.'}
                    </p>
                    ${!isCorrect ? `
                        <p class="mt-2 text-sm text-gray-700">Correct answer: <span class="font-bold text-green-700">${q.correct_answer}</span></p>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
    
    questionContainer.innerHTML = html;
    
    if (!isAnswered) {
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.checkAnswer();
        });
    }
}

window.prevQuestion = function() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
};

window.nextQuestion = function() {
    if (currentQuestionIndex < exercisesData.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
};

window.checkAnswer = function() {
    if (userAnswers[currentQuestionIndex]) return; // Already checked
    
    const q = exercisesData[currentQuestionIndex];
    const inputEl = document.getElementById('answer-input');
    let userAnswer = inputEl.value.trim();
    
    if (!userAnswer) {
        inputEl.focus();
        inputEl.style.transform = 'translateX(5px)';
        setTimeout(() => inputEl.style.transform = 'translateX(0)', 100);
        return;
    }
    
    // Normalize string (remove extra spaces, ignore case)
    const normalizedUser = userAnswer.replace(/\s+/g, ' ').toLowerCase();
    const normalizedCorrect = q.correct_answer.replace(/\s+/g, ' ').toLowerCase();
    
    const isCorrect = normalizedUser === normalizedCorrect;
    
    userAnswers[currentQuestionIndex] = {
        text: userAnswer,
        isCorrect: isCorrect
    };
    
    if (isCorrect) {
        score++;
        document.getElementById('score-display').textContent = `Score: ${score}/${exercisesData.length}`;
    }
    
    showQuestion(currentQuestionIndex);
};
