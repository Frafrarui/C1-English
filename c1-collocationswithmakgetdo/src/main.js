import { collocations } from './data.js';

// --- APPLICATION STATE ---
const state = {
  // Navigation
  activeView: 'quiz',
  
  // Theme
  theme: 'dark-theme',

  // Quiz State
  quiz: {
    questions: [],
    currentIndex: 0,
    score: 0,
    selectedVerbs: new Set(),
    isAnswered: false,
    roundLength: 10,
    mistakes: [],
    mode: 'menu'
  },

  // Flashcards State
  flashcards: {
    currentIndex: 0,
    isFlipped: false
  },

  // Library/Dictionary State
  library: {
    searchQuery: '',
    activeFilter: 'all'
  },

  // Persisted User Stats
  stats: {
    streak: 0,
    maxStreak: 0,
    correctCount: 0,
    totalCount: 0,
    history: [] // Array of true/false values for the last 15 questions
  }
};

// --- DOM ELEMENTS ---
const elements = {
  // View Containers
  views: {
    quiz: document.getElementById('view-quiz'),
    flashcards: document.getElementById('view-flashcards'),
    library: document.getElementById('view-library')
  },
  
  // Navigation Buttons
  nav: {
    quiz: document.getElementById('nav-quiz'),
    flashcards: document.getElementById('nav-flashcards'),
    library: document.getElementById('nav-library')
  },

  themeToggle: document.getElementById('theme-toggle'),

  // Quiz DOM Elements
  quiz: {
    menuContainer: document.getElementById('quiz-menu-container'),
    playContainer: document.getElementById('quiz-play-container'),
    testBtns: document.querySelectorAll('.test-btn'),
    multiIndicator: document.getElementById('quiz-multi-indicator'),
    currentNum: document.getElementById('quiz-current-num'),
    totalNum: document.getElementById('quiz-total-num'),
    scoreIndicator: document.getElementById('quiz-score-indicator'),
    progressFill: document.getElementById('quiz-progress-fill'),
    phraseBlank: document.getElementById('quiz-phrase-blank'),
    phraseTarget: document.getElementById('quiz-phrase-target'),
    translation: document.getElementById('quiz-translation'),
    choiceBtns: document.querySelectorAll('.choice-btn'),
    feedback: document.getElementById('quiz-feedback'),
    submitBtn: document.getElementById('quiz-submit-btn'),
    nextBtn: document.getElementById('quiz-next-btn'),
    // Sidebar Stats
    statsStreak: document.getElementById('stats-streak'),
    statsMaxStreak: document.getElementById('stats-max-streak'),
    statsAccuracy: document.getElementById('stats-accuracy'),
    statsCompleted: document.getElementById('stats-completed'),
    historyDots: document.getElementById('history-dots'),
    resetBtn: document.getElementById('stats-reset-btn')
  },

  // Flashcards DOM Elements
  flashcards: {
    card: document.getElementById('flashcard'),
    phrase: document.getElementById('card-phrase'),
    backPhrase: document.getElementById('card-back-phrase'),
    verbsContainer: document.getElementById('card-verbs-container'),
    translation: document.getElementById('card-translation'),
    counter: document.getElementById('card-counter'),
    prevBtn: document.getElementById('card-prev-btn'),
    nextBtn: document.getElementById('card-next-btn-deck')
  },

  // Library DOM Elements
  library: {
    search: document.getElementById('library-search'),
    filterChips: document.querySelectorAll('.filter-chips .chip'),
    tableBody: document.getElementById('library-table-body'),
    emptyState: document.getElementById('library-empty')
  },

  // Modal DOM Elements
  modal: {
    overlay: document.getElementById('modal-completion'),
    correctRatio: document.getElementById('modal-correct-ratio'),
    accuracy: document.getElementById('modal-accuracy'),
    restartBtn: document.getElementById('modal-restart-btn'),
    retryBtn: document.getElementById('modal-retry-mistakes-btn')
  }
};

// --- INITIALIZATION ---
function init() {
  loadStatsAndTheme();
  setupNavigation();
  setupThemeToggle();
  setupQuizEngine();
  setupFlashcardsEngine();
  setupLibraryEngine();
  setupKeyboardListeners();

  // Menu is visible by default
  
  // Show initial flashcard
  renderFlashcard();
  
  // Populate library table
  renderLibrary();
}

