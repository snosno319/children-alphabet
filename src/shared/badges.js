/**
 * Badge / Sticker Collection
 * Pure logic — no DOM here except showBadgeOverlay.
 */
import { LETTERS } from '../alphabet/data.js';
import { getAllProgress, awardBadge, markBadgeSeen } from './storage.js';
import { playCelebrationSound } from './audio.js';
import { spawnBigCelebration } from './confetti.js';
import { showLeo, hideLeo } from './mascot.js';

/* ============================================
   Badge Definitions (44 total)
   ============================================ */

export const BADGE_DEFS = [
    // ── A–Z Letter Badges (26) ──
    ...LETTERS.map(l => ({
        id: `letter_${l.letter}`,
        label: `Letter ${l.letter}`,
        emoji: l.emoji,
        color: l.color,
        description: `Explore AND trace the letter ${l.letter}`,
        category: 'letter',
    })),

    // ── Sub-App First-Play Badges (6) ──
    { id: 'first_abc',      label: 'ABCs Explorer',  emoji: '📖', color: '#FF6B6B', description: 'Do your first ABCs activity',      category: 'activity' },
    { id: 'first_words',    label: 'Word Builder',   emoji: '🔤', color: '#FF8A65', description: 'Do your first Words activity',      category: 'activity' },
    { id: 'first_reading',  label: 'Reader',         emoji: '👁️', color: '#4DB6AC', description: 'Do your first Reading activity',    category: 'activity' },
    { id: 'first_spelling', label: 'Speller',        emoji: '✏️', color: '#7986CB', description: 'Do your first Spelling activity',   category: 'activity' },
    { id: 'first_phonics',  label: 'Phonics Star',   emoji: '🔬', color: '#4FC3F7', description: 'Do your first Phonics Lab activity', category: 'activity' },
    { id: 'first_rhyme',    label: 'Rhyme Time',     emoji: '🎵', color: '#F06292', description: 'Do your first Rhyme Time activity',  category: 'activity' },

    // ── Milestone Badges (12) ──
    { id: 'stars_10',    label: '10 Stars',      emoji: '⭐',  color: '#FFB300', description: 'Earn 10 total stars',                     category: 'milestone' },
    { id: 'stars_50',    label: '50 Stars',      emoji: '🌟',  color: '#FFB300', description: 'Earn 50 total stars',                     category: 'milestone' },
    { id: 'stars_100',   label: '100 Stars',     emoji: '💫',  color: '#FFD54F', description: 'Earn 100 total stars',                    category: 'milestone' },
    { id: 'stars_250',   label: '250 Stars',     emoji: '🌠',  color: '#FFD54F', description: 'Earn 250 total stars',                    category: 'milestone' },
    { id: 'letters_13',  label: 'Half Alphabet', emoji: '🔡',  color: '#A78BFA', description: 'Explore and trace 13 letters',            category: 'milestone' },
    { id: 'letters_26',  label: 'ABCs Master',   emoji: '🏅',  color: '#A78BFA', description: 'Explore and trace all 26 letters!',       category: 'milestone' },
    { id: 'quiz_ace',    label: 'Quiz Ace',       emoji: '🎯',  color: '#34C759', description: 'Score 100% on any quiz',                  category: 'milestone' },
    { id: 'streak_3',    label: '3-Day Streak',   emoji: '🔥',  color: '#FF6B6B', description: 'Complete 3 daily challenges in a row',    category: 'milestone' },
    { id: 'streak_7',    label: 'Week Streak',    emoji: '🔥',  color: '#FF3B30', description: 'Complete 7 daily challenges in a row',    category: 'milestone' },
    { id: 'daily_5',     label: 'Daily Pro',      emoji: '📅',  color: '#34D399', description: 'Complete 5 daily challenges total',       category: 'milestone' },
    { id: 'all_stories', label: 'Story Reader',   emoji: '📚',  color: '#64B5F6', description: 'Read all 12 stories',                     category: 'milestone' },
    { id: 'rhyme_master',label: 'Rhyme Master',   emoji: '🎶',  color: '#F472B6', description: 'Try all 3 Rhyme Time games',              category: 'milestone' },
];

