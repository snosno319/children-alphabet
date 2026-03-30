/**
 * Rhyme Time Home Screen
 * Sub-app picker with 3 activity buttons: Rhyme Match, Rhyme Sort, Odd One Out
 */
import { getSubAppStars } from '../shared/storage.js';
import { playPopSound, speakInstruction } from '../shared/audio.js';

export function renderHome(app, navigate) {
    const stars = getSubAppStars('rhyme');

    app.innerHTML = `
    <div class="screen rhyme-home-screen" id="rhyme-home">
      <div class="top-bar">
        <button class="back-btn" id="rhyme-hub-back">🌈</button>
        <div class="top-bar-right">
          <span class="star-badge">⭐ ${stars}</span>
        </div>
      </div>

      <div class="sub-home-content">
        <div class="sub-home-title">🎵</div>

        <div class="sub-home-buttons">
          <button class="activity-btn" id="rhyme-match-btn"
                  style="--btn-color: #E879F9; animation-delay: 0ms">
            <span class="activity-btn-icon">🎯</span>
            <span class="activity-btn-label">Match</span>
          </button>

          <button class="activity-btn" id="rhyme-sort-btn"
                  style="--btn-color: #F472B6; animation-delay: 80ms">
            <span class="activity-btn-icon">🗂️</span>
            <span class="activity-btn-label">Sort</span>
          </button>

          <button class="activity-btn" id="rhyme-odd-btn"
                  style="--btn-color: #A78BFA; animation-delay: 160ms">
            <span class="activity-btn-icon">🤔</span>
            <span class="activity-btn-label">Odd Out</span>
          </button>
        </div>
      </div>
    </div>
  `;

    document.getElementById('rhyme-hub-back').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        navigate('hub');
    });

    document.getElementById('rhyme-match-btn').addEventListener('click', () => {
        playPopSound();
        navigate('rhyme-match');
    });

    document.getElementById('rhyme-sort-btn').addEventListener('click', () => {
        playPopSound();
        navigate('rhyme-sort');
    });

    document.getElementById('rhyme-odd-btn').addEventListener('click', () => {
        playPopSound();
        navigate('odd-one-out');
    });

    setTimeout(() => speakInstruction('rhyme_entry'), 600);
}

export function injectHomeStyles() {
    if (document.getElementById('rhyme-home-styles')) return;
    const style = document.createElement('style');
    style.id = 'rhyme-home-styles';
    style.textContent = `
    .rhyme-home-screen {
      background: linear-gradient(160deg, #FCE4EC 0%, #F8BBD0 50%, #E1BEE7 100%);
      align-items: center;
      justify-content: center;
      gap: var(--space-xl);
      padding: var(--space-xl);
    }
  `;
    document.head.appendChild(style);
}
