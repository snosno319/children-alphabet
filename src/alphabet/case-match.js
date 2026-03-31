/**
 * Uppercase ↔ Lowercase Sort
 * Show a large uppercase letter; tap the matching lowercase from 3 choices.
 * 10 questions, no repeats per session.
 */
import { LETTERS } from './data.js';
import { playCorrectSound, playWrongSound, playCelebrationSound } from '../shared/audio.js';
import { speakInstruction } from '../shared/audio.js';
import { floatStars, shakeEl } from '../shared/feedback.js';
import { spawnBigCelebration } from '../shared/confetti.js';
import { checkAndAwardBadges } from '../shared/badges.js';

const TOTAL_QUESTIONS = 10;

// ── Storage helper ─────────────────────────────────────────────────────────────
function saveResult(correct, total) {
    const profileId = localStorage.getItem('active_profile') || 'default';
    const key = `english-adventure-progress-${profileId}`;
    try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (!data.alphabet) data.alphabet = {};
        data.alphabet.caseMatchCorrect = (data.alphabet.caseMatchCorrect || 0) + correct;
        data.alphabet.caseMatchTotal   = (data.alphabet.caseMatchTotal   || 0) + total;
        const starsEarned = correct >= 10 ? 3 : correct >= 6 ? 2 : correct >= 3 ? 1 : 0;
        data.alphabet.stars = (data.alphabet.stars || 0) + starsEarned;
        localStorage.setItem(key, JSON.stringify(data));
        return starsEarned;
    } catch (e) { return 0; }
}

// ── Render ─────────────────────────────────────────────────────────────────────

export function renderCaseMatch(app, navigate) {
    injectCaseMatchStyles();

    // Build 10 random unique letters
    const pool = [...LETTERS].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
    let questionIdx = 0;
    let score = 0;

    function showQuestion() {
        const current = pool[questionIdx];
        const choices = buildChoices(current.letter);

        app.innerHTML = `
            <div class="screen cm-screen" id="cm-screen">
                <div class="cm-header">
                    <button class="back-btn" id="cm-back">⬅</button>
                    <div class="cm-counter">${questionIdx + 1} / ${TOTAL_QUESTIONS}</div>
                    <div class="cm-score">⭐ ${score}</div>
                </div>

                <div class="cm-uppercase" style="color: ${current.color}">${current.letter}</div>
                <p class="cm-instruction">Find the lowercase letter</p>

                <div class="cm-choices">
                    ${choices.map(c => `
                        <button class="cm-choice-btn" data-value="${c}" style="border-color: ${LETTERS.find(l => l.letter === c).color}">
                            <span class="cm-choice-letter" style="color: ${LETTERS.find(l => l.letter === c).color}">${c.toLowerCase()}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('cm-back').addEventListener('click', () => {
            window.speechSynthesis?.cancel();
            navigate('alphabet-home');
        });

        document.querySelectorAll('.cm-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = btn.dataset.value;
                const isCorrect = chosen === current.letter;

                document.querySelectorAll('.cm-choice-btn').forEach(b => b.disabled = true);

                if (isCorrect) {
                    btn.classList.add('cm-correct');
                    playCorrectSound();
                    floatStars(btn);
                    score++;
                    setTimeout(() => speakInstruction('correct'), 700);
                } else {
                    btn.classList.add('cm-wrong');
                    shakeEl(btn);
                    playWrongSound();
                    speakInstruction('wrong');
                    // Show correct answer
                    document.querySelectorAll('.cm-choice-btn').forEach(b => {
                        if (b.dataset.value === current.letter) b.classList.add('cm-correct');
                    });
                }

                setTimeout(() => {
                    questionIdx++;
                    if (questionIdx < TOTAL_QUESTIONS) {
                        showQuestion();
                    } else {
                        showResults();
                    }
                }, 1200);
            });
        });
    }

    function showResults() {
        playCelebrationSound();
        spawnBigCelebration();
        const starsEarned = saveResult(score, TOTAL_QUESTIONS);
        checkAndAwardBadges(navigate, { quizAce: score === TOTAL_QUESTIONS });

        app.innerHTML = `
            <div class="screen cm-screen cm-results-screen" id="cm-results">
                <div class="cm-results-trophy">🎉</div>
                <h2 class="cm-results-title">${score === TOTAL_QUESTIONS ? 'Perfect!' : 'Great job!'}</h2>
                <div class="cm-results-score">${score} / ${TOTAL_QUESTIONS}</div>
                <div class="cm-results-stars">${'⭐'.repeat(starsEarned)}</div>
                <div class="cm-results-btns">
                    <button class="cm-btn cm-btn-primary" id="cm-play-again">Play Again</button>
                    <button class="cm-btn cm-btn-secondary" id="cm-back-home">Back</button>
                </div>
            </div>
        `;

        document.getElementById('cm-play-again').addEventListener('click', () => renderCaseMatch(app, navigate));
        document.getElementById('cm-back-home').addEventListener('click', () => navigate('alphabet-home'));
    }

    showQuestion();
}

