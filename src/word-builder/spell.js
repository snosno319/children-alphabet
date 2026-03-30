/**
 * Spell Screen — Word Builder Lab
 * Hear word → tap letters in order from bank. 6 words per round.
 */
import { getRandomWords, ALL_LETTERS } from './data.js';
import { speakWord, speakSpellOut, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction, playSnapSound } from '../shared/audio.js';
import { markWordSpelled, addWordBuilderStars } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';

let currentRound = [];
let roundIndex = 0;
let selectedLetters = [];
let answered = false;
const WORDS_PER_ROUND = 6;

export function renderSpell(app, navigate) {
  roundIndex = 0; selectedLetters = []; answered = false;
  currentRound = getRandomWords(WORDS_PER_ROUND);

  app.innerHTML = `
    <div class="screen spell-screen" id="spell">
      <div class="top-bar">
        <button class="back-btn" id="spell-back">🏠</button>
        <div class="top-bar-right">
          <span class="spell-score" id="spell-score">⭐ 0</span>
        </div>
      </div>
      <div class="spell-progress-bar"><div class="spell-progress-fill" id="spell-progress" style="width:0%"></div></div>
      <div class="spell-content" id="spell-content"></div>
    </div>
  `;

  document.getElementById('spell-back').addEventListener('click', () => { playPopSound(); window.speechSynthesis?.cancel(); navigate('wordBuilder-home'); });
  setTimeout(() => { speakInstruction('spell_entry'); setTimeout(() => showSpellWord(), 2500); }, 800);
}

function showSpellWord() {
  if (roundIndex >= currentRound.length) { showSpellResults(); return; }
  answered = false; selectedLetters = [];
  const word = currentRound[roundIndex];
  const content = document.getElementById('spell-content');
  document.getElementById('spell-progress').style.width = `${(roundIndex / WORDS_PER_ROUND) * 100}%`;

  const correctLetters = word.word.split('');
  const distractors = generateDistractors(correctLetters, 5);
  const bank = [...correctLetters, ...distractors].sort(() => Math.random() - 0.5);

  content.innerHTML = `
    <div class="spell-question">
      <div class="spell-emoji">${word.emoji}</div>
      <button class="spell-hear-btn" id="spell-hear">🔊</button>
      <div class="spell-slots" id="spell-slots">
        ${correctLetters.map((_, i) => `<div class="spell-slot" id="slot-${i}"></div>`).join('')}
      </div>
      <div class="spell-bank" id="spell-bank">
        ${bank.map((letter, i) => `
          <button class="spell-letter-btn" data-letter="${letter}" id="bank-${i}" style="animation-delay:${i * 40}ms">${letter}</button>
        `).join('')}
      </div>
      <div class="spell-feedback" id="spell-feedback"></div>
    </div>
  `;

  setTimeout(() => speakWord(word.word), 800);

  document.getElementById('spell-hear').addEventListener('click', () => {
    speakWord(word.word);
  });

  document.getElementById('spell-bank').addEventListener('click', (e) => {
    const btn = e.target.closest('.spell-letter-btn');
    if (!btn || answered || btn.classList.contains('used')) return;
    handleLetterTap(btn, word);
  });
}

function handleLetterTap(btn, word) {
  const letter = btn.dataset.letter;
  const idx = selectedLetters.length;
  const correct = word.word[idx];

  if (letter === correct) {
    playSnapSound();
    selectedLetters.push(letter);
    btn.classList.add('used');
    const slot = document.getElementById(`slot-${idx}`);
    slot.textContent = letter;
    slot.classList.add('filled');
    slot.style.color = word.categoryColor;

    if (selectedLetters.length === word.word.length) {
      answered = true;
      markWordSpelled(word.word);
      addWordBuilderStars(3);
      document.getElementById('spell-score').textContent = `⭐ ${(roundIndex + 1) * 3}`;
      setTimeout(async () => {
        playCorrectSound();
        document.getElementById('spell-feedback').innerHTML = '🎉';
        document.getElementById('spell-feedback').className = 'spell-feedback correct-fb';
        await speakSpellOut(word.word);
        await speakInstruction('correct');
        setTimeout(() => { roundIndex++; showSpellWord(); }, 1500);
      }, 300);
    }
  } else {
    playWrongSound();
    btn.classList.add('wrong');
    btn.style.animation = 'shake 400ms ease';
    setTimeout(() => { btn.classList.remove('wrong'); btn.style.animation = ''; }, 400);
    speakInstruction('wrong');
  }
}

