import { DIFFICULTY_SETTINGS, TUTORIAL_CONFIG } from './config';

/**
 * Initializes a new board with specified dimensions.
 * Mines are NOT placed yet, to ensure first click safety.
 * Adds 'isDarkPattern' property for checkerboard styling.
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {Array<Array<Object>>} Initialized board grid.
 */
export const initializeBoard = (rows, cols) => {
    const board = Array(rows)
        .fill(0)
        .map((_, r) =>
            Array(cols)
                .fill(0)
                .map((__, c) => ({
                    x: r,
                    y: c,
                    isRevealed: false,
                    isFlagged: false,
                    hasMine: false,
                    mineCount: 0,
                    id: `${r}-${c}`,
                    isHintedMine: false,
                    isChanceUsedMine: false, // For tiles where a chance was used
                    isDarkPattern: (r + c) % 2 === 0, // Determines dark or light square for checkerboard
                }))
        );
    return board;
};

/**
 * Places mines randomly on the board, ensuring the first clicked tile and its immediate neighbors are safe.
 * Also calculates adjacent mine counts. Preserves the `isDarkPattern` property.
 *
 * @param {Array<Array<Object>>} board - The initial empty board.
 * @param {number} mineCount - Number of mines to place.
 * @param {number} firstClickX - X coordinate of the first clicked tile.
 * @param {number} firstClickY - Y coordinate of the first clicked tile.
 * @param {number} gridSize - Size of the grid (rows/cols).
 * @returns {Array<Array<Object>>} Board with mines placed and counts calculated.
 */
export const placeMinesSafely = (board, mineCount, firstClickX, firstClickY, gridSize) => {
    const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy to preserve isDarkPattern etc.
    const safeZone = new Set(); // Coords to avoid placing mines (first click and its neighbors)

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const nx = firstClickX + dx;
            const ny = firstClickY + dy;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                safeZone.add(`${nx}-${ny}`);
            }
        }
    }

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const r = Math.floor(Math.random() * gridSize);
        const c = Math.floor(Math.random() * gridSize);
        if (!newBoard[r][c].hasMine && !safeZone.has(`${r}-${c}`)) {
            newBoard[r][c].hasMine = true;
            minesPlaced++;
        }
    }

    // Calculate mine counts for each non-mine tile
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (!newBoard[r][c].hasMine) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue; // Skip the current tile itself
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && newBoard[nr][nc].hasMine) {
                            count++;
                        }
                    }
                }
                newBoard[r][c].mineCount = count;
            }
        }
    }
    return newBoard;
};

/**
 * Reveals a tile and performs flood-fill if it's an empty tile (mineCount === 0).
 *
 * @param {Array<Array<Object>>} board - The current board.
 * @param {number} r - Row index of the clicked tile.
 * @param {number} c - Column index of the clicked tile.
 * @param {number} rows - Total number of rows.
 * @param {number} cols - Total number of columns.
 * @returns {{board: Array<Array<Object>>, newlyRevealedCount: number, revealedCoords: string[]}} Updated board, count of newly revealed tiles, and their coordinates.
 */
export const revealTile = (board, r, c, rows, cols) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    const stack = [{ r, c }];
    let newlyRevealedCount = 0;
    const revealedCoords = [];

    while (stack.length > 0) {
        const { r: currentR, c: currentC } = stack.pop();
        const tile = newBoard[currentR][currentC];

        // Skip if already revealed, flagged, or is a mine (unless it's the initial mine click handled by game logic)
        if (tile.isRevealed || tile.isFlagged || tile.hasMine) {
            continue;
        }

        tile.isRevealed = true;
        newlyRevealedCount++;
        revealedCoords.push(`${currentR}-${currentC}`);

        // If it's an empty tile (0 mines nearby), reveal its neighbors
        if (tile.mineCount === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue; // Skip the current tile itself
                    const nr = currentR + dr;
                    const nc = currentC + dc;

                    // Check bounds
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        const neighbor = newBoard[nr][nc];
                        // Add to stack only if not revealed, not flagged, and not a mine
                        if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.hasMine) {
                            stack.push({ r: nr, c: nc });
                        }
                    }
                }
            }
        }
    }
    return { board: newBoard, newlyRevealedCount, revealedCoords };
};


