/**
 * Home Screen — Sight Words Star
 */
import { getSubAppStars, getSightCompletionPercent } from '../shared/storage.js';
import { playPopSound, speakInstruction } from '../shared/audio.js';

export function renderHome(app, navigate) {
  const stars = getSubAppStars('sight');
  const completion = getSightCompletionPercent();

  app.innerHTML = `
    <div class="screen home-screen" id="home">
      <div class="home-decorations">
        <span class="home-deco" style="--i:0">⭐</span>
        <span class="home-deco" style="--i:1">📖</span>
        <span class="home-deco" style="--i:2">✨</span>
        <span class="home-deco" style="--i:3">🌟</span>
        <span class="home-deco" style="--i:4">💫</span>
      </div>

      <!-- Hub back button -->
      <div class="home-back-area">
        <button class="back-btn" id="sight-hub-back">🌈</button>
      </div>

      <div class="home-header">
        <div class="home-stars">
          <span class="star-icon">⭐</span>
          <span>${stars}</span>
        </div>
      </div>

      <!-- Animated star logo -->
      <div class="home-logo">
        <span class="home-logo-star">⭐</span>
      </div>
      <div class="home-subtitle-emojis">📖 ✏️ 📚</div>

      <div class="home-progress">
        <div class="progress-ring">
          <svg viewBox="0 0 100 100">
            <circle class="progress-ring-bg" cx="50" cy="50" r="42" />
            <circle class="progress-ring-fill" cx="50" cy="50" r="42"
              style="stroke-dasharray: ${completion * 2.64} 264" />
          </svg>
          <span class="progress-ring-icon">⭐</span>
        </div>
      </div>

      <div class="home-nav">
        <button class="home-nav-btn flashcard-btn" data-screen="flashcards">
          <span class="home-nav-icon">🃏</span>
          <div class="tap-hint" id="tap-hint-1">
            <span class="tap-hand">👆</span>
          </div>
        </button>
        <button class="home-nav-btn match-btn" data-screen="match">
          <span class="home-nav-icon">🔗</span>
        </button>
        <button class="home-nav-btn stories-btn" data-screen="stories">
          <span class="home-nav-icon">📖</span>
        </button>
      </div>
    </div>
  `;

  setTimeout(() => speakInstruction('welcome'), 1000);

  // Hub back button
  document.getElementById('sight-hub-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    navigate('hub');
  });

  app.querySelectorAll('.home-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playPopSound();
      btn.style.transform = 'scale(0.88)';
      setTimeout(() => {
        window.speechSynthesis?.cancel();
        navigate(btn.dataset.screen);
      }, 150);
    });
  });

  app.addEventListener('click', () => {
    const hint = document.getElementById('tap-hint-1');
    if (hint) hint.remove();
  }, { once: true });
}

export function injectHomeStyles() {
  if (document.getElementById('sight-home-styles')) return;
  const style = document.createElement('style');
  style.id = 'sight-home-styles';
  style.textContent = `
    .home-screen {
      background: linear-gradient(160deg, #FFFDE7 0%, #FFF9C4 50%, #FFF59D 100%);
      align-items: center; justify-content: center;
      gap: var(--space-xl); padding: var(--space-xl); overflow: hidden;
    }
    .home-back-area {
      position: absolute;
      top: var(--space-lg);
      left: var(--space-xl);
      z-index: 10;
    }
    .home-decorations { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .home-deco { position: absolute; font-size: 2rem; opacity: 0.15; animation: float 4s ease-in-out infinite; animation-delay: calc(var(--i) * 0.8s); }
    .home-deco:nth-child(1) { top: 8%; left: 10%; }
    .home-deco:nth-child(2) { top: 12%; right: 15%; }
    .home-deco:nth-child(3) { bottom: 20%; left: 8%; }
    .home-deco:nth-child(4) { bottom: 15%; right: 10%; }
    .home-deco:nth-child(5) { top: 45%; right: 5%; }

    .home-header { position: absolute; top: var(--space-lg); right: var(--space-xl); }
    .home-stars { display: flex; align-items: center; gap: var(--space-xs); background: var(--color-surface); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-full); box-shadow: var(--shadow-md); font-family: var(--font-display); font-weight: 700; font-size: var(--text-lg); color: #FFB300; }

    .home-logo { z-index: 1; }
    .home-logo-star { font-size: 5rem; animation: pulse 2s ease-in-out infinite; display: block; filter: drop-shadow(0 4px 12px rgba(255,179,0,0.4)); }
    .home-subtitle-emojis { font-size: var(--text-2xl); z-index: 1; animation: float 3s ease-in-out infinite; letter-spacing: 12px; }

    .home-progress { z-index: 1; }
    .progress-ring { position: relative; width: 80px; height: 80px; }
    .progress-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .progress-ring-bg { fill: none; stroke: rgba(0,0,0,0.06); stroke-width: 6; }
    .progress-ring-fill { fill: none; stroke: #FFB300; stroke-width: 6; stroke-linecap: round; transition: stroke-dasharray 1s ease; }
    .progress-ring-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }

    .home-nav { display: flex; gap: var(--space-2xl); z-index: 1; justify-content: center; }
    .home-nav-btn { width: 140px; height: 140px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-xl); transition: transform var(--transition-bounce), box-shadow var(--transition-base); position: relative; animation: pulse 3s ease-in-out infinite; }
    .home-nav-btn:active { box-shadow: var(--shadow-sm); }
    .flashcard-btn { background: linear-gradient(135deg, #FFB300 0%, #FF8F00 100%); }
    .match-btn { background: linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%); }
    .stories-btn { background: linear-gradient(135deg, #00BCD4 0%, #00ACC1 100%); }
    .home-nav-icon { font-size: 3.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }

    .tap-hint { position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%); animation: tapBounce 1.2s ease-in-out infinite; z-index: 5; pointer-events: none; }
    .tap-hand { font-size: 2rem; }

    @media (max-aspect-ratio: 1/1) {
      .home-nav { gap: var(--space-lg); }
      .home-nav-btn { width: 120px; height: 120px; }
      .home-nav-icon { font-size: 3rem; }
    }
  `;
  document.head.appendChild(style);
}
