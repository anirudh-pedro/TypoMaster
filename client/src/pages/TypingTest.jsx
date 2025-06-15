import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { FaRedo, FaClock, FaKeyboard, FaTachometerAlt, FaCheck, FaSave, FaSpinner, FaDatabase } from 'react-icons/fa';
import { AppContext } from '../App';
import { dashboardService } from '../services/api';
import axios from 'axios';
import LoginModal from '../components/LoginModal';

const paragraphs = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet. Typing quickly and accurately is an essential skill for programmers and writers alike. Practice regularly to improve your speed and precision.",
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer languages, such as JavaScript, Python, and C++.",
  "The best way to become a good typist is through regular practice and proper technique. Keep your fingers positioned correctly on the home row and try to use all ten fingers while typing. Look at the screen, not at your keyboard.",
  "Artificial intelligence is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions.",
  "The Internet is a global network of billions of computers and other electronic devices. With the Internet, it's possible to access almost any information, communicate with anyone else in the world, and do much more. You can do all this by connecting a computer to the Internet."
];

const TypingTest = () => {
  const { user } = useContext(AppContext) || {}; // Get user from context
  
  const [paragraph, setParagraph] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  // Initialize with a random paragraph
  useEffect(() => {
    getRandomParagraph();
  }, []);
  
  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && isActive) {
      // Time's up - calculate results
      endTest();
    }
  }, [isActive, timeLeft]);
  
  const getRandomParagraph = () => {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    setParagraph(paragraphs[randomIndex]);
    
    // Reset state
    setInput('');
    setTimeLeft(60);
    setIsActive(false);
    setResults(null);
    setCurrentWordIndex(0);
    setErrors(0);
    setSaveSuccess(false);
    setSaveError(null);
    
    // Focus on input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Start timer on first input
    if (!isActive && value.length === 1) {
      setIsActive(true);
    }
    
    setInput(value);
    
    // Calculate current word and errors
    const words = paragraph.split(' ');
    const inputWords = value.split(' ');
    
    // Update current word index
    setCurrentWordIndex(inputWords.length - 1);
    
    // Calculate errors - compare each character
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (paragraph[i] !== value[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);
  };
  
  const endTest = () => {
    setIsActive(false);
    
    // Calculate results
    const wordsTyped = input.split(' ').length;
    const chars = input.length;
    
    // Calculate accuracy
    const accuracy = Math.max(0, Math.floor(((chars - errors) / chars) * 100)) || 0;
    
    // Calculate words per minute (WPM)
    const minutes = (60 - timeLeft) / 60;
    const wpm = Math.floor(wordsTyped / minutes) || 0;
    
    // Create result object
    const resultData = { 
      wpm, 
      accuracy, 
      errors, 
      charsTyped: chars,
      correctChars: chars - errors,
      time: 60 - timeLeft,
      text: paragraph,
      date: new Date().toISOString()
    };
    
    // Store results locally
    setResults(resultData);
  };
  
  const saveResultToDatabase = async () => {
    if (!results) return;
    
    // If user is not logged in, show login modal
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Prepare test data for submission
      const testData = {
        text: results.text,
        wpm: results.wpm,
        accuracy: results.accuracy,
        duration: results.time,
        errorCount: results.errors,
        characters: results.charsTyped
      };
      
      // Use the service function
      const response = await dashboardService.saveTestResult(user.uid, testData);
      
      if (response.success) {
        setSaveSuccess(true);
        
        // Wait a moment, then redirect to dashboard with refresh param
        setTimeout(() => {
          navigate('/dashboard?tab=achievements&refresh=true');
        }, 1500);
      } else {
        setSaveError(response.message || 'Failed to save your results. Please try again.');
      }
    } catch (error) {
      console.error('Error saving test results:', error);
      setSaveError('An error occurred while saving your results. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleGuestContinue = () => {
    setShowLoginModal(false);
    // Save as guest or redirect to results
    navigate('/results', { state: { results } });
  };
  
  const saveAndContinue = () => {
    getRandomParagraph();
  };
  
  const viewLeaderboard = () => {
    navigate('/leaderboard');
  };
  
  const viewDetailedResults = () => {
    if (results) {
      navigate('/results', { state: { results } });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      
      <div className="max-w-4xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {results ? 'Your Results' : 'Typing Test'}
        </h1>
        
        {!results ? (
          // Typing test interface
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Timer and controls */}
            <div className="bg-gray-100 dark:bg-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <FaClock className="text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className={`font-mono text-lg font-bold ${timeLeft <= 10 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {timeLeft}s
                </span>
              </div>
              
              <button 
                onClick={getRandomParagraph}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <FaRedo className="mr-1" /> New Text
              </button>
            </div>
            
            {/* Paragraph display */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-mono">
                {paragraph.split(' ').map((word, wordIndex) => (
                  <span 
                    key={wordIndex} 
                    className={`
                      ${wordIndex === currentWordIndex ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}
                      ${wordIndex < currentWordIndex ? 'text-gray-400 dark:text-gray-500' : ''}
                    `}
                  >
                    {word.split('').map((char, charIndex) => {
                      const inputWords = input.split(' ');
                      const currentInputWord = inputWords[wordIndex] || '';
                      const isCurrentChar = wordIndex === currentWordIndex && charIndex === currentInputWord.length;
                      const isTyped = wordIndex < currentWordIndex || (wordIndex === currentWordIndex && charIndex < currentInputWord.length);
                      const isCorrect = isTyped && currentInputWord[charIndex] === char;
                      const isIncorrect = isTyped && currentInputWord[charIndex] !== char;
                      
                      return (
                        <span
                          key={charIndex}
                          className={`
                            ${isCurrentChar ? 'border-b-2 border-indigo-500 dark:border-indigo-400 animate-pulse' : ''}
                            ${isCorrect ? 'text-green-600 dark:text-green-400' : ''}
                            ${isIncorrect ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' : ''}
                          `}
                        >
                          {char}
                        </span>
                      );
                    })}
                    {' '}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Input area */}
            <div className="p-6">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Start typing here..."
                className="w-full h-24 p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white font-mono resize-none"
                disabled={timeLeft === 0}
                autoFocus
              />
              
              {/* Live stats */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-center">
                  <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                    <FaTachometerAlt className="mr-1" />
                    <span className="text-xs uppercase font-semibold">Speed</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {isActive 
                      ? Math.floor((input.split(' ').length / ((60 - timeLeft) / 60)) || 0) 
                      : 0} WPM
                  </span>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-center">
                  <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-1">
                    <FaCheck className="mr-1" />
                    <span className="text-xs uppercase font-semibold">Accuracy</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {input.length > 0 
                      ? Math.max(0, Math.floor(((input.length - errors) / input.length) * 100)) 
                      : 100}%
                  </span>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-center">
                  <div className="flex items-center justify-center text-red-600 dark:text-red-400 mb-1">
                    <span className="text-xs uppercase font-semibold">Errors</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {errors}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Help text */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {isActive 
                ? "Keep typing! Your time will automatically end after 60 seconds."
                : "Start typing to begin the test. You'll have 60 seconds to type as much as you can."}
            </div>
          </div>
        ) : (
          // Results screen
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                  <FaKeyboard className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Complete!</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Here's how you did:
                </p>
              </div>
              
              {/* Results grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {results.wpm}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mt-1">
                    Words Per Minute
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {results.accuracy}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mt-1">
                    Accuracy
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-gray-700 dark:text-gray-300">
                    {results.charsTyped}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mt-1">
                    Characters Typed
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {results.errors}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mt-1">
                    Errors
                  </div>
                </div>
              </div>
              
              {/* Performance feedback */}
              <div className="mb-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {results.wpm < 30 
                    ? "Keep practicing!" 
                    : results.wpm < 60 
                      ? "Good job!" 
                      : "Excellent typing!"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {results.wpm < 30 
                    ? "Your typing speed is below average. Regular practice will help you improve." 
                    : results.wpm < 60 
                      ? "Your typing speed is around the average. Keep it up!" 
                      : "Your typing speed is above average. You're doing great!"}
                </p>
              </div>
              
              {/* SUBMIT BUTTON - Prominently displayed */}
              <div className="mb-8">
                {!saveSuccess && (
                  <button 
                    onClick={saveResultToDatabase}
                    disabled={isSaving}
                    className={`w-full flex items-center justify-center px-8 py-4 text-lg font-bold rounded-md text-white bg-green-600 hover:bg-green-700 shadow-lg transform transition-all duration-150 ${
                      isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Saving Result...
                      </>
                    ) : (
                      <>
                        <FaDatabase className="mr-2" /> Submit Result to Dashboard
                      </>
                    )}
                  </button>
                )}
                
                {/* Show feedback when button is clicked */}
                {saveError && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400">
                    <p className="font-medium">Error!</p>
                    <p>{saveError}</p>
                    <p className="text-sm mt-1">Please try again or contact support if the problem persists.</p>
                  </div>
                )}
                
                {/* Success message */}
                {saveSuccess && (
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md text-center border-l-4 border-green-500">
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      Results saved successfully! Redirecting to dashboard...
                    </p>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={saveAndContinue}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
                
                <button 
                  onClick={viewDetailedResults}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Detailed Results
                </button>
                
                <button 
                  onClick={viewLeaderboard}
                  className="inline-flex items-center justify-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-white dark:bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  View Leaderboard
                </button>
              </div>
              
              {/* Login prompt - only shown if user is NOT logged in */}
              {!user && (
                <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-center">
                  <p className="text-indigo-800 dark:text-indigo-300 mb-2">
                    Want to save your results and track your progress?
                  </p>
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500"
                  >
                    Log in or Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onContinueAsGuest={handleGuestContinue}
      />
    </div>
  );
};

export default TypingTest;