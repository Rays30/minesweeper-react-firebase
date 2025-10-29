// src/components/Tile/Tile.js (ADJUSTED)

import React from 'react';
import styles from './Tile.module.css';

const Tile = ({ tile, onLeftClick, onRightClick, mode, tutorialState }) => {
    const { x, y, isRevealed, isFlagged, hasMine, mineCount, isHintedMine, isChanceUsedMine, isDarkPattern } = tile; // Destructure isDarkPattern

    const isTutorialActive = tutorialState.active;
    const currentStep = isTutorialActive ? tutorialState.steps[tutorialState.currentStepIndex] : {};
    const isHighlightedForAction = currentStep.highlightedTiles && currentStep.highlightedTiles.some(ht => ht.x === x && ht.y === y);
    const requiresSpecificAction = currentStep.actionRequired && currentStep.highlightedTiles;

    const handleClick = () => {
        if (isTutorialActive && requiresSpecificAction && !isHighlightedForAction) {
            return;
        }
        onLeftClick(x, y);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        if (isTutorialActive && requiresSpecificAction && !isHighlightedForAction) {
            return;
        }
        onRightClick(x, y);
    };

    let content = null;
    let className = styles.tile;

    // Add tutorial highlight class
    if (isTutorialActive && isHighlightedForAction) {
        className += ` ${styles.tutorialHighlight}`;
    }

    if (isRevealed) {
        className += ` ${styles.revealed}`;
        if (hasMine) {
            className += ` ${styles.mine}`;
            if (isChanceUsedMine || isHintedMine) {
                className += ` ${styles.mineUsedChance}`;
            } else {
                className += ` ${styles.mineExploded}`;
            }
            content = '💣';
        } else if (mineCount > 0) {
            className += ` ${styles[`number-${mineCount}`]}`;
            content = mineCount;
            if (mode === 'colorBlind') {
                switch(mineCount) {
                    case 1: content = '1 ▲'; break;
                    case 2: content = '2 ■'; break;
                    case 3: content = '3 ●'; break;
                    case 4: content = '4 ♦'; break;
                    case 5: content = '5 ★'; break;
                    case 6: content = '6 ⬡'; break;
                    case 7: content = '7 ✚'; break;
                    case 8: content = '8 ☰'; break;
                    default: break;
                }
            }
        }
    } else { // Apply checkerboard pattern only if not revealed
        className += ` ${isDarkPattern ? styles.darkPattern : styles.lightPattern}`;
        if (isFlagged) {
            className += ` ${styles.flagged}`;
            content = '🚩';
        } else if (isHintedMine) {
            className += ` ${styles.hintedMine}`;
            content = '🔍';
        }
    }

    return (
        <div
            className={className}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            data-value={isRevealed && !hasMine ? mineCount : ''}
        >
            {content}
        </div>
    );
};

export default Tile;