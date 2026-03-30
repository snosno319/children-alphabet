/**
 * Picture Match Screen — Word Builder Lab
 * Show 4 pictures, voice says a word → child picks the picture. 8 rounds.
 */
import { getRandomWords, getAllWords } from './data.js';
import { speakWord, playCorrectSound, playWrongSound, playCelebrationSound, playPopSound, speakInstruction, speak } from '../shared/audio.js';
import { markWordMatched, addWordBuilderStars, recordWordBuilderAccuracy } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';

let questionIndex = 0;
let score = 0;
let questions = [];
let answered = false;
let wrongGuesses = 0;
const TOTAL = 8;

export function renderPicMatch(app, navigate) {
  questionIndex = 0; score = 0; answered = false;
  questions = generateQuestions(TOTAL);

  app.innerHTML = `
    <div class="screen picmatch-screen" id="picmatch">
      <div class="top-bar">
        <button class="back-btn" id="pm-back">🏠</button>
        <div class="top-bar-right"><span class="pm-score" id="pm-score">⭐ 0</span></div>
      </div>
      <div class="pm-progress-bar"><div class="pm-progress-fill" id="pm-progress" style="width:0%"></div></div>
      <div class="pm-content" id="pm-content"></div>
    </div>
  `;

  document.getElementById('pm-back').addEventListener('click', () => { playPopSound(); window.speechSynthesis?.cancel(); navigate('wordBuilder-home'); });
  setTimeout(() => { speakInstruction('picmatch_entry'); setTimeout(() => showPMQuestion(), 2500); }, 800);
}

function generateQuestions(count) {
  const all = getAllWords();
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(correct => {
    const usedEmojis = new Set([correct.emoji]);
    const wrongs = all.filter(w => w.word !== correct.word && !usedEmojis.has(w.emoji))
      .sort(() => Math.random() - 0.5)
      .filter(w => { if (usedEmojis.has(w.emoji)) return false; usedEmojis.add(w.emoji); return true; })
      .slice(0, 3);
    return { correct, choices: [...wrongs, correct].sort(() => Math.random() - 0.5) };
  });
}

function showPMQuestion() {
  if (questionIndex >= questions.length) { showPMResults(); return; }
  answered = false;
  wrongGuesses = 0;
  const q = questions[questionIndex];
  const content = document.getElementById('pm-content');
  document.getElementById('pm-progress').style.width = `${(questionIndex / TOTAL) * 100}%`;

  content.innerHTML = `
    <div class="pm-question">
      <button class="pm-sound-btn" id="pm-sound">🔊</button>
      <div class="pm-choices" id="pm-choices">
        ${q.choices.map(c => `
          <button class="pm-choice" data-word="${c.word}" style="--c-color: ${c.categoryColor}">
            <span class="pm-choice-emoji">${c.emoji}</span>
          </button>
        `).join('')}
      </div>
      <div class="pm-feedback" id="pm-feedback"></div>
    </div>
  `;

  setTimeout(() => speakWord(q.correct.word), 1000);
  document.getElementById('pm-sound').addEventListener('click', () => speakWord(q.correct.word));
  document.getElementById('pm-choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.pm-choice');
    if (!btn || answered) return;
    handlePMAnswer(btn.dataset.word);
  });
}

function handlePMAnswer(word) {
  answered = true;
  const q = questions[questionIndex];
  const isCorrect = word === q.correct.word;
  const buttons = document.querySelectorAll('.pm-choice');
  const feedback = document.getElementById('pm-feedback');

  if (wrongGuesses === 0) {
      recordWordBuilderAccuracy(q.correct.word, isCorrect);
  }

  if (isCorrect) {
    buttons.forEach(btn => {
      if (btn.dataset.word === q.correct.word) {
        btn.classList.add('correct');
        btn.classList.remove('hint-glow');
      }
      btn.style.pointerEvents = 'none';
    });
    
    score++; addWordBuilderStars(3); markWordMatched(q.correct.word);
    playCorrectSound();
    feedback.innerHTML = '🎉';
    feedback.className = 'pm-feedback correct-fb';
    document.getElementById('pm-score').textContent = `⭐ ${score * 3}`;
    speakInstruction('correct');
  } else {
    wrongGuesses++;

    const selectedBtn = Array.from(buttons).find(b => b.dataset.word === word);
    if (selectedBtn) {
      selectedBtn.classList.add('wrong');
      selectedBtn.style.pointerEvents = 'none';
      setTimeout(() => { 
        selectedBtn.classList.remove('wrong');
        selectedBtn.style.pointerEvents = 'auto'; 
      }, 1000);
    }

    playWrongSound();
    feedback.innerHTML = q.correct.emoji;
    feedback.className = 'pm-feedback wrong-fb';
    
    if (wrongGuesses >= 2) {
      const correctBtn = Array.from(buttons).find(b => b.dataset.word === q.correct.word);
      if (correctBtn) correctBtn.classList.add('hint-glow');
      setTimeout(() => speak(`Look for ${q.correct.emoji}!`, { rate: 0.85, pitch: 1.1 }), 500);
      answered = false;
    } else {
      setTimeout(() => speak(`It's ${q.correct.word}!`, { rate: 0.85, pitch: 1.1 }), 500);
      answered = false;
    }
    return;
  }
  setTimeout(() => { questionIndex++; showPMQuestion(); }, 3000);
}



