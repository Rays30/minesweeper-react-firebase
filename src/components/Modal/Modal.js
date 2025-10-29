import React from 'react';
import styles from './Modal.module.css';

function Modal({ title, message, score, onClose, showScore = true }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{title}</h2>
                <p>{message}</p>
                {showScore && score !== undefined && <p className={styles.score}>Your Score: {score}</p>}
                <button onClick={onClose} className={styles.button}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default Modal;