// Fast lookup by id
export const BADGE_BY_ID = Object.fromEntries(BADGE_DEFS.map(b => [b.id, b]));

/* ============================================
   checkAndAwardBadges
   ctx = { quizAce: bool } — optional caller context
   Returns array of newly awarded badge IDs.
   ============================================ */

export function checkAndAwardBadges(navigate, ctx = {}) {
    const p = getAllProgress();
    const { alphabet: al, cvc, sight, wordBuilder: wb, phonics: ph, rhyme: rh } = p;

    const newBadges = [];
    function check(id, condition) {
        if (condition && awardBadge(id)) newBadges.push(id);
    }

    // ── A–Z Letter Badges ──
    for (const l of LETTERS) {
        check(`letter_${l.letter}`,
            al.exploredLetters.includes(l.letter) && al.tracedLetters.includes(l.letter));
    }

    // ── First-Play Activity Badges ──
    check('first_abc',
        al.exploredLetters.length > 0 || al.tracedLetters.length > 0 || al.quizTotal > 0);
    check('first_words',
        cvc.builtWords.length > 0 || cvc.quizTotal > 0 || cvc.exploredFamilies.length > 0);
    check('first_reading',
        sight.learnedWords.length > 0 || sight.matchTotal > 0 || sight.storiesRead.length > 0);
    check('first_spelling',
        wb.spelledWords.length > 0 || wb.matchedWords.length > 0 || wb.blendedWords.length > 0 || (wb.dailyCompleted?.length > 0));
    check('first_phonics',
        ph.soundMatchTotal > 0 || ph.soundSortTotal > 0 || ph.endSoundTotal > 0);
    check('first_rhyme',
        rh.rhymeMatchTotal > 0 || rh.rhymeSortTotal > 0 || rh.oddOneOutTotal > 0);

    // ── Star Milestones ──
    const totalStars = (al.stars || 0) + (cvc.stars || 0) + (sight.stars || 0)
        + (wb.stars || 0) + (ph.stars || 0) + (rh.stars || 0);
    check('stars_10',  totalStars >= 10);
    check('stars_50',  totalStars >= 50);
    check('stars_100', totalStars >= 100);
    check('stars_250', totalStars >= 250);

    // ── Letter Mastery Milestones ──
    const mastered = LETTERS.filter(l =>
        al.exploredLetters.includes(l.letter) && al.tracedLetters.includes(l.letter)
    ).length;
    check('letters_13', mastered >= 13);
    check('letters_26', mastered >= 26);

    // ── Quiz / Streak / Daily Milestones ──
    check('quiz_ace',    ctx.quizAce === true);
    check('streak_3',    (wb.streak || 0) >= 3);
    check('streak_7',    (wb.streak || 0) >= 7);
    check('daily_5',     (wb.dailyCompleted?.length || 0) >= 5);
    check('all_stories', (sight.storiesRead?.length || 0) >= 12);
    check('rhyme_master',
        rh.rhymeMatchTotal > 0 && rh.rhymeSortTotal > 0 && rh.oddOneOutTotal > 0);

    if (newBadges.length > 0) {
        showBadgeOverlay(newBadges, navigate);
    }

    return newBadges;
}

/* ============================================
   Badge Earn Overlay
   Full-screen modal — shows one badge at a time.
   Tapping advances to next; last tap closes it.
   ============================================ */

