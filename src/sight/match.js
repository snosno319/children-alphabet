/**
 * Match Screen — Sight Words Star
 * Voice speaks a word → child picks from 4 written word buttons.
 * 8 rounds per session. Progressive difficulty.
 */
import { SIGHT_WORDS } from './data.js';
import { speakWord, playCorrectSound, playWrongSound, playCelebrationSound, playPopSound, speakInstruction, speak } from '../shared/audio.js';
import { recordMatchAnswer, addSightStars } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';
import { floatStars } from '../shared/feedback.js';

let questionIndex = 0;
let score = 0;
let questions = [];
let answered = false;
const TOTAL_QUESTIONS = 8;

export function renderMatch(app, navigate) {
  questionIndex = 0;
  score = 0;
  answered = false;
  questions = generateQuestions(TOTAL_QUESTIONS);

  app.innerHTML = `
    <div class="screen match-screen" id="match">
      <div class="top-bar">
        <button class="back-btn" id="match-back">🏠</button>
        <div class="top-bar-right">
          <span class="match-score" id="match-score">⭐ 0</span>
        </div>
      </div>
      <div class="match-progress-bar">
        <div class="match-progress-fill" id="match-progress" style="width: 0%"></div>
      </div>
      <div class="match-content" id="match-content"></div>
    </div>
  `;

  document.getElementById('match-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    navigate('sight-home');
  });

  setTimeout(() => {
    speakInstruction('match_entry');
    setTimeout(() => showQuestion(), 2500);
  }, 800);
}

function generateQuestions(count) {
  const shuffled = [...SIGHT_WORDS].sort(() => Math.random() - 0.5);
  const qs = [];
  for (let i = 0; i < count; i++) {
    const correct = shuffled[i % shuffled.length];
    const wrongs = SIGHT_WORDS
      .filter(w => w.word !== correct.word)
      .sort(() => Math.random() - 0.5)
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
  const q = questions[questionIndex];
  const content = document.getElementById('match-content');
  const progress = document.getElementById('match-progress');
  progress.style.width = `${(questionIndex / TOTAL_QUESTIONS) * 100}%`;

  content.innerHTML = `
    <div class="match-question" id="match-q">
      <button class="match-sound-btn" id="match-play-sound">🔊</button>
      <div class="match-emoji-hint">${q.correct.emoji}</div>
      <div class="match-choices" id="match-choices">
        ${q.choices.map(c => `
          <button class="match-word-btn" data-word="${c.word}" style="--btn-color: ${c.color}">
            ${c.word}
          </button>
        `).join('')}
      </div>
      <div class="match-feedback" id="match-feedback"></div>
    </div>
  `;

  setTimeout(() => speakWord(q.correct.word), 1000);

  document.getElementById('match-play-sound').addEventListener('click', () => {
    speakWord(q.correct.word);
  });

  document.getElementById('match-choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.match-word-btn');
    if (!btn || answered) return;
    handleAnswer(btn.dataset.word);
  });
}

function handleAnswer(selectedWord) {
  answered = true;
  const q = questions[questionIndex];
  const isCorrect = selectedWord === q.correct.word;
  const feedback = document.getElementById('match-feedback');
  const buttons = document.querySelectorAll('.match-word-btn');

  recordMatchAnswer(isCorrect);

  buttons.forEach(btn => {
    if (btn.dataset.word === q.correct.word) {
      btn.classList.add('correct');
    } else if (btn.dataset.word === selectedWord && !isCorrect) {
      btn.classList.add('wrong');
    }
    btn.style.pointerEvents = 'none';
  });

  if (isCorrect) {
    score++;
    addSightStars(3);
    playCorrectSound();
    feedback.innerHTML = '🎉';
    feedback.className = 'match-feedback correct-feedback';
    document.getElementById('match-score').textContent = `⭐ ${score * 3}`;
    speakInstruction('correct');
    const correctBtn = Array.from(buttons).find(b => b.dataset.word === q.correct.word);
    floatStars(correctBtn, 3);
  } else {
    playWrongSound();
    feedback.innerHTML = `${q.correct.emoji}`;
    feedback.className = 'match-feedback wrong-feedback';
    setTimeout(() => {
      speak(`The word is ${q.correct.word}. ${q.correct.sentence}`, { rate: 0.7, pitch: 1.1 });
    }, 500);
  }

  setTimeout(() => { questionIndex++; showQuestion(); }, isCorrect ? 3000 : 5000);
}

