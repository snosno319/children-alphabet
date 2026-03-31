/**
 * Numbers Quiz — "How many?" emoji counting quiz
 * Shows N emojis, child taps the correct numeral from 3 choices.
 */
import { NUMBERS } from './data.js';
import { playCorrectSound, playWrongSound, playCelebrationSound, speakInstruction } from '../shared/audio.js';
import { floatStars, shakeEl } from '../shared/feedback.js';
import { spawnBigCelebration } from '../shared/confetti.js';
import { checkAndAwardBadges } from '../shared/badges.js';
import { recordNumbersQuizResult } from '../shared/storage.js';

const TOTAL_QUESTIONS = 5;

// ── Quiz Logic ─────────────────────────────────────────────────────────────────

export function renderQuiz(app, navigate) {
    injectQuizStyles();

    // Build question pool — pick 5 random numbers, no repeats
    const pool = [...NUMBERS].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
    let questionIdx = 0;
    let score = 0;

    function showQuestion() {
        const n = pool[questionIdx];
        const choices = buildChoices(n.number);
        const emojiRow = Array.from({ length: n.number }, () => n.emoji).join(' ');

        app.innerHTML = `
            <div class="screen nq-screen" id="nq-screen">
                <div class="nq-header">
                    <button class="back-btn" id="nq-back">⬅</button>
                    <div class="nq-progress">${questionIdx + 1} / ${TOTAL_QUESTIONS}</div>
                    <div class="nq-score">⭐ ${score}</div>
                </div>

                <div class="nq-question">How many?</div>
                <div class="nq-emoji-display">${emojiRow}</div>

                <div class="nq-choices">
                    ${choices.map(c => `
                        <button class="nq-choice-btn" data-value="${c}" style="border-color: ${NUMBERS[c - 1].color}">
                            <span class="nq-choice-num" style="color: ${NUMBERS[c - 1].color}">${c}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('nq-back').addEventListener('click', () => {
            window.speechSynthesis?.cancel();
            navigate('numbers-home');
        });

        document.querySelectorAll('.nq-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = parseInt(btn.dataset.value);
                const isCorrect = chosen === n.number;

                document.querySelectorAll('.nq-choice-btn').forEach(b => b.disabled = true);

                if (isCorrect) {
                    btn.classList.add('nq-correct');
                    playCorrectSound();
                    floatStars(btn);
                    score++;
                    setTimeout(() => speakInstruction('correct'), 700);
                } else {
                    btn.classList.add('nq-wrong');
                    shakeEl(btn);
                    playWrongSound();
                    speakInstruction('wrong');
                    // Highlight correct answer
                    document.querySelectorAll('.nq-choice-btn').forEach(b => {
                        if (parseInt(b.dataset.value) === n.number) b.classList.add('nq-correct');
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
        const starsEarned = recordNumbersQuizResult(score, TOTAL_QUESTIONS);
        checkAndAwardBadges(navigate);

        app.innerHTML = `
            <div class="screen nq-screen nq-results-screen" id="nq-results">
                <div class="nq-results-trophy">🎉</div>
                <h2 class="nq-results-title">${score === TOTAL_QUESTIONS ? 'Perfect!' : 'Nice job!'}</h2>
                <div class="nq-results-score">${score} / ${TOTAL_QUESTIONS}</div>
                <div class="nq-results-stars">${'⭐'.repeat(starsEarned)}</div>
                <div class="nq-results-btns">
                    <button class="nq-btn nq-btn-primary" id="nq-play-again">Play Again</button>
                    <button class="nq-btn nq-btn-secondary" id="nq-back-home">Back</button>
                </div>
            </div>
        `;

        document.getElementById('nq-play-again').addEventListener('click', () => renderQuiz(app, navigate));
        document.getElementById('nq-back-home').addEventListener('click', () => navigate('numbers-home'));
    }

    showQuestion();
}

function buildChoices(correct) {
    const others = NUMBERS.map(n => n.number).filter(n => n !== correct);
    const distractors = others.sort(() => Math.random() - 0.5).slice(0, 2);
    return [correct, ...distractors].sort(() => Math.random() - 0.5);
}

export function injectQuizStyles() {
    if (document.getElementById('numbers-quiz-styles')) return;
    const style = document.createElement('style');
    style.id = 'numbers-quiz-styles';
    style.textContent = `
        .nq-screen {
            background: linear-gradient(160deg, #FFFBEB 0%, #FEF3C7 100%);
            align-items: center;
            justify-content: flex-start;
            padding: var(--space-lg);
            gap: var(--space-lg);
        }

        .nq-header {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            width: 100%;
        }
        .nq-progress, .nq-score {
            font-family: var(--font-display);
            font-size: var(--text-lg);
            font-weight: 700;
            color: #92400E;
            background: rgba(255,255,255,0.6);
            padding: var(--space-xs) var(--space-md);
            border-radius: var(--radius-full);
        }
        .nq-score { margin-left: auto; }

        .nq-question {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            font-weight: 800;
            color: #92400E;
        }

        .nq-emoji-display {
            font-size: 2rem;
            line-height: 1.8;
            text-align: center;
            max-width: 300px;
            background: rgba(255,255,255,0.7);
            border-radius: var(--radius-xl);
            padding: var(--space-lg);
            box-shadow: var(--shadow-md);
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 4px;
            animation: nqCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes nqCardIn {
            from { opacity:0; transform: scale(0.9) }
            to   { opacity:1; transform: scale(1) }
        }

        .nq-choices {
            display: flex;
            gap: var(--space-md);
            justify-content: center;
        }
        .nq-choice-btn {
            width: 90px;
            height: 90px;
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
        .nq-choice-btn:active { transform: scale(0.93); }
        .nq-choice-num { font-family: var(--font-display); font-size: 2.5rem; font-weight: 900; }
        .nq-choice-btn.nq-correct { background: #DCFCE7; border-color: #22C55E !important; }
        .nq-choice-btn.nq-wrong   { background: #FEE2E2; border-color: #EF4444 !important; }

        /* Results */
        .nq-results-screen {
            justify-content: center;
            gap: var(--space-lg);
        }
        .nq-results-trophy { font-size: 5rem; }
        .nq-results-title {
            font-family: var(--font-display);
            font-size: var(--text-4xl);
            font-weight: 900;
            color: #92400E;
            margin: 0;
        }
        .nq-results-score {
            font-family: var(--font-display);
            font-size: var(--text-3xl);
            font-weight: 800;
            color: #FF7043;
        }
        .nq-results-stars { font-size: 2rem; min-height: 2.2rem; }
        .nq-results-btns { display: flex; gap: var(--space-md); margin-top: var(--space-md); }
        .nq-btn {
            padding: 14px 28px;
            border-radius: var(--radius-full);
            font-family: var(--font-display);
            font-size: var(--text-base);
            font-weight: 800;
            cursor: pointer;
            border: none;
            box-shadow: var(--shadow-md);
        }
        .nq-btn-primary  { background: linear-gradient(135deg, #FF7043, #FF8A65); color: #fff; }
        .nq-btn-secondary { background: #f3f4f6; color: #374151; }
    `;
    document.head.appendChild(style);
}
