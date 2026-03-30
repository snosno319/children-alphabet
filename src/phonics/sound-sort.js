/**
 * Phonics Lab — Sound Sort
 * Sort words into two buckets based on their starting sound.
 */
import { getWordsForSound, ALL_SOUNDS } from './data.js';
import { speakWord, speakLetterFull, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction, playSwipeSound } from '../shared/audio.js';
import { recordSoundSort, addPhonicsStars } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';

let currentRound = 0;
let score = 0;
const TOTAL_ROUNDS = 8;
let soundA, soundB;

export function renderSoundSort(app, navigate) {
  currentRound = 0;
  score = 0;

  // Pick two distinct sounds for this session
  const shuffled = [...ALL_SOUNDS].sort(() => Math.random() - 0.5);
  soundA = shuffled[0];
  soundB = shuffled[1];

  nextRound(app, navigate);
}

function nextRound(app, navigate) {
  if (currentRound >= TOTAL_ROUNDS) {
    showCelebration(app, navigate);
    return;
  }

  const isA = Math.random() > 0.5;
  const targetSound = isA ? soundA : soundB;
  const wordData = getWordsForSound(targetSound, 1)[0];

  app.innerHTML = `
    <div class="screen sound-sort-screen" id="sound-sort">
      <div class="top-bar">
        <button class="back-btn" id="ss-back">🏠</button>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${(currentRound / TOTAL_ROUNDS) * 100}%"></div>
        </div>
      </div>

      <div class="ss-content">
        <!-- Draggable Word Card -->
        <div class="ss-card" id="ss-card">
          <div class="ss-emoji">${wordData.emoji}</div>
          <button class="ss-hear-btn" id="ss-hear">🔊</button>
        </div>

        <!-- Sorting Buckets -->
        <div class="ss-buckets">
          <button class="ss-bucket" data-sound="${soundA}" id="bucket-a">
            <span class="ss-bucket-label">${soundA}</span>
          </button>
          
          <button class="ss-bucket" data-sound="${soundB}" id="bucket-b">
            <span class="ss-bucket-label">${soundB}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => speakWord(wordData.word), 600);

  // Handlers
  document.getElementById('ss-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    navigate('phonics-home');
  });

  document.getElementById('ss-hear').addEventListener('click', (e) => {
    e.stopPropagation();
    speakWord(wordData.word);
  });

  // Bucket clicks (tap to sort)
  document.querySelectorAll('.ss-bucket').forEach(bucket => {
    bucket.addEventListener('click', () => {
      const selected = bucket.dataset.sound;

      if (selected === targetSound) {
        // Correct
        playCorrectSound();
        playSwipeSound(); // Whoosh effect
        speakLetterFull(selected);

        // Animate card moving to bucket
        const card = document.getElementById('ss-card');
        const rect = bucket.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        const deltaX = rect.left + (rect.width / 2) - (cardRect.left + cardRect.width / 2);
        const deltaY = rect.top + (rect.height / 2) - (cardRect.top + cardRect.height / 2);

        card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s';
        card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0)`;
        card.style.opacity = '0';

        recordSoundSort(true);
        score++;

        setTimeout(() => {
          currentRound++;
          nextRound(app, navigate);
        }, 800);
      } else {
        // Wrong
        playWrongSound();
        bucket.style.animation = 'shake 0.4s';
        setTimeout(() => bucket.style.animation = '', 400);
        recordSoundSort(false);
      }
    });
  });
}

function showCelebration(app, navigate) {
  playCelebrationSound();
  spawnConfetti();
  addPhonicsStars(4);

  app.innerHTML = `
    <div class="screen celebration-screen">
      <div class="celebration-content">
        <div class="celebration-emoji">${score >= TOTAL_ROUNDS * 0.8 ? '🏆' : score >= TOTAL_ROUNDS * 0.6 ? '🌟' : '👍'}</div>
        <div class="celebration-stars">${'⭐'.repeat(Math.min(score, 8))}</div>
        <div class="celebration-btns">
          <button class="celebration-icon-btn" id="ss-restart">🔄</button>
          <button class="celebration-icon-btn" id="ss-home">🏠</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('ss-restart').addEventListener('click', () => {
    playPopSound();
    renderSoundSort(app, navigate);
  });

  document.getElementById('ss-home').addEventListener('click', () => {
    playPopSound();
    navigate('phonics-home');
  });
}

export function injectSoundSortStyles() {
  if (document.getElementById('ss-styles')) return;
  const style = document.createElement('style');
  style.id = 'ss-styles';
  style.textContent = `
    .sound-sort-screen { background: var(--color-bg); }
    
    .ss-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-xl) 0;
    }

    .ss-card {
      background: white;
      padding: var(--space-2xl);
      border-radius: 32px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-lg);
      transform-origin: center;
    }

    .ss-emoji { font-size: 6rem; }

    .ss-hear-btn {
      width: 50px; height: 50px;
      border-radius: 50%;
      background: #42A5F5;
      color: white;
      border: none;
      font-size: 1.4rem;
      cursor: pointer;
    }

    .ss-buckets {
      display: flex;
      gap: var(--space-2xl);
      margin-bottom: var(--space-xl);
    }

    .ss-bucket {
      width: 140px; height: 160px;
      background: #ECEFF1;
      border-radius: 20px 20px 40px 40px;
      border: 4px solid #CFD8DC;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: inset 0 10px 20px rgba(0,0,0,0.05);
      position: relative;
      transition: transform 0.2s;
    }
    .ss-bucket:active { transform: scale(0.96); }

    .ss-bucket-label {
      font-family: var(--font-display);
      font-size: 5rem;
      font-weight: 800;
      color: #90A4AE;
      margin-top: -10px;
    }

    .ss-bucket-emoji {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
}
