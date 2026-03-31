# English Adventure — Children's Alphabet Learning App

## What This Is
Voice-guided alphabet and literacy learning app for ages 4-6. Built with Vanilla JS + Vite + Capacitor (iOS/Android). Uses pre-generated Kokoro TTS audio files (348 WAV files bundled in `public/audio/`).

## Tech Stack
- Vanilla JavaScript (ES Modules), Vite 7.3.1
- Capacitor 8.1.0 for iOS/Android native builds
- Kokoro TTS (kokoro-js) — used to pre-generate audio; 348 WAV files bundled in `public/audio/`
- canvas-confetti 1.9.4 — physics-based celebration effects
- Vitest 4.1.2 + jsdom 29.0.1 for testing (205 tests, all passing)

## App Structure — 6 Sub-Apps
1. **ABCs** (`src/alphabet/`) — letter exploration, tracing (with color picker), quizzes
2. **Words** (`src/cvc/`) — CVC word families and blending
3. **Reading** (`src/sight/`) — sight word flashcards, matching, stories
4. **Spelling** (`src/word-builder/`) — spelling, picture matching, blending, daily challenges
5. **Phonics Lab** (`src/phonics/`) — sound matching and identification
6. **Rhyme Time** (`src/rhyme/`) — rhyming word games

## Other Features
- Multi-profile system (siblings with separate progress)
- Journey Mode — guided adaptive daily learning path (`src/shared/journey.js`)
- Parent Dashboard — real progress data, A-Z grid, mastered/struggling words, streak (`src/screens/parents.js`)
- Full offline support after initial load
- Varied voice feedback — `speakInstruction('correct'/'wrong')` used on every answer in all 6 sub-apps
- Visual feedback — `src/shared/feedback.js`: `floatStars()`, `ripplePress()`, `shakeEl()`, `bounceEl()`

## Current State
**Build: PASSING. All 6 modules fully implemented. 205 tests passing.**

### Branch
Active development branch: `main` (all feature work merged)

### Known Issues (pre-launch)
- **TTS fallback disabled** — `src/shared/audio.js` `speakTTS()` intentionally returns early; the 348 bundled WAV files cover all strings. Only an issue if new strings are added.
- **Audio generation script broken** — `scripts/generate-audio.mjs` has `TypeError: EdgeTTS is not a constructor`; not needed at runtime, only needed if new audio strings are added.

## Architecture Notes

### Navigation
- All navigation goes through `navigate(screen, props)` in `src/main.js`
- Screen IDs are explicit (e.g. `'alphabet-home'`, `'phonics-home'`) — no redirect maps
- Each screen module exports `render*(app, navigate, props = {})` and `inject*Styles()`

### Audio
- `src/shared/audio.js` exports `playAudio(path, fallbackText)` for WAV playback and `slug(text)` to convert text to audio file paths
- `speakInstruction(key)` picks randomly from arrays of WAV files in the `INSTRUCTIONS` map — this is how varied feedback works
- `playCorrectSound()` / `playWrongSound()` / `playCelebrationSound()` are Web Audio API synth sounds (not WAVs)
- **Timing note**: `playAudio()` calls `cancelAudio()` first, killing the currently playing WAV. When `speakWord()`/`speakLetterFull()` is called before `speakInstruction()`, use a 700ms delay: `setTimeout(() => speakInstruction('correct'), 700)`
- Pre-generated files live in `public/audio/` (letters/, phonics/, words/, intro/, feedback/, facts/, ui/, extras/)
- `window.speechSynthesis?.cancel()` is used (optional chaining) throughout to avoid crashes on platforms without SpeechSynthesis

### Storage
- Single localStorage key per profile: `english-adventure-progress-{profileId}`
- `src/shared/storage.js` — all progress functions; `createDefaultProgress()` is the canonical schema
- Use `completeDailyChallenge()` (not `markDailyCompleted(dateStr)`) for the daily streak flow
- **Planned addition**: `global.streak` + `global.lastStreakDate` for app-wide streak (see SPECS.md)
- **Planned addition**: `global.earnedBadges[]` for badge/sticker collection (see SPECS.md)

