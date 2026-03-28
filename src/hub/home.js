/**
 * Hub Home Screen — English Adventure
 * A vibrant 2×2 grid of sub-app cards for 4-year-olds.
 * Each card shows the sub-app icon, star count, and a friendly color.
 */
import { getTotalStars, getSubAppStars } from '../shared/storage.js';
import { playPopSound, speakInstruction } from '../shared/audio.js';
import { renderPaywall, injectPaywallStyles } from '../components/Paywall.js';
import { SubscriptionService } from '../services/subscription.js';
import { startJourney, getJourneyState } from '../shared/journey.js';

const SUB_APPS = [
  {
    id: 'alphabet',
    icon: '🔤',
    emoji: '🅰️',
    bg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8A65 100%)',
    label: 'ABCs',
  },
  {
    id: 'cvc',
    icon: '🧩',
    emoji: '📖',
    bg: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)',
    label: 'Words',
  },
  {
    id: 'sight',
    icon: '⭐',
    emoji: '👀',
    bg: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)',
    label: 'Reading',
  },
  {
    id: 'wordBuilder',
    icon: '🧪',
    emoji: '✏️',
    bg: 'linear-gradient(135deg, #66BB6A 0%, #2E7D32 100%)',
    label: 'Spelling',
  },
  {
    id: 'phonics',
    icon: '🔊',
    emoji: '👂',
    bg: 'linear-gradient(135deg, #EF5350 0%, #D32F2F 100%)',
    label: 'Phonics',
  },
  {
    id: 'rhyme',
    icon: '🎵',
    emoji: '🎤',
    bg: 'linear-gradient(135deg, #AB47BC 0%, #7B1FA2 100%)',
    label: 'Rhyme',
  },
];

export function renderHub(app, navigate) {
  const totalStars = getTotalStars();

  app.innerHTML = `
    <div class="screen hub-screen" id="hub">
      <!-- Floating decorations -->
      <div class="hub-decorations">
        <span class="hub-deco" style="--i:0">🌈</span>
        <span class="hub-deco" style="--i:1">⭐</span>
        <span class="hub-deco" style="--i:2">🎈</span>
        <span class="hub-deco" style="--i:3">🦋</span>
        <span class="hub-deco" style="--i:4">🌟</span>
        <span class="hub-deco" style="--i:5">✨</span>
      </div>

      <!-- Star counter -->
      <div class="hub-header">
        <div class="hub-actions">
           <button class="upgrade-btn" id="hub-parents" style="background: linear-gradient(135deg, #94A3B8 0%, #64748B 100%); color: white; box-shadow: 0 4px 0 #475569;">
             <span class="upgrade-icon">📊</span>
             <span>Parents</span>
           </button>
           ${!SubscriptionService.isPro ? `
            <button class="upgrade-btn" id="hub-upgrade">
              <span class="upgrade-icon">👑</span>
              <span>Get Pro</span>
            </button>
          ` : ''}
          <div class="hub-stars">
            <span class="star-icon">⭐</span>
            <span>${totalStars}</span>
          </div>
        </div>
      </div>

      <!-- Logo -->
      <div class="hub-logo">
        <span class="hub-logo-letter" style="--d:0; color:#FF6B6B">E</span>
        <span class="hub-logo-letter" style="--d:1; color:#42A5F5">n</span>
        <span class="hub-logo-letter" style="--d:2; color:#FFB300">g</span>
        <span class="hub-logo-letter" style="--d:3; color:#66BB6A">l</span>
        <span class="hub-logo-letter" style="--d:4; color:#A78BFA">i</span>
        <span class="hub-logo-letter" style="--d:5; color:#FF6B6B">s</span>
        <span class="hub-logo-letter" style="--d:6; color:#42A5F5">h</span>
      </div>

      <!-- [NEW] Journey Banner -->
      <button class="hub-journey-banner" id="hub-journey">
        <div class="journey-avatar">🧭</div>
        <div class="journey-text">
          <div class="journey-title">Play Journey</div>
          <div class="journey-subtitle">Guided A to Z Learning Path</div>
        </div>
        <div class="journey-play">▶</div>
      </button>

      <!-- Sub-app cards -->
      <div class="hub-grid">
        ${SUB_APPS.map((subApp, i) => `
          <button class="hub-card" data-app="${subApp.id}" style="--card-bg: ${subApp.bg}; animation-delay: ${i * 80}ms">
            <span class="hub-card-icon">${subApp.icon}</span>
            <span class="hub-card-emoji">${subApp.emoji}</span>
            <div class="hub-card-stars">⭐ ${getSubAppStars(subApp.id)}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Auto-speak welcome
  setTimeout(() => {
    speakInstruction('welcome');
  }, 800);

  // Journey handler
  const btnJourney = document.getElementById('hub-journey');
  if (btnJourney) {
    btnJourney.addEventListener('click', () => {
      playPopSound();
      window.speechSynthesis.cancel();
      // Animate compress
      btnJourney.style.transform = 'scale(0.95)';
      const state = getJourneyState();
      // Map global step "explore" to alphabet's "explore", etc.
      setTimeout(() => startJourney(navigate), 200);
    });
  }
  // Parents handler
  const btnParents = document.getElementById('hub-parents');
  if (btnParents) {
    btnParents.addEventListener('click', () => {
      playPopSound();
      window.speechSynthesis.cancel();
      navigate('parents');
    });
  }

  // Card handlers
  app.querySelectorAll('.hub-card').forEach(card => {
    card.addEventListener('click', () => {
      playPopSound();
      card.style.transform = 'scale(0.88)';
      setTimeout(() => {
        window.speechSynthesis.cancel();
        const appId = card.dataset.app;
        navigate(`${appId}-home`);
      }, 150);
    });
  });

  const upgradeBtn = document.getElementById('hub-upgrade');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      playPopSound();
      injectPaywallStyles();
      const modal = document.createElement('div');
      modal.id = 'paywall-modal';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.zIndex = '1000';
      document.body.appendChild(modal);

      renderPaywall(modal, navigate, () => {
        document.body.removeChild(modal);
        // Re-render hub to update button state
        renderHub(app, navigate);
      });
    });
  }
}