function buildChoices(correctLetter) {
    const others = LETTERS.map(l => l.letter).filter(l => l !== correctLetter);
    const distractors = others.sort(() => Math.random() - 0.5).slice(0, 2);
    return [correctLetter, ...distractors].sort(() => Math.random() - 0.5);
}

// ── Styles ─────────────────────────────────────────────────────────────────────

export function injectCaseMatchStyles() {
    if (document.getElementById('case-match-styles')) return;
    const style = document.createElement('style');
    style.id = 'case-match-styles';
    style.textContent = `
        .cm-screen {
            background: linear-gradient(160deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%);
            align-items: center;
            justify-content: flex-start;
            padding: var(--space-lg);
            gap: var(--space-xl);
        }

        .cm-header {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            width: 100%;
        }
        .cm-counter, .cm-score {
            font-family: var(--font-display);
            font-size: var(--text-lg);
            font-weight: 700;
            color: #14532D;
            background: rgba(255,255,255,0.6);
            padding: var(--space-xs) var(--space-md);
            border-radius: var(--radius-full);
        }
        .cm-score { margin-left: auto; }

        .cm-uppercase {
            font-family: var(--font-display);
            font-size: 8rem;
            font-weight: 900;
            line-height: 1;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
            animation: cmLetterIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes cmLetterIn {
            from { opacity:0; transform: scale(0.5) }
            to   { opacity:1; transform: scale(1) }
        }

        .cm-instruction {
            font-family: var(--font-display);
            font-size: var(--text-xl);
            font-weight: 700;
            color: #15803D;
            margin: 0;
            text-align: center;
        }

        .cm-choices {
            display: flex;
            gap: var(--space-lg);
            justify-content: center;
        }
        .cm-choice-btn {
            width: 100px;
            height: 100px;
            border-radius: var(--radius-xl);
            background: #fff;
            border: 3px solid;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 0 rgba(0,0,0,0.12);
            transition: transform 0.15s;
        }
        .cm-choice-btn:active { transform: scale(0.93); }
        .cm-choice-letter {
            font-family: var(--font-display);
            font-size: 3.5rem;
            font-weight: 900;
            line-height: 1;
        }
        .cm-choice-btn.cm-correct { background: #DCFCE7; border-color: #22C55E !important; }
        .cm-choice-btn.cm-wrong   { background: #FEE2E2; border-color: #EF4444 !important; }

        /* Results */
        .cm-results-screen {
            justify-content: center;
            gap: var(--space-lg);
        }
        .cm-results-trophy { font-size: 5rem; }
        .cm-results-title {
            font-family: var(--font-display);
            font-size: var(--text-4xl);
            font-weight: 900;
            color: #14532D;
            margin: 0;
        }
        .cm-results-score {
            font-family: var(--font-display);
            font-size: var(--text-3xl);
            font-weight: 800;
            color: #16A34A;
        }
        .cm-results-stars { font-size: 2rem; min-height: 2.2rem; }
        .cm-results-btns { display: flex; gap: var(--space-md); margin-top: var(--space-md); }
        .cm-btn {
            padding: 14px 28px;
            border-radius: var(--radius-full);
            font-family: var(--font-display);
            font-size: var(--text-base);
            font-weight: 800;
            cursor: pointer;
            border: none;
            box-shadow: var(--shadow-md);
        }
        .cm-btn-primary  { background: linear-gradient(135deg, #34D399, #059669); color: #fff; }
        .cm-btn-secondary { background: #f3f4f6; color: #374151; }
    `;
    document.head.appendChild(style);
}
