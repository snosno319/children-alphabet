/**
 * Phonics Lab Home Screen
 * Sub-app picker with 3 activity buttons: Sound Match, Sound Sort, End Sound
 */
import { getSubAppStars } from '../shared/storage.js';
import { playPopSound, speakInstruction } from '../shared/audio.js';

export function renderHome(app, navigate) {
    const stars = getSubAppStars('phonics');

    app.innerHTML = `
    <div class="screen phonics-home-screen" id="phonics-home">
      <div class="top-bar">
        <button class="back-btn" id="phonics-hub-back">🌈</button>
        <div class="top-bar-right">
          <span class="star-badge">⭐ ${stars}</span>
        </div>
      </div>

      <div class="sub-home-content">
        <div class="sub-home-title">🔊</div>

        <div class="sub-home-buttons">
          <button class="activity-btn" id="phonics-sound-match"
                  style="--btn-color: #FF6B6B; animation-delay: 0ms">
            <span class="activity-btn-icon">👂</span>
            <span class="activity-btn-label">Match</span>
          </button>

          <button class="activity-btn" id="phonics-sound-sort"
                  style="--btn-color: #42A5F5; animation-delay: 80ms">
            <span class="activity-btn-icon">🗂️</span>
            <span class="activity-btn-label">Sort</span>
          </button>

          <button class="activity-btn" id="phonics-end-sound"
                  style="--btn-color: #66BB6A; animation-delay: 160ms">
            <span class="activity-btn-icon">🔚</span>
            <span class="activity-btn-label">Ends</span>
          </button>
        </div>
      </div>
    </div>
  `;

    document.getElementById('phonics-hub-back').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        navigate('hub');
    });

    document.getElementById('phonics-sound-match').addEventListener('click', () => {
        playPopSound();
        navigate('sound-match');
    });

    document.getElementById('phonics-sound-sort').addEventListener('click', () => {
        playPopSound();
        navigate('sound-sort');
    });

    document.getElementById('phonics-end-sound').addEventListener('click', () => {
        playPopSound();
        navigate('end-sound');
    });

    setTimeout(() => speakInstruction('phonics_entry'), 600);
}

export function injectHomeStyles() {
    if (document.getElementById('phonics-home-styles')) return;
    const style = document.createElement('style');
    style.id = 'phonics-home-styles';
    style.textContent = `
    .phonics-home-screen {
      background: linear-gradient(160deg, #FFF3E0 0%, #FFE0B2 50%, #FFCCBC 100%);
      align-items: center;
      justify-content: center;
      gap: var(--space-xl);
      padding: var(--space-xl);
    }

    .sub-home-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2xl);
      z-index: 1;
    }

    .sub-home-title {
      font-size: 5rem;
      animation: bounce 2.5s ease-in-out infinite;
    }

    .sub-home-buttons {
      display: flex;
      gap: var(--space-xl);
    }

    .activity-btn {
      width: 110px;
      height: 130px;
      border-radius: var(--radius-xl);
      background: var(--btn-color);
      box-shadow: 0 6px 24px rgba(0,0,0,0.15), 0 3px 0 rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      cursor: pointer;
      transition: transform var(--transition-bounce);
      animation: pop var(--transition-slow) backwards;
      border: none;
    }
    .activity-btn:active { transform: scale(0.92); }

    .activity-btn-icon { font-size: 2.5rem; }
    .activity-btn-label {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.95);
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    @media (max-aspect-ratio: 1/1) {
      .sub-home-buttons { gap: var(--space-lg); }
      .activity-btn { width: 95px; height: 110px; }
      .activity-btn-icon { font-size: 2rem; }
    }
  `;
    document.head.appendChild(style);
}
