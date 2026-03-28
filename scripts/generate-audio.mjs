/**
 * generate-audio.mjs
 * Pre-generates all speech audio for English Adventure using Kokoro TTS.
 * Kokoro is FREE, open-source (Apache 2.0), runs entirely locally — no API key needed.
 *
 * Usage:
 *   node scripts/generate-audio.mjs
 *   node scripts/generate-audio.mjs --only=letters   # only regenerate one folder
 *   node scripts/generate-audio.mjs --force           # overwrite existing files
 *   node scripts/generate-audio.mjs --dry-run         # preview without generating
 *
 * Voice used: af_sky — energetic, bouncy American female child.
 * Output format: WAV (24 kHz mono). Browser/iOS/Android all natively support WAV.
 *
 * All files are saved to public/audio/**
 * Already-existing files are skipped (run is safe to re-run at any time).
 */

import { KokoroTTS } from 'kokoro-js';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, '..', 'public', 'audio');
const EXT       = '.wav';

// ---------------------------------------------------------------------------
// Voices & Pacing
//   af_jessica — energetic, engaging (default for most upbeat clips)
//   af_sarah   — clear and distinct (used for phonics & teaching lessons)
//   SPEED      — 0.98 ensures it sounds energetic and natural, not robotic/lethargic
// ---------------------------------------------------------------------------

const VOICE_WARM   = 'af_jessica';  // encouragement, instructions, engaging content
const VOICE_GENTLE = 'af_sarah';    // phonetics, teaching lessons, gentle corrections
const SPEED        = 0.98;

// ---------------------------------------------------------------------------
// Data — mirrors data.js so the script is self-contained
// ---------------------------------------------------------------------------

