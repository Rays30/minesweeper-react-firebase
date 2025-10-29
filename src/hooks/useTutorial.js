// src/hooks/useTutorial.js (CORRECTED - FINAL VERSION for this file)

import { useState, useEffect, useCallback } from 'react'; // <--- ADD useCallback here

// IMPORTANT: This 'tutorialSteps' array must be defined here,
// within the scope of the hook's definition,
// as it's passed as initial state to the hook.
const tutorialSteps = [
    {
        message: "Welcome to Minesweeper! Let's learn the basics. First, click on any grey tile to reveal it. Try clicking the highlighted tile.",
        highlightedTiles: [{ x: 2, y: 2 }],
        actionRequired: 'click_safe',
    },
    {
        message: "Great! That's a safe tile. If the number is 0 (empty), it means there are no mines next to it, and it will automatically clear surrounding safe tiles. If it's a number like this '1', it means there is 1 mine adjacent to it. Click the highlighted tile now.",
        highlightedTiles: [{ x: 0, y: 0 }],
        actionRequired: 'click_safe',
    },
    {
        message: "Perfect! Now you see a number. This tile has 1 mine as its neighbor. Can you find the adjacent mine? Right-click the suspected mine to flag it. (Note: Flagging is disabled in 'No Flag Mode'). Right-click the highlighted mine.",
        highlightedTiles: [{ x: 0, y: 1 }],
        actionRequired: 'flag_mine',
    },
    {
        message: "Excellent! You've successfully flagged a mine. This helps you remember where mines are so you don't click them by accident. Now, let's learn about hints. Click the 'Hint' button in the top bar to reveal a mine for you. (Hints are limited in harder modes).",
        actionRequired: 'use_hint',
        highlightedElement: 'hint-button', // Target the hint button ID
    },
    {
        message: "See? A mine was revealed! Hints are limited in harder modes, so use them wisely. Now, let's see what happens if you accidentally click a mine. We'll use a 'Chance' to survive. Click the highlighted mine.",
        highlightedTiles: [{ x: 4, y: 4 }], // Ensure this is a mine in the generated board for tutorial
        actionRequired: 'click_mine_chance', // Signifies that a chance will be used
    },
    {
        message: "You clicked a mine, but thanks to 'Chances', you survived! Chances are limited in harder modes, so use them wisely. The tile turns orange to show it was a mine you used a chance on. Now try to logically deduce a safe tile to click based on the numbers you see. Click any safe tile to continue.",
        actionRequired: 'click_safe', // Any safe click will do here
    },
    {
        message: "That's it! You've learned the basics of Minesweeper. You're ready to play! You can always come back to the tutorial if you need a refresher.",
        actionRequired: 'finish_tutorial', // No specific action, just a button click to end
    },
];

// This custom hook manages the state and logic for the tutorial progression.
const useTutorial = () => {
    const [tutorialState, setTutorialState] = useState({
        active: false,
        currentStepIndex: 0,
        steps: tutorialSteps, // Use the internal steps array
        lastActionSuccessful: false,
    });

    // Effect to automatically advance the tutorial to the next step
    useEffect(() => {
        if (tutorialState.active && tutorialState.lastActionSuccessful) {
            const timer = setTimeout(() => {
                if (tutorialState.currentStepIndex < tutorialState.steps.length - 1) {
                    setTutorialState(prev => ({
                        ...prev,
                        currentStepIndex: prev.currentStepIndex + 1,
                        lastActionSuccessful: false, // Reset for the next step
                    }));
                } else {
                    setTutorialState(prev => ({ ...prev, lastActionSuccessful: false }));
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [tutorialState.lastActionSuccessful, tutorialState.active, tutorialState.currentStepIndex, tutorialState.steps.length]);

    // <--- CRUCIAL FIX HERE: Wrap resetTutorial in useCallback
    const resetTutorial = useCallback(() => {
        setTutorialState({
            active: false,
            currentStepIndex: 0,
            steps: tutorialSteps, // Reset to initial steps
            lastActionSuccessful: false,
        });
    }, []); // Empty dependency array means this function reference will never change

    return { tutorialState, setTutorialState, resetTutorial };
};

export default useTutorial;