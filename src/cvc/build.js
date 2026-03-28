/**
 * Build Screen — CVC Words Adventure
 * Core interaction: Voice says word + shows emoji → child taps 3 letters in order.
 * Letter bank with correct letters + distractors. 5 words per round.
 */
import { getAllWords, ALL_CONSONANTS } from './data.js';
import { speakWord, speakBlendCVC, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction, playSnapSound, speak } from '../shared/audio.js';
import { markWordBuilt, addCvcStars, recordCvcAccuracy } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';
import { advanceJourney, exitJourney } from '../shared/journey.js';

let currentRound = [];
let roundIndex = 0;
let selectedLetters = [];
let answered = false;
let wrongGuesses = 0;
const WORDS_PER_ROUND = 5;
let localNavigate = null;
let wordsBase = []; // Declare wordsBase globally

export function renderBuild(app, navigate, props = {}) {
  localNavigate = navigate;
  wordsBase = getAllWords().sort(() => Math.random() - 0.5); // Initialize wordsBase here
  roundIndex = 0;
  selectedLetters = [];
  answered = false;
  currentRound = generateRound();

  app.innerHTML = `
    <div class="screen build-screen" id="build">
      <div class="top-bar">
        <button class="back-btn" id="build-back">${window.isJourneyMode ? '✕' : '🏠'}</button>
        <div class="top-bar-title">Spell Words</div>
        <div class="top-bar-right">
          <div class="build-score" id="build-score">⭐ 0</div>
        </div>
      </div>
      <div class="build-progress-bar">
        <div class="build-progress-fill" id="build-progress" style="width: 0%"></div>
      </div>
      <div class="build-content" id="build-content"></div>
    </div>
  `;

  document.getElementById('build-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis.cancel();
    if (window.isJourneyMode) exitJourney(navigate);
    else navigate('cvc-home');
  });

  setTimeout(() => {
    speakInstruction('build_entry');
    setTimeout(() => showBuildWord(), 2500);
  }, 800);
}

function generateRound() {
  // Use wordsBase if it's initialized, otherwise fall back to getAllWords()
  const allWords = wordsBase.length > 0 ? wordsBase : getAllWords().sort(() => Math.random() - 0.5);
  return allWords.slice(0, WORDS_PER_ROUND);
}

function showBuildWord() {
  if (roundIndex >= currentRound.length) {
    showBuildResults();
    return;
  }
  answered = false;
  wrongGuesses = 0;
  selectedLetters = [];
  const word = currentRound[roundIndex];
  const content = document.getElementById('build-content');
  const progress = document.getElementById('build-progress');
  progress.style.width = `${(roundIndex / WORDS_PER_ROUND) * 100}%`;

  // Generate letter bank: correct letters + distractors
  const correctLetters = word.word.split('');
  const distractors = generateDistractors(correctLetters, 5);
  const bank = [...correctLetters, ...distractors].sort(() => Math.random() - 0.5);

  content.innerHTML = `
    <div class="build-question" id="build-q">
      <div class="build-emoji-display">${word.emoji}</div>
      <button class="build-hear-btn" id="build-hear">🔊</button>
      <div class="build-slots" id="build-slots">
        ${correctLetters.map((_, i) => `
          <div class="build-slot" data-index="${i}" id="slot-${i}"></div>
        `).join('')}
      </div>
      <div class="build-bank" id="build-bank">
        ${bank.map((letter, i) => `
          <button class="build-letter-btn" data-letter="${letter}" data-bank-index="${i}" id="bank-${i}"
            style="animation-delay: ${i * 40}ms">
            ${letter}
          </button>
        `).join('')}
      </div>
      <div class="build-feedback" id="build-feedback"></div>
    </div>
  `;

  // Voice prompt
  setTimeout(async () => {
    await speakWord(word.word);
    await new Promise(r => setTimeout(r, 400));
    speakInstruction('build_prompt');
  }, 800);

  // Hear again button
  document.getElementById('build-hear').addEventListener('click', () => {
    speakWord(word.word);
  });

  // Letter bank event delegation
  document.getElementById('build-bank').addEventListener('click', (e) => {
    const btn = e.target.closest('.build-letter-btn');
    if (!btn || answered || btn.classList.contains('used')) return;
    handleLetterTap(btn, word);
  });
}

function handleLetterTap(btn, word) {
  const letter = btn.dataset.letter;
  const targetIndex = selectedLetters.length;
  const correctLetter = word.word[targetIndex];

  if (letter === correctLetter) {
    if (wrongGuesses === 0) {
        recordCvcAccuracy(word.word, true); // Partial or full correct hit
    }
    
    // Correct letter
    playSnapSound();
    selectedLetters.push(letter);
    btn.classList.add('used');
    btn.classList.remove('hint-glow');

    const slot = document.getElementById(`slot-${targetIndex}`);
    slot.textContent = letter;
    slot.classList.add('filled');
    slot.style.color = word.familyColor;

    // Check if complete
    if (selectedLetters.length === word.word.length) {
      answered = true;
      markWordBuilt(word.word);
      addCvcStars(3);

      const scoreEl = document.getElementById('build-score');
      scoreEl.textContent = `⭐ ${(roundIndex + 1) * 3}`;

      setTimeout(async () => {
        playCorrectSound();
        const feedback = document.getElementById('build-feedback');
        feedback.innerHTML = '🎉';
        feedback.className = 'build-feedback correct-feedback';
        await speakBlendCVC(word.word);
        await speakInstruction('build_correct');

        setTimeout(() => {
          roundIndex++;
          if (window.isJourneyMode || roundIndex >= WORDS_PER_ROUND) { // Journey limits to 1 word, free play gets 5
            showBuildResults();
          } else {
            showBuildWord();
          }
        }, 3000);
      }, 300);
    }
  } else {
    // Wrong letter
    if (wrongGuesses === 0) {
       recordCvcAccuracy(word.word, false);
    }
    wrongGuesses++;
    playWrongSound();
    btn.classList.add('wrong');
    btn.style.animation = 'shake 400ms ease';
    setTimeout(() => {
      btn.classList.remove('wrong');
      btn.style.animation = '';
    }, 400);

    // Constructive Feedback
    if (wrongGuesses >= 2) {
      const correctBtn = Array.from(document.querySelectorAll('.build-letter-btn:not(.used)')).find(b => b.dataset.letter === correctLetter);
      if (correctBtn) correctBtn.classList.add('hint-glow');
      speakInstruction('build_wrong');
    } else {
      speakInstruction('build_wrong');
    }
  }
}

