/**
 * Alphabet Song — ABC sing-along
 *
 * Two modes:
 *  Auto-play: tap ▶ to hear A→Z in melody order, letters light up in sequence
 *  Tap mode:  tap any letter at your own pace
 *
 * Audio: Web Audio API sine-wave melody + existing letter WAVs (a.wav–z.wav)
 * No new audio assets needed.
 */
import { LETTERS } from './data.js';
import { playAudio, playPopSound, speakInstruction } from '../shared/audio.js';
import { spawnStarBurst } from '../shared/confetti.js';

// ── Melody data ────────────────────────────────────────────────────────────
// ABC song = Twinkle Twinkle Little Star tune. BPM ≈ 112.
// Q = quarter note (~0.43s), H = half note (~0.72s)
const Q = 0.43;
const H = 0.72;

const ABC_MELODY = [
    // A B C D E F G  (Twinkle twinkle little...)
    { letter: 'A', freq: 261.63, dur: Q },   // C4
    { letter: 'B', freq: 261.63, dur: Q },   // C4
    { letter: 'C', freq: 392.00, dur: Q },   // G4
    { letter: 'D', freq: 392.00, dur: Q },   // G4
    { letter: 'E', freq: 440.00, dur: Q },   // A4
    { letter: 'F', freq: 440.00, dur: Q },   // A4
    { letter: 'G', freq: 392.00, dur: H },   // G4 (half)
    // H I J K L M N  (star how I wonder...)
    { letter: 'H', freq: 349.23, dur: Q },   // F4
    { letter: 'I', freq: 349.23, dur: Q },   // F4
    { letter: 'J', freq: 329.63, dur: Q },   // E4
    { letter: 'K', freq: 329.63, dur: Q },   // E4
    { letter: 'L', freq: 293.66, dur: Q },   // D4
    { letter: 'M', freq: 293.66, dur: Q },   // D4
    { letter: 'N', freq: 261.63, dur: H },   // C4 (half)
    // O P  Q R S  T U V  W X Y Z
    { letter: 'O', freq: 392.00, dur: Q   },
    { letter: 'P', freq: 392.00, dur: Q + 0.15 },
    { letter: 'Q', freq: 349.23, dur: Q },
    { letter: 'R', freq: 349.23, dur: Q },
    { letter: 'S', freq: 329.63, dur: H },
    { letter: 'T', freq: 329.63, dur: Q },
    { letter: 'U', freq: 293.66, dur: Q },
    { letter: 'V', freq: 293.66, dur: H },
    { letter: 'W', freq: 261.63, dur: Q },
    { letter: 'X', freq: 392.00, dur: Q },
    { letter: 'Y', freq: 440.00, dur: Q },
    { letter: 'Z', freq: 392.00, dur: H + 0.3 }, // long final note
];

// ── Module state ────────────────────────────────────────────────────────────
let playing = false;
let tapMode = false;
let playTimeout = null;
let audioCtx = null;

function getCtx() {
    if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playMelodyNote(freq, duration) {
    try {
        const ctx  = getCtx();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration * 0.85);
    } catch { /* AudioContext unavailable (jsdom) */ }
}

