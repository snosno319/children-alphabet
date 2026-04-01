/**
 * Phonics Lab — Ending Sound
 * Hear a word causing identifying the LAST sound.
 */
import { getWordsForSound, ALL_SOUNDS, SOUND_GROUPS } from './data.js';
import { speakWord, speakLetterFull, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction } from '../shared/audio.js';
import { recordEndSound, addPhonicsStars } from '../shared/storage.js';
import { checkAndAwardBadges } from '../shared/badges.js';
import { spawnConfetti } from '../shared/confetti.js';

let currentRound = 0;
let score = 0;
const TOTAL_ROUNDS = 8;
// Common endings for 4-year-olds
const EASY_ENDINGS = ['t', 'n', 'g', 'p', 's', 'r', 'l', 'd', 'k', 'm'];

export function renderEndSound(app, navigate) {
  currentRound = 0;
  score = 0;
  setTimeout(() => speakInstruction('phonics_entry'), 500); // "Let's listen to sounds!"
  nextRound(app, navigate);
}

function nextRound(app, navigate) {
  if (currentRound >= TOTAL_ROUNDS) {
    showCelebration(app, navigate);
    return;
  }

  // Pick something with a clear ending sound
  const ending = EASY_ENDINGS[Math.floor(Math.random() * EASY_ENDINGS.length)];
  // We need to find words in our data that end with this letter
  // Our data is organized by starting sound, so we search all words
  const allWords = getAllWordsEndingWith(ending);

  if (allWords.length === 0) {
    // Fallback retry
    currentRound++; // Skip this broken round
    nextRound(app, navigate);
    return;
  }

  const wordData = allWords[Math.floor(Math.random() * allWords.length)];

  const distractors = EASY_ENDINGS
    .filter(e => e !== ending)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [ending, ...distractors].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="screen end-sound-screen" id="end-sound">
      <div class="top-bar">
        <button class="back-btn" id="es-back">🏠</button>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${(currentRound / TOTAL_ROUNDS) * 100}%"></div>
        </div>
      </div>

      <div class="es-content">
        <div class="es-question">Ends with?</div>
        
        <div class="es-target-card">
          <div class="es-emoji">${wordData.emoji}</div>
          <button class="es-hear-btn" id="es-hear">🔊</button>
        </div>

        <div class="es-letters">
          ${options.map((letter, i) => `
            <button class="es-letter-btn" data-sound="${letter}" style="animation-delay: ${i * 100}ms">
              ${letter}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => speakWord(wordData.word), 600);

  // Handlers
  document.getElementById('es-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    navigate('phonics-home');
  });

  document.getElementById('es-hear').addEventListener('click', () => {
    speakWord(wordData.word);
  });

  document.querySelectorAll('.es-letter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.sound;

      if (selected === ending) {
        playCorrectSound();
        speakLetterFull(selected);
        btn.classList.add('correct');
        recordEndSound(true);
        score++;
        setTimeout(() => speakInstruction('correct'), 700);

        setTimeout(() => {
          currentRound++;
          nextRound(app, navigate);
        }, 1200);
      } else {
        playWrongSound();
        speakLetterFull(selected);
        btn.classList.add('wrong');
        btn.disabled = true;
        recordEndSound(false);
        setTimeout(() => speakInstruction('wrong'), 700);
      }
    });
  });
}

// Helper to find words

function getAllWordsEndingWith(char) {
  return SOUND_GROUPS.flatMap(g => g.words)
    .filter(w => w.word.endsWith(char));
}

function showCelebration(app, navigate) {
  playCelebrationSound();
  spawnConfetti();
  addPhonicsStars(4);
  checkAndAwardBadges(navigate);

  app.innerHTML = `
    <div class="screen celebration-screen">
      <div class="celebration-content">
        <div class="celebration-emoji">${score >= TOTAL_ROUNDS * 0.8 ? '🏆' : score >= TOTAL_ROUNDS * 0.6 ? '🌟' : '👍'}</div>
        <div class="celebration-stars">${'⭐'.repeat(Math.min(score, 8))}</div>
        <div class="celebration-btns">
          <button class="celebration-icon-btn" id="es-restart">🔄</button>
          <button class="celebration-icon-btn" id="es-home">🏠</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('es-restart').addEventListener('click', () => {
    playPopSound();
    renderEndSound(app, navigate);
  });

  document.getElementById('es-home').addEventListener('click', () => {
    playPopSound();
    navigate('phonics-home');
  });
}

export function injectEndSoundStyles() {
  // Re-use logic largely from sound-match styles but custom class names
  if (document.getElementById('es-styles')) return;
  const style = document.createElement('style');
  style.id = 'es-styles';
  style.textContent = `
    .end-sound-screen { background: var(--color-bg); }
    .es-content { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-xl); padding-bottom: var(--space-2xl); }
    .es-question { font-family: var(--font-display); font-size: 1.5rem; color: #666; font-weight: 700; }
    
    .es-target-card {
      background: #FFFFFF; padding: var(--space-xl); border-radius: 32px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.1); display: flex; flex-direction: column;
      align-items: center; gap: var(--space-md);
    }
    .es-emoji { font-size: 5rem; }
    
    .es-hear-btn {
      width: 50px; height: 50px; border-radius: 50%;
      background: #66BB6A; color: white; border: none; font-size: 1.4rem; cursor: pointer;
    }

    .es-letters { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg); }
    .es-letter-btn {
      width: 90px; height: 90px; border-radius: 20px;
      background: #FFFFFF; border: 3px solid #CFD8DC;
      font-family: var(--font-display); font-size: 3rem; font-weight: 700;
      color: #455A64; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 5px 0 #CFD8DC;
    }
    .es-letter-btn:active { transform: translateY(3px); box-shadow: 0 2px 0 #CFD8DC; }
    
    .es-letter-btn.correct { background: #66BB6A; border-color: #43A047; box-shadow: 0 5px 0 #43A047; color: white; }
    .es-letter-btn.wrong { background: #EF5350; border-color: #D32F2F; box-shadow: 0 5px 0 #D32F2F; color: white; opacity: 0.6; }
  `;
  document.head.appendChild(style);
}