/**
 * Toggles the flag status of a tile.
 *
 * @param {Array<Array<Object>>} board - The current board.
 * @param {number} r - Row index of the tile.
 * @param {number} c - Column index of the tile.
 * @returns {Array<Array<Object>>} Updated board.
 */
export const flagTile = (board, r, c) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    const tile = newBoard[r][c];
    if (!tile.isRevealed) { // Can only flag unrevealed tiles
        tile.isFlagged = !tile.isFlagged;
    }
    return newBoard;
};

/**
 * Checks if the game has been won based on the revised logic, now considering game mode.
 *
 * For 'normal' mode:
 * 1. All safe (non-mine) tiles have been revealed.
 * 2. All mine tiles are either flagged or have been revealed by using a chance.
 *
 * For 'noFlag' mode:
 * 1. Only all safe (non-mine) tiles need to be revealed. Mines do not need to be explicitly handled.
 *
 * For 'colorBlind' mode: (behaves like 'normal' mode in terms of win logic)
 * 1. All safe (non-mine) tiles have been revealed.
 * 2. All mine tiles are either flagged or have been revealed by using a chance.
 *
/**
 * Checks if the game has been won based on the classic Minesweeper win logic.
 * A game is won if all safe (non-mine) tiles have been revealed.
 * This implicitly means all unrevealed tiles must be mines.
 *
 * @param {Array<Array<Object>>} board - The current board state.
 * @param {number} mineCount - Total number of mines for the game.
 * @param {number} gridSize - The size of the grid (rows or columns).
 * @param {string} gameMode - The current game mode ('normal', 'noFlag', 'colorBlind').
 * @returns {boolean} True if the game is won, false otherwise.
 */
export const checkWinCondition = (board, mineCount, gridSize, gameMode) => {
    let revealedSafeTilesCount = 0;
    const totalTilesInGrid = gridSize * gridSize;
    const totalSafeTiles = totalTilesInGrid - mineCount;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const tile = board[r][c];
            if (tile.isRevealed && !tile.hasMine) {
                revealedSafeTilesCount++;
            }
            // IMPORTANT: If a mine was revealed by a chance, it's still a mine.
            // It doesn't contribute to 'revealedSafeTilesCount'.
            // The logic now is simply: have all non-mines been revealed?
        }
    }

    // This is the core classic win condition:
    // If the number of revealed safe tiles equals the total number of safe tiles, the game is won.
    // This implies that any remaining unrevealed tiles *must* be mines.
    const hasWon = (revealedSafeTilesCount === totalSafeTiles);

    // DEBUGGING CONSOLE LOGS (REMOVE FOR PRODUCTION)
    console.log("--- WIN CONDITION DEBUG (checkWinCondition function) ---");
    console.log("Current Mode:", gameMode);
    console.log("Revealed Safe Tiles:", revealedSafeTilesCount);
    console.log("Total Safe Tiles Needed:", totalSafeTiles);
    console.log("Win Condition Met:", hasWon);
    console.log("--- END WIN CONDITION DEBUG ---");


    return hasWon;
};
/**
 * Calculates the final score.
 * Score = ((ClearedTiles × 10) × DifficultyMultiplier)
 *         + (UnusedHints × 5)
 *         + (UnusedChances × 10)
 *         - (HintsUsed × 5)
 *         - (ChancesUsed × 10)
 *         + TimeBonus
 *
 * TimeBonus: Linear, faster completion -> higher bonus.
 * TimeBonus = max(0, (MaxTime - TimeTaken) * TimeBonusMultiplier)
 * MaxTime is proportional to grid size to allow more time for harder difficulties.
 *
 * @param {number} clearedTiles - Number of safe tiles revealed.
 * @param {number} difficultyMultiplier - Multiplier from difficulty settings.
 * @param {number} initialHints - Initial hints provided for the difficulty.
 * @param {number} initialChances - Initial chances provided for the difficulty.
 * @param {number} hintsUsed - Number of hints used.
 * @param {number} chancesUsed - Number of chances used.
 * @param {number} timeTaken - Time taken in seconds.
 * @param {boolean} gameWon - True if the game was won, false otherwise.
 * @param {string} difficultyKey - The difficulty string ('easy', 'medium', etc.) to get settings.
 * @returns {number} The calculated score.
 */
