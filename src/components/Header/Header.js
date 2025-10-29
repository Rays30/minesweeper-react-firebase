// src/components/Header/Header.js (ADJUSTED)

import React from 'react';
import styles from './Header.module.css';

function Header({ minesLeft, timer, hintsRemaining, chancesRemaining, useHint, mode, difficulty, tutorialState = {}, onQuitGame }) { // Added onQuitGame prop
    const isTutorialActive = tutorialState.active;
    const currentStep = isTutorialActive ? tutorialState.steps[tutorialState.currentStepIndex] : {};
    const isHintButtonHighlighted = isTutorialActive && currentStep.highlightedElement === 'hint-button';

    return (
        <div className={styles.header}>
            <div className={styles.infoBlock}>
                Mines Left: <span className={styles.value}>{minesLeft}</span>
            </div>
            <div className={styles.infoBlock}>
                Timer: <span className={styles.value}>{timer}s</span>
            </div>
            {(mode !== 'extreme' && mode !== 'tutorial') && (
                <>
                    <div className={styles.infoBlock}>
                        Hints: <span className={styles.value}>{hintsRemaining}</span>
                        <button
                            onClick={useHint}
                            disabled={hintsRemaining === 0}
                            className={styles.headerButton}
                            id="hint-button"
                        >
                            Hint
                        </button>
                    </div>
                    <div className={styles.infoBlock}>
                        Chances: <span className={styles.value}>{chancesRemaining}</span>
                    </div>
                </>
            )}
            {mode === 'tutorial' && (
                <div className={styles.infoBlock}>
                    Hints: <span className={styles.value}>{hintsRemaining}</span>
                    <button
                        onClick={useHint}
                        // Only enable hint button in tutorial if it's the specific step
                        disabled={hintsRemaining === 0 || !isHintButtonHighlighted}
                        className={`${styles.headerButton} ${isHintButtonHighlighted ? styles.highlightedButton : ''}`}
                        id="hint-button"
                    >
                        Hint
                    </button>
                </div>
            )}

            {/* NEW: Quit Game Button */}
            {mode !== 'tutorial' && ( // Don't show quit in tutorial, use tutorial's own back button
                 <button onClick={onQuitGame} className={styles.quitButton}>
                    Quit Game
                </button>
            )}
        </div>
    );
}

export default Header;