// --- PERSISTENCE ---
function loadStatsAndTheme() {
  // Load Theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    state.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    state.theme = 'light-theme';
  }
  
  document.body.className = state.theme;

  // Load Stats safely
  const savedStats = localStorage.getItem('collocations_stats');
  if (savedStats) {
    try {
      const parsed = JSON.parse(savedStats);
      if (parsed && typeof parsed === 'object') {
        state.stats = {
          streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
          maxStreak: typeof parsed.maxStreak === 'number' ? parsed.maxStreak : 0,
          correctCount: typeof parsed.correctCount === 'number' ? parsed.correctCount : 0,
          totalCount: typeof parsed.totalCount === 'number' ? parsed.totalCount : 0,
          history: Array.isArray(parsed.history) ? parsed.history : []
        };
      }
    } catch (e) {
      console.error('Error parsing stats, resetting to defaults:', e);
    }
  }
  updateStatsDisplay();
}

function saveStats() {
  localStorage.setItem('collocations_stats', JSON.stringify(state.stats));
  updateStatsDisplay();
}

function updateStatsDisplay() {
  if (elements.quiz.statsStreak) elements.quiz.statsStreak.textContent = state.stats.streak;
  if (elements.quiz.statsMaxStreak) elements.quiz.statsMaxStreak.textContent = state.stats.maxStreak;
  
  // Accuracy
  const accuracy = state.stats.totalCount > 0 
    ? Math.round((state.stats.correctCount / state.stats.totalCount) * 100) 
    : 0;
  if (elements.quiz.statsAccuracy) elements.quiz.statsAccuracy.textContent = `${accuracy}%`;
  
  if (elements.quiz.statsCompleted) elements.quiz.statsCompleted.textContent = state.stats.totalCount;

  // Render recent history dots
  if (elements.quiz.historyDots) {
    elements.quiz.historyDots.innerHTML = '';
    if (state.stats.history.length === 0) {
      elements.quiz.historyDots.innerHTML = '<span class="empty-history-text">Responde preguntas para ver tu historial</span>';
    } else {
      // Show up to the last 15 answers
      const recentHistory = state.stats.history.slice(-15);
      recentHistory.forEach(isCorrect => {
        const dot = document.createElement('span');
        dot.className = `history-dot ${isCorrect ? 'correct' : 'incorrect'}`;
        dot.title = isCorrect ? 'Acierto' : 'Fallo';
        elements.quiz.historyDots.appendChild(dot);
      });
    }
  }
}

// --- NAVIGATION ---
function setupNavigation() {
  Object.keys(elements.nav).forEach(viewName => {
    elements.nav[viewName].addEventListener('click', () => {
      switchView(viewName);
    });
  });
}

function switchView(viewName) {
  // Update active view in state
  state.activeView = viewName;

  // Update nav menu active states
  Object.keys(elements.nav).forEach(key => {
    elements.nav[key].classList.toggle('active', key === viewName);
  });

  // Toggle active view sections
  Object.keys(elements.views).forEach(key => {
    elements.views[key].classList.toggle('active', key === viewName);
  });
  
  // Close card when switching away from flashcards
  if (viewName !== 'flashcards') {
    state.flashcards.isFlipped = false;
    elements.flashcards.card.classList.remove('flipped');
  }
}

// --- THEME TOGGLE ---
function setupThemeToggle() {
  elements.themeToggle.addEventListener('click', () => {
    if (state.theme === 'dark-theme') {
      state.theme = 'light-theme';
    } else {
      state.theme = 'dark-theme';
    }
    document.body.className = state.theme;
    localStorage.setItem('theme', state.theme);
  });
}

