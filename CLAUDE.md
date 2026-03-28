# English Adventure — Children's Alphabet Learning App

## What This Is
Voice-guided alphabet and literacy learning app for ages 4-6. Built with Vanilla JS + Vite + Capacitor (iOS/Android). Uses pre-generated Kokoro TTS audio files. Has RevenueCat subscription integration (free 30-day trial → Pro).

## Tech Stack
- Vanilla JavaScript (ES Modules), Vite 7.3.1
- Capacitor 8.1.0 for iOS/Android native builds
- RevenueCat (purchases-capacitor) for subscriptions
- Kokoro TTS (kokoro-js) for audio generation
- Pre-generated WAV files in `public/audio/`

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
**All 6 modules fully implemented. BUT: build is currently FAILING.**

### Critical Build Error (must fix before deploying)
**File:** `src/cvc/data.js` — missing export `getAllFamilies`
**Symptom:** `src/cvc/explore.js` line 6 imports `{ getAllFamilies, getWordsForFamily }` from `./data.js` but `getAllFamilies` is not exported.
**Fix needed:** Add `getAllFamilies()` function to `src/cvc/data.js` that returns all word family objects (similar to how `WORD_FAMILIES` array is structured).

### Other Known Issues
- **RevenueCat API keys are placeholders** — `src/services/subscription.js` line 3 has `'appl_YOUR_IOS_API_KEY'` and `'goog_YOUR_ANDROID_API_KEY'` — must be replaced before App Store/Play Store submission
- **TTS fallback disabled** — `src/shared/audio.js` `speakTTS()` intentionally returns early with a console.warn; pre-generated audio must exist for all strings
- **Audio generation script broken** — `scripts/generate-audio.mjs` has `TypeError: EdgeTTS is not a constructor`; not required for runtime but needed to generate new audio files

## Key Files
- `src/main.js` — router/entry point (202 lines, 25+ screens)
- `src/shared/audio.js` — audio engine (550 lines)
- `src/shared/storage.js` — localStorage progress tracking, multi-profile
- `src/shared/journey.js` — adaptive daily learning path
- `src/cvc/data.js` — **HAS EXPORT MISMATCH** (see above)
- `src/services/subscription.js` — RevenueCat integration (needs real keys)
- `public/audio/` — pre-generated WAV files (letters/, phonics/, words/, intro/, feedback/, facts/, ui/, extras/)

## Dev Commands
```sh
npm run dev      # Vite dev server
npm run build    # currently FAILS due to missing getAllFamilies export
```

## Not a Git Repository
No git history. No version control set up.

## Priority Next Steps
1. **Fix build:** Add `getAllFamilies()` export to `src/cvc/data.js`
2. **Replace RevenueCat keys** when ready for store submission
3. **Fix audio generation script** if new audio files need to be generated
