/**
 * Rhyme Time — Odd One Out
 * Find the word that DOES NOT rhyme with the others.
 * 3 cards shown: 2 rhyme, 1 doesn't.
 */
import { getTwoFamilies } from './data.js';
import { speakWord, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction } from '../shared/audio.js';
import { recordOddOneOut, addRhymeStars } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';

let currentRound = 0;
let score = 0;
const TOTAL_ROUNDS = 8;

export function renderOddOneOut(app, navigate) {
    currentRound = 0;
    score = 0;
    setTimeout(() => speakInstruction('find_odd_one'), 600);
    nextRound(app, navigate);
}

function nextRound(app, navigate) {
    if (currentRound >= TOTAL_ROUNDS) {
        showCelebration(app, navigate);
        return;
    }

    // A = Rhyming Pair, B = Odd One (intruder)
    const [familyA, familyB] = getTwoFamilies();

    const pair = familyA.words.sort(() => Math.random() - 0.5).slice(0, 2);
    const intruder = familyB.words[Math.floor(Math.random() * familyB.words.length)];

    const options = [...pair, intruder].sort(() => Math.random() - 0.5);

    app.innerHTML = `
    <div class="screen odd-one-screen" id="odd-one-out">
      <div class="top-bar">
        <button class="back-btn" id="oo-back">🏠</button>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${(currentRound / TOTAL_ROUNDS) * 100}%"></div>
        </div>
      </div>

      <div class="oo-content">
        <div class="oo-title">Not like the others?</div>
        
        <div class="oo-grid">
          ${options.map((opt, i) => `
            <button class="oo-card" data-word="${opt.word}" data-odd="${opt.word === intruder.word}" style="animation-delay: ${i * 150}ms">
              <div class="oo-emoji">${opt.emoji}</div>
              <div class="oo-word">${opt.word}</div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

    // Handlers
    document.getElementById('oo-back').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        navigate('rhyme-home');
    });

    document.querySelectorAll('.oo-card').forEach(card => {
        card.addEventListener('click', () => {
            const isOdd = card.dataset.odd === 'true';
            const word = card.dataset.word;

            speakWord(word);

            if (isOdd) {
                playCorrectSound();
                card.classList.add('correct');
                recordOddOneOut(true);
                score++;
                setTimeout(() => speakInstruction('correct'), 700);

                setTimeout(() => {
                    currentRound++;
                    nextRound(app, navigate);
                }, 1200);
            } else {
                playWrongSound();
                setTimeout(() => speakInstruction('wrong'), 700);
                card.classList.add('wrong');
                card.disabled = true;
                recordOddOneOut(false);
            }
        });
    });
}

function showCelebration(app, navigate) {
    playCelebrationSound();
    spawnConfetti();
    addRhymeStars(5);

    app.innerHTML = `
    <div class="screen celebration-screen">
      <div class="celebration-content">
        <div class="celebration-emoji">${score >= TOTAL_ROUNDS * 0.8 ? '🏆' : score >= TOTAL_ROUNDS * 0.6 ? '🌟' : '👍'}</div>
        <div class="celebration-stars">${'⭐'.repeat(Math.min(score, 8))}</div>
        <div class="celebration-btns">
          <button class="celebration-icon-btn" id="oo-restart">🔄</button>
          <button class="celebration-icon-btn" id="oo-home">🏠</button>
        </div>
      </div>
    </div>
  `;

    document.getElementById('oo-restart').addEventListener('click', () => {
        playPopSound();
        renderOddOneOut(app, navigate);
    });

    document.getElementById('oo-home').addEventListener('click', () => {
        playPopSound();
        navigate('rhyme-home');
    });
}

export function injectOddOneOutStyles() {
    if (document.getElementById('oo-styles')) return;
    const style = document.createElement('style');
    style.id = 'oo-styles';
    style.textContent = `
    .odd-one-screen { background: var(--color-bg); }
    .oo-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-xl); padding-bottom: var(--space-2xl); }
    .oo-title { font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: #5E35B1; }
    
    .oo-grid { display: flex; flex-direction: column; gap: var(--space-lg); width: 100%; max-width: 320px; }
    
    .oo-card {
      background: white; border-radius: 24px; padding: var(--space-md) var(--space-lg);
      display: flex; align-items: center; gap: var(--space-lg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 2px solid transparent;
      cursor: pointer; transition: transform 0.2s;
      animation: pop 0.4s backwards;
    }
    .oo-card:active { transform: scale(0.96); }
    
    .oo-emoji { font-size: 3rem; }
    .oo-word { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: #444; }
    
    .oo-card.correct { background: #D1C4E9; border-color: #673AB7; }
    .oo-card.wrong { opacity: 0.5; background: #FFEBEE; }
  `;
    document.head.appendChild(style);
}