function showPMResults() {
  const content = document.getElementById('pm-content');
  document.getElementById('pm-progress').style.width = '100%';
  const pct = Math.round((score / TOTAL) * 100);
  playCelebrationSound();
  spawnConfetti();
  content.innerHTML = `
    <div class="pm-results">
      <div class="pm-results-emoji">${pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪'}</div>
      <div class="pm-results-stars">${'⭐'.repeat(Math.min(score, 10))}</div>
      <button class="pm-retry-btn" id="pm-retry">🔄</button>
    </div>
  `;
  speakInstruction(pct >= 60 ? 'results_great' : 'results_good');
  document.getElementById('pm-retry').addEventListener('click', () => {
    playPopSound(); questionIndex = 0; score = 0;
    questions = generateQuestions(TOTAL);
    document.getElementById('pm-score').textContent = '⭐ 0';
    speakInstruction('picmatch_entry');
    setTimeout(() => showPMQuestion(), 2500);
  });
}

export function injectPicMatchStyles() {
  if (document.getElementById('picmatch-styles')) return;
  const style = document.createElement('style');
  style.id = 'picmatch-styles';
  style.textContent = `
    .picmatch-screen { background: var(--color-bg); }
    .pm-progress-bar { height: 8px; background: rgba(0,0,0,0.06); margin: 0 var(--space-lg); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
    .pm-progress-fill { height: 100%; background: linear-gradient(90deg, #7C4DFF, #B388FF); border-radius: 4px; transition: width 400ms ease; }
    .pm-score { font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); color: var(--color-accent-yellow); }
    .pm-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .pm-question { text-align: center; width: 100%; max-width: 500px; animation: pop var(--transition-slow) forwards; }

    .pm-sound-btn { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #7C4DFF, #651FFF); box-shadow: var(--shadow-xl); font-size: 3rem; display: inline-flex; align-items: center; justify-content: center; animation: pulse 2s ease-in-out infinite; margin-bottom: var(--space-xl); transition: transform var(--transition-bounce); }
    .pm-sound-btn:active { transform: scale(0.9); }

    .pm-choices { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg); max-width: 380px; margin: 0 auto; }
    .pm-choice { aspect-ratio: 1; border-radius: var(--radius-xl); background: var(--color-surface); box-shadow: var(--shadow-md); display: flex; align-items: center; justify-content: center; border: 4px solid transparent; transition: transform var(--transition-bounce); min-height: 90px; }
    .pm-choice:active { transform: scale(0.92); }
    .pm-choice.correct { border-color: var(--color-accent-green); background: #E8F5E9; animation: pop 300ms ease; }
    .pm-choice.wrong { border-color: #FF6B6B; background: #FFEBEE; animation: shake 400ms ease; }
    .pm-choice.hint-glow { box-shadow: 0 0 20px 10px rgba(76, 175, 80, 0.4); border-color: var(--color-accent-green); animation: pulse 1.5s infinite; transition: all 0.3s; }
    .pm-choice-emoji { font-size: 3.5rem; }

    .pm-feedback { margin-top: var(--space-lg); font-size: 3rem; min-height: 60px; }
    .correct-fb { animation: pop 300ms ease; }

    .pm-results { text-align: center; animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .pm-results-emoji { font-size: 100px; margin-bottom: var(--space-lg); animation: bounce 1.5s ease-in-out infinite; }
    .pm-results-stars { font-size: 2rem; letter-spacing: 4px; margin-bottom: var(--space-xl); }
    .pm-retry-btn { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #7C4DFF, #651FFF); box-shadow: var(--shadow-lg); font-size: 2.5rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; animation: pulse 2s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}
