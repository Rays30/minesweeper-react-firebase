// src/components/Tutorial/Tutorial.js (ADJUSTED)

import React, { useState, useEffect, useCallback } from 'react';
import Game from '../Game/Game';
import styles from './Tutorial.module.css';
import { TUTORIAL_CONFIG } from '../../config';
import useTutorial from '../../hooks/useTutorial';

// ... (tutorialSteps array is in useTutorial.js) ...

function Tutorial({ onFinish, onBack, initialStatus }) {

    const { tutorialState, setTutorialState, resetTutorial } = useTutorial();

    const [showingInitialPrompt, setShowingInitialPrompt] = useState(true);

    useEffect(() => {
        setShowingInitialPrompt(true);
        resetTutorial();
    }, [initialStatus, resetTutorial]);

    const handleTutorialStartChoice = (isBeginner) => {
        setShowingInitialPrompt(false);

        if (isBeginner) {
            setTutorialState(prev => ({ ...prev, active: true, currentStepIndex: 0 }));
        } else {
            onFinish('skipped');
        }
    };

    const handleTutorialFinish = () => {
         onFinish('completed');
    }

    // Render the initial "Have you played before?" prompt
    if (showingInitialPrompt) {
        return (
            <div className={styles.tutorialPromptModal}>
                <h2>Have you played Minesweeper before?</h2>
                <div className={styles.promptButtons}>
                    <button onClick={() => handleTutorialStartChoice(false)}>Yes, I'm Experienced (Skip)</button>
                    <button onClick={() => handleTutorialStartChoice(true)}>No, I'm a Beginner (Start)</button>
                </div>
                {/* Keep this "Back to Menu" button here, allowing the user to exit before starting the tutorial. */}
                <button onClick={onBack} className={styles.backButton}>Back to Menu</button>
            </div>
        );
    }

    if (!tutorialState.active) {
        return null;
    }

    const currentStep = tutorialState.steps[tutorialState.currentStepIndex];

    const tutorialGameProps = {
        mode: 'tutorial',
        difficulty: 'easy',
        gridSize: TUTORIAL_CONFIG.gridSize,
        mineCount: TUTORIAL_CONFIG.mineCount,
        initialHints: TUTORIAL_CONFIG.initialHints,
        initialChances: TUTORIAL_CONFIG.initialChances,
        difficultyMultiplier: TUTORIAL_CONFIG.difficultyMultiplier,
        playerName: 'TutorialPlayer',
        onGameOver: () => { /* Prevent game over in tutorial */ },
        onGameWon: () => { /* Prevent game won in tutorial */ },
        tutorialState: tutorialState,
        setTutorialState: setTutorialState,
    };

    return (
        <div className={styles.tutorialContainer}>
            <div className={styles.tutorialMessage}>
                <p>{currentStep.message}</p>
                <div className={styles.tutorialControls}>
                    {currentStep.actionRequired === 'finish_tutorial' ? (
                        <button onClick={handleTutorialFinish} className={styles.finishButton}>
                            You are ready! 🎉 Go to Main Menu
                        </button>
                    ) : (
                        <span className={styles.instruction}>
                            {currentStep.actionRequired ? `Action Required: ${currentStep.actionRequired.replace(/_/g, ' ')}` : "Follow instructions to proceed..."}
                        </span>
                    )}
                </div>
            </div>

            <Game {...tutorialGameProps} />

            {/* REMOVED: This button will no longer be rendered during the interactive tutorial. */}
            {/* <button onClick={onBack} className={styles.backToMenuButton}>Back to Menu</button> */}
        </div>
    );
}

export default Tutorial;