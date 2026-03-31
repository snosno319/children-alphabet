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
7. Badge / Sticker collection — 44 badges, earn overlay, sticker book screen, 15 integration points

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

---

## Implementation Plan: Alphabet Song (Sprint 1, Item 1)

> **Why this matters**: The ABC song is the single most recognisable piece of early literacy content in the world. Children who are learning letters already know the tune — anchoring it to the app creates an immediate "I know this!" moment. Tap-along mode adds interactivity; the melody plays even without tapping, so passive engagement is also supported. No new audio assets required (letter WAVs a.wav–z.wav already exist).

### Overview
Two modes in one screen:
1. **Auto-play**: tap ▶ — melody plays A→Z automatically, each letter glows in sequence, child can tap along
2. **Tap mode**: all letters visible; tap any letter to hear it sing (plays note + WAV); no auto-advance

### Melody Data
ABC song follows the Twinkle Twinkle Little Star tune. Each letter mapped to a frequency (Hz) and duration (seconds) at ~BPM 112:

```js
// Quarter = 0.43s, Half = 0.72s at BPM 112
const ABC_MELODY = [
  // A B C D E F G  (Twinkle twinkle little...)
  { letter:'A', freq:261.63, dur:0.43 }, // C4
  { letter:'B', freq:261.63, dur:0.43 }, // C4
  { letter:'C', freq:392.00, dur:0.43 }, // G4
  { letter:'D', freq:392.00, dur:0.43 }, // G4
  { letter:'E', freq:440.00, dur:0.43 }, // A4
  { letter:'F', freq:440.00, dur:0.43 }, // A4
  { letter:'G', freq:392.00, dur:0.72 }, // G4 (half)
  // H I J K L M N  (star how I wonder...)
  { letter:'H', freq:349.23, dur:0.43 }, // F4
  { letter:'I', freq:349.23, dur:0.43 }, // F4
  { letter:'J', freq:329.63, dur:0.43 }, // E4
  { letter:'K', freq:329.63, dur:0.43 }, // E4
  { letter:'L', freq:293.66, dur:0.43 }, // D4
  { letter:'M', freq:293.66, dur:0.43 }, // D4
  { letter:'N', freq:261.63, dur:0.72 }, // C4 (half)
  // O P  Q R S  T U V  W X Y Z
  { letter:'O', freq:392.00, dur:0.43 }, // G4
  { letter:'P', freq:392.00, dur:0.58 }, // G4
  { letter:'Q', freq:349.23, dur:0.43 }, // F4
  { letter:'R', freq:349.23, dur:0.43 }, // F4
  { letter:'S', freq:329.63, dur:0.72 }, // E4 (half)
  { letter:'T', freq:329.63, dur:0.43 }, // E4
  { letter:'U', freq:293.66, dur:0.43 }, // D4
  { letter:'V', freq:293.66, dur:0.72 }, // D4 (half)
  { letter:'W', freq:261.63, dur:0.43 }, // C4
  { letter:'X', freq:392.00, dur:0.43 }, // G4
  { letter:'Y', freq:440.00, dur:0.43 }, // A4
  { letter:'Z', freq:392.00, dur:0.90 }, // G4 (long final)
];
```

Each step plays:
1. A short Web Audio oscillator tone at `freq` for `dur * 0.85` (staccato gap)
2. `playAudio('audio/letters/${letter.toLowerCase()}.wav')` simultaneously

### Screen Layout
```
┌─────────────────────────────────┐
│  ⬅  ABC Song            🎵      │  ← header, back to alphabet-home
├─────────────────────────────────┤
│                                 │
│  [A🍎][B🐻][C🐱][D🐶][E🐘][F🐟] │
│  [G🦒][H🐴][I🍦][J🪼][K🐨][L🦁] │  ← 5 rows × 6 cols (last row: Y Z)
│  [M🐭][N🐦][O🐙][P🐷][Q👸][R🌈] │
│  [S🐍][T🐯][U☂️][V🎻][W🐺][X❌]  │
│  [Y🪀][Z🦓]                     │
│                                 │
│  active letter: glows + bounces │  ← ring highlight + scale(1.25)
├─────────────────────────────────┤
│   [ ▶ Sing! ]  [ 🔤 Tap mode ]  │  ← play/stop + mode toggle
└─────────────────────────────────┘
```

