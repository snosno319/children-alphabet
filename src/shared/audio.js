/**
 * Unified Audio Engine — English Adventure
 * Uses pre-generated mp3 files from public/audio/ for all speech.
 * Falls back to browser SpeechSynthesis if a file is unavailable.
 *
 * File layout:
 *   audio/letters/a.wav        — letter names
 *   audio/phonics/a.wav        — phonetic sounds (by letter key, not phonetic text)
 *   audio/words/apple.wav      — words
 *   audio/extras/ant.wav       — extra example words
 *   audio/facts/fact_a.wav     — fun facts
 *   audio/intro/this_is_a.wav  — "This is the letter A!"
 *   audio/intro/a_is_for_apple.wav
 *   audio/intro/a_also_ant.wav
 *   audio/ui/welcome.wav       — UI instructions
 *   audio/feedback/awesome.wav — encouragement phrases
 */

/* ============================================
   Web Audio Context (for sound effects only)
   ============================================ */

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/* ============================================
   File-based playback
   ============================================ */

// Track the currently playing Audio element so we can stop it before
// playing a new one. Children tap fast — audio pile-up sounds terrible.
let _current = null;
const _cache  = {}; // preloaded Audio objects keyed by path

/**
 * Stop whatever is currently playing.
 */
export function cancelAudio() {
    if (_current) {
        _current.pause();
        _current.currentTime = 0;
        _current = null;
    }
}

/**
 * Preload a list of audio paths so they play instantly with zero latency.
 * Call once at app startup with the clips played most often.
 */
export function preloadAudio(paths) {
    for (const path of paths) {
        if (!_cache[path]) {
            const a = new Audio(path);
            a.preload = 'auto';
            _cache[path] = a;
        }
    }
}

/**
 * Play an mp3 file from public/audio/.
 * Cancels whatever is currently playing first.
 * Returns a Promise that resolves when playback ends (or on error/fallback).
 *
 * @param {string} path           — e.g. "audio/letters/a.wav"
 * @param {string} [fallbackText] — TTS text to speak if the file is missing
 */
export function playAudio(path, fallbackText = '') {
    return new Promise((resolve) => {
        // Stop whatever was playing
        cancelAudio();

        // Use preloaded element if available (clone it so it can be replayed)
        const audio = _cache[path]
            ? _cache[path].cloneNode()
            : new Audio(path);

        _current = audio;

        audio.onended = () => { if (_current === audio) _current = null; resolve(); };

        audio.onerror = async () => {
            if (_current === audio) _current = null;
            // File is missing — use TTS fallback so the app stays functional
            if (fallbackText) await speakTTS(fallbackText);
            resolve();
        };

        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(async () => {
                if (_current === audio) _current = null;
                if (fallbackText) await speakTTS(fallbackText);
                resolve();
            });
        }
    });
}

/* ============================================
   TTS fallback (Disabled to enforce pre-generated high-quality audio)
   ============================================ */

function speakTTS(text, options = {}) {
    console.warn('speakTTS fallback disabled. Pre-generate this string:', text);
    return Promise.resolve();
}

/* ============================================
   Path helpers
   ============================================ */

