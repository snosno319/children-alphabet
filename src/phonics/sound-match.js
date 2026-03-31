/**
 * Phonics Lab — Sound Match
 * Hear a word and identify its starting sound.
 */
import { getWordsForSound, getDistractorSounds, ALL_SOUNDS } from './data.js';
import { LETTERS } from '../alphabet/data.js';
import { speakWord, speakLetterFull, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction, speak } from '../shared/audio.js';
import { recordSoundMatch, addPhonicsStars } from '../shared/storage.js';
import { checkAndAwardBadges } from '../shared/badges.js';
import { spawnConfetti } from '../shared/confetti.js';
import { floatStars } from '../shared/feedback.js';
import { advanceJourney, exitJourney } from '../shared/journey.js';

let currentRound = 0;
let score = 0;
const TOTAL_ROUNDS = 8;
let questions = [];
let answered = false;
let localNavigate = null;

export function renderSoundMatch(app, navigate, props = {}) {
  localNavigate = navigate;
  score = 0;
  currentRound = 0;
  nextRound(app, navigate);
}

function nextRound(app, navigate) {
  if (currentRound >= TOTAL_ROUNDS) {
    showCelebration(app, navigate);
    return;
  }

  // Pick a target sound and word
  const targetSound = ALL_SOUNDS[Math.floor(Math.random() * ALL_SOUNDS.length)];
  const wordData = getWordsForSound(targetSound, 1)[0];

  // Pick distractors
  const distractions = getDistractorSounds(targetSound, 3);
  const options = [targetSound, ...distractions].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="screen phonics-match-screen" id="phonics-match">
      <div class="top-bar">
        <button class="back-btn" id="pmatch-back">${window.isJourneyMode ? '✕' : '🏠'}</button>
        <div class="top-bar-title">Sound Match</div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${(currentRound / TOTAL_ROUNDS) * 100}%"></div>
        </div>
      </div>

      <div class="sm-content">
        <div class="sm-target-card" id="sm-target">
          <div class="sm-emoji">${wordData.emoji}</div>
          <button class="sm-hear-btn" id="sm-hear">🔊</button>
        </div>

        <div class="sm-letters">
          ${options.map((letter, i) => `
            <button class="sm-letter-btn" data-sound="${letter}" style="animation-delay: ${i * 100}ms">
              ${letter}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Audio
  setTimeout(() => {
    speakWord(wordData.word);
  }, 600);

  // Event Listeners
  document.getElementById('pmatch-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    if (window.isJourneyMode) exitJourney(navigate);
    else navigate('phonics-home');
  });

  document.getElementById('sm-hear').addEventListener('click', () => {
    speakWord(wordData.word);
    const btn = document.getElementById('sm-hear');
    btn.style.transform = 'scale(1.1)';
    setTimeout(() => btn.style.transform = 'scale(1)', 200);
  });

  document.querySelectorAll('.sm-letter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.sound;

      if (selected === targetSound) {
        // Correct
        playCorrectSound();
        speakLetterFull(selected);
        btn.classList.add('correct');
        recordSoundMatch(true);
        score++;
        floatStars(btn, 2);
        setTimeout(() => speakInstruction('correct'), 700);

        // Pop animation
        btn.style.animation = 'pop 0.3s forwards';

        setTimeout(() => {
          currentRound++;
          nextRound(app, navigate);
        }, 1200);
      } else {
        // Wrong
        playWrongSound();
        speakLetterFull(selected);
        btn.classList.add('wrong');
        btn.disabled = true;
        recordSoundMatch(false);
        setTimeout(() => speakInstruction('wrong'), 700);
      }
    });
  });
}

function showCelebration(app, navigate) {
  playCelebrationSound();
  spawnConfetti();
  addPhonicsStars(3);
  checkAndAwardBadges(navigate);

  app.innerHTML = `
    <div class="screen celebration-screen">
      <div class="celebration-content">
        <div class="celebration-emoji">${score >= TOTAL_ROUNDS * 0.8 ? '🏆' : score >= TOTAL_ROUNDS * 0.6 ? '🌟' : '👍'}</div>
        <div class="celebration-stars">${'⭐'.repeat(Math.min(score, 8))}</div>
        <div class="celebration-btns">
          <button class="celebration-icon-btn" id="sm-restart">🔄</button>
          <button class="celebration-icon-btn" id="sm-home">🏠</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('sm-restart').addEventListener('click', () => {
    playPopSound();
    renderSoundMatch(app, navigate);
  });

  document.getElementById('sm-home').addEventListener('click', () => {
    playPopSound();
    navigate('phonics-home');
  });
}

export function injectSoundMatchStyles() {
  if (document.getElementById('sm-styles')) return;
  const style = document.createElement('style');
  style.id = 'sm-styles';
  style.textContent = `
    .sound-match-screen {
      background: var(--color-bg);
    }

    .sm-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-2xl);
      padding-bottom: var(--space-2xl);
    }

    .sm-target-card {
      background: #FFFFFF;
      padding: var(--space-xl);
      border-radius: 32px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      position: relative;
    }

    .sm-emoji { font-size: 6rem; }

    .sm-hear-btn {
      width: 60px; height: 60px;
      border-radius: 50%;
      background: #42A5F5;
      color: white;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(66, 165, 245, 0.4);
      transition: transform 0.2s;
    }

    .sm-letters {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-lg);
    }

    .sm-letter-btn {
      width: 100px; height: 100px;
      border-radius: 24px;
      background: #FFFFFF;
      border: 3px solid #E0E0E0;
      font-family: var(--font-display);
      font-size: 3.5rem;
      font-weight: 700;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;
      animation: pop 0.4s backwards;
      box-shadow: 0 6px 0 #E0E0E0;
    }

    .sm-letter-btn:active {
      transform: translateY(4px);
      box-shadow: 0 2px 0 #E0E0E0;
    }

    .sm-letter-btn.correct {
      background: #66BB6A;
      border-color: #43A047;
      box-shadow: 0 6px 0 #43A047;
      color: white;
    }

    .sm-letter-btn.wrong {
      background: #EF5350;
      border-color: #D32F2F;
      box-shadow: 0 6px 0 #D32F2F;
      color: white;
      opacity: 0.6;
    }

    @media (max-aspect-ratio: 1/1) {
      .sm-letters { grid-template-columns: repeat(2, 1fr); }
      .sm-emoji { font-size: 5rem; }
    }
  `;
  document.head.appendChild(style);
}
