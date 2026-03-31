/**
 * Memory Flip Card Game
 * Match letter cards with their emoji counterparts.
 * Easy: 4 pairs (A–D), Hard: 8 pairs (A–H)
 */
import { LETTERS } from './data.js';
import { playAudio, playCorrectSound, playWrongSound, playCelebrationSound } from '../shared/audio.js';
import { floatStars, shakeEl } from '../shared/feedback.js';
import { spawnBigCelebration, spawnStarBurst } from '../shared/confetti.js';
import { checkAndAwardBadges } from '../shared/badges.js';
import { saveMemoryBest, getMemoryBest } from '../shared/storage.js';

// ── Game Logic ─────────────────────────────────────────────────────────────────

function buildCards(difficulty) {
    const count = difficulty === 'easy' ? 4 : 8;
    const letters = LETTERS.slice(0, count);
    const cards = [];
    letters.forEach((l, i) => {
        cards.push({ id: `letter-${i}`, pairId: i, type: 'letter', letter: l.letter, emoji: l.emoji, color: l.color, word: l.word });
        cards.push({ id: `emoji-${i}`,  pairId: i, type: 'emoji',  letter: l.letter, emoji: l.emoji, color: l.color, word: l.word });
    });
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
}

// ── Render ─────────────────────────────────────────────────────────────────────

export function renderMemory(app, navigate, props = {}) {
    injectMemoryStyles();

    // Start screen
    renderStartScreen(app, navigate);
}

function renderStartScreen(app, navigate) {
    const easyBest = getMemoryBest('easy');
    const hardBest = getMemoryBest('hard');

    app.innerHTML = `
        <div class="screen memory-screen" id="memory-start">
            <div class="memory-back-area">
                <button class="back-btn" id="mem-back">⬅</button>
            </div>
            <div class="memory-start-title">🃏 Memory Game</div>
            <p class="memory-start-sub">Match each letter with its picture!</p>
            <div class="memory-diff-btns">
                <button class="memory-diff-btn memory-easy-btn" id="mem-easy">
                    <span class="memory-diff-icon">🟢</span>
                    <span class="memory-diff-label">Easy</span>
                    <span class="memory-diff-sub">4 pairs</span>
                    ${easyBest !== null ? `<span class="memory-diff-best">Best: ${easyBest} moves</span>` : ''}
                </button>
                <button class="memory-diff-btn memory-hard-btn" id="mem-hard">
                    <span class="memory-diff-icon">🔴</span>
                    <span class="memory-diff-label">Hard</span>
                    <span class="memory-diff-sub">8 pairs</span>
                    ${hardBest !== null ? `<span class="memory-diff-best">Best: ${hardBest} moves</span>` : ''}
                </button>
            </div>
        </div>
    `;

    document.getElementById('mem-back').addEventListener('click', () => navigate('alphabet-home'));
    document.getElementById('mem-easy').addEventListener('click', () => startGame(app, navigate, 'easy'));
    document.getElementById('mem-hard').addEventListener('click', () => startGame(app, navigate, 'hard'));
}

