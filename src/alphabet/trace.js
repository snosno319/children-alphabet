/**
 * Trace Screen — Trace Uppercase THEN Lowercase flow.
 * Auto-advances: Big A -> Small a -> Big B -> Small b...
 * Voice guidance adapts to case ("Now draw the small letter!").
 */
import { LETTERS } from './data.js';
import { speakLetter, playCorrectSound, playCelebrationSound, playPopSound, speakInstruction, speak } from '../shared/audio.js';
import { markTraced, addAlphabetStars } from '../shared/storage.js';
import { advanceJourney, exitJourney, getJourneyState } from '../shared/journey.js';

let currentIndex = 0;
let isUppercase = true; // State to track which case we are tracing
let canvas = null;
let ctx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let totalPixelsDrawn = 0;
let firstVisit = true;
let localNavigate = null; // store navigate

export function renderTrace(app, navigate, props = {}) {
  localNavigate = navigate;
  firstVisit = true;
  if (window.isJourneyMode && props.index !== undefined) {
    currentIndex = props.index;
  } else if (!window.isJourneyMode) {
    currentIndex = 0;
  }
  isUppercase = true; // Always start with uppercase
  const l = LETTERS[currentIndex];

  app.innerHTML = `
    <div class="screen trace-screen" id="trace">
      <div class="top-bar">
        <!-- Close (X) button if Journey, House if freeplay -->
        <button class="back-btn" id="trace-back">${window.isJourneyMode ? '✕' : '🏠'}</button>
        <div class="top-bar-title"></div>
        <div class="top-bar-right">
          <button class="back-btn" id="trace-clear">🗑️</button>
        </div>
      </div>
      
      <!-- Strip shows Aa Bb Cc ... -->
      <div class="trace-letter-strip" id="trace-strip">
        ${LETTERS.map((lt, i) => `
          <button class="trace-strip-btn ${i === currentIndex ? 'active' : ''}" data-index="${i}"
            style="--strip-color: ${lt.color}">
            ${lt.letter}${lt.letter.toLowerCase()}
          </button>
        `).join('')}
      </div>

      <div class="trace-canvas-wrapper" id="trace-canvas-wrapper">
        <canvas class="trace-canvas" id="trace-canvas"></canvas>
        
        <!-- The Letter Guide: Big or Small -->
        <div class="trace-letter-guide" id="trace-guide" style="color: ${l.color}25">
          ${l.letter}
        </div>

        ${firstVisit ? `<div class="trace-hand-hint" id="trace-hand-hint">
          <span class="trace-hand">☝️</span>
        </div>` : ''}
      </div>

      <div class="trace-controls">
        <button class="trace-ctrl-icon" id="trace-prev" style="${window.isJourneyMode ? 'visibility:hidden' : ''}">◀</button>
        <button class="trace-ctrl-done" id="trace-check">✅</button>
        <button class="trace-ctrl-icon" id="trace-next" style="${window.isJourneyMode ? 'visibility:hidden' : ''}">▶</button>
      </div>
    </div>
  `;

  setupCanvas();

  // Auto-speak on entry — gentle delay
  setTimeout(() => {
    speakInstruction('trace_entry');
    setTimeout(() => speak(l.letter, { rate: 0.6 }), 1500);
  }, 800);

  document.getElementById('trace-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    if (window.isJourneyMode) {
      exitJourney(navigate);
    } else {
      navigate('home');
    }
  });
  document.getElementById('trace-clear').addEventListener('click', () => { playPopSound(); clearCanvas(); });
  // Check button is manual trigger, but we also auto-check on pointer up potentially? 
  // For now stick to button to be safe, or maybe the existing auto-logic? 
  // The previous logic was "checkTracing" on click.
  document.getElementById('trace-check').addEventListener('click', () => { checkTracing(); });

  document.getElementById('trace-prev').addEventListener('click', () => { playPopSound(); goToLetter((currentIndex - 1 + 26) % 26); });
  document.getElementById('trace-next').addEventListener('click', () => { playPopSound(); goToLetter((currentIndex + 1) % 26); });

  document.getElementById('trace-strip').addEventListener('click', (e) => {
    if (window.isJourneyMode) return; // lock strip in journey mode
    const btn = e.target.closest('.trace-strip-btn');
    if (!btn) return;
    playPopSound();
    const idx = parseInt(btn.dataset.index);
    goToLetter(idx);
  });

  scrollStripToActive();
  
  if (window.isJourneyMode) {
    document.getElementById('trace-strip').style.opacity = '0.5';
    document.getElementById('trace-strip').style.pointerEvents = 'none';
  }
}

