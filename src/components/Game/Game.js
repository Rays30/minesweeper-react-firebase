// src/components/Game/Game.js (ADJUSTED)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from '../Board/Board';
import Header from '../Header/Header';
import Modal from '../Modal/Modal';
import { addScore } from '../../api/firebase';
import {
    initializeBoard,
    revealTile,
    flagTile,
    checkWinCondition, // This will now use the updated logic from utils.js
    placeMinesSafely,
    calculateScore,
    generateTutorialBoard,
} from '../../utils';
import styles from './Game.module.css';
import { DIFFICULTY_SETTINGS, TUTORIAL_CONFIG } from '../../config';

function Game({
    mode,
    difficulty,
    gridSize,
    mineCount,
    initialHints,
    initialChances,
    difficultyMultiplier,
    playerName,
    onGameEnd,
    tutorialState = {},
    setTutorialState = () => {},
}) {
    const [board, setBoard] = useState([]);
    const [minesLeft, setMinesLeft] = useState(mineCount); // This is the counter we adjust
    const [timer, setTimer] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [firstClick, setFirstClick] = useState(true);
    const [hintsRemaining, setHintsRemaining] = useState(initialHints);
    const [chancesRemaining, setChancesRemaining] = useState(initialChances);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [chancesUsed, setChancesUsed] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [clearedTilesCount, setClearedTilesCount] = useState(0);
    const revealedTilesCache = useRef(new Set());

    const scoreSavedForCurrentGame = useRef(false); // For Strict Mode duplicate prevention

    // const totalTilesInGrid = gridSize * gridSize; // Only used for debug logs now

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertModalTitle, setAlertModalTitle] = useState('');
    const [alertModalMessage, setAlertModalMessage] = useState('');

    const timerIntervalRef = useRef(null);
    const isTutorialMode = mode === 'tutorial';

    const showInfoModal = useCallback((title, message) => {
        setAlertModalTitle(title);
        setAlertModalMessage(message);
        setShowAlertModal(true);
    }, []);

    const hideInfoModal = useCallback(() => {
        setShowAlertModal(false);
        setAlertModalTitle('');
        setAlertModalMessage('');
    }, []);


    const resetGame = useCallback(() => {
        const newBoard = isTutorialMode
            ? generateTutorialBoard(TUTORIAL_CONFIG.gridSize, TUTORIAL_CONFIG.mineCount)
            : initializeBoard(gridSize, gridSize);

        setBoard(newBoard);
        setMinesLeft(mineCount); // Reset minesLeft to initial mineCount
        setTimer(0);
        setGameOver(false);
        setGameWon(false);
        setFirstClick(true);
        setHintsRemaining(initialHints);
        setChancesRemaining(initialChances);
        setHintsUsed(0);
        setChancesUsed(0);
        setFinalScore(0);
        setClearedTilesCount(0);
        revealedTilesCache.current.clear();
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        hideInfoModal();
        scoreSavedForCurrentGame.current = false; // Reset the flag for a new game
    }, [gridSize, mineCount, initialHints, initialChances, isTutorialMode, hideInfoModal]);

    useEffect(() => {
        resetGame();
    }, [mode, difficulty, resetGame]);

    useEffect(() => {
        if (!firstClick && !gameOver && !gameWon) {
            if (!timerIntervalRef.current) {
                timerIntervalRef.current = setInterval(() => {
                    setTimer((prev) => prev + 1);
                }, 1000);
            }
        } else if ((gameOver || gameWon) && timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [firstClick, gameOver, gameWon]);

    const handleGameEnd = useCallback(
        (won) => {
            if (won && !isTutorialMode && scoreSavedForCurrentGame.current) {
                console.log("Score already saved for this game, preventing duplicate in StrictMode.");
                return;
            }

            setGameOver(true);
            setGameWon(won);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }

            if (!won) {
                setBoard((prevBoard) =>
                    prevBoard.map((row) =>
                        row.map((tile) => {
                            if (tile.hasMine && !tile.isFlagged && !tile.isRevealed) {
                                return { ...tile, isRevealed: true };
                            }
                            return tile;
                        })
                    )
                );
            }

            const currentScore = calculateScore(
                clearedTilesCount,
                difficultyMultiplier,
                initialHints,
                initialChances,
                hintsUsed,
                chancesUsed,
                timer,
                won,
                difficulty
            );
            setFinalScore(currentScore);

            if (won && !isTutorialMode) {
                addScore({
                    playerName: playerName || 'Anonymous',
                    score: currentScore,
                    mode,
                    difficulty,
                    timestamp: new Date(),
                });
                scoreSavedForCurrentGame.current = true; // Mark as saved for this game instance
            }
        },
        [
            clearedTilesCount,
            difficultyMultiplier,
            initialHints,
            initialChances,
            hintsUsed,
            chancesUsed,
            timer,
            difficulty,
            isTutorialMode,
            playerName,
            mode,
        ]
    );

    const handleGameEndModalClose = useCallback(() => {
        setGameOver(false);
        setGameWon(false);
        onGameEnd(); // Signal to App.js to go back to menu
    }, [onGameEnd]);

    const handleQuitGame = useCallback(() => {
        if (isTutorialMode && tutorialState.active) {
            showInfoModal(
                "Cannot Quit Tutorial",
                "Please complete the current tutorial step or use the 'Back to Menu' button from the tutorial controls."
            );
            return;
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        onGameEnd();
    }, [onGameEnd, isTutorialMode, tutorialState, showInfoModal]);

    const handleLeftClick = useCallback(
        (rowIdx, colIdx) => {
            if (gameOver || gameWon || showAlertModal) return;

            let currentBoard = [...board];
            let clickedTile = currentBoard[rowIdx][colIdx];

            if (clickedTile.isFlagged || clickedTile.isRevealed) return;

            // --- Tutorial Mode Specific Logic ---
            if (isTutorialMode && tutorialState.active) {
                const step = tutorialState.steps[tutorialState.currentStepIndex];
                if (step.highlightedTiles && !step.highlightedTiles.some((ht) => ht.x === rowIdx && ht.y === colIdx)) {
                    showInfoModal("Follow Tutorial!", "Please click the highlighted tile as indicated by the tutorial.");
                    return;
                }

                if (step.actionRequired === 'click_safe') {
                    if (clickedTile.hasMine) {
                        showInfoModal("Oops!", "Please click a safe tile as indicated by the tutorial!");
                        return;
                    }
                    const revealResult = revealTile(currentBoard, rowIdx, colIdx, gridSize, gridSize);
                    currentBoard = revealResult.board;
                    revealResult.revealedCoords.forEach(coord => revealedTilesCache.current.add(coord));
                    setClearedTilesCount(prev => prev + revealResult.newlyRevealedCount);
                    setTutorialState(prev => ({ ...prev, lastActionSuccessful: true }));
                    setBoard(currentBoard);
                    return;
                } else if (step.actionRequired === 'click_mine_safe') {
                    if (!clickedTile.hasMine) {
                        showInfoModal("Wrong Tile!", "Please click the mine tile as indicated by the tutorial!");
                        return;
                    }
                    clickedTile.isRevealed = true;
                    clickedTile.isChanceUsedMine = true;
                    setBoard(currentBoard);
                    setMinesLeft(prev => prev - 1); // Mine revealed in tutorial, decrement minesLeft
                    setTutorialState(prev => ({ ...prev, lastActionSuccessful: true }));
                    return;
                } else if (step.actionRequired === 'click_mine_chance') {
                    if (!clickedTile.hasMine) {
                        showInfoModal("Wrong Tile!", "Please click the mine tile as indicated by the tutorial!");
                        return;
                    }
                    setChancesRemaining(prev => prev - 1);
                    setChancesUsed(prev => prev + 1);
                    clickedTile.isRevealed = true;
                    clickedTile.isChanceUsedMine = true;
                    setBoard(currentBoard);
                    setMinesLeft(prev => prev - 1); // Mine revealed via chance, decrement minesLeft
                    showInfoModal("Chance Used!", "You stepped on a mine but survived thanks to a chance!");
                    setTutorialState(prev => ({ ...prev, lastActionSuccessful: true }));
                    return;
                }
                return;
            }
            // --- End Tutorial Logic ---

            // First click logic for non-tutorial modes
            if (firstClick) {
                currentBoard = placeMinesSafely(currentBoard, mineCount, rowIdx, colIdx, gridSize);
                setFirstClick(false);
            }

            // Game logic for regular play
            if (clickedTile.hasMine) {
                if (chancesRemaining > 0) {
                    setChancesRemaining((prev) => prev - 1);
                    setChancesUsed((prev) => prev + 1);
                    clickedTile.isRevealed = true;
                    clickedTile.isChanceUsedMine = true;
                    setMinesLeft(prev => prev - 1); // Mine revealed via chance, decrement minesLeft
                    showInfoModal("Chance Used!", "You stepped on a mine but survived thanks to a chance!");
                } else {
                    clickedTile.isRevealed = true;
                    setBoard(currentBoard);
                    handleGameEnd(false); // Game Over (lost)
                    return;
                }
            } else {
                const revealResult = revealTile(currentBoard, rowIdx, colIdx, gridSize, gridSize);
                currentBoard = revealResult.board;
                revealResult.revealedCoords.forEach(coord => revealedTilesCache.current.add(coord));
                setClearedTilesCount(prev => prev + revealResult.newlyRevealedCount);
            }

            setBoard(currentBoard);

            // Check for win condition after every successful click/reveal.
            if (checkWinCondition(currentBoard, mineCount, gridSize)) {
                handleGameEnd(true); // Game Won!
            }
        },
        [
            board,
            firstClick,
            gameOver,
            gameWon,
            mineCount,
            chancesRemaining,
            chancesUsed,
            gridSize,
            handleGameEnd,
            isTutorialMode,
            tutorialState,
            setTutorialState,
            revealedTilesCache,
            showInfoModal,
            showAlertModal,
            // minesLeft is set via its setter, no need to add to deps here
        ]
    );

    const handleRightClick = useCallback(
        (rowIdx, colIdx) => {
            if (gameOver || gameWon || mode === 'noFlag' || showAlertModal) return;

            let currentBoard = [...board];
            const clickedTile = currentBoard[rowIdx][colIdx];

            if (clickedTile.isRevealed) return;

            // --- Tutorial Mode Specific Logic ---
            if (isTutorialMode && tutorialState.active) {
                const step = tutorialState.steps[tutorialState.currentStepIndex];
                if (step.highlightedTiles && !step.highlightedTiles.some((ht) => ht.x === rowIdx && ht.y === colIdx)) {
                    showInfoModal("Follow Tutorial!", "Please right-click the highlighted tile as indicated by the tutorial!");
                    return;
                }
                if (step.actionRequired === 'flag_mine') {
                    if (!clickedTile.hasMine) {
                        showInfoModal("Wrong Tile!", "Please flag the mine tile as indicated by the tutorial!");
                        return;
                    }
                    clickedTile.isFlagged = !clickedTile.isFlagged;
                    setMinesLeft((prev) => (clickedTile.isFlagged ? prev - 1 : prev + 1)); // Decrement/Increment on flag
                    setBoard(currentBoard);
                    setTutorialState(prev => ({ ...prev, lastActionSuccessful: true }));
                    return;
                }
                return;
            }
            // --- End Tutorial Logic ---

            clickedTile.isFlagged = !clickedTile.isFlagged;
            setMinesLeft((prev) => (clickedTile.isFlagged ? prev - 1 : prev + 1)); // Decrement/Increment on flag
            setBoard(currentBoard);
        },
        [gameOver, gameWon, board, mode, isTutorialMode, tutorialState, setTutorialState, showInfoModal, showAlertModal]
    );

    const useHint = useCallback(() => {
        if (gameOver || gameWon || hintsRemaining === 0 || showAlertModal) return;

        // --- Tutorial Mode Specific Logic ---
        if (isTutorialMode && tutorialState.active) {
            const step = tutorialState.steps[tutorialState.currentStepIndex];
            if (step.actionRequired !== 'use_hint') {
                showInfoModal("Follow Tutorial!", "Please follow the tutorial instructions for using a hint!");
                return;
            }
        }
        // --- End Tutorial Logic ---

        const unrevealedMineTiles = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const tile = board[r][c];
                // Only consider non-revealed, non-flagged, non-hinted mines for hints
                if (!tile.isRevealed && tile.hasMine && !tile.isFlagged && !tile.isHintedMine) {
                    unrevealedMineTiles.push(tile);
                }
            }
        }

        if (unrevealedMineTiles.length > 0) {
            const hintTile = unrevealedMineTiles[Math.floor(Math.random() * unrevealedMineTiles.length)];
            setBoard((prevBoard) =>
                prevBoard.map((row) =>
                    row.map((tile) =>
                        tile.x === hintTile.x && tile.y === hintTile.y
                            ? { ...tile, isHintedMine: true }
                            : tile
                    )
                )
            );
            setHintsRemaining((prev) => prev - 1);
            setHintsUsed((prev) => prev + 1);
            // REMOVED: setMinesLeft(prev => prev - 1); - A hint is temporary and doesn't permanently handle a mine.

            if (isTutorialMode && tutorialState.active && tutorialState.steps[tutorialState.currentStepIndex].actionRequired === 'use_hint') {
                setTutorialState(prev => ({ ...prev, lastActionSuccessful: true }));
            }

            // After a short delay, remove the hint visual
            setTimeout(() => {
                setBoard((prevBoard) =>
                    prevBoard.map((row) =>
                        row.map((tile) =>
                            tile.x === hintTile.x && tile.y === hintTile.y
                                ? { ...tile, isHintedMine: false }
                                : tile
                        )
                    )
                );
                // After hint fades, if the win condition applies, it should still register.
                // The win condition now relies only on permanent states (flagged or chance-used).
            }, 1500);
        } else {
            showInfoModal("No Hints Available", "There are no unrevealed, unflagged mines left to hint!");
        }
    }, [gameOver, gameWon, hintsRemaining, board, gridSize, isTutorialMode, tutorialState, setTutorialState, showInfoModal, showAlertModal]);

    return (
        <div className={styles.gameContainer}>
            <Header
                minesLeft={minesLeft}
                timer={timer}
                hintsRemaining={hintsRemaining}
                chancesRemaining={chancesRemaining}
                useHint={useHint}
                mode={mode}
                difficulty={difficulty}
                tutorialState={tutorialState}
                onQuitGame={handleQuitGame}
            />
            <Board
                board={board}
                onLeftClick={handleLeftClick}
                onRightClick={handleRightClick}
                mode={mode}
                tutorialState={tutorialState}
            />

            {(gameOver || gameWon) && (
                <Modal
                    title={gameWon ? 'Congratulations!' : 'Game Over!'}
                    message={gameWon ? 'You cleared the minefield!' : 'You hit a mine!'}
                    score={finalScore}
                    onClose={handleGameEndModalClose}
                    showScore={!isTutorialMode}
                />
            )}

            {showAlertModal && (
                <Modal
                    title={alertModalTitle}
                    message={alertModalMessage}
                    onClose={hideInfoModal}
                    showScore={false}
                />
            )}
        </div>
    );
}

export default Game;