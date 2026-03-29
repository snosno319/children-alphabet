import { describe, it, expect } from 'vitest';
import {
    RHYME_FAMILIES,
    getAllRhymeWords,
    getWordsFromFamily,
    getDistractorWords,
    getTwoFamilies,
} from '../../rhyme/data.js';

describe('RHYME_FAMILIES', () => {
    it('has exactly 10 families', () => {
        expect(RHYME_FAMILIES).toHaveLength(10);
    });

    it('each family has required fields', () => {
        for (const f of RHYME_FAMILIES) {
            expect(f).toHaveProperty('pattern');
            expect(f).toHaveProperty('color');
            expect(f).toHaveProperty('words');
            expect(f.pattern.startsWith('-')).toBe(true);
            expect(f.words.length).toBeGreaterThan(0);
        }
    });

    it('each word has word and emoji', () => {
        for (const f of RHYME_FAMILIES) {
            for (const w of f.words) {
                expect(w).toHaveProperty('word');
                expect(w).toHaveProperty('emoji');
                expect(w.word.length).toBeGreaterThan(0);
            }
        }
    });

    it('all patterns are unique', () => {
        const patterns = RHYME_FAMILIES.map(f => f.pattern);
        expect(new Set(patterns).size).toBe(patterns.length);
    });

    it('each family has at least 3 words', () => {
        for (const f of RHYME_FAMILIES) {
            expect(f.words.length).toBeGreaterThanOrEqual(3);
        }
    });
});

describe('getAllRhymeWords()', () => {
    it('returns one entry per word across all families', () => {
        const total = RHYME_FAMILIES.reduce((sum, f) => sum + f.words.length, 0);
        expect(getAllRhymeWords()).toHaveLength(total);
    });

    it('each result has pattern and familyColor', () => {
        for (const w of getAllRhymeWords()) {
            expect(w).toHaveProperty('pattern');
            expect(w).toHaveProperty('familyColor');
            expect(w).toHaveProperty('word');
            expect(w).toHaveProperty('emoji');
        }
    });
});

describe('getWordsFromFamily()', () => {
    it('returns words for a valid pattern', () => {
        const words = getWordsFromFamily('-at');
        expect(words.length).toBeGreaterThan(0);
        expect(words.map(w => w.word)).toContain('cat');
    });

    it('returns empty array for unknown pattern', () => {
        expect(getWordsFromFamily('-xyz')).toEqual([]);
    });

    it('respects the count parameter', () => {
        const words = getWordsFromFamily('-at', 2);
        expect(words.length).toBeLessThanOrEqual(2);
    });
});

describe('getDistractorWords()', () => {
    it('returns the requested number of words', () => {
        const distractors = getDistractorWords('-at', 3);
        expect(distractors).toHaveLength(3);
    });

    it('never includes words from the excluded pattern', () => {
        const excludePattern = '-at';
        const distractors = getDistractorWords(excludePattern, 5);
        for (const w of distractors) {
            expect(w.pattern).not.toBe(excludePattern);
        }
    });
});

describe('getTwoFamilies()', () => {
    it('returns exactly 2 families', () => {
        expect(getTwoFamilies()).toHaveLength(2);
    });

    it('returns 2 different families', () => {
        const [a, b] = getTwoFamilies();
        expect(a.pattern).not.toBe(b.pattern);
    });

    it('both returned families exist in RHYME_FAMILIES', () => {
        const patterns = RHYME_FAMILIES.map(f => f.pattern);
        const [a, b] = getTwoFamilies();
        expect(patterns).toContain(a.pattern);
        expect(patterns).toContain(b.pattern);
    });
});
