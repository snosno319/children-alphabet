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
    // Numbers
    markNumberExplored,
    isNumberExplored,
    recordNumbersQuizResult,
    getNumbersProgress,
    getNumbersCompletionPercent,
    // Memory
    saveMemoryBest,
    getMemoryBest,
    // Case Match
    recordCaseMatchResult,
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
        expect(p).toHaveProperty('numbers');
        expect(p).toHaveProperty('global');
    });

    it('numbers section starts with empty arrays and zero counts', () => {
        const { numbers } = getAllProgress();
        expect(numbers.exploredNumbers).toEqual([]);
        expect(numbers.quizCorrect).toBe(0);
        expect(numbers.quizTotal).toBe(0);
        expect(numbers.stars).toBe(0);
    });

    it('alphabet section includes memory and case-match fields', () => {
        const { alphabet } = getAllProgress();
        expect(alphabet.memoryBestEasy).toBeNull();
        expect(alphabet.memoryBestHard).toBeNull();
        expect(alphabet.caseMatchCorrect).toBe(0);
        expect(alphabet.caseMatchTotal).toBe(0);
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

    it('sums stars across all 7 sub-apps including numbers', () => {
        addAlphabetStars(1);
        addCvcStars(2);
        addSightStars(3);
        addWordBuilderStars(4);
        addPhonicsStars(5);
        addRhymeStars(6);
        recordNumbersQuizResult(5, 5); // earns 3 stars
        expect(getTotalStars()).toBe(24);
    });

    it('does not count NaN when a sub-app has no stars', () => {
        addAlphabetStars(5);
        const total = getTotalStars();
        expect(Number.isNaN(total)).toBe(false);
        expect(total).toBe(5);
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

    it('returns numbers stars after quiz completion', () => {
        recordNumbersQuizResult(5, 5); // perfect score = 3 stars
        expect(getSubAppStars('numbers')).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

describe('markNumberExplored()', () => {
    it('marks a number as explored', () => {
        markNumberExplored(1);
        expect(getNumbersProgress().exploredNumbers).toContain(1);
    });

    it('does not add duplicate entries', () => {
        markNumberExplored(3);
        markNumberExplored(3);
        expect(getNumbersProgress().exploredNumbers).toHaveLength(1);
    });

    it('tracks multiple different numbers', () => {
        markNumberExplored(1);
        markNumberExplored(2);
        markNumberExplored(5);
        expect(getNumbersProgress().exploredNumbers).toHaveLength(3);
    });
});

describe('isNumberExplored()', () => {
    it('returns false before exploring', () => {
        expect(isNumberExplored(7)).toBe(false);
    });

    it('returns true after exploring', () => {
        markNumberExplored(7);
        expect(isNumberExplored(7)).toBe(true);
    });

    it('is specific to the number — exploring 1 does not mark 2 as explored', () => {
        markNumberExplored(1);
        expect(isNumberExplored(2)).toBe(false);
    });
});

describe('recordNumbersQuizResult()', () => {
    it('increments quizCorrect and quizTotal', () => {
        recordNumbersQuizResult(4, 5);
        const p = getNumbersProgress();
        expect(p.quizCorrect).toBe(4);
        expect(p.quizTotal).toBe(5);
    });

    it('accumulates across multiple quiz attempts', () => {
        recordNumbersQuizResult(3, 5);
        recordNumbersQuizResult(5, 5);
        const p = getNumbersProgress();
        expect(p.quizCorrect).toBe(8);
        expect(p.quizTotal).toBe(10);
    });

    it('awards 3 stars for a perfect score', () => {
        const stars = recordNumbersQuizResult(5, 5);
        expect(stars).toBe(3);
    });

    it('awards 2 stars for one wrong answer', () => {
        const stars = recordNumbersQuizResult(4, 5);
        expect(stars).toBe(2);
    });

    it('awards 1 star for meeting the 60% threshold', () => {
        const stars = recordNumbersQuizResult(3, 5);
        expect(stars).toBe(1);
    });

    it('awards 0 stars for below 60%', () => {
        const stars = recordNumbersQuizResult(2, 5);
        expect(stars).toBe(0);
    });

    it('accumulates stars in storage', () => {
        recordNumbersQuizResult(5, 5); // 3 stars
        recordNumbersQuizResult(3, 5); // 1 star
        expect(getNumbersProgress().stars).toBe(4);
    });

    it('returns a number, not NaN', () => {
        const stars = recordNumbersQuizResult(0, 5);
        expect(Number.isNaN(stars)).toBe(false);
    });
});

describe('getNumbersCompletionPercent()', () => {
    it('returns 0% with no explored numbers', () => {
        expect(getNumbersCompletionPercent()).toBe(0);
    });

    it('returns 50% when 5 of 10 numbers are explored', () => {
        [1, 2, 3, 4, 5].forEach(n => markNumberExplored(n));
        expect(getNumbersCompletionPercent()).toBe(50);
    });

    it('returns 100% when all 10 numbers are explored', () => {
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(n => markNumberExplored(n));
        expect(getNumbersCompletionPercent()).toBe(100);
    });
});

// ---------------------------------------------------------------------------
// Memory Game
// ---------------------------------------------------------------------------

describe('getMemoryBest()', () => {
    it('returns null before any game is played', () => {
        expect(getMemoryBest('easy')).toBeNull();
        expect(getMemoryBest('hard')).toBeNull();
    });
});

describe('saveMemoryBest()', () => {
    it('saves the first score as the best', () => {
        saveMemoryBest('easy', 10);
        expect(getMemoryBest('easy')).toBe(10);
    });

    it('saves a better (lower) score', () => {
        saveMemoryBest('easy', 10);
        saveMemoryBest('easy', 8);
        expect(getMemoryBest('easy')).toBe(8);
    });

    it('does not overwrite with a worse (higher) score', () => {
        saveMemoryBest('easy', 8);
        saveMemoryBest('easy', 15);
        expect(getMemoryBest('easy')).toBe(8);
    });

    it('tracks easy and hard separately', () => {
        saveMemoryBest('easy', 6);
        saveMemoryBest('hard', 20);
        expect(getMemoryBest('easy')).toBe(6);
        expect(getMemoryBest('hard')).toBe(20);
    });

    it('improving hard score does not affect easy score', () => {
        saveMemoryBest('easy', 6);
        saveMemoryBest('hard', 20);
        saveMemoryBest('hard', 14);
        expect(getMemoryBest('easy')).toBe(6);
        expect(getMemoryBest('hard')).toBe(14);
    });
});

// ---------------------------------------------------------------------------
// Case Match Quiz
// ---------------------------------------------------------------------------

describe('recordCaseMatchResult()', () => {
    it('increments caseMatchCorrect and caseMatchTotal', () => {
        recordCaseMatchResult(7, 10);
        const p = getAlphabetProgress();
        expect(p.caseMatchCorrect).toBe(7);
        expect(p.caseMatchTotal).toBe(10);
    });

    it('accumulates across multiple sessions', () => {
        recordCaseMatchResult(6, 10);
        recordCaseMatchResult(9, 10);
        const p = getAlphabetProgress();
        expect(p.caseMatchCorrect).toBe(15);
        expect(p.caseMatchTotal).toBe(20);
    });

    it('awards 3 stars for a perfect score', () => {
        expect(recordCaseMatchResult(10, 10)).toBe(3);
    });

    it('awards 2 stars for meeting the 60% threshold', () => {
        expect(recordCaseMatchResult(6, 10)).toBe(2);
    });

    it('awards 1 star for meeting the 30% threshold', () => {
        expect(recordCaseMatchResult(3, 10)).toBe(1);
    });

    it('awards 0 stars below the 30% threshold', () => {
        expect(recordCaseMatchResult(2, 10)).toBe(0);
    });

    it('adds stars to the alphabet stars total', () => {
        recordCaseMatchResult(10, 10); // 3 stars
        expect(getAlphabetProgress().stars).toBe(3);
    });

    it('returns a number, not NaN', () => {
        const stars = recordCaseMatchResult(0, 10);
        expect(Number.isNaN(stars)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Schema Migration
// ---------------------------------------------------------------------------

describe('schema migration (migrateProgress)', () => {
    it('a profile missing the numbers section does not crash and returns defaults', () => {
        // Store a pre-numbers-module profile (missing the `numbers` key)
        const oldProgress = {
            alphabet: { exploredLetters: ['A'], tracedLetters: [], quizCorrect: 0, quizTotal: 0, letterScores: {}, stars: 2 },
            cvc: { exploredFamilies: [], builtWords: [], quizCorrect: 0, quizTotal: 0, wordScores: {}, stars: 0 },
            sight: { learnedWords: [], matchCorrect: 0, matchTotal: 0, storiesRead: [], stars: 0 },
            wordBuilder: { spelledWords: [], matchedWords: [], blendedWords: [], dailyCompleted: [], wordScores: {}, streak: 0, lastDaily: null, stars: 0 },
            phonics: { soundMatchCorrect: 0, soundMatchTotal: 0, soundSortCorrect: 0, soundSortTotal: 0, endSoundCorrect: 0, endSoundTotal: 0, stars: 0 },
            rhyme: { rhymeMatchCorrect: 0, rhymeMatchTotal: 0, rhymeSortCorrect: 0, rhymeSortTotal: 0, oddOneOutCorrect: 0, oddOneOutTotal: 0, stars: 0 },
            global: { lastActivity: null, earnedBadges: [], badgeSeenAt: {} },
            // numbers section intentionally absent
        };
        localStorage.setItem('english-adventure-progress-default', JSON.stringify(oldProgress));

        // Should not throw, should return migrated progress with numbers defaults
        const p = getAllProgress();
        expect(p.numbers).toBeDefined();
        expect(p.numbers.exploredNumbers).toEqual([]);
        expect(p.numbers.stars).toBe(0);
    });

    it('a profile missing memoryBestEasy returns null from getMemoryBest', () => {
        const oldProgress = {
            alphabet: { exploredLetters: [], tracedLetters: [], quizCorrect: 0, quizTotal: 0, letterScores: {}, stars: 0 },
            // memoryBestEasy / memoryBestHard intentionally absent
            cvc: { exploredFamilies: [], builtWords: [], quizCorrect: 0, quizTotal: 0, wordScores: {}, stars: 0 },
            sight: { learnedWords: [], matchCorrect: 0, matchTotal: 0, storiesRead: [], stars: 0 },
            wordBuilder: { spelledWords: [], matchedWords: [], blendedWords: [], dailyCompleted: [], wordScores: {}, streak: 0, lastDaily: null, stars: 0 },
            phonics: { soundMatchCorrect: 0, soundMatchTotal: 0, soundSortCorrect: 0, soundSortTotal: 0, endSoundCorrect: 0, endSoundTotal: 0, stars: 0 },
            rhyme: { rhymeMatchCorrect: 0, rhymeMatchTotal: 0, rhymeSortCorrect: 0, rhymeSortTotal: 0, oddOneOutCorrect: 0, oddOneOutTotal: 0, stars: 0 },
            numbers: { exploredNumbers: [], quizCorrect: 0, quizTotal: 0, stars: 0 },
            global: { lastActivity: null, earnedBadges: [], badgeSeenAt: {} },
        };
        localStorage.setItem('english-adventure-progress-default', JSON.stringify(oldProgress));

        expect(getMemoryBest('easy')).toBeNull();
        expect(getMemoryBest('hard')).toBeNull();
    });

    it('a profile missing caseMatchCorrect returns 0, not undefined', () => {
        const oldProgress = {
            alphabet: { exploredLetters: [], tracedLetters: [], quizCorrect: 0, quizTotal: 0, letterScores: {}, stars: 0 },
            // caseMatchCorrect / caseMatchTotal intentionally absent
            cvc: { exploredFamilies: [], builtWords: [], quizCorrect: 0, quizTotal: 0, wordScores: {}, stars: 0 },
            sight: { learnedWords: [], matchCorrect: 0, matchTotal: 0, storiesRead: [], stars: 0 },
            wordBuilder: { spelledWords: [], matchedWords: [], blendedWords: [], dailyCompleted: [], wordScores: {}, streak: 0, lastDaily: null, stars: 0 },
            phonics: { soundMatchCorrect: 0, soundMatchTotal: 0, soundSortCorrect: 0, soundSortTotal: 0, endSoundCorrect: 0, endSoundTotal: 0, stars: 0 },
            rhyme: { rhymeMatchCorrect: 0, rhymeMatchTotal: 0, rhymeSortCorrect: 0, rhymeSortTotal: 0, oddOneOutCorrect: 0, oddOneOutTotal: 0, stars: 0 },
            numbers: { exploredNumbers: [], quizCorrect: 0, quizTotal: 0, stars: 0 },
            global: { lastActivity: null, earnedBadges: [], badgeSeenAt: {} },
        };
        localStorage.setItem('english-adventure-progress-default', JSON.stringify(oldProgress));

        const p = getAllProgress();
        expect(p.alphabet.caseMatchCorrect).toBe(0);
        expect(p.alphabet.caseMatchTotal).toBe(0);
    });

    it('existing progress is preserved after migration', () => {
        const oldProgress = {
            alphabet: { exploredLetters: ['A', 'B'], tracedLetters: ['A'], quizCorrect: 5, quizTotal: 8, letterScores: {}, stars: 3 },
            cvc: { exploredFamilies: [], builtWords: [], quizCorrect: 0, quizTotal: 0, wordScores: {}, stars: 0 },
            sight: { learnedWords: [], matchCorrect: 0, matchTotal: 0, storiesRead: [], stars: 0 },
            wordBuilder: { spelledWords: [], matchedWords: [], blendedWords: [], dailyCompleted: [], wordScores: {}, streak: 0, lastDaily: null, stars: 0 },
            phonics: { soundMatchCorrect: 0, soundMatchTotal: 0, soundSortCorrect: 0, soundSortTotal: 0, endSoundCorrect: 0, endSoundTotal: 0, stars: 0 },
            rhyme: { rhymeMatchCorrect: 0, rhymeMatchTotal: 0, rhymeSortCorrect: 0, rhymeSortTotal: 0, oddOneOutCorrect: 0, oddOneOutTotal: 0, stars: 0 },
            global: { lastActivity: null, earnedBadges: [], badgeSeenAt: {} },
        };
        localStorage.setItem('english-adventure-progress-default', JSON.stringify(oldProgress));

        const p = getAllProgress();
        // Existing data must be preserved
        expect(p.alphabet.exploredLetters).toEqual(['A', 'B']);
        expect(p.alphabet.tracedLetters).toEqual(['A']);
        expect(p.alphabet.quizCorrect).toBe(5);
        expect(p.alphabet.stars).toBe(3);
        // Migrated field must be filled with default
        expect(p.numbers.exploredNumbers).toEqual([]);
    });

    it('getTotalStars() does not produce NaN for old profiles missing numbers', () => {
        const oldProgress = {
            alphabet: { exploredLetters: [], tracedLetters: [], quizCorrect: 0, quizTotal: 0, letterScores: {}, stars: 5 },
            cvc: { exploredFamilies: [], builtWords: [], quizCorrect: 0, quizTotal: 0, wordScores: {}, stars: 0 },
            sight: { learnedWords: [], matchCorrect: 0, matchTotal: 0, storiesRead: [], stars: 0 },
            wordBuilder: { spelledWords: [], matchedWords: [], blendedWords: [], dailyCompleted: [], wordScores: {}, streak: 0, lastDaily: null, stars: 0 },
            phonics: { soundMatchCorrect: 0, soundMatchTotal: 0, soundSortCorrect: 0, soundSortTotal: 0, endSoundCorrect: 0, endSoundTotal: 0, stars: 0 },
            rhyme: { rhymeMatchCorrect: 0, rhymeMatchTotal: 0, rhymeSortCorrect: 0, rhymeSortTotal: 0, oddOneOutCorrect: 0, oddOneOutTotal: 0, stars: 0 },
            global: { lastActivity: null, earnedBadges: [], badgeSeenAt: {} },
            // numbers section intentionally absent
        };
        localStorage.setItem('english-adventure-progress-default', JSON.stringify(oldProgress));

        const total = getTotalStars();
        expect(Number.isNaN(total)).toBe(false);
        expect(total).toBe(5);
    });
});

// ---------------------------------------------------------------------------
// Stats return shapes (contract tests — catch return shape mismatches)
// ---------------------------------------------------------------------------

describe('getPhonicsStats() return shape', () => {
    it('returns totalCorrect and totalAttempts keys', () => {
        recordSoundMatch(true);
        recordSoundSort(false);
        const stats = getPhonicsStats();
        expect(stats).toHaveProperty('totalCorrect');
        expect(stats).toHaveProperty('totalAttempts');
    });

    it('does not return sub-object shape like soundMatch.correct', () => {
        const stats = getPhonicsStats();
        // If hub code accessed stats.soundMatch it would be undefined, not an object
        expect(stats.soundMatch).toBeUndefined();
    });

    it('totalAttempts is never NaN', () => {
        const stats = getPhonicsStats();
        expect(Number.isNaN(stats.totalAttempts)).toBe(false);
    });
});

describe('getRhymeStats() return shape', () => {
    it('returns totalCorrect and totalAttempts keys', () => {
        recordRhymeMatch(true);
        recordRhymeSort(false);
        const stats = getRhymeStats();
        expect(stats).toHaveProperty('totalCorrect');
        expect(stats).toHaveProperty('totalAttempts');
    });

    it('does not return sub-object shape like rhymeMatch.correct', () => {
        const stats = getRhymeStats();
        expect(stats.rhymeMatch).toBeUndefined();
    });

    it('totalAttempts is never NaN', () => {
        const stats = getRhymeStats();
        expect(Number.isNaN(stats.totalAttempts)).toBe(false);
    });
});
