let allWords = [];
let currentTestWords = [];
let testResults = []; // null: unattempted, true: correct on first try, false: incorrect
let currentIndex = 0;
let currentWord = null;
const WORDS_PER_TEST = 20;

// DOM Elements
const elements = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  
  // Views
  menuView: document.getElementById('menu-view'),
  exerciseView: document.getElementById('exercise-view'),
  resultsView: document.getElementById('results-view'),
  
  // Menu Elements
  testGrid: document.getElementById('test-grid'),
  headerSubtitle: document.getElementById('header-subtitle'),
  
  // Exercise Elements
  card: document.querySelector('.card'),
  pos: document.getElementById('part-of-speech'),
  baseWord: document.getElementById('base-word'),
  translation: document.getElementById('translation'),
  exampleContainer: document.getElementById('example-container'),
  feedback: document.getElementById('feedback-message'),
  btnPrev: document.getElementById('btn-prev'),
  btnCheck: document.getElementById('btn-check'),
  btnShow: document.getElementById('btn-show'),
  btnNext: document.getElementById('btn-next'),
  btnBackMenu: document.getElementById('btn-back-menu'),
  currentIndexEl: document.getElementById('current-index'),
  totalWordsEl: document.getElementById('total-words'),
  
  // Results Elements
  finalScore: document.getElementById('final-score'),
  finalTotal: document.getElementById('final-total'),
  scoreMessage: document.getElementById('score-message'),
  btnRetryMistakes: document.getElementById('btn-retry-mistakes'),
  btnResultsMenu: document.getElementById('btn-results-menu')
};

// Initialize app
async function init() {
  try {
    const res = await fetch('/api/words');
    if (!res.ok) throw new Error(await res.text());
    
    allWords = await res.json();
    if (allWords.length === 0) throw new Error("No words found in the database.");
    
    elements.loading.classList.add('hidden');
    
    renderMenu();
    setupEventListeners();
  } catch (err) {
    elements.loading.classList.add('hidden');
    elements.error.textContent = `Error: ${err.message}`;
    elements.error.classList.remove('hidden');
  }
}

function showView(viewId) {
  elements.menuView.classList.add('hidden');
  elements.exerciseView.classList.add('hidden');
  elements.resultsView.classList.add('hidden');
  
  document.getElementById(viewId).classList.remove('hidden');
}

function renderMenu() {
  elements.testGrid.innerHTML = '';
  elements.headerSubtitle.textContent = 'Select a test to begin';
  
  const numTests = Math.ceil(allWords.length / WORDS_PER_TEST);
  
  for (let i = 0; i < numTests; i++) {
    const start = i * WORDS_PER_TEST;
    const end = Math.min(start + WORDS_PER_TEST, allWords.length);
    
    const btn = document.createElement('button');
    btn.className = 'test-btn';
    btn.textContent = `Test ${i + 1}`;
    btn.title = `Words ${start + 1} to ${end}`;
    
    btn.addEventListener('click', () => startTest(allWords.slice(start, end), `Test ${i + 1}`));
    elements.testGrid.appendChild(btn);
  }
  
  showView('menu-view');
}

function startTest(wordsArray, title) {
  currentTestWords = wordsArray;
  testResults = new Array(currentTestWords.length).fill(null);
  currentIndex = 0;
  
  elements.totalWordsEl.textContent = currentTestWords.length;
  elements.headerSubtitle.textContent = title;
  
  showView('exercise-view');
  loadWord(0);
}

function loadWord(index) {
  if (index >= currentTestWords.length) {
    finishTest();
    return;
  }
  if (index < 0) {
    index = 0; // Prevent going below 0
  }
  
  currentIndex = index;
  currentWord = currentTestWords[currentIndex];
  
  // Reset UI states
  elements.card.className = 'card';
  elements.feedback.className = 'feedback hidden';
  
  // Enable/disable navigation
  elements.btnPrev.disabled = currentIndex === 0;
  
  // If word was already answered correctly or revealed, disable inputs
  if (testResults[currentIndex] !== null) {
    elements.btnCheck.disabled = true;
    elements.btnShow.disabled = true;
  } else {
    elements.btnCheck.disabled = false;
    elements.btnShow.disabled = false;
  }
  
  // Populate data
  elements.baseWord.textContent = currentWord.baseWord;
  elements.pos.textContent = currentWord.partOfSpeech;
  elements.translation.textContent = currentWord.translation;
  elements.currentIndexEl.textContent = currentIndex + 1;

  renderExample(currentWord);
}

function renderExample(word) {
  const example = word.example;
  const derived = word.derivedWord;
  
  const regex = new RegExp(`(${escapeRegExp(derived)})`, 'i');
  const parts = example.split(regex);
  
  elements.exampleContainer.innerHTML = '';
  
  if (parts.length > 1) {
    parts.forEach(part => {
      if (part.toLowerCase() === derived.toLowerCase()) {
        createInputField(derived);
      } else {
        const textNode = document.createTextNode(part);
        elements.exampleContainer.appendChild(textNode);
      }
    });
  } else {
    // Fallback
    elements.exampleContainer.innerHTML = `${example} <br><br>`;
    createInputField(derived, true);
  }

  // Handle pre-filled state if already answered
  const inputEl = document.getElementById('user-input');
  if (inputEl) {
    if (testResults[currentIndex] !== null) {
      // It was already answered or shown
      inputEl.value = derived;
      inputEl.disabled = true;
      if (testResults[currentIndex] === true) {
        inputEl.classList.add('correct');
        elements.feedback.textContent = 'You got this right!';
        elements.feedback.className = 'feedback success';
      } else {
        inputEl.classList.add('incorrect');
        elements.feedback.textContent = 'You missed this one previously.';
        elements.feedback.className = 'feedback error';
      }
    } else {
      setTimeout(() => inputEl.focus(), 50);
    }
  }
}

