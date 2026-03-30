/**
 * Quiz Screen — voice-guided, icon-only, no text a child needs to read.
 * Auto-speaks all prompts and feedback.
 */
import { LETTERS } from './data.js';
import { speakLetter, speakWord, playCorrectSound, playWrongSound, playCelebrationSound, playPopSound, speakInstruction, speak } from '../shared/audio.js';
import { recordAlphabetQuizAnswer, addAlphabetStars, recordLetterAccuracy } from '../shared/storage.js';
import { advanceJourney, exitJourney } from '../shared/journey.js';

let questionIndex = 0;
let score = 0;
let totalQuestions = 10;
let questions = [];
let answered = false;
let wrongGuesses = 0;
let localNavigate = null;
let journeyForcedLetter = null;

export function renderQuiz(app, navigate, props = {}) {
  localNavigate = navigate;
  questionIndex = 0;
  score = 0;
  wrongGuesses = 0;
  
  if (window.isJourneyMode && props.index !== undefined) {
      journeyForcedLetter = LETTERS[props.index].letter; // E.g. forced 'A' quiz
  } else {
      journeyForcedLetter = null;
  }
  questions = generateQuestions(totalQuestions);

  app.innerHTML = `
    <div class="screen quiz-screen" id="quiz-view">
      <div class="top-bar">
        <button class="back-btn" id="quiz-back">${window.isJourneyMode ? '✕' : '🏠'}</button>
        <div class="top-bar-title">Alphabet Quiz</div>
        <div class="top-bar-right">
          <div class="quiz-score-badge" id="quiz-score">⭐ 0</div>
        </div>
      </div>
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" id="quiz-progress" style="width: 0%"></div>
      </div>
      <div class="quiz-content" id="quiz-content"></div>
    </div>
  `;

  document.getElementById('quiz-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    if (window.isJourneyMode) exitJourney(navigate);
    else navigate('alphabet-home');
  });

  // Auto-speak on entry — give child time to absorb
  setTimeout(() => {
    speakInstruction('quiz_entry');
    setTimeout(() => showQuestion(), 2500);
  }, 800);
}

function generateQuestions(count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    qs.push(generateSingleQuestion());
  }
  return qs;
}

function generateSingleQuestion() {
  // Choose correct letter (either random or driven by Journey)
  const correct = journeyForcedLetter 
      ? LETTERS.find(x => x.letter === journeyForcedLetter) 
      : LETTERS[Math.floor(Math.random() * LETTERS.length)];
      
  const type = Math.random() > 0.5 ? 'recognize' : 'sound';
  const wrongs = LETTERS.filter(l => l.letter !== correct.letter)
    .sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [...wrongs, correct].sort(() => Math.random() - 0.5);
  return { correct, choices, type };
}

function showQuestion() {
  if (questionIndex >= questions.length) {
    showResults();
    return;
  }
  answered = false;
  wrongGuesses = 0;
  const q = questions[questionIndex];
  const content = document.getElementById('quiz-content');
  const progress = document.getElementById('quiz-progress');
  progress.style.width = `${((questionIndex + 1) / totalQuestions) * 100}%`;

  if (q.type === 'recognize') {
    // Show emoji + speak the word — child picks the letter
    content.innerHTML = `
      <div class="quiz-question" id="quiz-q">
        <div class="quiz-emoji-display">${q.correct.emoji}</div>
        <div class="quiz-choices" id="quiz-choices">
          ${q.choices.map(c => `
            <button class="quiz-choice-btn" data-letter="${c.letter}" style="--choice-color: ${c.color}">
              <span class="quiz-choice-letter">${c.letter}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      </div>
    `;
    // Voice prompt — warm, slow, conversational
    setTimeout(() => {
      speak(`${q.correct.word}! Can you find the letter for ${q.correct.word}?`, { rate: 0.7, pitch: 1.15 });
    }, 800);
  } else {
    // Sound mode — play letter sound, child picks
    content.innerHTML = `
      <div class="quiz-question" id="quiz-q">
        <button class="quiz-sound-btn" id="quiz-play-sound">🔊</button>
        <div class="quiz-choices" id="quiz-choices">
          ${q.choices.map(c => `
            <button class="quiz-choice-btn" data-letter="${c.letter}" style="--choice-color: ${c.color}">
              <span class="quiz-choice-letter">${c.letter}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      </div>
    `;
    // Auto-speak the letter — with delay for child to look at choices first
    setTimeout(() => speakLetter(q.correct.letter), 1000);
    document.getElementById('quiz-play-sound')?.addEventListener('click', () => {
      speakLetter(q.correct.letter);
    });
  }

  document.getElementById('quiz-choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.quiz-choice-btn');
    if (!btn || answered) return;
    handleAnswer(btn.dataset.letter);
  });
}