function startGame(app, navigate, difficulty) {
    const cards = buildCards(difficulty);
    const totalPairs = difficulty === 'easy' ? 4 : 8;
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let locked = false;

    const cols = difficulty === 'easy' ? 4 : 4;

    app.innerHTML = `
        <div class="screen memory-screen" id="memory-game">
            <div class="memory-header">
                <button class="back-btn" id="mem-game-back">⬅</button>
                <div class="memory-score">⭐ <span id="mem-pairs">${matchedPairs}</span>/${totalPairs}</div>
                <div class="memory-moves">👆 <span id="mem-moves">0</span></div>
            </div>
            <div class="memory-grid memory-grid-${difficulty}" id="memory-grid">
                ${cards.map(c => `
                    <div class="memory-card" data-id="${c.id}" data-pair="${c.pairId}" data-type="${c.type}" data-letter="${c.letter}">
                        <div class="memory-card-inner">
                            <div class="memory-card-front">?</div>
                            <div class="memory-card-back" style="background:${c.color}">
                                <span class="memory-card-main">${c.type === 'letter' ? c.letter : c.emoji}</span>
                                <span class="memory-card-sub">${c.word}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('mem-game-back').addEventListener('click', () => renderStartScreen(app, navigate));

    document.getElementById('memory-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.memory-card');
        if (!card || locked) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        // Flip card
        card.classList.add('flipped');
        playAudio(`audio/letters/${card.dataset.letter.toLowerCase()}.wav`);
        const rect = card.getBoundingClientRect();
        spawnStarBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

        flippedCards.push(card);

        if (flippedCards.length === 2) {
            locked = true;
            moves++;
            document.getElementById('mem-moves').textContent = moves;

            const [a, b] = flippedCards;
            if (a.dataset.pair === b.dataset.pair && a.dataset.type !== b.dataset.type) {
                // Match!
                playCorrectSound();
                a.classList.add('matched');
                b.classList.add('matched');
                matchedPairs++;
                document.getElementById('mem-pairs').textContent = matchedPairs;
                flippedCards = [];
                locked = false;

                if (matchedPairs === totalPairs) {
                    setTimeout(() => showResults(app, navigate, difficulty, moves), 600);
                }
            } else {
                // No match
                playWrongSound();
                shakeEl(a);
                shakeEl(b);
                setTimeout(() => {
                    a.classList.remove('flipped');
                    b.classList.remove('flipped');
                    flippedCards = [];
                    locked = false;
                }, 900);
            }
        }
    });
}

function showResults(app, navigate, difficulty, moves) {
    if (app.querySelector('.memory-results-overlay')) return; // guard against double-tap
    playCelebrationSound();
    spawnBigCelebration();
    checkAndAwardBadges(navigate);
    saveMemoryBest(difficulty, moves);

    const best = getMemoryBest(difficulty);
    const isNewBest = best === moves;

    const overlay = document.createElement('div');
    overlay.className = 'memory-results-overlay';
    overlay.innerHTML = `
        <div class="memory-results-inner">
            <div class="memory-results-trophy">🎉</div>
            <h2 class="memory-results-title">You did it!</h2>
            <p class="memory-results-moves">${moves} moves</p>
            ${isNewBest ? '<p class="memory-results-best">🏆 New best score!</p>' : ''}
            <div class="memory-results-btns">
                <button class="memory-btn memory-btn-primary" id="mem-play-again">Play Again</button>
                <button class="memory-btn memory-btn-secondary" id="mem-back-home">Back</button>
            </div>
        </div>
    `;
    app.querySelector('.screen').appendChild(overlay);

    document.getElementById('mem-play-again').addEventListener('click', () => {
        overlay.remove();
        startGame(app, navigate, difficulty);
    });
    document.getElementById('mem-back-home').addEventListener('click', () => renderStartScreen(app, navigate));
}

// ── Styles ─────────────────────────────────────────────────────────────────────

