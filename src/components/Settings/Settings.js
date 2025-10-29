// src/components/Settings/Settings.js
import React from 'react';
import styles from './Settings.module.css';

function Settings({ onBack, onResetName, onResetTutorial }) {
    // UI placeholder for sound/UI settings (not implemented in logic but shown here)
    const handleSoundToggle = () => { alert("Sound toggle functionality placeholder."); };
    const handleUIToggle = () => { alert("UI theme change functionality placeholder."); };

    return (
        <div className={styles.settingsContainer}>
            <h2>Game Settings</h2>

            <div className={styles.settingBlock}>
                <h3>Accessibility & UI</h3>
                <div className={styles.settingItem}>
                    <span>Sound Effects:</span>
                    <button onClick={handleSoundToggle} className={styles.toggleButton}>Toggle On/Off</button>
                </div>
                <div className={styles.settingItem}>
                    <span>Theme/UI Mode:</span>
                    <button onClick={handleUIToggle} className={styles.toggleButton}>Switch Theme</button>
                </div>
            </div>

            <div className={styles.settingBlock}>
                <h3>Progress Management</h3>
                <div className={styles.settingItem}>
                    <span>Reset Tutorial Status:</span>
                    <button onClick={onResetTutorial} className={styles.warningButton}>Replay Tutorial</button>
                    <p className={styles.description}>This allows you to re-do the mandatory tutorial.</p>
                </div>
                <div className={styles.settingItem}>
                    <span>Reset Player Name & Progress:</span>
                    <button onClick={() => { if(window.confirm('Are you sure you want to completely reset your player name and tutorial progress?')) onResetName(); }} className={styles.warningButton}>Reset All</button>
                    <p className={styles.description}>Warning: Logs you out and requires re-registration.</p>
                </div>
            </div>

            <button onClick={onBack} className={styles.backButton}>Back to Menu</button>
        </div>
    );
}

export default Settings;