function handleAnswer(selectedLetter) {
  answered = true;
  const q = questions[questionIndex];
  const isCorrect = selectedLetter === q.correct.letter;
  const feedback = document.getElementById('quiz-feedback');
  const buttons = document.querySelectorAll('.quiz-choice-btn');

  recordAlphabetQuizAnswer(isCorrect);
  
  // Note: Only record accuracy once per question. If they already guess wrong, don't record a correct hit later.
  if (wrongGuesses === 0) {
      recordLetterAccuracy(q.correct.letter, isCorrect);
  }

  if (isCorrect) {
    buttons.forEach(btn => {
      if (btn.dataset.letter === q.correct.letter) {
        btn.classList.add('correct');
        btn.classList.remove('hint-glow');
      }
      btn.style.pointerEvents = 'none';
    });

    score++;
    addAlphabetStars(3);
    playCorrectSound();
    // Voice + emoji feedback, no text
    feedback.innerHTML = '🎉';
    feedback.className = 'quiz-feedback correct-feedback';
    document.getElementById('quiz-score').textContent = `⭐ ${score}`;
    speakInstruction('quiz_correct');
  } else {
    wrongGuesses++;
    
    // Mark the selected one as wrong and disable it temporarily to prevent spamming
    const selectedBtn = Array.from(buttons).find(b => b.dataset.letter === selectedLetter);
    if (selectedBtn) {
      selectedBtn.classList.add('wrong');
      selectedBtn.style.pointerEvents = 'none';
      setTimeout(() => { 
        selectedBtn.classList.remove('wrong');
        selectedBtn.style.pointerEvents = 'auto'; // allow retry later if needed
      }, 1000);
    }
    
    playWrongSound();
    // Show correct answer as emoji — voice explains
    feedback.innerHTML = `${q.correct.emoji}`;
    feedback.className = 'quiz-feedback wrong-feedback';
    
    // Constructive Feedback: After 2 wrong guesses, highlight the correct one
    if (wrongGuesses >= 2) {
      const correctBtn = Array.from(buttons).find(b => b.dataset.letter === q.correct.letter);
      if (correctBtn) correctBtn.classList.add('hint-glow');
      setTimeout(() => {
        speak(`Look for ${q.correct.letter}!`, { rate: 0.85, pitch: 1.1 });
      }, 500);
      answered = false; // let them try again immediately
    } else {
      setTimeout(() => {
        speak(`It's ${q.correct.letter}! ${q.correct.letter} is for ${q.correct.word}!`, { rate: 0.85, pitch: 1.1 });
      }, 500);
      answered = false; // let them continue guessing
    }
    return; // Do NOT advance the question on wrong guess
  }

  // Only reached if correct. Give child plenty of time to absorb feedback before next question
  setTimeout(() => { questionIndex++; showQuestion(); }, 3000);
}

