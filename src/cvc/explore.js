/**
 * Explore Screen — CVC Words Adventure
 * Shows word families as bubbles. Tap a family to see all its words.
 * Tap a word to hear it blended letter by letter.
 */
import { getAllFamilies, getFamily } from './data.js';
import { speakWord, playPopSound, speakInstruction, speak, playTinkle, speakBlendCVC } from '../shared/audio.js';
import { markFamilyExplored, addCvcStars } from '../shared/storage.js';
import { advanceJourney, exitJourney } from '../shared/journey.js';

let selectedFamily = null;
let localNavigate = null;

export function renderExplore(app, navigate, props = {}) {
    localNavigate = navigate;
    selectedFamily = null;

    app.innerHTML = `
    <div class="screen cvc-explore-screen" id="cvc-explore">
      <div class="top-bar">
        <button class="back-btn" id="cvc-explore-back">${window.isJourneyMode ? '✕' : '🏠'}</button>
        <div class="top-bar-title">Word Families</div>
      </div>
      <div class="explore-content" id="explore-content">
        <div class="family-grid" id="family-grid">
          ${getAllFamilies().map((f, i) => `
            <button class="family-bubble" data-rime="${f.rime}" style="--fam-color: ${f.color}; animation-delay: ${i * 80}ms">
              <span class="family-emoji">${f.emoji}</span>
              <span class="family-rime">-${f.rime}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <!-- Word Detail Overlay -->
      <div class="word-overlay" id="word-overlay" style="display:none">
        <div class="word-overlay-card" id="word-overlay-card">
          <button class="word-overlay-close" id="word-overlay-close">✕</button>
          <div class="word-overlay-title" id="word-overlay-title"></div>
          <div class="word-list" id="word-list"></div>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => speakInstruction('explore_entry'), 600);

    document.getElementById('cvc-explore-back').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        if (window.isJourneyMode) exitJourney(navigate);
        else navigate('cvc-home');
    });

    document.getElementById('family-grid').addEventListener('click', (e) => {
        const bubble = e.target.closest('.family-bubble');
        if (!bubble) return;
        playPopSound();
        showFamily(bubble.dataset.rime);
    });

    document.getElementById('word-overlay-close').addEventListener('click', () => {
        playPopSound();
        if (window.isJourneyMode) advanceJourney(localNavigate);
        else closeDetail();
    });

    document.getElementById('word-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'word-overlay') hideOverlay();
    });

    document.getElementById('word-list').addEventListener('click', (e) => {
        const wordBtn = e.target.closest('.word-item');
        if (!wordBtn) return;
        const word = wordBtn.dataset.word;
        playTinkle();
        animatePress(wordBtn);
        speakBlendCVC(word);
    });
}

function animatePress(el) {
    el.style.transform = 'scale(0.92)';
    setTimeout(() => el.style.transform = 'scale(1)', 150);
}

async function showFamily(rime) {
    window.speechSynthesis?.cancel();
    const family = getFamily(rime);
    if (!family) return;
    selectedFamily = family;

    document.getElementById('word-overlay-title').innerHTML = `
    <span style="color: ${family.color}">-${family.rime}</span> ${family.emoji}
  `;

    document.getElementById('word-list').innerHTML = family.words.map((w, i) => `
    <button class="word-item" data-word="${w.word}" style="--word-color: ${family.color}; animation-delay: ${i * 60}ms">
      <span class="word-item-emoji">${w.emoji}</span>
      <div class="word-item-letters">
        <span class="word-onset" style="color: ${family.color}">${w.onset}</span>
        <span class="word-rime">${family.rime}</span>
      </div>
    </button>
  `).join('');

    const overlay = document.getElementById('word-overlay');
    overlay.style.display = 'flex';

    const card = document.getElementById('word-overlay-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'celebratePop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    card.style.borderTopColor = family.color;

    markFamilyExplored(rime);
    addCvcStars(1);

    // Auto-speak the family rime
    playTinkle();
    await speakWord(family.rime);
}

function hideOverlay() {
    document.getElementById('word-overlay').style.display = 'none';
    selectedFamily = null;
    window.speechSynthesis?.cancel();
}

export function injectExploreStyles() {
    if (document.getElementById('explore-styles')) return;
    const style = document.createElement('style');
    style.id = 'explore-styles';
    style.textContent = `
    .explore-screen { background: var(--color-bg); }
    .explore-content { flex: 1; overflow-y: auto; padding: 0 var(--space-lg) var(--space-lg); position: relative; }

    .family-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-xl);
      padding: var(--space-xl) 0;
      max-width: 700px;
      margin: 0 auto;
    }
    .family-bubble {
      aspect-ratio: 1;
      border-radius: 50%;
      background: var(--color-surface);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      transition: transform var(--transition-bounce), box-shadow var(--transition-base);
      animation: pop var(--transition-slow) backwards;
      cursor: pointer;
      border: 4px solid var(--fam-color);
      position: relative;
      overflow: hidden;
    }
    .family-bubble::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--fam-color);
      opacity: 0.06;
      border-radius: inherit;
    }
    .family-bubble:active { transform: scale(0.92); box-shadow: var(--shadow-sm); }
    .family-emoji { font-size: 3rem; }
    .family-rime {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 800;
      color: var(--fam-color);
    }

    /* Overlay */
    .word-overlay {
      position: fixed; inset: 0; z-index: 50;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(12px);
    }
    .word-overlay-card {
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      max-width: 500px; width: 90%;
      text-align: center;
      box-shadow: 0 12px 48px rgba(0,0,0,0.25);
      position: relative;
      border-top: 8px solid currentColor;
      max-height: 85vh; overflow-y: auto;
    }
    .word-overlay-close {
      position: absolute; top: var(--space-sm); right: var(--space-sm);
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(0,0,0,0.06); font-size: var(--text-lg);
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-light); border: none; cursor: pointer;
    }
    .word-overlay-title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: 900;
      margin-bottom: var(--space-lg);
    }

    /* Word list */
    .word-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: var(--space-md);
    }
    .word-item {
      background: var(--color-bg);
      border: 3px solid rgba(0,0,0,0.05);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
      animation: pop var(--transition-slow) backwards;
    }
    .word-item:active { transform: scale(0.95); background: rgba(0,0,0,0.04); }
    .word-item-emoji { font-size: 2.5rem; }
    .word-item-letters {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 800;
    }
    .word-onset { font-weight: 900; }
    .word-rime { color: var(--color-text-light); }
  `;
    document.head.appendChild(style);
}