function showResults() {
  const content = document.getElementById('match-content');
  const progress = document.getElementById('match-progress');
  progress.style.width = '100%';

  const percent = Math.round((score / TOTAL_QUESTIONS) * 100);
  let emoji = percent >= 80 ? '🏆' : percent >= 60 ? '🌟' : percent >= 40 ? '👍' : '💪';

  playCelebrationSound();
  spawnConfetti();

  content.innerHTML = `
    <div class="match-results">
      <div class="match-results-emoji">${emoji}</div>
      <div class="match-results-stars">${'⭐'.repeat(Math.min(score, 10))}</div>
      <button class="match-retry-btn" id="match-retry">🔄</button>
    </div>
  `;

  speakInstruction(percent >= 60 ? 'results_great' : 'results_good');

  document.getElementById('match-retry').addEventListener('click', () => {
    playPopSound();
    questionIndex = 0;
    score = 0;
    questions = generateQuestions(TOTAL_QUESTIONS);
    document.getElementById('match-score').textContent = '⭐ 0';
    speakInstruction('match_entry');
    setTimeout(() => showQuestion(), 2500);
  });
}

export function injectMatchStyles() {
  if (document.getElementById('match-styles')) return;
  const style = document.createElement('style');
  style.id = 'match-styles';
  style.textContent = `
    .match-screen { background: var(--color-bg); }
    .match-progress-bar { height: 8px; background: rgba(0,0,0,0.06); margin: 0 var(--space-lg); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
    .match-progress-fill { height: 100%; background: linear-gradient(90deg, #7C4DFF, #B388FF); border-radius: 4px; transition: width 400ms ease; }
    .match-score { font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); color: #FFB300; }
    .match-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .match-question { text-align: center; width: 100%; max-width: 500px; animation: pop var(--transition-slow) forwards; }

    .match-sound-btn {
      width: 100px; height: 100px; border-radius: 50%;
      background: linear-gradient(135deg, #7C4DFF, #651FFF);
      box-shadow: var(--shadow-xl); font-size: 3rem; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      animation: pulse 2s ease-in-out infinite; margin-bottom: var(--space-md);
      transition: transform var(--transition-bounce);
    }
    .match-sound-btn:active { transform: scale(0.9); }
    .match-emoji-hint { font-size: 3rem; margin-bottom: var(--space-lg); }

    .match-choices { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); max-width: 400px; margin: 0 auto; }
    .match-word-btn {
      padding: var(--space-lg);
      border-radius: var(--radius-xl);
      background: var(--color-surface); box-shadow: var(--shadow-md);
      font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800;
      color: var(--btn-color);
      transition: transform var(--transition-bounce);
      border: 4px solid transparent; min-height: 80px;
      display: flex; align-items: center; justify-content: center;
    }
    .match-word-btn:active { transform: scale(0.92); }
    .match-word-btn.correct { border-color: var(--color-accent-green); background: #E8F5E9; animation: pop 300ms ease; }
    .match-word-btn.wrong { border-color: #FF6B6B; background: #FFEBEE; animation: shake 400ms ease; }

    .match-feedback { margin-top: var(--space-lg); font-size: 3rem; min-height: 60px; }
    .correct-feedback { animation: pop 300ms ease; }

    .match-results { text-align: center; animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .match-results-emoji { font-size: 100px; margin-bottom: var(--space-lg); animation: bounce 1.5s ease-in-out infinite; }
    .match-results-stars { font-size: 2rem; letter-spacing: 4px; margin-bottom: var(--space-xl); }
    .match-retry-btn {
      width: 90px; height: 90px; border-radius: 50%;
      background: linear-gradient(135deg, #7C4DFF, #651FFF);
      box-shadow: var(--shadow-lg); font-size: 2.5rem; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      animation: pulse 2s ease-in-out infinite;
    }
    .match-retry-btn:active { transform: scale(0.9); }
  `;
  document.head.appendChild(style);
}
