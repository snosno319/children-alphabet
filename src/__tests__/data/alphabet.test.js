import { describe, it, expect } from 'vitest';
import { LETTERS, getLetterData, getLetterIndex } from '../../alphabet/data.js';

describe('LETTERS', () => {
    it('has exactly 26 entries', () => {
        expect(LETTERS).toHaveLength(26);
    });

    it('covers A through Z in order', () => {
        const expected = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        expect(LETTERS.map(l => l.letter)).toEqual(expected);
    });

    it('each entry has required fields', () => {
        for (const l of LETTERS) {
            expect(l).toHaveProperty('letter');
            expect(l).toHaveProperty('word');
            expect(l).toHaveProperty('emoji');
            expect(l).toHaveProperty('color');
            expect(l).toHaveProperty('phonetic');
            expect(l).toHaveProperty('extras');
            expect(l).toHaveProperty('funFact');
        }
    });

    it('each letter is a single uppercase character', () => {
        for (const l of LETTERS) {
            expect(l.letter).toHaveLength(1);
            expect(l.letter).toBe(l.letter.toUpperCase());
        }
    });

    it('each entry has at least 2 extras', () => {
        for (const l of LETTERS) {
            expect(l.extras.length).toBeGreaterThanOrEqual(2);
        }
    });

    it('each extra has word and emoji', () => {
        for (const l of LETTERS) {
            for (const extra of l.extras) {
                expect(extra).toHaveProperty('word');
                expect(extra).toHaveProperty('emoji');
                expect(extra.word.length).toBeGreaterThan(0);
            }
        }
    });

    it('primary word starts with the letter (case-insensitive)', () => {
        for (const l of LETTERS) {
            expect(l.word.toUpperCase().startsWith(l.letter)).toBe(true);
        }
    });

    it('funFact is a non-empty string', () => {
        for (const l of LETTERS) {
            expect(typeof l.funFact).toBe('string');
            expect(l.funFact.length).toBeGreaterThan(0);
        }
    });
});

describe('getLetterData()', () => {
    it('returns data for uppercase letter', () => {
        const data = getLetterData('A');
        expect(data).toBeDefined();
        expect(data.letter).toBe('A');
        expect(data.word).toBe('Apple');
    });

    it('returns data for lowercase letter (case-insensitive)', () => {
        const data = getLetterData('z');
        expect(data).toBeDefined();
        expect(data.letter).toBe('Z');
    });

    it('returns undefined for non-alphabet character', () => {
        expect(getLetterData('1')).toBeUndefined();
        expect(getLetterData('!')).toBeUndefined();
    });

    it('returns the correct entry for every letter', () => {
        for (const l of LETTERS) {
            const result = getLetterData(l.letter);
            expect(result).toBe(l);
        }
    });
});

describe('getLetterIndex()', () => {
    it('returns 0 for A', () => {
        expect(getLetterIndex('A')).toBe(0);
    });

    it('returns 25 for Z', () => {
        expect(getLetterIndex('Z')).toBe(25);
    });

    it('returns 12 for M', () => {
        expect(getLetterIndex('M')).toBe(12);
    });

    it('is case-insensitive', () => {
        expect(getLetterIndex('a')).toBe(0);
        expect(getLetterIndex('z')).toBe(25);
    });

    it('index matches position in LETTERS array', () => {
        for (let i = 0; i < LETTERS.length; i++) {
            expect(getLetterIndex(LETTERS[i].letter)).toBe(i);
        }
    });
});
