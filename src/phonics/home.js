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
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
    }

    .sub-home-buttons {
      display: flex;
      gap: var(--space-xl);
    }

    .activity-btn {
      width: 130px;
      padding: var(--space-xl) var(--space-md) var(--space-lg);
      border-radius: var(--radius-xl);
      background: linear-gradient(145deg, color-mix(in srgb, var(--btn-color) 80%, white), var(--btn-color));
      background: var(--btn-color);
      box-shadow: 0 8px 0 color-mix(in srgb, var(--btn-color) 60%, black 40%), 0 10px 24px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      animation: pop var(--transition-slow) backwards;
      border: none;
      position: relative;
      overflow: hidden;
    }
    .activity-btn::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 40%;
      background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      pointer-events: none;
    }
    .activity-btn:active {
      transform: translateY(6px);
      box-shadow: 0 2px 0 color-mix(in srgb, var(--btn-color) 60%, black 40%), 0 4px 12px rgba(0,0,0,0.15);
    }

    .activity-btn-icon { font-size: 3rem; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2)); }
    .activity-btn-label {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1rem;
      color: rgba(255,255,255,0.95);
      text-shadow: 0 1px 3px rgba(0,0,0,0.25);
    }

    @media (max-aspect-ratio: 1/1) {
      .sub-home-buttons { gap: var(--space-lg); }
      .activity-btn { width: 110px; padding: var(--space-lg) var(--space-sm); }
      .activity-btn-icon { font-size: 2.5rem; }
    }
  `;
    document.head.appendChild(style);
}
