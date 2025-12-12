"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { API_ENDPOINTS } from '@/lib/api';

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
  const { user } = useAuth();
  const [word, setWord] = useState('');
  const [wordCategory, setWordCategory] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState(0);
  const [initialTime, setInitialTime] = useState(60);
  const [gameRecorded, setGameRecorded] = useState(false);
  
  // Word bank selection (from database)
  const [selectedWordBank, setSelectedWordBank] = useState('default');
  const [selectedWordBankType, setSelectedWordBankType] = useState('default');
  const [customWordBanks, setCustomWordBanks] = useState([]);
  const [loadingWordBanks, setLoadingWordBanks] = useState(false);
  const [wordBankLoaded, setWordBankLoaded] = useState(false);

  // Load active word bank from database and fetch custom word banks
  useEffect(() => {
    const loadActiveWordBank = async () => {
      if (!user) {
        setSelectedWordBank('default');
        setSelectedWordBankType('default');
        setWordBankLoaded(true);
        return;
      }

      setLoadingWordBanks(true);
      try {
        // Fetch user stats to get active word bank
        const statsResponse = await fetch(`${API_ENDPOINTS.getUserStats}?firebase_uid=${user.uid}`);
        let activeWordBankId = null;
        
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          activeWordBankId = stats.active_word_bank_id;
        }

        // Fetch custom word banks
        const banksResponse = await fetch(`${API_ENDPOINTS.getUserWordBanks}?firebase_uid=${user.uid}`);
        if (banksResponse.ok) {
          const data = await banksResponse.json();
          setCustomWordBanks(data);

          // Set active word bank from database
          if (activeWordBankId && activeWordBankId !== null) {
            const bankExists = data.some(bank => bank.id === activeWordBankId);
            if (bankExists) {
              setSelectedWordBank(activeWordBankId.toString());
              setSelectedWordBankType('custom');
            } else {
              // Bank no longer exists, reset to default
              setSelectedWordBank('default');
              setSelectedWordBankType('default');
              // Update database
              await fetch(API_ENDPOINTS.updateActiveWordBank, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebase_uid: user.uid, word_bank_id: null })
              });
            }
          } else {
            setSelectedWordBank('default');
            setSelectedWordBankType('default');
          }
        } else {
          setSelectedWordBank('default');
          setSelectedWordBankType('default');
        }
      } catch (error) {
        console.error('Error loading word bank:', error);
        setSelectedWordBank('default');
        setSelectedWordBankType('default');
      } finally {
        setLoadingWordBanks(false);
        setWordBankLoaded(true);
      }
    };

    loadActiveWordBank();
  }, [user]);

  // Initialize game when word bank is loaded
  useEffect(() => {
    if (wordBankLoaded && customWordBanks.length >= 0) {
      startNewGame();
    }
  }, [wordBankLoaded, selectedWordBank, selectedWordBankType]);

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

  // Record game result to database
  const recordGameResult = async (won, finalScore) => {
    if (!user || gameRecorded) return;

    try {
      const timeTaken = initialTime - timeLeft;
      const gameData = {
        firebase_uid: user.uid,
        won: won,
        score: won ? (finalScore || 0) : 0,
        word: word,
        difficulty: difficulty, // Record for all difficulty levels
        time_taken: timeTaken,
        wrong_guesses: wrongGuesses,
      };

      console.log('Recording game:', { won, score: gameData.score, difficulty: gameData.difficulty });

      const response = await fetch(API_ENDPOINTS.recordGame, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Game recorded successfully:', result);
        setGameRecorded(true);
      } else {
        const error = await response.json();
        console.error('Failed to record game result:', error);
      }
    } catch (error) {
      console.error('Error recording game result:', error);
    }
  };

  // Check win condition
  useEffect(() => {
    if (word && gameStatus === 'playing') {
      const wordLetters = new Set(word.split(''));
      // First and last letters are always revealed, so check all letters
      const hasWon = Array.from(wordLetters).every(letter => guessedLetters.has(letter));
      
      if (hasWon && wordLetters.size > 0) {
        setGameStatus('won');
        // Calculate score immediately when won
        const currentDifficulty = selectedWordBankType === 'custom' ? 'medium' : difficulty;
        const baseScore = 100;
        const timeBonus = Math.floor(timeLeft * 2);
        const wrongPenalty = wrongGuesses * 10;
        const difficultyMultiplier = currentDifficulty === 'hard' ? 2 : currentDifficulty === 'medium' ? 1.5 : 1;
        const finalScore = Math.max(0, Math.floor((baseScore + timeBonus - wrongPenalty) * difficultyMultiplier));
        setScore(finalScore);
      }
    }
  }, [guessedLetters, word, gameStatus, timeLeft, wrongGuesses, difficulty, selectedWordBankType]);

  // Check loss condition
  useEffect(() => {
    const currentDifficulty = selectedWordBankType === 'custom' ? 'medium' : difficulty;
    if (wrongGuesses >= DIFFICULTY[currentDifficulty].maxWrong && gameStatus === 'playing') {
      setGameStatus('lost');
    }
  }, [wrongGuesses, difficulty, gameStatus, selectedWordBankType]);

  // Record game when status changes to won or lost
  useEffect(() => {
    if (gameStatus === 'won' && !gameRecorded) {
      // Use a small delay to ensure score is set
      const timer = setTimeout(() => {
        recordGameResult(true, score);
      }, 100);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'lost' && !gameRecorded) {
      recordGameResult(false, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, score, gameRecorded]);

  const startNewGame = () => {
    // Use state values (loaded from database)
    const currentBankId = selectedWordBank;
    const currentBankType = selectedWordBankType;

    let availableWords = [];
    let category = null;
    
    // Check if using custom word bank
    if (currentBankType === 'custom' && currentBankId !== 'default') {
      const customBank = customWordBanks.find(bank => bank.id === parseInt(currentBankId));
      if (customBank && customBank.words && customBank.words.length > 0) {
        availableWords = customBank.words;
        category = {
          name: customBank.name,
          icon: '',
          isCustom: true
        };
      } else {
        // Custom bank not found or not loaded, fallback to default
        const categories = Object.keys(WORD_BANKS);
        const categoryKey = categories[Math.floor(Math.random() * categories.length)];
        category = WORD_BANKS[categoryKey];
        availableWords = category.words;
        // Reset to default
        setSelectedWordBank('default');
        setSelectedWordBankType('default');
        if (user) {
          // Update database
          fetch(API_ENDPOINTS.updateActiveWordBank, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firebase_uid: user.uid, word_bank_id: null })
          });
        }
      }
    } else {
      // Use default word banks with difficulty filtering
      const categories = Object.keys(WORD_BANKS);
      const categoryKey = categories[Math.floor(Math.random() * categories.length)];
      category = WORD_BANKS[categoryKey];
      
      // Filter words by difficulty (word length) - only for default banks
      if (difficulty === 'easy') {
        availableWords = category.words.filter(word => word.length >= 4 && word.length <= 7);
      } else if (difficulty === 'medium') {
        availableWords = category.words.filter(word => word.length >= 6 && word.length <= 9);
      } else {
        availableWords = category.words.filter(word => word.length >= 8);
      }
      
      // Fallback to all words if filtered list is empty
      if (availableWords.length === 0) {
        availableWords = category.words;
      }
    }
    
    // Select random word
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    setWord(randomWord);
    setWordCategory(category);
    
    // Auto-reveal first and last letters ONLY on Easy difficulty (and default banks)
    const guessed = new Set();
    if (currentBankType === 'default' && difficulty === 'easy') {
      const firstLetter = randomWord[0];
      const lastLetter = randomWord[randomWord.length - 1];
      guessed.add(firstLetter);
      guessed.add(lastLetter);
    }
    setGuessedLetters(guessed);
    
    setWrongGuesses(0);
    // Use default difficulty settings for default banks, medium for custom banks
    const gameDifficulty = currentBankType === 'custom' ? 'medium' : difficulty;
    const newTime = DIFFICULTY[gameDifficulty].time;
    setTimeLeft(newTime);
    setInitialTime(newTime);
    setGameStatus('playing');
    setScore(0);
    setGameRecorded(false);
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
    return finalScore;
  };

  const getDisplayWord = () => {
    if (!word) return '';
    
    const currentDifficulty = selectedWordBankType === 'custom' ? 'medium' : difficulty;
    
    return word
      .split('')
      .map((letter, index) => {
        // Only show first and last letter on Easy difficulty (default banks only)
        if (selectedWordBankType === 'default' && currentDifficulty === 'easy' && (index === 0 || index === word.length - 1)) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Animated Background Objects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-green-200/30 blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-green-300/25 blur-2xl animate-float-medium"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 rounded-full bg-green-400/20 blur-xl animate-float-fast"></div>
        <div className="absolute top-1/3 right-1/3 w-36 h-36 rounded-full bg-green-200/25 blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 rounded-full bg-green-300/30 blur-xl animate-float-medium"></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-green-300/20 rotate-45 blur-sm animate-spin-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-green-400/25 rounded-lg rotate-12 blur-sm animate-float-medium"></div>
        <div className="absolute top-2/3 left-1/2 w-24 h-24 bg-green-200/20 rounded-full blur-lg animate-float-slow"></div>
        <div className="absolute top-1/2 right-1/5 w-20 h-20 bg-green-300/25 rotate-45 blur-md animate-spin-slow"></div>
        
        {/* Small floating dots */}
        <div className="absolute top-16 right-1/3 w-3 h-3 rounded-full bg-green-400/40 animate-float-fast"></div>
        <div className="absolute bottom-40 left-1/5 w-2 h-2 rounded-full bg-green-500/35 animate-float-medium"></div>
        <div className="absolute top-3/4 right-1/2 w-4 h-4 rounded-full bg-green-300/40 animate-float-slow"></div>
        <div className="absolute bottom-1/3 left-2/3 w-3 h-3 rounded-full bg-green-400/35 animate-float-fast"></div>
      </div>

      {/* Header */}
      <div className="bg-white relative z-20">
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
            {user && <UserProfileDropdown variant="light" />}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8 relative z-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Hangman Visual & Word */}
          <div className="space-y-6">
            {/* Hangman Drawing with Status */}
            <div className="rounded-xl bg-white/80 p-8 relative z-10">
              <HangmanDrawing 
                wrongGuesses={wrongGuesses} 
                maxWrong={DIFFICULTY[selectedWordBankType === 'custom' ? 'medium' : difficulty].maxWrong}
                gameStatus={gameStatus}
                timeLeft={timeLeft}
                word={word}
                score={score}
                difficulty={selectedWordBankType === 'custom' ? 'medium' : difficulty}
              />
              
              {/* Wrong Guesses Counter */}
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-700" style={{ fontFamily: 'monospace' }}>
                  Wrong: <span className="text-red-600 font-semibold">{wrongGuesses}</span> / {DIFFICULTY[selectedWordBankType === 'custom' ? 'medium' : difficulty].maxWrong}
                </span>
              </div>

              {/* Simple Status Message */}
              {gameStatus === 'won' && (
                <div className="mt-4 text-center">
                  <p className="text-lg font-bold text-green-700/80 mb-1" style={{ fontFamily: 'monospace' }}>
                    YOU SAVED HIM!
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
            <div className="rounded-xl bg-white/80 p-8 relative z-10">
              <div className="text-center">
                {/* Category Hint */}
                {wordCategory && (
                  <div className="mb-4 flex items-center justify-center gap-2">
                    {wordCategory.isCustom && (
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    )}
                    <p className="text-sm text-gray-600">
                      {wordCategory.isCustom ? 'Custom Word Bank' : 'Category'}: {wordCategory.name}
                    </p>
                  </div>
                )}
                <p className="mb-4 text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>
                  Guess the Word
                </p>
                <div className="text-3xl font-bold tracking-widest text-gray-900" style={{ fontFamily: 'monospace' }}>
                  {getDisplayWord()}
                </div>
                {(() => {
                  // Get current bank type from localStorage
                  let currentBankType = 'default';
                  if (typeof window !== 'undefined') {
                    const saved = localStorage.getItem('activeWordBank');
                    currentBankType = (saved && saved !== 'default') ? 'custom' : 'default';
                  }
                  return currentBankType === 'default' && difficulty === 'easy' && (
                    <p className="mt-4 text-xs text-gray-500">
                      First and last letters are revealed as hints
                    </p>
                  );
                })()}
              </div>
            </div>

          </div>

          {/* Right Side - Letter Keyboard */}
          <div className="space-y-6">
            <div className="rounded-xl bg-white/80 p-6 relative z-10">
              <h3 className="mb-4 text-center text-lg font-semibold text-gray-800">
                Select a Letter
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {getAlphabet().map((letter) => {
                  const isGuessed = guessedLetters.has(letter);
                  const currentDifficulty = selectedWordBankType === 'custom' ? 'medium' : difficulty;
                  const isFirstOrLast = selectedWordBankType === 'default' && currentDifficulty === 'easy' && word && (word[0] === letter || word[word.length - 1] === letter);
                  const isWrong = isGuessed && !word.includes(letter);
                  const isCorrect = isGuessed && word.includes(letter);
                  
                  return (
                    <button
                      key={letter}
                      onClick={() => handleLetterGuess(letter)}
                      disabled={isGuessed || gameStatus !== 'playing'}
                      className={`
                        rounded px-3 py-2 text-sm font-bold transition-all relative
                        ${isCorrect 
                          ? 'bg-green-300/70 text-gray-800 cursor-not-allowed' 
                          : isWrong 
                          ? 'bg-red-300/70 text-gray-800 cursor-not-allowed'
                          : gameStatus !== 'playing'
                          ? 'bg-gray-200/70 text-gray-500 cursor-not-allowed'
                          : 'bg-white/90 text-black hover:bg-gray-100/80 active:scale-95'
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
            <div className="rounded-xl bg-white/80 p-6 relative z-10">
              <div className="space-y-4">
                {/* Difficulty Selector - Only show for default word banks */}
                {selectedWordBankType === 'default' && (
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
                              ? 'text-white'
                              : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                            }
                            hover:scale-105 active:scale-95
                          `}
                          style={difficulty === diff ? { backgroundColor: '#1B5E20' } : {}}
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
                )}

                {/* Custom Word Bank Info */}
                {selectedWordBankType === 'custom' && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                    <p className="text-xs text-blue-700">
                      Using custom word bank. Difficulty: Medium
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={startNewGame}
                    className="flex-1 rounded-lg px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#1B5E20' }}
                  >
                    New Game
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="rounded-lg bg-gray-100/80 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200/80"
                  >
                    Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      {gameStatus === 'lost' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-slideUp">
            {/* Close button */}
            <button
              onClick={startNewGame}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <span className="text-4xl font-bold text-red-600">X</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="mb-2 text-3xl font-black text-gray-900" style={{ fontFamily: 'monospace' }}>
                MAN HANGED
              </h2>

              {/* Time/Wrong guess info */}
              <p className="mb-6 text-sm text-gray-600" style={{ fontFamily: 'monospace' }}>
                {timeLeft === 0 ? 'Time ran out!' : 'Too many wrong guesses!'}
              </p>

              {/* Revealed Word */}
              <div className="mb-6 rounded-xl bg-gray-50 p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500" style={{ fontFamily: 'monospace' }}>
                  The Word Was:
                </p>
                <div className="text-4xl font-bold tracking-widest text-gray-900" style={{ fontFamily: 'monospace' }}>
                  {word}
                </div>
              </div>

              {/* Restart Button */}
              <button
                onClick={startNewGame}
                className="group relative w-full overflow-hidden rounded-xl px-8 py-4 font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#1B5E20', fontFamily: 'monospace' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg 
                    className="h-5 w-5 transition-transform group-hover:rotate-180" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                  RESTART GAME
                </span>
                <div className="absolute inset-0 bg-green-700 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hangman Drawing Component
function HangmanDrawing({ wrongGuesses, maxWrong, gameStatus, timeLeft, word, score, difficulty }) {
  // When game is lost (time out or max wrong), show complete hangman
  const displayWrongGuesses = gameStatus === 'lost' ? maxWrong : wrongGuesses;
  
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

  const stageIndex = Math.min(displayWrongGuesses, stages.length - 1);
  return <div className="flex justify-center">{stages[stageIndex]}</div>;
}