function generateDistractors(correctLetters, count) {
  const used = new Set(correctLetters);
  return ALL_LETTERS.filter(c => !used.has(c)).sort(() => Math.random() - 0.5).slice(0, count);
}



function showSpellResults() {
  const content = document.getElementById('spell-content');
  document.getElementById('spell-progress').style.width = '100%';
  playCelebrationSound();
  spawnConfetti();
  content.innerHTML = `
    <div class="spell-results">
      <div class="spell-results-emoji">🏆</div>
      <div class="spell-results-stars">${'⭐'.repeat(WORDS_PER_ROUND)}</div>
      <button class="spell-retry-btn" id="spell-retry">🔄</button>
    </div>
  `;
  speakInstruction('results_great');
  document.getElementById('spell-retry').addEventListener('click', () => {
    playPopSound(); roundIndex = 0; selectedLetters = [];
    currentRound = getRandomWords(WORDS_PER_ROUND);
    document.getElementById('spell-score').textContent = '⭐ 0';
    speakInstruction('spell_entry');
    setTimeout(() => showSpellWord(), 2500);
  });
}

export function injectSpellStyles() {
  if (document.getElementById('spell-styles')) return;
  const style = document.createElement('style');
  style.id = 'spell-styles';
  style.textContent = `
    .spell-screen { background: var(--color-bg); }
    .spell-progress-bar { height: 8px; background: rgba(0,0,0,0.06); margin: 0 var(--space-lg); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
    .spell-progress-fill { height: 100%; background: linear-gradient(90deg, #2E7D32, #66BB6A); border-radius: 4px; transition: width 400ms ease; }
    .spell-score { font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); color: var(--color-accent-yellow); }
    .spell-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .spell-question { text-align: center; width: 100%; max-width: 500px; animation: pop var(--transition-slow) forwards; }
    .spell-emoji { font-size: 80px; margin-bottom: var(--space-sm); animation: float 3s ease-in-out infinite; }
    .spell-hear-btn {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #2E7D32, #1B5E20);
      box-shadow: var(--shadow-md); font-size: 1.5rem; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-md); transition: transform var(--transition-bounce);
    }
    .spell-hear-btn:active { transform: scale(0.9); }

    .spell-slots { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-xl); }
    .spell-slot { width: 70px; height: 80px; border-radius: var(--radius-lg); background: var(--color-surface); box-shadow: var(--shadow-md); border: 4px dashed rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 900; transition: all 0.3s ease; }
    .spell-slot.filled { border-style: solid; border-color: currentColor; animation: pop 300ms ease; }

    .spell-bank { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-md); max-width: 420px; margin: 0 auto; }
    .spell-letter-btn { width: 64px; height: 64px; border-radius: var(--radius-lg); background: var(--color-surface); box-shadow: var(--shadow-md); font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--color-text); transition: transform var(--transition-bounce); animation: pop var(--transition-slow) backwards; cursor: pointer; border: 3px solid transparent; }
    .spell-letter-btn:active { transform: scale(0.9); }
    .spell-letter-btn.used { opacity: 0.25; pointer-events: none; transform: scale(0.8); }
    .spell-letter-btn.wrong { border-color: #FF6B6B; background: #FFEBEE; }

    .spell-feedback { margin-top: var(--space-lg); font-size: 3rem; min-height: 60px; }
    .correct-fb { animation: pop 300ms ease; }

    .spell-results { text-align: center; animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .spell-results-emoji { font-size: 100px; margin-bottom: var(--space-lg); animation: bounce 1.5s ease-in-out infinite; }
    .spell-results-stars { font-size: 2rem; letter-spacing: 4px; margin-bottom: var(--space-xl); }
    .spell-retry-btn { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #2E7D32, #1B5E20); box-shadow: var(--shadow-lg); font-size: 2.5rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; animation: pulse 2s ease-in-out infinite; }

    @media (max-aspect-ratio: 1/1) {
      .spell-slot { width: 55px; height: 65px; font-size: var(--text-2xl); }
      .spell-letter-btn { width: 55px; height: 55px; font-size: var(--text-xl); }
    }
  `;
  document.head.appendChild(style);
}
