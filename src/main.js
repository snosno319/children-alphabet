/**
 * English Adventure — Main Router
 *
 * Single entry point for the app. Maps screen IDs to render functions and
 * handles screen transitions. All navigation goes through `navigate(screen, props)`.
 */
import { preloadVoices } from './shared/audio.js';

// Hub
import { renderHub, injectHubStyles } from './hub/home.js';
import { renderProfileScreen, injectProfileStyles } from './screens/profile.js';

// Parents
import { renderParents, injectParentsStyles } from './screens/parents.js';

// Badges
import { renderBadges, injectBadgesStyles } from './screens/badges.js';

// Alphabet
import { renderHome as renderAlphabetHome, injectHomeStyles as injectAlphabetHomeStyles } from './alphabet/home.js';
import { renderExplore, injectExploreStyles } from './alphabet/explore.js';
import { renderTrace, injectTraceStyles } from './alphabet/trace.js';
import { renderQuiz as renderAlphabetQuiz, injectQuizStyles as injectAlphabetQuizStyles } from './alphabet/quiz.js';
import { renderSong, injectSongStyles } from './alphabet/song.js';
import { renderMemory, injectMemoryStyles } from './alphabet/memory.js';
import { renderCaseMatch, injectCaseMatchStyles } from './alphabet/case-match.js';
import { renderHome as renderNumbersHome, injectHomeStyles as injectNumbersHomeStyles } from './numbers/home.js';
import { renderExplore as renderNumbersExplore, injectExploreStyles as injectNumbersExploreStyles } from './numbers/explore.js';
import { renderQuiz as renderNumbersQuiz, injectQuizStyles as injectNumbersQuizStyles } from './numbers/quiz.js';

// CVC Words
import { renderHome as renderCvcHome, injectHomeStyles as injectCvcHomeStyles } from './cvc/home.js';
import { renderExplore as renderCvcExplore, injectExploreStyles as injectCvcExploreStyles } from './cvc/explore.js';
import { renderBuild, injectBuildStyles } from './cvc/build.js';
import { renderQuiz as renderCvcQuiz, injectQuizStyles as injectCvcQuizStyles } from './cvc/quiz.js';

// Sight Words
import { renderHome as renderSightHome, injectHomeStyles as injectSightHomeStyles } from './sight/home.js';
import { renderFlashcards, injectFlashcardStyles } from './sight/flashcards.js';
import { renderMatch, injectMatchStyles } from './sight/match.js';
import { renderStories, injectStoriesStyles } from './sight/stories.js';

// Word Builder
import { renderHome as renderWbHome, injectHomeStyles as injectWbHomeStyles } from './word-builder/home.js';
import { renderSpell, injectSpellStyles } from './word-builder/spell.js';
import { renderPicMatch, injectPicMatchStyles } from './word-builder/picmatch.js';
import { renderBlend, injectBlendStyles } from './word-builder/blend.js';
import { renderDaily, injectDailyStyles } from './word-builder/daily.js';

// Phonics Lab
import { renderHome as renderPhonicsHome, injectHomeStyles as injectPhonicsHomeStyles } from './phonics/home.js';
import { renderSoundMatch, injectSoundMatchStyles } from './phonics/sound-match.js';
import { renderSoundSort, injectSoundSortStyles } from './phonics/sound-sort.js';
import { renderEndSound, injectEndSoundStyles } from './phonics/end-sound.js';

// Rhyme Time
import { renderHome as renderRhymeHome, injectHomeStyles as injectRhymeHomeStyles } from './rhyme/home.js';
import { renderRhymeMatch, injectRhymeMatchStyles } from './rhyme/rhyme-match.js';
import { renderRhymeSort, injectRhymeSortStyles } from './rhyme/rhyme-sort.js';
import { renderOddOneOut, injectOddOneOutStyles } from './rhyme/odd-one-out.js';

const app = document.getElementById('app');
let currentScreen = null;

