/**
 * Leo the Lion — Mascot Component
 *
 * A reusable floating character that appears in high-value moments:
 *   'hub'          — greeting on hub load (context-aware message)
 *   'badge_earned' — celebration alongside badge earn overlay
 *   'journey_done' — journey completion celebration
 *   'well_done'    — generic encouragement
 *
 * Pure CSS + emoji. No new audio assets.
 * Non-blocking — overlays existing screen without interrupting interaction.
 */

const LEO_MESSAGES = {
    hub_greeting: [
        "Hi! Ready to learn? 🌟",
        "Let's have fun today! 🎉",
        "You're a star learner! ⭐",
        "What shall we explore? 🤔",
        "I'm so happy to see you! 😊",
    ],
    hub_streak:   n  => `🔥 ${n} days in a row! Wow!`,
    hub_stars:    n  => `⭐ ${n} stars! You're amazing!`,
    badge_earned: ["New sticker! You rock! 🏆", "Collect them all! ✨", "A brand new badge! 🎊"],
    journey_done: ["Journey complete! Amazing! 🎊", "You did it! I'm so proud! 🌈", "What a great adventure! 🦁"],
    well_done:    ["Great job! Keep going! 💪", "You're getting better! 🌈", "I knew you could do it! ⭐"],
};

function pickMessage(key, data = {}) {
    if (key === 'hub') {
        if (data.streak >= 3) return LEO_MESSAGES.hub_streak(data.streak);
        if (data.totalStars >= 10) return LEO_MESSAGES.hub_stars(data.totalStars);
        const msgs = LEO_MESSAGES.hub_greeting;
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
    const msgs = LEO_MESSAGES[key] || LEO_MESSAGES.well_done;
    if (typeof msgs === 'function') return msgs(data);
    return msgs[Math.floor(Math.random() * msgs.length)];
}

let leoEl = null;
let dismissTimer = null;

/**
 * Show Leo with a context-specific message.
 * @param {string} context  'hub' | 'badge_earned' | 'journey_done' | 'well_done'
 * @param {object} data     { streak, totalStars }
 * @param {object} options  { duration: 4000, position: 'bottom-left'|'bottom-right' }
 */
export function showLeo(context, data = {}, options = {}) {
    injectMascotStyles();
    hideLeo(); // remove any existing Leo first

    const message  = pickMessage(context, data);
    const position = options.position || 'bottom-left';
    const duration = options.duration ?? 4000;

    const el = document.createElement('div');
    el.id = 'leo-mascot';
    el.className = `leo-mascot leo-pos-${position} ${context === 'badge_earned' ? 'leo-celebrate' : ''}`;
    el.innerHTML = `
        <div class="leo-bubble">${message}</div>
        <div class="leo-emoji">🦁</div>
    `;

    el.addEventListener('click', () => hideLeo());

    document.body.appendChild(el);
    leoEl = el;

    // Auto-dismiss
    if (duration > 0) {
        dismissTimer = setTimeout(hideLeo, duration);
    }
}

export function hideLeo() {
    clearTimeout(dismissTimer);
    if (!leoEl) return;

    leoEl.classList.add('leo-exit');
    const el = leoEl;
    leoEl = null;
    setTimeout(() => el.remove(), 350);
}

export function injectMascotStyles() {
    if (document.getElementById('mascot-styles')) return;
    const style = document.createElement('style');
    style.id = 'mascot-styles';
    style.textContent = `
        /* ── Leo container ── */
        .leo-mascot {
            position: fixed;
            z-index: 900;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            cursor: pointer;
            animation: leoSlideIn 400ms cubic-bezier(0.34,1.56,0.64,1) forwards;
            pointer-events: auto;
        }
        .leo-mascot.leo-exit {
            animation: leoSlideOut 300ms ease forwards;
        }

        /* Positions */
        .leo-pos-bottom-left  { bottom: 20px; left: 12px; }
        .leo-pos-bottom-right { bottom: 20px; right: 12px; align-items: flex-end; }

        /* ── Speech bubble ── */
        .leo-bubble {
            background: #fff;
            border-radius: 16px;
            padding: 10px 14px;
            font-family: var(--font-display, 'Nunito', sans-serif);
            font-size: 0.9rem;
            font-weight: 700;
            color: #1a1a2e;
            box-shadow: 0 4px 16px rgba(0,0,0,0.18);
            max-width: 200px;
            line-height: 1.35;
            position: relative;
        }
        /* Bubble tail pointing down toward Leo */
        .leo-pos-bottom-left  .leo-bubble::after,
        .leo-pos-bottom-right .leo-bubble::after {
            content: '';
            position: absolute;
            bottom: -10px; left: 20px;
            border: 6px solid transparent;
            border-top-color: #fff;
        }
        .leo-pos-bottom-right .leo-bubble::after {
            left: auto; right: 20px;
        }

        /* ── Leo emoji ── */
        .leo-emoji {
            font-size: 3rem;
            line-height: 1;
            animation: leoIdle 1.8s ease-in-out infinite;
            display: block;
            padding-left: 8px;
        }
        .leo-pos-bottom-right .leo-emoji { padding-left: 0; padding-right: 8px; }

        /* Celebrate variant — Leo jumps */
        .leo-celebrate .leo-emoji {
            animation: leoCelebrate 600ms cubic-bezier(0.34,1.56,0.64,1) forwards,
                       leoIdle 1.8s ease-in-out 0.65s infinite;
        }

        /* ── Animations ── */
        @keyframes leoSlideIn {
            from { opacity: 0; transform: translateX(-60px) scale(0.7); }
            to   { opacity: 1; transform: translateX(0)     scale(1);   }
        }
        @keyframes leoSlideOut {
            from { opacity: 1; transform: translateX(0)     scale(1);   }
            to   { opacity: 0; transform: translateX(-60px) scale(0.7); }
        }
        @keyframes leoIdle {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(-6px); }
        }
        @keyframes leoCelebrate {
            0%   { transform: translateY(0)    scale(1);    }
            30%  { transform: translateY(-24px) scale(1.15); }
            60%  { transform: translateY(-8px)  scale(0.95); }
            100% { transform: translateY(0)    scale(1);    }
        }

        /* Right-side slide in */
        .leo-pos-bottom-right {
            animation: leoSlideInRight 400ms cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .leo-pos-bottom-right.leo-exit {
            animation: leoSlideOutRight 300ms ease forwards;
        }
        @keyframes leoSlideInRight {
            from { opacity: 0; transform: translateX(60px) scale(0.7); }
            to   { opacity: 1; transform: translateX(0)    scale(1);   }
        }
        @keyframes leoSlideOutRight {
            from { opacity: 1; transform: translateX(0)    scale(1);   }
            to   { opacity: 0; transform: translateX(60px) scale(0.7); }
        }
    `;
    document.head.appendChild(style);
}
