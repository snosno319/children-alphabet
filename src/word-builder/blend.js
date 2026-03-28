/**
 * Blend Screen — Word Builder Lab
 * Shows onset + rime. Child taps both parts to hear them, then taps "blend" to hear the full word.
 * 6 words per session.
 */
import { getRandomWords } from './data.js';
import { speakBlend, speakWord, playCorrectSound, playPopSound, playCelebrationSound, speakInstruction, playWhooshSound, speak, delay } from '../shared/audio.js';
import { markWordBlended, addWordBuilderStars } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';

let words = [];
let wordIndex = 0;

export function renderBlend(app, navigate) {
  wordIndex = 0;
  words = getRandomWords(6);

  app.innerHTML = `
    <div class="screen blend-screen" id="blend">
      <div class="top-bar">
        <button class="back-btn" id="blend-back">🏠</button>
        <div class="top-bar-right"><span class="blend-score" id="blend-score">⭐ 0</span></div>
      </div>
      <div class="blend-progress-bar"><div class="blend-progress-fill" id="blend-progress" style="width:0%"></div></div>
      <div class="blend-content" id="blend-content"></div>
    </div>
  `;

  document.getElementById('blend-back').addEventListener('click', () => {
    playPopSound(); window.speechSynthesis.cancel(); navigate('home');
  });

  setTimeout(() => {
    speakInstruction('blend_entry');
    setTimeout(() => showBlendWord(), 2500);
  }, 800);
}

function showBlendWord() {
  if (wordIndex >= words.length) { showBlendResults(); return; }
  const w = words[wordIndex];
  const content = document.getElementById('blend-content');
  document.getElementById('blend-progress').style.width = `${(wordIndex / 6) * 100}%`;

  // Split word into onset (first letter) and rime (rest)
  const onset = w.word[0];
  const rime = w.word.slice(1);

  content.innerHTML = `
    <div class="blend-question">
      <div class="blend-emoji">${w.emoji}</div>
      <div class="blend-parts">
        <button class="blend-part onset-part" id="blend-onset" style="--part-color: ${w.categoryColor}">${onset}</button>
        <span class="blend-plus">+</span>
        <button class="blend-part rime-part" id="blend-rime" style="--part-color: ${w.categoryColor}">${rime}</button>
      </div>
      <button class="blend-merge-btn" id="blend-merge">🔊 Blend!</button>
      <div class="blend-feedback" id="blend-feedback"></div>
    </div>
  `;

  // Say onset when tapped
  document.getElementById('blend-onset').addEventListener('click', () => {
    speak(onset, { rate: 0.5, pitch: 1.2 });
    document.getElementById('blend-onset').style.transform = 'scale(1.15)';
    setTimeout(() => document.getElementById('blend-onset').style.transform = '', 200);
  });

  // Say rime when tapped
  document.getElementById('blend-rime').addEventListener('click', () => {
    speak(rime, { rate: 0.5, pitch: 1.2 });
    document.getElementById('blend-rime').style.transform = 'scale(1.15)';
    setTimeout(() => document.getElementById('blend-rime').style.transform = '', 200);
  });

  // Merge button: blend and advance
  document.getElementById('blend-merge').addEventListener('click', async () => {
    const btn = document.getElementById('blend-merge');
    btn.style.pointerEvents = 'none';
    playWhooshSound();

    // Animate parts moving together
    document.getElementById('blend-onset').classList.add('merging-left');
    document.getElementById('blend-rime').classList.add('merging-right');
    document.querySelector('.blend-plus').style.opacity = '0';

    await delay(400);
    await speakBlend(onset, rime);

    markWordBlended(w.word);
    addWordBuilderStars(2);
    document.getElementById('blend-score').textContent = `⭐ ${(wordIndex + 1) * 2}`;

    playCorrectSound();
    document.getElementById('blend-feedback').innerHTML = '🎉';
    document.getElementById('blend-feedback').className = 'blend-feedback correct-fb';
    await speakInstruction('correct');

    setTimeout(() => { wordIndex++; showBlendWord(); }, 1500);
  });

  // Auto-prompt
  setTimeout(() => speakWord(w.word), 800);
}



function showBlendResults() {
  const content = document.getElementById('blend-content');
  document.getElementById('blend-progress').style.width = '100%';
  playCelebrationSound();
  spawnConfetti();
  content.innerHTML = `
    <div class="blend-results">
      <div class="blend-results-emoji">🏆</div>
      <div class="blend-results-stars">${'⭐'.repeat(6)}</div>
      <button class="blend-retry-btn" id="blend-retry">🔄</button>
    </div>
  `;
  speakInstruction('results_great');
  document.getElementById('blend-retry').addEventListener('click', () => {
    playPopSound(); wordIndex = 0;
    words = getRandomWords(6);
    document.getElementById('blend-score').textContent = '⭐ 0';
    speakInstruction('blend_entry');
    setTimeout(() => showBlendWord(), 2500);
  });
}

export function injectBlendStyles() {
  if (document.getElementById('blend-styles')) return;
  const style = document.createElement('style');
  style.id = 'blend-styles';
  style.textContent = `
    .blend-screen { background: var(--color-bg); }
    .blend-progress-bar { height: 8px; background: rgba(0,0,0,0.06); margin: 0 var(--space-lg); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
    .blend-progress-fill { height: 100%; background: linear-gradient(90deg, #FF6B6B, #F472B6); border-radius: 4px; transition: width 400ms ease; }
    .blend-score { font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); color: var(--color-accent-yellow); }
    .blend-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .blend-question { text-align: center; width: 100%; max-width: 500px; animation: pop var(--transition-slow) forwards; }
    .blend-emoji { font-size: 80px; margin-bottom: var(--space-xl); animation: float 3s ease-in-out infinite; }

    .blend-parts { display: flex; align-items: center; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-xl); }
    .blend-part {
      padding: var(--space-md) var(--space-xl);
      border-radius: var(--radius-xl);
      background: var(--color-surface);
      box-shadow: var(--shadow-lg);
      font-family: var(--font-display);
      font-size: var(--text-4xl); font-weight: 900;
      color: var(--part-color);
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .blend-part:active { transform: scale(0.92); }
    .blend-plus { font-size: var(--text-2xl); font-weight: 700; color: var(--color-text-muted); transition: opacity 0.3s; }

    .merging-left { animation: mergeLeft 400ms ease forwards; }
    .merging-right { animation: mergeRight 400ms ease forwards; }
    @keyframes mergeLeft { to { transform: translateX(20px); } }
    @keyframes mergeRight { to { transform: translateX(-20px); } }

    .blend-merge-btn {
      padding: var(--space-md) var(--space-2xl);
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, #FF6B6B, #E53E3E);
      box-shadow: var(--shadow-lg);
      color: white;
      font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700;
      cursor: pointer; animation: pulse 2s ease-in-out infinite;
      transition: transform var(--transition-bounce);
    }
    .blend-merge-btn:active { transform: scale(0.92); }

    .blend-feedback { margin-top: var(--space-lg); font-size: 3rem; min-height: 60px; }
    .correct-fb { animation: pop 300ms ease; }

    .blend-results { text-align: center; animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .blend-results-emoji { font-size: 100px; margin-bottom: var(--space-lg); animation: bounce 1.5s ease-in-out infinite; }
    .blend-results-stars { font-size: 2rem; letter-spacing: 4px; margin-bottom: var(--space-xl); }
    .blend-retry-btn { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #FF6B6B, #E53E3E); box-shadow: var(--shadow-lg); font-size: 2.5rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; animation: pulse 2s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}
