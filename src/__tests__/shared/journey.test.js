/**
 * Tests for src/shared/journey.js
 *
 * journey.js imports playCelebrationSound from ./audio.js — we mock that module
 * entirely since audio hardware is unavailable in the test environment.
 *
 * The module also reads/writes localStorage (via storage.js) and sets
 * window.isJourneyMode, both of which work fine under jsdom.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock audio so no actual sound playback is attempted
vi.mock('../../shared/audio.js', () => ({
    playCelebrationSound: vi.fn(),
    playAudio: vi.fn(),
    speakLetter: vi.fn(),
    speakWord: vi.fn(),
    cancelAudio: vi.fn(),
    preloadVoices: vi.fn(),
}));

import {
    getJourneyState,
    saveJourneyState,
    startJourney,
    advanceJourney,
    exitJourney,
} from '../../shared/journey.js';

import {
    setActiveProfile,
    markExplored,
    markFamilyExplored,
    recordLetterAccuracy,
} from '../../shared/storage.js';

const TODAY = new Date().toISOString().slice(0, 10);

function journeyKey(profileId = 'default') {
    return `journey_session_${profileId}`;
}

beforeEach(() => {
    localStorage.clear();
    setActiveProfile('default');
    window.isJourneyMode = false;
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getJourneyState — new state generation
// ---------------------------------------------------------------------------

describe('getJourneyState() — fresh state', () => {
    it('generates a new state when nothing is stored', () => {
        const state = getJourneyState();
        expect(state).toHaveProperty('sequence');
        expect(state).toHaveProperty('currentStep');
        expect(state).toHaveProperty('completed');
        expect(state).toHaveProperty('date');
    });

    it('sets date to today', () => {
        const state = getJourneyState();
        expect(state.date).toBe(TODAY);
    });

    it('starts at step 0 and is not completed', () => {
        const state = getJourneyState();
        expect(state.currentStep).toBe(0);
        expect(state.completed).toBe(false);
    });

    it('sequence is a non-empty array', () => {
        const state = getJourneyState();
        expect(Array.isArray(state.sequence)).toBe(true);
        expect(state.sequence.length).toBeGreaterThan(0);
    });

    it('persists the new state to localStorage', () => {
        getJourneyState();
        const raw = localStorage.getItem(journeyKey());
        expect(raw).not.toBeNull();
        const parsed = JSON.parse(raw);
        expect(parsed.date).toBe(TODAY);
    });
});

// ---------------------------------------------------------------------------
// getJourneyState — resume / reset logic
// ---------------------------------------------------------------------------

describe('getJourneyState() — resume existing state', () => {
    it('returns the stored state when it is from today and not completed', () => {
        const stored = {
            date: TODAY,
            currentStep: 2,
            completed: false,
            sequence: [{ route: 'explore', type: 'alphabet', index: 0 }],
        };
        localStorage.setItem(journeyKey(), JSON.stringify(stored));

        const state = getJourneyState();
        expect(state.currentStep).toBe(2);
    });

    it('generates a fresh state when the stored state is from a different day', () => {
        const yesterday = (() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d.toISOString().slice(0, 10);
        })();
        const stored = {
            date: yesterday,
            currentStep: 3,
            completed: false,
            sequence: [],
        };
        localStorage.setItem(journeyKey(), JSON.stringify(stored));

        const state = getJourneyState();
        expect(state.date).toBe(TODAY);
        expect(state.currentStep).toBe(0);
    });

    it('generates a fresh state when the stored state is already completed', () => {
        const stored = {
            date: TODAY,
            currentStep: 5,
            completed: true,
            sequence: [],
        };
        localStorage.setItem(journeyKey(), JSON.stringify(stored));

        const state = getJourneyState();
        // Should produce a fresh state (currentStep 0, not completed)
        expect(state.currentStep).toBe(0);
        expect(state.completed).toBe(false);
    });

    it('generates a fresh state when localStorage contains invalid JSON', () => {
        localStorage.setItem(journeyKey(), 'not-valid-json');
        const state = getJourneyState();
        expect(state.date).toBe(TODAY);
        expect(state.currentStep).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Journey path composition — alphabet branch
// ---------------------------------------------------------------------------

describe('journey path — alphabet branch', () => {
    it('includes explore+trace for the next new letter when alphabet is incomplete', () => {
        // No letters explored → should focus letter index 0
        const { sequence } = getJourneyState();
        const alphabetSteps = sequence.filter(s => s.type === 'alphabet');
        const routes = alphabetSteps.map(s => s.route);
        expect(routes).toContain('explore');
        expect(routes).toContain('trace');
    });

    it('focuses the correct next letter index', () => {
        // Explore 3 letters → next should be index 3
        markExplored('A');
        markExplored('B');
        markExplored('C');
        const { sequence } = getJourneyState();
        const exploreStep = sequence.find(s => s.route === 'explore' && s.type === 'alphabet');
        expect(exploreStep.index).toBe(3);
    });

    it('includes explore+quiz (not trace) when all 26 letters are explored', () => {
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => markExplored(l));
        const { sequence } = getJourneyState();
        const alphabetSteps = sequence.filter(s => s.type === 'alphabet');
        const routes = alphabetSteps.map(s => s.route);
        expect(routes).toContain('explore');
        expect(routes).toContain('quiz');
        expect(routes).not.toContain('trace');
    });

    it('selects the weakest letter when all are explored and scores exist', () => {
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => markExplored(l));
        // Make 'C' (index 2) the weakest: 0 correct, 5 wrong → accuracy 0
        recordLetterAccuracy('C', false);
        recordLetterAccuracy('C', false);
        recordLetterAccuracy('C', false);
        // Make 'A' better: 3 correct, 1 wrong → accuracy 0.75
        recordLetterAccuracy('A', true);
        recordLetterAccuracy('A', true);
        recordLetterAccuracy('A', true);
        recordLetterAccuracy('A', false);

        const { sequence } = getJourneyState();
        const exploreStep = sequence.find(s => s.route === 'explore' && s.type === 'alphabet');
        expect(exploreStep.index).toBe(2); // 'C' is index 2
    });
});

// ---------------------------------------------------------------------------
// Journey path composition — CVC branch
// ---------------------------------------------------------------------------

describe('journey path — CVC branch', () => {
    it('includes cvc-explore+build when fewer than 10 families are explored', () => {
        const { sequence } = getJourneyState();
        const cvcRoutes = sequence.filter(s => s.type === 'cvc').map(s => s.route);
        expect(cvcRoutes).toContain('cvc-explore');
        expect(cvcRoutes).toContain('build');
    });

    it('includes cvc-quiz when 10 or more families are explored', () => {
        ['at', 'an', 'ig', 'og', 'ug', 'en', 'ap', 'it', 'op', 'un'].forEach(r =>
            markFamilyExplored(r)
        );
        const { sequence } = getJourneyState();
        const cvcRoutes = sequence.filter(s => s.type === 'cvc').map(s => s.route);
        expect(cvcRoutes).toContain('cvc-quiz');
        expect(cvcRoutes).not.toContain('cvc-explore');
    });
});

// ---------------------------------------------------------------------------
// Journey path — always present steps
// ---------------------------------------------------------------------------

describe('journey path — always-present steps', () => {
    it('always includes a phonics sound-match step', () => {
        const { sequence } = getJourneyState();
        const phonicsStep = sequence.find(s => s.type === 'phonics');
        expect(phonicsStep).toBeDefined();
        expect(phonicsStep.route).toBe('sound-match');
    });

    it('always ends with the word-builder daily step', () => {
        const { sequence } = getJourneyState();
        const last = sequence[sequence.length - 1];
        expect(last.type).toBe('wordBuilder');
        expect(last.route).toBe('daily');
    });
});

// ---------------------------------------------------------------------------
// saveJourneyState
// ---------------------------------------------------------------------------

describe('saveJourneyState()', () => {
    it('persists state to localStorage under the correct key', () => {
        const state = { date: TODAY, currentStep: 1, completed: false, sequence: [] };
        saveJourneyState(state);
        const raw = localStorage.getItem(journeyKey());
        expect(JSON.parse(raw)).toEqual(state);
    });

    it('uses the active profile ID in the key', () => {
        setActiveProfile('kid-1');
        const state = { date: TODAY, currentStep: 0, completed: false, sequence: [] };
        saveJourneyState(state);
        const raw = localStorage.getItem(journeyKey('kid-1'));
        expect(raw).not.toBeNull();
        // Default profile key should be untouched
        expect(localStorage.getItem(journeyKey())).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// startJourney
// ---------------------------------------------------------------------------

describe('startJourney()', () => {
    it('sets window.isJourneyMode to true', () => {
        const navigate = vi.fn();
        startJourney(navigate);
        expect(window.isJourneyMode).toBe(true);
    });

    it('navigates to the first step in the sequence', () => {
        const navigate = vi.fn();
        const state = getJourneyState();
        startJourney(navigate);
        const firstStep = state.sequence[0];
        expect(navigate).toHaveBeenCalledWith(firstStep.route, firstStep);
    });

    it('generates a fresh path and navigates to its first step when stored state is completed', () => {
        // getJourneyState() always generates a new path when the stored state is
        // completed — so startJourney never reaches the completed fallback branch
        // with the current implementation. Verify the fresh path starts correctly.
        const completed = {
            date: TODAY,
            currentStep: 5,
            completed: true,
            sequence: [],
        };
        localStorage.setItem(journeyKey(), JSON.stringify(completed));

        const navigate = vi.fn();
        startJourney(navigate);

        // A fresh state was generated; first step should be navigated to
        expect(navigate).toHaveBeenCalledOnce();
        const [route, step] = navigate.mock.calls[0];
        expect(typeof route).toBe('string');
        expect(step).toHaveProperty('route', route);
    });
});

// ---------------------------------------------------------------------------
// advanceJourney
// ---------------------------------------------------------------------------

describe('advanceJourney()', () => {
    it('increments currentStep and saves state', () => {
        const state = getJourneyState();
        const initialStep = state.currentStep; // 0
        const navigate = vi.fn();
        advanceJourney(navigate);

        const updated = JSON.parse(localStorage.getItem(journeyKey()));
        expect(updated.currentStep).toBe(initialStep + 1);
    });

    it('navigates to the next step route', () => {
        const state = getJourneyState();
        const nextStep = state.sequence[1]; // step after current (0)
        const navigate = vi.fn();

        // advanceJourney uses setTimeout — fast-forward it
        vi.useFakeTimers();
        advanceJourney(navigate);
        vi.runAllTimers();
        vi.useRealTimers();

        expect(navigate).toHaveBeenCalledWith(nextStep.route, nextStep);
    });

    it('marks journey as completed when advancing past the last step', () => {
        // Set state to the last step
        const state = getJourneyState();
        const lastStep = state.sequence.length - 1;
        state.currentStep = lastStep;
        saveJourneyState(state);

        const navigate = vi.fn();
        advanceJourney(navigate);

        const updated = JSON.parse(localStorage.getItem(journeyKey()));
        expect(updated.completed).toBe(true);
    });

    it('sets window.isJourneyMode to false when journey completes', () => {
        window.isJourneyMode = true;
        const state = getJourneyState();
        state.currentStep = state.sequence.length - 1;
        saveJourneyState(state);

        const navigate = vi.fn();
        advanceJourney(navigate);

        expect(window.isJourneyMode).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// exitJourney
// ---------------------------------------------------------------------------

describe('exitJourney()', () => {
    it('sets window.isJourneyMode to false', () => {
        window.isJourneyMode = true;
        exitJourney(vi.fn());
        expect(window.isJourneyMode).toBe(false);
    });

    it('navigates to "hub"', () => {
        const navigate = vi.fn();
        exitJourney(navigate);
        expect(navigate).toHaveBeenCalledWith('hub');
    });
});
