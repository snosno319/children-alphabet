# English Adventure — Children's Alphabet Learning App

A voice-guided literacy learning app for ages 4–6. Children tap, trace, and listen — no reading required. Built with Vanilla JS + Vite, packaged for iOS/Android via Capacitor.

## Features

- **ABCs** — interactive letter grid: tap to hear names, sounds, examples, and fun facts
- **CVC Words** — word families, blending, and quizzes
- **Sight Words** — flashcards, matching games, and short stories
- **Word Builder** — spelling, picture matching, blending lab, and a daily challenge
- **Phonics Lab** — sound matching, sorting, and end-sound identification
- **Rhyme Time** — rhyme matching, sorting, and odd-one-out games
- **Journey Mode** — adaptive daily learning path that targets weak spots
- **Multi-profile** — separate progress for siblings
- **Audio-first UX** — all instructions spoken aloud; no text required for child interaction
- **Offline capable** — works fully offline after initial load
- **Subscription** — 30-day free trial, then Pro via RevenueCat

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

## Installation & Running

```bash
git clone <your-repository-url>
cd children-alphabet
npm install
npm run dev        # dev server at http://localhost:5173
```

To access from an iPad on the same network:

```bash
npm run dev -- --host
```

## Building

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

## Testing

```bash
npm test                # run all tests (226)
npm run test:watch      # watch mode
npm run test:coverage   # coverage report
```

Tests use **Vitest** + **jsdom** and cover all data modules, shared utilities, and the subscription service.

## Project Structure

```
src/
  main.js              # router — navigate(screen, props)
  shared/
    audio.js           # audio engine (file playback + TTS fallback)
    storage.js         # localStorage progress, multi-profile
    journey.js         # adaptive daily path
  alphabet/            # ABCs sub-app
  cvc/                 # CVC Words sub-app
  sight/               # Sight Words sub-app
  word-builder/        # Word Builder sub-app
  phonics/             # Phonics Lab sub-app
  rhyme/               # Rhyme Time sub-app
  hub/                 # main menu
  screens/             # profile picker, parent dashboard
  services/            # RevenueCat subscription
  components/          # Paywall
public/
  audio/               # pre-generated WAV files (TTS)
    letters/  phonics/  words/  intro/  feedback/  facts/  ui/  extras/
scripts/
  generate-audio.mjs   # regenerate WAV files with Kokoro TTS
```

## Audio Generation (Kokoro TTS)

All voice lines are pre-generated WAV files using the open-source [Kokoro-82M](https://github.com/hexgrad/kokoro) TTS model — no API keys required.

To regenerate or add new audio files:

```bash
npm run generate-audio
npm run generate-audio -- --force       # overwrite existing files
npm run generate-audio -- --only=words  # only regenerate one category
npm run generate-audio -- --dry-run     # preview without writing
```

> **Note:** `scripts/generate-audio.mjs` currently has a broken `EdgeTTS` import — fix needed before running.

## Before App Store Submission

1. Replace RevenueCat API key placeholders in `src/services/subscription.js`
2. Fix or remove the `APP BOOT:` console.log calls in `src/main.js`
3. Ensure all audio files are generated for any new strings

## License

MIT
