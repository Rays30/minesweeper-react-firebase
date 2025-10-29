import React, { useState, useEffect, useCallback } from 'react';
import styles from './Leaderboard.module.css';
import { getLeaderboardScores } from '../../api/firebase';
import { DIFFICULTY_SETTINGS, GAME_MODES } from '../../config';

function Leaderboard({ onBack }) {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMode, setSelectedMode] = useState('normal'); // Default to normal
    const [selectedDifficulty, setSelectedDifficulty] = useState('easy'); // Default to easy

    const fetchScores = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedScores = await getLeaderboardScores(selectedMode, selectedDifficulty);
            setScores(fetchedScores);
        } catch (err) {
            console.error('Failed to fetch scores:', err);
            setError('Failed to load leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedMode, selectedDifficulty]);

    useEffect(() => {
        fetchScores();
    }, [fetchScores]);

    return (
        <div className={styles.leaderboardContainer}>
            <h2>Leaderboard</h2>

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label htmlFor="mode-filter">Mode:</label>
                    <select
                        id="mode-filter"
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                        className={styles.select}
                    >
                        {GAME_MODES.filter(mode => mode.value !== 'tutorial').map((mode) => ( // Exclude tutorial from leaderboard modes
                            <option key={mode.value} value={mode.value}>
                                {mode.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="difficulty-filter">Difficulty:</label>
                    <select
                        id="difficulty-filter"
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

            {loading && <p>Loading scores...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && (
                <div className={styles.scoreTableWrapper}>
                    {scores.length > 0 ? (
                        <table className={styles.scoreTable}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Score</th>
                                    <th>Mode</th>
                                    <th>Difficulty</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores.map((score, index) => (
                                    <tr key={score.id}>
                                        <td>{index + 1}</td>
                                        <td>{score.playerName}</td>
                                        <td>{score.score}</td>
                                        <td>{GAME_MODES.find(m => m.value === score.mode)?.label || score.mode}</td>
                                        <td>{DIFFICULTY_SETTINGS[score.difficulty]?.displayName || score.difficulty}</td>
                                        <td>{score.timestamp?.toDate().toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No scores found for this selection yet.</p>
                    )}
                </div>
            )}

            <button onClick={onBack} className={styles.backButton}>Back to Menu</button>
        </div>
    );
}

export default Leaderboard;