function generateDistractors(correctLetters, count) {
  const used = new Set(correctLetters);
  const available = ALL_CONSONANTS.filter(c => !used.has(c));
  // Also add some vowels as distractors
  const vowels = ['a', 'e', 'i', 'o', 'u'].filter(v => !used.has(v));
  const pool = [...available, ...vowels].sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
}



function showBuildResults() {
  const content = document.getElementById('build-content');
  const progress = document.getElementById('build-progress');
  progress.style.width = '100%';

  playCelebrationSound();
  spawnConfetti();

  content.innerHTML = `
    <div class="build-results">
      <div class="build-results-emoji">🏆</div>
      <div class="build-results-stars">
        ${'⭐'.repeat(Math.min(WORDS_PER_ROUND, 10))}
      </div>
      <div class="build-results-actions">
        <button class="build-retry-btn" id="build-retry">🔄</button>
      </div>
    </div>
  `;

  speakInstruction('quiz_results_great');

  document.getElementById('build-retry').addEventListener('click', () => {
    playPopSound();
    roundIndex = 0;
    selectedLetters = [];
    currentRound = generateRound();
    document.getElementById('build-score').textContent = '⭐ 0';
    speakInstruction('build_entry');
    setTimeout(() => showBuildWord(), 2500);
  });
}

export function injectBuildStyles() {
  if (document.getElementById('build-styles')) return;
  const style = document.createElement('style');
  style.id = 'build-styles';
  style.textContent = `
    .build-screen { background: var(--color-bg); }
    .build-progress-bar { height: 8px; background: rgba(0,0,0,0.06); margin: 0 var(--space-lg); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
    .build-progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-accent-purple), var(--color-accent-pink)); border-radius: 4px; transition: width 400ms ease; }
    .build-score { font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); color: var(--color-accent-yellow); }

    .build-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .build-question { text-align: center; width: 100%; max-width: 500px; animation: pop var(--transition-slow) forwards; }

    .build-emoji-display {
      font-size: 80px;
      margin-bottom: var(--space-sm);
      animation: float 3s ease-in-out infinite;
    }
    .build-hear-btn {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple));
      box-shadow: var(--shadow-md); font-size: 1.5rem; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-md); transition: transform var(--transition-bounce);
    }
    .build-hear-btn:active { transform: scale(0.9); }

    /* Letter slots */
    .build-slots {
      display: flex;
      justify-content: center;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .build-slot {
      width: 80px;
      height: 90px;
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      box-shadow: var(--shadow-md);
      border: 4px dashed rgba(0,0,0,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: var(--text-4xl);
      font-weight: 900;
      transition: all 0.3s ease;
    }
    .build-slot.filled {
      border-style: solid;
      border-color: currentColor;
      animation: flyToSlot 300ms ease;
      background: #FAFAFA;
    }

    /* Letter bank */
    .build-bank {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-md);
      max-width: 400px;
      margin: 0 auto;
    }
    .build-letter-btn {
      width: 70px;
      height: 70px;
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      box-shadow: var(--shadow-md);
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 800;
      color: var(--color-text);
      transition: transform var(--transition-bounce), box-shadow var(--transition-base), opacity 0.3s;
      animation: pop var(--transition-slow) backwards;
      cursor: pointer;
      border: 3px solid transparent;
    }
    .build-letter-btn:active { transform: scale(0.9); }
    .build-letter-btn.used {
      opacity: 0.25;
      pointer-events: none;
      transform: scale(0.8);
    }
    .build-letter-btn.wrong {
      border-color: var(--color-primary);
      background: #FFEBEE;
    }
    .build-letter-btn.hint-glow { box-shadow: 0 0 20px 10px rgba(76, 175, 80, 0.4); border-color: var(--color-accent-green); animation: pulse 1.5s infinite; transition: all 0.3s; }

    /* Feedback */
    .build-feedback { margin-top: var(--space-lg); font-size: 3rem; min-height: 60px; }
    .correct-feedback { animation: pop 300ms ease; }

    /* Results */
    .build-results { text-align: center; animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .build-results-emoji { font-size: 100px; margin-bottom: var(--space-lg); animation: bounce 1.5s ease-in-out infinite; }
    .build-results-stars { font-size: 2rem; letter-spacing: 4px; margin-bottom: var(--space-xl); }
    .build-retry-btn {
      width: 90px; height: 90px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent-purple), #8B5CF6);
      box-shadow: var(--shadow-lg); font-size: 2.5rem; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      animation: pulse 2s ease-in-out infinite;
      transition: transform var(--transition-bounce);
    }
    .build-retry-btn:active { transform: scale(0.9); }

    @media (max-aspect-ratio: 1/1) {
      .build-slot { width: 65px; height: 75px; }
      .build-letter-btn { width: 60px; height: 60px; font-size: var(--text-xl); }
      .build-emoji-display { font-size: 60px; }
    }
  `;
  document.head.appendChild(style);
}