// --- QUIZ ENGINE ---
function setupQuizEngine() {
  // Choice button handlers
  elements.quiz.choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.quiz.isAnswered) return;
      
      const verb = btn.getAttribute('data-verb');
      if (state.quiz.selectedVerbs.has(verb)) {
        state.quiz.selectedVerbs.delete(verb);
        btn.classList.remove('selected');
      } else {
        state.quiz.selectedVerbs.add(verb);
        btn.classList.add('selected');
      }
      
      // Update the blank space dynamically
      updateBlankText();
    });
  });

  // Check Answer Button
  elements.quiz.submitBtn.addEventListener('click', () => {
    if (state.quiz.selectedVerbs.size === 0) {
      showTemporaryFeedback('Selecciona al menos un verbo antes de comprobar.', 'error');
      return;
    }
    checkQuizAnswer();
  });

  // Next Question Button
  elements.quiz.nextBtn.addEventListener('click', () => {
    goToNextQuestion();
  });

  // Reset Stats Button
  elements.quiz.resetBtn.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar todas tus estadísticas? Esto reiniciará la racha y precisión.')) {
      state.stats = {
        streak: 0,
        maxStreak: 0,
        correctCount: 0,
        totalCount: 0,
        history: []
      };
      saveStats();
    }
  });

  // Modal Restart Button (Back to Menu)
  elements.modal.restartBtn.addEventListener('click', () => {
    elements.modal.overlay.classList.add('hidden');
    elements.quiz.menuContainer.classList.remove('hidden');
    elements.quiz.playContainer.classList.add('hidden');
    state.quiz.mode = 'menu';
  });

  // Modal Retry Mistakes Button
  elements.modal.retryBtn.addEventListener('click', () => {
    elements.modal.overlay.classList.add('hidden');
    startMistakesRound();
  });

  // Test Selection Buttons
  elements.quiz.testBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const testNum = btn.getAttribute('data-test');
      if (testNum === '1') startSpecificTest(0, 10);
      else if (testNum === '2') startSpecificTest(10, 20);
      else if (testNum === '3') startSpecificTest(20, 30);
      else if (testNum === '4') startSpecificTest(30, 40);
      else if (testNum === '5') startSpecificTest(40, 50);
    });
  });
}

function startSpecificTest(startIdx, endIdx) {
  state.quiz.questions = collocations.slice(startIdx, endIdx);
  state.quiz.roundLength = state.quiz.questions.length;
  state.quiz.currentIndex = 0;
  state.quiz.score = 0;
  state.quiz.mistakes = [];
  state.quiz.mode = 'playing';
  
  elements.quiz.menuContainer.classList.add('hidden');
  elements.quiz.playContainer.classList.remove('hidden');
  
  loadQuizQuestion();
}

function startMistakesRound() {
  state.quiz.questions = [...state.quiz.mistakes];
  state.quiz.roundLength = state.quiz.questions.length;
  state.quiz.currentIndex = 0;
  state.quiz.score = 0;
  state.quiz.mistakes = []; // Clear for this new round
  state.quiz.mode = 'playing';
  
  loadQuizQuestion();
}

function loadQuizQuestion() {
  state.quiz.isAnswered = false;
  state.quiz.selectedVerbs.clear();
  
  const currentQuestion = state.quiz.questions[state.quiz.currentIndex];
  
  // Update UI Elements
  elements.quiz.currentNum.textContent = state.quiz.currentIndex + 1;
  elements.quiz.totalNum.textContent = state.quiz.roundLength;
  elements.quiz.scoreIndicator.textContent = `Aciertos: ${state.quiz.score}/${state.quiz.currentIndex}`;
  
  // Progress Bar Fill
  const progressPercent = ((state.quiz.currentIndex) / state.quiz.roundLength) * 100;
  elements.quiz.progressFill.style.width = `${progressPercent}%`;

  // Question Phrase & Translation
  elements.quiz.phraseTarget.textContent = currentQuestion.phrase;
  elements.quiz.translation.textContent = `Significado: ${currentQuestion.translation}`;
  
  // Reset Blank Space
  elements.quiz.phraseBlank.textContent = '_____';
  elements.quiz.phraseBlank.className = 'phrase-blank';

  // Multi Indicator Logic
  if (currentQuestion.verbs.length > 1) {
    elements.quiz.multiIndicator.textContent = `(Selecciona ${currentQuestion.verbs.length} opciones)`;
    elements.quiz.multiIndicator.classList.remove('hidden');
  } else {
    elements.quiz.multiIndicator.classList.add('hidden');
  }

  // Reset Choice Buttons styles and clear inline styles
  elements.quiz.choiceBtns.forEach(btn => {
    btn.classList.remove('selected', 'correct', 'incorrect');
    btn.style.borderColor = '';
    btn.style.color = '';
    btn.style.backgroundColor = '';
    btn.disabled = false;
  });

  // Toggle Action Buttons
  elements.quiz.feedback.classList.add('hidden');
  elements.quiz.submitBtn.classList.remove('hidden');
  elements.quiz.nextBtn.classList.add('hidden');
}

