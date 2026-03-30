# English Adventure — Children's Alphabet Learning App

## What This Is
Voice-guided alphabet and literacy learning app for ages 4-6. Built with Vanilla JS + Vite + Capacitor (iOS/Android). Uses pre-generated Kokoro TTS audio files (348 WAV files bundled in `public/audio/`).

## Tech Stack
- Vanilla JavaScript (ES Modules), Vite 7.3.1
- Capacitor 8.1.0 for iOS/Android native builds
- Kokoro TTS (kokoro-js) — used to pre-generate audio; 348 WAV files bundled in `public/audio/`
- Vitest 4.1.2 + jsdom 29.0.1 for testing (205 tests, all passing)

## App Structure — 6 Sub-Apps
1. **ABCs** (`src/alphabet/`) — letter exploration, tracing, quizzes
2. **Words** (`src/cvc/`) — CVC word families and blending
3. **Reading** (`src/sight/`) — sight word flashcards, matching, stories
4. **Spelling** (`src/word-builder/`) — spelling, picture matching, blending, daily challenges
5. **Phonics Lab** (`src/phonics/`) — sound matching and identification
6. **Rhyme Time** (`src/rhyme/`) — rhyming word games

## Other Features
- Multi-profile system (siblings with separate progress)
- Journey Mode — guided adaptive daily learning path (`src/shared/journey.js`)
- Parent Dashboard — math verification gate (`src/screens/parents.js`)
- Full offline support after initial load

## Current State
**Build: PASSING. All 6 modules fully implemented.**

### Known Issues (pre-launch)
- **TTS fallback disabled** — `src/shared/audio.js` `speakTTS()` intentionally returns early; the 348 bundled WAV files cover all strings. Only an issue if new strings are added.
- **Audio generation script broken** — `scripts/generate-audio.mjs` has `TypeError: EdgeTTS is not a constructor`; not needed at runtime, only needed if you add new audio strings.

## Architecture Notes

### Navigation
- All navigation goes through `navigate(screen, props)` in `src/main.js`
- Screen IDs are explicit (e.g. `'alphabet-home'`, `'phonics-home'`) — no redirect maps
- Each screen module exports `render*(app, navigate, props = {})` and `inject*Styles()`

### Audio
- `src/shared/audio.js` exports `playAudio(path, fallbackText)` for file-based playback and `slug(text)` to convert text to audio file paths
- Pre-generated files live in `public/audio/` (letters/, phonics/, words/, intro/, feedback/, facts/, ui/, extras/)
- `window.speechSynthesis?.cancel()` is used (optional chaining) throughout to avoid crashes on platforms without SpeechSynthesis

### Storage
- Single localStorage key per profile: `english-adventure-progress-{profileId}`
- `src/shared/storage.js` — all progress functions; `createDefaultProgress()` is the canonical schema
- Use `completeDailyChallenge()` (not `markDailyCompleted(dateStr)`) for the daily streak flow

### Journey Mode
- `window.isJourneyMode` global flag set by `src/shared/journey.js`
- `advanceJourney(navigate)` / `exitJourney(navigate)` — call these instead of navigating directly when in journey mode

## Key Files
- `src/main.js` — router/entry point (~100 lines, 26 screens)
- `src/shared/audio.js` — audio engine (~550 lines)
- `src/shared/storage.js` — localStorage progress tracking, multi-profile
- `src/shared/journey.js` — adaptive daily learning path
- `public/audio/` — 348 pre-generated WAV files (letters/, phonics/, words/, intro/, feedback/, facts/, ui/, extras/)

## Dev Commands
```sh
npm run dev           # Vite dev server
npm run build         # production build (passes)
npm test              # run all tests (~205)
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

## Priority Next Steps
1. **Fix audio generation script** (`scripts/generate-audio.mjs`) if new audio strings need to be added
