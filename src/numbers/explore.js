/**
 * Numbers Explore — tap/swipe through 1–10, hear each number, see emoji count
 */
import { NUMBERS } from './data.js';
import { playPopSound, playCorrectSound } from '../shared/audio.js';
import { floatStars } from '../shared/feedback.js';
import { checkAndAwardBadges } from '../shared/badges.js';
import { markNumberExplored, isNumberExplored } from '../shared/storage.js';

// ── Render ─────────────────────────────────────────────────────────────────────

export function renderExplore(app, navigate) {
    injectExploreStyles();

    let currentIdx = 0;

    function renderCard() {
        const n = NUMBERS[currentIdx];
        const explored = isNumberExplored(n.number);
        const emojiRow = Array.from({ length: n.number }, () => n.emoji).join(' ');

        app.innerHTML = `
            <div class="screen numbers-explore-screen" id="numbers-explore">
                <div class="ne-header">
                    <button class="back-btn" id="ne-back">⬅</button>
                    <div class="ne-progress">${currentIdx + 1} / ${NUMBERS.length}</div>
                </div>

                <div class="ne-card" style="background: linear-gradient(135deg, ${n.color} 0%, ${lighten(n.color)} 100%)">
                    <div class="ne-number">${n.number}</div>
                    <div class="ne-emoji-row">${emojiRow}</div>
                    <div class="ne-word">${n.word}</div>
                    <div class="ne-fact">${n.funFact}</div>
                </div>

                <div class="ne-hear-btn-wrap">
                    <button class="ne-hear-btn" id="ne-hear">
                        🔊 Hear it!
                    </button>
                </div>

                <div class="ne-nav-row">
                    <button class="ne-nav-btn ne-prev-btn" id="ne-prev" ${currentIdx === 0 ? 'disabled' : ''}>⬅ Prev</button>
                    <button class="ne-nav-btn ne-next-btn" id="ne-next">${currentIdx === NUMBERS.length - 1 ? 'Done ✓' : 'Next ➡'}</button>
                </div>
            </div>
        `;

        // Mark explored on render
        if (!explored) {
            markNumberExplored(n.number);
        }

        document.getElementById('ne-back').addEventListener('click', () => {
            window.speechSynthesis?.cancel();
            navigate('numbers-home');
        });

        document.getElementById('ne-hear').addEventListener('click', () => {
            playPopSound();
            speakNumber(n.word);
            const btn = document.getElementById('ne-hear');
            if (btn) { floatStars(btn); }
        });

        document.getElementById('ne-prev')?.addEventListener('click', () => {
            if (currentIdx > 0) { currentIdx--; renderCard(); }
        });

        document.getElementById('ne-next').addEventListener('click', () => {
            playCorrectSound();
            if (currentIdx < NUMBERS.length - 1) {
                currentIdx++;
                renderCard();
            } else {
                checkAndAwardBadges(navigate);
                navigate('numbers-home');
            }
        });
    }

    renderCard();
}

function speakNumber(word) {
    if (typeof window === 'undefined') return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.rate = 0.85;
    utt.pitch = 1.1;
    window.speechSynthesis?.speak(utt);
}

function lighten(hex) {
    // Simple lightening: mix with white
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.min(255, r + 60);
    const lg = Math.min(255, g + 60);
    const lb = Math.min(255, b + 60);
    return `#${lr.toString(16).padStart(2,'0')}${lg.toString(16).padStart(2,'0')}${lb.toString(16).padStart(2,'0')}`;
}

export function injectExploreStyles() {
    if (document.getElementById('numbers-explore-styles')) return;
    const style = document.createElement('style');
    style.id = 'numbers-explore-styles';
    style.textContent = `
        .numbers-explore-screen {
            background: linear-gradient(160deg, #FFFBEB 0%, #FEF3C7 100%);
            align-items: center;
            justify-content: flex-start;
            padding: var(--space-lg);
            gap: var(--space-lg);
            overflow-y: auto;
        }

        .ne-header {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            width: 100%;
        }
        .ne-progress {
            font-family: var(--font-display);
            font-size: var(--text-lg);
            font-weight: 700;
            color: #92400E;
            margin-left: auto;
            background: rgba(255,255,255,0.6);
            padding: var(--space-xs) var(--space-md);
            border-radius: var(--radius-full);
        }

        .ne-card {
            width: 100%;
            max-width: 340px;
            border-radius: var(--radius-2xl, 28px);
            padding: var(--space-2xl, 2rem) var(--space-xl);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-md);
            box-shadow: 0 8px 0 rgba(0,0,0,0.15), var(--shadow-xl);
            animation: neCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes neCardIn {
            from { opacity:0; transform: scale(0.85) translateY(20px) }
            to   { opacity:1; transform: scale(1) translateY(0) }
        }

        .ne-number {
            font-family: var(--font-display);
            font-size: 6rem;
            font-weight: 900;
            color: #fff;
            line-height: 1;
            text-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .ne-emoji-row {
            font-size: 1.8rem;
            line-height: 1.6;
            text-align: center;
            max-width: 280px;
            word-break: break-all;
        }

        .ne-word {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            font-weight: 800;
            color: rgba(255,255,255,0.95);
            text-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }

        .ne-fact {
            font-size: var(--text-sm);
            color: rgba(255,255,255,0.85);
            text-align: center;
            line-height: 1.4;
            font-style: italic;
        }

        .ne-hear-btn-wrap { width: 100%; max-width: 340px; display: flex; justify-content: center; }
        .ne-hear-btn {
            background: #fff;
            border: none;
            border-radius: var(--radius-full);
            padding: var(--space-md) var(--space-xl);
            font-family: var(--font-display);
            font-size: var(--text-lg);
            font-weight: 800;
            color: #92400E;
            cursor: pointer;
            box-shadow: var(--shadow-md);
            transition: transform 0.15s;
        }
        .ne-hear-btn:active { transform: scale(0.95); }

        .ne-nav-row {
            display: flex;
            gap: var(--space-md);
            width: 100%;
            max-width: 340px;
        }
        .ne-nav-btn {
            flex: 1;
            padding: var(--space-md);
            border-radius: var(--radius-full);
            font-family: var(--font-display);
            font-size: var(--text-base);
            font-weight: 800;
            cursor: pointer;
            border: none;
            box-shadow: var(--shadow-md);
            transition: transform 0.15s;
        }
        .ne-nav-btn:active { transform: scale(0.95); }
        .ne-nav-btn:disabled { opacity: 0.4; cursor: default; }
        .ne-prev-btn { background: #f3f4f6; color: #374151; }
        .ne-next-btn { background: linear-gradient(135deg, #FF7043, #FF8A65); color: #fff; }
    `;
    document.head.appendChild(style);
}
