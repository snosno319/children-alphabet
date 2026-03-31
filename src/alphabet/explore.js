/**
 * Explore Screen — rich letter detail with interactive, clickable elements.
 * No more long monologues — child taps what they want to hear.
 */
import { LETTERS } from './data.js';
import { speakLetter, speakPhonetic, playPopSound, speakInstruction, speakFunFact, playTinkle, playAudio, slug } from '../shared/audio.js';
import { markExplored, addAlphabetStars } from '../shared/storage.js';
import { checkAndAwardBadges } from '../shared/badges.js';
import { advanceJourney, exitJourney } from '../shared/journey.js';

let currentIndex = 0;
let exploredThisSession = new Set();
let localNavigate = null;

export function renderExplore(app, navigate, props = {}) {
  localNavigate = navigate;
  if (window.isJourneyMode && props.index !== undefined) {
    currentIndex = props.index;
  } else if (!window.isJourneyMode) {
    currentIndex = 0;
  }

  app.innerHTML = `
    <div class="screen explore-screen" id="explore">
      <div class="top-bar">
        <!-- Close button if Journey, House if freeplay -->
        <button class="back-btn" id="explore-back">${window.isJourneyMode ? '✕' : '🏠'}</button>
        <div class="top-bar-title">The Alphabet</div>
      </div>
      <div class="explore-content" id="explore-content">
        <div class="letter-grid" id="letter-grid">
          ${LETTERS.map((l, i) => `
            <button class="letter-cell" data-index="${i}" style="--cell-color: ${l.color}; animation-delay: ${i * 30}ms">
              <span class="letter-cell-char">${l.letter}</span>
              <span class="letter-cell-emoji">${l.emoji}</span>
            </button>
          `).join('')}
        </div>
        <div class="explore-tap-hint" id="explore-tap-hint">
          <span class="tap-hand-explore">👆</span>
        </div>
      </div>
      <!-- Detail Overlay -->
      <div class="explore-detail-overlay" id="detail-overlay" style="display:none">
        <div class="explore-detail-card" id="detail-card">
          <button class="detail-close" id="detail-close">✕</button>

          <!-- Main letter display -->
          <div class="detail-letter-row">
            <span class="detail-letter" id="detail-letter"></span>
            <span class="detail-letter-lower" id="detail-letter-lower"></span>
          </div>

          <!-- Main emoji (Clickable) -->
          <button class="detail-emoji-btn" id="detail-main-btn">
            <div class="detail-emoji" id="detail-emoji"></div>
            <div class="detail-label" id="detail-word"></div>
          </button>

          <!-- Extra examples row (Clickable) -->
          <div class="detail-extras" id="detail-extras"></div>

          <!-- Fun fact bubble (Clickable) -->
          <button class="detail-fun-fact" id="detail-fun-fact"></button>

          <!-- Nav arrows (Hidden in Journey Mode) -->
          <div class="detail-nav" id="detail-nav">
            <button class="detail-nav-btn" id="detail-prev">◀</button>
            <button class="detail-nav-btn" id="detail-next">▶</button>
          </div>

          <!-- Continue Journey Button (Hidden in Free Play) -->
          <button class="detail-journey-continue" id="detail-journey-continue" style="display:none">
            Continue Journey ▶
          </button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => speakInstruction('explore_entry'), 600);

  document.getElementById('explore-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    if (window.isJourneyMode) {
      exitJourney(navigate);
    } else {
      navigate('alphabet-home');
    }
  });

  document.getElementById('detail-journey-continue')?.addEventListener('click', () => {
    playPopSound();
    advanceJourney(navigate);
  });

  document.getElementById('letter-grid').addEventListener('click', (e) => {
    const cell = e.target.closest('.letter-cell');
    if (!cell) return;
    playPopSound();
    const hint = document.getElementById('explore-tap-hint');
    if (hint) hint.remove();
    showDetail(parseInt(cell.dataset.index));
  });

  document.getElementById('detail-close').addEventListener('click', () => {
    playPopSound();
    hideDetail();
  });

  document.getElementById('detail-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'detail-overlay') hideDetail();
  });

  // Main interaction: Letter/Word
  document.getElementById('detail-main-btn').addEventListener('click', () => {
    const l = LETTERS[currentIndex];
    playTinkle();
    // "A is for Apple" — use pre-generated audio file
    playAudio(`audio/intro/${l.letter.toLowerCase()}_is_for_${slug(l.word)}.wav`, `${l.letter} is for ${l.word}`);
    animatePress('detail-main-btn');
  });

  // Full fact interaction
  document.getElementById('detail-fun-fact').addEventListener('click', () => {
    const l = LETTERS[currentIndex];
    if (l.funFact) {
      playPopSound();
      speakFunFact(l.funFact, l.letter);  // pass letter key to use pre-generated file
      animatePress('detail-fun-fact');
    }
  });

  // Extras interaction (event delegation)
  document.getElementById('detail-extras').addEventListener('click', (e) => {
    const btn = e.target.closest('.detail-extra-item');
    if (!btn) return;
    const word = btn.dataset.word;
    const letter = LETTERS[currentIndex].letter;
    playTinkle();
    // "A is also for Airplane" — use pre-generated audio file
    playAudio(`audio/intro/${letter.toLowerCase()}_also_${slug(word)}.wav`, `${letter} is also for ${word}`);
    animatePress(btn);
  });

  const btnL = document.getElementById('detail-prev');
  const btnR = document.getElementById('detail-next');

  btnL.addEventListener('click', () => {
    playPopSound();
    btnL.style.transform = 'scale(0.9)';
    setTimeout(() => {
      btnL.style.transform = '';
      if (window.isJourneyMode) {
          advanceJourney(localNavigate);
      } else {
          showDetail((currentIndex - 1 + 26) % 26);
      }
    }, 150);
  });
  
  btnR.addEventListener('click', () => {
    playPopSound();
    btnR.style.transform = 'scale(0.9)';
    setTimeout(() => {
      btnR.style.transform = '';
      if (window.isJourneyMode) {
          advanceJourney(localNavigate);
      } else {
          showDetail((currentIndex + 1) % 26);
      }
    }, 150);
  });

  // If we are in journey mode, auto-open the detail card for the assigned letter and hide the grid
  if (window.isJourneyMode) {
    document.getElementById('explore-content').style.display = 'none';
    setTimeout(() => showDetail(currentIndex), 100);
  }
}

function animatePress(elementOrId) {
  const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (el) {
    el.style.transform = 'scale(0.92)';
    setTimeout(() => el.style.transform = 'scale(1)', 150);
  }
}

async function showDetail(index) {
  const l = LETTERS[index];

  // Visuals
  document.getElementById('detail-letter').textContent = l.letter;
  document.getElementById('detail-letter').style.color = l.color;
  document.getElementById('detail-letter-lower').textContent = l.letter.toLowerCase();
  document.getElementById('detail-letter-lower').style.color = l.color;

  document.getElementById('detail-emoji').textContent = l.emoji;
  document.getElementById('detail-word').textContent = l.word;
  document.getElementById('detail-word').style.color = l.color;

  // Render Extras
  const extrasEl = document.getElementById('detail-extras');
  if (l.extras && l.extras.length > 0) {
    extrasEl.innerHTML = l.extras.map(ex => `
            <button class="detail-extra-item" data-word="${ex.word}">
                <span class="extra-emoji">${ex.emoji}</span>
                <span class="extra-label" style="color:${l.color}">${ex.word}</span>
            </button>
        `).join('');
    extrasEl.style.display = 'flex';
  } else {
    extrasEl.style.display = 'none';
  }

  // Render Fun Fact
  const factEl = document.getElementById('detail-fun-fact');
  if (l.funFact) {
    factEl.innerHTML = `
            <span class="fact-icon">💡</span>
            <span class="fact-text">Tap for a fun fact!</span>
        `;
    factEl.style.display = 'flex';
  } else {
    factEl.style.display = 'none';
  }

  const overlay = document.getElementById('detail-overlay');
  overlay.style.display = 'flex';

  const card = document.getElementById('detail-card');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'celebratePop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
  card.style.borderTopColor = l.color;
  card.style.background = '#FFFFFF';

  markExplored(l.letter);
  addAlphabetStars(1);
  checkAndAwardBadges(localNavigate);

  // Journey Mode UI injections
  if (window.isJourneyMode) {
    document.getElementById('detail-nav').style.display = 'none';
    document.getElementById('detail-close').style.display = 'none';
    const continueBtn = document.getElementById('detail-journey-continue');
    continueBtn.style.display = 'flex';
    // Small pulse animation to encourage clicking it
    continueBtn.style.animation = 'pulse 2s infinite';
  }

  // Speak the letter name then its phonetic sound using bundled audio files
  playTinkle();
  await speakLetter(l.letter);
  await speakPhonetic(l.letter);  // uses audio/phonics/a.mp3 keyed by letter
  // Then let the child click around
}

function hideDetail() {
  if (window.isJourneyMode) {
    // If in journey mode, we shouldn't really 'hide' details back to grid. We exit journey entirely.
    return exitJourney();
  }
  document.getElementById('detail-overlay').style.display = 'none';
}

export function injectExploreStyles() {
  if (document.getElementById('explore-styles')) return;
  const style = document.createElement('style');
  style.id = 'explore-styles';
  style.textContent = `
    .explore-screen { background: var(--color-bg); }
    .explore-content { flex: 1; overflow-y: auto; padding: 0 var(--space-lg) var(--space-lg); position: relative; }

    .letter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: var(--space-md);
      padding: var(--space-md) 0;
      max-width: 900px;
      margin: 0 auto;
    }
    .letter-cell {
      aspect-ratio: 1;
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      transition: transform var(--transition-bounce), box-shadow var(--transition-base);
      animation: pop var(--transition-slow) backwards;
      position: relative;
      overflow: hidden;
      border: 3px solid transparent;
      cursor: pointer;
    }
    .letter-cell::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--cell-color);
      opacity: 0.08;
      border-radius: inherit;
    }
    .letter-cell:active { transform: scale(0.92); box-shadow: var(--shadow-sm); }
    .letter-cell-char { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--cell-color); }
    .letter-cell-emoji { font-size: var(--text-lg); }

    .explore-tap-hint {
      position: absolute;
      top: 70px; left: 60px;
      animation: tapBounce 1.2s ease-in-out infinite;
      pointer-events: none; z-index: 5;
    }
    .tap-hand-explore { font-size: 2rem; }

    /* Overlay */
    .explore-detail-overlay {
      position: fixed; inset: 0; z-index: 50;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(12px);
    }
    .explore-detail-card {
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      max-width: 440px; width: 90%;
      text-align: center;
      box-shadow: 0 12px 48px rgba(0,0,0,0.25);
      position: relative;
      border-top: 8px solid currentColor;
      max-height: 90vh; overflow-y: auto;
      display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
    }
    .detail-close {
      position: absolute; top: var(--space-sm); right: var(--space-sm);
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(0,0,0,0.06); font-size: var(--text-lg);
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-light); border: none; cursor: pointer;
    }

    .detail-letter-row { display: flex; align-items: baseline; gap: var(--space-md); margin-top: var(--space-sm); }
    .detail-letter { font-family: var(--font-display); font-size: 5rem; font-weight: 900; line-height: 1; }
    .detail-letter-lower { font-family: var(--font-display); font-size: 3.5rem; font-weight: 700; line-height: 1; opacity: 0.6; }

    /* Main Button */
    .detail-emoji-btn {
      background: none; border: none; cursor: pointer;
      display: flex; flex-direction: column; align-items: center;
      transition: transform 0.2s;
    }
    .detail-emoji { font-size: 6rem; animation: float 3s ease-in-out infinite; }
    .detail-label { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; margin-top: 5px; }

    /* Extras */
    .detail-extras { display: flex; gap: var(--space-md); justify-content: center; width: 100%; flex-wrap: wrap; }
    .detail-extra-item {
      background: var(--color-bg);
      border: 2px solid rgba(0,0,0,0.05);
      border-radius: var(--radius-lg);
      padding: var(--space-sm) var(--space-md);
      display: flex; flex-direction: column; align-items: center;
      cursor: pointer; transition: transform 0.2s, background 0.2s;
    }
    .detail-extra-item:active { transform: scale(0.95); background: rgba(0,0,0,0.05); }
    .extra-emoji { font-size: 2.5rem; }
    .extra-label { font-family: var(--font-body); font-weight: 700; font-size: 1rem; margin-top: 4px; }

    /* Fun Fact */
    .detail-fun-fact {
      width: 100%; background: #FFF9C4; color: #F57F17;
      border: none; border-radius: var(--radius-lg);
      padding: var(--space-md);
      display: flex; align-items: center; justify-content: center; gap: var(--space-sm);
      font-family: var(--font-body); font-weight: 700; font-size: 1.1rem;
      cursor: pointer; box-shadow: var(--shadow-sm);
      transition: transform 0.2s;
    }
    .detail-fun-fact:active { transform: scale(0.98); }
    .fact-icon { font-size: 1.5rem; }

    /* Nav */
    .detail-nav { display: flex; justify-content: space-between; width: 100%; margin-top: var(--space-sm); }
    .detail-nav-btn {
      width: 60px; height: 60px; border-radius: 50%;
      background: rgba(0,0,0,0.06); font-size: 1.5rem;
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-light); border: none; cursor: pointer;
    }
    .detail-journey-continue {
      width: 100%;
      background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
      color: white;
      border: none;
      border-radius: var(--radius-lg);
      padding: var(--space-md) var(--space-lg);
      display: flex; align-items: center; justify-content: center; gap: var(--space-sm);
      font-family: var(--font-display); font-weight: 800; font-size: 1.2rem;
      cursor: pointer; box-shadow: 0 4px 12px rgba(59,130,246,0.3);
      transition: transform 0.1s, box-shadow 0.1s;
      margin-top: var(--space-sm);
    }
    .detail-journey-continue:active {
      transform: scale(0.95);
      box-shadow: 0 2px 4px rgba(59,130,246,0.3);
    }
    `;
  document.head.appendChild(style);
}
