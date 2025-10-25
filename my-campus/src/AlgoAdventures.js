import React, { useState, useEffect, useCallback } from 'react';
import { Star, Zap, CheckCircle, XCircle, Trophy, Award } from 'lucide-react';
import './AlgoAdventures.css';

// Sample data - replace with actual data
const subjects = [
  { id: 'algorithms', name: 'Algorithms', icon: '🧠', color: 'from-blue-500 to-cyan-500' },
  { id: 'data-structures', name: 'Data Structures', icon: '📊', color: 'from-green-500 to-teal-500' },
  { id: 'programming', name: 'Programming', icon: '💻', color: 'from-purple-500 to-pink-500' },
  { id: 'logic', name: 'Logic', icon: '🧩', color: 'from-orange-500 to-red-500' },
];

const gameTypes = [
  { id: 'quiz', name: 'Quiz', icon: <Star />, color: 'bg-blue-500' },
  { id: 'predict', name: 'Predict Output', icon: <Zap />, color: 'bg-green-500' },
  { id: 'dragdrop', name: 'Drag & Drop', icon: <CheckCircle />, color: 'bg-purple-500' },
  { id: 'fillblank', name: 'Fill in the Blank', icon: <XCircle />, color: 'bg-orange-500' },
  { id: 'match', name: 'Match', icon: <Trophy />, color: 'bg-red-500' },
  { id: 'bugfix', name: 'Bug Fix', icon: <Award />, color: 'bg-yellow-500' },
];

const difficulties = [
  { id: 'easy', name: 'Easy', xp: 10 },
  { id: 'medium', name: 'Medium', xp: 20 },
  { id: 'hard', name: 'Hard', xp: 30 },
];

const questionBank = {
  algorithms: {
    quiz: {
      easy: [
        {
          question: 'What is the time complexity of binary search?',
          options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
          correct: 1,
          explanation: 'Binary search has O(log n) time complexity.',
        },
      ],
    },
  },
  // Add more subjects and questions as needed
};

