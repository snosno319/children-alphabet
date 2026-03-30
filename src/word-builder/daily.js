/**
 * Daily Challenge Screen — Word Builder Lab
 * One word per day. Child spells it to maintain their streak.
 * Premium subscription feature.
 */
import { getDailyWord, ALL_CONSONANTS } from './data.js';
import { speakWord, playCorrectSound, playWrongSound, playPopSound, playCelebrationSound, speakInstruction, playSnapSound, speak } from '../shared/audio.js';
import { completeDailyChallenge, isDailyCompleted, getStreak, addWordBuilderStars } from '../shared/storage.js';
import { spawnConfetti } from '../shared/confetti.js';
import { advanceJourney, exitJourney } from '../shared/journey.js';

export function renderDaily(app, navigate, props = {}) {
  const dailyWord = getDailyWord();
  const alreadyDone = isDailyCompleted();

  if (alreadyDone) {
    showAlreadyComplete(app, navigate);
    return;
  }

  let selectedLetters = [];
  let answered = false;
  const correctLetters = dailyWord.word.split('');
  const distractors = ALL_CONSONANTS.filter(c => !correctLetters.includes(c)).sort(() => Math.random() - 0.5).slice(0, 5);
  const bank = [...correctLetters, ...distractors].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="screen daily-screen" id="daily">
      <div class="top-bar">
        <button class="back-btn" id="daily-back">${window.isJourneyMode ? '✕' : '🏠'}</button>
        <div class="top-bar-title">Daily Word</div>
        <div class="top-bar-right">
          <span class="daily-streak">🔥 ${getStreak()}</span>
        </div>
      </div>
      <div class="daily-content" id="daily-content">
        <div class="daily-card">
          <div class="daily-label">⭐ Daily Word ⭐</div>
          <div class="daily-emoji">${dailyWord.emoji}</div>
          <div class="daily-slots" id="daily-slots">
            ${correctLetters.map((_, i) => `<div class="daily-slot" id="dslot-${i}"></div>`).join('')}
          </div>
          <div class="daily-bank" id="daily-bank">
            ${bank.map((letter, i) => `
              <button class="daily-letter-btn" data-letter="${letter}" id="dbank-${i}" style="animation-delay:${i * 40}ms">${letter}</button>
            `).join('')}
          </div>
          <div class="daily-feedback" id="daily-feedback"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('daily-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis?.cancel();
    if (window.isJourneyMode) exitJourney(navigate);
    else navigate('wordBuilder-home');
  });

  setTimeout(() => {
    speakInstruction('daily_entry');
    setTimeout(() => speakWord(dailyWord.word), 2500);
  }, 600);

  document.getElementById('daily-bank').addEventListener('click', (e) => {
    const btn = e.target.closest('.daily-letter-btn');
    if (!btn || answered || btn.classList.contains('used')) return;

    const letter = btn.dataset.letter;
    const idx = selectedLetters.length;
    const correct = dailyWord.word[idx];

    if (letter === correct) {
      playSnapSound();
      selectedLetters.push(letter);
      btn.classList.add('used');
      const slot = document.getElementById(`dslot-${idx}`);
      slot.textContent = letter;
      slot.classList.add('filled');
      slot.style.color = dailyWord.categoryColor;

      if (selectedLetters.length === dailyWord.word.length) {
        answered = true;
        completeDailyChallenge();
        addWordBuilderStars(10);
        spawnConfetti();

        setTimeout(async () => {
          playCorrectSound();
          const feedback = document.getElementById('daily-feedback');
          feedback.innerHTML = '🎉🔥🎉';
          feedback.className = 'daily-feedback correct-fb';
          await speak(dailyWord.word, { spellOut: true });
          showDailyComplete(app, navigate, props.localNavigate || navigate);
        }, 300);
      }
    } else {
      playWrongSound();
      btn.classList.add('wrong');
      btn.style.animation = 'shake 400ms ease';
      setTimeout(() => { btn.classList.remove('wrong'); btn.style.animation = ''; }, 400);
    }
  });
}