### Journey Mode
- `window.isJourneyMode` global flag set by `src/shared/journey.js`
- `advanceJourney(navigate)` / `exitJourney(navigate)` — call these instead of navigating directly when in journey mode

## Key Files
- `src/main.js` — router/entry point (~100 lines, 26 screens)
- `src/shared/audio.js` — audio engine (~550 lines); INSTRUCTIONS map at line ~295
- `src/shared/storage.js` — localStorage progress tracking, multi-profile
- `src/shared/journey.js` — adaptive daily learning path
- `src/shared/feedback.js` — visual feedback utilities (floatStars, ripplePress, shakeEl, bounceEl)
- `src/shared/confetti.js` — canvas-confetti wrappers: spawnConfetti, spawnBigCelebration, spawnStarBurst
- `src/screens/parents.js` — parent dashboard (~440 lines); shows all 6 sub-app stats
- `src/alphabet/trace.js` — letter tracing with canvas + 8-color palette
- `public/audio/` — 348 pre-generated WAV files (letters/, phonics/, words/, intro/, feedback/, facts/, ui/, extras/)

## Dev Commands
```sh
npm run dev           # Vite dev server
npm run build         # production build (passes)
npm test              # run all tests (205)
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

## Completed Work (session history)
1. Test infrastructure + tech debt cleanup (PR #1, squash-merged)
2. Remove RevenueCat/subscription system; update docs (PR #2, squash-merged)
3. Parent dashboard — full progress reporting (A-Z grid, mastered/struggling, streak, last-active, reset)
4. Varied voice feedback — `speakInstruction` on every correct/wrong answer across all game screens
5. Trace color picker — 8-color palette in trace screen; resets to letter color on navigation
6. UI/UX overhaul — hub labels fix, profile screen, canvas-confetti, nav card labels, floatStars feedback

## Roadmap (see SPECS.md for full technical specs)

### Sprint 1 — Critical Gaps (highest engagement impact)
1. **Alphabet Song** (`src/alphabet/song.js`) — interactive ABC sing-along; letters highlight in sequence; tap-along mode; uses Web Audio API melody + existing letter WAVs
2. **Leo the Lion mascot** (`src/shared/mascot.js`) — named guide character; appears on hub, journey complete, badge earned, streaks; speech bubble reactions; no new audio assets needed
3. **Badge / Sticker collection** (`src/screens/badges.js`) — 26 letter badges + activity + milestone badges; virtual sticker book grid; earn notification overlay; badge check on every activity complete

### Sprint 2 — High Value Additions
4. **App-wide daily streak** — add `global.streak` + `global.lastStreakDate` to storage schema; `updateGlobalStreak()` called on any activity complete; hub badge already displays it
5. **Memory flip card game** (`src/alphabet/memory.js`) — 3D flip cards matching letter↔emoji; 2 difficulty levels; uses existing LETTERS data; route `'memory'`
6. **Numbers module** (`src/numbers/`) — 1–10 with explore/trace/quiz/count activities; new hub card; new storage section; architecture mirrors alphabet module
7. **Uppercase ↔ Lowercase sort** (`src/alphabet/case-match.js`) — show uppercase, tap matching lowercase from 3 choices; route `'case-match'`; add to alphabet-home nav

### Sprint 3 — UX / Engagement Polish
8. **Guided trace stroke order** — SVG animated arrows overlaid on canvas; "Show me" button; stroke path data added to `alphabet/data.js`; `stroke-dashoffset` animation
9. **In-session combo streak** — `sessionStreak` counter in quiz screens; 3-in-a-row = small sparkle; 5-in-a-row = bigger burst; new INSTRUCTIONS keys `streak_3`, `streak_5`
10. **Letter collector map** — replace letter strip in explore with 5×6 treasure-chest grid; 🔒/📦/✨ states based on explored+traced progress
11. **Story time auto-read** — "🔊 Read to me" button in stories; sequential `speakWord()` with word highlight; 4 additional stories (total 12)
12. **Parent share report** — "Share Progress" button in parent dashboard; uses `navigator.share()` Web Share API; formatted weekly summary text

---

## Implementation Plan: Badge / Sticker Collection (Sprint 1, Item 3)

> **Why this matters**: Children ages 3–5 respond strongly to collection mechanics. Stars currently accumulate with no tangible outcome — a virtual sticker book converts abstract points into a visible, shareable collection. The A–Z letter sticker page is both a learning record and a social mechanic (show parents). Proven retention driver in every top-performing kids app (Duolingo stickers, Khan Kids badges, Endless Alphabet unlocks).

### Overview
A two-part feature:
1. **Badge earning logic** — checks triggered after every activity completion; awards badges; shows a full-screen earn overlay
2. **Sticker Book screen** — grid of all badges; locked vs earned states; navigable from hub + parent dashboard

### Badge Categories (44 total)

**A–Z Letter Badges (26)**
- ID: `letter_A` through `letter_Z`
- Emoji: each letter's emoji from `LETTERS[i].emoji` in `alphabet/data.js`
- Earn condition: letter has been both explored AND traced (`exploredLetters.includes(X) && tracedLetters.includes(X)`)
- Display: colored circle matching `LETTERS[i].color`; letter printed large; emoji below

**Sub-App First-Play Badges (6)**
- IDs: `first_abc`, `first_words`, `first_reading`, `first_spelling`, `first_phonics`, `first_rhyme`
- Earn condition: first time any activity in that sub-app is completed
- Emojis: 📖 🔤 👁️ ✏️ 🔬 🎵

**Milestone Badges (12)**
- `stars_10` / `stars_50` / `stars_100` / `stars_250` — total stars thresholds
- `letters_13` — half the alphabet explored+traced
- `letters_26` — full alphabet explored+traced ("ABCs Master")
- `quiz_ace` — score 100% on any quiz (10/10 or 5/5)
- `streak_3` — 3-day daily challenge streak
- `streak_7` — 7-day daily challenge streak
- `daily_5` — complete 5 daily challenges total
- `all_stories` — all 8 current stories read
- `rhyme_master` — complete all 3 rhyme activities at least once

### Storage Schema Changes
Add to `createDefaultProgress()` in `src/shared/storage.js`:
```js
global: {
  lastActivity: null,
  streak: 0,                  // app-wide (planned, Sprint 2)
  lastStreakDate: null,        // app-wide (planned, Sprint 2)
  earnedBadges: [],           // string[] — badge IDs in earn order, e.g. ['letter_A', 'first_abc']
  badgeSeenAt: {},            // { badgeId: timestamp } — prevents re-showing earn overlay
}
```

New functions to add in `src/shared/storage.js`:
```js
export function getEarnedBadges()           // returns string[]
export function hasBadge(id)                // returns boolean
export function awardBadge(id)              // adds to earnedBadges if not present; returns true if newly awarded
export function markBadgeSeen(id)           // records in badgeSeenAt
export function getUnseenBadges()           // badges earned but not yet shown in overlay
```

### New File: `src/shared/badges.js`
Central badge definitions + check logic. No UI — pure data/logic.

```js
export const BADGE_DEFS = [ /* array of 44 badge definition objects */ ]
// { id, label, emoji, color, description, category: 'letter'|'activity'|'milestone' }

