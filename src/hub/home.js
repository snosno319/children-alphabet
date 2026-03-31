/**
 * Hub Home Screen — English Adventure
 * Entry point for all sub-apps. Shows profile, streak, and 6 colorful app cards.
 */
import {
    getTotalStars, getSubAppStars, getActiveProfile, getStreak,
    getAlphabetCompletionPercent, getCvcCompletionPercent,
    getSightCompletionPercent, getWordBuilderCompletionPercent,
    getPhonicsStats, getRhymeStats, getEarnedBadges, getNumbersCompletionPercent,
} from '../shared/storage.js';
import { checkAndAwardBadges } from '../shared/badges.js';
import { showLeo, hideLeo } from '../shared/mascot.js';
import { playPopSound, speakInstruction } from '../shared/audio.js';
import { startJourney, getJourneyState } from '../shared/journey.js';

const SUB_APPS = [
    {
        id: 'alphabet',
        icon: '🔤',
        mascot: '🦁',
        bg: 'linear-gradient(145deg, #FF6B6B 0%, #FF8A65 100%)',
        shadow: '#D94F4F',
        label: 'ABCs',
        getCompletion: getAlphabetCompletionPercent,
    },
    {
        id: 'cvc',
        icon: '📖',
        mascot: '🐬',
        bg: 'linear-gradient(145deg, #42A5F5 0%, #1E88E5 100%)',
        shadow: '#1565C0',
        label: 'Words',
        getCompletion: getCvcCompletionPercent,
    },
    {
        id: 'sight',
        icon: '👀',
        mascot: '🦉',
        bg: 'linear-gradient(145deg, #FFB300 0%, #FF8F00 100%)',
        shadow: '#E65100',
        label: 'Reading',
        getCompletion: getSightCompletionPercent,
    },
    {
        id: 'wordBuilder',
        icon: '✏️',
        mascot: '🐸',
        bg: 'linear-gradient(145deg, #66BB6A 0%, #2E7D32 100%)',
        shadow: '#1B5E20',
        label: 'Spelling',
        getCompletion: getWordBuilderCompletionPercent,
    },
    {
        id: 'phonics',
        icon: '👂',
        mascot: '🐧',
        bg: 'linear-gradient(145deg, #EF5350 0%, #C62828 100%)',
        shadow: '#7F0000',
        label: 'Phonics',
        getCompletion: () => {
            const s = getPhonicsStats();
            if (!s.totalAttempts) return 0;
            return Math.round((s.totalCorrect / s.totalAttempts) * 100);
        },
    },
    {
        id: 'rhyme',
        icon: '🎵',
        mascot: '🦜',
        bg: 'linear-gradient(145deg, #AB47BC 0%, #6A1B9A 100%)',
        shadow: '#4A148C',
        label: 'Rhymes',
        getCompletion: () => {
            const s = getRhymeStats();
            if (!s.totalAttempts) return 0;
            return Math.round((s.totalCorrect / s.totalAttempts) * 100);
        },
    },
    {
        id: 'numbers',
        icon: '🔢',
        mascot: '🦁',
        bg: 'linear-gradient(145deg, #FF7043 0%, #FF8A65 100%)',
        shadow: '#BF360C',
        label: 'Numbers',
        getCompletion: getNumbersCompletionPercent,
    },
];