/** Normalise text into a safe filename stem. */
export function slug(text) {
    return text.toLowerCase()
        .replace(/['']/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

/* ============================================
   Alphabet-specific speech
   ============================================ */

/** Say a letter name — "A", "B", … */
export async function speakLetter(letter) {
    playTinkle();
    await delay(200);
    const l = letter.toLowerCase();
    return playAudio(`audio/letters/${l}.wav`, letter);
}

/** Say the phonetic sound (using letter key, not the phonetic text). */
export function speakPhonetic(letterKey) {
    const l = letterKey.toLowerCase();
    return playAudio(`audio/phonics/${l}.wav`, letterKey);
}

/**
 * Full letter introduction.
 * "This is the letter A! … aah … A is for Apple!"
 */
export async function speakLetterFull(letter, _phonetic, word) {
    const l = letter.toLowerCase();
    const w = slug(word);

    playTinkle();
    await delay(300);

    await playAudio(`audio/intro/this_is_${l}.wav`, `This is the letter ${letter}!`);
    await delay(550);

    await playAudio(`audio/phonics/${l}.wav`, _phonetic);
    await delay(550);

    await playAudio(`audio/intro/${l}_is_for_${w}.wav`, `${letter} is for ${word}!`);
}

/** Speak a fun fact. */
export async function speakFunFact(funFact, letterKey) {
    await delay(500);
    await playAudio('audio/ui/did_you_know.wav', 'Did you know?');
    await delay(400);

    // If we have the letter key, play the pre-generated fact file
    if (letterKey) {
        const l = letterKey.toLowerCase();
        await playAudio(`audio/facts/fact_${l}.wav`, funFact);
    } else {
        await speakTTS(funFact);
    }
}

/** Speak extra examples — "A is also for Ant!" */
export async function speakExtras(letter, extras) {
    if (!extras || extras.length === 0) return;
    const l = letter.toLowerCase();
    await delay(500);
    for (const extra of extras) {
        const w = slug(extra.word);
        await playAudio(`audio/intro/${l}_also_${w}.wav`, `${letter} is also for ${extra.word}!`);
        await delay(500);
    }
}

/* ============================================
   Word speech (shared)
   ============================================ */

/** Say a word. */
export function speakWord(word) {
    const w = slug(word);
    return playAudio(`audio/words/${w}.wav`, word);
}

/** Say a single letter sound (same as speakPhonetic but by letter). */
export function speakLetterSound(letter) {
    const l = letter.toLowerCase();
    return playAudio(`audio/letters/${l}.wav`, letter);
}

/* ============================================
   CVC-specific speech
   ============================================ */

/** Blend a CVC word slowly: "c … a … t … cat!" */
export async function speakBlendCVC(word) {
    playTinkle();
    await delay(300);
    for (let i = 0; i < word.length; i++) {
        await playAudio(`audio/letters/${word[i]}.wav`, word[i]);
        await delay(500);
    }
    await delay(300);
    await playAudio(`audio/words/${word}.wav`, word + '!');
}

/* ============================================
   Sight Words-specific speech
   ============================================ */

/** Speak a word then its example sentence. */
export async function speakWordWithSentence(word, sentence) {
    playTinkle();
    await delay(300);
    const w = slug(word);
    await playAudio(`audio/words/${w}.wav`, word);
    await delay(500);
    // Sentences are dynamic — TTS fallback is intentional here
    await speakTTS(sentence, { rate: 0.62, pitch: 1.12 });
}

/** Speak a sentence in reading voice (dynamic — uses TTS). */
export function speakSentence(sentence) {
    return speakTTS(sentence, { rate: 0.62, pitch: 1.12 });
}

/* ============================================
   Word Builder-specific speech
   ============================================ */

/** Blend onset + rime: "c … at … cat!" */
export async function speakBlend(onset, rime) {
    playTinkle();
    await delay(300);
    // Onset is a single letter
    await playAudio(`audio/letters/${onset.toLowerCase()}.wav`, onset);
    await delay(400);
    // Rime — no pre-built file, use TTS
    await speakTTS(rime, { rate: 0.55, pitch: 1.15 });
    await delay(300);
    const word = onset + rime;
    await playAudio(`audio/words/${word}.wav`, word + '!');
}

/** Spell a word letter by letter: "c … a … t … cat!" */
export async function speakSpellOut(word) {
    playTinkle();
    await delay(300);
    for (const letter of word) {
        await playAudio(`audio/letters/${letter.toLowerCase()}.wav`, letter);
        await delay(400);
    }
    await delay(200);
    await playAudio(`audio/words/${word}.wav`, word + '!');
}

/* ============================================
   Generic speak (kept for compatibility)
   ============================================ */

/** Generic speak — used internally and by external callers. */
export function speak(text, options = {}) {
    return speakTTS(text, options);
}

/* ============================================
   Voice Instructions
   ============================================ */

/**
 * Maps every instruction key to:
 *   files: string[]  — audio files to try in random order (for variety)
 *   texts: string[]  — matching TTS fallback texts
 */
const INSTRUCTIONS = {
    // Hub
    welcome:           { files: ['audio/ui/welcome.wav'],           texts: ["Hello! Let's learn together!"] },

    // Alphabet
    explore_entry:     { files: ['audio/ui/explore_entry.wav'],     texts: ['Look at the letters! Tap one!'] },
    trace_entry:       { files: ['audio/ui/trace_entry.wav'],       texts: ["Let's write! Use your finger!"] },
    trace_done:        { files: ['audio/feedback/great_job.wav','audio/feedback/awesome.wav','audio/feedback/you_did_it.wav','audio/feedback/wonderful.wav','audio/feedback/way_to_go.wav'], texts: ['Great job!','Awesome!','You did it!','Wonderful!','Way to go!'] },
    trace_prompt:      { files: ['audio/ui/trace_prompt.wav'],      texts: ['Use your finger to draw!'] },
    quiz_entry:        { files: ['audio/ui/quiz_entry.wav'],        texts: ["Let's play a game!"] },
    quiz_recognize:    { files: ['audio/ui/quiz_recognize.wav'],    texts: ['Can you find the letter?'] },
    quiz_sound:        { files: ['audio/ui/quiz_sound.wav'],        texts: ['Listen! Which letter is it?'] },
    quiz_correct:      { files: ['audio/feedback/awesome.wav','audio/feedback/way_to_go.wav','audio/feedback/great_job.wav','audio/feedback/you_did_it.wav','audio/feedback/nice_work.wav'], texts: ['Awesome!','Way to go!','Great job!','You did it!','Nice work!'] },
    quiz_wrong:        { files: ['audio/feedback/not_quite.wav','audio/feedback/lets_try_again.wav','audio/feedback/oops_try_again.wav'], texts: ['Not quite!',"Let's try again!",'Oops! Try again!'] },
    quiz_results_great:{ files: ['audio/feedback/wow_amazing.wav','audio/feedback/you_did_it.wav','audio/feedback/so_great.wav','audio/feedback/high_five.wav'], texts: ['Wow! Amazing!','You did it!','So great!','High five!'] },
    quiz_results_good: { files: ['audio/feedback/good_job.wav','audio/feedback/keep_playing.wav','audio/feedback/nice_work.wav'], texts: ['Good job!','Keep playing!','Nice work!'] },
    quiz_retry:        { files: ['audio/ui/quiz_retry.wav'],        texts: ['Play again?'] },

    // CVC Words
    cvc_explore_entry: { files: ['audio/ui/cvc_explore_entry.wav'], texts: ['Look at the word families! Tap one!'] },
    build_entry:       { files: ['audio/ui/build_entry.wav'],       texts: ["Let's build a word!"] },
    build_prompt:      { files: ['audio/ui/build_prompt.wav'],      texts: ['Tap the letters to spell it!'] },
    build_correct:     { files: ['audio/feedback/you_did_it.wav','audio/feedback/awesome.wav','audio/feedback/great_job.wav','audio/feedback/wonderful.wav','audio/feedback/way_to_go.wav'], texts: ['You did it!','Awesome!','Great job!','Wonderful!','Way to go!'] },
    build_wrong:       { files: ['audio/feedback/oops_try_again.wav','audio/feedback/not_quite.wav','audio/feedback/lets_try_again.wav'], texts: ['Oops! Try again!','Not quite!',"Let's try again!"] },
    cvc_quiz_prompt:   { files: ['audio/ui/cvc_quiz_prompt.wav'],   texts: ['Which picture matches?'] },

    // Sight Words
    flashcard_entry:   { files: ['audio/ui/flashcard_entry.wav'],   texts: ['Tap the card to hear the word!'] },
    match_entry:       { files: ['audio/ui/match_entry.wav'],       texts: ['Listen and find the word!'] },
    match_prompt:      { files: ['audio/ui/match_prompt.wav'],      texts: ['Which word do you hear?'] },
    stories_entry:     { files: ['audio/ui/stories_entry.wav'],     texts: ["Let's read a story!"] },

    // Word Builder
    spell_entry:       { files: ['audio/ui/spell_entry.wav'],       texts: ['Spell the word!'] },
    spell_prompt:      { files: ['audio/ui/spell_prompt.wav'],      texts: ['Tap the letters!'] },
    picmatch_entry:    { files: ['audio/ui/picmatch_entry.wav'],    texts: ['Match the pictures!'] },
    blend_entry:       { files: ['audio/ui/blend_entry.wav'],       texts: ["Let's blend sounds!"] },
    daily_entry:       { files: ['audio/ui/daily_entry.wav'],       texts: ['Here is your daily word!'] },

    // Phonics Lab
    phonics_entry:     { files: ['audio/ui/phonics_entry.wav'],     texts: ["Let's listen to sounds!"] },
    phonics_end:       { files: ['audio/ui/phonics_end.wav'],       texts: ['What sound does it end with?'] },

    // Rhyme Time
    rhyme_entry:       { files: ['audio/ui/rhyme_entry.wav'],       texts: ['Time to rhyme!'] },
    find_odd_one:      { files: ['audio/ui/find_odd_one.wav'],      texts: ["Which one doesn't rhyme?"] },

    // Shared
    correct:           { files: ['audio/feedback/awesome.wav','audio/feedback/way_to_go.wav','audio/feedback/great_job.wav','audio/feedback/you_did_it.wav','audio/feedback/nice_work.wav'], texts: ['Awesome!','Way to go!','Great job!','You did it!','Nice work!'] },
    wrong:             { files: ['audio/feedback/oops_try_again.wav','audio/feedback/not_quite.wav','audio/feedback/lets_try_again.wav'], texts: ['Oops! Try again!','Not quite!',"Let's try again!"] },
    results_great:     { files: ['audio/feedback/wow_amazing.wav','audio/feedback/you_did_it.wav','audio/feedback/so_great.wav','audio/feedback/high_five.wav'], texts: ['Wow! Amazing!','You did it!','So great!','High five!'] },
    results_good:      { files: ['audio/feedback/good_job.wav','audio/feedback/keep_playing.wav','audio/feedback/nice_work.wav'], texts: ['Good job!','Keep playing!','Nice work!'] },
};

/**
 * Speak a pre-defined instruction.
 * Picks randomly from available variants for variety.
 */
export async function speakInstruction(key) {
    const instr = INSTRUCTIONS[key];
    if (!instr) return;

    if (key.includes('correct') || key.includes('done') || key.includes('great') || key === 'welcome') {
        playTinkle();
        await delay(300);
    }

    const idx  = Math.floor(Math.random() * instr.files.length);
    const file = instr.files[idx];
    const text = instr.texts[idx] || instr.texts[0];

    return playAudio(file, text);
}

/* ============================================
   Preload (no-op for file-based audio, but
   keep signature for API compatibility)
   ============================================ */

/**
 * Call once at app startup. Warms the AudioContext (avoids iOS first-tap
 * silence) and preloads the small feedback clips that play most often.
 */
export function preloadVoices() {
    try { getAudioContext(); } catch { /* ignore */ }

    // Preload the clips that fire on every correct/wrong answer so they
    // play with zero perceptible latency.
    preloadAudio([
        'audio/feedback/awesome.wav',
        'audio/feedback/great_job.wav',
        'audio/feedback/you_did_it.wav',
        'audio/feedback/way_to_go.wav',
        'audio/feedback/nice_work.wav',
        'audio/feedback/wonderful.wav',
        'audio/feedback/wow_amazing.wav',
        'audio/feedback/high_five.wav',
        'audio/feedback/not_quite.wav',
        'audio/feedback/lets_try_again.wav',
        'audio/feedback/oops_try_again.wav',
        'audio/feedback/good_job.wav',
        'audio/ui/welcome.wav',
        'audio/ui/quiz_entry.wav',
    ]);
}

/* ============================================
   Sound Effects (Web Audio API — unchanged)
   ============================================ */

export function playTinkle() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [1318.5, 1568, 2093].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.25);
    });
}

export function playCorrectSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
    });
}

export function playWrongSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(300, now + 0.3);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
}

export function playPopSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
}

export function playCelebrationSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i < 3 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.5);
    });
}

export function playStarSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
}

export function playSnapSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
}

export function playSwipeSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
}

export function playWhooshSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
}

/* ============================================
   Utilities
   ============================================ */

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
