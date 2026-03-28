/**
 * Quiz Screen — CVC Words Adventure
 * Voice speaks a CVC word → child picks the matching emoji from 4 choices.
 * 8 questions per round.
 */
import { getAllWords } from './data.js';
import { speakWord, playCorrectSound, playWrongSound, playCelebrationSound, playPopSound, speakInstruction, speak } from '../shared/audio.js';
import { recordCvcQuizAnswer, addCvcStars, recordCvcAccuracy } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';
import { advanceJourney, exitJourney } from '../shared/journey.js';

let questionIndex = 0;
let score = 0;
let questions = [];
let answered = false;
let wrongGuesses = 0;
const TOTAL_QUESTIONS = 8;
let localNavigate = null;

export function renderQuiz(app, navigate, props = {}) {
  localNavigate = navigate;
  questionIndex = 0;
  score = 0;
  answered = false;
  questions = generateQuestions(TOTAL_QUESTIONS);

  app.innerHTML = `
    <div class="screen cvc-quiz-screen" id="cvc-quiz">
      <div class="top-bar">
        <button class="back-btn" id="cvc-quiz-back">${window.isJourneyMode ? '✕' : '🏠'}</button>
        <div class="top-bar-title">Word Quiz</div>
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

  document.getElementById('cvc-quiz-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis.cancel();
    if (window.isJourneyMode) exitJourney(navigate);
    else navigate('cvc-home');
  });

  setTimeout(() => {
    speakInstruction('quiz_entry');
    setTimeout(() => showQuestion(), 2500);
  }, 800);
}

function generateQuestions(count) {
  const allWords = getAllWords();
  const shuffled = allWords.sort(() => Math.random() - 0.5);
  const qs = [];

  for (let i = 0; i < count; i++) {
    const correct = shuffled[i % allWords.length];
    // Ensure unique emojis in choices to avoid confusion
    const usedEmojis = new Set([correct.emoji]);
    const wrongs = allWords
      .filter(w => w.word !== correct.word && !usedEmojis.has(w.emoji))
      .sort(() => Math.random() - 0.5)
      .filter(w => { if (usedEmojis.has(w.emoji)) return false; usedEmojis.add(w.emoji); return true; })
      .slice(0, 3);
    const choices = [...wrongs, correct].sort(() => Math.random() - 0.5);
    qs.push({ correct, choices });
  }
  return qs;
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
  progress.style.width = `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%`;

  content.innerHTML = `
    <div class="quiz-question" id="quiz-q">
      <button class="quiz-sound-btn" id="quiz-play-sound">🔊</button>
      <div class="quiz-choices" id="quiz-choices">
        ${q.choices.map(c => `
          <button class="quiz-choice-btn" data-word="${c.word}" style="--choice-color: ${c.familyColor}">
            <span class="quiz-choice-emoji">${c.emoji}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-feedback" id="quiz-feedback"></div>
    </div>
  `;

  // Auto-speak the word
  setTimeout(() => speakWord(q.correct.word), 1000);

  document.getElementById('quiz-play-sound').addEventListener('click', () => {
    speakWord(q.correct.word);
  });

  document.getElementById('quiz-choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.quiz-choice-btn');
    if (!btn || answered) return;
    handleAnswer(btn.dataset.word);
  });
}

function handleAnswer(selectedWord) {
  answered = true;
  const q = questions[questionIndex];
  const isCorrect = selectedWord === q.correct.word;
  const feedback = document.getElementById('quiz-feedback');
  const buttons = document.querySelectorAll('.quiz-choice-btn');

  recordCvcQuizAnswer(isCorrect);
  
  if (wrongGuesses === 0) {
      recordCvcAccuracy(q.correct.word, isCorrect);
  }

  if (isCorrect) {
    buttons.forEach(btn => {
      if (btn.dataset.word === q.correct.word) {
        btn.classList.add('correct');
        btn.classList.remove('hint-glow');
      }
      btn.style.pointerEvents = 'none';
    });

    score++;
    addCvcStars(3);
    playCorrectSound();
    feedback.innerHTML = '🎉';
    feedback.className = 'quiz-feedback correct-feedback';
    document.getElementById('quiz-score').textContent = `⭐ ${score}`;
    speakInstruction('quiz_correct');
  } else {
    wrongGuesses++;

    // Mark wrong and disable briefly
    const selectedBtn = Array.from(buttons).find(b => b.dataset.word === selectedWord);
    if (selectedBtn) {
      selectedBtn.classList.add('wrong');
      selectedBtn.style.pointerEvents = 'none';
      setTimeout(() => { 
        selectedBtn.classList.remove('wrong');
        selectedBtn.style.pointerEvents = 'auto'; 
      }, 1000);
    }

    playWrongSound();
    feedback.innerHTML = `${q.correct.emoji}`;
    feedback.className = 'quiz-feedback wrong-feedback';
    
    // Constructive Feedback
    if (wrongGuesses >= 2) {
      const correctBtn = Array.from(buttons).find(b => b.dataset.word === q.correct.word);
      if (correctBtn) correctBtn.classList.add('hint-glow');
      setTimeout(() => {
        speak(`Look for ${q.correct.emoji}! That is ${q.correct.word}!`, { rate: 0.85, pitch: 1.1 });
      }, 500);
      answered = false;
    } else {
      setTimeout(() => {
        speak(`It's ${q.correct.word}! ${q.correct.word}!`, { rate: 0.85, pitch: 1.1 });
      }, 500);
      answered = false;
    }
    return;
  }

  setTimeout(() => { questionIndex++; showQuestion(); }, 3000);
}



function showResults() {
  const content = document.getElementById('quiz-content');
  const progress = document.getElementById('quiz-progress');
  progress.style.width = '100%';

  const percent = Math.round((score / TOTAL_QUESTIONS) * 100);
  let emoji = '';
  if (percent >= 80) emoji = '🏆';
  else if (percent >= 60) emoji = '🌟';
  else if (percent >= 40) emoji = '👍';
  else emoji = '💪';

  playCelebrationSound();
  spawnConfetti();

  content.innerHTML = `
    <div class="quiz-results">
      <div class="quiz-results-emoji">${emoji}</div>
      <div class="quiz-results-stars">
        ${'⭐'.repeat(Math.min(score, 10))}
      </div>
      <div class="quiz-results-actions">
        <button class="quiz-retry-btn" id="cvc-quiz-retry">🔄</button>
      </div>
    </div>
  `;

  if (percent >= 60) {
    speakInstruction('quiz_results_great');
  } else {
    speakInstruction('quiz_results_good');
  }

  document.getElementById('cvc-quiz-retry').addEventListener('click', () => {
    playCelebrationSound();
    if (window.isJourneyMode) {
        advanceJourney(localNavigate);
    } else {
        questionIndex = 0;
        score = 0;
        questions = generateQuestions(10);
        document.getElementById('quiz-score').textContent = '⭐ 0';
        speakInstruction('cvc_quiz_prompt');
        setTimeout(() => showQuestion(), 1500);
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

    .quiz-sound-btn {
      width: 120px; height: 120px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple));
      box-shadow: var(--shadow-xl); font-size: 3.5rem; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      animation: pulse 2s ease-in-out infinite; margin-bottom: var(--space-xl);
      transition: transform var(--transition-bounce);
    }
    .quiz-sound-btn:active { transform: scale(0.9); }

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
    .quiz-choice-emoji { font-size: 3.5rem; }

    .quiz-feedback { margin-top: var(--space-lg); font-size: 3rem; min-height: 60px; }
    .correct-feedback { animation: pop 300ms ease; }

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