export function showBadgeOverlay(badgeIds, navigate) {
    // Remove any existing overlay first
    document.getElementById('badge-overlay')?.remove();

    let current = 0;

    function showNext() {
        if (current >= badgeIds.length) {
            // All shown — clean up
            badgeIds.forEach(id => markBadgeSeen(id));
            document.getElementById('badge-overlay')?.remove();
            hideLeo();
            return;
        }

        const id = badgeIds[current];
        const def = BADGE_BY_ID[id];
        if (!def) { current++; showNext(); return; }

        // Confetti + sound + Leo only on first badge
        if (current === 0) {
            playCelebrationSound();
            spawnBigCelebration();
            showLeo('badge_earned', {}, { duration: 3500, position: 'bottom-right' });
        }

        const more = badgeIds.length - current - 1;
        const moreLabel = more > 0 ? `${more} more!` : 'Tap to collect!';

        const overlay = document.createElement('div');
        overlay.id = 'badge-overlay';
        overlay.innerHTML = `
            <div class="badge-overlay-inner">
                <div class="badge-overlay-sparkle">✨ NEW STICKER! ✨</div>
                <div class="badge-overlay-icon" style="background:${def.color}">${def.emoji}</div>
                <div class="badge-overlay-label">${def.label}</div>
                <div class="badge-overlay-desc">${def.description}</div>
                <div class="badge-overlay-tap">${moreLabel}</div>
            </div>
        `;

        overlay.addEventListener('click', () => {
            overlay.classList.add('badge-overlay-exit');
            setTimeout(() => {
                overlay.remove();
                current++;
                showNext();
            }, 250);
        });

        document.body.appendChild(overlay);
    }

    injectBadgeOverlayStyles();
    showNext();
}

function injectBadgeOverlayStyles() {
    if (document.getElementById('badge-overlay-styles')) return;
    const style = document.createElement('style');
    style.id = 'badge-overlay-styles';
    style.textContent = `
        #badge-overlay {
            position: fixed; inset: 0; z-index: 1000;
            background: rgba(0,0,0,0.75);
            display: flex; align-items: center; justify-content: center;
            animation: badgeFadeIn 300ms ease forwards;
            cursor: pointer;
        }
        #badge-overlay.badge-overlay-exit { animation: badgeFadeOut 250ms ease forwards; }
        .badge-overlay-inner {
            background: #fff;
            border-radius: 32px;
            padding: 40px 32px 36px;
            text-align: center;
            max-width: 320px;
            width: 88%;
            box-shadow: 0 24px 64px rgba(0,0,0,0.35);
            animation: badgeSlideUp 350ms cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .badge-overlay-sparkle {
            font-size: 1.1rem; font-weight: 800; color: #A78BFA;
            letter-spacing: 1px; margin-bottom: 20px;
        }
        .badge-overlay-icon {
            width: 120px; height: 120px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 64px;
            margin: 0 auto 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            animation: badgeBounce 800ms cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .badge-overlay-label {
            font-family: var(--font-display, 'Nunito', sans-serif);
            font-size: 1.6rem; font-weight: 800; color: #1a1a2e;
            margin-bottom: 8px;
        }
        .badge-overlay-desc {
            font-size: 1rem; color: #666; margin-bottom: 24px; line-height: 1.4;
        }
        .badge-overlay-tap {
            background: linear-gradient(135deg, #A78BFA, #7C3AED);
            color: #fff;
            font-family: var(--font-display, 'Nunito', sans-serif);
            font-size: 1.1rem; font-weight: 800;
            padding: 14px 32px;
            border-radius: 50px;
            display: inline-block;
            box-shadow: 0 4px 16px rgba(124,58,237,0.4);
        }
        @keyframes badgeFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes badgeFadeOut { from { opacity:1 } to { opacity:0 } }
        @keyframes badgeSlideUp {
            from { opacity:0; transform: translateY(40px) scale(0.85) }
            to   { opacity:1; transform: translateY(0)    scale(1)    }
        }
        @keyframes badgeBounce {
            0%   { transform: scale(0) }
            60%  { transform: scale(1.15) }
            80%  { transform: scale(0.95) }
            100% { transform: scale(1) }
        }
    `;
    document.head.appendChild(style);
}