// ── Render ─────────────────────────────────────────────────────────────────
export function renderSong(app, navigate, props = {}) {
    injectSongStyles();
    playing  = false;
    tapMode  = false;
    clearTimeout(playTimeout);

    const cells = LETTERS.map((l, i) => `
        <button class="song-cell" data-index="${i}" data-letter="${l.letter}"
            style="--cell-color:${l.color}">
            <span class="song-cell-letter">${l.letter}</span>
            <span class="song-cell-emoji">${l.emoji}</span>
        </button>
    `).join('');

    app.innerHTML = `
        <div class="screen song-screen" id="song">
            <div class="song-header">
                <button class="song-back-btn" id="song-back">⬅</button>
                <span class="song-title">ABC Song</span>
                <span class="song-note-icon">🎵</span>
            </div>

            <div class="song-grid" id="song-grid">
                ${cells}
            </div>

            <div class="song-controls">
                <button class="song-play-btn" id="song-play">▶ Sing!</button>
                <button class="song-tap-btn ${tapMode ? 'active' : ''}" id="song-tap">🔤 Tap</button>
            </div>
        </div>
    `;

    // Back
    document.getElementById('song-back').addEventListener('click', () => {
        stopSong();
        playPopSound();
        navigate('alphabet-home');
    });

    // Play / Stop
    document.getElementById('song-play').addEventListener('click', () => {
        playPopSound();
        if (playing) {
            stopSong();
        } else {
            tapMode = false;
            updateTapBtn();
            startSong(navigate);
        }
    });

    // Tap mode toggle
    document.getElementById('song-tap').addEventListener('click', () => {
        playPopSound();
        stopSong();
        tapMode = !tapMode;
        updateTapBtn();
        clearActive();
        if (tapMode) speakInstruction('explore_entry');
    });

    // Letter cell taps
    document.getElementById('song-grid').addEventListener('click', e => {
        const cell = e.target.closest('.song-cell');
        if (!cell) return;
        const idx = parseInt(cell.dataset.index, 10);

        if (tapMode) {
            singLetter(idx);
            // Star burst at tap position
            const rect = cell.getBoundingClientRect();
            spawnStarBurst(
                (rect.left + rect.width  / 2) / window.innerWidth,
                (rect.top  + rect.height / 2) / window.innerHeight,
            );
        } else if (playing) {
            // Tap along — star burst only
            const rect = cell.getBoundingClientRect();
            spawnStarBurst(
                (rect.left + rect.width  / 2) / window.innerWidth,
                (rect.top  + rect.height / 2) / window.innerHeight,
            );
            cell.classList.add('song-tap-pop');
            setTimeout(() => cell.classList.remove('song-tap-pop'), 300);
        }
    });

    // Greet
    setTimeout(() => speakInstruction('explore_entry'), 600);
}

// ── Playback ───────────────────────────────────────────────────────────────

function startSong(navigate) {
    playing = true;
    updatePlayBtn();
    clearActive();

    let stepIndex = 0;

    function playStep() {
        if (!playing || stepIndex >= ABC_MELODY.length) {
            stopSong();
            return;
        }
        singLetter(stepIndex);
        const dur = ABC_MELODY[stepIndex].dur;
        stepIndex++;
        playTimeout = setTimeout(playStep, dur * 1000);
    }

    playStep();
}

function stopSong() {
    playing = false;
    clearTimeout(playTimeout);
    updatePlayBtn();
    clearActive();
}

function singLetter(index) {
    const { letter, freq, dur } = ABC_MELODY[index];
    playMelodyNote(freq, dur);
    playAudio(`audio/letters/${letter.toLowerCase()}.wav`, letter);
    highlightCell(index);
}

