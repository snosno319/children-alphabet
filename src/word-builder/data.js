/**
 * Word data for Word Builder Lab.
 * 60 words across 6 categories with emojis.
 */
export const CATEGORIES = [
    {
        key: 'animals',
        emoji: '🐾',
        color: '#FF6B6B',
        words: [
            { word: 'cat', emoji: '🐱' },
            { word: 'dog', emoji: '🐶' },
            { word: 'pig', emoji: '🐷' },
            { word: 'hen', emoji: '🐔' },
            { word: 'fox', emoji: '🦊' },
            { word: 'bee', emoji: '🐝' },
            { word: 'cow', emoji: '🐮' },
            { word: 'ant', emoji: '🐜' },
            { word: 'owl', emoji: '🦉' },
            { word: 'bat', emoji: '🦇' },
        ],
    },
    {
        key: 'food',
        emoji: '🍎',
        color: '#FF8A65',
        words: [
            { word: 'jam', emoji: '🫙' },
            { word: 'pie', emoji: '🥧' },
            { word: 'bun', emoji: '🍞' },
            { word: 'egg', emoji: '🥚' },
            { word: 'fig', emoji: '🫒' },
            { word: 'nut', emoji: '🥜' },
            { word: 'pea', emoji: '🫛' },
            { word: 'ham', emoji: '🍖' },
            { word: 'yam', emoji: '🍠' },
            { word: 'cup', emoji: '☕' },
        ],
    },
    {
        key: 'colors',
        emoji: '🎨',
        color: '#A78BFA',
        words: [
            { word: 'red', emoji: '🔴' },
            { word: 'blue', emoji: '🔵' },
            { word: 'pink', emoji: '💗' },
            { word: 'gold', emoji: '🟡' },
            { word: 'teal', emoji: '🟢' },
            { word: 'gray', emoji: '⚪' },
            { word: 'lime', emoji: '🟩' },
            { word: 'plum', emoji: '🟣' },
            { word: 'rust', emoji: '🟠' },
            { word: 'navy', emoji: '🔷' },
        ],
    },
    {
        key: 'home',
        emoji: '🏠',
        color: '#4ECDC4',
        words: [
            { word: 'bed', emoji: '🛏️' },
            { word: 'jar', emoji: '🫙' },
            { word: 'pan', emoji: '🍳' },
            { word: 'rug', emoji: '🟫' },
            { word: 'box', emoji: '📦' },
            { word: 'mug', emoji: '☕' },
            { word: 'hat', emoji: '🎩' },
            { word: 'bag', emoji: '👜' },
            { word: 'pen', emoji: '🖊️' },
            { word: 'map', emoji: '🗺️' },
        ],
    },
    {
        key: 'nature',
        emoji: '🌿',
        color: '#34D399',
        words: [
            { word: 'sun', emoji: '☀️' },
            { word: 'mud', emoji: '🟤' },
            { word: 'bug', emoji: '🐛' },
            { word: 'dew', emoji: '💧' },
            { word: 'fog', emoji: '🌫️' },
            { word: 'log', emoji: '🪵' },
            { word: 'bay', emoji: '🏖️' },
            { word: 'ivy', emoji: '🌿' },
            { word: 'oak', emoji: '🌳' },
            { word: 'elm', emoji: '🌲' },
        ],
    },
    {
        key: 'things',
        emoji: '🚗',
        color: '#60A5FA',
        words: [
            { word: 'bus', emoji: '🚌' },
            { word: 'van', emoji: '🚐' },
            { word: 'car', emoji: '🚗' },
            { word: 'jet', emoji: '✈️' },
            { word: 'sub', emoji: '🚇' },
            { word: 'cab', emoji: '🚕' },
            { word: 'net', emoji: '🥅' },
            { word: 'top', emoji: '🔝' },
            { word: 'fan', emoji: '🌀' },
            { word: 'pot', emoji: '🍯' },
        ],
    },
];

/**
 * Get all words flat
 */
export function getAllWords() {
    return CATEGORIES.flatMap(c =>
        c.words.map(w => ({ ...w, category: c.key, categoryColor: c.color, categoryEmoji: c.emoji }))
    );
}

/**
 * Get words by category
 */
export function getWordsByCategory(key) {
    const cat = CATEGORIES.find(c => c.key === key);
    return cat ? cat.words.map(w => ({ ...w, category: cat.key, categoryColor: cat.color })) : [];
}

/**
 * Get N random words
 */
export function getRandomWords(count, exclude = []) {
    const all = getAllWords().filter(w => !exclude.includes(w.word));
    return all.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Get the daily word based on date
 */
export function getDailyWord() {
    const all = getAllWords();
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    return all[dayOfYear % all.length];
}

/**
 * All letters for distractor generation
 */
export const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
