
import React from 'react';
import Tile from '../Tile/Tile';
import styles from './Board.module.css';

function Board({ board, onLeftClick, onRightClick, mode, tutorialState }) {
    const gridSize = board.length;

    return (
        <div
            className={styles.board}
            style={{
                gridTemplateColumns: `repeat(${gridSize}, var(--tile-size))`,
                gridTemplateRows: `repeat(${gridSize}, var(--tile-size))`
            }}
        >
            {board.map((row, rIdx) =>
                row.map((tile, cIdx) => (
                    <Tile
                        key={tile.id}
                        tile={tile}
                        onLeftClick={onLeftClick}
                        onRightClick={onRightClick}
                        mode={mode}
                        tutorialState={tutorialState}
                    />
                ))
            )}
        </div>
    );
}

export default Board;