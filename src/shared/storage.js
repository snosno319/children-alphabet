/**
 * Unified Progress Storage — English Adventure
 * Single localStorage key with per-app sub-keys.
 */

let activeProfileId = localStorage.getItem('active_profile') || 'default';

export function setActiveProfile(id) {
    activeProfileId = id;
    localStorage.setItem('active_profile', id);
}

export function getActiveProfile() {
    return activeProfileId;
}

export function getProfiles() {
    try {
        const data = localStorage.getItem('ea_profiles');
        if (data) return JSON.parse(data);
    } catch (e) {
        // Profile data is not critical — return empty list on parse failure
    }
    return []; // No profiles by default means we haven't asked yet
}

export function saveProfiles(profiles) {
    localStorage.setItem('ea_profiles', JSON.stringify(profiles));
}

function getStorageKey() {
    return `english-adventure-progress-${activeProfileId}`;
}

function getProgress() {
    try {
        const data = localStorage.getItem(getStorageKey());
        if (data) return JSON.parse(data);
    } catch (e) {
        console.warn('[storage] Failed to parse progress data; resetting to defaults.', e);
    }
    return createDefaultProgress();
}

function saveProgress(progress) {
    try {
        localStorage.setItem(getStorageKey(), JSON.stringify(progress));
    } catch (e) {
        console.warn('[storage] Failed to save progress data.', e);
    }
}

function createDefaultProgress() {
    return {
        alphabet: {
            exploredLetters: [],
            tracedLetters: [],
            quizCorrect: 0,
            quizTotal: 0,
            letterScores: {}, // { 'A': { correct: 0, wrong: 0 }, ... }
            stars: 0,
            memoryBestEasy: null,
            memoryBestHard: null,
            caseMatchCorrect: 0,
            caseMatchTotal: 0,
        },
        cvc: {
            exploredFamilies: [],
            builtWords: [],
            quizCorrect: 0,
            quizTotal: 0,
            wordScores: {}, // { 'cat': { correct: 0, wrong: 0 } }
            stars: 0,
        },
        sight: {
            learnedWords: [],
            matchCorrect: 0,
            matchTotal: 0,
            storiesRead: [],
            stars: 0,
        },
        wordBuilder: {
            spelledWords: [],
            matchedWords: [],
            blendedWords: [],
            dailyCompleted: [],
            wordScores: {}, // { 'dog': { correct: 0, wrong: 0 } }
            streak: 0,
            lastDaily: null,
            stars: 0,
        },
        phonics: {
            soundMatchCorrect: 0,
            soundMatchTotal: 0,
            soundSortCorrect: 0,
            soundSortTotal: 0,
            endSoundCorrect: 0,
            endSoundTotal: 0,
            stars: 0,
        },
        rhyme: {
            rhymeMatchCorrect: 0,
            rhymeMatchTotal: 0,
            rhymeSortCorrect: 0,
            rhymeSortTotal: 0,
            oddOneOutCorrect: 0,
            oddOneOutTotal: 0,
            stars: 0,
        },
        numbers: {
            exploredNumbers: [],
            quizCorrect: 0,
            quizTotal: 0,
            stars: 0,
        },
        global: {
            lastActivity: null,
            earnedBadges: [],   // string[] — badge IDs in earn order
            badgeSeenAt: {},    // { badgeId: timestamp } — prevents re-showing earn overlay
        },
    };
}

/* ============================================
   Global
   ============================================ */

export function getTotalStars() {
    const p = getProgress();
    return (p.alphabet.stars || 0)
        + (p.cvc.stars || 0)
        + (p.sight.stars || 0)
        + (p.wordBuilder.stars || 0)
        + (p.phonics.stars || 0)
        + (p.rhyme.stars || 0);
}

export function getSubAppStars(subApp) {
    const p = getProgress();
    return p[subApp]?.stars || 0;
}

export function getAllProgress() {
    return getProgress();
}

export function resetProgress() {
    saveProgress(createDefaultProgress());
}