function updateBlankText() {
  if (state.quiz.selectedVerbs.size === 0) {
    elements.quiz.phraseBlank.textContent = '_____';
  } else {
    elements.quiz.phraseBlank.textContent = Array.from(state.quiz.selectedVerbs).join(' / ');
  }
}

function showTemporaryFeedback(message, type) {
  elements.quiz.feedback.textContent = message;
  elements.quiz.feedback.className = `quiz-feedback ${type}`;
  elements.quiz.feedback.classList.remove('hidden');
  
  // Hide feedback after 3 seconds if not permanently showing (like after answering)
  if (!state.quiz.isAnswered) {
    setTimeout(() => {
      if (!state.quiz.isAnswered) {
        elements.quiz.feedback.classList.add('hidden');
      }
    }, 3000);
  }
}

function checkQuizAnswer() {
  state.quiz.isAnswered = true;
  const currentQuestion = state.quiz.questions[state.quiz.currentIndex];
  const correctVerbs = currentQuestion.verbs; // Array: e.g. ["get", "do"]
  const userVerbs = Array.from(state.quiz.selectedVerbs);

  // Check correctness rules:
  // Must select ALL correct verbs and NO incorrect verbs
  const hasSelectedAllCorrect = correctVerbs.every(verb => state.quiz.selectedVerbs.has(verb));
  const hasSelectedOnlyCorrect = userVerbs.every(verb => correctVerbs.includes(verb));
  
  const isCorrect = hasSelectedAllCorrect && hasSelectedOnlyCorrect;
  const isPartiallyCorrect = !isCorrect && hasSelectedOnlyCorrect && userVerbs.length > 0;

  if (!isCorrect) {
    state.quiz.mistakes.push(currentQuestion);
  }

  // Visual cues for buttons
  elements.quiz.choiceBtns.forEach(btn => {
    btn.disabled = true;
    const verb = btn.getAttribute('data-verb');
    const isChosen = state.quiz.selectedVerbs.has(verb);
    const isVerbCorrect = correctVerbs.includes(verb);

    if (isVerbCorrect) {
      // Highlight all correct answers in green
      btn.style.borderColor = 'var(--color-success)';
      btn.style.color = 'var(--color-success)';
      if (isChosen) {
        btn.style.backgroundColor = 'var(--color-success-bg)';
      }
    } else if (isChosen && !isVerbCorrect) {
      // Highlight wrong choice in red
      btn.style.borderColor = 'var(--color-error)';
      btn.style.color = 'var(--color-error)';
      btn.style.backgroundColor = 'var(--color-error-bg)';
    }
  });

  // Display all valid correct verbs inside the blank space
  elements.quiz.phraseBlank.textContent = correctVerbs.join(' / ');

  if (isCorrect) {
    state.quiz.score++;
    elements.quiz.phraseBlank.className = 'phrase-blank correct';
    
    // Add to stats
    state.stats.streak++;
    if (state.stats.streak > state.stats.maxStreak) {
      state.stats.maxStreak = state.stats.streak;
    }
    state.stats.correctCount++;
    state.stats.history.push(true);

    // Formulate feedback text
    let feedbackMsg = `<strong>¡Excelente!</strong> El verbo es correcto.`;
    if (correctVerbs.length > 1) {
      feedbackMsg = `<strong>¡Perfecto!</strong> Has seleccionado las ${correctVerbs.length} opciones correctas: <strong>${correctVerbs.join(' y ')}</strong>.`;
    }
    
    showFeedback(feedbackMsg, 'success');
  } else {
    elements.quiz.phraseBlank.className = 'phrase-blank incorrect';
    // Add shake animation to the question card
    const cardEl = document.querySelector('.quiz-card');
    cardEl.classList.add('shake');
    setTimeout(() => cardEl.classList.remove('shake'), 400);

    // Reset streak
    state.stats.streak = 0;
    state.stats.history.push(false);
    
    let feedbackMsg = '';
    if (isPartiallyCorrect) {
      feedbackMsg = `<strong>¡Casi!</strong> Esta colocación admite ${correctVerbs.length} verbos correctos: <strong>${correctVerbs.join(' y ')}</strong>. Debes seleccionar ambos.`;
    } else {
      const correctStr = correctVerbs.map(v => `<strong>${v}</strong>`).join(correctVerbs.length > 2 ? ', ' : ' o ');
      feedbackMsg = `<strong>Incorrecto.</strong> El verbo correcto es ${correctStr}.`;
      if (correctVerbs.length > 1) {
        feedbackMsg = `<strong>Incorrecto.</strong> Esta colocación admite ${correctVerbs.length} verbos correctos: <strong>${correctVerbs.join(' y ')}</strong>.`;
      }
    }
    
    showFeedback(feedbackMsg, 'error');
  }

  // Update total questions answered
  state.stats.totalCount++;
  saveStats();

  // Update score badge
  elements.quiz.scoreIndicator.textContent = `Aciertos: ${state.quiz.score}/${state.quiz.currentIndex + 1}`;

  // Toggle actions buttons
  elements.quiz.submitBtn.classList.add('hidden');
  elements.quiz.nextBtn.classList.remove('hidden');
}

