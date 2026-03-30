/**
 * Home Screen — Word Builder Lab
 * Nav: Spell, Match, Blend, Daily Challenge
 */
import { getSubAppStars, getStreak, getWordBuilderCompletionPercent, isDailyCompleted } from '../shared/storage.js';
import { playPopSound, speakInstruction } from '../shared/audio.js';

export function renderHome(app, navigate) {
  const stars = getSubAppStars('wordBuilder');
  const streak = getStreak();
  const completion = getWordBuilderCompletionPercent();
  const dailyDone = isDailyCompleted();

  app.innerHTML = `
    <div class="screen home-screen" id="home">
      <div class="home-decorations">
        <span class="home-deco" style="--i:0">🔬</span>
        <span class="home-deco" style="--i:1">🧪</span>
        <span class="home-deco" style="--i:2">⚗️</span>
        <span class="home-deco" style="--i:3">🧬</span>
        <span class="home-deco" style="--i:4">✨</span>
      </div>

      <!-- Hub back button -->
      <div class="home-back-area">
        <button class="back-btn" id="wb-hub-back">🌈</button>
      </div>

      <div class="home-header">
        <div class="home-badge">
          <span>⭐ ${stars}</span>
        </div>
        <div class="home-badge streak-badge">
          <span>🔥 ${streak}</span>
        </div>
      </div>

      <div class="home-logo">
        <span class="home-logo-icon">🧪</span>
      </div>
      <div class="home-subtitle">✏️ 📖 🔊</div>

      <div class="home-progress">
        <div class="progress-ring">
          <svg viewBox="0 0 100 100">
            <circle class="progress-ring-bg" cx="50" cy="50" r="42" />
            <circle class="progress-ring-fill" cx="50" cy="50" r="42"
              style="stroke-dasharray: ${completion * 2.64} 264" />
          </svg>
          <span class="progress-ring-icon">🧪</span>
        </div>
      </div>

      <div class="home-nav">
        <button class="home-nav-btn spell-btn" data-screen="spell">
          <span class="home-nav-icon">✏️</span>
        </button>
        <button class="home-nav-btn match-btn" data-screen="picmatch">
          <span class="home-nav-icon">🖼️</span>
        </button>
        <button class="home-nav-btn blend-btn" data-screen="blend">
          <span class="home-nav-icon">🔊</span>
        </button>
        <button class="home-nav-btn daily-btn ${dailyDone ? 'completed' : 'pulse-ring'}" data-screen="daily">
          <span class="home-nav-icon">${dailyDone ? '✅' : '🌟'}</span>
        </button>
      </div>
    </div>
  `;

  setTimeout(() => speakInstruction('welcome'), 1000);

  // Hub back button
  document.getElementById('wb-hub-back').addEventListener('click', () => {
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
}

export function injectHomeStyles() {
  if (document.getElementById('wb-home-styles')) return;
  const style = document.createElement('style');
  style.id = 'wb-home-styles';
  style.textContent = `
    .home-screen {
      background: linear-gradient(160deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%);
      align-items: center; justify-content: center;
      gap: var(--space-lg); padding: var(--space-xl); overflow: hidden;
    }
    .home-back-area {
      position: absolute;
      top: var(--space-lg);
      left: var(--space-xl);
      z-index: 10;
    }
    .home-decorations { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .home-deco { position: absolute; font-size: 2rem; opacity: 0.12; animation: float 4s ease-in-out infinite; animation-delay: calc(var(--i) * 0.8s); }
    .home-deco:nth-child(1) { top: 8%; left: 10%; }
    .home-deco:nth-child(2) { top: 14%; right: 12%; }
    .home-deco:nth-child(3) { bottom: 22%; left: 6%; }
    .home-deco:nth-child(4) { bottom: 12%; right: 8%; }
    .home-deco:nth-child(5) { top: 40%; right: 5%; }

    .home-header { position: absolute; top: var(--space-lg); right: var(--space-lg); display: flex; gap: var(--space-sm); }
    .home-badge { background: var(--color-surface); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-full); box-shadow: var(--shadow-md); font-family: var(--font-display); font-weight: 700; font-size: var(--text-lg); color: var(--color-primary); }
    .streak-badge { color: #FF6B6B; }

    .home-logo { z-index: 1; }
    .home-logo-icon { font-size: 5rem; display: block; animation: bounce 2s ease-in-out infinite; filter: drop-shadow(0 4px 12px rgba(46,125,50,0.3)); }
    .home-subtitle { font-size: var(--text-2xl); z-index: 1; animation: float 3s ease-in-out infinite; letter-spacing: 12px; }

    .home-progress { z-index: 1; }
    .progress-ring { position: relative; width: 80px; height: 80px; }
    .progress-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .progress-ring-bg { fill: none; stroke: rgba(0,0,0,0.06); stroke-width: 6; }
    .progress-ring-fill { fill: none; stroke: var(--color-primary); stroke-width: 6; stroke-linecap: round; transition: stroke-dasharray 1s ease; }
    .progress-ring-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }

    .home-nav { display: flex; gap: var(--space-lg); z-index: 1; flex-wrap: wrap; justify-content: center; }
    .home-nav-btn {
      width: 110px; height: 110px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: var(--shadow-xl); transition: transform var(--transition-bounce); position: relative;
    }
    .home-nav-btn:active { box-shadow: var(--shadow-sm); }
    .spell-btn { background: linear-gradient(135deg, #2E7D32, #1B5E20); }
    .match-btn { background: linear-gradient(135deg, #7C4DFF, #651FFF); }
    .blend-btn { background: linear-gradient(135deg, #FF6B6B, #E53E3E); }
    .daily-btn { background: linear-gradient(135deg, #FFB300, #FF8F00); }
    .daily-btn.completed { background: linear-gradient(135deg, #66BB6A, #4CAF50); }
    .pulse-ring { animation: pulse 2s ease-in-out infinite; }
    .home-nav-icon { font-size: 3rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }

    @media (max-aspect-ratio: 1/1) {
      .home-nav-btn { width: 90px; height: 90px; }
      .home-nav-icon { font-size: 2.5rem; }
    }
  `;
  document.head.appendChild(style);
}