/* ============================================
   Alphabet
   ============================================ */

export function markExplored(letter) {
    const p = getProgress();
    if (!p.alphabet.exploredLetters.includes(letter)) {
        p.alphabet.exploredLetters.push(letter);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function markTraced(letter) {
    const p = getProgress();
    if (!p.alphabet.tracedLetters.includes(letter)) {
        p.alphabet.tracedLetters.push(letter);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordAlphabetQuizAnswer(correct) {
    const p = getProgress();
    p.alphabet.quizTotal++;
    if (correct) p.alphabet.quizCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordLetterAccuracy(letter, isCorrect) {
    const p = getProgress();
    if (!p.alphabet.letterScores[letter]) {
        p.alphabet.letterScores[letter] = { correct: 0, wrong: 0 };
    }
    if (isCorrect) p.alphabet.letterScores[letter].correct++;
    else p.alphabet.letterScores[letter].wrong++;
    
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function addAlphabetStars(count) {
    const p = getProgress();
    p.alphabet.stars += count;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function getAlphabetProgress() {
    return getProgress().alphabet;
}

export function getAlphabetCompletionPercent() {
    const a = getProgress().alphabet;
    // 26 explored + 26 traced = 52 total
    const total = a.exploredLetters.length + a.tracedLetters.length;
    return Math.round((total / 52) * 100);
}

export function getNumbersCompletionPercent() {
    const p = getProgress();
    return Math.round(((p.numbers?.exploredNumbers?.length || 0) / 10) * 100);
}

/* ============================================
   CVC Words
   ============================================ */

export function markFamilyExplored(rime) {
    const p = getProgress();
    if (!p.cvc.exploredFamilies.includes(rime)) {
        p.cvc.exploredFamilies.push(rime);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function markWordBuilt(word) {
    const p = getProgress();
    if (!p.cvc.builtWords.includes(word)) {
        p.cvc.builtWords.push(word);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordCvcQuizAnswer(correct) {
    const p = getProgress();
    p.cvc.quizTotal++;
    if (correct) p.cvc.quizCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordCvcAccuracy(word, isCorrect) {
    const p = getProgress();
    if (!p.cvc.wordScores[word]) {
        p.cvc.wordScores[word] = { correct: 0, wrong: 0 };
    }
    if (isCorrect) p.cvc.wordScores[word].correct++;
    else p.cvc.wordScores[word].wrong++;
    
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function addCvcStars(count) {
    const p = getProgress();
    p.cvc.stars += count;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function getCvcProgress() {
    return getProgress().cvc;
}

export function getCvcCompletionPercent() {
    const c = getProgress().cvc;
    // 10 families + 50 words = 60 total
    const total = c.exploredFamilies.length + c.builtWords.length;
    return Math.round((total / 60) * 100);
}

/* ============================================
   Sight Words
   ============================================ */

export function markWordLearned(word) {
    const p = getProgress();
    if (!p.sight.learnedWords.includes(word)) {
        p.sight.learnedWords.push(word);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordMatchAnswer(correct) {
    const p = getProgress();
    p.sight.matchTotal++;
    if (correct) p.sight.matchCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function markStoryRead(index) {
    const p = getProgress();
    if (!p.sight.storiesRead.includes(index)) {
        p.sight.storiesRead.push(index);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function addSightStars(count) {
    const p = getProgress();
    p.sight.stars += count;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function getSightProgress() {
    return getProgress().sight;
}

export function getSightCompletionPercent() {
    const s = getProgress().sight;
    // 40 words + 8 stories = 48 total
    const total = s.learnedWords.length + s.storiesRead.length;
    return Math.round((total / 48) * 100);
}

/* ============================================
   Word Builder
   ============================================ */

export function markWordSpelled(word) {
    const p = getProgress();
    if (!p.wordBuilder.spelledWords.includes(word)) {
        p.wordBuilder.spelledWords.push(word);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function markWordMatched(word) {
    const p = getProgress();
    if (!p.wordBuilder.matchedWords.includes(word)) {
        p.wordBuilder.matchedWords.push(word);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function markWordBlended(word) {
    const p = getProgress();
    if (!p.wordBuilder.blendedWords.includes(word)) {
        p.wordBuilder.blendedWords.push(word);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordWordBuilderAccuracy(word, isCorrect) {
    const p = getProgress();
    if (!p.wordBuilder.wordScores[word]) {
        p.wordBuilder.wordScores[word] = { correct: 0, wrong: 0 };
    }
    if (isCorrect) p.wordBuilder.wordScores[word].correct++;
    else p.wordBuilder.wordScores[word].wrong++;
    
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function markDailyCompleted(dateStr) {
    const p = getProgress();
    if (!p.wordBuilder.dailyCompleted.includes(dateStr)) {
        p.wordBuilder.dailyCompleted.push(dateStr);
        p.wordBuilder.streak++;
        p.wordBuilder.lastDaily = dateStr;
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function isDailyCompleted() {
    const p = getProgress();
    const today = getTodayString();
    return p.wordBuilder.lastDaily === today;
}

/** Complete today's daily challenge (with proper streak logic). */
export function completeDailyChallenge() {
    const p = getProgress();
    const today = getTodayString();
    if (p.wordBuilder.lastDaily === today) return;

    const yesterday = getYesterdayString();
    if (p.wordBuilder.lastDaily === yesterday) {
        p.wordBuilder.streak++;
    } else {
        p.wordBuilder.streak = 1;
    }

    p.wordBuilder.lastDaily = today;
    if (!p.wordBuilder.dailyCompleted.includes(today)) {
        p.wordBuilder.dailyCompleted.push(today);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function getStreak() {
    return getProgress().wordBuilder.streak;
}

export function addWordBuilderStars(count) {
    const p = getProgress();
    p.wordBuilder.stars += count;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function getWordBuilderProgress() {
    return getProgress().wordBuilder;
}

export function getWordBuilderCompletionPercent() {
    const w = getProgress().wordBuilder;
    // 65 unique words across all activities
    const unique = new Set([...w.spelledWords, ...w.matchedWords, ...w.blendedWords]);
    return Math.round((unique.size / 65) * 100);
}

/* ============================================
   Sight Words helpers
   ============================================ */

export function getSightLearnedWords() {
    return getProgress().sight.learnedWords;
}

/* ============================================
   Date helpers
   ============================================ */

function getTodayString() {
    return new Date().toISOString().slice(0, 10);
}

function getYesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

/* ============================================
   Phonics Lab
   ============================================ */

export function addPhonicsStars(count) {
    const p = getProgress();
    p.phonics.stars += count;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordSoundMatch(correct) {
    const p = getProgress();
    p.phonics.soundMatchTotal++;
    if (correct) p.phonics.soundMatchCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordSoundSort(correct) {
    const p = getProgress();
    p.phonics.soundSortTotal++;
    if (correct) p.phonics.soundSortCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordEndSound(correct) {
    const p = getProgress();
    p.phonics.endSoundTotal++;
    if (correct) p.phonics.endSoundCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function getPhonicsStats() {
    const p = getProgress();
    const ph = p.phonics;
    return {
        totalCorrect: (ph.soundMatchCorrect || 0) + (ph.soundSortCorrect || 0) + (ph.endSoundCorrect || 0),
        totalAttempts: (ph.soundMatchTotal || 0) + (ph.soundSortTotal || 0) + (ph.endSoundTotal || 0),
    };
}

/* ============================================
   Rhyme Time
   ============================================ */

export function addRhymeStars(count) {
    const p = getProgress();
    p.rhyme.stars += count;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordRhymeMatch(correct) {
    const p = getProgress();
    p.rhyme.rhymeMatchTotal++;
    if (correct) p.rhyme.rhymeMatchCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordRhymeSort(correct) {
    const p = getProgress();
    p.rhyme.rhymeSortTotal++;
    if (correct) p.rhyme.rhymeSortCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function recordOddOneOut(correct) {
    const p = getProgress();
    p.rhyme.oddOneOutTotal++;
    if (correct) p.rhyme.oddOneOutCorrect++;
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function getRhymeStats() {
    const p = getProgress();
    const rh = p.rhyme;
    return {
        totalCorrect: (rh.rhymeMatchCorrect || 0) + (rh.rhymeSortCorrect || 0) + (rh.oddOneOutCorrect || 0),
        totalAttempts: (rh.rhymeMatchTotal || 0) + (rh.rhymeSortTotal || 0) + (rh.oddOneOutTotal || 0),
    };
}

/* ============================================
   Badges
   ============================================ */

export function getEarnedBadges() {
    return getProgress().global.earnedBadges || [];
}

export function hasBadge(id) {
    return (getProgress().global.earnedBadges || []).includes(id);
}

/** Award a badge. Returns true if newly awarded (false if already had it). */
export function awardBadge(id) {
    const p = getProgress();
    if (!p.global.earnedBadges) p.global.earnedBadges = [];
    if (p.global.earnedBadges.includes(id)) return false;
    p.global.earnedBadges.push(id);
    saveProgress(p);
    return true;
}

export function markBadgeSeen(id) {
    const p = getProgress();
    if (!p.global.badgeSeenAt) p.global.badgeSeenAt = {};
    p.global.badgeSeenAt[id] = Date.now();
    saveProgress(p);
}

/** Returns badge IDs earned but not yet shown in the overlay. */
export function getUnseenBadges() {
    const p = getProgress();
    const earned = p.global.earnedBadges || [];
    const seen = p.global.badgeSeenAt || {};
    return earned.filter(id => !seen[id]);
}

/* ============================================
   Numbers
   ============================================ */

export function markNumberExplored(number) {
    const p = getProgress();
    if (!p.numbers.exploredNumbers.includes(number)) {
        p.numbers.exploredNumbers.push(number);
    }
    p.global.lastActivity = Date.now();
    saveProgress(p);
}

export function isNumberExplored(number) {
    return getProgress().numbers.exploredNumbers.includes(number);
}

export function recordNumbersQuizResult(correct, total) {
    const p = getProgress();
    p.numbers.quizCorrect += correct;
    p.numbers.quizTotal   += total;
    const starsEarned = correct >= total ? 3 : correct >= total - 1 ? 2 : correct >= Math.ceil(total * 0.6) ? 1 : 0;
    p.numbers.stars += starsEarned;
    p.global.lastActivity = Date.now();
    saveProgress(p);
    return starsEarned;
}

export function getNumbersProgress() {
    return getProgress().numbers;
}

/* ============================================
   Alphabet — Memory game
   ============================================ */

export function saveMemoryBest(difficulty, moves) {
    const p = getProgress();
    const field = difficulty === 'easy' ? 'memoryBestEasy' : 'memoryBestHard';
    if (p.alphabet[field] === null || p.alphabet[field] === undefined || moves < p.alphabet[field]) {
        p.alphabet[field] = moves;
        p.global.lastActivity = Date.now();
        saveProgress(p);
    }
}

export function getMemoryBest(difficulty) {
    const field = difficulty === 'easy' ? 'memoryBestEasy' : 'memoryBestHard';
    return getProgress().alphabet[field] ?? null;
}

/* ============================================
   Alphabet — Case Match quiz
   ============================================ */

export function recordCaseMatchResult(correct, total) {
    const p = getProgress();
    p.alphabet.caseMatchCorrect += correct;
    p.alphabet.caseMatchTotal   += total;
    const starsEarned = correct >= total ? 3 : correct >= Math.ceil(total * 0.6) ? 2 : correct >= Math.ceil(total * 0.3) ? 1 : 0;
    p.alphabet.stars += starsEarned;
    p.global.lastActivity = Date.now();
    saveProgress(p);
    return starsEarned;
}
