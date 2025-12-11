"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Categorized word banks
const WORD_BANKS = {
  animals: {
    name: 'Animals',
    icon: '🐾',
    words: [
      'ELEPHANT', 'LION', 'TIGER', 'GIRAFFE', 'ZEBRA',
      'MONKEY', 'PANDA', 'KANGAROO', 'DOLPHIN', 'WHALE',
      'SHARK', 'EAGLE', 'PENGUIN', 'OWL', 'BUTTERFLY',
      'RHINOCEROS', 'HIPPOPOTAMUS', 'CROCODILE', 'CHEETAH', 'BEAR'
    ]
  },
  technology: {
    name: 'Technology',
    icon: '💻',
    words: [
      'JAVASCRIPT', 'REACT', 'NEXTJS', 'COMPUTER', 'ALGORITHM',
      'PROGRAMMING', 'SOFTWARE', 'HARDWARE', 'DATABASE', 'NETWORK',
      'INTERFACE', 'FRAMEWORK', 'LIBRARY', 'FUNCTION', 'VARIABLE',
      'COMPONENT', 'SECURITY', 'SERVER', 'CLIENT', 'BROWSER'
    ]
  },
  countries: {
    name: 'Countries',
    icon: '🌍',
    words: [
      'FRANCE', 'GERMANY', 'ITALY', 'SPAIN', 'PORTUGAL',
      'JAPAN', 'CHINA', 'INDIA', 'BRAZIL', 'CANADA',
      'AUSTRALIA', 'MEXICO', 'EGYPT', 'RUSSIA', 'SWEDEN',
      'NORWAY', 'DENMARK', 'POLAND', 'GREECE', 'TURKEY'
    ]
  },
  food: {
    name: 'Food & Drinks',
    icon: '🍕',
    words: [
      'PIZZA', 'BURGER', 'SUSHI', 'PASTA', 'SANDWICH',
      'CHOCOLATE', 'ICE CREAM', 'COFFEE', 'ORANGE', 'BANANA',
      'STRAWBERRY', 'TOMATO', 'CARROT', 'BROCCOLI', 'MUSHROOM',
      'SPAGHETTI', 'LASAGNA', 'TACOS', 'BURRITO', 'SALAD'
    ]
  },
  sports: {
    name: 'Sports',
    icon: '⚽',
    words: [
      'FOOTBALL', 'BASKETBALL', 'BASEBALL', 'TENNIS', 'SOCCER',
      'VOLLEYBALL', 'SWIMMING', 'RUNNING', 'CYCLING', 'BOXING',
      'WRESTLING', 'GOLF', 'HOCKEY', 'CRICKET', 'RUGBY',
      'SURFING', 'SKIING', 'SKATEBOARDING', 'ARCHERY', 'FENCING'
    ]
  },
  nature: {
    name: 'Nature',
    icon: '🌲',
    words: [
      'MOUNTAIN', 'OCEAN', 'FOREST', 'RIVER', 'WATERFALL',
      'VOLCANO', 'DESERT', 'JUNGLE', 'ISLAND', 'BEACH',
      'SUNSET', 'RAINBOW', 'THUNDER', 'LIGHTNING', 'STORM',
      'SNOWFLAKE', 'CRYSTAL', 'DIAMOND', 'PEARL', 'SAPPHIRE'
    ]
  }
};

// Difficulty settings
const DIFFICULTY = {
  easy: { time: 60, maxWrong: 8, name: 'Easy' },
  medium: { time: 45, maxWrong: 6, name: 'Medium' },
  hard: { time: 30, maxWrong: 4, name: 'Hard' }
};

