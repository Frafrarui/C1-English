document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let theoryData = {};
    let exercisesData = [];
    
    // --- Initialization ---
    initTabs();
    loadData();
    updateStatsDisplay();

    // --- Tab Navigation ---
    function initTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active classes
                tabs.forEach(t => {
                    t.classList.remove('bg-cambridge', 'text-white', 'shadow-md', 'active');
                    t.classList.add('bg-gray-100', 'text-gray-600');
                    if (t.dataset.target === 'tab-theory-verbs' && t.classList.contains('active-purple')) {
                       t.classList.remove('bg-purple-600', 'text-white', 'shadow-md', 'active-purple');
                    }
                });
                contents.forEach(c => c.classList.add('hidden'));

                // Add active to clicked
                const targetId = tab.dataset.target;
                document.getElementById(targetId).classList.remove('hidden');
                
                if (targetId === 'tab-theory-verbs' || targetId === 'tab-verbs-exercises') {
                    tab.classList.remove('bg-gray-100', 'text-gray-600');
                    tab.classList.add('bg-purple-600', 'text-white', 'shadow-md', 'active-purple', 'active');
                } else {
                    tab.classList.remove('bg-gray-100', 'text-gray-600');
                    tab.classList.add('bg-cambridge', 'text-white', 'shadow-md', 'active');
                }
            });
        });
    }

    // --- Data Loading ---
    async function loadData() {
        try {
            const [theoryRes, exercisesRes] = await Promise.all([
                fetch('/api/theory'),
                fetch('/api/exercises')
            ]);
            
            theoryData = await theoryRes.json();
            exercisesData = await exercisesRes.json();
            
            renderTheory();
            renderVerbsTheory();
            renderSpeaking();
            
            renderExercises('mixed', 'mixed-exercises-container');
            renderExercises('reporting_verbs', 'verbs-exercises-container');
            
        } catch (error) {
            console.error("Error loading data:", error);
            document.getElementById('theory-content').innerHTML = '<p class="text-red-500">Error loading data. Make sure the server is running.</p>';
        }
    }

    // --- Render Theory (Tenses) ---
    function renderTheory() {
        const container = document.getElementById('theory-content');
        const tensesData = theoryData.tenses_and_changes;
        document.getElementById('theory-title').textContent = tensesData.title;
        
        container.innerHTML = tensesData.sections.map(section => `
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-cambridge/30 transition-colors">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                    ${section.subtitle}
                </h3>
                <ul class="space-y-2 mb-4 text-gray-600 text-sm">
                    ${section.items.map(item => `<li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>${item}</span>
                    </li>`).join('')}
                </ul>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                    <p class="text-sm text-blue-900 font-medium italic">"${section.example}"</p>
                </div>
            </div>
        `).join('');
    }

    // --- Render Theory (Verbs) ---
    function renderVerbsTheory() {
        const container = document.getElementById('verbs-theory-content');
        const verbsData = theoryData.reporting_verbs;
        document.getElementById('verbs-theory-title').textContent = verbsData.title;
        
        container.innerHTML = verbsData.sections.map(section => `
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-purple-300 transition-colors">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                    ${section.subtitle}
                </h3>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${section.verbs.map(verb => `
                        <span class="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm">${verb}</span>
                    `).join('')}
                </div>
                <div class="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg mt-auto">
                    <p class="text-sm text-purple-900 font-medium italic">"${section.example}"</p>
                </div>
            </div>
        `).join('');
    }

    // --- Render Speaking ---
    function renderSpeaking() {
        const container = document.getElementById('speaking-content');
        const speakingData = theoryData.speaking_strategies;
        
        container.innerHTML = speakingData.templates.map((template, index) => `
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div class="absolute top-0 right-0 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ${template.part}
                </div>
                <div class="text-amber-500 mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight">${template.structure}</h3>
                <div class="space-y-3 mt-4">
                    <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p class="text-sm text-gray-700"><span class="font-semibold text-gray-900">Example:</span> ${template.example}</p>
                    </div>
                    <p class="text-sm text-amber-700 italic border-l-2 border-amber-300 pl-2">${template.translation}</p>
                </div>
            </div>
        `).join('');
    }

    // --- Exercises Logic ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function renderExercises(type, containerId) {
        const container = document.getElementById(containerId);
        const filteredEx = exercisesData.filter(ex => ex.type === type);
        // Take 20 random exercises
        const selectedEx = shuffleArray([...filteredEx]).slice(0, 20); 
        
        const isVerbs = type === 'reporting_verbs';
        const focusColor = isVerbs ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-cambridge focus:ring-green-100';

        container.innerHTML = selectedEx.map((ex, index) => {
            return `
                <div class="exercise-item bg-white p-6 rounded-2xl shadow-sm border border-gray-100" data-id="${ex.id}" data-type="${type}" data-answer="${ex.answer.toLowerCase().trim().replace(/"/g, '&quot;')}">
                    <div class="flex items-start gap-4 mb-4">
                        <span class="flex-shrink-0 w-8 h-8 rounded-full ${isVerbs ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'} flex items-center justify-center font-bold text-sm mt-1">${index + 1}</span>
                        <div class="w-full">
                            <p class="text-gray-600 italic mb-2">${ex.lead_in}</p>
                            <p class="font-bold text-gray-900 mb-3 uppercase tracking-widest text-sm bg-gray-100 inline-block px-3 py-1 rounded-lg border border-gray-200 shadow-sm">${ex.keyword}</p>
                            <div class="flex flex-wrap items-center gap-2 text-lg text-gray-800">
                                <span>${ex.prefix}</span>
                                <input type="text" class="kwt-input flex-grow min-w-[200px] border-b-2 border-gray-300 px-2 py-1 bg-gray-50 outline-none transition-colors ${focusColor}" placeholder="type 3 to 6 words...">
                                <span>${ex.suffix}</span>
                            </div>
                            <div class="feedback-msg mt-3 text-sm hidden font-medium"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- Evaluation ---
    document.getElementById('check-mixed-btn').addEventListener('click', () => evaluateTest('mixed'));
    document.getElementById('check-verbs-btn').addEventListener('click', () => evaluateTest('reporting_verbs'));
    
    document.getElementById('reset-mixed-btn').addEventListener('click', () => {
        renderExercises('mixed', 'mixed-exercises-container');
        document.getElementById('mixed-score-display').textContent = '0/20';
    });
    
    document.getElementById('reset-verbs-btn').addEventListener('click', () => {
        renderExercises('reporting_verbs', 'verbs-exercises-container');
        document.getElementById('verbs-score-display').textContent = '0/20';
    });

    function evaluateTest(type) {
        const containerId = type === 'mixed' ? 'mixed-exercises-container' : 'verbs-exercises-container';
        const items = document.querySelectorAll(`#${containerId} .exercise-item`);
        let score = 0;

        items.forEach(item => {
            const correctAnswer = item.dataset.answer;
            const input = item.querySelector('.kwt-input');
            const feedback = item.querySelector('.feedback-msg');
            const userAnswer = input.value.toLowerCase().trim();
            
            // Disable input
            input.disabled = true;
            feedback.classList.remove('hidden', 'text-green-600', 'text-red-600');

            // Allow some flexibility (e.g. extra spaces)
            const normalizedUser = userAnswer.replace(/\s+/g, ' ');
            const normalizedCorrect = correctAnswer.replace(/\s+/g, ' ');

            if (normalizedUser === normalizedCorrect) {
                score++;
                input.classList.remove('border-gray-300', 'bg-gray-50');
                input.classList.add('border-green-500', 'bg-green-50', 'text-green-700', 'font-bold');
                feedback.textContent = "✓ Correct";
                feedback.classList.add('text-green-600');
            } else {
                input.classList.remove('border-gray-300', 'bg-gray-50');
                input.classList.add('border-red-500', 'bg-red-50', 'text-red-700', 'line-through', 'font-bold');
                
                feedback.innerHTML = `✗ Incorrect. The correct answer is: <strong class="text-gray-900 border-b border-gray-900">${correctAnswer}</strong>`;
                feedback.classList.add('text-red-600');
            }
        });

        // Update UI Score
        if (type === 'mixed') {
            document.getElementById('mixed-score-display').textContent = `${score}/20`;
            updateStorage('c1_u8_mixed', score);
        } else {
            document.getElementById('verbs-score-display').textContent = `${score}/20`;
            updateStorage('c1_u8_verbs', score);
        }
        
        updateStatsDisplay();
    }

    // --- Local Storage Stats ---
    function updateStorage(key, newScore) {
        const best = localStorage.getItem(key);
        if (!best || newScore > parseInt(best)) {
            localStorage.setItem(key, newScore);
        }
    }

    function updateStatsDisplay() {
        const mixedBest = localStorage.getItem('c1_u8_mixed') || '--';
        const verbsBest = localStorage.getItem('c1_u8_verbs') || '--';
        
        document.getElementById('stats-mixed').textContent = mixedBest;
        document.getElementById('stats-verbs').textContent = verbsBest;
    }
});