- **Active letter**: colored circle glow matching `LETTERS[i].color`, scale(1.25), bounce animation
- **Inactive**: normal rounded square
- **Completed** (auto-play past): slight dim (opacity 0.5)
- **Tap mode active**: all letters at full opacity; tap triggers single-letter sing; no auto-advance

### Control Bar
- `▶ Sing!` / `⏹ Stop` — toggles auto-play; becomes Stop while playing
- `🔤 Tap` — tap mode: disables auto-play, child taps any letter at their own pace
- Auto-play loops once and stops (does not loop forever)

### Tap Interaction (both modes)
- Tapping a letter in auto-play: plays `spawnStarBurst(x,y)` at tap position + visual pop
- Tapping a letter in tap mode: plays note + WAV + highlights it + star burst

### Audio Implementation
```js
// Single letter sing (used in both modes)
function singLetter(index) {
    const { letter, freq, dur } = ABC_MELODY[index];
    // 1. Play synth note
    playMelodyNote(freq, dur * 0.85);
    // 2. Play WAV simultaneously
    playAudio(`audio/letters/${letter.toLowerCase()}.wav`);
    // 3. Highlight cell
    highlightCell(index);
}

// Web Audio tone (gentle sine wave, child-friendly)
function playMelodyNote(freq, duration) {
    const ctx = getAudioContext(); // imported from audio.js
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
}
```

**Timing challenge**: `playAudio()` cancels any currently playing WAV. In auto-play, successive letters cancel each other's WAV — this is intentional (letter name clips are short). Gap between notes (staccato) provides clean separation.

### New File: `src/alphabet/song.js`
Exports: `renderSong(app, navigate, props = {})`, `injectSongStyles()`

### Route + Nav
- Route: `'song'` in `src/main.js`
- Add **Song** button to `src/alphabet/home.js` nav row: `🎵` icon, label "Song", gradient `linear-gradient(135deg, #FFB300, #FF8A65)`
- Nav row becomes 4 buttons (Explore, Trace, Quiz, Song) — reduce `width` from 110px to 90px on each, or use 2×2 grid layout

### Estimated Scope
- `src/alphabet/song.js` — ~200 lines (new file)
- `src/alphabet/home.js` — +10 lines (song button + CSS tweak)
- `src/main.js` — +2 lines (route)
- **Total: ~215 lines**

---

## Implementation Plan: Leo the Lion Mascot (Sprint 1, Item 2)

> **Why this matters**: Named characters dramatically increase emotional engagement and retention in children's education apps (evidence: Duolingo's Duo, Khan Kids' characters, Elmo). Leo costs zero audio assets (pure CSS/emoji) and appears in high-value moments: greeting on the hub, celebrating badges, encouraging streaks. A consistent character makes the app feel alive.

### Overview
Leo is a reusable floating component. He appears at the bottom of the screen with a speech bubble, animates in, delivers a message, then fades out (or stays until dismissed). All appearances are non-blocking — they don't prevent interaction with the screen underneath.

### Leo Visual (pure CSS + emoji)
```
    🦁         ← 64px emoji, slight bounce idle animation
  ┌──────────────────┐
  │ Hi! Ready to     │  ← speech bubble (rounded, white, drop shadow)
  │ learn today? 🌟  │
  └──────────────────┘
```
- Positioned: `position:fixed; bottom: 16px; left: 16px` (default)
- Entrance: `slideInLeft` 400ms ease
- Exit: `slideOutLeft` 300ms ease, then DOM removal
- Speech bubble: white rounded rect with left-pointing tail (CSS `::before` triangle)
- Leo emoji bounces gently (keyframe: `translateY(0) → translateY(-6px)` 1.5s ease loop)
- On `celebrate` context: Leo jumps (`translateY(-20px)` quick pop)
- On `streak` context: Leo has animated 🔥 next to him