function highlightCell(index) {
    // Remove previous active
    document.querySelectorAll('.song-cell.active').forEach(c => {
        c.classList.remove('active');
        c.classList.add('done');
    });
    const cell = document.querySelector(`.song-cell[data-index="${index}"]`);
    if (cell) {
        cell.classList.add('active');
        cell.classList.remove('done');
        // Scroll into view on small screens
        cell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function clearActive() {
    document.querySelectorAll('.song-cell').forEach(c => {
        c.classList.remove('active', 'done');
    });
}

function updatePlayBtn() {
    const btn = document.getElementById('song-play');
    if (!btn) return;
    btn.textContent = playing ? '⏹ Stop' : '▶ Sing!';
    btn.classList.toggle('playing', playing);
}

function updateTapBtn() {
    const btn = document.getElementById('song-tap');
    if (!btn) return;
    btn.classList.toggle('active', tapMode);
}

// ── Styles ─────────────────────────────────────────────────────────────────
export function injectSongStyles() {
    if (document.getElementById('song-styles')) return;
    const style = document.createElement('style');
    style.id = 'song-styles';
    style.textContent = `
        .song-screen {
            background: linear-gradient(160deg, #FFF8F0 0%, #FFF0E8 60%, #FFE8D6 100%);
            display: flex; flex-direction: column;
            align-items: stretch; gap: 0;
        }

        /* ── Header ── */
        .song-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: var(--space-md) var(--space-lg);
            background: linear-gradient(135deg, #FFB300, #FF8A65);
            flex-shrink: 0;
        }
        .song-back-btn {
            background: rgba(255,255,255,0.25); border: none;
            color: #fff; font-size: 1.4rem; border-radius: 12px;
            width: 44px; height: 44px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        .song-title {
            font-family: var(--font-display); font-size: 1.4rem;
            font-weight: 800; color: #fff;
        }
        .song-note-icon { font-size: 1.6rem; animation: noteFloat 1.5s ease-in-out infinite; }
        @keyframes noteFloat {
            0%,100% { transform: translateY(0) rotate(-5deg); }
            50%      { transform: translateY(-6px) rotate(5deg); }
        }

        /* ── Letter Grid ── */
        .song-grid {
            flex: 1; overflow-y: auto;
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
            padding: var(--space-md);
            align-content: start;
        }

        .song-cell {
            aspect-ratio: 1;
            border-radius: 16px;
            background: var(--color-surface);
            box-shadow: 0 3px 8px rgba(0,0,0,0.10);
            border: 3px solid transparent;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 1px; cursor: pointer;
            transition: transform 120ms ease, box-shadow 120ms ease,
                        border-color 120ms ease, background 120ms ease;
            position: relative; overflow: hidden;
        }
        .song-cell:active { transform: scale(0.88); }

        .song-cell-letter {
            font-family: var(--font-display);
            font-size: clamp(1.2rem, 4vw, 1.6rem);
            font-weight: 900;
            color: var(--cell-color);
            line-height: 1;
        }
        .song-cell-emoji {
            font-size: clamp(0.9rem, 3vw, 1.2rem);
            line-height: 1;
        }

        /* Active — glowing highlight */
        .song-cell.active {
            background: var(--cell-color);
            border-color: white;
            box-shadow: 0 0 0 4px var(--cell-color), 0 6px 20px rgba(0,0,0,0.25);
            transform: scale(1.22);
            z-index: 2;
            animation: songCellPop 200ms cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .song-cell.active .song-cell-letter { color: #fff; }
        .song-cell.active .song-cell-emoji { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }

        /* Done — dimmed */
        .song-cell.done {
            opacity: 0.45;
            transform: scale(0.95);
        }

        /* Tap pop (tap-along during auto-play) */
        .song-cell.song-tap-pop {
            animation: songTapPop 280ms ease forwards;
        }

        @keyframes songCellPop {
            from { transform: scale(0.95); }
            to   { transform: scale(1.22); }
        }
        @keyframes songTapPop {
            0%   { transform: scale(1.0); }
            40%  { transform: scale(1.35); }
            100% { transform: scale(1.0); }
        }

        /* ── Controls ── */
        .song-controls {
            display: flex; gap: var(--space-md);
            justify-content: center; align-items: center;
            padding: var(--space-md) var(--space-lg) var(--space-xl);
            flex-shrink: 0;
        }
        .song-play-btn {
            flex: 1; max-width: 200px;
            padding: 14px 24px;
            border-radius: 50px; border: none; cursor: pointer;
            font-family: var(--font-display); font-size: 1.1rem; font-weight: 800;
            background: linear-gradient(135deg, #FFB300, #FF8A65);
            color: #fff;
            box-shadow: 0 4px 0 rgba(0,0,0,0.2), 0 6px 16px rgba(255,179,0,0.4);
            transition: transform 120ms ease, box-shadow 120ms ease;
        }
        .song-play-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,0.15); }
        .song-play-btn.playing {
            background: linear-gradient(135deg, #FF6B6B, #FF3B30);
            box-shadow: 0 4px 0 rgba(0,0,0,0.2), 0 6px 16px rgba(255,107,107,0.4);
        }
        .song-tap-btn {
            padding: 14px 20px;
            border-radius: 50px; border: 2px solid #FFB300; cursor: pointer;
            font-family: var(--font-display); font-size: 1rem; font-weight: 700;
            background: transparent; color: #FF8A65;
            transition: all 150ms ease;
        }
        .song-tap-btn.active {
            background: linear-gradient(135deg, #A78BFA, #7C3AED);
            border-color: transparent; color: #fff;
            box-shadow: 0 4px 0 rgba(124,58,237,0.3);
        }
        .song-tap-btn:active { transform: scale(0.92); }
    `;
    document.head.appendChild(style);
}
