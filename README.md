# English Adventure — Children's Alphabet Learning App

A voice-guided literacy learning app for ages 4–6. Children tap, trace, and listen — no reading required. Built with Vanilla JS + Vite, packaged for iOS/Android via Capacitor.

## Features

- **ABCs** — interactive letter grid: tap to hear names, sounds, examples, and fun facts; tracing with 8-color palette; quizzes; ABC sing-along song; memory flip-card game; uppercase↔lowercase sort
- **Words** — CVC word families, blending, and quizzes
- **Reading** — sight word flashcards, matching games, and 12 short stories with word-by-word autoread highlighting
- **Spelling** — word spelling, picture matching, blending lab, and a daily challenge
- **Phonics Lab** — sound matching, sorting, and end-sound identification
- **Rhyme Time** — rhyme matching, sorting, and odd-one-out games
- **Numbers** — 1–10 exploration and quiz
- **Badge / Sticker Book** — 44 collectible badges (A–Z letters, activity, milestone); earn overlay with confetti; virtual sticker book screen
- **Leo the Lion** — named guide mascot; appears on hub, badge earn, journey complete
- **Journey Mode** — adaptive daily learning path that targets weak spots
- **Multi-profile** — separate progress for siblings
- **Audio-first UX** — all instructions spoken aloud; no text required for child interaction
- **Offline capable** — works fully offline after initial load

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
npm test                # run all tests (287)
npm run test:watch      # watch mode
npm run test:coverage   # coverage report
```

Tests use **Vitest** + **jsdom** and cover all data modules, shared utilities, storage, audio, badges, and journey logic.

## Project Structure

```
src/
  main.js              # router — navigate(screen, props); 37 registered screens
  shared/
    audio.js           # audio engine: WAV playback, Web Audio synth, speakInstruction()
    storage.js         # localStorage progress, multi-profile, badge storage
    journey.js         # adaptive daily path
    badges.js          # 44 badge definitions + checkAndAwardBadges()
    feedback.js        # visual feedback: floatStars, ripplePress, shakeEl, bounceEl
    confetti.js        # canvas-confetti wrappers: spawnConfetti, spawnBigCelebration
    mascot.js          # Leo the Lion: showLeo(), hideLeo()
  alphabet/            # ABCs sub-app (explore, trace, quiz, song, memory, case-match)
  cvc/                 # CVC Words sub-app (explore, build, quiz)
  sight/               # Sight Words sub-app (flashcards, match, stories)
  word-builder/        # Word Builder sub-app (spell, match, blend, daily)
  phonics/             # Phonics Lab sub-app (sound-match, sound-sort, end-sound)
  rhyme/               # Rhyme Time sub-app (rhyme-match, rhyme-sort, odd-one-out)
  numbers/             # Numbers sub-app (explore, quiz)
  hub/                 # main menu
  screens/             # profile picker, parent dashboard, badges sticker book
public/
  audio/               # 348 pre-generated WAV files (TTS)
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

> **Note:** `scripts/generate-audio.mjs` currently has a broken `EdgeTTS` import — fix needed before running. The 348 bundled WAV files cover all current strings, so this only matters when adding new audio content.

## Before App Store Submission

1. Ensure all audio files are generated for any new strings (`npm run generate-audio`)
2. Fix `scripts/generate-audio.mjs` if the EdgeTTS import is still broken

## License

MIT
