# English Adventure — Children's Alphabet Learning App

## What This Is
Voice-guided alphabet and literacy learning app for ages 4-6. Built with Vanilla JS + Vite + Capacitor (iOS/Android). Uses pre-generated Kokoro TTS audio files. Has RevenueCat subscription integration (free 30-day trial → Pro).

## Tech Stack
- Vanilla JavaScript (ES Modules), Vite 7.3.1
- Capacitor 8.1.0 for iOS/Android native builds
- RevenueCat (purchases-capacitor) for subscriptions
- Kokoro TTS (kokoro-js) for audio generation
- Pre-generated WAV files in `public/audio/`
- Vitest 4.1.2 + jsdom 29.0.1 for testing (226 tests, all passing)

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
- Paywall component (`src/components/Paywall.js`)
- Full offline support after initial load

## Current State
**Build: PASSING. All 6 modules fully implemented.**

### Known Issues (pre-launch)
- **RevenueCat API keys are placeholders** — `src/services/subscription.js` line 3 has `'appl_YOUR_IOS_API_KEY'` and `'goog_YOUR_ANDROID_API_KEY'` — must be replaced before App Store/Play Store submission
- **TTS fallback disabled** — `src/shared/audio.js` `speakTTS()` intentionally returns early with a `console.warn`; pre-generated audio must exist for all strings
- **Audio generation script broken** — `scripts/generate-audio.mjs` has `TypeError: EdgeTTS is not a constructor`; not required for runtime but needed to generate new audio files

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
- `src/main.js` — router/entry point (~175 lines, 26 screens)
- `src/shared/audio.js` — audio engine (~550 lines)
- `src/shared/storage.js` — localStorage progress tracking, multi-profile
- `src/shared/journey.js` — adaptive daily learning path
- `src/services/subscription.js` — RevenueCat integration (needs real keys)
- `public/audio/` — pre-generated WAV files

## Dev Commands
```sh
npm run dev           # Vite dev server
npm run build         # production build (passes)
npm test              # run all 226 tests
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

## Priority Next Steps
1. **Replace RevenueCat keys** when ready for store submission (`src/services/subscription.js` line 3)
2. **Fix audio generation script** (`scripts/generate-audio.mjs`) if new audio files need to be generated
3. **Remove `APP BOOT:` console.logs** from `src/main.js` before release