let resizeCanvasHandler = null;

function setupCanvas() {
  canvas = document.getElementById('trace-canvas');
  const wrapper = document.getElementById('trace-canvas-wrapper');
  ctx = canvas.getContext('2d');

  // Remove any previous resize listener before adding a new one
  if (resizeCanvasHandler) {
    window.removeEventListener('resize', resizeCanvasHandler);
  }

  resizeCanvasHandler = () => {
    const rect = wrapper.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };
  resizeCanvasHandler();
  window.addEventListener('resize', resizeCanvasHandler);

  // Mouse/Touch events
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    removeHandHint();
    startDraw({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  });
  canvas.addEventListener('touchend', (e) => { e.preventDefault(); stopDraw(); });
  canvas.addEventListener('mousedown', removeHandHint, { once: true });
}

function removeHandHint() {
  const hint = document.getElementById('trace-hand-hint');
  if (hint) hint.remove();
  firstVisit = false;
}

function startDraw(e) {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
}

function draw(e) {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const l = LETTERS[currentIndex];

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = l.color;
  ctx.lineWidth = 12; // Thicker for kids
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  totalPixelsDrawn += Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
  lastX = x;
  lastY = y;
}

function stopDraw() { isDrawing = false; }

function clearCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
  totalPixelsDrawn = 0;
}

function checkTracing() {
  const l = LETTERS[currentIndex];
  // Simple verification: did they draw enough?
  if (totalPixelsDrawn > 100) {
    handleSuccess(l);
  } else {
    const guide = document.getElementById('trace-guide');
    guide.style.animation = 'shake 500ms ease';
    setTimeout(() => { guide.style.animation = ''; }, 500);
    speakInstruction('trace_prompt');
  }
}

function handleSuccess(l) {
  playCorrectSound();

  if (isUppercase) {
    // Just finished Uppercase -> Go to Lowercase
    speakInstruction('trace_done'); // "Great job!"
    showTraceCelebration(l.letter, () => {
      // Switch to lowercase
      isUppercase = false;
      updateGuide();
      clearCanvas();
      speakInstruction('trace_small');
    });
  } else {
    // Finished Lowercase -> Next Letter
    speakInstruction('trace_done');
    markTraced(l.letter);
    addAlphabetStars(2);
    showTraceCelebration(l.letter.toLowerCase(), () => {
      // If Journey mode, advance to next step immediately
      if (window.isJourneyMode) {
        advanceJourney(localNavigate);
      } else {
        // Free play: Go to next letter (Uppercase)
        goToLetter((currentIndex + 1) % 26);
      }
    });
  }
}

function showTraceCelebration(char, callback) {
  const wrapper = document.getElementById('trace-canvas-wrapper');
  const l = LETTERS[currentIndex];
  const celebDiv = document.createElement('div');
  celebDiv.className = 'trace-celebration';
  celebDiv.innerHTML = `
    <div class="trace-celeb-content">
      <div class="celebration-emoji">🌟</div>
      <div class="trace-celeb-letter" style="color: ${l.color}">${char}</div>
      <div style="font-size: 3rem; margin-top: 10px;">${l.emoji}</div>
    </div>
  `;
  wrapper.appendChild(celebDiv);
  playCelebrationSound();
  setTimeout(() => {
    celebDiv.remove();
    if (callback) callback();
  }, 2000);
}

