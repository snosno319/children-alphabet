/**
 * Rhyme Time — Rhyme Match
 * Identify which picture rhymes with the target word.
 */
import { getWordsFromFamily, getDistractorWords, RHYME_FAMILIES } from './data.js';
import { speakWord, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction } from '../shared/audio.js';
import { recordRhymeMatch, addRhymeStars } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';

let currentRound = 0;
let score = 0;
const TOTAL_ROUNDS = 8;

export function renderRhymeMatch(app, navigate) {
  currentRound = 0;
  score = 0;
  nextRound(app, navigate);
}

function nextRound(app, navigate) {
  if (currentRound >= TOTAL_ROUNDS) {
    showCelebration(app, navigate);
    return;
  }

  // Pick a family and a target word
  const family = RHYME_FAMILIES[Math.floor(Math.random() * RHYME_FAMILIES.length)];
  const shuffledFamily = [...family.words].sort(() => Math.random() - 0.5);
  const targetWord = shuffledFamily[0];
  const correctMatch = shuffledFamily[1];

  // Pick distractors from other families
  const distractors = getDistractorWords(family.pattern, 3);

  const options = [correctMatch, ...distractors].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="screen rhyme-match-screen" id="rhyme-match">
      <div class="top-bar">
        <button class="back-btn" id="rm-back">🏠</button>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${(currentRound / TOTAL_ROUNDS) * 100}%"></div>
        </div>
      </div>

      <div class="rm-content">
        <div class="rm-header">Find the rhyme!</div>
        
        <div class="rm-target-card">
          <div class="rm-emoji">${targetWord.emoji}</div>
          <div class="rm-word">${targetWord.word}</div>
          <button class="rm-hear-btn" id="rm-hear">🔊</button>
        </div>

        <div class="rm-options">
          ${options.map((opt, i) => `
            <button class="rm-option-btn" data-word="${opt.word}" data-correct="${opt.word === correctMatch.word}" style="animation-delay: ${i * 100}ms">
              <div class="rm-opt-emoji">${opt.emoji}</div>
              <div class="rm-opt-label">${opt.word}</div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => speakWord(targetWord.word), 600);

  // Handlers
  document.getElementById('rm-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis.cancel();
    navigate('home');
  });

  document.getElementById('rm-hear').addEventListener('click', () => {
    speakWord(targetWord.word);
  });

  document.querySelectorAll('.rm-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const word = btn.dataset.word;
      const isCorrect = btn.dataset.correct === 'true';

      if (isCorrect) {
        playCorrectSound();
        speakWord(word);
        btn.classList.add('correct');
        recordRhymeMatch(true);
        score++;

        setTimeout(() => {
          currentRound++;
          nextRound(app, navigate);
        }, 1200);
      } else {
        playWrongSound();
        speakWord(word);
        btn.classList.add('wrong');
        btn.disabled = true;
        recordRhymeMatch(false);
      }
    });
  });
}

function showCelebration(app, navigate) {
  playCelebrationSound();
  spawnConfetti();
  addRhymeStars(4);

  app.innerHTML = `
    <div class="screen celebration-screen">
      <div class="celebration-content">
        <div class="celebration-emoji">${score >= TOTAL_ROUNDS * 0.8 ? '🏆' : score >= TOTAL_ROUNDS * 0.6 ? '🌟' : '👍'}</div>
        <div class="celebration-stars">${'⭐'.repeat(Math.min(score, 8))}</div>
        <div class="celebration-btns">
          <button class="celebration-icon-btn" id="rm-restart">🔄</button>
          <button class="celebration-icon-btn" id="rm-home">🏠</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('rm-restart').addEventListener('click', () => {
    playPopSound();
    renderRhymeMatch(app, navigate);
  });

  document.getElementById('rm-home').addEventListener('click', () => {
    playPopSound();
    navigate('home');
  });
}

export function injectRhymeMatchStyles() {
  if (document.getElementById('rm-styles')) return;
  const style = document.createElement('style');
  style.id = 'rm-styles';
  style.textContent = `
    .rhyme-match-screen { background: var(--color-bg); }
    .rm-content { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-lg); padding-bottom: var(--space-xl); }
    .rm-header { font-family: var(--font-display); font-size: 1.5rem; color: #880E4F; font-weight: 700; margin-top: -10px; }
    
    .rm-target-card {
      background: #FFFFFF; padding: var(--space-lg) var(--space-2xl); border-radius: 32px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1); display: flex; flex-direction: column;
      align-items: center; gap: var(--space-sm); position: relative;
    }
    .rm-emoji { font-size: 4rem; }
    .rm-word { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: #333; }
    .rm-hear-btn {
      position: absolute; top: -10px; right: -10px;
      width: 44px; height: 44px; border-radius: 50%;
      background: #EC407A; color: white; border: none; font-size: 1.2rem; cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    
    .rm-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg); width: 100%; max-width: 400px; padding: 0 var(--space-lg); }
    
    .rm-option-btn {
      background: white; border-radius: 24px; padding: var(--space-md);
      box-shadow: 0 6px 16px rgba(0,0,0,0.08); border: 2px solid transparent;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      cursor: pointer; transition: transform 0.2s;
    }
    .rm-option-btn:active { transform: scale(0.95); }
    .rm-opt-emoji { font-size: 3rem; }
    .rm-opt-label { font-family: var(--font-display); font-weight: 700; color: #555; }
    
    .rm-option-btn.correct { border-color: #66BB6A; background: #E8F5E9; box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2); }
    .rm-option-btn.wrong { opacity: 0.5; background: #FFEBEE; }
    
    @media (max-aspect-ratio: 1/1) {
      .rm-options { gap: var(--space-md); }
      .rm-opt-emoji { font-size: 2.5rem; }
    }
  `;
  document.head.appendChild(style);
}
