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
let isAutoRead = false;
let localNavigate = null;

export function renderStories(app, navigate) {
    localNavigate = navigate;
    currentStory = -1;
    currentSentence = 0;
    isAutoRead = false;

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
    isAutoRead = false;
    const story = STORIES[index];
    const overlay = document.getElementById('story-overlay');
    overlay.style.display = 'flex';

    markStoryRead(index);
    addSightStars(2);
    checkAndAwardBadges(localNavigate);

    renderSentence();
}

// Build char-offset map for word highlighting
function buildWordTokens(text) {
    const tokens = [];
    let pos = 0;
    text.split(' ').forEach((token, i) => {
        const clean = token.replace(/[.,!?]/g, '');
        tokens.push({ token, clean, charStart: pos, idx: i });
        pos += token.length + 1;
    });
    return tokens;
}

// Speak with per-word boundary highlighting
function speakWithHighlight(text, onEnd) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        onEnd && onEnd();
        return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.62;
    utt.pitch = 1.12;
    utt.onboundary = (e) => {
        if (e.name !== 'word') return;
        document.querySelectorAll('.story-word').forEach(el => el.classList.remove('speaking'));
        const els = document.querySelectorAll('.story-word[data-char-start]');
        for (const el of els) {
            const start = parseInt(el.dataset.charStart);
            const end = start + parseInt(el.dataset.wordLen, 10);
            if (start <= e.charIndex && e.charIndex < end) {
                el.classList.add('speaking');
                break;
            }
        }
    };
    utt.onend = () => {
        document.querySelectorAll('.story-word').forEach(el => el.classList.remove('speaking'));
        onEnd && onEnd();
    };
    window.speechSynthesis.speak(utt);
}

function renderSentence() {
    const story = STORIES[currentStory];
    const reader = document.getElementById('story-reader');
    const s = story.sentences[currentSentence];
    const tokens = buildWordTokens(s.text);
    const isLast = currentSentence >= story.sentences.length - 1;

    const highlighted = tokens.map(({ token, clean, charStart }) => {
        const isHL = s.highlights.some(h => h.toLowerCase() === clean.toLowerCase());
        const attrs = `data-char-start="${charStart}" data-word-len="${token.length}" data-word="${clean}"`;
        if (isHL) {
            return `<button class="story-word highlight" ${attrs}>${token}</button>`;
        }
        return `<span class="story-word" ${attrs}>${token}</span>`;
    }).join(' ');

    reader.innerHTML = `
    <div class="story-card" style="animation: celebratePop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards">
      <div class="story-card-top">
        <div class="story-title-emoji">${story.title}</div>
        <button class="story-autoread-btn ${isAutoRead ? 'active' : ''}" id="story-autoread" title="Read to me">
          ${isAutoRead ? '⏹ Stop' : '🔊 Read to me'}
        </button>
      </div>
      <div class="story-sentence" id="story-sentence">${highlighted}</div>
      <div class="story-controls">
        <button class="story-play-btn" id="story-play">🔊</button>
      </div>
      <div class="story-nav">
        ${currentSentence > 0 ? '<button class="story-nav-btn" id="story-prev">◀</button>' : '<div></div>'}
        ${!isLast
            ? '<button class="story-nav-btn" id="story-next">▶</button>'
            : '<button class="story-done-btn" id="story-done">🎉</button>'
        }
      </div>
    </div>
  `;

    // Start reading (with highlight if auto-read, plain sentence otherwise)
    if (isAutoRead) {
        speakWithHighlight(s.text, () => {
            if (!isAutoRead) return;
            if (!isLast) {
                setTimeout(() => {
                    if (!isAutoRead) return;
                    currentSentence++;
                    renderSentence();
                }, 800);
            } else {
                isAutoRead = false;
                document.getElementById('story-autoread')?.classList.remove('active');
            }
        });
    } else {
        setTimeout(() => speakSentence(s.text), 600);
    }

    // Auto-read toggle
    document.getElementById('story-autoread').addEventListener('click', () => {
        isAutoRead = !isAutoRead;
        if (isAutoRead) {
            speakWithHighlight(s.text, () => {
                if (!isAutoRead) return;
                if (currentSentence < story.sentences.length - 1) {
                    setTimeout(() => {
                        if (!isAutoRead) return;
                        currentSentence++;
                        renderSentence();
                    }, 800);
                } else {
                    isAutoRead = false;
                }
            });
            document.getElementById('story-autoread').textContent = '⏹ Stop';
            document.getElementById('story-autoread').classList.add('active');
        } else {
            window.speechSynthesis?.cancel();
            document.getElementById('story-autoread').textContent = '🔊 Read to me';
            document.getElementById('story-autoread').classList.remove('active');
        }
    });

    // Tap highlighted words
    reader.querySelectorAll('.story-word.highlight').forEach(el => {
        el.addEventListener('click', () => {
            playTinkle();
            speakWord(el.dataset.word);
            el.style.transform = 'scale(1.2)';
            setTimeout(() => el.style.transform = 'scale(1)', 200);
        });
    });

    // Play button — replays with highlight
    document.getElementById('story-play')?.addEventListener('click', () => {
        speakWithHighlight(s.text, null);
    });

    // Navigation — manual nav cancels auto-read
    document.getElementById('story-prev')?.addEventListener('click', () => {
        isAutoRead = false;
        window.speechSynthesis?.cancel();
        playPopSound();
        currentSentence--;
        renderSentence();
    });

    document.getElementById('story-next')?.addEventListener('click', () => {
        isAutoRead = false;
        window.speechSynthesis?.cancel();
        playPopSound();
        currentSentence++;
        renderSentence();
    });

    document.getElementById('story-done')?.addEventListener('click', () => {
        isAutoRead = false;
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

    /* Auto-read button */
    .story-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-lg);
    }
    .story-autoread-btn {
      background: #E8F5E9;
      color: #2E7D32;
      border: 2px solid #A5D6A7;
      border-radius: var(--radius-full);
      padding: var(--space-xs) var(--space-md);
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .story-autoread-btn.active {
      background: #FFEBEE;
      color: #C62828;
      border-color: #EF9A9A;
    }

    /* Word-by-word highlight while speaking */
    .story-word.speaking {
      background: #FFF176;
      border-radius: 4px;
      padding: 0 2px;
    }
    .story-word.highlight.speaking {
      background: #B39DDB;
      color: #fff;
    }

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
