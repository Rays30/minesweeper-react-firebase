// src/App.js (ADJUSTED)

import React, { useState, useEffect } from 'react';
import Menu from './components/Menu/Menu';
import Game from './components/Game/Game';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Tutorial from './components/Tutorial/Tutorial';
import Registration from './components/Registration/Registration';
import Settings from './components/Settings/Settings';
import './App.css';
import { DIFFICULTY_SETTINGS } from './config';

function App() {
    const [currentScreen, setCurrentScreen] = useState('loading');
    const [gameMode, setGameMode] = useState('normal');
    const [difficulty, setDifficulty] = useState('easy');
    const [playerName, setPlayerName] = useState('');
    const [tutorialStatus, setTutorialStatus] = useState(null); // 'completed', 'skipped', null

    useEffect(() => {
        const storedName = localStorage.getItem('minesweeperPlayerName');
        const storedTutorial = localStorage.getItem('minesweeperTutorialStatus');

        if (storedName) {
            setPlayerName(storedName);
            setTutorialStatus(storedTutorial || null);

            if (storedTutorial === 'completed' || storedTutorial === 'skipped') {
                setCurrentScreen('menu');
            } else {
                setCurrentScreen('tutorial_prompt');
            }
        } else {
            setCurrentScreen('registration');
        }
    }, []);

    const handleRegistrationSubmit = (name) => {
        setPlayerName(name);
        localStorage.setItem('minesweeperPlayerName', name);
        setCurrentScreen('tutorial_prompt');
    };

    const handleTutorialFinish = (status) => {
        setTutorialStatus(status);
        localStorage.setItem('minesweeperTutorialStatus', status);
        setCurrentScreen('menu');
    };

    const handleStartGame = (mode, diff) => {
        setGameMode(mode);
        setDifficulty(diff);
        setCurrentScreen('game');
    };

    const handleBackToMenu = () => {
        setCurrentScreen('menu');
    };

    const handleViewSettings = () => {
        setCurrentScreen('settings');
    };

    const handleResetPlayerName = () => {
        localStorage.removeItem('minesweeperPlayerName');
        localStorage.removeItem('minesweeperTutorialStatus');
        setPlayerName('');
        setTutorialStatus(null);
        setCurrentScreen('registration');
    }

    const handleResetTutorial = () => {
         localStorage.removeItem('minesweeperTutorialStatus');
         setTutorialStatus(null);
         setCurrentScreen('tutorial_prompt');
    }

    const renderScreen = () => {
        switch (currentScreen) {
            case 'loading':
                return <div>Loading...</div>;
            case 'registration':
                return <Registration onNameSubmit={handleRegistrationSubmit} />;
            case 'tutorial_prompt':
            case 'tutorial_game':
                return (
                    <Tutorial
                        initialStatus={tutorialStatus}
                        onFinish={handleTutorialFinish}
                        onBack={handleBackToMenu}
                    />
                );
            case 'menu':
                return (
                    <Menu
                        onStartGame={handleStartGame}
                        onViewLeaderboard={() => setCurrentScreen('leaderboard')}
                        onViewSettings={handleViewSettings}
                        onReplayTutorial={() => setCurrentScreen('tutorial_prompt')}
                    />
                );
            case 'game':
                const gameConfig = DIFFICULTY_SETTINGS[difficulty];
                return (
                    <Game
                        mode={gameMode}
                        difficulty={difficulty}
                        gridSize={gameConfig.gridSize}
                        mineCount={gameConfig.mineCount}
                        initialHints={gameConfig.initialHints}
                        initialChances={gameConfig.initialChances}
                        difficultyMultiplier={gameConfig.difficultyMultiplier}
                        playerName={playerName}
                        // This onGameEnd is called by Game component when modal is closed OR quit button is pressed
                        onGameEnd={handleBackToMenu}
                    />
                );
            case 'leaderboard':
                return <Leaderboard onBack={handleBackToMenu} />;
            case 'settings':
                return (
                    <Settings
                        onBack={handleBackToMenu}
                        onResetName={handleResetPlayerName}
                        onResetTutorial={handleResetTutorial}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={`App ${gameMode === 'colorBlind' ? 'color-blind-mode' : ''}`}>
            <h1>Minesweeper</h1>
            {currentScreen !== 'registration' && currentScreen !== 'loading' && (
                <p>Welcome, {playerName || 'Player'}!</p>
            )}
            {renderScreen()}
        </div>
    );
}

export default App;