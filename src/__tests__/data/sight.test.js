import { describe, it, expect } from 'vitest';
import {
    SIGHT_WORDS,
    STORIES,
    WORD_GROUPS,
    getWordsByGroup,
    getRandomSightWords,
} from '../../sight/data.js';

describe('SIGHT_WORDS', () => {
    it('has exactly 40 words', () => {
        expect(SIGHT_WORDS).toHaveLength(40);
    });

    it('each entry has required fields', () => {
        for (const w of SIGHT_WORDS) {
            expect(w).toHaveProperty('word');
            expect(w).toHaveProperty('sentence');
            expect(w).toHaveProperty('emoji');
            expect(w).toHaveProperty('group');
            expect(w).toHaveProperty('color');
            expect(w.word.length).toBeGreaterThan(0);
        }
    });

    it('all word strings are unique', () => {
        const words = SIGHT_WORDS.map(w => w.word);
        expect(new Set(words).size).toBe(words.length);
    });

    it('every group value is one of the four defined groups', () => {
        const validGroups = ['core', 'actions', 'descriptors', 'connectors'];
        for (const w of SIGHT_WORDS) {
            expect(validGroups).toContain(w.group);
        }
    });

    it('each sentence is a non-empty string', () => {
        for (const w of SIGHT_WORDS) {
            expect(typeof w.sentence).toBe('string');
            expect(w.sentence.length).toBeGreaterThan(0);
        }
    });

    it('has 10 core words', () => {
        expect(SIGHT_WORDS.filter(w => w.group === 'core')).toHaveLength(10);
    });

    it('has 10 action words', () => {
        expect(SIGHT_WORDS.filter(w => w.group === 'actions')).toHaveLength(10);
    });

    it('has 10 descriptor words', () => {
        expect(SIGHT_WORDS.filter(w => w.group === 'descriptors')).toHaveLength(10);
    });

    it('has 10 connector words', () => {
        expect(SIGHT_WORDS.filter(w => w.group === 'connectors')).toHaveLength(10);
    });
});

describe('STORIES', () => {
    it('has exactly 12 stories', () => {
        expect(STORIES).toHaveLength(12);
    });

    it('each story has a title and sentences array', () => {
        for (const story of STORIES) {
            expect(story).toHaveProperty('title');
            expect(story).toHaveProperty('sentences');
            expect(story.sentences.length).toBeGreaterThan(0);
        }
    });

    it('each sentence has text and highlights array', () => {
        for (const story of STORIES) {
            for (const s of story.sentences) {
                expect(s).toHaveProperty('text');
                expect(s).toHaveProperty('highlights');
                expect(typeof s.text).toBe('string');
                expect(Array.isArray(s.highlights)).toBe(true);
            }
        }
    });

    it('each sentence has at least one highlighted word', () => {
        for (const story of STORIES) {
            for (const s of story.sentences) {
                expect(s.highlights.length).toBeGreaterThan(0);
            }
        }
    });
});

describe('WORD_GROUPS', () => {
    it('has exactly 4 groups', () => {
        expect(WORD_GROUPS).toHaveLength(4);
    });

    it('each group has key, label, emoji, color', () => {
        for (const g of WORD_GROUPS) {
            expect(g).toHaveProperty('key');
            expect(g).toHaveProperty('label');
            expect(g).toHaveProperty('emoji');
            expect(g).toHaveProperty('color');
        }
    });

    it('group keys match the groups used in SIGHT_WORDS', () => {
        const usedGroups = new Set(SIGHT_WORDS.map(w => w.group));
        for (const g of WORD_GROUPS) {
            expect(usedGroups).toContain(g.key);
        }
    });
});

describe('getWordsByGroup()', () => {
    it('returns only words belonging to the requested group', () => {
        const coreWords = getWordsByGroup('core');
        for (const w of coreWords) {
            expect(w.group).toBe('core');
        }
    });

    it('returns 10 words for each group', () => {
        for (const g of WORD_GROUPS) {
            expect(getWordsByGroup(g.key)).toHaveLength(10);
        }
    });

    it('returns empty array for unknown group', () => {
        expect(getWordsByGroup('unknown')).toEqual([]);
    });
});

describe('getRandomSightWords()', () => {
    it('returns the requested number of words', () => {
        expect(getRandomSightWords(5)).toHaveLength(5);
    });

    it('respects the exclude list', () => {
        const excluded = ['the', 'a', 'I', 'is', 'it'];
        const words = getRandomSightWords(10, excluded);
        for (const w of words) {
            expect(excluded).not.toContain(w.word);
        }
    });

    it('returns valid SIGHT_WORDS entries', () => {
        const allWords = SIGHT_WORDS.map(w => w.word);
        const result = getRandomSightWords(10);
        for (const w of result) {
            expect(allWords).toContain(w.word);
        }
    });
});
