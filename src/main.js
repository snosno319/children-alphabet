/**
 * English Adventure — Main Router
 * Unified app entry point routing between hub and all 6 sub-apps.
 */
import { preloadVoices } from './shared/audio.js';
import { SubscriptionService } from './services/subscription.js';
import { renderPaywall, injectPaywallStyles } from './components/Paywall.js';

// Hub
import { renderHub, injectHubStyles } from './hub/home.js';

import { renderProfileScreen, injectProfileStyles } from './screens/profile.js';
import { getProfiles } from './shared/storage.js';

// Parents
import { renderParents, injectParentsStyles } from './screens/parents.js';

// Alphabet
import { renderHome as renderAlphabetHome, injectHomeStyles as injectAlphabetHomeStyles } from './alphabet/home.js';
import { renderExplore, injectExploreStyles } from './alphabet/explore.js';
import { renderTrace, injectTraceStyles } from './alphabet/trace.js';
import { renderQuiz as renderAlphabetQuiz, injectQuizStyles as injectAlphabetQuizStyles } from './alphabet/quiz.js';

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

// [NEW] Phonics Lab
import { renderHome as renderPhonicsHome, injectHomeStyles as injectPhonicsHomeStyles } from './phonics/home.js';
import { renderSoundMatch, injectSoundMatchStyles } from './phonics/sound-match.js';
import { renderSoundSort, injectSoundSortStyles } from './phonics/sound-sort.js';
import { renderEndSound, injectEndSoundStyles } from './phonics/end-sound.js';

// [NEW] Rhyme Time
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

    // Alphabet
    'alphabet-home': { render: renderAlphabetHome, styles: injectAlphabetHomeStyles },
    'explore': { render: renderExplore, styles: injectExploreStyles },
    'trace': { render: renderTrace, styles: injectTraceStyles },
    'quiz': { render: renderAlphabetQuiz, styles: injectAlphabetQuizStyles },

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

// Map sub-app "home" screens — used when a within-app back button says "home"
const HOME_REDIRECT = {
    'explore': 'alphabet-home',
    'trace': 'alphabet-home',
    'quiz': 'alphabet-home',
    'cvc-explore': 'cvc-home',
    'build': 'cvc-home',
    'cvc-quiz': 'cvc-home',
    'flashcards': 'sight-home',
    'match': 'sight-home',
    'stories': 'sight-home',
    'spell': 'wordBuilder-home',
    'picmatch': 'wordBuilder-home',
    'blend': 'wordBuilder-home',
    'daily': 'wordBuilder-home',
    // New mappings
    'sound-match': 'phonics-home',
    'sound-sort': 'phonics-home',
    'end-sound': 'phonics-home',
    'rhyme-match': 'rhyme-home',
    'rhyme-sort': 'rhyme-home',
    'odd-one-out': 'rhyme-home',
};

function navigate(screen, props = {}) {
    // Intercept sub-app 'home' navigations from legacy code
    if (screen === 'home') {
        // Figure out which sub-app we're in and go to its home
        const redirect = HOME_REDIRECT[currentScreen];
        screen = redirect || 'hub';
    }

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

// Initial load
(async () => {
    console.log("APP BOOT: START");
    // 1. Initialize Subscription Service
    try {
        await SubscriptionService.initialize();
        console.log("APP BOOT: Subscription initialized");
    } catch(e) {
        console.error("APP BOOT: Subscription failed", e);
    }

    // 2. Check Trial Status
    const TRIAL_DAYS = 30;
    let firstLaunch = localStorage.getItem('first_launch_date');
    if (!firstLaunch) {
        firstLaunch = Date.now().toString();
        localStorage.setItem('first_launch_date', firstLaunch);
    }

    const daysSinceLaunch = (Date.now() - parseInt(firstLaunch)) / (1000 * 60 * 60 * 24);
    const isExpired = daysSinceLaunch > TRIAL_DAYS;

    // 3. Preload & Navigate
    console.log("APP BOOT: Preloading voices");
    preloadVoices();

    console.log(`APP BOOT: Checking expiration... expired: ${isExpired}, isPro: ${SubscriptionService.isPro}`);
    if (isExpired && !SubscriptionService.isPro) {
        injectPaywallStyles();
        // Render Paywall directly into app (blocking)
        renderPaywall(app, navigate, null);
    } else {
        // ALWAYS show profile picker on boot so siblings don't overwrite each other
        if (getProfiles().length === 0) {
           navigate('profile'); // Forces creation
        } else {
           navigate('profile'); // Let them pick who is playing
        }
    }
})();