function showFeedback(htmlMessage, type) {
  elements.quiz.feedback.innerHTML = htmlMessage;
  elements.quiz.feedback.className = `quiz-feedback ${type}`;
  elements.quiz.feedback.classList.remove('hidden');
}

function goToNextQuestion() {
  state.quiz.currentIndex++;
  
  if (state.quiz.currentIndex >= state.quiz.roundLength) {
    // End of round, show modal
    showCompletionModal();
  } else {
    loadQuizQuestion();
  }
}

function showCompletionModal() {
  elements.quiz.progressFill.style.width = '100%';
  
  const accuracy = Math.round((state.quiz.score / state.quiz.roundLength) * 100);
  elements.modal.correctRatio.textContent = `${state.quiz.score} / ${state.quiz.roundLength}`;
  elements.modal.accuracy.textContent = `${accuracy}%`;
  
  if (state.quiz.mistakes.length > 0) {
    elements.modal.retryBtn.classList.remove('hidden');
  } else {
    elements.modal.retryBtn.classList.add('hidden');
  }
  
  elements.modal.overlay.classList.remove('hidden');
}

// --- FLASHCARDS ENGINE ---
function setupFlashcardsEngine() {
  // Flip Card Handler
  elements.flashcards.card.addEventListener('click', () => {
    flipFlashcard();
  });

  // Prev / Next button handlers
  elements.flashcards.prevBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid flipping when clicking navigation buttons
    navigateFlashcard(-1);
  });

  elements.flashcards.nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateFlashcard(1);
  });
}

function flipFlashcard() {
  state.flashcards.isFlipped = !state.flashcards.isFlipped;
  elements.flashcards.card.classList.toggle('flipped', state.flashcards.isFlipped);
}

function navigateFlashcard(direction) {
  // Reset flipped state first with a slight delay or immediately
  state.flashcards.isFlipped = false;
  elements.flashcards.card.classList.remove('flipped');
  
  // Calculate new index with wrapping
  let newIndex = state.flashcards.currentIndex + direction;
  if (newIndex < 0) {
    newIndex = collocations.length - 1;
  } else if (newIndex >= collocations.length) {
    newIndex = 0;
  }
  
  state.flashcards.currentIndex = newIndex;
  
  // Small delay to allow card to unflip before text updates
  setTimeout(() => {
    renderFlashcard();
  }, 150);
}