const AlgoAdventures = ({ subject, onComplete, onBack }) => {
  const [gameState, setGameState] = useState('menu');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [draggedBlocks, setDraggedBlocks] = useState([]);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [matchSelections, setMatchSelections] = useState({});
  const [selectedBugLine, setSelectedBugLine] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [xp, setXp] = useState(0);

  const generateQuestions = useCallback(() => {
    const questions = [];
    const subject = questionBank[selectedSubject];
    const gameQuestions = subject && subject[selectedGameType] && subject[selectedGameType][selectedDifficulty];

    if (gameQuestions && gameQuestions.length > 0) {
      while (questions.length < 20) {
        questions.push(...gameQuestions);
      }
      return questions.slice(0, 20).sort(() => Math.random() - 0.5);
    }

    return Array(20).fill(null).map((_, i) => ({
      question: `Sample question ${i + 1} for ${selectedGameType}`,
      type: 'quiz',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 0,
      explanation: 'This is a sample question.'
    }));
  }, [selectedSubject, selectedGameType, selectedDifficulty]);

  useEffect(() => {
    if (gameState === 'game' && questions.length === 0) {
      setQuestions(generateQuestions());
    }
  }, [gameState, generateQuestions, questions.length]);

  useEffect(() => {
    if (gameState === 'game' && questions.length > 0 && questions[currentQuestion]) {
      const q = questions[currentQuestion];
      if (selectedGameType === 'dragdrop' && q.codeBlocks) {
        setAvailableBlocks([...q.codeBlocks].sort(() => Math.random() - 0.5));
        setDraggedBlocks([]);
      } else if (selectedGameType === 'fillblank') {
        setFillBlankAnswer('');
      } else if (selectedGameType === 'match') {
        setMatchSelections({});
      } else if (selectedGameType === 'bugfix') {
        setSelectedBugLine(null);
      }
    }
  }, [currentQuestion, gameState, questions, selectedGameType]);

  const checkAnswer = () => {
    const q = questions[currentQuestion];
    let correct = false;

    if (selectedGameType === 'dragdrop' && q.codeBlocks) {
      const correctBlocks = q.correctOrder.map(i => q.codeBlocks[i]);
      correct = JSON.stringify(draggedBlocks) === JSON.stringify(correctBlocks);
    } else if (selectedGameType === 'match' && q.correctMatches) {
      correct = JSON.stringify(matchSelections) === JSON.stringify(q.correctMatches);
} else if (selectedGameType === 'bugfix') {
      correct = selectedBugLine === q.bugLine;
    } else if (selectedGameType === 'predict' || selectedGameType === 'quiz') {
      const selected = answers[currentQuestion];
      correct = selected === q.correct;
    } else if (selectedGameType === 'fillblank' && q.answer) {
      correct = fillBlankAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim();
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const earnedXP = difficulties.find(d => d.id === selectedDifficulty).xp;
      setScore(score + 1);
      setXp(xp + earnedXP * (streak + 1));
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setGameState('results');
      }
    }, 2000);
  };

  const handleDragStart = (e, block, fromDropzone) => {
    e.dataTransfer.setData('block', block);
    e.dataTransfer.setData('fromDropzone', fromDropzone);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    const block = e.dataTransfer.getData('block');
    const fromDropzone = e.dataTransfer.getData('fromDropzone') === 'true';

    if (target === 'dropzone') {
      if (!fromDropzone && !draggedBlocks.includes(block)) {
        setDraggedBlocks([...draggedBlocks, block]);
        setAvailableBlocks(availableBlocks.filter(b => b !== block));
      }
    } else {
      if (fromDropzone) {
        setDraggedBlocks(draggedBlocks.filter(b => b !== block));
        setAvailableBlocks([...availableBlocks, block]);
      }
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setSelectedSubject(null);
    setSelectedGameType(null);
    setSelectedDifficulty(null);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setAnswers([]);
    setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-15 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full opacity-18 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              AlgoAdventures
            </h1>
            <p className="text-gray-300 mt-2">Where Learning Meets Adventure 🚀</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-2">
              <Star className="text-yellow-400" />
              <span className="font-bold">{xp} XP</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-2">
              <Zap className="text-orange-400" />
              <span className="font-bold">{streak}x Streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {gameState === 'menu' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
              <h2 className="text-4xl font-bold mb-4">Welcome, Code Explorer! 🌟</h2>
              <p className="text-xl text-gray-300 mb-8">
                Embark on an epic coding journey through different worlds
              </p>
              <button
                onClick={() => setGameState('worldSelect')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:scale-105 transform transition shadow-lg hover:shadow-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/60 animate-pulse"
              >
                Start Adventure
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.slice(0, 4).map((subject) => (
                <div key={subject.id} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transform transition duration-300 hover:shadow-lg hover:shadow-white/20">
                  <div className="text-4xl mb-2 animate-pulse">{subject.icon}</div>
                  <h3 className="font-bold">{subject.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'worldSelect' && (
          <div className="space-y-6">
            <button
              onClick={() => setGameState('menu')}
              className="text-gray-300 hover:text-white flex items-center gap-2"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold mb-6">Choose Your World 🌍</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    setGameState('gameSelect');
                  }}
                  className={`bg-gradient-to-br ${subject.color} p-8 rounded-2xl hover:scale-105 transform transition shadow-xl`}
                >
                  <div className="text-6xl mb-4">{subject.icon}</div>
                  <h3 className="text-2xl font-bold">{subject.name}</h3>
                  <p className="text-white/80 mt-2">All Levels Unlocked ✨</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'gameSelect' && (
          <div className="space-y-6">
            <button
              onClick={() => setGameState('worldSelect')}
              className="text-gray-300 hover:text-white flex items-center gap-2"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold mb-6">Choose Your Challenge 🎮</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameTypes.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedGameType(game.id);
                    setGameState('difficultySelect');
                  }}
                  className={`${game.color} p-8 rounded-2xl hover:scale-105 transform transition shadow-xl`}
                >
                  <div className="flex justify-center mb-4">{game.icon}</div>
                  <h3 className="text-xl font-bold">{game.name}</h3>
                  <p className="text-white/80 mt-2">20 Questions</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'difficultySelect' && (
          <div className="space-y-6">
            <button
              onClick={() => setGameState('gameSelect')}
              className="text-gray-300 hover:text-white flex items-center gap-2"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold mb-6">Select Difficulty ⚔️</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => {
                    setSelectedDifficulty(diff.id);
                    setGameState('game');
                  }}
                  className={`${diff.color} p-12 rounded-2xl hover:scale-105 transform transition shadow-xl`}
                >
                  <h3 className="text-3xl font-bold mb-4">{diff.name}</h3>
                  <p className="text-xl">+{diff.xp} XP per question</p>
                </button>
              ))}
            </div>
          </div>
        )}
{gameState === 'game' && questions.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex justify-between mb-2">
                <span>Question {currentQuestion + 1} / 20</span>
                <span>Score: {score} / {currentQuestion + 1}</span>
              </div>
              <div className="bg-white/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">{questions[currentQuestion]?.question}</h3>

              {selectedGameType === 'dragdrop' && questions[currentQuestion].codeBlocks && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-3">Available Blocks:</h4>
                      <div
                        className="bg-white/5 rounded-xl p-4 min-h-[300px] border-2 border-dashed border-white/20"
                        onDrop={(e) => handleDrop(e, 'available')}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        {availableBlocks.map((block, i) => (
                          <div
                            key={i}
                            draggable
                            onDragStart={(e) => handleDragStart(e, block, false)}
                            className="bg-blue-500 p-3 rounded-lg mb-2 cursor-move hover:bg-blue-600 font-mono text-sm"
                          >
                            {block}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold mb-3">Build Your Code:</h4>
                      <div
                        className="bg-white/5 rounded-xl p-4 min-h-[300px] border-2 border-dashed border-green-400"
                        onDrop={(e) => handleDrop(e, 'dropzone')}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        {draggedBlocks.map((block, i) => (
                          <div
                            key={i}
                            draggable
                            onDragStart={(e) => handleDragStart(e, block, true)}
                            className="bg-green-500 p-3 rounded-lg mb-2 cursor-move hover:bg-green-600 font-mono text-sm"
                          >
                            {block}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
{(selectedGameType === 'predict' || selectedGameType === 'quiz') && questions[currentQuestion].options && (
                <div className="space-y-4">
                  {selectedGameType === 'predict' && questions[currentQuestion].code && (
                    <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm mb-6">
                      {questions[currentQuestion].code.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions[currentQuestion].options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newAnswers = [...answers];
                          newAnswers[currentQuestion] = i;
                          setAnswers(newAnswers);
                        }}
                        className={`p-6 rounded-xl transition ${
                          answers[currentQuestion] === i
                            ? 'bg-blue-500 border-2 border-blue-300'
                            : 'bg-white/5 border-2 border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={checkAnswer}
                disabled={showFeedback}
                className="mt-8 w-full bg-gradient-to-r from-green-500 to-blue-500 py-4 rounded-xl text-xl font-bold hover:scale-105 transform transition disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>

            {showFeedback && (
              <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-2xl ${
                isCorrect ? 'bg-green-500' : 'bg-red-500'
              } shadow-2xl z-50 animate-bounce max-w-lg`}>
                <div className="flex items-center gap-4">
                  {isCorrect ? (
                    <CheckCircle className="w-12 h-12" />
                  ) : (
                    <XCircle className="w-12 h-12" />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">
                      {isCorrect ? 'Correct! 🎉' : 'Not Quite! 💡'}
                    </h3>
                    <p className="text-white/80">{questions[currentQuestion]?.explanation}</p>
                    {isCorrect && (
                      <p className="text-yellow-300 font-bold mt-2">
                        +{difficulties.find(d => d.id === selectedDifficulty).xp * (streak)} XP
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
{gameState === 'results' && (
          <div className="text-center space-y-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
              <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-4xl font-bold mb-4">Challenge Complete! 🎉</h2>
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-8">
                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-green-400">{score}</div>
                  <div className="text-gray-300">Correct Answers</div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-blue-400">{Math.round((score / 20) * 100)}%</div>
                  <div className="text-gray-300">Accuracy</div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-yellow-400">{xp}</div>
                  <div className="text-gray-300">Total XP</div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {score >= 18 && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-xl">
                    <Award className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold text-xl">🏆 Master Badge Earned!</p>
                  </div>
                )}
                {score >= 15 && score < 18 && (
                  <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-6 rounded-xl">
                    <Star className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold text-xl">⭐️ Great Performance!</p>
                  </div>
                )}
                {score >= 10 && score < 15 && (
                  <div className="bg-gradient-to-r from-green-400 to-teal-500 p-6 rounded-xl">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold text-xl">✅ Good Job!</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center mt-8 flex-wrap">
                <button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setScore(0);
                    setAnswers([]);
                    setQuestions([]);
                    setGameState('game');
                  }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-4 rounded-full font-bold hover:scale-105 transform transition"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setGameState('gameSelect')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-bold hover:scale-105 transform transition"
                >
                  New Challenge
                </button>
                <button
                  onClick={onBack}
                  className="bg-white/10 px-8 py-4 rounded-full font-bold hover:scale-105 transform transition"
                >
                  Back to Map
                </button>
              </div>
            </div>
<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-6">Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Subject:</span>
                  <span className="font-bold">{subjects.find(s => s.id === selectedSubject)?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Challenge Type:</span>
                  <span className="font-bold">{gameTypes.find(g => g.id === selectedGameType)?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Difficulty:</span>
                  <span className="font-bold">{difficulties.find(d => d.id === selectedDifficulty)?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Best Streak:</span>
                  <span className="font-bold text-orange-400">{Math.max(streak, 0)}x</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgoAdventures;