// Map screen IDs to renderers + style injectors
const SCREENS = {
    // Hub, Profile, Parents
    'hub': { render: renderHub, styles: injectHubStyles },
    'profile': { render: renderProfileScreen, styles: injectProfileStyles },
    'parents': { render: renderParents, styles: injectParentsStyles },
    'badges': { render: renderBadges, styles: injectBadgesStyles },

    // Alphabet
    'alphabet-home': { render: renderAlphabetHome, styles: injectAlphabetHomeStyles },
    'explore': { render: renderExplore, styles: injectExploreStyles },
    'trace': { render: renderTrace, styles: injectTraceStyles },
    'quiz': { render: renderAlphabetQuiz, styles: injectAlphabetQuizStyles },
    'song': { render: renderSong, styles: injectSongStyles },
    'memory': { render: renderMemory, styles: injectMemoryStyles },
    'case-match': { render: renderCaseMatch, styles: injectCaseMatchStyles },

    // Numbers
    'numbers-home':    { render: renderNumbersHome,    styles: injectNumbersHomeStyles },
    'numbers-explore': { render: renderNumbersExplore, styles: injectNumbersExploreStyles },
    'numbers-quiz':    { render: renderNumbersQuiz,    styles: injectNumbersQuizStyles },

    // CVC Words
    'cvc-home': { render: renderCvcHome, styles: injectCvcHomeStyles },
    'cvc-explore': { render: renderCvcExplore, styles: injectCvcExploreStyles },
    'build': { render: renderBuild, styles: injectBuildStyles },
    'cvc-quiz': { render: renderCvcQuiz, styles: injectCvcQuizStyles },

    // Sight Words
    'sight-home': { render: renderSightHome, styles: injectSightHomeStyles },
    'flashcards': { render: renderFlashcards, styles: injectFlashcardStyles },
    'match': { render: renderMatch, styles: injectMatchStyles },
    'stories': { render: renderStories, styles: injectStoriesStyles },

    // Word Builder
    'wordBuilder-home': { render: renderWbHome, styles: injectWbHomeStyles },
    'spell': { render: renderSpell, styles: injectSpellStyles },
    'picmatch': { render: renderPicMatch, styles: injectPicMatchStyles },
    'blend': { render: renderBlend, styles: injectBlendStyles },
    'daily': { render: renderDaily, styles: injectDailyStyles },

    // Phonics
    'phonics-home': { render: renderPhonicsHome, styles: injectPhonicsHomeStyles },
    'sound-match': { render: renderSoundMatch, styles: injectSoundMatchStyles },
    'sound-sort': { render: renderSoundSort, styles: injectSoundSortStyles },
    'end-sound': { render: renderEndSound, styles: injectEndSoundStyles },

    // Rhyme
    'rhyme-home': { render: renderRhymeHome, styles: injectRhymeHomeStyles },
    'rhyme-match': { render: renderRhymeMatch, styles: injectRhymeMatchStyles },
    'rhyme-sort': { render: renderRhymeSort, styles: injectRhymeSortStyles },
    'odd-one-out': { render: renderOddOneOut, styles: injectOddOneOutStyles },
};

function navigate(screen, props = {}) {
    // Only bail on identical screen if props are also empty (avoids journey looping bug)
    if (screen === currentScreen && Object.keys(props).length === 0) return;

    // Fade out current
    const currentEl = app.querySelector('.screen');
    if (currentEl) {
        currentEl.classList.add('exiting');
    }

    setTimeout(() => {
        currentScreen = screen;
        renderScreen(screen, props);
    }, 200);
}

function renderScreen(screen, props = {}) {
    const entry = SCREENS[screen];
    if (!entry) {
        console.error(`Unknown screen: ${screen}`);
        navigate('hub');
        return;
    }

    entry.styles();
    entry.render(app, navigate, props);
}

// Initial load — preload audio then go to profile picker
preloadVoices();
navigate('profile');
