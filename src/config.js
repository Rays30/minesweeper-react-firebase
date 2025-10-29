export const DIFFICULTY_SETTINGS = {
    easy: {
        gridSize: 9,
        mineCount: 10,
        initialHints: 999, // Unlimited
        initialChances: 999, // Unlimited
        difficultyMultiplier: 1,
        timeBonusMultiplier: 0.5,
        penaltiesIgnored: true, // Hints/Chances don't penalize in Easy
        totalTiles: 9 * 9,
        displayName: 'Easy'
    },
    medium: {
        gridSize: 16,
        mineCount: 40,
        initialHints: 3,
        initialChances: 1,
        difficultyMultiplier: 2,
        timeBonusMultiplier: 1,
        penaltiesIgnored: false,
        totalTiles: 16 * 16,
        displayName: 'Medium'
    },
    hard: {
        gridSize: 22,
        mineCount: 99,
        initialHints: 1,
        initialChances: 0,
        difficultyMultiplier: 3,
        timeBonusMultiplier: 1.5,
        penaltiesIgnored: false,
        totalTiles: 22 * 22,
        displayName: 'Hard'
    },
    extreme: {
        gridSize: 25,
        mineCount: 150,
        initialHints: 0, // No hints
        initialChances: 0, // No chances
        difficultyMultiplier: 5,
        timeBonusMultiplier: 2,
        penaltiesIgnored: false,
        totalTiles: 25 * 25,
        displayName: 'Extreme'
    },
};

export const GAME_MODES = [
    { value: 'normal', label: 'Normal Mode' },
    { value: 'noFlag', label: 'No Flag Mode' },
    { value: 'colorBlind', label: 'Color Blind Mode' },
    { value: 'tutorial', label: 'Tutorial Mode' },
];

export const TUTORIAL_CONFIG = {
    gridSize: 5,
    mineCount: 5,
    initialHints: 10, // Unlimited for tutorial purposes
    initialChances: 10, // Unlimited for tutorial purposes
    difficultyMultiplier: 1,
    // Define specific mine positions for tutorial predictability
    tutorialMinePositions: [
        { x: 0, y: 1 }, // Mine for flagging example
        { x: 4, y: 4 }, // Mine for chance example
        { x: 1, y: 4 }, // Other mines
        { x: 3, y: 0 },
        { x: 2, y: 4 },
    ]
};