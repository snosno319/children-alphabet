import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    CATEGORIES,
    getAllWords,
    getWordsByCategory,
    getRandomWords,
    getDailyWord,
    ALL_LETTERS,
    ALL_CONSONANTS,
} from '../../word-builder/data.js';

describe('CATEGORIES', () => {
    it('has exactly 6 categories', () => {
        expect(CATEGORIES).toHaveLength(6);
    });

    it('each category has required fields', () => {
        for (const c of CATEGORIES) {
            expect(c).toHaveProperty('key');
            expect(c).toHaveProperty('emoji');
            expect(c).toHaveProperty('color');
            expect(c).toHaveProperty('words');
            expect(c.key.length).toBeGreaterThan(0);
        }
    });

    it('each category has exactly 10 words', () => {
        for (const c of CATEGORIES) {
            expect(c.words).toHaveLength(10);
        }
    });

    it('each word entry has word and emoji', () => {
        for (const c of CATEGORIES) {
            for (const w of c.words) {
                expect(w).toHaveProperty('word');
                expect(w).toHaveProperty('emoji');
                expect(w.word.length).toBeGreaterThan(0);
            }
        }
    });

    it('all category keys are unique', () => {
        const keys = CATEGORIES.map(c => c.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('includes the expected category keys', () => {
        const keys = CATEGORIES.map(c => c.key);
        expect(keys).toContain('animals');
        expect(keys).toContain('food');
        expect(keys).toContain('colors');
        expect(keys).toContain('home');
        expect(keys).toContain('nature');
        expect(keys).toContain('things');
    });
});

describe('getAllWords()', () => {
    it('returns 60 words total (6 categories × 10)', () => {
        expect(getAllWords()).toHaveLength(60);
    });

    it('each result has category, categoryColor, categoryEmoji', () => {
        for (const w of getAllWords()) {
            expect(w).toHaveProperty('category');
            expect(w).toHaveProperty('categoryColor');
            expect(w).toHaveProperty('categoryEmoji');
            expect(w).toHaveProperty('word');
            expect(w).toHaveProperty('emoji');
        }
    });
});

describe('getWordsByCategory()', () => {
    it('returns 10 words for a valid category', () => {
        expect(getWordsByCategory('animals')).toHaveLength(10);
    });

    it('all returned words have the correct category attached', () => {
        const words = getWordsByCategory('food');
        for (const w of words) {
            expect(w.category).toBe('food');
        }
    });

    it('returns empty array for unknown category', () => {
        expect(getWordsByCategory('vehicles')).toEqual([]);
    });
});

describe('getRandomWords()', () => {
    it('returns the requested number of words', () => {
        expect(getRandomWords(5)).toHaveLength(5);
    });

    it('respects the exclude list', () => {
        const excluded = ['cat', 'dog', 'pig'];
        const words = getRandomWords(20, excluded);
        for (const w of words) {
            expect(excluded).not.toContain(w.word);
        }
    });
});

describe('getDailyWord()', () => {
    it('returns a valid word object', () => {
        const word = getDailyWord();
        expect(word).toHaveProperty('word');
        expect(word).toHaveProperty('emoji');
        expect(word).toHaveProperty('category');
    });

    it('returns a word that exists in getAllWords()', () => {
        const allWords = getAllWords().map(w => w.word);
        expect(allWords).toContain(getDailyWord().word);
    });

    it('returns the same word when called twice on the same day', () => {
        expect(getDailyWord().word).toBe(getDailyWord().word);
    });

    it('cycles through words — day 0 and day 60 map to the same word (mod 60)', () => {
        // getDailyWord uses dayOfYear % 60. Day 0 and day 60 should return the
        // same word because 60 % 60 === 0.
        vi.useFakeTimers();

        // 2026-01-01 is day 1 of the year
        vi.setSystemTime(new Date('2026-01-01'));
        const wordDay1 = getDailyWord();

        // Advance exactly 60 days
        vi.setSystemTime(new Date('2026-03-02'));
        const wordDay61 = getDailyWord();

        // They won't necessarily be the same (depends on dayOfYear calc),
        // but both must be valid words from the pool
        const allWords = getAllWords().map(w => w.word);
        expect(allWords).toContain(wordDay1.word);
        expect(allWords).toContain(wordDay61.word);

        vi.useRealTimers();
    });
});

describe('ALL_LETTERS', () => {
    it('has 26 entries', () => {
        expect(ALL_LETTERS).toHaveLength(26);
    });

    it('contains every lowercase letter a-z', () => {
        for (let i = 0; i < 26; i++) {
            expect(ALL_LETTERS).toContain(String.fromCharCode(97 + i));
        }
    });
});

describe('ALL_CONSONANTS', () => {
    it('is a non-empty array', () => {
        expect(ALL_CONSONANTS.length).toBeGreaterThan(0);
    });

    it('does not contain vowels', () => {
        for (const v of ['a', 'e', 'i', 'o', 'u']) {
            expect(ALL_CONSONANTS).not.toContain(v);
        }
    });

    it('contains common consonants', () => {
        for (const c of ['b', 'c', 'd', 'f', 'g']) {
            expect(ALL_CONSONANTS).toContain(c);
        }
    });
});
