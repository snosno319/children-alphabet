/**
 * Phonics Lab — Word Data
 * Words grouped by initial sound for sound isolation practice.
 * Each group has 5 words to ensure enough variety per round.
 */

export const SOUND_GROUPS = [
    {
        sound: 'b', phonetic: 'buh', color: '#FF6B6B',
        words: [
            { word: 'ball', emoji: '⚽' },
            { word: 'bear', emoji: '🐻' },
            { word: 'bus', emoji: '🚌' },
            { word: 'bed', emoji: '🛏️' },
            { word: 'bird', emoji: '🐦' },
        ],
    },
    {
        sound: 'c', phonetic: 'kuh', color: '#FF8A65',
        words: [
            { word: 'car', emoji: '🚗' },
            { word: 'cup', emoji: '☕' },
            { word: 'cow', emoji: '🐄' },
            { word: 'cake', emoji: '🎂' },
            { word: 'corn', emoji: '🌽' },
        ],
    },
    {
        sound: 'd', phonetic: 'duh', color: '#42A5F5',
        words: [
            { word: 'dog', emoji: '🐶' },
            { word: 'duck', emoji: '🦆' },
            { word: 'door', emoji: '🚪' },
            { word: 'drum', emoji: '🥁' },
            { word: 'doll', emoji: '🪆' },
        ],
    },
    {
        sound: 'f', phonetic: 'fff', color: '#66BB6A',
        words: [
            { word: 'fish', emoji: '🐟' },
            { word: 'frog', emoji: '🐸' },
            { word: 'fire', emoji: '🔥' },
            { word: 'fan', emoji: '🌀' },
            { word: 'fox', emoji: '🦊' },
        ],
    },
    {
        sound: 'g', phonetic: 'guh', color: '#A78BFA',
        words: [
            { word: 'goat', emoji: '🐐' },
            { word: 'grape', emoji: '🍇' },
            { word: 'gift', emoji: '🎁' },
            { word: 'game', emoji: '🎮' },
            { word: 'girl', emoji: '👧' },
        ],
    },
    {
        sound: 'h', phonetic: 'huh', color: '#F472B6',
        words: [
            { word: 'hat', emoji: '🎩' },
            { word: 'horse', emoji: '🐴' },
            { word: 'house', emoji: '🏠' },
            { word: 'heart', emoji: '❤️' },
            { word: 'hill', emoji: '⛰️' },
        ],
    },
    {
        sound: 'l', phonetic: 'lll', color: '#4ECDC4',
        words: [
            { word: 'lion', emoji: '🦁' },
            { word: 'leaf', emoji: '🍃' },
            { word: 'lamp', emoji: '💡' },
            { word: 'lock', emoji: '🔒' },
            { word: 'lemon', emoji: '🍋' },
        ],
    },
    {
        sound: 'm', phonetic: 'mmm', color: '#FFB300',
        words: [
            { word: 'moon', emoji: '🌙' },
            { word: 'mouse', emoji: '🐭' },
            { word: 'milk', emoji: '🥛' },
            { word: 'map', emoji: '🗺️' },
            { word: 'monkey', emoji: '🐵' },
        ],
    },
    {
        sound: 'p', phonetic: 'puh', color: '#E879F9',
        words: [
            { word: 'pig', emoji: '🐷' },
            { word: 'pen', emoji: '🖊️' },
            { word: 'pizza', emoji: '🍕' },
            { word: 'pear', emoji: '🍐' },
            { word: 'plane', emoji: '✈️' },
        ],
    },
    {
        sound: 'r', phonetic: 'rrr', color: '#60A5FA',
        words: [
            { word: 'rain', emoji: '🌧️' },
            { word: 'ring', emoji: '💍' },
            { word: 'rock', emoji: '🪨' },
            { word: 'rose', emoji: '🌹' },
            { word: 'robot', emoji: '🤖' },
        ],
    },
    {
        sound: 's', phonetic: 'sss', color: '#34D399',
        words: [
            { word: 'sun', emoji: '☀️' },
            { word: 'star', emoji: '⭐' },
            { word: 'snake', emoji: '🐍' },
            { word: 'sock', emoji: '🧦' },
            { word: 'ship', emoji: '🚢' },
        ],
    },
    {
        sound: 't', phonetic: 'tuh', color: '#FB923C',
        words: [
            { word: 'tree', emoji: '🌳' },
            { word: 'train', emoji: '🚂' },
            { word: 'tiger', emoji: '🐯' },
            { word: 'tooth', emoji: '🦷' },
            { word: 'tent', emoji: '⛺' },
        ],
    },
];

/** All unique initial sounds */
export const ALL_SOUNDS = SOUND_GROUPS.map(g => g.sound);

/** Get all words flat with their sound metadata */
export function getAllPhonicsWords() {
    return SOUND_GROUPS.flatMap(g =>
        g.words.map(w => ({
            ...w,
            initialSound: g.sound,
            endSound: w.word[w.word.length - 1],
            color: g.color,
        }))
    );
}

/** Unique ending sounds across all words */
export function getAllEndSounds() {
    const ends = new Set(getAllPhonicsWords().map(w => w.endSound));
    return [...ends];
}

/** Get N random words from a specific sound group */
export function getWordsForSound(sound, count = 5) {
    const group = SOUND_GROUPS.find(g => g.sound === sound);
    if (!group) return [];
    return group.words.sort(() => Math.random() - 0.5).slice(0, count);
}

/** Get distractor sounds (sounds that are NOT the correct answer) */
export function getDistractorSounds(correctSound, count = 3) {
    return ALL_SOUNDS
        .filter(s => s !== correctSound)
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}
