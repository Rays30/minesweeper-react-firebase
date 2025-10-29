import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

// Your web app's Firebase configuration (read from environment variables)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add a new score to Firestore
export const addScore = async (scoreData) => {
    try {
        const docRef = await addDoc(collection(db, 'scores'), scoreData);
        console.log('Score added with ID: ', docRef.id);
    } catch (e) {
        console.error('Error adding score: ', e);
    }
};

// Get scores for the leaderboard, filtered by mode and difficulty
export const getLeaderboardScores = async (mode, difficulty) => {
    try {
        let q = collection(db, 'scores');

        // Apply filters if provided
        if (mode && mode !== 'all') { // 'all' is a custom option for UI, not a Firebase filter
            q = query(q, where('mode', '==', mode));
        }
        if (difficulty && difficulty !== 'all') { // 'all' is a custom option for UI
            q = query(q, where('difficulty', '==', difficulty));
        }

        // Always order by score descending and limit to top 10
        q = query(q, orderBy('score', 'desc'), limit(10));

        const querySnapshot = await getDocs(q);
        const scores = [];
        querySnapshot.forEach((doc) => {
            scores.push({ id: doc.id, ...doc.data() });
        });
        return scores;
    } catch (e) {
        console.error('Error getting leaderboard scores: ', e);
        return [];
    }
};