export function checkAndAwardBadges(navigate)
// Reads current progress, checks all 44 conditions, calls awardBadge() for each new one.
// Returns array of newly awarded badge IDs.
// Called after EVERY activity completion across all 6 sub-apps.
```

### New File: `src/screens/badges.js`
The sticker book screen. Route: `'badges'` (add to `src/main.js`).

**Layout:**
```
┌─────────────────────────────────┐
│  ⬅  My Sticker Book  🏆 12/44  │  ← header with back + count
├─────────────────────────────────┤
│  A–Z Letters ─────────────────  │  ← section header
│  [A🍎] [B🐻] [C🐱] … [Z🦓]    │  ← 6-col grid, earned=full color, locked=gray+🔒
├─────────────────────────────────┤
│  Activities ──────────────────  │
│  [📖][🔤][👁️][✏️][🔬][🎵]    │
├─────────────────────────────────┤
│  Milestones ──────────────────  │
│  [⭐10][⭐50]…                  │
└─────────────────────────────────┘
```

- Earned badges: full color, slight bounce-in animation on render
- Locked badges: grayscale + 40% opacity + 🔒 icon
- Tap earned badge: show tooltip with label + earn date
- Tap locked badge: show tooltip with how to unlock ("Explore AND trace the letter A")
- Badge count in header: `earned / total`

### New Component: Badge Earn Overlay
Shown after `checkAndAwardBadges()` returns ≥1 new badge. Full-screen modal overlay, not a toast — this is a celebration moment.

```
┌─────────────────────────────────┐
│                                 │
│      ✨ NEW STICKER! ✨          │
│                                 │
│         🍎                      │  ← big badge emoji (120px)
│      Letter A                   │  ← badge label
│   "You explored and traced A!"  │  ← description
│                                 │
│      [ Tap to collect! ]        │
│                                 │
└─────────────────────────────────┘
```
- confetti burst on appear (`spawnBigCelebration()`)
- `speakInstruction('badge_earned')` — new INSTRUCTIONS key needed (or reuse `'correct'`)
- If multiple badges earned at once: show one at a time, tap advances to next
- After all shown: overlay closes, `markBadgeSeen()` called for each

### Integration Points (where to call `checkAndAwardBadges()`)

| File | When to call |
|------|-------------|
| `src/alphabet/explore.js` | after `markExplored()` |
| `src/alphabet/trace.js` | after tracing complete (letter save) |
| `src/alphabet/quiz.js` | on quiz results screen render |
| `src/cvc/quiz.js` | on quiz results screen render |
| `src/cvc/build.js` | after successful word build |
| `src/sight/flashcards.js` | after marking word learned |
| `src/sight/match.js` | on activity complete |
| `src/sight/stories.js` | after marking story read |
| `src/word-builder/daily.js` | after `completeDailyChallenge()` |
| `src/phonics/sound-match.js` | on activity complete |
| `src/phonics/sound-sort.js` | on activity complete |
| `src/phonics/end-sound.js` | on activity complete |
| `src/rhyme/rhyme-match.js` | on activity complete |
| `src/rhyme/rhyme-sort.js` | on activity complete |
| `src/rhyme/odd-one-out.js` | on activity complete |

### Hub Integration
- Add "My Stickers" button/chip to hub header area (near streak badge)
- Shows count of earned badges: `🏆 12`
- Taps to navigate `'badges'`
- On app load, call `checkAndAwardBadges()` once to catch any retroactively earned badges from existing progress

### Parent Dashboard Integration
- Add "Badges" section below the A-Z grid in `src/screens/parents.js`
- Shows earned badge count + 5 most recently earned badges as small icons
- "View all" links to badges screen

### Audio Needs
No new WAV files required. For the earn overlay use:
- `playCelebrationSound()` (existing Web Audio API synth)
- `spawnBigCelebration()` (existing confetti)
- Optionally add `INSTRUCTIONS['badge_earned']` key pointing to existing celebration WAVs from `public/audio/feedback/`

### Implementation Order
1. Add storage fields + functions to `storage.js`
2. Create `src/shared/badges.js` with `BADGE_DEFS` array + `checkAndAwardBadges()`
3. Create badge earn overlay as a shared helper (inline in badges.js or as `showBadgeOverlay(badges, navigate)`)
4. Create `src/screens/badges.js` sticker book screen
5. Register route `'badges'` in `src/main.js`
6. Add `checkAndAwardBadges()` calls at the 15 integration points above
7. Add sticker book entry point to hub + parent dashboard

### Estimated Scope
- `src/shared/storage.js` — +30 lines (schema + 5 functions)
- `src/shared/badges.js` — ~120 lines (new file)
- `src/screens/badges.js` — ~220 lines (new file, sticker book screen)
- `src/main.js` — +2 lines (route registration)
- `src/hub/home.js` — +15 lines (badge chip + navigation)
- `src/screens/parents.js` — +30 lines (badge summary section)
- 15 integration point files — +2-3 lines each (~40 lines total)
- **Total: ~460 lines added/changed**
