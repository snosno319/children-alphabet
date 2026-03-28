# ABC Adventure - Children's Alphabet Learning App

A fun, interactive, and voice-guided alphabet learning app designed specifically for pre-readers (ages 4-6). Built with vanilla JavaScript and Vite for optimal performance on touch devices like iPads.

## Features

- **Explore Mode**: Interactive letter grid where children can tap to hear letter names, sounds, examples, and fun facts.
- **Trace Mode**: Guided uppercase and lowercase letter tracing with stroke validation and celebrations.
- **Quiz Mode**: Voice-guided game to identify letters and sounds, with stars and positive reinforcement.
- **Audio-First UX**: All instructions are spoken aloud with warm, natural, and encouraging voice feedback.
- **Offline Capable**: Works fully offline after initial load.
- **iPad Optimized**: Large touch targets and landscape/portrait support.

## Prerequisites

To run this project, you will need:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Git](https://git-scm.com/)

## Installation & Running

Follow these steps to run the app on any computer:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd children-alphabet
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start a local server (usually at `http://localhost:5173`). Open this URL in your browser.

4.  **Network Access (for iPad testing):**
    To access the app from another device on the same Wi-Fi network:
    ```bash
    npm run dev -- --host
    ```
    Look for the "Network" URL in the terminal output (e.g., `http://192.168.1.5:5173`).

## Building for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` folder, ready to be deployed to static hosting services like Vercel, Netlify, or GitHub Pages.

## Project Structure

- `src/main.js`: Entry point and router.
- `src/shared/audio.js`: Centralized audio engine for playing bundled `.wav` files and sound effects.
- `src/alphabet/explore.js`: Core interactive screen logic.
- `scripts/generate-audio.mjs`: Script to generate all `.wav` files using the Kokoro-82M TTS model locally.

## Audio Generation Engine (Kokoro TTS)

This app uses pre-generated `.wav` files for all voice instructions, instead of relying on robotic-sounding device-specific Text-to-Speech (TTS). 

The voice generation uses the open-source **[Kokoro-82M TTS limit](https://github.com/hexgrad/kokoro)** model, driven by the `kokoro-js` library. This allows us to generate thousands of audio clips locally entirely for free, with no API-keys required.

**To re-generate or add new audio files:**
1. Ensure `kokoro-js` is installed (`npm install`).
2. Update the text data inside `scripts/generate-audio.mjs`.
3. Run the generation script:
   ```bash
   npm run generate-audio
   ```
   *Note: The script outputs female, warm, child-friendly audio. The first run will download an ~85MB quantified model file to your local HuggingFace cache.*

_Useful flags for the audio script:_
- `npm run generate-audio -- --force` (overwrite existing files)
- `npm run generate-audio -- --only=phonics` (only generate a specific directory)
- `npm run generate-audio -- --dry-run` (preview changes)

## License

MIT
