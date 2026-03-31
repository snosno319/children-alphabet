/**
 * Stories Screen — Sight Words Star
 * Simple stories with sight words highlighted. Tap words to hear them.
 * Tap play to hear the whole sentence.
 */
import { STORIES } from './data.js';
import { speakWord, speakSentence, playPopSound, speakInstruction, playTinkle, playCelebrationSound } from '../shared/audio.js';
import { markStoryRead, addSightStars } from '../shared/storage.js';
import { checkAndAwardBadges } from '../shared/badges.js';

let currentStory = -1;
let currentSentence = 0;
let localNavigate = null;

export function renderStories(app, navigate) {
    localNavigate = navigate;
    currentStory = -1;
    currentSentence = 0;

    app.innerHTML = `
    <div class="screen stories-screen" id="stories">
      <div class="top-bar">
        <button class="back-btn" id="stories-back">🏠</button>
      </div>
      <div class="stories-content" id="stories-content">
        <div class="story-picker" id="story-picker">
          ${STORIES.map((s, i) => `
            <button class="story-btn" data-index="${i}" style="animation-delay: ${i * 80}ms">
              <span class="story-btn-emoji">${s.title}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <!-- Story Reader Overlay -->
      <div class="story-overlay" id="story-overlay" style="display:none">
        <div class="story-reader" id="story-reader"></div>
      </div>
    </div>
  `;

    document.getElementById('stories-back').addEventListener('click', () => {
        if (currentStory >= 0) {
            playPopSound();
            hideStory();
        } else {
            playPopSound();
            window.speechSynthesis?.cancel();
            navigate('sight-home');
        }
    });

    setTimeout(() => speakInstruction('stories_entry'), 600);

    document.getElementById('story-picker').addEventListener('click', (e) => {
        const btn = e.target.closest('.story-btn');
        if (!btn) return;
        playPopSound();
        showStory(parseInt(btn.dataset.index));
    });
}

function showStory(index) {
    window.speechSynthesis?.cancel();
    currentStory = index;
    currentSentence = 0;
    const story = STORIES[index];
    const overlay = document.getElementById('story-overlay');
    overlay.style.display = 'flex';

    markStoryRead(index);
    addSightStars(2);
    checkAndAwardBadges(localNavigate);

    renderSentence();
}

function renderSentence() {
    const story = STORIES[currentStory];
    const reader = document.getElementById('story-reader');
    const s = story.sentences[currentSentence];

    // Build highlighted sentence
    const words = s.text.split(' ');
    const highlighted = words.map(w => {
        const clean = w.replace(/[.,!?]/g, '');
        const isHighlight = s.highlights.some(h => h.toLowerCase() === clean.toLowerCase());
        if (isHighlight) {
            return `<button class="story-word highlight" data-word="${clean}">${w}</button>`;
        }
        return `<span class="story-word">${w}</span>`;
    }).join(' ');

    reader.innerHTML = `
    <div class="story-card" style="animation: celebratePop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards">
      <div class="story-title-emoji">${story.title}</div>
      <div class="story-sentence" id="story-sentence">${highlighted}</div>
      <div class="story-controls">
        <button class="story-play-btn" id="story-play">🔊</button>
      </div>
      <div class="story-nav">
        ${currentSentence > 0 ? '<button class="story-nav-btn" id="story-prev">◀</button>' : '<div></div>'}
        ${currentSentence < story.sentences.length - 1
            ? '<button class="story-nav-btn" id="story-next">▶</button>'
            : '<button class="story-done-btn" id="story-done">🎉</button>'
        }
      </div>
    </div>
  `;

    // Auto-read sentence
    setTimeout(() => speakSentence(s.text), 600);

    // Tap highlighted words
    reader.querySelectorAll('.story-word.highlight').forEach(el => {
        el.addEventListener('click', () => {
            playTinkle();
            speakWord(el.dataset.word);
            el.style.transform = 'scale(1.2)';
            setTimeout(() => el.style.transform = 'scale(1)', 200);
        });
    });

    // Play button
    document.getElementById('story-play')?.addEventListener('click', () => {
        speakSentence(s.text);
    });

    // Navigation
    document.getElementById('story-prev')?.addEventListener('click', () => {
        playPopSound();
        currentSentence--;
        renderSentence();
    });

    document.getElementById('story-next')?.addEventListener('click', () => {
        playPopSound();
        currentSentence++;
        renderSentence();
    });

    document.getElementById('story-done')?.addEventListener('click', () => {
        playCelebrationSound();
        hideStory();
    });
}

function hideStory() {
    document.getElementById('story-overlay').style.display = 'none';
    currentStory = -1;
    window.speechSynthesis?.cancel();
}

export function injectStoriesStyles() {
    if (document.getElementById('stories-styles')) return;
    const style = document.createElement('style');
    style.id = 'stories-styles';
    style.textContent = `
    .stories-screen { background: var(--color-bg); }
    .stories-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }

    .story-picker {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-xl);
      max-width: 500px;
    }
    .story-btn {
      width: 120px; height: 120px;
      border-radius: var(--radius-xl);
      background: var(--color-surface);
      box-shadow: var(--shadow-lg);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: transform var(--transition-bounce);
      animation: pop var(--transition-slow) backwards;
    }
    .story-btn:active { transform: scale(0.92); }
    .story-btn-emoji { font-size: 3.5rem; }

    /* Story overlay */
    .story-overlay {
      position: fixed; inset: 0; z-index: 50;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(12px);
    }
    .story-reader { width: 90%; max-width: 550px; }
    .story-card {
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      padding: var(--space-2xl) var(--space-xl);
      text-align: center;
      box-shadow: 0 12px 48px rgba(0,0,0,0.25);
    }
    .story-title-emoji { font-size: 4rem; margin-bottom: var(--space-lg); }
    .story-sentence {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 700;
      line-height: 2;
      margin-bottom: var(--space-xl);
      color: var(--color-text);
    }
    .story-word { display: inline; }
    .story-word.highlight {
      color: #7C4DFF;
      background: #EDE7F6;
      border: none;
      border-radius: var(--radius-sm);
      padding: 2px 6px;
      font-family: var(--font-display);
      font-size: inherit;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    .story-word.highlight:active { background: #D1C4E9; }

    .story-controls { margin-bottom: var(--space-lg); }
    .story-play-btn {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, #00BCD4, #00ACC1);
      box-shadow: var(--shadow-lg); font-size: 2.5rem;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; animation: pulse 2s ease-in-out infinite;
      transition: transform var(--transition-bounce);
    }
    .story-play-btn:active { transform: scale(0.9); }

    .story-nav {
      display: flex; justify-content: space-between; align-items: center;
    }
    .story-nav-btn {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(0,0,0,0.06); font-size: 1.3rem;
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-light); cursor: pointer;
    }
    .story-done-btn {
      width: 70px; height: 70px; border-radius: 50%;
      background: linear-gradient(135deg, #FFB300, #FF8F00);
      box-shadow: var(--shadow-lg); font-size: 2rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; animation: pulse 2s ease-in-out infinite;
    }

    @media (max-aspect-ratio: 1/1) {
      .story-picker { grid-template-columns: repeat(2, 1fr); }
      .story-sentence { font-size: var(--text-xl); }
    }
  `;
    document.head.appendChild(style);
}
