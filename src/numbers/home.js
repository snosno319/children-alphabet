/**
 * Numbers Home Screen
 */
import { playPopSound, speakInstruction } from '../shared/audio.js';

export function renderHome(app, navigate) {
    injectHomeStyles();

    app.innerHTML = `
        <div class="screen numbers-home-screen" id="numbers-home">
            <div class="numbers-home-decorations">
                <span class="numbers-home-deco" style="--i:0">1️⃣</span>
                <span class="numbers-home-deco" style="--i:1">🌟</span>
                <span class="numbers-home-deco" style="--i:2">2️⃣</span>
                <span class="numbers-home-deco" style="--i:3">🔢</span>
                <span class="numbers-home-deco" style="--i:4">3️⃣</span>
            </div>

            <div class="numbers-home-back-area">
                <button class="back-btn" id="nums-hub-back">🌈</button>
            </div>

            <div class="numbers-home-logo">
                <span class="numbers-home-logo-digit" style="--d:0">1</span>
                <span class="numbers-home-logo-digit" style="--d:1">2</span>
                <span class="numbers-home-logo-digit" style="--d:2">3</span>
            </div>

            <div class="numbers-home-nav">
                <button class="numbers-nav-btn numbers-explore-btn" id="nums-explore">
                    <span class="numbers-nav-icon">🔍</span>
                    <span class="numbers-nav-label">Explore</span>
                </button>
                <button class="numbers-nav-btn numbers-quiz-btn" id="nums-quiz">
                    <span class="numbers-nav-icon">🧮</span>
                    <span class="numbers-nav-label">Quiz</span>
                </button>
            </div>
        </div>
    `;

    setTimeout(() => speakInstruction('welcome'), 1000);

    document.getElementById('nums-hub-back').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        navigate('hub');
    });

    document.getElementById('nums-explore').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        navigate('numbers-explore');
    });

    document.getElementById('nums-quiz').addEventListener('click', () => {
        playPopSound();
        window.speechSynthesis?.cancel();
        navigate('numbers-quiz');
    });
}

export function injectHomeStyles() {
    if (document.getElementById('numbers-home-styles')) return;
    const style = document.createElement('style');
    style.id = 'numbers-home-styles';
    style.textContent = `
        .numbers-home-screen {
            background: linear-gradient(160deg, #FFF8F0 0%, #FEF3C7 50%, #FDE68A 100%);
            align-items: center;
            justify-content: center;
            gap: var(--space-xl);
            padding: var(--space-xl);
            overflow: hidden;
        }

        .numbers-home-back-area {
            position: absolute;
            top: var(--space-lg);
            left: var(--space-xl);
            z-index: 10;
        }

        .numbers-home-decorations {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
        }
        .numbers-home-deco {
            position: absolute;
            font-size: 2rem;
            opacity: 0.12;
            animation: float 4s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.8s);
        }
        .numbers-home-deco:nth-child(1) { top: 8%; left: 10%; }
        .numbers-home-deco:nth-child(2) { top: 12%; right: 15%; }
        .numbers-home-deco:nth-child(3) { bottom: 20%; left: 8%; }
        .numbers-home-deco:nth-child(4) { bottom: 15%; right: 10%; }
        .numbers-home-deco:nth-child(5) { top: 45%; right: 5%; }

        .numbers-home-logo {
            display: flex;
            gap: var(--space-md);
            z-index: 1;
        }
        .numbers-home-logo-digit {
            font-family: var(--font-display);
            font-size: var(--text-5xl);
            font-weight: 900;
            animation: bounce 2s ease-in-out infinite;
            animation-delay: calc(var(--d) * 0.2s);
        }
        .numbers-home-logo-digit:nth-child(1) { color: #FF6B6B; }
        .numbers-home-logo-digit:nth-child(2) { color: #4ECDC4; }
        .numbers-home-logo-digit:nth-child(3) { color: #FFB300; }

        .numbers-home-nav {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-md);
            z-index: 1;
            width: 100%;
            max-width: 260px;
        }
        .numbers-nav-btn {
            width: 100%;
            padding: var(--space-xl) var(--space-sm) var(--space-lg);
            border-radius: var(--radius-xl);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            box-shadow: 0 6px 0 rgba(0,0,0,0.2), var(--shadow-lg);
            transition: transform var(--transition-bounce), box-shadow 0.15s;
            cursor: pointer;
        }
        .numbers-nav-btn:active {
            transform: translateY(4px);
            box-shadow: 0 2px 0 rgba(0,0,0,0.15), var(--shadow-sm);
        }
        .numbers-explore-btn { background: linear-gradient(135deg, #FF8A65 0%, #FF7043 100%); }
        .numbers-quiz-btn    { background: linear-gradient(135deg, #FFB300 0%, #FF8A65 100%); }
        .numbers-nav-icon  { font-size: 3rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }
        .numbers-nav-label {
            font-family: var(--font-display);
            font-size: var(--text-lg);
            font-weight: 800;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
}
