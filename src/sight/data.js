/**
 * Sight word data — 40 pre-K Dolch sight words.
 * Each word has: sentence, emoji illustration, group.
 */
export const SIGHT_WORDS = [
    // Core
    { word: 'the', sentence: 'The dog is happy!', emoji: '🐶', group: 'core', color: '#FF6B6B' },
    { word: 'a', sentence: 'I see a cat!', emoji: '🐱', group: 'core', color: '#FF8A65' },
    { word: 'I', sentence: 'I am here!', emoji: '🙋', group: 'core', color: '#FFB74D' },
    { word: 'is', sentence: 'It is sunny!', emoji: '☀️', group: 'core', color: '#FFD54F' },
    { word: 'it', sentence: 'It is a ball!', emoji: '⚽', group: 'core', color: '#AED581' },
    { word: 'in', sentence: 'The fish is in the water!', emoji: '🐟', group: 'core', color: '#81C784' },
    { word: 'my', sentence: 'This is my teddy bear!', emoji: '🧸', group: 'core', color: '#4DB6AC' },
    { word: 'me', sentence: 'Come play with me!', emoji: '🎮', group: 'core', color: '#4DD0E1' },
    { word: 'we', sentence: 'We can play together!', emoji: '👫', group: 'core', color: '#4FC3F7' },
    { word: 'he', sentence: 'He has a hat!', emoji: '🎩', group: 'core', color: '#64B5F6' },

    // Actions
    { word: 'can', sentence: 'I can jump high!', emoji: '🤸', group: 'actions', color: '#7986CB' },
    { word: 'see', sentence: 'I can see the bird!', emoji: '🐦', group: 'actions', color: '#9575CD' },
    { word: 'go', sentence: 'Let us go to the park!', emoji: '🏞️', group: 'actions', color: '#BA68C8' },
    { word: 'run', sentence: 'I like to run fast!', emoji: '🏃', group: 'actions', color: '#F06292' },
    { word: 'like', sentence: 'I like ice cream!', emoji: '🍦', group: 'actions', color: '#E57373' },
    { word: 'play', sentence: 'Let us play a game!', emoji: '🎲', group: 'actions', color: '#FF7043' },
    { word: 'look', sentence: 'Look at the rainbow!', emoji: '🌈', group: 'actions', color: '#FFA726' },
    { word: 'said', sentence: 'Mom said hello!', emoji: '👋', group: 'actions', color: '#FFCA28' },
    { word: 'come', sentence: 'Come and see!', emoji: '👀', group: 'actions', color: '#D4E157' },
    { word: 'up', sentence: 'Look up at the sky!', emoji: '🌤️', group: 'actions', color: '#66BB6A' },

    // Descriptors
    { word: 'big', sentence: 'The elephant is big!', emoji: '🐘', group: 'descriptors', color: '#26A69A' },
    { word: 'little', sentence: 'The ant is little!', emoji: '🐜', group: 'descriptors', color: '#26C6DA' },
    { word: 'red', sentence: 'The apple is red!', emoji: '🍎', group: 'descriptors', color: '#42A5F5' },
    { word: 'blue', sentence: 'The sky is blue!', emoji: '🦋', group: 'descriptors', color: '#5C6BC0' },
    { word: 'one', sentence: 'I have one star!', emoji: '⭐', group: 'descriptors', color: '#AB47BC' },
    { word: 'two', sentence: 'I see two birds!', emoji: '🐦', group: 'descriptors', color: '#EC407A' },
    { word: 'three', sentence: 'Three little kittens!', emoji: '🐱', group: 'descriptors', color: '#FF6B6B' },
    { word: 'and', sentence: 'You and me!', emoji: '🤝', group: 'descriptors', color: '#FF8A65' },
    { word: 'not', sentence: 'It is not cold!', emoji: '🌞', group: 'descriptors', color: '#FFB74D' },
    { word: 'for', sentence: 'This is for you!', emoji: '🎁', group: 'descriptors', color: '#FFD54F' },

    // Connectors
    { word: 'to', sentence: 'Go to the door!', emoji: '🚪', group: 'connectors', color: '#AED581' },
    { word: 'on', sentence: 'The cat is on the mat!', emoji: '🐱', group: 'connectors', color: '#81C784' },
    { word: 'you', sentence: 'I like you!', emoji: '❤️', group: 'connectors', color: '#4DB6AC' },
    { word: 'are', sentence: 'You are wonderful!', emoji: '🌟', group: 'connectors', color: '#4DD0E1' },
    { word: 'was', sentence: 'It was fun!', emoji: '🎉', group: 'connectors', color: '#4FC3F7' },
    { word: 'this', sentence: 'This is my book!', emoji: '📖', group: 'connectors', color: '#64B5F6' },
    { word: 'that', sentence: 'Look at that!', emoji: '👉', group: 'connectors', color: '#7986CB' },
    { word: 'with', sentence: 'Play with me!', emoji: '🤗', group: 'connectors', color: '#9575CD' },
    { word: 'do', sentence: 'What do you see?', emoji: '🔍', group: 'connectors', color: '#BA68C8' },
    { word: 'have', sentence: 'I have a puppy!', emoji: '🐶', group: 'connectors', color: '#F06292' },
];