### Contexts & Messages
```js
const LEO_MESSAGES = {
  hub_greeting: [
    "Hi! Ready to learn? 🌟",
    "Let's have fun today! 🎉",
    "You're a star learner! ⭐",
    "What shall we learn? 🤔",
  ],
  hub_streak: (n) => `🔥 ${n} days in a row! Wow!`,
  hub_stars:  (n) => `⭐ ${n} stars! You're amazing!`,
  badge_earned:   ["New sticker! You rock! 🏆", "Collect them all! ✨"],
  journey_done:   ["Journey complete! Amazing! 🎊", "You did it! I'm so proud! 🦁"],
  well_done:      ["Great job! Keep going! 💪", "You're getting better! 🌈"],
};
```

Streak message shows if `streak >= 3`. Star message shows if `totalStars >= 10`. Otherwise shows a random `hub_greeting`.

### API
```js
// Mount Leo to a container element. He auto-dismisses after `duration` ms (default 4000).
// Returns a cleanup function.
export function showLeo(context, data = {}, options = {})
// context: 'hub'|'badge_earned'|'journey_done'|'well_done'
// data: { streak, totalStars, badgeLabel }
// options: { duration: 4000, position: 'bottom-left'|'bottom-right'|'center' }

// Remove Leo immediately (used on navigation)
export function hideLeo()
```

### Integration Points
| Location | Context | Trigger |
|---|---|---|
| `src/hub/home.js` | `'hub'` | On render — shows after 1.2s delay |
| `src/shared/badges.js` (overlay) | `'badge_earned'` | Leo peeks from bottom of overlay |
| `src/shared/journey.js` | `'journey_done'` | After `advanceJourney` completes all steps |

### Hub Integration Detail
- Leo appears 1.2s after hub renders
- Message chosen based on: streak ≥ 3 → streak message; else totalStars ≥ 10 → stars message; else random greeting
- Auto-dismisses after 4s
- Tapping Leo dismisses him immediately (with a little wave animation)
- Leo is hidden when navigating away (hub nav event fires `hideLeo()`)

### Badge Overlay Integration
- In `showBadgeOverlay()` (badges.js), Leo appears at bottom of overlay with `'badge_earned'` context
- Uses `position: 'bottom-left'` within the overlay (not the full screen)

### Journey Complete Integration
- In `src/shared/journey.js`, after all journey steps done, call `showLeo('journey_done', {}, { duration: 5000 })`

### New File: `src/shared/mascot.js`
```js
export function showLeo(context, data = {}, options = {}) { ... }
export function hideLeo() { ... }
export function injectMascotStyles() { ... }
```

### Estimated Scope
- `src/shared/mascot.js` — ~120 lines (new file)
- `src/hub/home.js` — +5 lines (showLeo call + hideLeo on navigate)
- `src/shared/badges.js` — +4 lines (showLeo in overlay)
- `src/shared/journey.js` — +3 lines (showLeo on complete)
- **Total: ~135 lines**

---

## Implementation Plan: Memory Flip Card Game (Sprint 2, Item 1)

> **Why this matters**: Memory / concentration games build letter recognition through repeated visual exposure. 3D flip cards are intrinsically satisfying for young children (tactile metaphor). Uses zero new audio assets — each flip speaks the letter WAV. Short session (4 pairs = ~2 min) keeps engagement high.

### Overview
A classic flip-card matching game. Cards are placed face-down. Child taps a card to flip it and reveal a letter+emoji. Tap a second card — if they match, both stay face-up (celebrate). If not, both flip back. Game ends when all pairs are matched.

**Matching rule**: Each pair is a letter card (e.g. "A") and its emoji card (🍎). So the child is learning letter↔emoji association, not just memory.

**Difficulty levels**:
- **Easy**: 8 cards (4 pairs) — letters A, B, C, D
- **Hard**: 16 cards (8 pairs) — letters A through H

### Card Types Per Pair
Each pair = one letter card + one emoji card:
```
Card A (letter side):  big letter "A" + small label "Apple"
Card B (emoji side):   big emoji  🍎  + small label "Apple"
```
Both cards share the same letter color from `LETTERS[i].color`.

### Screen Layout
```
┌─────────────────────────────────┐
│  ⬅  Memory            ⭐ 0/4   │  ← header: back + pairs found
├─────────────────────────────────┤
│                                 │
│  [?][?][?][?]                   │  ← Easy: 2×4 grid (8 cards)
│  [?][?][?][?]                   │
│                                 │
│  Hard: 4×4 grid (16 cards)      │
│                                 │
├─────────────────────────────────┤
│  [Easy] [Hard]                  │  ← shown only on game-over/start screen
└─────────────────────────────────┘
```
Cards face-down: gray rounded square with `?` in white. Face-up: colored circle with letter or emoji.

### Game Flow
1. Entry screen: two large buttons — `[Easy 🟢]` and `[Hard 🔴]`
2. On difficulty select: shuffle cards, render grid, start game
3. Tap card 1 → flip animation + speak letter WAV (e.g. `audio/letters/a.wav`)
4. Tap card 2 → flip animation
   - Match: `playCorrectSound()`, `spawnStarBurst(x, y)`, both stay face-up, `matchedPairs++`
   - No match: `playWrongSound()`, `shakeEl()` on both, flip both back after 900ms
5. All pairs matched: celebration — `playCelebrationSound()`, `spawnBigCelebration()`, show results overlay
6. Results overlay: "🎉 Well done! X/X pairs matched!" + "Play Again" + "Back" buttons

### 3D Flip Animation
Pure CSS — no JS animation library:
```css
.memory-card { perspective: 600px; }
.memory-card-inner { transform-style: preserve-3d; transition: transform 0.4s; }
.memory-card.flipped .memory-card-inner { transform: rotateY(180deg); }
.memory-card-front { backface-visibility: hidden; /* shows ? */ }
.memory-card-back  { backface-visibility: hidden; transform: rotateY(180deg); /* shows letter/emoji */ }
```

### Storage Changes
Add to `alphabet` section in `createDefaultProgress()`:
```js
alphabet: {
    // ... existing fields ...
    memoryBestEasy: null,   // number of moves for best Easy game (null = never played)
    memoryBestHard: null,   // number of moves for best Hard game
}
```
Track `moves` (each completed pair attempt = 1 move). Save best score on completion.

### Audio
- On card flip: `playAudio('audio/letters/${letter.toLowerCase()}.wav')`
- On match: `playCorrectSound()`
- On mismatch: `playWrongSound()`
- On game complete: `playCelebrationSound()` + `spawnBigCelebration()`
- No new WAV files needed

### New File: `src/alphabet/memory.js`
Exports: `renderMemory(app, navigate, props = {})`, `injectMemoryStyles()`

### Route + Nav
- Route: `'memory'` in `src/main.js`
- Add **Memory** button to `src/alphabet/home.js` nav: `🃏` icon, label "Memory", gradient `linear-gradient(135deg, #4ECDC4, #44B09E)` — change nav from 2×2 to 3-col grid (Explore, Trace, Quiz on top row; Song, Memory on bottom row — centered)

### Badge Integration
- Call `checkAndAwardBadges(navigate)` on game complete
- No new badge definitions needed for MVP

### Estimated Scope
- `src/alphabet/memory.js` — ~220 lines (new file)
- `src/alphabet/home.js` — +8 lines (memory button + nav layout update)
- `src/main.js` — +2 lines (route)
- `src/shared/storage.js` — +2 lines (memoryBestEasy/Hard fields)
- **Total: ~235 lines**

---

## Implementation Plan: Numbers Module (Sprint 2, Item 2)

> **Why this matters**: Numbers 1–10 are the natural companion to ABCs for 4–6 year olds. Adding a Numbers module completes the foundational literacy/numeracy pair. Architecture mirrors the alphabet module exactly — low implementation risk, high child engagement value.

### Overview
A new top-level sub-app: Numbers 1–10. Two activities:
1. **Explore** — tap a number to see it big, hear its name, see the emoji count representation
2. **Quiz** — tap the correct number from 3 choices

### Numbers Data
New file `src/numbers/data.js`:
```js
export const NUMBERS = [
  { number: 1, word: 'One',   emoji: '🍎', color: '#FF6B6B', funFact: 'One is the loneliest number!' },
  { number: 2, word: 'Two',   emoji: '👟', color: '#FF8A65', funFact: 'You have two eyes, two ears, and two hands!' },
  { number: 3, word: 'Three', emoji: '🍀', color: '#FFB74D', funFact: 'A triangle has three sides!' },
  { number: 4, word: 'Four',  emoji: '🐾', color: '#FFD54F', funFact: 'Most dogs and cats have four legs!' },
  { number: 5, word: 'Five',  emoji: '🖐', color: '#AED581', funFact: 'You have five fingers on each hand!' },
  { number: 6, word: 'Six',   emoji: '❄️', color: '#80CBC4', funFact: 'A snowflake has six sides!' },
  { number: 7, word: 'Seven', emoji: '🌈', color: '#4FC3F7', funFact: 'A rainbow has seven colors!' },
  { number: 8, word: 'Eight', emoji: '🕷️', color: '#9575CD', funFact: 'A spider has eight legs!' },
  { number: 9, word: 'Nine',  emoji: '🐱', color: '#F06292', funFact: 'Cats are said to have nine lives!' },
  { number: 10, word: 'Ten',  emoji: '🤲', color: '#FF7043', funFact: 'You have ten fingers and ten toes!' },
];
```

### Audio
Use number WAVs if they exist in `public/audio/`; fallback to `speakInstruction('correct'/'wrong')`. The number names (one–ten) may need to be added to the audio generation script eventually, but for now use Web Speech API `speechSynthesis.speak()` for number names — same pattern used throughout the app.

Actually: check `public/audio/` for existing number files. If absent, numbers speak via Web Speech API (browser TTS), which the app already supports via `window.speechSynthesis`. This is the TTS fallback already built in.

### Screen Layouts

**Numbers Home (`src/numbers/home.js`)**:
```
┌─────────────────────────────────┐
│  🌈  (back to hub)    ⭐ 0      │
│                                 │
│     1 2 3 (bouncing logo)       │
│     [progress ring]             │
│                                 │
│  [🔍 Explore]  [🧩 Quiz]        │  ← 2-button grid
└─────────────────────────────────┘
```

**Numbers Explore (`src/numbers/explore.js`)**:
- Same pattern as `alphabet/explore.js`
- Numbered card carousel (1–10, swipe or prev/next arrows)
- Each card: big numeral (colored), emoji repeated N times, word label, fun fact
- "Hear it" button: speaks number name
- Marks number as explored in storage

**Numbers Quiz (`src/numbers/quiz.js`)**:
- Same pattern as `alphabet/quiz.js`
- Shows emoji repeated N times: "How many 🍎?" → tap correct numeral from 3 choices
- 5 questions, randomised
- Shows results with star award

### Storage Changes
Add new `numbers` section to `createDefaultProgress()`:
```js
numbers: {
    exploredNumbers: [],    // number[] — e.g. [1, 2, 3]
    quizCorrect: 0,
    quizTotal: 0,
    stars: 0,
},
```

### Hub Integration
Add a 7th card to `SUB_APPS` array in `src/hub/home.js`:
```js
{
    id: 'numbers',
    icon: '🔢',
    mascot: '🦁',
    bg: 'linear-gradient(135deg, #FF7043 0%, #FF8A65 100%)',
    shadow: 'rgba(255,112,67,0.4)',
    label: 'Numbers',
    getCompletion: () => {
        const p = getAllProgress();
        return Math.round(((p.numbers?.exploredNumbers?.length || 0) / 10) * 100);
    },
}
```

### New Files
- `src/numbers/data.js` — number definitions (~15 lines)
- `src/numbers/home.js` — home screen (~100 lines)
- `src/numbers/explore.js` — explore activity (~160 lines)
- `src/numbers/quiz.js` — quiz activity (~160 lines)

### Routes
Add to `src/main.js`:
```js
import { renderHome as renderNumbersHome, injectHomeStyles as injectNumbersHomeStyles } from './numbers/home.js';
import { renderExplore as renderNumbersExplore, injectExploreStyles as injectNumbersExploreStyles } from './numbers/explore.js';
import { renderQuiz as renderNumbersQuiz, injectQuizStyles as injectNumbersQuizStyles } from './numbers/quiz.js';
// ...
'numbers-home':    { render: renderNumbersHome,    styles: injectNumbersHomeStyles },
'numbers-explore': { render: renderNumbersExplore, styles: injectNumbersExploreStyles },
'numbers-quiz':    { render: renderNumbersQuiz,    styles: injectNumbersQuizStyles },
```

### Storage Helper
Add `getNumbersCompletionPercent()` to `storage.js` (mirrors `getAlphabetCompletionPercent()`):
```js
export function getNumbersCompletionPercent() {
    const p = getProgress();
    return Math.round(((p.numbers?.exploredNumbers?.length || 0) / 10) * 100);
}
```

### Estimated Scope
- `src/numbers/data.js` — ~15 lines (new)
- `src/numbers/home.js` — ~100 lines (new)
- `src/numbers/explore.js` — ~160 lines (new)
- `src/numbers/quiz.js` — ~160 lines (new)
- `src/main.js` — +8 lines (imports + routes)
- `src/hub/home.js` — +8 lines (new SUB_APP card)
- `src/shared/storage.js` — +8 lines (schema + helper)
- **Total: ~460 lines**

---

## Implementation Plan: Uppercase ↔ Lowercase Sort (Sprint 2, Item 3)

> **Why this matters**: Recognising that "A" and "a" are the same letter is a critical early literacy milestone. This mini-game directly targets that skill with the simplest possible mechanic: see uppercase, tap matching lowercase. Fast sessions (10 questions), high replay value.

### Overview
A focused quiz: show a large uppercase letter, display 3 lowercase options, child taps the match.

### Screen Layout
```
┌─────────────────────────────────┐
│  ⬅  Upper & Lower     3 / 10   │  ← back + question counter
├─────────────────────────────────┤
│                                 │
│         A                       │  ← big uppercase letter (120px, colored)
│   "Find the lowercase letter"   │  ← instruction label
│                                 │
│   [ a ]   [ b ]   [ c ]         │  ← 3 lowercase choices
│                                 │
└─────────────────────────────────┘
```

### Game Logic
- 10 questions total, random uppercase letters (no repeats per session)
- Each question: show uppercase letter + 3 lowercase choices (1 correct + 2 distractors)
- Distractors: randomly chosen from the other 25 letters, deduplicated
- On correct: green flash on button + `playCorrectSound()` + `floatStars()` + `speakInstruction('correct')` (700ms delay)
- On wrong: red flash + `playWrongSound()` + `shakeEl()` + `speakInstruction('wrong')`
- No second chance — advances after 1s regardless
- Scoring: `correct / 10`, stored in `alphabet.caseMatchCorrect` / `alphabet.caseMatchTotal`
- Stars awarded: 3 correct=1⭐, 6 correct=2⭐, 10 correct=3⭐

### Storage Changes
Add to `alphabet` section in `createDefaultProgress()`:
```js
alphabet: {
    // ... existing fields ...
    caseMatchCorrect: 0,
    caseMatchTotal: 0,
}
```

### Audio
- On correct tap: `playCorrectSound()` then `setTimeout(() => speakInstruction('correct'), 700)`
- On wrong tap: `playWrongSound()` + `speakInstruction('wrong')`
- No new WAV files needed

### New File: `src/alphabet/case-match.js`
Exports: `renderCaseMatch(app, navigate, props = {})`, `injectCaseMatchStyles()`

### Route + Nav
- Route: `'case-match'` in `src/main.js`
- Add to `src/alphabet/home.js` as 6th nav button: `🔡` icon, label "Cases"
- Nav layout: change from 2×2 grid to 3×2 grid (3 columns, 2 rows):
  - Row 1: Explore, Trace, Quiz
  - Row 2: Song, Memory, Cases
  - Each button slightly narrower; keep same height

### Badge Integration
- Call `checkAndAwardBadges(navigate, { quizAce: correct === 10 })` on results screen

### Estimated Scope
- `src/alphabet/case-match.js` — ~180 lines (new file)
- `src/alphabet/home.js` — +10 lines (new button + 3×2 grid CSS update)
- `src/main.js` — +2 lines (route)
- `src/shared/storage.js` — +2 lines (caseMatchCorrect/Total fields)
- **Total: ~195 lines**

---

## Sprint 2 Implementation Order
1. Memory flip card game — self-contained, no dependencies on other Sprint 2 items
2. Numbers module — new directory, additive only (no changes to existing screens except hub + main)
3. Uppercase/Lowercase sort — final alphabet home nav layout change (accommodates all 6 buttons from items 1+3)

---

## Implementation Plan: Story Time Auto-Read (Sprint 3, Item 1)

> **Why this matters**: Reading along while hearing words spoken aloud is one of the highest-evidence early literacy practices. Children who hear fluent reading while seeing text develop phonological awareness faster. The existing story reader already speaks sentences — we just need to add auto-advance + word highlighting to make it truly immersive.

### Overview
Two additions to the existing story reader:
1. **Word-by-word highlighting** while the sentence is spoken — each word glows as it's read
2. **Auto-advance mode** — a single "Read to me" toggle plays all sentences end-to-end, auto-advancing after each sentence finishes; child can tap any word to hear it

Plus **4 new stories** added to `src/sight/data.js` (total 8 → 12).

### Word Highlighting Implementation
Use `SpeechSynthesisUtterance.onboundary` which fires with `e.charIndex` at each word boundary:

```js
// Precompute char offsets for each word token in the sentence
function computeWordOffsets(text) {
    const tokens = []; // { word, charStart, displayIdx }
    let pos = 0;
    text.split(' ').forEach((token, i) => {
        const clean = token.replace(/[.,!?]/g, '');
        tokens.push({ token, clean, charStart: pos, displayIdx: i });
        pos += token.length + 1; // +1 for space
    });
    return tokens;
}

// Build utterance that fires highlights
function speakWithHighlight(text, onWord, onEnd) {
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.62;
    utt.pitch = 1.12;
    utt.onboundary = (e) => {
        if (e.name !== 'word') return;
        onWord(e.charIndex);
    };
    utt.onend = onEnd;
    window.speechSynthesis.speak(utt);
}
```

Each `.story-word` span gets a `data-char-start` attribute. On `onboundary`, clear `.speaking` class from all words and add it to the word whose `data-char-start` ≤ `e.charIndex` < `data-char-start + word.length`.

### Auto-Advance Mode
- "🔊 Read to me" button added to the story card header
- Toggle state: `isAutoRead` boolean per story session
- When ON: after `utt.onend`, wait 800ms then call `currentSentence++; renderSentence()`
- When OFF: story behaves as before (per-sentence auto-read only)
- Auto-read pauses at last sentence; shows ✓ done state
- `isAutoRead` preserved across sentence changes within a story
- Cancelled by: back button, manual next/prev tap (resets to non-auto after manual nav), or "Done"

### Updated Sentence HTML
Each word rendered as a `<span>` (non-highlight) or `<button>` (highlight) with `data-char-start`:
```html
<span class="story-word" data-char-start="0">Look</span>
<button class="story-word highlight" data-char-start="5" data-word="at">at</button>
```

### `.speaking` CSS
```css
.story-word.speaking {
    background: #FFF176;          /* yellow highlight */
    border-radius: 4px;
    padding: 0 2px;
    transition: background 0.1s;
}
.story-word.highlight.speaking {
    background: #B39DDB;          /* darker purple when a highlight word is speaking */
}
```

### 4 New Stories (added to `src/sight/data.js`)
Total becomes 12 stories. New entries use existing sight words:

```js
{ title: '🌊', sentences: [
    { text: 'I can see the big blue sea.', highlights: ['I', 'can', 'see', 'the', 'big', 'blue'] },
    { text: 'We go to play in it!', highlights: ['We', 'go', 'to', 'play', 'in'] },
    { text: 'I like the sea!', highlights: ['I', 'like', 'the'] },
]},
{ title: '🍎', sentences: [
    { text: 'Look at this red apple.', highlights: ['Look', 'at', 'this', 'red'] },
    { text: 'It is for you and me!', highlights: ['It', 'is', 'for', 'you', 'and', 'me'] },
    { text: 'We like to eat it!', highlights: ['We', 'like', 'to'] },
]},
{ title: '🚂', sentences: [
    { text: 'I can see the big train.', highlights: ['I', 'can', 'see', 'the', 'big'] },
    { text: 'It can go very fast!', highlights: ['It', 'can', 'go'] },
    { text: 'We like to run with it.', highlights: ['We', 'like', 'to', 'run', 'with'] },
]},
{ title: '⭐', sentences: [
    { text: 'Look up at one little star.', highlights: ['Look', 'up', 'one', 'little'] },
    { text: 'I said it is so pretty!', highlights: ['I', 'said', 'it', 'is'] },
    { text: 'We like to look at the sky.', highlights: ['We', 'like', 'to', 'look', 'at', 'the'] },
]},
```

### Changes
- `src/sight/data.js` — +4 stories (~50 lines)
- `src/sight/stories.js` — +50 lines (autoRead toggle, speakWithHighlight, data-char-start attrs, .speaking CSS)

### Estimated Scope
- `src/sight/data.js` — +~50 lines
- `src/sight/stories.js` — +~50 lines
- **Total: ~100 lines**

---

## Implementation Plan: Parent Share Report (Sprint 3, Item 2)

> **Why this matters**: Parents are the primary retention driver for children's apps — they decide whether the app stays installed. A one-tap share button lets parents send a progress summary to a co-parent, grandparent, or teacher. Evidence from Duolingo and Khan Kids shows parent share features drive +30% day-7 retention.

### Overview
A "📤 Share Progress" button in the parent dashboard. Tapping it:
1. Builds a formatted plain-text summary of the child's progress
2. Calls `navigator.share({ text })` (Web Share API, supported on iOS/Android)
3. **Fallback**: if `navigator.share` is unavailable (desktop), copies to clipboard and shows a "Copied!" toast

### Share Text Format
```
📊 [Name]'s Learning Report — English Adventure 🦁

⭐ Total Stars: 42
🔤 Letters explored: 18/26
✏️ Letters traced: 12/26
📖 CVC words built: 23
👁️ Sight words learned: 15
🔥 Day streak: 5

📚 Stories read: 6/12
🏆 Badges earned: 14/44

Keep up the great work! 🌟
```

### Implementation
Add to `renderDashboardContent()` in `src/screens/parents.js`:
1. A share button below the summary strip
2. A `handleShare(me, p, totalStars, streak)` function that builds text + triggers share/copy

```js
function buildShareText(name, p, totalStars, streak) {
    const lines = [
        `📊 ${name}'s Learning Report — English Adventure 🦁`,
        '',
        `⭐ Total Stars: ${totalStars}`,
        `🔤 Letters explored: ${p.alphabet?.exploredLetters?.length || 0}/26`,
        `✏️ Letters traced: ${p.alphabet?.tracedLetters?.length || 0}/26`,
        `📖 CVC words built: ${p.cvc?.builtWords?.length || 0}`,
        `👁️ Sight words learned: ${p.sight?.learnedWords?.length || 0}`,
        `🔥 Day streak: ${streak}`,
        '',
        `📚 Stories read: ${p.sight?.storiesRead?.length || 0}/12`,
        `🏆 Badges earned: ${(p.global?.earnedBadges || []).length}/44`,
        '',
        'Keep up the great work! 🌟',
    ];
    return lines.join('\n');
}

async function handleShare(name, p, totalStars, streak) {
    const text = buildShareText(name, p, totalStars, streak);
    if (navigator.share) {
        await navigator.share({ text });
    } else {
        await navigator.clipboard.writeText(text);
        showShareToast('Copied to clipboard!');
    }
}
```

### Share Button Placement
Below the summary strip, before the module completion bars:
```html
<div class="dash-share-row">
    <button class="dash-share-btn" id="dash-share">
        📤 Share Progress
    </button>
</div>
```

### Toast (copy fallback)
```js
function showShareToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'dash-share-toast';
    toast.textContent = msg;
    document.querySelector('.dashboard-container').appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}
```

### Estimated Scope
- `src/screens/parents.js` — +~40 lines (share button HTML, buildShareText, handleShare, toast, CSS)
- **Total: ~40 lines**

---

## Sprint 3 Implementation Order
1. Story time auto-read — touches stories.js + data.js; self-contained
2. Parent share report — touches only parents.js; independent

