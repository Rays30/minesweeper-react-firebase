// src/components/Menu/Menu.js (ADJUSTED)

import React, { useState } from 'react';
import styles from './Menu.module.css';
import { GAME_MODES, DIFFICULTY_SETTINGS } from '../../config';

function Menu({ onStartGame, onViewLeaderboard, onViewSettings, onReplayTutorial }) { // Added new props
    const [selectedMode, setSelectedMode] = useState('normal');
    const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

    const handleStartClick = () => {
        onStartGame(selectedMode, selectedDifficulty);
    };

    return (
        <div className={styles.menuContainer}>
            <div className={styles.selectionArea}>
                {/* Mode Selection */}
                <div className={styles.optionGroup}>
                    <label htmlFor="mode-select">Game Mode:</label>
                    <select
                        id="mode-select"
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                        className={styles.select}
                    >
                        {GAME_MODES.filter(m => m.value !== 'tutorial').map((mode) => ( // Exclude tutorial from standard play menu
                            <option key={mode.value} value={mode.value}>
                                {mode.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Difficulty Selection */}
                <div className={styles.optionGroup}>
                    <label htmlFor="difficulty-select">Difficulty:</label>
                    <select
                        id="difficulty-select"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className={styles.select}
                    >
                        {Object.keys(DIFFICULTY_SETTINGS).map((key) => (
                            <option key={key} value={key}>
                                {DIFFICULTY_SETTINGS[key].displayName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.buttons}>
                <button onClick={handleStartClick} className={styles.button}>
                    Play Minesweeper
                </button>
                <button onClick={onViewLeaderboard} className={styles.button}>
                    Leaderboard / High Scores
                </button>
                <button onClick={onReplayTutorial} className={styles.button}>
                    Tutorial (Replay)
                </button>
                <button onClick={onViewSettings} className={styles.button}>
                    Settings
                </button>
            </div>
        </div>
    );
}

export default Menu;