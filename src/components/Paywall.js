import { SubscriptionService } from '../services/subscription.js';
import { playPopSound } from '../shared/audio.js';

export function renderPaywall(app, navigate, onClose) {
    // If onClose is provided, it's a dismissible modal (e.g. from Hub)
    // If not, it's a blocking screen (expired trial)
    const isBlocking = !onClose;

    app.innerHTML = `
    <div class="screen paywall-screen">
      <div class="paywall-content">
        <div class="paywall-header">
          <div class="paywall-icon">🌟</div>
          <h1>Unlock English Adventure</h1>
        </div>

        <div class="paywall-features">
          <div class="feature-item">
            <span class="feature-icon">🔊</span>
            <span class="feature-text">Unlimited Phonics Lab</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎵</span>
            <span class="feature-text">All Rhyme Time Games</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📚</span>
            <span class="feature-text">Sight Words & Stories</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🚫</span>
            <span class="feature-text">Ad-Free Experience</span>
          </div>
        </div>

        <div class="paywall-offer">
          <div class="trial-badge">1 Month Free Trial</div>
          <p class="price-text">Then $2.00 / month</p>
          <p class="cancel-text">Cancel anytime in store settings.</p>
        </div>

        <button class="subscribe-btn" id="pw-subscribe">
          Start Free Trial
        </button>

        <button class="restore-btn" id="pw-restore">
          Restore Purchases
        </button>

        ${!isBlocking ? `<button class="close-btn" id="pw-close">Maybe Later</button>` : ''}
        
        <p class="terms-link">Privacy Policy • Terms of Service</p>
      </div>
    </div>
  `;

    document.getElementById('pw-subscribe').addEventListener('click', async () => {
        playPopSound();
        const btn = document.getElementById('pw-subscribe');
        btn.textContent = 'Contacting Store...';
        btn.disabled = true;

        try {
            const success = await SubscriptionService.purchase();
            if (success) {
                alert('Welcome to Pro!');
                if (onClose) onClose();
                else navigate('hub');
            } else {
                btn.textContent = 'Start Free Trial';
                btn.disabled = false;
            }
        } catch (e) {
            alert('Purchase Failed: ' + e.message);
            btn.textContent = 'Start Free Trial';
            btn.disabled = false;
        }
    });

    document.getElementById('pw-restore').addEventListener('click', async () => {
        playPopSound();
        try {
            const isPro = await SubscriptionService.restore();
            if (isPro) {
                alert('Purchases Restored!');
                if (onClose) onClose();
                else navigate('hub');
            } else {
                alert('No active subscription found.');
            }
        } catch (e) {
            alert('Restore Failed: ' + e.message);
        }
    });

    if (!isBlocking) {
        document.getElementById('pw-close').addEventListener('click', () => {
            playPopSound();
            onClose();
        });
    }
}

export function injectPaywallStyles() {
    if (document.getElementById('pw-styles')) return;
    const style = document.createElement('style');
    style.id = 'pw-styles';
    style.textContent = `
    .paywall-screen {
      background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-md);
    }

    .paywall-content {
      background: white;
      border-radius: 32px;
      padding: var(--space-xl);
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-lg);
    }

    .paywall-icon { font-size: 4rem; margin-bottom: -10px; }
    h1 { font-family: var(--font-display); font-size: 2rem; color: #333; margin: 0; }

    .paywall-features {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      align-items: flex-start;
      width: 100%;
      background: #F8F9FA;
      padding: var(--space-md);
      border-radius: 16px;
    }

    .feature-item { display: flex; align-items: center; gap: var(--space-md); font-size: 1.1rem; color: #555; }
    .feature-icon { font-size: 1.5rem; }

    .paywall-offer { margin-top: var(--space-sm); }
    .trial-badge {
      background: #FFD54F;
      color: #333;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 12px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .price-text { font-size: 1.2rem; font-weight: 700; color: #333; margin: 0; }
    .cancel-text { font-size: 0.9rem; color: #777; margin: 4px 0 0 0; }

    .subscribe-btn {
      width: 100%;
      background: #4CAF50;
      color: white;
      border: none;
      padding: 16px;
      border-radius: 16px;
      font-size: 1.3rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 0 #388E3C;
      transition: transform 0.1s;
    }
    .subscribe-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #388E3C; }

    .restore-btn {
      background: transparent;
      border: none;
      color: #666;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }

    .close-btn {
      background: #EEEEEE;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      color: #666;
      font-weight: 600;
      cursor: pointer;
    }

    .terms-link { font-size: 0.8rem; color: #AAA; margin-top: var(--space-sm); }
  `;
    document.head.appendChild(style);
}