/**
 * Simple stories with sight words highlighted
 */
export const STORIES = [
    {
        title: '🐶',
        sentences: [
            { text: 'I see a big dog.', highlights: ['I', 'see', 'a', 'big'] },
            { text: 'The dog can run.', highlights: ['The', 'can', 'run'] },
            { text: 'I like the dog!', highlights: ['I', 'like', 'the'] },
        ],
    },
    {
        title: '🐱',
        sentences: [
            { text: 'Look at my little cat.', highlights: ['Look', 'at', 'my', 'little'] },
            { text: 'The cat is on the mat.', highlights: ['The', 'is', 'on', 'the'] },
            { text: 'I like my cat!', highlights: ['I', 'like', 'my'] },
        ],
    },
    {
        title: '🌈',
        sentences: [
            { text: 'Look up at the sky!', highlights: ['Look', 'up', 'at', 'the'] },
            { text: 'I can see a rainbow.', highlights: ['I', 'can', 'see', 'a'] },
            { text: 'It is red and blue!', highlights: ['It', 'is', 'red', 'and', 'blue'] },
        ],
    },
    {
        title: '🎉',
        sentences: [
            { text: 'Come play with me!', highlights: ['Come', 'play', 'with', 'me'] },
            { text: 'We can go to the park.', highlights: ['We', 'can', 'go', 'to', 'the'] },
            { text: 'It is fun for you and me!', highlights: ['It', 'is', 'for', 'you', 'and', 'me'] },
        ],
    },
    {
        title: '🧸',
        sentences: [
            { text: 'This is my teddy bear.', highlights: ['This', 'is', 'my'] },
            { text: 'He is not big.', highlights: ['He', 'is', 'not', 'big'] },
            { text: 'I have two bears!', highlights: ['I', 'have', 'two'] },
        ],
    },
    {
        title: '🐦',
        sentences: [
            { text: 'I see three little birds.', highlights: ['I', 'see', 'three', 'little'] },
            { text: 'The birds are in a tree.', highlights: ['The', 'are', 'in', 'a'] },
            { text: 'One said come and play!', highlights: ['One', 'said', 'come', 'and', 'play'] },
        ],
    },
    {
        title: '🌻',
        sentences: [
            { text: 'I have a little red flower.', highlights: ['I', 'have', 'a', 'little', 'red'] },
            { text: 'Look at it go up!', highlights: ['Look', 'at', 'it', 'go', 'up'] },
            { text: 'It is big and pretty!', highlights: ['It', 'is', 'big', 'and'] },
        ],
    },
    {
        title: '🎈',
        sentences: [
            { text: 'I can see two blue balloons.', highlights: ['I', 'can', 'see', 'two', 'blue'] },
            { text: 'One is for you and me!', highlights: ['One', 'is', 'for', 'you', 'and', 'me'] },
            { text: 'We like to play with this!', highlights: ['We', 'like', 'to', 'play', 'with', 'this'] },
        ],
    },
];

export const WORD_GROUPS = [
    { key: 'core', label: 'Core', emoji: '⭐', color: '#FF6B6B' },
    { key: 'actions', label: 'Actions', emoji: '🏃', color: '#A78BFA' },
    { key: 'descriptors', label: 'Descriptors', emoji: '🎨', color: '#4ECDC4' },
    { key: 'connectors', label: 'Connectors', emoji: '🔗', color: '#F472B6' },
];

export function getWordsByGroup(group) {
    return SIGHT_WORDS.filter(w => w.group === group);
}

export function getRandomSightWords(count, exclude = []) {
    const available = SIGHT_WORDS.filter(w => !exclude.includes(w.word));
    return available.sort(() => Math.random() - 0.5).slice(0, count);
}
