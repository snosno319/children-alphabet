/**
 * Flashcards Screen — Sight Words Star
 * Large word card centered. Tap to hear word + sentence. Arrows to navigate.
 */
import { SIGHT_WORDS } from './data.js';
import { speakWordWithSentence, speakWord, playPopSound, speakInstruction, playSwipeSound, playTinkle } from '../shared/audio.js';
import { markWordLearned, addSightStars, getSightLearnedWords } from '../shared/storage.js';

let cardIndex = 0;
let sessionWords = [];

export function renderFlashcards(app, navigate) {
  cardIndex = 0;
  // Prioritize unlearned words, then mix in learned ones
  const learned = getSightLearnedWords();
  const unlearned = SIGHT_WORDS.filter(w => !learned.includes(w.word));
  const learnedWords = SIGHT_WORDS.filter(w => learned.includes(w.word));
  const sorted = [...unlearned.sort(() => Math.random() - 0.5), ...learnedWords.sort(() => Math.random() - 0.5)];
  sessionWords = sorted.slice(0, 10);

  app.innerHTML = `
    <div class="screen flashcard-screen" id="flashcards">
      <div class="top-bar">
        <button class="back-btn" id="fc-back">🏠</button>
        <div class="top-bar-right">
          <span class="fc-counter" id="fc-counter">1/${sessionWords.length}</span>
        </div>
      </div>
      <div class="fc-content" id="fc-content"></div>
    </div>
  `;

  document.getElementById('fc-back').addEventListener('click', () => {
    playPopSound();
    window.speechSynthesis.cancel();
    navigate('home');
  });

  if (sessionWords.length === 0) return;

  setTimeout(() => {
    speakInstruction('flashcard_entry');
    setTimeout(() => showCard(), 2000);
  }, 600);
}

function showCard() {
  if (cardIndex >= sessionWords.length) {
    cardIndex = 0; // loop
  }
  const word = sessionWords[cardIndex];
  const content = document.getElementById('fc-content');
  const counter = document.getElementById('fc-counter');
  counter.textContent = `${cardIndex + 1}/${sessionWords.length}`;

  const isLearned = getSightLearnedWords().includes(word.word);

  content.innerHTML = `
    <div class="fc-card-area">
      <button class="fc-card" id="fc-card" style="--card-color: ${word.color}">
        <span class="fc-card-emoji">${word.emoji}</span>
        <span class="fc-card-word" style="color: ${word.color}">${word.word}</span>
        <span class="fc-card-star ${isLearned ? 'learned' : ''}" id="fc-star">${isLearned ? '⭐' : '☆'}</span>
      </button>
      <div class="fc-nav">
        <button class="fc-nav-btn" id="fc-prev">◀</button>
        <button class="fc-learn-btn ${isLearned ? 'already' : ''}" id="fc-learn">${isLearned ? '⭐' : '☆'}</button>
        <button class="fc-nav-btn" id="fc-next">▶</button>
      </div>
    </div>
  `;

  // Auto-speak word
  setTimeout(() => speakWord(word.word), 500);

  // Tap card to hear full context
  document.getElementById('fc-card').addEventListener('click', () => {
    playTinkle();
    speakWordWithSentence(word.word, word.sentence);
  });

  document.getElementById('fc-prev').addEventListener('click', () => {
    playSwipeSound();
    cardIndex = (cardIndex - 1 + sessionWords.length) % sessionWords.length;
    showCard();
  });

  document.getElementById('fc-next').addEventListener('click', () => {
    playSwipeSound();
    cardIndex = (cardIndex + 1) % sessionWords.length;
    showCard();
  });

  document.getElementById('fc-learn').addEventListener('click', () => {
    if (!getSightLearnedWords().includes(word.word)) {
      markWordLearned(word.word);
      addSightStars(2);
      playTinkle();
      const star = document.getElementById('fc-star');
      star.textContent = '⭐';
      star.classList.add('learned');
      const btn = document.getElementById('fc-learn');
      btn.textContent = '⭐';
      btn.classList.add('already');
    }
  });
}

export function injectFlashcardStyles() {
  if (document.getElementById('flashcard-styles')) return;
  const style = document.createElement('style');
  style.id = 'flashcard-styles';
  style.textContent = `
    .flashcard-screen { background: var(--color-bg); }
    .fc-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .fc-counter { font-family: var(--font-display); font-weight: 700; font-size: var(--text-lg); color: var(--color-text-light); }

    .fc-card-area { display: flex; flex-direction: column; align-items: center; gap: var(--space-xl); animation: pop var(--transition-slow) forwards; }

    .fc-card {
      width: 320px; height: 380px;
      border-radius: var(--radius-xl);
      background: var(--color-surface);
      box-shadow: var(--shadow-xl);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: var(--space-lg);
      cursor: pointer;
      transition: transform var(--transition-bounce);
      border-top: 8px solid var(--card-color);
      position: relative;
    }
    .fc-card:active { transform: scale(0.96); }
    .fc-card-emoji { font-size: 5rem; animation: float 3s ease-in-out infinite; }
    .fc-card-word { font-family: var(--font-display); font-size: var(--text-4xl); font-weight: 900; }
    .fc-card-star { position: absolute; top: var(--space-md); right: var(--space-md); font-size: 1.5rem; opacity: 0.4; }
    .fc-card-star.learned { opacity: 1; animation: pop 300ms ease; }

    .fc-nav { display: flex; gap: var(--space-xl); align-items: center; }
    .fc-nav-btn {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--color-surface); box-shadow: var(--shadow-md);
      font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
      color: var(--color-text-light); cursor: pointer;
      transition: transform var(--transition-bounce);
    }
    .fc-nav-btn:active { transform: scale(0.9); }
    .fc-learn-btn {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #FFB300, #FF8F00);
      box-shadow: var(--shadow-lg);
      font-size: 2rem; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: transform var(--transition-bounce);
    }
    .fc-learn-btn.already { background: linear-gradient(135deg, #4CAF50, #388E3C); }
    .fc-learn-btn:active { transform: scale(0.9); }

    @media (max-aspect-ratio: 1/1) {
      .fc-card { width: 280px; height: 340px; }
      .fc-card-word { font-size: var(--text-3xl); }
    }
  `;
  document.head.appendChild(style);
}
