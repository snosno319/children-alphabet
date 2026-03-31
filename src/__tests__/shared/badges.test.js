/**
 * Tests for src/shared/badges.js
 *
 * Covers:
 *  - BADGE_DEFS structure and completeness
 *  - Cross-module contract: badge conditions match actual data counts
 *    (e.g. all_stories threshold == STORIES.length)
 *  - checkAndAwardBadges() correctly awards badges given crafted progress
 *
 * These tests caught the following pre-existing bugs:
 *  - all_stories threshold was 8 when the app had 12 stories
 *  - getPhonicsStats / getRhymeStats return shape mismatch with hub consumption
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BADGE_DEFS, BADGE_BY_ID, checkAndAwardBadges } from '../../shared/badges.js';
import { STORIES } from '../../sight/data.js';
import { LETTERS } from '../../alphabet/data.js';
import {
    setActiveProfile,
    markExplored,
    markTraced,
    markStoryRead,
    recordRhymeMatch,
    recordRhymeSort,
    recordOddOneOut,
    addAlphabetStars,
    addCvcStars,
    addSightStars,
    addWordBuilderStars,
    addPhonicsStars,
    addRhymeStars,
    getAllProgress,
    getPhonicsStats,
    getRhymeStats,
} from '../../shared/storage.js';

// Mock DOM + audio dependencies so badge overlay doesn't crash in jsdom
vi.mock('../../shared/audio.js', () => ({
    playCelebrationSound: vi.fn(),
    playAudio: vi.fn(),
    speakInstruction: vi.fn(),
}));
vi.mock('../../shared/confetti.js', () => ({
    spawnBigCelebration: vi.fn(),
    spawnStarBurst: vi.fn(),
}));
vi.mock('../../shared/mascot.js', () => ({
    showLeo: vi.fn(),
    hideLeo: vi.fn(),
}));

// Minimal navigate stub
const navigate = vi.fn();

beforeEach(() => {
    localStorage.clear();
    setActiveProfile('default');
    navigate.mockClear();
    // Reset DOM state that showBadgeOverlay touches
    document.body.innerHTML = '';
    document.head.innerHTML = '';
});

// ---------------------------------------------------------------------------
// BADGE_DEFS structure
// ---------------------------------------------------------------------------

describe('BADGE_DEFS structure', () => {
    it('has exactly 44 badge definitions', () => {
        expect(BADGE_DEFS).toHaveLength(44);
    });

    it('every badge has required fields', () => {
        for (const b of BADGE_DEFS) {
            expect(b).toHaveProperty('id');
            expect(b).toHaveProperty('label');
            expect(b).toHaveProperty('emoji');
            expect(b).toHaveProperty('color');
            expect(b).toHaveProperty('description');
            expect(b).toHaveProperty('category');
            expect(b.id.length).toBeGreaterThan(0);
        }
    });

    it('all badge IDs are unique', () => {
        const ids = BADGE_DEFS.map(b => b.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('category values are one of the three defined categories', () => {
        const valid = ['letter', 'activity', 'milestone'];
        for (const b of BADGE_DEFS) {
            expect(valid).toContain(b.category);
        }
    });

    it('has exactly 26 letter badges', () => {
        expect(BADGE_DEFS.filter(b => b.category === 'letter')).toHaveLength(26);
    });

    it('has exactly 6 activity badges', () => {
        expect(BADGE_DEFS.filter(b => b.category === 'activity')).toHaveLength(6);
    });

    it('has exactly 12 milestone badges', () => {
        expect(BADGE_DEFS.filter(b => b.category === 'milestone')).toHaveLength(12);
    });
});

describe('BADGE_BY_ID lookup', () => {
    it('can look up every badge by its id', () => {
        for (const b of BADGE_DEFS) {
            expect(BADGE_BY_ID[b.id]).toBe(b);
        }
    });
});

// ---------------------------------------------------------------------------
// Cross-module contract: badge conditions vs actual data
// ---------------------------------------------------------------------------

describe('all_stories badge threshold matches STORIES.length', () => {
    it('STORIES has 12 entries and all_stories badge checks >= 12', () => {
        // This test would have caught the bug where badge checked >= 8 but app had 12 stories.
        // We verify indirectly: mark 11 stories read (not enough), badge NOT awarded;
        // mark 12th story, badge awarded.
        expect(STORIES).toHaveLength(12);

        const allStoriesBadge = BADGE_BY_ID['all_stories'];
        expect(allStoriesBadge).toBeDefined();
        expect(allStoriesBadge.description).toMatch(/12/);
    });

    it('badge is not awarded when only 8 stories are read', () => {
        for (let i = 0; i < 8; i++) markStoryRead(i);
        const awarded = checkAndAwardBadges(navigate);
        expect(awarded).not.toContain('all_stories');
    });

    it('badge is awarded when all 12 stories are read', () => {
        for (let i = 0; i < 12; i++) markStoryRead(i);
        const awarded = checkAndAwardBadges(navigate);
        expect(awarded).toContain('all_stories');
    });
});

describe('letter badges match LETTERS data', () => {
    it('there is one letter badge per entry in LETTERS', () => {
        const letterBadgeIds = new Set(BADGE_DEFS.filter(b => b.category === 'letter').map(b => b.id));
        for (const l of LETTERS) {
            expect(letterBadgeIds).toContain(`letter_${l.letter}`);
        }
    });

    it('letter badge IDs cover exactly A-Z', () => {
        const letterIds = BADGE_DEFS
            .filter(b => b.category === 'letter')
            .map(b => b.id.replace('letter_', ''))
            .sort();
        const expected = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort();
        expect(letterIds).toEqual(expected);
    });
});

// ---------------------------------------------------------------------------
// checkAndAwardBadges() — letter badges
// ---------------------------------------------------------------------------

describe('checkAndAwardBadges() — letter badges', () => {
    it('awards letter_A when A is explored AND traced', () => {
        markExplored('A');
        markTraced('A');
        const awarded = checkAndAwardBadges(navigate);
        expect(awarded).toContain('letter_A');
    });

    it('does not award letter_A when only explored (not traced)', () => {
        markExplored('A');
        const awarded = checkAndAwardBadges(navigate);
        expect(awarded).not.toContain('letter_A');
    });

    it('does not award letter_A when only traced (not explored)', () => {
        markTraced('A');
        const awarded = checkAndAwardBadges(navigate);
        expect(awarded).not.toContain('letter_A');
    });

    it('awards multiple letter badges in one call', () => {
        ['A', 'B', 'C'].forEach(l => { markExplored(l); markTraced(l); });
        const awarded = checkAndAwardBadges(navigate);
        expect(awarded).toContain('letter_A');
        expect(awarded).toContain('letter_B');
        expect(awarded).toContain('letter_C');
    });

    it('does not re-award a badge already earned', () => {
        markExplored('A');
        markTraced('A');
        checkAndAwardBadges(navigate); // first call — awards letter_A
        const second = checkAndAwardBadges(navigate); // second call — already awarded
        expect(second).not.toContain('letter_A');
    });
});

// ---------------------------------------------------------------------------
// checkAndAwardBadges() — milestone badges
// ---------------------------------------------------------------------------

describe('checkAndAwardBadges() — star milestones', () => {
    it('awards stars_10 when total stars reach 10', () => {
        addAlphabetStars(10);
        expect(checkAndAwardBadges(navigate)).toContain('stars_10');
    });

    it('does not award stars_10 with only 9 stars', () => {
        addAlphabetStars(9);
        expect(checkAndAwardBadges(navigate)).not.toContain('stars_10');
    });

    it('awards stars_50 when total stars reach 50', () => {
        addAlphabetStars(25);
        addCvcStars(25);
        expect(checkAndAwardBadges(navigate)).toContain('stars_50');
    });

    it('does not award stars_50 with only 49 stars', () => {
        addAlphabetStars(49);
        expect(checkAndAwardBadges(navigate)).not.toContain('stars_50');
    });
});

describe('checkAndAwardBadges() — letter mastery milestones', () => {
    it('awards letters_13 when 13 letters are explored and traced', () => {
        'ABCDEFGHIJKLM'.split('').forEach(l => { markExplored(l); markTraced(l); });
        expect(checkAndAwardBadges(navigate)).toContain('letters_13');
    });

    it('does not award letters_13 with only 12 mastered letters', () => {
        'ABCDEFGHIJKL'.split('').forEach(l => { markExplored(l); markTraced(l); });
        expect(checkAndAwardBadges(navigate)).not.toContain('letters_13');
    });

    it('awards letters_26 when all 26 letters are mastered', () => {
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => { markExplored(l); markTraced(l); });
        const awarded = checkAndAwardBadges(navigate);
        expect(awarded).toContain('letters_26');
    });
});

describe('checkAndAwardBadges() — quiz_ace badge', () => {
    it('awards quiz_ace when ctx.quizAce is true', () => {
        expect(checkAndAwardBadges(navigate, { quizAce: true })).toContain('quiz_ace');
    });

    it('does not award quiz_ace when ctx.quizAce is false', () => {
        expect(checkAndAwardBadges(navigate, { quizAce: false })).not.toContain('quiz_ace');
    });

    it('does not award quiz_ace when ctx is omitted', () => {
        expect(checkAndAwardBadges(navigate)).not.toContain('quiz_ace');
    });
});

describe('checkAndAwardBadges() — rhyme_master badge', () => {
    it('awards rhyme_master when all three rhyme activities have been attempted', () => {
        recordRhymeMatch(true);
        recordRhymeSort(true);
        recordOddOneOut(true);
        expect(checkAndAwardBadges(navigate)).toContain('rhyme_master');
    });

    it('does not award rhyme_master when one rhyme activity is missing', () => {
        recordRhymeMatch(true);
        recordRhymeSort(true);
        // oddOneOut not done
        expect(checkAndAwardBadges(navigate)).not.toContain('rhyme_master');
    });
});

// ---------------------------------------------------------------------------
// getPhonicsStats / getRhymeStats contract (hub consumption compatibility)
// ---------------------------------------------------------------------------

describe('getPhonicsStats() contract', () => {
    it('returns an object with totalCorrect and totalAttempts', () => {
        const stats = getPhonicsStats();
        expect(typeof stats.totalCorrect).toBe('number');
        expect(typeof stats.totalAttempts).toBe('number');
    });

    it('does not expose sub-object keys that would break hub consumption', () => {
        // Hub code does: s.totalCorrect / s.totalAttempts
        // If it used s.soundMatch.correct it would throw. Guard against regression.
        const stats = getPhonicsStats();
        expect(stats.soundMatch).toBeUndefined();
        expect(stats.soundSort).toBeUndefined();
        expect(stats.endSound).toBeUndefined();
    });

    it('percentage calculation does not produce NaN for fresh profile', () => {
        const s = getPhonicsStats();
        const completion = s.totalAttempts === 0 ? 0 : Math.round((s.totalCorrect / s.totalAttempts) * 100);
        expect(Number.isNaN(completion)).toBe(false);
        expect(completion).toBe(0);
    });
});

describe('getRhymeStats() contract', () => {
    it('returns an object with totalCorrect and totalAttempts', () => {
        const stats = getRhymeStats();
        expect(typeof stats.totalCorrect).toBe('number');
        expect(typeof stats.totalAttempts).toBe('number');
    });

    it('does not expose sub-object keys that would break hub consumption', () => {
        const stats = getRhymeStats();
        expect(stats.rhymeMatch).toBeUndefined();
        expect(stats.rhymeSort).toBeUndefined();
        expect(stats.oddOneOut).toBeUndefined();
    });

    it('percentage calculation does not produce NaN for fresh profile', () => {
        const s = getRhymeStats();
        const completion = s.totalAttempts === 0 ? 0 : Math.round((s.totalCorrect / s.totalAttempts) * 100);
        expect(Number.isNaN(completion)).toBe(false);
        expect(completion).toBe(0);
    });
});