function showAlreadyComplete(app, navigate) {
  const streak = getStreak();
  app.innerHTML = `
    <div class="screen daily-screen" id="daily">
      <div class="top-bar">
        <button class="back-btn" id="daily-back2">🏠</button>
      </div>
      <div class="daily-content">
        <div class="daily-done-card">
          <div class="daily-done-emoji">✅</div>
          <div class="daily-done-streak">🔥 ${streak} day streak!</div>
          <div class="daily-done-msg">Come back tomorrow!</div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('daily-back2').addEventListener('click', () => {
    playPopSound(); navigate('wordBuilder-home');
  });
  speakInstruction('results_great');
}

function showDailyComplete(app, navigate, localNavigate) {
  const streak = getStreak();
  const content = document.getElementById('daily-content');
  content.innerHTML = `
    <div class="daily-complete">
      <div class="daily-complete-emoji">🏆</div>
      <div class="daily-complete-streak">🔥 ${streak} day streak!</div>
      <div class="daily-complete-stars">⭐ +10 stars!</div>
      <button class="daily-home-btn" id="daily-done-btn">${window.isJourneyMode ? 'Continue' : '🏠'}</button>
    </div>
  `;
  document.getElementById('daily-done-btn').addEventListener('click', () => {
    playPopSound();
    if (window.isJourneyMode) {
        advanceJourney(localNavigate);
    } else {
        navigate('wordBuilder-home');
    }
  });
}

export function injectDailyStyles() {
  if (document.getElementById('daily-styles')) return;
  const style = document.createElement('style');
  style.id = 'daily-styles';
  style.textContent = `
    .daily-screen { background: linear-gradient(160deg, #FFF8E1 0%, #FFE082 50%, #FFD54F 100%); }
    .daily-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .daily-streak { font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); color: #FF6B6B; }

    .daily-card { text-align: center; background: #FFFFFF; border-radius: var(--radius-xl); padding: var(--space-2xl) var(--space-xl); box-shadow: var(--shadow-xl); animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; max-width: 480px; width: 100%; }
    .daily-label { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: #FFB300; margin-bottom: var(--space-md); letter-spacing: 2px; }
    .daily-emoji { font-size: 80px; margin-bottom: var(--space-lg); animation: float 3s ease-in-out infinite; }

    .daily-slots { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-xl); }
    .daily-slot { width: 65px; height: 75px; border-radius: var(--radius-lg); background: #FFF9C4; border: 4px dashed rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 900; transition: all 0.3s ease; }
    .daily-slot.filled { border-style: solid; border-color: currentColor; animation: pop 300ms ease; background: #FFFFFF; }

    .daily-bank { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-md); max-width: 400px; margin: 0 auto; }
    .daily-letter-btn { width: 60px; height: 60px; border-radius: var(--radius-lg); background: #FFF9C4; box-shadow: var(--shadow-md); font-family: var(--font-display); font-size: var(--text-xl); font-weight: 800; color: #1B5E20; transition: transform var(--transition-bounce); animation: pop var(--transition-slow) backwards; cursor: pointer; border: 3px solid transparent; }
    .daily-letter-btn:active { transform: scale(0.9); }
    .daily-letter-btn.used { opacity: 0.25; pointer-events: none; }
    .daily-letter-btn.wrong { border-color: #FF6B6B; background: #FFEBEE; }

    .daily-feedback { margin-top: var(--space-lg); font-size: 2.5rem; min-height: 50px; }
    .correct-fb { animation: pop 300ms ease; }

    .daily-done-card, .daily-complete { text-align: center; animation: celebratePop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .daily-done-emoji, .daily-complete-emoji { font-size: 100px; margin-bottom: var(--space-lg); animation: bounce 1.5s ease-in-out infinite; }
    .daily-done-streak, .daily-complete-streak { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: #FF6B6B; margin-bottom: var(--space-md); }
    .daily-done-msg { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; color: var(--color-text-muted); }
    .daily-complete-stars { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: #FFB300; margin-bottom: var(--space-xl); }
    .daily-home-btn { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #2E7D32, #1B5E20); box-shadow: var(--shadow-lg); font-size: 2rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; animation: pulse 2s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}