export function injectHubStyles() {
  if (document.getElementById('hub-styles')) return;
  const style = document.createElement('style');
  style.id = 'hub-styles';
  style.textContent = `
    .hub-screen {
      background: linear-gradient(160deg, #FFF8F0 0%, #F0E6FF 30%, #E0F0FF 60%, #F0FFF0 100%);
      align-items: center;
      justify-content: center;
      gap: var(--space-xl);
      padding: var(--space-xl);
      overflow: hidden;
    }

    .hub-decorations {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .hub-deco {
      position: absolute;
      font-size: 2rem;
      opacity: 0.10;
      animation: float 5s ease-in-out infinite;
      animation-delay: calc(var(--i) * 0.7s);
    }
    .hub-deco:nth-child(1) { top: 5%; left: 8%; }
    .hub-deco:nth-child(2) { top: 10%; right: 12%; }
    .hub-deco:nth-child(3) { bottom: 25%; left: 5%; }
    .hub-deco:nth-child(4) { bottom: 10%; right: 8%; }
    .hub-deco:nth-child(5) { top: 40%; right: 3%; }
    .hub-deco:nth-child(6) { top: 50%; left: 3%; }

    .hub-header {
      position: absolute;
      top: var(--space-lg);
      right: var(--space-xl);
      left: var(--space-xl); /* Full width for layout */
      display: flex;
      justify-content: flex-end; /* Align to right */
      pointer-events: none; /* Let clicks pass through container */
    }
    .hub-actions {
      display: flex;
      gap: var(--space-md);
      align-items: center;
      pointer-events: auto; /* Re-enable for buttons */
    }
    .upgrade-btn {
      background: linear-gradient(135deg, #FFD54F 0%, #FFB300 100%);
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-display);
      font-weight: 700;
      color: #333;
      box-shadow: 0 4px 0 #F57F17;
      cursor: pointer;
      transition: transform 0.1s;
    }
    .upgrade-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #F57F17; }
    .upgrade-icon { font-size: 1.2rem; }
    
    .hub-stars {
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
      color: #FFB300;
    }

    .hub-logo {
      display: flex;
      gap: 4px;
      z-index: 1;
    }
    .hub-logo-letter {
      font-family: var(--font-display);
      font-size: var(--text-4xl);
      font-weight: 900;
      animation: bounce 2.5s ease-in-out infinite;
      animation-delay: calc(var(--d) * 0.12s);
    }

    /* Journey Banner */
    .hub-journey-banner {
      width: 100%;
      max-width: 600px;
      background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
      border-radius: var(--radius-xl);
      padding: var(--space-lg) var(--space-xl);
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      border: none;
      box-shadow: 0 8px 32px rgba(59,130,246,0.3), 0 4px 0 #2563EB;
      cursor: pointer;
      z-index: 1;
      transition: transform var(--transition-bounce), box-shadow var(--transition-base);
    }
    .hub-journey-banner:active {
      transform: scale(0.98) translateY(4px);
      box-shadow: 0 4px 16px rgba(59,130,246,0.2), 0 0px 0 #2563EB;
    }
    .journey-avatar {
      font-size: 3.5rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
      animation: float 4s ease-in-out infinite;
    }
    .journey-text {
      flex: 1;
      text-align: left;
      display: flex;
      flex-direction: column;
    }
    .journey-title {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 900;
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .journey-subtitle {
      font-family: var(--font-body);
      font-size: 1.1rem;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
    }
    .journey-play {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: white;
      color: #3B82F6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: pulse 2s ease-in-out infinite;
    }

    .hub-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-lg);
      z-index: 1;
      max-width: 600px;
      width: 100%;
    }

    .hub-card {
      aspect-ratio: 1;
      border-radius: var(--radius-xl);
      background: var(--card-bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 4px 0 rgba(0,0,0,0.1);
      transition: transform var(--transition-bounce), box-shadow var(--transition-base);
      position: relative;
      animation: pop var(--transition-slow) backwards;
      cursor: pointer;
      border: none;
      min-height: 140px;
    }
    .hub-card:active {
      box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 2px 0 rgba(0,0,0,0.05);
      transform: scale(0.95) translateY(2px);
    }

    .hub-card-icon {
      font-size: 3rem;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2));
    }
    .hub-card-emoji {
      font-size: 1.5rem;
      opacity: 0.8;
    }
    .hub-card-stars {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1rem;
      color: rgba(255,255,255,0.9);
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    @media (max-width: 600px) {
      .hub-grid { grid-template-columns: repeat(2, 1fr); max-width: 360px; }
      .hub-card { min-height: 120px; }
      .hub-card-icon { font-size: 2.5rem; }
      .hub-logo-letter { font-size: var(--text-3xl); }
    }
  `;
  document.head.appendChild(style);
}