export function renderHub(app, navigate) {
    const totalStars = getTotalStars();
    const profile = getActiveProfile();
    const streak = getStreak();
    const badgeCount = getEarnedBadges().length;
    const journeyState = getJourneyState();
    const journeyStep = journeyState?.currentStep ?? 0;
    const journeyTotal = 26 * 3; // rough total journey steps

    app.innerHTML = `
        <div class="screen hub-screen" id="hub">
            <!-- Floating background bubbles -->
            <div class="hub-bubbles" aria-hidden="true">
                <div class="hub-bubble" style="--s:80px;--x:8%;--y:12%;--d:0s;--c:#FF6B6B22"></div>
                <div class="hub-bubble" style="--s:60px;--x:85%;--y:8%;--d:1.2s;--c:#42A5F522"></div>
                <div class="hub-bubble" style="--s:100px;--x:5%;--y:65%;--d:2s;--c:#A78BFA22"></div>
                <div class="hub-bubble" style="--s:70px;--x:80%;--y:70%;--d:0.6s;--c:#4ECDC422"></div>
                <div class="hub-bubble" style="--s:50px;--x:45%;--y:5%;--d:1.8s;--c:#FFB30022"></div>
                <div class="hub-bubble" style="--s:90px;--x:90%;--y:45%;--d:3s;--c:#F472B622"></div>
            </div>

            <!-- Top bar: profile + stars -->
            <div class="hub-topbar">
                <div class="hub-profile-chip">
                    <span class="hub-profile-avatar">${profile?.avatar ?? '🌟'}</span>
                    <span class="hub-profile-name">${profile?.name ?? 'Player'}</span>
                </div>
                <div class="hub-topbar-right">
                    ${streak >= 2 ? `<div class="hub-streak-badge">🔥 ${streak}</div>` : ''}
                    <div class="hub-stars-badge">⭐ ${totalStars}</div>
                    <button class="hub-badges-btn" id="hub-badges" title="My Stickers">🏆 ${badgeCount}</button>
                    <button class="hub-parents-btn" id="hub-parents" title="Parents">📊</button>
                </div>
            </div>

            <!-- Logo -->
            <div class="hub-logo" aria-label="English Adventure">
                ${['E','n','g','l','i','s','h'].map((c, i) => `<span class="hub-logo-letter" style="--d:${i};color:${['#FF6B6B','#42A5F5','#FFB300','#66BB6A','#A78BFA','#FF6B6B','#42A5F5'][i]}">${c}</span>`).join('')}
            </div>

            <!-- Journey banner -->
            <button class="hub-journey-banner" id="hub-journey">
                <div class="journey-avatar">🧭</div>
                <div class="journey-text">
                    <div class="journey-title">Play Journey</div>
                    <div class="journey-subtitle">Guided A to Z Adventure</div>
                </div>
                <div class="journey-right">
                    ${journeyStep > 0 ? `<div class="journey-progress-pill">${journeyStep}/${journeyTotal}</div>` : ''}
                    <div class="journey-play">▶</div>
                </div>
            </button>

            <!-- Sub-app grid -->
            <div class="hub-grid">
                ${SUB_APPS.map((s, i) => {
                    const pct = s.getCompletion();
                    const stars = getSubAppStars(s.id);
                    return `
                    <button class="hub-card" data-app="${s.id}"
                        style="--card-bg:${s.bg};--card-shadow:${s.shadow};animation-delay:${i * 70}ms">
                        <div class="hub-card-mascot">${s.mascot}</div>
                        <div class="hub-card-icon">${s.icon}</div>
                        <div class="hub-card-label">${s.label}</div>
                        ${pct > 0 ? `<div class="hub-card-progress-bar"><div class="hub-card-progress-fill" style="width:${pct}%"></div></div>` : ''}
                        ${stars > 0 ? `<div class="hub-card-stars">⭐${stars}</div>` : ''}
                    </button>`;
                }).join('')}
            </div>
        </div>
    `;

    // Auto-speak welcome
    setTimeout(() => speakInstruction('welcome'), 800);

    // Leo mascot — appears after welcome settles
    setTimeout(() => showLeo('hub', { streak, totalStars }), 1400);

    // Journey
    document.getElementById('hub-journey').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        document.getElementById('hub-journey').style.transform = 'scale(0.96)';
        setTimeout(() => startJourney(navigate), 200);
    });

    // Badges
    document.getElementById('hub-badges').addEventListener('click', () => {
        playPopSound();
        hideLeo();
        navigate('badges');
    });

    // Parents
    document.getElementById('hub-parents').addEventListener('click', () => {
        playPopSound();
        hideLeo();
        window.speechSynthesis?.cancel();
        navigate('parents');
    });

    // Check for retroactively earned badges on app load
    checkAndAwardBadges(navigate);

    // Sub-app cards
    app.querySelectorAll('.hub-card').forEach(card => {
        card.addEventListener('click', () => {
            playPopSound();
            hideLeo();
            card.style.transform = 'scale(0.88)';
            setTimeout(() => {
                window.speechSynthesis?.cancel();
                navigate(`${card.dataset.app}-home`);
            }, 150);
        });
    });
}

