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
Active development branch: `claude/analyze-test-coverage-GOePv`
`feature/parent-dashboard` is ahead of `main` and not yet merged — contains parent dashboard + varied feedback + trace color + UI/UX overhaul.

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
