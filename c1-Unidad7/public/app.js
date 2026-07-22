document.addEventListener('DOMContentLoaded', () => {
    // ---- Navigation Logic ----
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.view-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update buttons
            navBtns.forEach(b => {
                b.classList.remove('active', 'text-brand-600', 'bg-brand-50');
                b.classList.add('text-gray-500');
            });
            btn.classList.remove('text-gray-500');
            btn.classList.add('active', 'text-brand-600', 'bg-brand-50');

            // Update sections
            const targetId = btn.getAttribute('data-target');
            sections.forEach(sec => {
                sec.classList.add('hidden');
                if (sec.id === targetId) {
                    sec.classList.remove('hidden');
                }
            });
        });
    });

    // ---- Data Fetching ----
    let theoryData = null;
    let questionsData = [];

    Promise.all([
        fetch('/api/teoria').then(res => res.json()),
        fetch('/api/preguntas').then(res => res.json())
    ])
    .then(([teoria, preguntas]) => {
        theoryData = teoria;
        questionsData = preguntas;
        renderTheory();
        renderTemplates();
        checkLastScore();
    })
    .catch(err => console.error("Error loading data:", err));


    // ---- Render Theory ----
    function renderTheory() {
        const container = document.getElementById('theory-container');
        container.innerHTML = ''; // clear loading spinner

        // Helper to create an accordion item
        const createAccordion = (title, contentHTML) => {
            return `
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4">
                    <button class="w-full px-6 py-4 text-left font-semibold text-lg text-gray-800 bg-gray-50 hover:bg-gray-100 focus:outline-none flex justify-between items-center transition-colors" onclick="toggleAccordion(this)">
                        ${title}
                        <svg class="w-5 h-5 text-gray-500 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="accordion-content px-6 bg-white">
                        <div class="py-4">
                            ${contentHTML}
                        </div>
                    </div>
                </div>
            `;
        };

        // 1. Relative Clauses
        let rcHTML = `<p class="mb-4 text-gray-600">${theoryData.relative_clauses.description}</p>`;
        rcHTML += `<h4 class="font-bold text-gray-800 mb-2">Pronouns:</h4><ul class="list-disc pl-5 mb-4 text-gray-600">`;
        theoryData.relative_clauses.pronouns.forEach(p => {
            rcHTML += `<li><strong>${p.word}</strong>: ${p.usage}</li>`;
        });
        rcHTML += `</ul>`;
        
        rcHTML += `<h4 class="font-bold text-gray-800 mb-2">${theoryData.relative_clauses.prepositions_whom.title}</h4>`;
        rcHTML += `<p class="text-sm text-gray-600 mb-2">${theoryData.relative_clauses.prepositions_whom.details}</p>`;
        rcHTML += `<div class="bg-blue-50 p-3 rounded text-sm mb-4"><em>${theoryData.relative_clauses.prepositions_whom.key_difference}</em></div>`;
        
        rcHTML += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">`;
        rcHTML += `<div class="p-4 border border-gray-100 rounded-lg bg-gray-50"><h5 class="font-bold text-brand-700">Defining</h5><p class="text-sm mt-1 mb-2">${theoryData.relative_clauses.defining.details}</p><p class="italic text-sm text-gray-500">Ex: ${theoryData.relative_clauses.defining.examples[0]}</p></div>`;
        rcHTML += `<div class="p-4 border border-gray-100 rounded-lg bg-gray-50"><h5 class="font-bold text-brand-700">Non-defining</h5><p class="text-sm mt-1 mb-2">${theoryData.relative_clauses.non_defining.details}</p><p class="italic text-sm text-gray-500">Ex: ${theoryData.relative_clauses.non_defining.examples[0]}</p></div>`;
        rcHTML += `</div>`;
        
        container.innerHTML += createAccordion(theoryData.relative_clauses.title, rcHTML);

        // 2. Participle Clauses
        let pcHTML = `<p class="mb-4 text-gray-600">${theoryData.participle_clauses.description}</p>`;
        pcHTML += `<div class="flex space-x-4 mb-6">`;
        theoryData.participle_clauses.forms.forEach(f => {
            pcHTML += `<span class="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-sm font-medium">${f.form}</span>`;
        });
        pcHTML += `</div>`;

        theoryData.participle_clauses.usages.forEach(u => {
            pcHTML += `<h4 class="font-bold text-gray-800 mb-1 mt-4">${u.title}</h4>`;
            pcHTML += `<p class="text-sm text-gray-600 mb-2">${u.details}</p>`;
            pcHTML += `<div class="bg-gray-50 p-3 rounded text-sm space-y-2 border-l-2 border-brand-500">`;
            u.examples.forEach(ex => {
                if(typeof ex === 'string') {
                    pcHTML += `<p>${ex}</p>`;
                } else {
                    pcHTML += `<div><strong>${ex.conjunction}</strong><br><span class="text-gray-500 line-through">${ex.original}</span><br><span class="text-brand-700 font-medium">${ex.participle}</span></div>`;
                }
            });
            pcHTML += `</div>`;
        });
        
        container.innerHTML += createAccordion(theoryData.participle_clauses.title, pcHTML);

        // 3. Apposition
        let appHTML = `<p class="mb-4 text-gray-600">${theoryData.apposition.description}</p>`;
        appHTML += `<div class="bg-gray-50 p-4 rounded-lg border-l-2 border-brand-500 text-sm">`;
        theoryData.apposition.examples.forEach(ex => {
            if(ex.startsWith('Original')) {
                appHTML += `<p class="text-gray-500 line-through mb-1">${ex}</p>`;
            } else {
                appHTML += `<p class="text-brand-700 font-medium text-base">${ex}</p>`;
            }
        });
        appHTML += `</div>`;
        
        container.innerHTML += createAccordion(theoryData.apposition.title, appHTML);
    }

    // Export toggle function to global scope for inline onclick
    window.toggleAccordion = function(btn) {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector('svg');
        if (content.classList.contains('open')) {
            content.classList.remove('open');
            content.style.paddingTop = '0px';
            content.style.paddingBottom = '0px';
            icon.classList.remove('rotate-180');
        } else {
            content.classList.add('open');
            content.style.paddingTop = '1rem';
            content.style.paddingBottom = '1rem';
            icon.classList.add('rotate-180');
        }
    };

    // ---- Render Templates ----
    function renderTemplates() {
        const container = document.getElementById('templates-container');
        if(!theoryData || !theoryData.cambridge_strategies) return;

        theoryData.cambridge_strategies.templates.forEach(t => {
            const card = `
                <div class="bg-white border border-brand-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <span class="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded mb-3 uppercase tracking-wider">${t.part}</span>
                    <p class="text-lg font-semibold text-gray-900 mb-3 leading-snug">"${t.structure}"</p>
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <span class="text-xs font-bold text-brand-600 uppercase">Example in Use:</span>
                        <p class="text-sm text-gray-600 mt-1 italic">"${t.example}"</p>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    }

    // ---- Practice Test Logic ----
    let currentQuestions = [];
    let currentIndex = 0;
    let score = 0;

    const startBtn = document.getElementById('start-test-btn');
    const introDiv = document.getElementById('test-intro');
    const testDiv = document.getElementById('test-container');
    const resultsDiv = document.getElementById('test-results');
    const restartBtn = document.getElementById('restart-test-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-answer-btn');
    const answerInput = document.getElementById('answer-input');

    startBtn.addEventListener('click', startTest);
    restartBtn.addEventListener('click', startTest);
    nextBtn.addEventListener('click', nextQuestion);
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter' && !submitBtn.disabled) {
            checkAnswer();
        }
    });

    // Fisher-Yates Shuffle
    function shuffleArray(array) {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    function checkLastScore() {
        const lastScore = localStorage.getItem('c1_u7_lastScore_kw');
        const lastDate = localStorage.getItem('c1_u7_lastDate_kw');
        if (lastScore && lastDate) {
            document.getElementById('last-score-container').classList.remove('hidden');
            document.getElementById('last-score').textContent = lastScore;
            document.getElementById('last-date').textContent = new Date(lastDate).toLocaleDateString();
        }
    }

    function startTest() {
        currentQuestions = shuffleArray(questionsData); // Randomized
        currentIndex = 0;
        score = 0;
        
        introDiv.classList.add('hidden');
        resultsDiv.classList.add('hidden');
        testDiv.classList.remove('hidden');
        document.getElementById('score-live').classList.remove('hidden');
        document.getElementById('score-live').textContent = `Score: 0`;

        showQuestion();
    }

    function showQuestion() {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        submitBtn.disabled = false;
        document.getElementById('explanation-box').classList.add('hidden');
        
        const q = currentQuestions[currentIndex];
        document.getElementById('current-question-num').textContent = currentIndex + 1;
        
        document.getElementById('lead-in-text').textContent = q.leadIn;
        document.getElementById('keyword-text').textContent = q.keyword;
        document.getElementById('before-gap-text').innerHTML = q.beforeGap ? q.beforeGap + '&nbsp;' : '';
        document.getElementById('after-gap-text').innerHTML = q.afterGap ? '&nbsp;' + q.afterGap : '';
        
        answerInput.value = '';
        answerInput.disabled = false;
        answerInput.classList.remove('text-green-600', 'text-red-600', 'border-green-500', 'border-red-500');
        answerInput.classList.add('text-brand-700', 'border-brand-500');
        answerInput.focus();
    }

    function checkAnswer() {
        const q = currentQuestions[currentIndex];
        const userAnswer = answerInput.value.trim().toLowerCase();
        
        // Remove multiple spaces
        const normalizedAnswer = userAnswer.replace(/\\s+/g, ' ');
        
        // Check if keyword is used (case insensitive)
        const hasKeyword = normalizedAnswer.includes(q.keyword.toLowerCase());
        
        // Check if acceptable answer
        const isCorrect = hasKeyword && q.acceptableAnswers.some(ans => ans.toLowerCase() === normalizedAnswer);

        answerInput.disabled = true;
        submitBtn.classList.add('hidden');
        submitBtn.disabled = true;

        answerInput.classList.remove('text-brand-700', 'border-brand-500');

        if (isCorrect) {
            score++;
            document.getElementById('score-live').textContent = `Score: ${score}`;
            answerInput.classList.add('text-green-600', 'border-green-500');
        } else {
            answerInput.classList.add('text-red-600', 'border-red-500');
            // Show the user the correct answer below the input
            const correctAnsStr = q.acceptableAnswers.join(' / ');
            const expText = document.getElementById('explanation-text');
            expText.innerHTML = `<strong>Correct answer(s):</strong> ${correctAnsStr}<br><br>${q.explanation}`;
        }

        if (isCorrect) {
            const expText = document.getElementById('explanation-text');
            expText.innerHTML = `<strong>Correct!</strong><br><br>${q.explanation}`;
        }

        // Show Explanation
        const expBox = document.getElementById('explanation-box');
        expBox.classList.remove('hidden');
        
        nextBtn.classList.remove('hidden');
        nextBtn.focus();
    }

    function nextQuestion() {
        currentIndex++;
        if (currentIndex < currentQuestions.length) {
            showQuestion();
        } else {
            finishTest();
        }
    }

    function finishTest() {
        testDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        
        const total = currentQuestions.length;
        document.getElementById('final-score').textContent = `${score}/${total}`;
        
        let msg = "Great effort!";
        const percentage = score / total;
        if (percentage >= 0.9) msg = "Excellent! You have mastered Unit 7.";
        else if (percentage >= 0.7) msg = "Good job! A solid understanding.";
        else msg = "Keep practicing. Review the theory and try again.";
        
        document.getElementById('final-message').textContent = msg;

        // Save to localStorage
        localStorage.setItem('c1_u7_lastScore_kw', `${score}/${total}`);
        localStorage.setItem('c1_u7_lastDate_kw', new Date().toISOString());
        checkLastScore();
    }
});