function createInputField(derived, isFallback = false) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'word-input';
  input.id = 'user-input';
  input.autocomplete = 'off';
  input.spellcheck = false;
  
  if (isFallback) {
    input.placeholder = 'Type derived word...';
  } else {
    input.style.width = Math.max(derived.length * 1.2, 5) + 'ch';
  }
  
  elements.exampleContainer.appendChild(input);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkAnswer() {
  const inputEl = document.getElementById('user-input');
  if (!inputEl || inputEl.disabled) return;
  
  const userAnswer = inputEl.value.trim().toLowerCase();
  const correctAnswer = currentWord.derivedWord.toLowerCase();
  
  elements.card.className = 'card'; // reset animations
  
  if (userAnswer === correctAnswer) {
    // Correct
    if (testResults[currentIndex] === null) {
      testResults[currentIndex] = true;
    }
    
    inputEl.classList.add('correct');
    inputEl.classList.remove('incorrect');
    inputEl.disabled = true;
    
    elements.card.classList.add('success');
    elements.feedback.textContent = 'Correct! Well done 🎉';
    elements.feedback.className = 'feedback success';
    
    elements.btnCheck.disabled = true;
    elements.btnShow.disabled = true;
    elements.btnNext.focus();
  } else {
    // Incorrect
    if (testResults[currentIndex] === null) {
      testResults[currentIndex] = false;
    }
    
    inputEl.classList.add('incorrect');
    
    elements.card.classList.add('error');
    elements.feedback.textContent = 'Not quite! Try again.';
    elements.feedback.className = 'feedback error';
    
    setTimeout(() => elements.card.classList.remove('error'), 400);
    inputEl.focus();
  }
}

function showAnswer() {
  const inputEl = document.getElementById('user-input');
  if (!inputEl || inputEl.disabled) return;
  
  if (testResults[currentIndex] === null) {
    testResults[currentIndex] = false; // Revealing = incorrect
  }
  
  inputEl.value = currentWord.derivedWord;
  inputEl.classList.add('correct');
  inputEl.disabled = true;
  
  elements.feedback.textContent = `The answer is: ${currentWord.derivedWord}`;
  elements.feedback.className = 'feedback';
  
  elements.btnCheck.disabled = true;
  elements.btnShow.disabled = true;
  elements.btnNext.focus();
}

function finishTest() {
  showView('results-view');
  
  const score = testResults.filter(val => val === true).length;
  
  elements.headerSubtitle.textContent = 'Test Results';
  elements.finalScore.textContent = score;
  elements.finalTotal.textContent = currentTestWords.length;
  
  // Calculate mistakes
  const mistakes = [];
  for (let i = 0; i < currentTestWords.length; i++) {
    if (testResults[i] !== true) {
      mistakes.push(currentTestWords[i]);
    }
  }

  // Configure Retry Button
  if (mistakes.length > 0) {
    elements.btnRetryMistakes.classList.remove('hidden');
    elements.btnRetryMistakes.onclick = () => {
      startTest(mistakes, 'Retrying Mistakes');
    };
  } else {
    elements.btnRetryMistakes.classList.add('hidden');
  }
  
  const percentage = score / currentTestWords.length;
  if (percentage === 1) {
    elements.scoreMessage.textContent = 'Perfect score! You are a master! 🏆';
  } else if (percentage >= 0.8) {
    elements.scoreMessage.textContent = `Excellent work! You only missed ${mistakes.length} word(s). 🌟`;
  } else if (percentage >= 0.5) {
    elements.scoreMessage.textContent = `Good job! You missed ${mistakes.length} word(s). Keep practicing! 👍`;
  } else {
    elements.scoreMessage.textContent = `Keep studying! You missed ${mistakes.length} word(s). You will get better! 💪`;
  }
}

function setupEventListeners() {
  elements.btnCheck.addEventListener('click', checkAnswer);
  elements.btnShow.addEventListener('click', showAnswer);
  
  elements.btnNext.addEventListener('click', () => {
    loadWord(currentIndex + 1);
  });
  
  elements.btnPrev.addEventListener('click', () => {
    loadWord(currentIndex - 1);
  });
  
  elements.btnBackMenu.addEventListener('click', renderMenu);
  elements.btnResultsMenu.addEventListener('click', renderMenu);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (elements.exerciseView.classList.contains('hidden')) return;
    
    if (e.key === 'Enter') {
      if (!elements.btnCheck.disabled) {
        checkAnswer();
      }
    } else if (e.key === 'ArrowRight') {
      loadWord(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      loadWord(currentIndex - 1);
    }
  });
}

// Start the app
init();