function slug(text) {
    return text.toLowerCase()
        .replace(/['']/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const LETTER_DATA = {
    A: { word: 'Apple',     phonetic: 'aaah',    extras: ['Ant', 'Airplane'],   funFact: 'A is the very first letter of the alphabet!' },
    B: { word: 'Bear',      phonetic: 'buh',     extras: ['Ball', 'Banana'],    funFact: 'Bears love to eat honey and berries!' },
    C: { word: 'Cat',       phonetic: 'kuh',     extras: ['Car', 'Cookie'],     funFact: 'Cats can purr when they are happy!' },
    D: { word: 'Dog',       phonetic: 'duh',     extras: ['Duck', 'Drum'],      funFact: 'Dogs wag their tail when they are happy!' },
    E: { word: 'Elephant',  phonetic: 'ehh',     extras: ['Egg', 'Earth'],      funFact: 'Elephants are the biggest animals that walk on land!' },
    F: { word: 'Fish',      phonetic: 'fffff',   extras: ['Flower', 'Frog'],    funFact: 'Fish can breathe under water!' },
    G: { word: 'Giraffe',   phonetic: 'guh',     extras: ['Grapes', 'Guitar'],  funFact: 'Giraffes have the longest necks of any animal!' },
    H: { word: 'Horse',     phonetic: 'hhh',     extras: ['House', 'Heart'],    funFact: 'Horses can sleep standing up!' },
    I: { word: 'Ice Cream', phonetic: 'ihh',     extras: ['Island', 'Igloo'],   funFact: 'Chocolate is the most popular ice cream flavor!' },
    J: { word: 'Jellyfish', phonetic: 'juh',     extras: ['Juice', 'Jump'],     funFact: 'Jellyfish have no brain and no heart!' },
    K: { word: 'Koala',     phonetic: 'kuh',     extras: ['Kite', 'King'],      funFact: 'Koalas sleep up to twenty hours a day!' },
    L: { word: 'Lion',      phonetic: 'luh',     extras: ['Ladybug', 'Lemon'],  funFact: 'Lions are called the king of the jungle!' },
    M: { word: 'Moon',      phonetic: 'mmm',     extras: ['Monkey', 'Music'],   funFact: 'We can see the Moon shining bright at night!' },
    N: { word: 'Nest',      phonetic: 'nnn',     extras: ['Nose', 'Night'],     funFact: 'Birds build nests to keep their babies safe!' },
    O: { word: 'Owl',       phonetic: 'ohh',     extras: ['Orange', 'Octopus'], funFact: 'Owls can turn their heads almost all the way around!' },
    P: { word: 'Penguin',   phonetic: 'puh',     extras: ['Pizza', 'Panda'],    funFact: 'Penguins cannot fly, but they are great swimmers!' },
    Q: { word: 'Queen',     phonetic: 'kwuh',    extras: ['Quilt', 'Question'], funFact: 'Q almost always has the letter U right next to it!' },
    R: { word: 'Rainbow',   phonetic: 'rrr',     extras: ['Rabbit', 'Rocket'],  funFact: 'Rainbows have seven beautiful colors!' },
    S: { word: 'Star',      phonetic: 'sssss',   extras: ['Sun', 'Snail'],      funFact: 'Our Sun is actually a very big star!' },
    T: { word: 'Turtle',    phonetic: 'tuh',     extras: ['Tree', 'Train'],     funFact: 'Some turtles can live for over a hundred years!' },
    U: { word: 'Umbrella',  phonetic: 'uhh',     extras: ['Unicorn', 'Up'],     funFact: 'Umbrellas keep us dry when it rains!' },
    V: { word: 'Violin',    phonetic: 'vvvv',    extras: ['Volcano', 'Van'],    funFact: 'A violin makes music when you use a bow!' },
    W: { word: 'Whale',     phonetic: 'wuh',     extras: ['Water', 'Worm'],     funFact: 'Blue whales are the biggest animals in the whole world!' },
    X: { word: 'Xylophone', phonetic: 'ks',      extras: ['X-ray', 'Fox'],      funFact: 'You hit a xylophone with little sticks to make music!' },
    Y: { word: 'Yarn',      phonetic: 'yuh',     extras: ['Yacht', 'Yak'],      funFact: 'You can knit a cozy sweater with yarn!' },
    Z: { word: 'Zebra',     phonetic: 'zzzzz',   extras: ['Zoo', 'Zigzag'],     funFact: 'Every zebra has its own unique pattern of stripes!' },
};

const CVC_WORDS = [
    'cat','hat','bat','mat','rat',
    'can','fan','man','pan','van',
    'big','dig','fig','pig','wig',
    'dog','fog','hog','jog','log',
    'bug','hug','jug','mug','rug',
    'hen','pen','ten','den','men',
    'cap','map','nap','tap','zap',
    'bit','hit','kit','sit','pit',
    'hop','mop','pop','top','cop',
    'bun','fun','run','sun',
];

const FEEDBACK = {
    awesome:        { text: 'Awesome! You did it!',                         voice: VOICE_WARM },
    way_to_go:      { text: 'Way to go! I knew you could!',                 voice: VOICE_WARM },
    great_job:      { text: 'Great job! You are so smart!',                 voice: VOICE_WARM },
    you_did_it:     { text: 'You did it! I am so proud of you!',            voice: VOICE_WARM },
    nice_work:      { text: 'Nice work! Keep it up!',                       voice: VOICE_WARM },
    wonderful:      { text: 'Wonderful! That was amazing!',                 voice: VOICE_WARM },
    wow_amazing:    { text: 'Wow! That is amazing! You are a superstar!',   voice: VOICE_WARM },
    so_great:       { text: 'So great! You should be proud!',               voice: VOICE_WARM },
    high_five:      { text: 'High five! You are incredible!',               voice: VOICE_WARM },
    good_job:       { text: 'Good job! You are doing really well!',         voice: VOICE_WARM },
    keep_playing:   { text: 'Keep playing! You are getting better every time!', voice: VOICE_WARM },
    not_quite:      { text: 'Not quite! Give it another try!',              voice: VOICE_GENTLE },
    lets_try_again: { text: "That's okay! Let's try again!",                voice: VOICE_GENTLE },
    oops_try_again: { text: "Oops! Don't worry, let's try again!",          voice: VOICE_GENTLE },
};

const UI_INSTRUCTIONS = {
    welcome:           { text: "Hi there! Let's learn together! This is going to be so fun!", voice: VOICE_WARM },
    explore_entry:     { text: 'Ooh, look at all the letters! Can you tap one to learn about it?', voice: VOICE_WARM },
    trace_entry:       { text: "Let's practice writing! Just use your finger and trace along!", voice: VOICE_WARM },
    trace_prompt:      { text: 'Use your finger to trace the letter. You can do it!', voice: VOICE_GENTLE },
    trace_small:       { text: 'Now the small letter!', voice: VOICE_WARM },
    quiz_entry:        { text: "Ooh, a quiz! Let's play and see what you know!", voice: VOICE_WARM },
    quiz_recognize:    { text: 'Can you find the letter? Take a good look!', voice: VOICE_WARM },
    quiz_sound:        { text: 'Listen carefully! Which letter makes that sound?', voice: VOICE_WARM },
    quiz_retry:        { text: "Want to play again? Let's go!", voice: VOICE_WARM },
    cvc_explore_entry: { text: 'Look at all these word families! Tap one to explore!', voice: VOICE_WARM },
    build_entry:       { text: "Let's build a word! This is going to be fun!", voice: VOICE_WARM },
    build_prompt:      { text: 'Can you tap the letters to spell it? Give it a try!', voice: VOICE_GENTLE },
    cvc_quiz_prompt:   { text: 'Which picture matches the word? Look carefully!', voice: VOICE_WARM },
    flashcard_entry:   { text: 'Tap the card to hear the word! Ready?', voice: VOICE_WARM },
    match_entry:       { text: 'Listen to the word and find it! You can do it!', voice: VOICE_WARM },
    match_prompt:      { text: 'Which word did you hear? Take your time!', voice: VOICE_GENTLE },
    stories_entry:     { text: "Let's read a story together! I love stories!", voice: VOICE_WARM },
    spell_entry:       { text: "Can you spell the word? Let's try!", voice: VOICE_WARM },
    spell_prompt:      { text: 'Tap the letters to spell it out!', voice: VOICE_GENTLE },
    picmatch_entry:    { text: 'Match the pictures! Which ones go together?', voice: VOICE_WARM },
    blend_entry:       { text: "Let's blend the sounds together and make a word!", voice: VOICE_WARM },
    daily_entry:       { text: "Here is your word for today! Let's learn it!", voice: VOICE_WARM },
    phonics_entry:     { text: "Let's listen to sounds! Ready? Here we go!", voice: VOICE_WARM },
    phonics_end:       { text: 'What sound does it end with? Listen very carefully!', voice: VOICE_GENTLE },
    rhyme_entry:       { text: 'Time to rhyme! This one is so much fun!', voice: VOICE_WARM },
    find_odd_one:      { text: "Which one doesn't rhyme? Listen to each one!", voice: VOICE_GENTLE },
    did_you_know:      { text: 'Ooh, did you know? Here is a fun fact!', voice: VOICE_WARM },
};

// ---------------------------------------------------------------------------
// Build manifest: [ { text, dir, filename, voice }, ... ]
// ---------------------------------------------------------------------------

const manifest = [];

// Letters
for (const L of ALPHABET) {
    manifest.push({ text: L, dir: 'letters', filename: `${L.toLowerCase()}${EXT}`, voice: VOICE_WARM });
}

// Phonics (very steady gentle voice so the sound is clear)
for (const [L, data] of Object.entries(LETTER_DATA)) {
    manifest.push({ text: data.phonetic, dir: 'phonics', filename: `${L.toLowerCase()}${EXT}`, voice: VOICE_GENTLE });
}

// Primary words
for (const [, data] of Object.entries(LETTER_DATA)) {
    manifest.push({ text: data.word, dir: 'words', filename: `${slug(data.word)}${EXT}`, voice: VOICE_WARM });
}

// Extra words
for (const [, data] of Object.entries(LETTER_DATA)) {
    for (const extra of data.extras) {
        manifest.push({ text: extra, dir: 'extras', filename: `${slug(extra)}${EXT}`, voice: VOICE_WARM });
    }
}

// Fun facts
for (const [L, data] of Object.entries(LETTER_DATA)) {
    manifest.push({ text: data.funFact, dir: 'facts', filename: `fact_${L.toLowerCase()}${EXT}`, voice: VOICE_WARM });
}

// Letter intro phrases (composed at runtime, parts pre-generated)
for (const [L, data] of Object.entries(LETTER_DATA)) {
    const l = L.toLowerCase();
    manifest.push({ text: `This is the letter ${L}!`, dir: 'intro', filename: `this_is_${l}${EXT}`, voice: VOICE_WARM });
    manifest.push({ text: `${L} is for ${data.word}!`, dir: 'intro', filename: `${l}_is_for_${slug(data.word)}${EXT}`, voice: VOICE_WARM });
    for (const extra of data.extras) {
        manifest.push({ text: `${L} is also for ${extra}!`, dir: 'intro', filename: `${l}_also_${slug(extra)}${EXT}`, voice: VOICE_WARM });
    }
}

// CVC words (deduplicated)
const seenWords = new Set();
for (const word of CVC_WORDS) {
    if (!seenWords.has(word)) {
        seenWords.add(word);
        manifest.push({ text: word, dir: 'words', filename: `${word}${EXT}`, voice: VOICE_WARM });
    }
}

// Feedback phrases
for (const [key, item] of Object.entries(FEEDBACK)) {
    manifest.push({ text: item.text, dir: 'feedback', filename: `${key}${EXT}`, voice: item.voice });
}

// UI instructions
for (const [key, item] of Object.entries(UI_INSTRUCTIONS)) {
    manifest.push({ text: item.text, dir: 'ui', filename: `${key}${EXT}`, voice: item.voice });
}

// Deduplicate by output path
const seen = new Set();
const unique = manifest.filter(item => {
    const key = `${item.dir}/${item.filename}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
});

// ---------------------------------------------------------------------------
// CLI flags
//   --force       regenerate all files, even ones that already exist
//   --only=dir    only process one folder (letters, phonics, words, etc.)
//   --dry-run     list what would be generated without calling the model
// ---------------------------------------------------------------------------

const args    = process.argv.slice(2);
const FORCE   = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const ONLY    = (args.find(a => a.startsWith('--only=')) || '').replace('--only=', '') || null;

const toGenerate = unique.filter(item => {
    if (ONLY && item.dir !== ONLY) return false;
    if (!FORCE && existsSync(path.join(OUT_DIR, item.dir, item.filename))) return false;
    return true;
});

console.log('\n🎙  English Adventure — Parler-TTS audio generation');
console.log('   Provider: HuggingFace Space (@gradio/client)');
console.log(`   Voice:    Enthusiastic Child Profile`);
console.log(`   Total:  ${unique.length} clips  |  To generate: ${toGenerate.length}  |  Skip: ${unique.length - toGenerate.length}`);
if (FORCE)   console.log('   ⚡ --force: regenerating all files');
if (ONLY)    console.log(`   🎯 --only=${ONLY}: filtering to this folder only`);
if (DRY_RUN) console.log('   👁  --dry-run: no generation will happen\n');
else         console.log('');

if (DRY_RUN) {
    for (const item of toGenerate) {
        console.log(`  📝  ${item.dir}/${item.filename}  [${item.voice}]  "${item.text}"`);
    }
    console.log(`\n   Total to generate: ${toGenerate.length}\n`);
    process.exit(0);
}

if (toGenerate.length === 0) {
    console.log('   ✅  All clips already exist. Use --force to regenerate.\n');
    process.exit(0);
}

// ---------------------------------------------------------------------------
// Load Kokoro model (downloads once, then cached in ~/.cache/huggingface/)
// ---------------------------------------------------------------------------

console.log('⏳  Loading Kokoro model (first run downloads ~300 MB to local cache)...\n');
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-onnx', {
    dtype: 'q8',  // quantized 8-bit: excellent quality, ~85 MB model in memory
});
console.log('✅  Model ready!\n');

// ---------------------------------------------------------------------------
// Generate Loop
// ---------------------------------------------------------------------------

let generated = 0;
let failed    = 0;
const startTime = Date.now();

for (let i = 0; i < toGenerate.length; i++) {
    const item = toGenerate[i];
    const outDir  = path.join(OUT_DIR, item.dir);
    const outPath = path.join(outDir, item.filename);

    mkdirSync(outDir, { recursive: true });

    try {
        const audio = await tts.generate(item.text, { voice: item.voice, speed: SPEED });
        audio.save(outPath);
        process.stdout.write(`  ✅  ${item.dir}/${item.filename}  "${item.text}"\n`);
        generated++;
    } catch (err) {
        console.error(`\n❌  FAILED: ${item.dir}/${item.filename}`);
        console.error(`   ${err.message}\n`);
        failed++;
    }

    // Progress
    if ((i + 1) % 10 === 0 || i === toGenerate.length - 1) {
        const elapsed   = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate      = generated / Math.max(1, elapsed);
        const remaining = Math.round((toGenerate.length - i - 1) / Math.max(0.01, rate));
        const pct       = Math.round(((i + 1) / toGenerate.length) * 100);
        console.log(`\n  📊  ${pct}%  (${i + 1}/${toGenerate.length}) — ~${remaining}s remaining\n`);
    }
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n🎉  Done in ${totalTime}s`);
console.log(`   Generated: ${generated}   Failed: ${failed}   Folder: public/audio/`);
console.log('   Tip: --force to regenerate everything, --only=phonics to regenerate one folder.\n');
