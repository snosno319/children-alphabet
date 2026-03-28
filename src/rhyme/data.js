/**
 * Rhyme Time — Word Data
 * Rhyme families for phonological awareness practice.
 * Mix of CVC and longer words to provide variety.
 * Some overlap with CVC data is intentional (different learning mechanic).
 */

export const RHYME_FAMILIES = [
    {
        pattern: '-at',
        color: '#FF6B6B',
        words: [
            { word: 'cat', emoji: '🐱' },
            { word: 'hat', emoji: '🎩' },
            { word: 'bat', emoji: '🦇' },
            { word: 'mat', emoji: '🧹' },
            { word: 'rat', emoji: '🐀' },
        ],
    },
    {
        pattern: '-og',
        color: '#42A5F5',
        words: [
            { word: 'dog', emoji: '🐶' },
            { word: 'frog', emoji: '🐸' },
            { word: 'log', emoji: '🪵' },
            { word: 'fog', emoji: '🌫️' },
            { word: 'hog', emoji: '🐗' },
        ],
    },
    {
        pattern: '-ake',
        color: '#FFB300',
        words: [
            { word: 'cake', emoji: '🎂' },
            { word: 'lake', emoji: '🏞️' },
            { word: 'snake', emoji: '🐍' },
            { word: 'bake', emoji: '🍪' },
            { word: 'rake', emoji: '🍂' },
        ],
    },
    {
        pattern: '-ight',
        color: '#66BB6A',
        words: [
            { word: 'night', emoji: '🌙' },
            { word: 'light', emoji: '💡' },
            { word: 'kite', emoji: '🪁' },
            { word: 'fight', emoji: '🥊' },
            { word: 'bright', emoji: '🌟' },
        ],
    },
    {
        pattern: '-ug',
        color: '#A78BFA',
        words: [
            { word: 'bug', emoji: '🐛' },
            { word: 'hug', emoji: '🤗' },
            { word: 'mug', emoji: '☕' },
            { word: 'rug', emoji: '🟫' },
            { word: 'plug', emoji: '🔌' },
        ],
    },
    {
        pattern: '-op',
        color: '#F472B6',
        words: [
            { word: 'hop', emoji: '🐇' },
            { word: 'mop', emoji: '🧹' },
            { word: 'pop', emoji: '🎈' },
            { word: 'top', emoji: '🔝' },
            { word: 'stop', emoji: '🛑' },
        ],
    },
    {
        pattern: '-all',
        color: '#4ECDC4',
        words: [
            { word: 'ball', emoji: '⚽' },
            { word: 'wall', emoji: '🧱' },
            { word: 'tall', emoji: '🦒' },
            { word: 'fall', emoji: '🍂' },
            { word: 'call', emoji: '📞' },
        ],
    },
    {
        pattern: '-oon',
        color: '#FB923C',
        words: [
            { word: 'moon', emoji: '🌙' },
            { word: 'spoon', emoji: '🥄' },
            { word: 'balloon', emoji: '🎈' },
            { word: 'soon', emoji: '⏰' },
            { word: 'noon', emoji: '🕛' },
        ],
    },
    {
        pattern: '-ear',
        color: '#E879F9',
        words: [
            { word: 'bear', emoji: '🐻' },
            { word: 'pear', emoji: '🍐' },
            { word: 'ear', emoji: '👂' },
            { word: 'tear', emoji: '😢' },
            { word: 'dear', emoji: '💌' },
        ],
    },
    {
        pattern: '-ing',
        color: '#60A5FA',
        words: [
            { word: 'ring', emoji: '💍' },
            { word: 'king', emoji: '👑' },
            { word: 'sing', emoji: '🎤' },
            { word: 'wing', emoji: '🦅' },
            { word: 'swing', emoji: '🎠' },
        ],
    },
];

/** Get all words flat with rhyme metadata */
export function getAllRhymeWords() {
    return RHYME_FAMILIES.flatMap(f =>
        f.words.map(w => ({ ...w, pattern: f.pattern, familyColor: f.color }))
    );
}

/** Get N random words from a family */
export function getWordsFromFamily(pattern, count = 5) {
    const family = RHYME_FAMILIES.find(f => f.pattern === pattern);
    if (!family) return [];
    return family.words.sort(() => Math.random() - 0.5).slice(0, count);
}

/** Get distractor words that DON'T rhyme with a given pattern */
export function getDistractorWords(excludePattern, count = 3) {
    return getAllRhymeWords()
        .filter(w => w.pattern !== excludePattern)
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}

/** Get two random rhyme families for sorting games */
export function getTwoFamilies() {
    const shuffled = [...RHYME_FAMILIES].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
}
