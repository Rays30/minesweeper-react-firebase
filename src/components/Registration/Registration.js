// src/components/Registration/Registration.js
import React, { useState } from 'react';
import styles from './Registration.module.css';

function Registration({ onNameSubmit }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onNameSubmit(name.trim());
        } else {
            alert('Please enter your name!');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Welcome to Minesweeper!</h2>
            <p>Please register your player name to track your scores.</p>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label htmlFor="playerName">Enter Your Name:</label>
                <input
                    id="playerName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Tactical Genius"
                    maxLength="25"
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>Continue to Tutorial</button>
            </form>
        </div>
    );
}

export default Registration;

// Note: Create Registration.module.css using the content of the old PlayerNameInput.module.css