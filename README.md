# 💣 Minesweeper React Firebase

A modern reimagining of the classic **Minesweeper** game — built with **React** and **Firebase**.  
This project combines nostalgic gameplay with a clean UI, real-time database features, and responsive design for both desktop and mobile users.

---

## 🚀 Live Demo
**Play here:** [https://minesweeper-react-firebase.vercel.app](https://minesweeper-react-firebase.vercel.app)

---

## 🧩 Overview

This Minesweeper web app recreates the logic of the original game while integrating modern web technologies for a smoother experience.  
It features **real-time Firebase integration**, **React components**, and unique gameplay twists that enhance replayability.

---

## 🎯 Game Features

- 🕹️ **Classic Gameplay** – Reveal safe tiles while avoiding hidden mines.
- 🏆 **Win / Lose Detection** – Instant detection when all safe tiles are revealed or a mine is clicked.
- 🔁 **Restart Game** – Quickly restart without reloading the page.
- ⚡ **Responsive Design** – Fully optimized for both desktop and mobile users.
- 💾 **Firebase Integration** – Authentication and real-time database storage.
- 🧠 **Smart Mine Generation** – Random but fair mine placement each round.
- 💥 **Animated Reveals** – Smooth transition effects when uncovering cells.
- 💬 **Toast Notifications** – Win or lose alerts for better user feedback.
- ☀️ **Light Mode Only** – Simple and clean design (dark mode removed).

---

## 🌀 Unique Twists (Custom Additions)

> *(Customize this section based on your own game — here’s a sample version)*

- 💣 **Safe First Click** – The first clicked tile will never be a mine.  
- ❤️ **Second Chance Mode** – Players get one extra life before losing.  
- 📊 **Leaderboard System** – Scores saved via Firebase Firestore.  
- 🔄 **Dynamic Difficulty** – The number of mines scales with your performance.  
- 🌈 **Color-based Hints** – Each number tile color-coded for better visibility.  
- 🎵 **Sound Effects** – Optional sounds for clicking, flagging, and explosions.  
- 💬 **User Accounts** – Sign in to save personal progress and records.

---

## 🧱 Tech Stack

| Category | Technology Used |
|-----------|----------------|
| **Frontend Framework** | React (Vite or CRA) |
| **State Management** | React Hooks (`useState`, `useEffect`) |
| **Styling** | CSS / TailwindCSS |
| **Backend** | Firebase (Authentication, Firestore Database) |
| **Deployment** | Vercel |
| **Version Control** | Git & GitHub |

---

## ⚙️ Project Structure

minesweeper-react-firebase/
├── public/
│ ├── index.html
│ └── favicon.ico
├── src/
│ ├── components/
│ │ ├── Board.jsx
│ │ ├── Cell.jsx
│ │ ├── Header.jsx
│ │ └── Timer.jsx
│ ├── firebase/
│ │ └── firebaseConfig.js
│ ├── App.jsx
│ ├── index.jsx
│ └── styles.css
├── .gitignore
├── package.json
├── README.md
└── vercel.json
