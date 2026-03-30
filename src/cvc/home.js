/**
 * Home Screen — CVC Words Adventure
 * Icon-only, voice-guided, bouncing CVC logo.
 */
import { getSubAppStars, getCvcCompletionPercent } from '../shared/storage.js';
import { playPopSound, speakInstruction } from '../shared/audio.js';

export function renderHome(app, navigate) {
  const stars = getSubAppStars('cvc');
  const completion = getCvcCompletionPercent();

  app.innerHTML = `
    <div class="screen home-screen" id="home">
      <!-- Floating decorations -->
      <div class="home-decorations">
        <span class="home-deco" style="--i:0">🧩</span>
        <span class="home-deco" style="--i:1">🌟</span>
        <span class="home-deco" style="--i:2">📖</span>
        <span class="home-deco" style="--i:3">🔤</span>
        <span class="home-deco" style="--i:4">🎉</span>
      </div>

      <!-- Hub back button -->
      <div class="home-back-area">
        <button class="back-btn" id="cvc-hub-back">🌈</button>
      </div>

      <!-- Star counter -->
      <div class="home-header">
        <div class="home-stars">
          <span class="star-icon">⭐</span>
          <span>${stars}</span>
        </div>
      </div>

      <!-- Animated CVC logo -->
      <div class="home-logo">
        <span class="home-logo-letter" style="--d:0">C</span>
        <span class="home-logo-letter" style="--d:1">V</span>
        <span class="home-logo-letter" style="--d:2">C</span>
      </div>
      <div class="home-subtitle">🐱 🐶 🐷</div>

      <!-- Progress Ring -->
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

      <!-- Navigation — ICON ONLY -->
      <div class="home-nav">
        <button class="home-nav-btn explore-btn" data-screen="cvc-explore">
          <span class="home-nav-icon">📖</span>
          <div class="tap-hint" id="tap-hint-1">
            <span class="tap-hand">👆</span>
          </div>
        </button>
        <button class="home-nav-btn build-btn" data-screen="build">
          <span class="home-nav-icon">🧩</span>
        </button>
        <button class="home-nav-btn quiz-btn" data-screen="cvc-quiz">
          <span class="home-nav-icon">🎯</span>
        </button>
      </div>
    </div>
  `;

  setTimeout(() => {
    speakInstruction('welcome');
  }, 1000);

  // Hub back button
  document.getElementById('cvc-hub-back').addEventListener('click', () => {
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
  if (document.getElementById('cvc-home-styles')) return;
  const style = document.createElement('style');
  style.id = 'cvc-home-styles';
  style.textContent = `
    .home-screen {
      background: linear-gradient(160deg, #F0F8FF 0%, #E3F2FD 50%, #BBDEFB 100%);
      align-items: center;
      justify-content: center;
      gap: var(--space-xl);
      padding: var(--space-xl);
      overflow: hidden;
    }
    .home-back-area {
      position: absolute;
      top: var(--space-lg);
      left: var(--space-xl);
      z-index: 10;
    }

    .home-decorations {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .home-deco {
      position: absolute;
      font-size: 2rem;
      opacity: 0.12;
      animation: float 4s ease-in-out infinite;
      animation-delay: calc(var(--i) * 0.8s);
    }
    .home-deco:nth-child(1) { top: 8%; left: 10%; }
    .home-deco:nth-child(2) { top: 12%; right: 15%; }
    .home-deco:nth-child(3) { bottom: 20%; left: 8%; }
    .home-deco:nth-child(4) { bottom: 15%; right: 10%; }
    .home-deco:nth-child(5) { top: 45%; right: 5%; }

    .home-header {
      position: absolute;
      top: var(--space-lg);
      right: var(--space-xl);
    }
    .home-stars {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      background: var(--color-surface);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-md);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: var(--text-lg);
      color: var(--color-accent-yellow);
    }

    .home-logo {
      display: flex;
      gap: var(--space-md);
      z-index: 1;
    }
    .home-logo-letter {
      font-family: var(--font-display);
      font-size: var(--text-5xl);
      font-weight: 900;
      animation: bounce 2s ease-in-out infinite;
      animation-delay: calc(var(--d) * 0.2s);
    }
    .home-logo-letter:nth-child(1) { color: #4ECDC4; }
    .home-logo-letter:nth-child(2) { color: #A78BFA; }
    .home-logo-letter:nth-child(3) { color: #FF6B6B; }

    .home-subtitle {
      font-size: var(--text-2xl);
      z-index: 1;
      animation: float 3s ease-in-out infinite;
      letter-spacing: 8px;
    }

    .home-progress { z-index: 1; }
    .progress-ring {
      position: relative;
      width: 80px;
      height: 80px;
    }
    .progress-ring svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .progress-ring-bg {
      fill: none;
      stroke: rgba(0,0,0,0.06);
      stroke-width: 6;
    }
    .progress-ring-fill {
      fill: none;
      stroke: var(--color-secondary);
      stroke-width: 6;
      stroke-linecap: round;
      transition: stroke-dasharray 1s ease;
    }
    .progress-ring-icon {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .home-nav {
      display: flex;
      gap: var(--space-2xl);
      z-index: 1;
      justify-content: center;
    }
    .home-nav-btn {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-xl);
      transition: transform var(--transition-bounce), box-shadow var(--transition-base);
      position: relative;
      animation: pulse 3s ease-in-out infinite;
    }
    .home-nav-btn:active {
      box-shadow: var(--shadow-sm);
    }
    .explore-btn {
      background: linear-gradient(135deg, #4ECDC4 0%, #36B5AC 100%);
    }
    .build-btn {
      background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
    }
    .quiz-btn {
      background: linear-gradient(135deg, #FF6B6B 0%, #E84545 100%);
    }
    .home-nav-icon {
      font-size: 3.5rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }

    .tap-hint {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      animation: tapBounce 1.2s ease-in-out infinite;
      z-index: 5;
      pointer-events: none;
    }
    .tap-hand {
      font-size: 2rem;
    }

    @media (max-aspect-ratio: 1/1) {
      .home-nav { gap: var(--space-lg); }
      .home-nav-btn { width: 120px; height: 120px; }
      .home-nav-icon { font-size: 3rem; }
      .home-logo-letter { font-size: var(--text-4xl); }
    }
  `;
  document.head.appendChild(style);
}
