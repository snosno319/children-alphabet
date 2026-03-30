import { describe, it, expect } from 'vitest';
import {
    WORD_FAMILIES,
    getAllWords,
    getAllFamilies,
    getWordsForFamily,
    getFamily,
    getRandomWords,
    ALL_CONSONANTS,
} from '../../cvc/data.js';

describe('CVC data — WORD_FAMILIES', () => {
    it('has exactly 10 word families', () => {
        expect(WORD_FAMILIES).toHaveLength(10);
    });

    it('each family has required fields', () => {
        for (const family of WORD_FAMILIES) {
            expect(family).toHaveProperty('rime');
            expect(family).toHaveProperty('color');
            expect(family).toHaveProperty('emoji');
            expect(family).toHaveProperty('words');
            expect(typeof family.rime).toBe('string');
            expect(family.rime.length).toBeGreaterThan(0);
        }
    });

    it('each family has exactly 5 words', () => {
        for (const family of WORD_FAMILIES) {
            expect(family.words).toHaveLength(5);
        }
    });

    it('each word has required fields', () => {
        for (const family of WORD_FAMILIES) {
            for (const w of family.words) {
                expect(w).toHaveProperty('word');
                expect(w).toHaveProperty('emoji');
                expect(w).toHaveProperty('onset');
                expect(w.word.length).toBeGreaterThan(0);
                expect(w.onset.length).toBe(1);
            }
        }
    });

    it('each word ends with its family rime', () => {
        for (const family of WORD_FAMILIES) {
            for (const w of family.words) {
                expect(w.word).toMatch(new RegExp(`${family.rime}$`));
            }
        }
    });

    it('each word onset matches the start of the word', () => {
        for (const family of WORD_FAMILIES) {
            for (const w of family.words) {
                expect(w.word.startsWith(w.onset)).toBe(true);
            }
        }
    });

    it('all rime values are unique', () => {
        const rimes = WORD_FAMILIES.map(f => f.rime);
        expect(new Set(rimes).size).toBe(rimes.length);
    });
});

describe('getAllFamilies()', () => {
    it('returns all 10 families', () => {
        expect(getAllFamilies()).toHaveLength(10);
    });

    it('returns the same reference as WORD_FAMILIES', () => {
        expect(getAllFamilies()).toBe(WORD_FAMILIES);
    });
});

describe('getAllWords()', () => {
    it('returns 50 words total (10 families × 5 words)', () => {
        expect(getAllWords()).toHaveLength(50);
    });

    it('each result has rime and familyColor attached', () => {
        for (const w of getAllWords()) {
            expect(w).toHaveProperty('rime');
            expect(w).toHaveProperty('familyColor');
            expect(w).toHaveProperty('word');
            expect(w).toHaveProperty('emoji');
            expect(w).toHaveProperty('onset');
        }
    });
});

describe('getWordsForFamily()', () => {
    it('returns words for a valid rime', () => {
        const words = getWordsForFamily('at');
        expect(words).toHaveLength(5);
        expect(words.map(w => w.word)).toContain('cat');
    });

    it('returns empty array for unknown rime', () => {
        expect(getWordsForFamily('xyz')).toEqual([]);
    });
});

describe('getFamily()', () => {
    it('returns the matching family object', () => {
        const family = getFamily('at');
        expect(family).toBeDefined();
        expect(family.rime).toBe('at');
    });

    it('returns undefined for unknown rime', () => {
        expect(getFamily('xyz')).toBeUndefined();
    });
});

describe('getRandomWords()', () => {
    it('returns the requested number of words', () => {
        expect(getRandomWords(5)).toHaveLength(5);
    });

    it('respects the exclude list', () => {
        const excluded = ['cat', 'hat', 'bat', 'mat', 'rat'];
        const words = getRandomWords(10, excluded);
        for (const w of words) {
            expect(excluded).not.toContain(w.word);
        }
    });

    it('returns at most available words when count exceeds pool', () => {
        // Exclude 49 words, only 1 remains
        const all = getAllWords();
        const excluded = all.slice(1).map(w => w.word);
        const result = getRandomWords(5, excluded);
        expect(result).toHaveLength(1);
    });
});

describe('ALL_CONSONANTS', () => {
    it('is a non-empty array of single characters', () => {
        expect(ALL_CONSONANTS.length).toBeGreaterThan(0);
        for (const c of ALL_CONSONANTS) {
            expect(c).toHaveLength(1);
        }
    });

    it('contains only consonants (not a, e, i, o, u)', () => {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        for (const c of ALL_CONSONANTS) {
            expect(vowels).not.toContain(c);
        }
    });
});