export const calculateScore = (
    clearedTiles,
    difficultyMultiplier,
    initialHints,
    initialChances,
    hintsUsed,
    chancesUsed,
    timeTaken,
    gameWon,
    difficultyKey
) => {
    if (!gameWon) return 0; // No score if game is lost

    const settings = DIFFICULTY_SETTINGS[difficultyKey];
    if (!settings) {
        console.warn(`Settings not found for difficulty: ${difficultyKey}. Returning score 0.`);
        return 0;
    }

    // 1. Base Score
    const baseScore = clearedTiles * 10 * difficultyMultiplier;

    // 2. Bonus/Penalty Calculation
    let bonusPenalty = 0;

    if (settings.penaltiesIgnored) { // True for Easy mode
        bonusPenalty = 0; // Hints/Chances usage/non-usage has no effect on score
    } else { // Medium, Hard, Extreme (though Extreme has 0 initial hints/chances)
        // Unused Bonuses:
        const unusedHints = Math.max(0, initialHints - hintsUsed);
        const unusedChances = Math.max(0, initialChances - chancesUsed);

        bonusPenalty += unusedHints * 5;     // Unused bonus
        bonusPenalty += unusedChances * 10;  // Unused bonus

        // Used Penalties:
        bonusPenalty -= hintsUsed * 5;       // Used penalty
        bonusPenalty -= chancesUsed * 10;    // Used penalty
    }

    // 3. Time Bonus
    const maxTimeForBonus = settings.gridSize * 5; // Example: Larger grid, more time allowed for bonus
    const timeBonus = Math.max(0, (maxTimeForBonus - timeTaken) * settings.timeBonusMultiplier);

    let finalScore = baseScore + bonusPenalty + timeBonus;

    // Ensure score doesn't go negative and is rounded
    return Math.max(0, Math.round(finalScore));
};

/**
 * Generates a predictable board for the tutorial mode.
 * Mines are placed at specific `TUTORIAL_CONFIG.tutorialMinePositions`.
 * Adds 'isDarkPattern' property for checkerboard styling.
 *
 * @param {number} gridSize - The size of the grid.
 * @param {number} mineCount - The number of mines.
 * @returns {Array<Array<Object>>} A board with mines and counts.
 */
export const generateTutorialBoard = (gridSize, mineCount) => {
    let board = Array(gridSize)
        .fill(0)
        .map((_, r) =>
            Array(gridSize)
                .fill(0)
                .map((__, c) => ({
                    x: r,
                    y: c,
                    isRevealed: false,
                    isFlagged: false,
                    hasMine: false,
                    mineCount: 0,
                    id: `${r}-${c}`,
                    isHintedMine: false,
                    isChanceUsedMine: false,
                    isDarkPattern: (r + c) % 2 === 0, // Add this for tutorial board
                }))
        );

    // Place mines at predefined positions
    TUTORIAL_CONFIG.tutorialMinePositions.forEach(pos => {
        if (board[pos.x] && board[pos.x][pos.y]) {
            board[pos.x][pos.y].hasMine = true;
        }
    });

    // Calculate mine counts for safe tiles
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (!board[r][c].hasMine) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && board[nr][nc].hasMine) {
                            count++;
                        }
                    }
                }
                board[r][c].mineCount = count;
            }
        }
    }
    return board;
};