function showResults() {
  const content = document.getElementById('quiz-content');
  const progress = document.getElementById('quiz-progress');
  progress.style.width = '100%';

  const percent = Math.round((score / totalQuestions) * 100);
  let emoji = '';
  if (percent >= 80) emoji = '🏆';
  else if (percent >= 60) emoji = '🌟';
  else if (percent >= 40) emoji = '👍';
  else emoji = '💪';

  playCelebrationSound();

  content.innerHTML = `
    <div class="quiz-results">
      <div class="quiz-results-emoji">${emoji}</div>
      <div class="quiz-results-stars">
        ${'⭐'.repeat(Math.min(score, 10))}
      </div>
      <div class="quiz-results-actions">
        <button class="quiz-retry-btn" id="quiz-retry">🔄</button>
      </div>
    </div>
  `;

  // Voice announcement
  if (percent >= 60) {
    speakInstruction('quiz_results_great');
  } else {
    speakInstruction('quiz_results_good');
  }

  document.getElementById('quiz-retry').addEventListener('click', () => {
    playCelebrationSound();
    addAlphabetStars(3);
    questionIndex++;
    
    if (window.isJourneyMode) {
        // In journey, 1 question per module is plenty so it doesn't drag
        setTimeout(() => {
            advanceJourney(localNavigate);
        }, 1500);
        return;
    }

    if (questionIndex >= 5) { // If 5 questions are done, reset for a new set
      questionIndex = 0;
      score = 0;
      questions = generateQuestions(totalQuestions);
      document.getElementById('quiz-score').textContent = '⭐ 0';
      speakInstruction('quiz_entry');
      setTimeout(() => showQuestion(), 2500);
    } else { // Otherwise, just show the next question
      showQuestion();
    }
  });
}

export function injectQuizStyles() {
  if (document.getElementById('quiz-styles')) return;
  const style = document.createElement('style');
  style.id = 'quiz-styles';
  style.textContent = `
    .quiz-screen { background: var(--color-bg); }
    .quiz-progress-bar { height: 8px; background: rgba(0,0,0,0.06); margin: 0 var(--space-lg); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
    .quiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-secondary), var(--color-accent-green)); border-radius: 4px; transition: width 400ms ease; }
    .quiz-score-badge { font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); color: var(--color-accent-yellow); }
    .quiz-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .quiz-question { text-align: center; width: 100%; max-width: 500px; animation: pop var(--transition-slow) forwards; }
    .quiz-emoji-display { font-size: 100px; margin: var(--space-lg) 0; animation: float 3s ease-in-out infinite; }

    /* Sound button — big pulsing circle, icon only */
    .quiz-sound-btn {
      width: 120px; height: 120px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple));
      box-shadow: var(--shadow-xl); font-size: 3.5rem; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      animation: pulse 2s ease-in-out infinite; margin-bottom: var(--space-xl);
      transition: transform var(--transition-bounce);
    }
    .quiz-sound-btn:active { transform: scale(0.9); }

    /* Choice buttons — large, tactile */
    .quiz-choices { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg); max-width: 380px; margin: 0 auto; }
    .quiz-choice-btn {
      aspect-ratio: 1; border-radius: var(--radius-xl);
      background: var(--color-surface); box-shadow: var(--shadow-md);
      display: flex; align-items: center; justify-content: center;
      transition: transform var(--transition-bounce), box-shadow var(--transition-base);
      border: 4px solid transparent; min-height: 90px;
    }
    .quiz-choice-btn:active { transform: scale(0.92); }
    .quiz-choice-btn.correct { border-color: var(--color-accent-green); background: #E8F5E9; animation: pop 300ms ease; }
    .quiz-choice-btn.wrong { border-color: var(--color-primary); animation: shake 400ms ease; background: #FFEBEE; }
    .quiz-choice-btn.hint-glow { box-shadow: 0 0 20px 10px rgba(76, 175, 80, 0.4); border-color: var(--color-accent-green); animation: pulse 1.5s infinite; transition: all 0.3s; }
    .quiz-choice-letter { font-family: var(--font-display); font-size: var(--text-4xl); font-weight: 800; color: var(--choice-color); }

    /* Feedback — emoji only */
    .quiz-feedback { margin-top: var(--space-lg); font-size: 3rem; min-height: 60px; }
    .correct-feedback { animation: pop 300ms ease; }

    /* Results — emoji + stars, no text */
    .quiz-results { text-align: center; animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .quiz-results-emoji { font-size: 100px; margin-bottom: var(--space-lg); animation: bounce 1.5s ease-in-out infinite; }
    .quiz-results-stars { font-size: 2rem; letter-spacing: 4px; margin-bottom: var(--space-xl); }
    .quiz-retry-btn {
      width: 90px; height: 90px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      box-shadow: var(--shadow-lg); font-size: 2.5rem; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      animation: pulse 2s ease-in-out infinite;
      transition: transform var(--transition-bounce);
    }
    .quiz-retry-btn:active { transform: scale(0.9); }
  `;
  document.head.appendChild(style);
}
