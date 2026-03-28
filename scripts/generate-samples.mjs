import { KokoroTTS } from 'kokoro-js';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, '..', 'public', 'samples');

mkdirSync(OUT_DIR, { recursive: true });

// A list of the most popular American Female profiles available in Kokoro
const VOICES = [
    'af_bella',    // Warm, softer tone
    'af_sarah',    // clear and distinct
    'af_nicole',   // slightly higher, youthful
    'af_jessica',  // energetic
    'af_sky',      // The current bouncy default
    'af_kore',     // bright
];

const testPhrase = "Hello there! I am excited to help you learn the alphabet. Let's trace the letter A together!";

console.log('Loading Kokoro model...');
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-onnx', { dtype: 'q8' });

console.log('\\nGenerating voice samples with 0.98 pacing...\\n');

for (const voice of VOICES) {
    try {
        const audio = await tts.generate(testPhrase, { voice, speed: 0.98 });
        const filePath = path.join(OUT_DIR, `sample_${voice}.wav`);
        audio.save(filePath);
        console.log(`✅ Generated: public/samples/sample_${voice}.wav`);
    } catch (e) {
        console.log(`❌ Failed to generate ${voice}`);
    }
}

console.log('\\nDone! You can play these files directly in VS Code.');
