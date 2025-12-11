# 🎯 Hangman Game — Time-Based & Interactive

A modern **Hangman game** focused on speed, interaction, and customization.  
The game introduces **time-based rounds**, **user authentication**, and **personalized gameplay**, allowing players to control their own experience.

This project is built with scalability in mind and serves as a solid foundation for more advanced game mechanics.

---

## 🚀 Core Features

- ✅ Classic Hangman gameplay
- ⏱️ **Time-based rounds**
- 🎮 Interactive UI with smooth animations
- 🔁 Replay support
- 🧠 Multiple difficulty levels
- 🔐 **User authentication with Firebase**
- 📚 **Custom word banks per user**
- 📊 Score calculation based on speed & accuracy

---

## 🔐 Why Authentication Matters

Authentication is a core part of the game, not just an add-on.

Using **Firebase Authentication**, players can:

- Create and manage **their own word banks**
- Unlock and switch between **difficulty levels**
- Save game preferences
- Track personal performance over time
- Maintain persistent game data across devices

Firebase handles authentication securely, reducing backend complexity while keeping the system scalable.

---

## 🛠️ Tech Stack (Chosen for Performance & Growth)

### Frontend
- **Next.js (TypeScript)** ✅  
  - Fast rendering
  - Structured routing
  - Scalable architecture
- **React Hooks**
  - Game state management
- **Tailwind CSS**
  - Clean, responsive UI
- **Framer Motion**
  - Animations for:
    - Timer countdown
    - Letter reveal
    - Game feedback

### Backend
- **Node.js + Express** ✅  
  - REST API
  -callbacks
- **MySQL**
  - Store:
    - Custom word banks
    - Difficulty configurations
    - Game history
- **Redis**
  - Timer handling
  - Temporary game state caching

### Authentication
- **Firebase Authentication**
  - Email / Google sign-in
  - Secure and production-ready

---

## ⏱️ Time-Based Gameplay Logic

- Each round has a fixed time limit (e.g. 20–60 seconds)
- Timer starts immediately when a word loads
- Game ends when:
  - Time runs out ⏳
  - Maximum wrong guesses are reached 💀
- Scoring is influenced by:
  - Completion speed
  - Number of wrong attempts
  - Difficulty level

---



---

## 🧩 Core Game Logic Overview

- Word selection (default or user-defined)
- Letter validation
- Guess tracking
- Timer countdown
- Win/Loss detection
- Difficulty-based rule adjustments

---

## 📈 Planned Enhancements

- Smarter difficulty scaling
- Category-based word banks
- Daily challenge mode
- Sound effects & visual feedback
- Progressive Web App (PWA) support
- Mobile version (Flutter)

---

## 🎯 Development Focus

- Clean and maintainable code
- Performance-first approach
- Secure authentication
- Highly interactive user experience

---

## 📜 License

MIT License — free to use and modify.

---

## 👤 Author

Built with ❤️ by **Rukundo Wilson**
