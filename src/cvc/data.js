/**
 * CVC Word data for all word families.
 * Each family has a rime (ending) and a set of words with emojis.
 */
export const WORD_FAMILIES = [
    {
        rime: 'at',
        color: '#FF6B6B',
        emoji: '🐱',
        words: [
            { word: 'cat', emoji: '🐱', onset: 'c' },
            { word: 'hat', emoji: '🎩', onset: 'h' },
            { word: 'bat', emoji: '🦇', onset: 'b' },
            { word: 'mat', emoji: '🧹', onset: 'm' },
            { word: 'rat', emoji: '🐀', onset: 'r' },
        ],
    },
    {
        rime: 'an',
        color: '#FF8A65',
        emoji: '🚐',
        words: [
            { word: 'can', emoji: '🥫', onset: 'c' },
            { word: 'fan', emoji: '🌀', onset: 'f' },
            { word: 'man', emoji: '🧑', onset: 'm' },
            { word: 'pan', emoji: '🍳', onset: 'p' },
            { word: 'van', emoji: '🚐', onset: 'v' },
        ],
    },
    {
        rime: 'ig',
        color: '#A78BFA',
        emoji: '🐷',
        words: [
            { word: 'big', emoji: '🦣', onset: 'b' },
            { word: 'dig', emoji: '⛏️', onset: 'd' },
            { word: 'fig', emoji: '🫒', onset: 'f' },
            { word: 'pig', emoji: '🐷', onset: 'p' },
            { word: 'wig', emoji: '💇', onset: 'w' },
        ],
    },
    {
        rime: 'og',
        color: '#4ECDC4',
        emoji: '🐶',
        words: [
            { word: 'dog', emoji: '🐶', onset: 'd' },
            { word: 'fog', emoji: '🌫️', onset: 'f' },
            { word: 'hog', emoji: '🐗', onset: 'h' },
            { word: 'jog', emoji: '🏃', onset: 'j' },
            { word: 'log', emoji: '🪵', onset: 'l' },
        ],
    },
    {
        rime: 'ug',
        color: '#F472B6',
        emoji: '🐛',
        words: [
            { word: 'bug', emoji: '🐛', onset: 'b' },
            { word: 'hug', emoji: '🤗', onset: 'h' },
            { word: 'jug', emoji: '🏺', onset: 'j' },
            { word: 'mug', emoji: '☕', onset: 'm' },
            { word: 'rug', emoji: '🟫', onset: 'r' },
        ],
    },
    {
        rime: 'en',
        color: '#60A5FA',
        emoji: '🐔',
        words: [
            { word: 'hen', emoji: '🐔', onset: 'h' },
            { word: 'pen', emoji: '🖊️', onset: 'p' },
            { word: 'ten', emoji: '🔟', onset: 't' },
            { word: 'den', emoji: '🏕️', onset: 'd' },
            { word: 'men', emoji: '👬', onset: 'm' },
        ],
    },
    {
        rime: 'ap',
        color: '#FB923C',
        emoji: '🗺️',
        words: [
            { word: 'cap', emoji: '🧢', onset: 'c' },
            { word: 'map', emoji: '🗺️', onset: 'm' },
            { word: 'nap', emoji: '😴', onset: 'n' },
            { word: 'tap', emoji: '🚰', onset: 't' },
            { word: 'zap', emoji: '⚡', onset: 'z' },
        ],
    },
    {
        rime: 'it',
        color: '#34D399',
        emoji: '🧤',
        words: [
            { word: 'bit', emoji: '🦷', onset: 'b' },
            { word: 'hit', emoji: '🥊', onset: 'h' },
            { word: 'kit', emoji: '🧰', onset: 'k' },
            { word: 'sit', emoji: '🪑', onset: 's' },
            { word: 'pit', emoji: '🕳️', onset: 'p' },
        ],
    },
    {
        rime: 'op',
        color: '#E879F9',
        emoji: '🐇',
        words: [
            { word: 'hop', emoji: '🐇', onset: 'h' },
            { word: 'mop', emoji: '🧹', onset: 'm' },
            { word: 'pop', emoji: '🎈', onset: 'p' },
            { word: 'top', emoji: '🔝', onset: 't' },
            { word: 'cop', emoji: '👮', onset: 'c' },
        ],
    },
    {
        rime: 'un',
        color: '#FBBF24',
        emoji: '☀️',
        words: [
            { word: 'bun', emoji: '🍞', onset: 'b' },
            { word: 'fun', emoji: '🎉', onset: 'f' },
            { word: 'gun', emoji: '🔫', onset: 'g' },
            { word: 'run', emoji: '🏃', onset: 'r' },
            { word: 'sun', emoji: '☀️', onset: 's' },
        ],
    },
];

/**
 * Get all words flat (for quizzes, random picks, etc.)
 */
export function getAllWords() {
    return WORD_FAMILIES.flatMap(f =>
        f.words.map(w => ({ ...w, rime: f.rime, familyColor: f.color }))
    );
}

/**
 * Get all word families
 */
export function getAllFamilies() {
    return WORD_FAMILIES;
}

/**
 * Get words for a specific family by rime
 */
export function getWordsForFamily(rime) {
    const family = WORD_FAMILIES.find(f => f.rime === rime);
    return family ? family.words : [];
}

/**
 * Get a word family by its rime
 */
export function getFamily(rime) {
    return WORD_FAMILIES.find(f => f.rime === rime);
}

/**
 * Get N random words, optionally excluding some
 */
export function getRandomWords(count, exclude = []) {
    const all = getAllWords().filter(w => !exclude.includes(w.word));
    const shuffled = all.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * All unique consonant letters used as onsets
 */
export const ALL_CONSONANTS = [
    'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
    'n', 'p', 'r', 's', 't', 'v', 'w',
];
