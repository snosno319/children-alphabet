/**
 * Home Screen — icon-only, voice-guided, no text readable by child needed.
 * Auto-speaks "Hi! Tap a picture to play!" on entry.
 * Buttons are icon-only with pulsing tap hints.
 */
import { getSubAppStars, getAlphabetCompletionPercent } from '../shared/storage.js';
import { playPopSound, speakInstruction } from '../shared/audio.js';

export function renderHome(app, navigate) {
  const stars = getSubAppStars('alphabet');
  const completion = getAlphabetCompletionPercent();

  app.innerHTML = `
    <div class="screen home-screen" id="home">
      <!-- Floating decorations -->
      <div class="home-decorations">
        <span class="home-deco" style="--i:0">🅰️</span>
        <span class="home-deco" style="--i:1">🌟</span>
        <span class="home-deco" style="--i:2">📚</span>
        <span class="home-deco" style="--i:3">✏️</span>
        <span class="home-deco" style="--i:4">🎨</span>
      </div>

      <!-- Hub back button (top left) -->
      <div class="home-back-area">
        <button class="back-btn" id="alpha-hub-back">🌈</button>
      </div>

      <!-- Star counter (top right) — just emoji + number, universally understood -->
      <div class="home-header">
        <div class="home-stars">
          <span class="star-icon">⭐</span>
          <span>${stars}</span>
        </div>
      </div>

      <!-- Animated ABC logo — visual only, no reading needed -->
      <div class="home-logo">
        <span class="home-logo-letter" style="--d:0">A</span>
        <span class="home-logo-letter" style="--d:1">B</span>
        <span class="home-logo-letter" style="--d:2">C</span>
      </div>

      <!-- Progress Ring — visual only, no % text -->
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

      <!-- Navigation cards -->
      <div class="home-nav">
        <button class="home-nav-btn explore-btn" data-screen="explore">
          <span class="home-nav-icon">📖</span>
          <span class="home-nav-label">Explore</span>
          <div class="tap-hint" id="tap-hint-1">
            <span class="tap-hand">👆</span>
          </div>
        </button>
        <button class="home-nav-btn trace-btn" data-screen="trace">
          <span class="home-nav-icon">✏️</span>
          <span class="home-nav-label">Trace</span>
        </button>
        <button class="home-nav-btn quiz-btn" data-screen="quiz">
          <span class="home-nav-icon">🧩</span>
          <span class="home-nav-label">Quiz</span>
        </button>
      </div>
    </div>
  `;

  // Auto-speak welcome — gentle delay so child settles in
  setTimeout(() => {
    speakInstruction('welcome');
  }, 1000);

  // Hub back button
  document.getElementById('alpha-hub-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    navigate('hub');
  });

  // Button handlers
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

  // Remove tap hint after first interaction
  app.addEventListener('click', () => {
    const hint = document.getElementById('tap-hint-1');
    if (hint) hint.remove();
  }, { once: true });
}

/**
 * Home screen styles (injected once)
 */
export function injectHomeStyles() {
  if (document.getElementById('alpha-home-styles')) return;
  const style = document.createElement('style');
  style.id = 'alpha-home-styles';
  style.textContent = `
    .home-screen {
      background: linear-gradient(160deg, #FFF8F0 0%, #FFE8D6 50%, #FFDDC1 100%);
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

    /* Animated ABC logo — bouncing colored letters */
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
    .home-logo-letter:nth-child(1) { color: #FF6B6B; }
    .home-logo-letter:nth-child(2) { color: #4ECDC4; }
    .home-logo-letter:nth-child(3) { color: #A78BFA; }

    /* Progress Ring — emoji center, no text */
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

    /* Navigation cards */
    .home-nav {
      display: flex;
      gap: var(--space-lg);
      z-index: 1;
      justify-content: center;
    }
    .home-nav-btn {
      width: 110px;
      padding: var(--space-lg) var(--space-sm) var(--space-md);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      box-shadow: 0 6px 0 rgba(0,0,0,0.2), var(--shadow-lg);
      transition: transform var(--transition-bounce), box-shadow 0.15s;
      position: relative;
    }
    .home-nav-btn:active {
      transform: translateY(4px);
      box-shadow: 0 2px 0 rgba(0,0,0,0.15), var(--shadow-sm);
    }
    .explore-btn {
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8A65 100%);
    }
    .trace-btn {
      background: linear-gradient(135deg, #4ECDC4 0%, #44B09E 100%);
    }
    .quiz-btn {
      background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
    }
    .home-nav-icon {
      font-size: 3.5rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }

    /* Tap hint — bouncing hand pointer */
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
    @keyframes tapBounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-12px); }
    }

    /* Portrait */
    @media (max-aspect-ratio: 1/1) {
      .home-nav { gap: var(--space-md); }
      .home-nav-btn { width: 105px; }
      .home-nav-icon { font-size: 2.8rem; }
      .home-logo-letter { font-size: var(--text-4xl); }
    }
  `;
  document.head.appendChild(style);
}
