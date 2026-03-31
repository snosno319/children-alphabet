/**
 * Rhyme Time — Rhyme Sort
 * Sort words into two rhyme families.
 */
import { getTwoFamilies, RHYME_FAMILIES } from './data.js';
import { speakWord, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction, playSwipeSound } from '../shared/audio.js';
import { recordRhymeSort, addRhymeStars } from '../shared/storage.js';
import { checkAndAwardBadges } from '../shared/badges.js';
import { spawnConfetti } from '../shared/confetti.js';

let currentRound = 0;
let score = 0;
const TOTAL_ROUNDS = 8;
let familyA, familyB;

export function renderRhymeSort(app, navigate) {
    currentRound = 0;
    score = 0;

    // Pick two contrasting families
    [familyA, familyB] = getTwoFamilies();

    nextRound(app, navigate);
}

function nextRound(app, navigate) {
    if (currentRound >= TOTAL_ROUNDS) {
        showCelebration(app, navigate);
        return;
    }

    const isA = Math.random() > 0.5;
    const targetFamily = isA ? familyA : familyB;
    const words = targetFamily.words.sort(() => Math.random() - 0.5);
    const wordData = words[Math.floor(Math.random() * words.length)];

    app.innerHTML = `
    <div class="screen rhyme-sort-screen" id="rhyme-sort">
      <div class="top-bar">
        <button class="back-btn" id="rs-back">🏠</button>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${(currentRound / TOTAL_ROUNDS) * 100}%"></div>
        </div>
      </div>

      <div class="rs-content">
        <!-- Draggable Word Card -->
        <div class="rs-card" id="rs-card">
          <div class="rs-emoji">${wordData.emoji}</div>
          <div class="rs-word">${wordData.word}</div>
        </div>

        <!-- Sorting Buckets -->
        <div class="rs-buckets">
          <button class="rs-bucket" data-pattern="${familyA.pattern}" style="--b-color: ${familyA.color}">
            <div class="rs-bucket-label">${familyA.pattern}</div>
            <div class="rs-bucket-emoji">${familyA.words[0].emoji}</div>
          </button>
          
          <button class="rs-bucket" data-pattern="${familyB.pattern}" style="--b-color: ${familyB.color}">
            <div class="rs-bucket-label">${familyB.pattern}</div>
            <div class="rs-bucket-emoji">${familyB.words[0].emoji}</div>
          </button>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => speakWord(wordData.word), 600);

    document.getElementById('rs-back').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        navigate('rhyme-home');
    });

    document.getElementById('rs-card').addEventListener('click', () => {
        speakWord(wordData.word);
    });

    document.querySelectorAll('.rs-bucket').forEach(bucket => {
        bucket.addEventListener('click', () => {
            const selected = bucket.dataset.pattern;

            if (selected === targetFamily.pattern) {
                // Correct
                playCorrectSound();
                playSwipeSound();
                speakWord(wordData.word);
                setTimeout(() => speakInstruction('correct'), 700);

                const card = document.getElementById('rs-card');
                const rect = bucket.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();

                const deltaX = rect.left + (rect.width / 2) - (cardRect.left + cardRect.width / 2);
                const deltaY = rect.top + (rect.height / 2) - (cardRect.top + cardRect.height / 2);

                card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s';
                card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0)`;
                card.style.opacity = '0';

                recordRhymeSort(true);
                score++;

                setTimeout(() => {
                    currentRound++;
                    nextRound(app, navigate);
                }, 800);
            } else {
                playWrongSound();
                speakInstruction('wrong');
                bucket.style.animation = 'shake 0.4s';
                setTimeout(() => bucket.style.animation = '', 400);
                recordRhymeSort(false);
            }
        });
    });
}

function showCelebration(app, navigate) {
    playCelebrationSound();
    spawnConfetti();
    addRhymeStars(4);
    checkAndAwardBadges(navigate);

    app.innerHTML = `
    <div class="screen celebration-screen">
      <div class="celebration-content">
        <div class="celebration-emoji">${score >= TOTAL_ROUNDS * 0.8 ? '🏆' : score >= TOTAL_ROUNDS * 0.6 ? '🌟' : '👍'}</div>
        <div class="celebration-stars">${'⭐'.repeat(Math.min(score, 8))}</div>
        <div class="celebration-btns">
          <button class="celebration-icon-btn" id="rs-restart">🔄</button>
          <button class="celebration-icon-btn" id="rs-home">🏠</button>
        </div>
      </div>
    </div>
  `;

    document.getElementById('rs-restart').addEventListener('click', () => {
        playPopSound();
        renderRhymeSort(app, navigate);
    });

    document.getElementById('rs-home').addEventListener('click', () => {
        playPopSound();
        navigate('rhyme-home');
    });
}

export function injectRhymeSortStyles() {
    if (document.getElementById('rs-styles')) return;
    const style = document.createElement('style');
    style.id = 'rs-styles';
    style.textContent = `
    .rhyme-sort-screen { background: var(--color-bg); }
    .rs-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: var(--space-xl) 0; }
    
    .rs-card {
      background: white; padding: var(--space-xl) var(--space-2xl); border-radius: 28px;
      box-shadow: 0 10px 24px rgba(0,0,0,0.12); display: flex; flex-direction: column;
      align-items: center; gap: var(--space-md); cursor: pointer;
    }
    .rs-emoji { font-size: 5rem; }
    .rs-word { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: #333; }
    
    .rs-buckets { display: flex; gap: var(--space-2xl); margin-bottom: var(--space-lg); }
    .rs-bucket {
      width: 130px; height: 160px; border-radius: 24px; border: none;
      background: var(--b-color);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; cursor: pointer; box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }
    .rs-bucket:active { transform: scale(0.95); }
    .rs-bucket-label { color: rgba(255,255,255,0.9); font-size: 2.5rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .rs-bucket-emoji { font-size: 2.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
    
    @media (max-width: 400px) {
        .rs-buckets { gap: var(--space-lg); }
        .rs-bucket { width: 110px; height: 140px; }
    }
  `;
    document.head.appendChild(style);
}