function updateGuide() {
  const l = LETTERS[currentIndex];
  const guide = document.getElementById('trace-guide');
  guide.textContent = isUppercase ? l.letter : l.letter.toLowerCase();
  guide.style.color = l.color + '25';
}

function goToLetter(index) {
  currentIndex = index;
  isUppercase = true; // Reset to Uppercase on new letter
  const l = LETTERS[index];

  updateGuide();

  document.querySelectorAll('.trace-strip-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  clearCanvas();
  scrollStripToActive();
  speakLetter(l.letter);
}

function scrollStripToActive() {
  const strip = document.getElementById('trace-strip');
  const active = strip?.querySelector('.active');
  if (active && strip) {
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

export function injectTraceStyles() {
  if (document.getElementById('trace-styles')) return;
  const style = document.createElement('style');
  style.id = 'trace-styles';
  style.textContent = `
    .trace-screen { background: var(--color-bg); }
    .trace-letter-strip { display: flex; gap: var(--space-sm); padding: var(--space-sm) var(--space-lg); overflow-x: auto; flex-shrink: 0; }
    .trace-strip-btn { 
      min-width: 60px; height: 56px; border-radius: var(--radius-md); 
      background: var(--color-surface); box-shadow: var(--shadow-sm); 
      font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; 
      color: var(--strip-color); transition: transform var(--transition-bounce); flex-shrink: 0;
      border: 2px solid transparent; 
    }
    .trace-strip-btn.active { 
      background: var(--strip-color); color: white; 
      box-shadow: var(--shadow-md); transform: scale(1.1); 
      border-color: rgba(0,0,0,0.1);
    }
    .trace-strip-btn:active { transform: scale(0.95); }
    
    .trace-canvas-wrapper { 
      flex: 1; position: relative; margin: var(--space-md) var(--space-lg); 
      border-radius: var(--radius-xl); background: var(--color-surface); 
      box-shadow: var(--shadow-lg); overflow: hidden; 
    }
    .trace-canvas { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; touch-action: none; z-index: 2; }
    
    .trace-letter-guide { 
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; 
      font-family: var(--font-display); font-size: min(50vw, 45vh); font-weight: 900; 
      pointer-events: none; z-index: 0; line-height: 1; 
      user-select: none;
    }

    /* Controls */
    .trace-controls { display: flex; align-items: center; justify-content: center; gap: var(--space-xl); padding: var(--space-md) var(--space-lg); flex-shrink: 0; }
    .trace-ctrl-icon {
      width: 60px; height: 60px; border-radius: 50%;
      background: var(--color-surface); box-shadow: var(--shadow-md);
      font-size: var(--text-xl); display: flex; align-items: center; justify-content: center;
      border: none; cursor: pointer; color: var(--color-text-light);
      transition: transform var(--transition-bounce);
    }
    .trace-ctrl-icon:active { transform: scale(0.9); }
    .trace-ctrl-done {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark));
      box-shadow: var(--shadow-lg);
      font-size: 2.5rem; display: flex; align-items: center; justify-content: center;
      border: none; cursor: pointer;
      transition: transform var(--transition-bounce);
      animation: pulse 2.5s ease-in-out infinite;
    }
    .trace-ctrl-done:active { transform: scale(0.9); }

    /* Hint */
    .trace-hand-hint {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none; z-index: 5;
      animation: traceHandAnim 2s ease-in-out infinite;
    }
    .trace-hand { font-size: 3rem; }

    /* Celebration Overlay */
    .trace-celebration { 
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; 
      background: rgba(255,255,255,0.95); z-index: 10; 
      animation: screenFadeIn 300ms forwards; 
    }
    .trace-celeb-content { text-align: center; animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .trace-celeb-letter { font-family: var(--font-display); font-size: 8rem; font-weight: 800; line-height: 1; }
  `;
  document.head.appendChild(style);
}