function renderFlashcard() {
  const collocation = collocations[state.flashcards.currentIndex];
  
  // Front of card
  elements.flashcards.phrase.textContent = collocation.phrase;
  
  // Back of card
  elements.flashcards.backPhrase.textContent = collocation.phrase;
  elements.flashcards.translation.textContent = `Significado: ${collocation.translation}`;
  
  // Generate correct verbs tags
  elements.flashcards.verbsContainer.innerHTML = '';
  collocation.verbs.forEach(verb => {
    const span = document.createElement('span');
    span.className = `verb-tag ${verb}`;
    span.textContent = verb;
    elements.flashcards.verbsContainer.appendChild(span);
  });
  
  // Counter
  elements.flashcards.counter.textContent = `${state.flashcards.currentIndex + 1} de ${collocations.length}`;
}

// --- LIBRARY/DICTIONARY ENGINE ---
function setupLibraryEngine() {
  // Search keyup
  elements.library.search.addEventListener('input', (e) => {
    state.library.searchQuery = e.target.value.toLowerCase().trim();
    renderLibrary();
  });

  // Filter chips handler
  elements.library.filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Toggle active states
      elements.library.filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      state.library.activeFilter = chip.getAttribute('data-filter');
      renderLibrary();
    });
  });
}

function renderLibrary() {
  elements.library.tableBody.innerHTML = '';
  
  // Filter the list
  const filtered = collocations.filter(item => {
    // Search match
    const phraseMatch = item.phrase.toLowerCase().includes(state.library.searchQuery);
    const translationMatch = item.translation.toLowerCase().includes(state.library.searchQuery);
    const matchesSearch = phraseMatch || translationMatch;
    
    // Verb filter match
    const matchesFilter = state.library.activeFilter === 'all' || item.verbs.includes(state.library.activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  // Render Table
  if (filtered.length === 0) {
    elements.library.emptyState.classList.remove('hidden');
  } else {
    elements.library.emptyState.classList.add('hidden');
    
    filtered.forEach(item => {
      const row = document.createElement('tr');
      
      // Highlight expression based on verbs
      const phraseTd = document.createElement('td');
      phraseTd.className = 'phrase-cell';
      
      // Construct collocation full expression
      const verbPart = item.verbs.join(' / ');
      phraseTd.innerHTML = `<span style="color: var(--color-primary); font-weight: 700;">${verbPart}</span> ${item.phrase}`;
      row.appendChild(phraseTd);
      
      // Verbs badges td
      const verbsTd = document.createElement('td');
      verbsTd.className = 'verbs-cell';
      item.verbs.forEach(v => {
        const badge = document.createElement('span');
        badge.className = `verb-mini-badge ${v}`;
        badge.textContent = v;
        verbsTd.appendChild(badge);
      });
      row.appendChild(verbsTd);
      
      // Translation td
      const translationTd = document.createElement('td');
      translationTd.className = 'translation-cell';
      translationTd.textContent = item.translation;
      row.appendChild(translationTd);
      
      elements.library.tableBody.appendChild(row);
    });
  }
}

// --- KEYBOARD LISTENERS ---
function setupKeyboardListeners() {
  document.addEventListener('keydown', (e) => {
    // Keyboard support for Flashcard deck
    if (state.activeView === 'flashcards') {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling
        flipFlashcard();
      } else if (e.code === 'ArrowLeft') {
        navigateFlashcard(-1);
      } else if (e.code === 'ArrowRight') {
        navigateFlashcard(1);
      }
    }
    
    // Keyboard support for Quiz view
    if (state.activeView === 'quiz' && !elements.modal.overlay.classList.contains('hidden')) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        elements.modal.restartBtn.click();
      }
    } else if (state.activeView === 'quiz') {
      // Option selection via 1, 2, 3 keys
      if (!state.quiz.isAnswered) {
        if (e.key === '1') {
          toggleChoiceByVerb('make');
        } else if (e.key === '2') {
          toggleChoiceByVerb('get');
        } else if (e.key === '3') {
          toggleChoiceByVerb('do');
        } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
          e.preventDefault();
          elements.quiz.submitBtn.click();
        }
      } else {
        if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'ArrowRight' || e.code === 'Space') {
          e.preventDefault();
          elements.quiz.nextBtn.click();
        }
      }
    }
  });
}

function toggleChoiceByVerb(verb) {
  const btn = Array.from(elements.quiz.choiceBtns).find(b => b.getAttribute('data-verb') === verb);
  if (btn) btn.click();
}

// Run application
window.addEventListener('DOMContentLoaded', init);