export function injectMemoryStyles() {
    if (document.getElementById('memory-styles')) return;
    const style = document.createElement('style');
    style.id = 'memory-styles';
    style.textContent = `
        .memory-screen {
            background: linear-gradient(160deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%);
            align-items: center;
            justify-content: flex-start;
            padding: var(--space-lg);
            gap: var(--space-md);
            overflow-y: auto;
        }

        /* ── Start Screen ── */
        .memory-back-area {
            position: absolute;
            top: var(--space-lg);
            left: var(--space-xl);
        }
        .memory-start-title {
            font-family: var(--font-display);
            font-size: var(--text-4xl);
            font-weight: 900;
            color: #3730A3;
            margin-top: 60px;
        }
        .memory-start-sub {
            font-size: var(--text-lg);
            color: #6366F1;
            margin: 0;
        }
        .memory-diff-btns {
            display: flex;
            gap: var(--space-lg);
            margin-top: var(--space-xl);
        }
        .memory-diff-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-xs);
            padding: var(--space-xl) var(--space-2xl, 2rem);
            border-radius: var(--radius-xl);
            box-shadow: 0 6px 0 rgba(0,0,0,0.15), var(--shadow-lg);
            min-width: 130px;
            cursor: pointer;
            transition: transform 0.15s;
        }
        .memory-diff-btn:active { transform: translateY(3px); }
        .memory-easy-btn { background: linear-gradient(135deg, #86EFAC, #4ADE80); }
        .memory-hard-btn { background: linear-gradient(135deg, #FCA5A5, #F87171); }
        .memory-diff-icon { font-size: 2.5rem; }
        .memory-diff-label { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 800; color: #fff; }
        .memory-diff-sub   { font-size: var(--text-sm); color: rgba(255,255,255,0.85); }
        .memory-diff-best  { font-size: var(--text-xs); color: rgba(255,255,255,0.75); margin-top: 2px; }

        /* ── Game Screen ── */
        .memory-header {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            width: 100%;
            padding-bottom: var(--space-sm);
        }
        .memory-score, .memory-moves {
            font-family: var(--font-display);
            font-size: var(--text-lg);
            font-weight: 700;
            color: #3730A3;
            background: rgba(255,255,255,0.7);
            padding: var(--space-xs) var(--space-md);
            border-radius: var(--radius-full);
        }
        .memory-moves { margin-left: auto; }

        .memory-grid {
            display: grid;
            gap: 10px;
            width: 100%;
            max-width: 380px;
        }
        .memory-grid-easy { grid-template-columns: repeat(4, 1fr); }
        .memory-grid-hard { grid-template-columns: repeat(4, 1fr); }

        /* ── Card ── */
        .memory-card {
            aspect-ratio: 1;
            perspective: 600px;
            cursor: pointer;
        }
        .memory-card-inner {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 12px;
        }
        .memory-card.flipped .memory-card-inner,
        .memory-card.matched .memory-card-inner {
            transform: rotateY(180deg);
        }
        .memory-card-front,
        .memory-card-back {
            position: absolute;
            inset: 0;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        .memory-card-front {
            background: linear-gradient(135deg, #6366F1, #8B5CF6);
            font-size: 2rem;
            font-weight: 900;
            color: rgba(255,255,255,0.6);
            box-shadow: 0 4px 0 rgba(0,0,0,0.2);
        }
        .memory-card-back {
            transform: rotateY(180deg);
            box-shadow: 0 4px 0 rgba(0,0,0,0.2);
        }
        .memory-card-main {
            font-size: 2rem;
            font-family: var(--font-display);
            font-weight: 900;
            color: #fff;
            filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
            line-height: 1;
        }
        .memory-card-sub {
            font-size: 0.6rem;
            color: rgba(255,255,255,0.85);
            font-weight: 700;
            margin-top: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .memory-card.matched .memory-card-back {
            outline: 3px solid rgba(255,255,255,0.8);
            animation: memCardMatch 0.4s ease forwards;
        }
        @keyframes memCardMatch {
            0%   { transform: rotateY(180deg) scale(1) }
            50%  { transform: rotateY(180deg) scale(1.12) }
            100% { transform: rotateY(180deg) scale(1) }
        }

        /* ── Results Overlay ── */
        .memory-results-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            animation: memFadeIn 0.3s ease forwards;
        }
        @keyframes memFadeIn { from { opacity:0 } to { opacity:1 } }
        .memory-results-inner {
            background: #fff;
            border-radius: 28px;
            padding: 36px 28px 28px;
            text-align: center;
            max-width: 300px;
            width: 88%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: memSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes memSlideUp {
            from { opacity:0; transform: translateY(30px) scale(0.9) }
            to   { opacity:1; transform: translateY(0) scale(1) }
        }
        .memory-results-trophy { font-size: 4rem; margin-bottom: 8px; }
        .memory-results-title {
            font-family: var(--font-display);
            font-size: 1.8rem;
            font-weight: 900;
            color: #1a1a2e;
            margin: 0 0 8px;
        }
        .memory-results-moves {
            font-size: 1.1rem;
            color: #6366F1;
            font-weight: 700;
            margin: 0 0 4px;
        }
        .memory-results-best {
            font-size: 0.95rem;
            color: #F59E0B;
            font-weight: 700;
            margin: 0 0 20px;
        }
        .memory-results-btns {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 20px;
        }
        .memory-btn {
            padding: 12px 24px;
            border-radius: 50px;
            font-family: var(--font-display);
            font-size: 1rem;
            font-weight: 800;
            cursor: pointer;
            border: none;
        }
        .memory-btn-primary  { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: #fff; }
        .memory-btn-secondary { background: #f3f4f6; color: #374151; }
    `;
    document.head.appendChild(style);
}