export function injectHubStyles() {
    if (document.getElementById('hub-styles')) return;
    const style = document.createElement('style');
    style.id = 'hub-styles';
    style.textContent = `
        .hub-screen {
            background: linear-gradient(160deg, #FFF8F0 0%, #F0E6FF 35%, #E0F0FF 65%, #F0FFF0 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md) var(--space-lg) var(--space-lg);
            overflow: hidden;
        }

        /* Animated background bubbles */
        .hub-bubbles {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
        }
        .hub-bubble {
            position: absolute;
            width: var(--s);
            height: var(--s);
            left: var(--x);
            top: var(--y);
            border-radius: 50%;
            background: var(--c);
            animation: float 6s ease-in-out infinite;
            animation-delay: var(--d);
        }

        /* Top bar */
        .hub-topbar {
            width: 100%;
            max-width: 640px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 2;
            padding-top: env(safe-area-inset-top, 0px);
        }
        .hub-profile-chip {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(8px);
            padding: 6px 14px 6px 8px;
            border-radius: var(--radius-full);
            box-shadow: var(--shadow-md);
        }
        .hub-profile-avatar { font-size: 1.6rem; line-height: 1; }
        .hub-profile-name {
            font-family: var(--font-display);
            font-weight: 700;
            font-size: var(--text-base);
            color: var(--color-text);
            max-width: 90px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .hub-topbar-right { display: flex; align-items: center; gap: var(--space-sm); }

        .hub-streak-badge {
            background: linear-gradient(135deg, #FF9500, #FF6B00);
            color: white;
            font-family: var(--font-display);
            font-weight: 800;
            font-size: var(--text-base);
            padding: 6px 12px;
            border-radius: var(--radius-full);
            box-shadow: 0 3px 0 #CC5200;
            animation: pulse 2s ease-in-out infinite;
        }
        .hub-stars-badge {
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(8px);
            font-family: var(--font-display);
            font-weight: 800;
            font-size: var(--text-base);
            color: #E8900A;
            padding: 6px 12px;
            border-radius: var(--radius-full);
            box-shadow: var(--shadow-md);
        }
        .hub-badges-btn {
            height: 36px; padding: 0 12px;
            border-radius: 18px;
            background: linear-gradient(135deg, #A78BFA, #7C3AED);
            color: #fff;
            font-family: var(--font-display); font-size: 0.9rem; font-weight: 800;
            display: flex; align-items: center; gap: 4px;
            border: none; cursor: pointer;
            box-shadow: 0 3px 10px rgba(124,58,237,0.4);
            transition: transform var(--transition-bounce);
        }
        .hub-badges-btn:active { transform: scale(0.88); }
        .hub-parents-btn {
            width: 44px; height: 44px;
            border-radius: 50%;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(8px);
            box-shadow: var(--shadow-md);
            font-size: 1.3rem;
            display: flex; align-items: center; justify-content: center;
            border: none; cursor: pointer;
            transition: transform var(--transition-bounce);
        }
        .hub-parents-btn:active { transform: scale(0.88); }

        /* Logo */
        .hub-logo {
            display: flex;
            gap: 2px;
            z-index: 1;
        }
        .hub-logo-letter {
            font-family: var(--font-display);
            font-size: clamp(2rem, 7vw, var(--text-4xl));
            font-weight: 900;
            animation: bounce 2.5s ease-in-out infinite;
            animation-delay: calc(var(--d) * 0.1s);
            text-shadow: 0 3px 0 rgba(0,0,0,0.12);
        }

        /* Journey banner */
        .hub-journey-banner {
            width: 100%;
            max-width: 640px;
            background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
            border-radius: var(--radius-xl);
            padding: var(--space-md) var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-md);
            border: none;
            box-shadow: 0 6px 0 #2563EB, 0 8px 24px rgba(59,130,246,0.3);
            cursor: pointer;
            z-index: 1;
            transition: transform var(--transition-bounce), box-shadow 0.15s;
        }
        .hub-journey-banner:active {
            transform: translateY(4px);
            box-shadow: 0 2px 0 #2563EB, 0 4px 12px rgba(59,130,246,0.2);
        }
        .journey-avatar {
            font-size: 2.8rem;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2));
            animation: float 4s ease-in-out infinite;
            flex-shrink: 0;
        }
        .journey-text { flex: 1; text-align: left; }
        .journey-title {
            font-family: var(--font-display);
            font-size: var(--text-xl);
            font-weight: 900;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .journey-subtitle {
            font-family: var(--font-body);
            font-size: 0.95rem;
            font-weight: 600;
            color: rgba(255,255,255,0.9);
        }
        .journey-right { display: flex; align-items: center; gap: var(--space-sm); }
        .journey-progress-pill {
            background: rgba(255,255,255,0.25);
            color: white;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 0.85rem;
            padding: 4px 10px;
            border-radius: var(--radius-full);
        }
        .journey-play {
            width: 44px; height: 44px;
            border-radius: 50%;
            background: white;
            color: #3B82F6;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.3rem;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            animation: pulse 2.2s ease-in-out infinite;
            flex-shrink: 0;
        }

        /* Sub-app grid */
        .hub-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-md);
            z-index: 1;
            width: 100%;
            max-width: 640px;
        }
        .hub-card {
            border-radius: var(--radius-xl);
            background: var(--card-bg);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: var(--space-md) var(--space-sm) var(--space-sm);
            box-shadow: 0 6px 0 var(--card-shadow), 0 8px 24px rgba(0,0,0,0.15);
            cursor: pointer;
            border: none;
            animation: pop var(--transition-slow) backwards;
            transition: transform 0.15s;
            position: relative;
            overflow: hidden;
            min-height: 130px;
        }
        .hub-card:active {
            transform: translateY(4px) scale(0.96);
            box-shadow: 0 2px 0 var(--card-shadow), 0 4px 12px rgba(0,0,0,0.1);
        }
        /* Shine overlay */
        .hub-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 45%;
            background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%);
            border-radius: var(--radius-xl) var(--radius-xl) 0 0;
            pointer-events: none;
        }
        .hub-card-mascot {
            font-size: 2rem;
            line-height: 1;
            animation: float 4s ease-in-out infinite;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2));
        }
        .hub-card-icon { font-size: 1.4rem; line-height: 1; }
        .hub-card-label {
            font-family: var(--font-display);
            font-weight: 800;
            font-size: 1rem;
            color: rgba(255,255,255,0.95);
            text-shadow: 0 1px 3px rgba(0,0,0,0.25);
            letter-spacing: 0.02em;
        }
        .hub-card-progress-bar {
            width: 70%;
            height: 5px;
            background: rgba(255,255,255,0.25);
            border-radius: var(--radius-full);
            overflow: hidden;
            margin-top: 4px;
        }
        .hub-card-progress-fill {
            height: 100%;
            background: rgba(255,255,255,0.85);
            border-radius: var(--radius-full);
            transition: width 0.8s ease;
        }
        .hub-card-stars {
            position: absolute;
            top: 8px; right: 8px;
            background: rgba(255,255,255,0.25);
            color: rgba(255,255,255,0.95);
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 0.75rem;
            padding: 2px 7px;
            border-radius: var(--radius-full);
        }

        /* Stagger the mascot float animations */
        .hub-card:nth-child(1) .hub-card-mascot { animation-delay: 0s; }
        .hub-card:nth-child(2) .hub-card-mascot { animation-delay: 0.5s; }
        .hub-card:nth-child(3) .hub-card-mascot { animation-delay: 1s; }
        .hub-card:nth-child(4) .hub-card-mascot { animation-delay: 1.5s; }
        .hub-card:nth-child(5) .hub-card-mascot { animation-delay: 0.8s; }
        .hub-card:nth-child(6) .hub-card-mascot { animation-delay: 0.3s; }

        @media (max-width: 380px) {
            .hub-grid { grid-template-columns: repeat(2, 1fr); max-width: 360px; }
            .hub-card { min-height: 110px; }
            .hub-card-mascot { font-size: 1.6rem; }
            .hub-card-label { font-size: 0.9rem; }
            .hub-logo-letter { font-size: 1.8rem; }
        }
        @media (max-height: 700px) {
            .hub-screen { gap: var(--space-sm); }
            .hub-logo-letter { font-size: 1.8rem; }
            .hub-card { min-height: 100px; padding: var(--space-sm); }
            .hub-card-mascot { font-size: 1.5rem; }
        }
    `;
    document.head.appendChild(style);
}
