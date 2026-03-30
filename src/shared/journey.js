import { getAllProgress, getActiveProfile } from './storage.js';
import { playCelebrationSound } from './audio.js';

/**
 * journey.js
 * Adaptive Learning Path Manager.
 * Analyzes progress to generate a guided sequence of modules.
 */

window.isJourneyMode = false;

/**
 * Returns the index (0–25) of the letter with the lowest accuracy among those
 * that have been attempted at least once with a wrong answer.
 * Falls back to a random index if no letter has ever been answered incorrectly.
 */
function findWeakestLetter(letterScores) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let weakestIdx = Math.floor(Math.random() * 26);
    let lowestAcc = 1.0;

    for (let i = 0; i < 26; i++) {
        const s = letterScores[letters[i]];
        if (s && s.wrong > 0) {
            const acc = s.correct / (s.correct + s.wrong);
            if (acc < lowestAcc) {
                lowestAcc = acc;
                weakestIdx = i;
            }
        }
    }
    return weakestIdx;
}

function buildDailyPath() {
    const p = getAllProgress();
    const sequence = [];

    // 1. Alphabet — explore new letters first; once all 26 are done, review the weakest
    const alphabetTotal = p.alphabet.exploredLetters.length;
    let focusLetterIdx;

    if (alphabetTotal < 26) {
        focusLetterIdx = alphabetTotal; // Next new letter
        sequence.push({ route: 'explore', type: 'alphabet', index: focusLetterIdx });
        sequence.push({ route: 'trace',   type: 'alphabet', index: focusLetterIdx });
    } else {
        focusLetterIdx = findWeakestLetter(p.alphabet.letterScores || {});
        sequence.push({ route: 'explore', type: 'alphabet', index: focusLetterIdx });
        sequence.push({ route: 'quiz',    type: 'alphabet', index: focusLetterIdx });
    }

    // 2. Phonics Integration
    sequence.push({ route: 'sound-match', type: 'phonics' });

    // 3. Reading / CVC Words
    if (p.cvc.exploredFamilies.length < 10) {
        sequence.push({ route: 'cvc-explore', type: 'cvc' });
        sequence.push({ route: 'build', type: 'cvc' });
    } else {
        sequence.push({ route: 'cvc-quiz', type: 'cvc' });
    }

    // 4. Word Builder finale (Spelling)
    sequence.push({ route: 'daily', type: 'wordBuilder' });

    return {
        sequence,
        currentStep: 0,
        completed: false
    };
}

export function getJourneyState() {
    const profileId = getActiveProfile();
    const key = `journey_session_${profileId}`;
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const data = JSON.parse(raw);
            // reset daily path if it's a new day
            const today = new Date().toISOString().slice(0, 10);
            if (data.date === today && !data.completed) {
                return data;
            }
        }
    } catch (e) {
        console.warn('[journey] Failed to load journey state; starting fresh.', e);
    }
    
    // Generate new path
    const newState = buildDailyPath();
    newState.date = new Date().toISOString().slice(0, 10);
    saveJourneyState(newState);
    return newState;
}

export function saveJourneyState(state) {
    const profileId = getActiveProfile();
    const key = `journey_session_${profileId}`;
    localStorage.setItem(key, JSON.stringify(state));
}

export function startJourney(navigate) {
    window.isJourneyMode = true;
    const state = getJourneyState();
    
    if (state.completed) {
        // Fallback if they click play journey but already finished today
        navigate('explore');
        return;
    }

    const step = state.sequence[state.currentStep];
    navigate(step.route, step); 
}

export function advanceJourney(navigate) {
    const state = getJourneyState();
    
    state.currentStep++;
    
    if (state.currentStep >= state.sequence.length) {
        // Journey Complete!
        state.completed = true;
        saveJourneyState(state);
        window.isJourneyMode = false;
        
        // Show celebration
        playCelebrationSound();
        const overlay = document.createElement('div');
        overlay.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:var(--font-display);">
                <div style="font-size:5rem;animation:bounce 1s infinite;">🏆</div>
                <h1 style="font-size:3rem;margin:20px 0;">Journey Complete!</h1>
                <p style="font-size:1.5rem;margin-bottom:30px;">You earned 5 bonus stars!</p>
                <button id="journey-done-btn" style="background:#3B82F6;color:white;border:none;padding:15px 40px;border-radius:30px;font-size:1.5rem;font-weight:bold;cursor:pointer;">Awesome!</button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Add bonus stars
        const p = getAllProgress();
        p.global.lastActivity = Date.now();
        if(!p.alphabet.stars) p.alphabet.stars = 0;
        p.alphabet.stars += 5; // global generic bucket
        
        document.getElementById('journey-done-btn').addEventListener('click', () => {
             document.body.removeChild(overlay);
             navigate('hub');
        });
        
    } else {
        saveJourneyState(state);
        const step = state.sequence[state.currentStep];
        
        // Transition smoothly
        setTimeout(() => {
            navigate(step.route, step);
        }, 400);
    }
}

export function exitJourney(navigate) {
    window.isJourneyMode = false;
    navigate('hub');
}