export default function GamePage() {
  const router = useRouter();
  const [word, setWord] = useState('');
  const [wordCategory, setWordCategory] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState(0);

  // Initialize game on mount
  useEffect(() => {
    startNewGame();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameStatus !== 'playing' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameStatus('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, timeLeft]);

  // Check win condition
  useEffect(() => {
    if (word && gameStatus === 'playing') {
      const wordLetters = new Set(word.split(''));
      // First and last letters are always revealed, so check all letters
      const hasWon = Array.from(wordLetters).every(letter => guessedLetters.has(letter));
      
      if (hasWon && wordLetters.size > 0) {
        setGameStatus('won');
        calculateScore();
      }
    }
  }, [guessedLetters, word, gameStatus]);

  // Check loss condition
  useEffect(() => {
    if (wrongGuesses >= DIFFICULTY[difficulty].maxWrong && gameStatus === 'playing') {
      setGameStatus('lost');
    }
  }, [wrongGuesses, difficulty, gameStatus]);

  const startNewGame = () => {
    // Random category selection
    const categories = Object.keys(WORD_BANKS);
    const categoryKey = categories[Math.floor(Math.random() * categories.length)];
    const category = WORD_BANKS[categoryKey];
    
    // Filter words by difficulty (word length)
    let availableWords = category.words;
    if (difficulty === 'easy') {
      // Easy: shorter words (4-7 letters)
      availableWords = category.words.filter(word => word.length >= 4 && word.length <= 7);
    } else if (difficulty === 'medium') {
      // Medium: medium words (6-9 letters)
      availableWords = category.words.filter(word => word.length >= 6 && word.length <= 9);
    } else {
      // Hard: longer words (8+ letters)
      availableWords = category.words.filter(word => word.length >= 8);
    }
    
    // Fallback to all words if filtered list is empty
    if (availableWords.length === 0) {
      availableWords = category.words;
    }
    
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    setWord(randomWord);
    setWordCategory(category);
    
    // Auto-reveal first and last letters ONLY on Easy difficulty
    const guessed = new Set();
    if (difficulty === 'easy') {
      const firstLetter = randomWord[0];
      const lastLetter = randomWord[randomWord.length - 1];
      guessed.add(firstLetter);
      guessed.add(lastLetter);
    }
    setGuessedLetters(guessed);
    
    setWrongGuesses(0);
    setTimeLeft(DIFFICULTY[difficulty].time);
    setGameStatus('playing');
    setScore(0);
  };

  const handleLetterGuess = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      setWrongGuesses((prev) => prev + 1);
    }
  };

  const calculateScore = () => {
    if (gameStatus !== 'won') return;
    
    const baseScore = 100;
    const timeBonus = Math.floor(timeLeft * 2);
    const wrongPenalty = wrongGuesses * 10;
    const difficultyMultiplier = difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1;
    
    const finalScore = Math.max(0, Math.floor((baseScore + timeBonus - wrongPenalty) * difficultyMultiplier));
    setScore(finalScore);
  };

  const getDisplayWord = () => {
    if (!word) return '';
    
    return word
      .split('')
      .map((letter, index) => {
        // Only show first and last letter on Easy difficulty
        if (difficulty === 'easy' && (index === 0 || index === word.length - 1)) {
          return letter;
        }
        return guessedLetters.has(letter) ? letter : '_';
      })
      .join(' ');
  };

  const getAlphabet = () => {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-lg font-semibold text-gray-700 hover:text-gray-900"
          >
            ← Back to Home
          </button>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              Difficulty: <span className="font-semibold">{DIFFICULTY[difficulty].name}</span>
            </div>
            <div className="text-sm text-gray-600">
              Time: <span className={`font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Side - Hangman Visual & Word */}
          <div className="space-y-6">
            {/* Hangman Drawing with Status */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <HangmanDrawing 
                wrongGuesses={wrongGuesses} 
                maxWrong={DIFFICULTY[difficulty].maxWrong}
                gameStatus={gameStatus}
                timeLeft={timeLeft}
                word={word}
                score={score}
              />
              
              {/* Wrong Guesses Counter */}
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-700" style={{ fontFamily: 'monospace' }}>
                  ❌ Wrong: <span className="text-red-600 font-semibold">{wrongGuesses}</span> / {DIFFICULTY[difficulty].maxWrong}
                </span>
              </div>

              {/* Simple Status Message */}
              {gameStatus === 'lost' && (
                <div className="mt-4 text-center">
                  <p className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'monospace' }}>
                    💀 MAN HANGED 💀
                  </p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'monospace' }}>
                    word failed
                  </p>
                </div>
              )}
              
              {gameStatus === 'won' && (
                <div className="mt-4 text-center">
                  <p className="text-lg font-bold text-green-600 mb-1" style={{ fontFamily: 'monospace' }}>
                    🎉 YOU SAVED HIM! 🎉
                  </p>
                  {score > 0 && (
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'monospace' }}>
                      Score: {score} points
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Word Display */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <div className="text-center">
                {/* Category Hint - Only show on Easy and Medium */}
                {wordCategory && difficulty !== 'hard' && (
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">{wordCategory.icon}</span>
                    <p className="text-lg font-semibold text-gray-700">
                      Category: {wordCategory.name}
                    </p>
                  </div>
                )}
                <p className="mb-4 text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>
                  Guess the Word
                </p>
                <div className="text-3xl font-bold tracking-widest text-gray-900" style={{ fontFamily: 'monospace' }}>
                  {getDisplayWord()}
                </div>
                {difficulty === 'easy' && (
                  <p className="mt-4 text-xs text-gray-500">
                    First and last letters are revealed as hints
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Right Side - Letter Keyboard */}
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-center text-lg font-semibold text-gray-800">
                Select a Letter
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {getAlphabet().map((letter) => {
                  const isGuessed = guessedLetters.has(letter);
                  // Only show hint indicator on Easy difficulty
                  const isFirstOrLast = difficulty === 'easy' && word && (word[0] === letter || word[word.length - 1] === letter);
                  const isWrong = isGuessed && !word.includes(letter);
                  const isCorrect = isGuessed && word.includes(letter);
                  
                  return (
                    <button
                      key={letter}
                      onClick={() => handleLetterGuess(letter)}
                      disabled={isGuessed || gameStatus !== 'playing'}
                      className={`
                        rounded border-2 border-black px-3 py-2 text-sm font-bold transition-all relative
                        ${isCorrect 
                          ? 'bg-green-500 text-white border-green-600 cursor-not-allowed' 
                          : isWrong 
                          ? 'bg-red-500 text-white border-red-600 cursor-not-allowed'
                          : gameStatus !== 'playing'
                          ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                          : 'bg-white text-black hover:bg-gray-100 active:scale-95'
                        }
                      `}
                      style={{ fontFamily: 'monospace' }}
                      title={isFirstOrLast ? 'Hint: First or last letter' : ''}
                    >
                      {letter}
                      {isFirstOrLast && (
                        <span className="absolute -top-1 -right-1 text-xs">💡</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Controls */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="space-y-4">
                {/* Difficulty Selector */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {Object.keys(DIFFICULTY).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => {
                          setDifficulty(diff);
                          startNewGame(); // Always restart game when difficulty changes
                        }}
                        className={`
                          flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all
                          ${difficulty === diff
                            ? 'bg-green-700 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }
                          hover:scale-105 active:scale-95
                        `}
                      >
                        {DIFFICULTY[diff].name}
                      </button>
                    ))}
                  </div>
                  {gameStatus === 'playing' && (
                    <p className="mt-2 text-xs text-gray-500">
                      Changing difficulty will start a new game
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={startNewGame}
                    className="flex-1 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800"
                  >
                    New Game
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Hangman Drawing Component
function HangmanDrawing({ wrongGuesses, maxWrong, gameStatus, timeLeft, word, score }) {
  const stages = [
    // 0 wrong guesses - empty
    <svg key="0" viewBox="0 0 200 200" className="w-full" style={{ maxHeight: '200px' }}>
      <rect x="20" y="180" width="160" height="8" fill="#000" />
      <rect x="30" y="20" width="8" height="160" fill="#000" />
      <rect x="30" y="20" width="70" height="8" fill="#000" />
      <line x1="100" y1="28" x2="100" y2="50" stroke="#000" strokeWidth="4" />
    </svg>,
    // 1 - head
    <svg key="1" viewBox="0 0 200 200" className="w-full" style={{ maxHeight: '200px' }}>
      <rect x="20" y="180" width="160" height="8" fill="#000" />
      <rect x="30" y="20" width="8" height="160" fill="#000" />
      <rect x="30" y="20" width="70" height="8" fill="#000" />
      <line x1="100" y1="28" x2="100" y2="50" stroke="#000" strokeWidth="4" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
    </svg>,
    // 2 - body
    <svg key="2" viewBox="0 0 200 200" className="w-full" style={{ maxHeight: '200px' }}>
      <rect x="20" y="180" width="160" height="8" fill="#000" />
      <rect x="30" y="20" width="8" height="160" fill="#000" />
      <rect x="30" y="20" width="70" height="8" fill="#000" />
      <line x1="100" y1="28" x2="100" y2="50" stroke="#000" strokeWidth="4" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
      <line x1="100" y1="72" x2="100" y2="110" stroke="#000" strokeWidth="3" />
    </svg>,
    // 3 - left arm
    <svg key="3" viewBox="0 0 200 200" className="w-full" style={{ maxHeight: '200px' }}>
      <rect x="20" y="180" width="160" height="8" fill="#000" />
      <rect x="30" y="20" width="8" height="160" fill="#000" />
      <rect x="30" y="20" width="70" height="8" fill="#000" />
      <line x1="100" y1="28" x2="100" y2="50" stroke="#000" strokeWidth="4" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
      <line x1="100" y1="72" x2="100" y2="110" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="75" y2="95" stroke="#000" strokeWidth="3" />
    </svg>,
    // 4 - right arm
    <svg key="4" viewBox="0 0 200 200" className="w-full" style={{ maxHeight: '200px' }}>
      <rect x="20" y="180" width="160" height="8" fill="#000" />
      <rect x="30" y="20" width="8" height="160" fill="#000" />
      <rect x="30" y="20" width="70" height="8" fill="#000" />
      <line x1="100" y1="28" x2="100" y2="50" stroke="#000" strokeWidth="4" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
      <line x1="100" y1="72" x2="100" y2="110" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="75" y2="95" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="125" y2="95" stroke="#000" strokeWidth="3" />
    </svg>,
    // 5 - left leg
    <svg key="5" viewBox="0 0 200 200" className="w-full" style={{ maxHeight: '200px' }}>
      <rect x="20" y="180" width="160" height="8" fill="#000" />
      <rect x="30" y="20" width="8" height="160" fill="#000" />
      <rect x="30" y="20" width="70" height="8" fill="#000" />
      <line x1="100" y1="28" x2="100" y2="50" stroke="#000" strokeWidth="4" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
      <line x1="100" y1="72" x2="100" y2="110" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="75" y2="95" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="125" y2="95" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="110" x2="85" y2="135" stroke="#000" strokeWidth="3" />
    </svg>,
    // 6 - right leg
    <svg key="6" viewBox="0 0 200 200" className="w-full" style={{ maxHeight: '200px' }}>
      <rect x="20" y="180" width="160" height="8" fill="#000" />
      <rect x="30" y="20" width="8" height="160" fill="#000" />
      <rect x="30" y="20" width="70" height="8" fill="#000" />
      <line x1="100" y1="28" x2="100" y2="50" stroke="#000" strokeWidth="4" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
      <line x1="100" y1="72" x2="100" y2="110" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="75" y2="95" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="125" y2="95" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="110" x2="85" y2="135" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="110" x2="115" y2="135" stroke="#000" strokeWidth="3" />
    </svg>,
    // 7 - face (sad)
    <svg key="7" viewBox="0 0 200 200" className="w-full" style={{ maxHeight: '200px' }}>
      <rect x="20" y="180" width="160" height="8" fill="#000" />
      <rect x="30" y="20" width="8" height="160" fill="#000" />
      <rect x="30" y="20" width="70" height="8" fill="#000" />
      <line x1="100" y1="28" x2="100" y2="50" stroke="#000" strokeWidth="4" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
      <line x1="100" y1="72" x2="100" y2="110" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="75" y2="95" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="85" x2="125" y2="95" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="110" x2="85" y2="135" stroke="#000" strokeWidth="3" />
      <line x1="100" y1="110" x2="115" y2="135" stroke="#000" strokeWidth="3" />
      <circle cx="96" cy="58" r="1.5" fill="#000" />
      <circle cx="104" cy="58" r="1.5" fill="#000" />
      <path d="M 92 65 Q 100 70 108 65" stroke="#000" strokeWidth="1.5" fill="none" />
    </svg>,
  ];

  const stageIndex = Math.min(wrongGuesses, stages.length - 1);
  return <div className="flex justify-center">{stages[stageIndex]}</div>;
}
