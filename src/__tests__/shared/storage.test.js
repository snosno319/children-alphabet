/**
 * Tests for src/shared/storage.js
 *
 * Uses jsdom (configured in vitest.config.js) so localStorage is available.
 * We reset localStorage and the active profile before each test to ensure isolation.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    setActiveProfile,
    getActiveProfile,
    getProfiles,
    saveProfiles,
    getTotalStars,
    getSubAppStars,
    getAllProgress,
    resetProgress,
    // Alphabet
    markExplored,
    markTraced,
    recordAlphabetQuizAnswer,
    recordLetterAccuracy,
    addAlphabetStars,
    getAlphabetProgress,
    getAlphabetCompletionPercent,
    // CVC
    markFamilyExplored,
    markWordBuilt,
    recordCvcQuizAnswer,
    recordCvcAccuracy,
    addCvcStars,
    getCvcProgress,
    getCvcCompletionPercent,
    // Sight
    markWordLearned,
    recordMatchAnswer,
    markStoryRead,
    addSightStars,
    getSightProgress,
    getSightCompletionPercent,
    getSightLearnedWords,
    // Word Builder
    markWordSpelled,
    markWordMatched,
    markWordBlended,
    recordWordBuilderAccuracy,
    markDailyCompleted,
    completeDailyChallenge,
    isDailyCompleted,
    getStreak,
    addWordBuilderStars,
    getWordBuilderProgress,
    getWordBuilderCompletionPercent,
    // Phonics
    addPhonicsStars,
    recordSoundMatch,
    recordSoundSort,
    recordEndSound,
    getPhonicsStats,
    // Rhyme
    addRhymeStars,
    recordRhymeMatch,
    recordRhymeSort,
    recordOddOneOut,
    getRhymeStats,
} from '../../shared/storage.js';

beforeEach(() => {
    localStorage.clear();
    setActiveProfile('default');
});

// ---------------------------------------------------------------------------
// Profile management
// ---------------------------------------------------------------------------

describe('setActiveProfile / getActiveProfile', () => {
    it('returns "default" initially', () => {
        expect(getActiveProfile()).toBe('default');
    });

    it('updates the active profile', () => {
        setActiveProfile('child-alice');
        expect(getActiveProfile()).toBe('child-alice');
    });

    it('persists the active profile to localStorage', () => {
        setActiveProfile('child-bob');
        expect(localStorage.getItem('active_profile')).toBe('child-bob');
    });
});

describe('getProfiles / saveProfiles', () => {
    it('returns empty array when no profiles saved', () => {
        expect(getProfiles()).toEqual([]);
    });

    it('round-trips profiles through localStorage', () => {
        const profiles = [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }];
        saveProfiles(profiles);
        expect(getProfiles()).toEqual(profiles);
    });

    it('returns empty array when localStorage has invalid JSON', () => {
        localStorage.setItem('ea_profiles', '{invalid json}');
        expect(getProfiles()).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// Profile isolation
// ---------------------------------------------------------------------------

describe('profile isolation', () => {
    it('progress stored under profile A is not visible under profile B', () => {
        setActiveProfile('alice');
        markExplored('A');
        markExplored('B');

        setActiveProfile('bob');
        expect(getAlphabetProgress().exploredLetters).toEqual([]);
    });

    it('stars are tracked independently per profile', () => {
        setActiveProfile('alice');
        addAlphabetStars(5);

        setActiveProfile('bob');
        expect(getTotalStars()).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// getAllProgress / resetProgress
// ---------------------------------------------------------------------------

describe('getAllProgress()', () => {
    it('returns a complete default progress object on first call', () => {
        const p = getAllProgress();
        expect(p).toHaveProperty('alphabet');
        expect(p).toHaveProperty('cvc');
        expect(p).toHaveProperty('sight');
        expect(p).toHaveProperty('wordBuilder');
        expect(p).toHaveProperty('phonics');
        expect(p).toHaveProperty('rhyme');
        expect(p).toHaveProperty('global');
    });

    it('alphabet starts with empty arrays and zero counts', () => {
        const { alphabet } = getAllProgress();
        expect(alphabet.exploredLetters).toEqual([]);
        expect(alphabet.tracedLetters).toEqual([]);
        expect(alphabet.quizCorrect).toBe(0);
        expect(alphabet.quizTotal).toBe(0);
        expect(alphabet.stars).toBe(0);
    });
});

describe('resetProgress()', () => {
    it('clears all accumulated progress', () => {
        markExplored('A');
        addAlphabetStars(3);
        resetProgress();
        expect(getAlphabetProgress().exploredLetters).toEqual([]);
        expect(getTotalStars()).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Alphabet
// ---------------------------------------------------------------------------

describe('markExplored()', () => {
    it('adds a letter to exploredLetters', () => {
        markExplored('A');
        expect(getAlphabetProgress().exploredLetters).toContain('A');
    });

    it('does not add duplicate entries', () => {
        markExplored('A');
        markExplored('A');
        expect(getAlphabetProgress().exploredLetters).toHaveLength(1);
    });
});

describe('markTraced()', () => {
    it('adds a letter to tracedLetters', () => {
        markTraced('B');
        expect(getAlphabetProgress().tracedLetters).toContain('B');
    });

    it('does not add duplicate entries', () => {
        markTraced('B');
        markTraced('B');
        expect(getAlphabetProgress().tracedLetters).toHaveLength(1);
    });
});

describe('recordAlphabetQuizAnswer()', () => {
    it('increments quizTotal on every call', () => {
        recordAlphabetQuizAnswer(true);
        recordAlphabetQuizAnswer(false);
        expect(getAlphabetProgress().quizTotal).toBe(2);
    });

    it('increments quizCorrect only on correct answers', () => {
        recordAlphabetQuizAnswer(true);
        recordAlphabetQuizAnswer(false);
        recordAlphabetQuizAnswer(true);
        expect(getAlphabetProgress().quizCorrect).toBe(2);
    });
});

describe('recordLetterAccuracy()', () => {
    it('creates a score entry for a new letter', () => {
        recordLetterAccuracy('C', true);
        const scores = getAlphabetProgress().letterScores;
        expect(scores['C']).toEqual({ correct: 1, wrong: 0 });
    });

    it('accumulates correct and wrong counts', () => {
        recordLetterAccuracy('D', true);
        recordLetterAccuracy('D', true);
        recordLetterAccuracy('D', false);
        const scores = getAlphabetProgress().letterScores;
        expect(scores['D']).toEqual({ correct: 2, wrong: 1 });
    });
});

describe('addAlphabetStars()', () => {
    it('accumulates stars correctly', () => {
        addAlphabetStars(2);
        addAlphabetStars(3);
        expect(getAlphabetProgress().stars).toBe(5);
    });
});

describe('getAlphabetCompletionPercent()', () => {
    it('returns 0% with no progress', () => {
        expect(getAlphabetCompletionPercent()).toBe(0);
    });

    it('returns 50% when half the letters are explored (26 explored, none traced)', () => {
        // 26 explored / 52 total = 50%
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => markExplored(l));
        expect(getAlphabetCompletionPercent()).toBe(50);
    });

    it('returns 100% when all letters are explored and traced', () => {
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => {
            markExplored(l);
            markTraced(l);
        });
        expect(getAlphabetCompletionPercent()).toBe(100);
    });
});

// ---------------------------------------------------------------------------
// CVC Words
// ---------------------------------------------------------------------------

describe('markFamilyExplored()', () => {
    it('adds a rime to exploredFamilies', () => {
        markFamilyExplored('at');
        expect(getCvcProgress().exploredFamilies).toContain('at');
    });

    it('does not duplicate entries', () => {
        markFamilyExplored('at');
        markFamilyExplored('at');
        expect(getCvcProgress().exploredFamilies).toHaveLength(1);
    });
});

describe('markWordBuilt()', () => {
    it('adds a word to builtWords', () => {
        markWordBuilt('cat');
        expect(getCvcProgress().builtWords).toContain('cat');
    });

    it('does not duplicate entries', () => {
        markWordBuilt('cat');
        markWordBuilt('cat');
        expect(getCvcProgress().builtWords).toHaveLength(1);
    });
});

describe('recordCvcQuizAnswer()', () => {
    it('tracks totals and corrects', () => {
        recordCvcQuizAnswer(true);
        recordCvcQuizAnswer(false);
        const cvc = getCvcProgress();
        expect(cvc.quizTotal).toBe(2);
        expect(cvc.quizCorrect).toBe(1);
    });
});

describe('recordCvcAccuracy()', () => {
    it('creates and updates word scores', () => {
        recordCvcAccuracy('cat', true);
        recordCvcAccuracy('cat', false);
        expect(getCvcProgress().wordScores['cat']).toEqual({ correct: 1, wrong: 1 });
    });
});

describe('getCvcCompletionPercent()', () => {
    it('returns 0% with no progress', () => {
        expect(getCvcCompletionPercent()).toBe(0);
    });

    it('calculates based on families and built words', () => {
        // 6 families + 0 words = 6/60 = 10%
        ['at', 'an', 'ig', 'og', 'ug', 'en'].forEach(r => markFamilyExplored(r));
        expect(getCvcCompletionPercent()).toBe(10);
    });
});

// ---------------------------------------------------------------------------
// Sight Words
// ---------------------------------------------------------------------------

describe('markWordLearned()', () => {
    it('adds a word to learnedWords', () => {
        markWordLearned('the');
        expect(getSightProgress().learnedWords).toContain('the');
    });

    it('does not duplicate entries', () => {
        markWordLearned('the');
        markWordLearned('the');
        expect(getSightProgress().learnedWords).toHaveLength(1);
    });
});

describe('recordMatchAnswer()', () => {
    it('tracks match totals and corrects', () => {
        recordMatchAnswer(true);
        recordMatchAnswer(true);
        recordMatchAnswer(false);
        const s = getSightProgress();
        expect(s.matchTotal).toBe(3);
        expect(s.matchCorrect).toBe(2);
    });
});

describe('markStoryRead()', () => {
    it('adds a story index to storiesRead', () => {
        markStoryRead(0);
        markStoryRead(2);
        expect(getSightProgress().storiesRead).toEqual([0, 2]);
    });

    it('does not duplicate entries', () => {
        markStoryRead(0);
        markStoryRead(0);
        expect(getSightProgress().storiesRead).toHaveLength(1);
    });
});

describe('getSightCompletionPercent()', () => {
    it('returns 0% with no progress', () => {
        expect(getSightCompletionPercent()).toBe(0);
    });

    it('counts learned words and read stories', () => {
        // 8 words + 2 stories = 10/48 ≈ 21%
        ['the', 'a', 'I', 'is', 'it', 'in', 'my', 'me'].forEach(w => markWordLearned(w));
        markStoryRead(0);
        markStoryRead(1);
        expect(getSightCompletionPercent()).toBe(21);
    });
});

describe('getSightLearnedWords()', () => {
    it('returns the learned words array', () => {
        markWordLearned('run');
        expect(getSightLearnedWords()).toContain('run');
    });
});

// ---------------------------------------------------------------------------
// Word Builder
// ---------------------------------------------------------------------------

describe('markWordSpelled / markWordMatched / markWordBlended', () => {
    it('tracks spelled words', () => {
        markWordSpelled('cat');
        expect(getWordBuilderProgress().spelledWords).toContain('cat');
    });

    it('tracks matched words', () => {
        markWordMatched('dog');
        expect(getWordBuilderProgress().matchedWords).toContain('dog');
    });

    it('tracks blended words', () => {
        markWordBlended('sun');
        expect(getWordBuilderProgress().blendedWords).toContain('sun');
    });

    it('does not duplicate across each list', () => {
        markWordSpelled('cat');
        markWordSpelled('cat');
        expect(getWordBuilderProgress().spelledWords).toHaveLength(1);
    });
});

describe('recordWordBuilderAccuracy()', () => {
    it('creates and accumulates scores', () => {
        recordWordBuilderAccuracy('pig', true);
        recordWordBuilderAccuracy('pig', false);
        expect(getWordBuilderProgress().wordScores['pig']).toEqual({ correct: 1, wrong: 1 });
    });
});

describe('getWordBuilderCompletionPercent()', () => {
    it('returns 0% with no progress', () => {
        expect(getWordBuilderCompletionPercent()).toBe(0);
    });

    it('counts unique words across all three lists', () => {
        // 'cat' in spelled and matched counts as 1 unique, plus 'dog' = 2 unique / 65 ≈ 3%
        markWordSpelled('cat');
        markWordMatched('cat'); // duplicate — should count only once
        markWordBlended('dog');
        expect(getWordBuilderCompletionPercent()).toBe(3);
    });
});

describe('completeDailyChallenge()', () => {
    it('sets lastDaily to today', () => {
        completeDailyChallenge();
        const today = new Date().toISOString().slice(0, 10);
        expect(getWordBuilderProgress().lastDaily).toBe(today);
    });

    it('is idempotent — calling twice does not increment streak twice', () => {
        completeDailyChallenge();
        completeDailyChallenge();
        expect(getStreak()).toBe(1);
    });

    it('sets streak to 1 on first completion', () => {
        completeDailyChallenge();
        expect(getStreak()).toBe(1);
    });

    it('increments streak when last completion was yesterday', () => {
        const yesterday = (() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d.toISOString().slice(0, 10);
        })();
        // Manually set lastDaily to yesterday
        markDailyCompleted(yesterday);
        // Force streak to 1 as if user completed yesterday
        const p = getAllProgress();
        p.wordBuilder.streak = 1;
        p.wordBuilder.lastDaily = yesterday;
        localStorage.setItem(
            `english-adventure-progress-default`,
            JSON.stringify(p)
        );
        completeDailyChallenge();
        expect(getStreak()).toBe(2);
    });

    it('resets streak to 1 if last completion was not yesterday', () => {
        const twoDaysAgo = (() => {
            const d = new Date();
            d.setDate(d.getDate() - 2);
            return d.toISOString().slice(0, 10);
        })();
        const p = getAllProgress();
        p.wordBuilder.streak = 5;
        p.wordBuilder.lastDaily = twoDaysAgo;
        localStorage.setItem(
            `english-adventure-progress-default`,
            JSON.stringify(p)
        );
        completeDailyChallenge();
        expect(getStreak()).toBe(1);
    });
});

describe('isDailyCompleted()', () => {
    it('returns false before completing today', () => {
        expect(isDailyCompleted()).toBe(false);
    });

    it('returns true after completing today', () => {
        completeDailyChallenge();
        expect(isDailyCompleted()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Phonics Lab
// ---------------------------------------------------------------------------

describe('recordSoundMatch / recordSoundSort / recordEndSound', () => {
    it('tracks sound match totals and corrects', () => {
        recordSoundMatch(true);
        recordSoundMatch(false);
        const stats = getPhonicsStats();
        expect(stats.totalAttempts).toBe(2);
        expect(stats.totalCorrect).toBe(1);
    });

    it('tracks sound sort independently', () => {
        recordSoundSort(true);
        recordSoundSort(true);
        const stats = getPhonicsStats();
        expect(stats.totalAttempts).toBe(2);
        expect(stats.totalCorrect).toBe(2);
    });

    it('accumulates across all three phonics activities', () => {
        recordSoundMatch(true);
        recordSoundSort(false);
        recordEndSound(true);
        const stats = getPhonicsStats();
        expect(stats.totalAttempts).toBe(3);
        expect(stats.totalCorrect).toBe(2);
    });
});

describe('addPhonicsStars()', () => {
    it('adds to the phonics stars total', () => {
        addPhonicsStars(4);
        addPhonicsStars(1);
        expect(getSubAppStars('phonics')).toBe(5);
    });
});

// ---------------------------------------------------------------------------
// Rhyme Time
// ---------------------------------------------------------------------------

describe('recordRhymeMatch / recordRhymeSort / recordOddOneOut', () => {
    it('accumulates across all three rhyme activities', () => {
        recordRhymeMatch(true);
        recordRhymeSort(false);
        recordOddOneOut(true);
        const stats = getRhymeStats();
        expect(stats.totalAttempts).toBe(3);
        expect(stats.totalCorrect).toBe(2);
    });
});

describe('addRhymeStars()', () => {
    it('adds to the rhyme stars total', () => {
        addRhymeStars(3);
        expect(getSubAppStars('rhyme')).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// getTotalStars / getSubAppStars
// ---------------------------------------------------------------------------

describe('getTotalStars()', () => {
    it('returns 0 with no progress', () => {
        expect(getTotalStars()).toBe(0);
    });

    it('sums stars across all 6 sub-apps', () => {
        addAlphabetStars(1);
        addCvcStars(2);
        addSightStars(3);
        addWordBuilderStars(4);
        addPhonicsStars(5);
        addRhymeStars(6);
        expect(getTotalStars()).toBe(21);
    });
});

describe('getSubAppStars()', () => {
    it('returns stars for a specific sub-app', () => {
        addCvcStars(7);
        expect(getSubAppStars('cvc')).toBe(7);
    });

    it('returns 0 for a sub-app with no stars', () => {
        expect(getSubAppStars('sight')).toBe(0);
    });
});
