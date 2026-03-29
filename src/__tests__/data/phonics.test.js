import { describe, it, expect } from 'vitest';
import {
    SOUND_GROUPS,
    ALL_SOUNDS,
    getAllPhonicsWords,
    getAllEndSounds,
    getWordsForSound,
    getDistractorSounds,
} from '../../phonics/data.js';

describe('SOUND_GROUPS', () => {
    it('is a non-empty array', () => {
        expect(SOUND_GROUPS.length).toBeGreaterThan(0);
    });

    it('each group has required fields', () => {
        for (const g of SOUND_GROUPS) {
            expect(g).toHaveProperty('sound');
            expect(g).toHaveProperty('phonetic');
            expect(g).toHaveProperty('color');
            expect(g).toHaveProperty('words');
            expect(g.sound.length).toBe(1);
            expect(g.words.length).toBeGreaterThan(0);
        }
    });

    it('each word entry has word and emoji', () => {
        for (const g of SOUND_GROUPS) {
            for (const w of g.words) {
                expect(w).toHaveProperty('word');
                expect(w).toHaveProperty('emoji');
                expect(w.word.length).toBeGreaterThan(0);
            }
        }
    });

    it('all sounds are unique', () => {
        const sounds = SOUND_GROUPS.map(g => g.sound);
        expect(new Set(sounds).size).toBe(sounds.length);
    });

    it('each word starts with its group sound', () => {
        for (const g of SOUND_GROUPS) {
            for (const w of g.words) {
                expect(w.word.startsWith(g.sound)).toBe(true);
            }
        }
    });
});

describe('ALL_SOUNDS', () => {
    it('has the same length as SOUND_GROUPS', () => {
        expect(ALL_SOUNDS).toHaveLength(SOUND_GROUPS.length);
    });

    it('contains each group sound exactly once', () => {
        for (const g of SOUND_GROUPS) {
            expect(ALL_SOUNDS).toContain(g.sound);
        }
    });
});

describe('getAllPhonicsWords()', () => {
    it('returns one entry per word across all groups', () => {
        const totalWords = SOUND_GROUPS.reduce((sum, g) => sum + g.words.length, 0);
        expect(getAllPhonicsWords()).toHaveLength(totalWords);
    });

    it('each result has initialSound, endSound, and color', () => {
        for (const w of getAllPhonicsWords()) {
            expect(w).toHaveProperty('initialSound');
            expect(w).toHaveProperty('endSound');
            expect(w).toHaveProperty('color');
            expect(w).toHaveProperty('word');
            expect(w).toHaveProperty('emoji');
        }
    });

    it('initialSound matches first character of word', () => {
        for (const w of getAllPhonicsWords()) {
            expect(w.word.startsWith(w.initialSound)).toBe(true);
        }
    });

    it('endSound matches last character of word', () => {
        for (const w of getAllPhonicsWords()) {
            expect(w.endSound).toBe(w.word[w.word.length - 1]);
        }
    });
});

describe('getAllEndSounds()', () => {
    it('returns an array of unique single characters', () => {
        const ends = getAllEndSounds();
        expect(ends.length).toBeGreaterThan(0);
        expect(new Set(ends).size).toBe(ends.length);
        for (const e of ends) {
            expect(e).toHaveLength(1);
        }
    });
});

describe('getWordsForSound()', () => {
    it('returns words for a valid sound', () => {
        const words = getWordsForSound('b');
        expect(words.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown sound', () => {
        expect(getWordsForSound('q')).toEqual([]);
    });

    it('respects the count parameter', () => {
        const words = getWordsForSound('b', 3);
        expect(words.length).toBeLessThanOrEqual(3);
    });
});

describe('getDistractorSounds()', () => {
    it('returns the requested number of sounds', () => {
        const distractors = getDistractorSounds('b', 3);
        expect(distractors).toHaveLength(3);
    });

    it('never includes the correct sound', () => {
        for (const sound of ALL_SOUNDS) {
            const distractors = getDistractorSounds(sound, 3);
            expect(distractors).not.toContain(sound);
        }
    });

    it('all returned values are valid sounds', () => {
        const distractors = getDistractorSounds('b', 3);
        for (const d of distractors) {
            expect(ALL_SOUNDS).toContain(d);
        }
    });
});
