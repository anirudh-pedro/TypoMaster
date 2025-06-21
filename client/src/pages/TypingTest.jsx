import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { FaRedo, FaClock, FaKeyboard, FaTachometerAlt, FaCheck, FaSave, FaSpinner, FaDatabase } from 'react-icons/fa';
import { AppContext } from '../App';
import { dashboardService } from '../services/api';
import axios from 'axios';
import LoginModal from '../components/LoginModal';

const paragraphs = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet. Typing quickly and accurately is an essential skill for programmers and writers alike. Practice regularly to improve your speed and precision. The benefits of touch typing extend beyond just increased productivity. It reduces mental fatigue, allowing you to focus more on the content rather than the process of typing. Many professional typists can maintain speeds of over 100 words per minute with near-perfect accuracy. This level of proficiency comes from consistent practice and proper technique. Keep your fingers on the home row and develop muscle memory through repetition. As you practice, your brain creates neural pathways that allow your fingers to move without conscious thought, similar to how experienced musicians play instruments without thinking about individual notes. Regular typing practice also improves your spelling and grammar as you become more familiar with common words and phrases.",
  
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer languages, such as JavaScript, Python, and C++. Modern programming has evolved significantly from the early days of punch cards and assembly language. Today, developers have access to powerful integrated development environments, libraries, and frameworks that accelerate the development process. Object-oriented programming organizes code into reusable objects that contain both data and behavior. Functional programming, on the other hand, treats computation as the evaluation of mathematical functions and avoids changing state and mutable data. Both paradigms have their strengths and weaknesses, and experienced developers often blend techniques from each approach. Version control systems like Git have revolutionized how programmers collaborate, allowing multiple developers to work on the same codebase simultaneously without conflicts.",
  
  "The best way to become a good typist is through regular practice and proper technique. Keep your fingers positioned correctly on the home row and try to use all ten fingers while typing. Look at the screen, not at your keyboard. Maintaining good posture is also essential for typing efficiently over long periods. Sit with your back straight, feet flat on the floor, and wrists slightly elevated above the keyboard. Many people develop poor typing habits early on, such as using only two or four fingers. These habits can be difficult to break later, so it's important to learn proper technique from the beginning. Online typing tutors can provide structured lessons and immediate feedback on your progress. They typically start with simple exercises focusing on the home row keys and gradually introduce additional keys as you improve. Some typing programs also include games and challenges to make the learning process more engaging. Remember that consistency is key—fifteen minutes of daily practice is more effective than several hours once a week.",
  
  "Artificial intelligence is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions. The term 'artificial intelligence' was coined in 1956, but AI has become more popular today thanks to increased data volumes, advanced algorithms, and improvements in computing power and storage. Early AI research in the 1950s explored topics like problem solving and symbolic methods. In the 1960s, the US Department of Defense took interest in this type of work and began training computers to mimic basic human reasoning. Machine learning, deep learning, and neural networks represent the current cutting edge of artificial intelligence research. These approaches allow computers to 'learn' from data rather than following explicitly programmed instructions. This has led to breakthroughs in computer vision, natural language processing, and game playing. AI systems like AlphaGo have defeated world champions in complex games like Go, which were previously thought to be too intuitive for computers to master.",
  
  "The Internet is a global network of billions of computers and other electronic devices. With the Internet, it's possible to access almost any information, communicate with anyone else in the world, and do much more. You can do all this by connecting a computer to the Internet. The history of the Internet dates back to the 1960s when researchers developed ARPANET, the first network to implement TCP/IP. This protocol suite continues to be the foundation of the modern Internet. The World Wide Web, often confused with the Internet itself, is actually just one service that runs on the Internet. Tim Berners-Lee invented the web in 1989 while working at CERN. He created HTML, HTTP, and the concept of URLs, which together formed the foundation of the web as we know it today. The Internet has transformed nearly every aspect of modern life. It enables new forms of commerce, entertainment, social interaction, and learning. The rise of cloud computing has further expanded the Internet's capabilities, allowing users to access powerful computing resources and store vast amounts of data remotely. As the Internet continues to evolve, emerging technologies like 5G, IoT, and edge computing promise to create new opportunities and challenges."
];

const TypingTest = () => {
  const { user } = useContext(AppContext) || {}; 
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
  const paragraphContainerRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    getRandomParagraph();
  }, []);
  
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && isActive) {
      endTest();
    }
  }, [isActive, timeLeft]);
  
  useEffect(() => {
    const cursorElement = document.querySelector('.cursor-position');
    if (cursorElement) {
      cursorElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [input]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const getRandomParagraph = () => {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    setParagraph(paragraphs[randomIndex]);
    
    setInput('');
    setTimeLeft(60);
    setIsActive(false);
    setResults(null);
    setCurrentWordIndex(0);
    setErrors(0);
    setSaveSuccess(false);
    setSaveError(null);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const isLegitimateTyping = (value) => {
    if (/\s{2,}/.test(value)) return false;
    
    if (value.trim().length === 0 && value.length > 0) return false;
    
    const hasRealWords = value.split(' ').some(word => word.length > 1);
    
    const consistsOfSameChar = /^(.)\1+$/.test(value);
    
    return hasRealWords && !consistsOfSameChar;
  };
  
const detectInvalidTypingPattern = (input) => {
  const alternatingPattern = /^(. )+.?$/;
  if (alternatingPattern.test(input)) {
    return true;
  }
  
  const repeatedCharsPattern = /(.)\1{9,}/; 
  if (repeatedCharsPattern.test(input)) {
    return true;
  }
  
  const words = input.split(' ').filter(word => word.length > 0);
  const singleCharWords = words.filter(word => word.length === 1).length;
  if (words.length >= 5 && (singleCharWords / words.length) > 0.7) {
    return true; 
  }
  
  return false;
};

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    
    if (value.length > input.length + 10) {
      return;
    }
    
    if (!isActive && value.length === 1) {
      setIsActive(true);
    }
    
    if (isLegitimateTyping(value) || value.length <= 1) {
      setInput(value);
      
      const words = paragraph.split(' ');
      const inputWords = value.split(' ').filter(word => word.length > 0); 
      setCurrentWordIndex(inputWords.length - 1);
      
      const detailedErrors = calculateDetailedErrors(paragraph.substring(0, value.length), value);
      setErrors(detailedErrors.total);
    } else {
      // Optionally alert the user about invalid input
      // But don't update the input state
    }
    
    if (paragraphContainerRef.current) {
      const spans = paragraphContainerRef.current.querySelectorAll('span');
      
      if (value.length > 0 && spans[value.length]) {
        const currentSpan = spans[value.length];
        const containerRect = paragraphContainerRef.current.getBoundingClientRect();
        const spanRect = currentSpan.getBoundingClientRect();
        
        const bottomThreshold = containerRect.bottom - 100; 
        
        if (spanRect.top > bottomThreshold || spanRect.top > containerRect.bottom) {
          currentSpan.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center' 
          });
        }
      }
    }
  };
  
  const endTest = () => {
    setIsActive(false);
    
    const inputText = input;
    const paragraphText = paragraph.substring(0, inputText.length);
    const chars = inputText.length;
    
    const detailedErrors = calculateDetailedErrors(paragraphText, inputText);
    
    const accuracy = Math.max(0, Math.floor(((chars - detailedErrors.total) / chars) * 100)) || 0;
    
    const isInvalidPattern = detectInvalidTypingPattern(inputText);
    
    const minutes = (60 - timeLeft) / 60;
    
    const standardWordLength = 5; 
    let wpm;
    
    if (isInvalidPattern || accuracy < 15) {
      wpm = Math.floor((chars / standardWordLength) * accuracy / 100 / minutes) || 0;
    } else {
      const realWords = inputText.split(' ').filter(word => word.length >= 2);
      
      if (realWords.length > 5) {
        wpm = Math.floor(realWords.length / minutes) || 0;
      } else {
        wpm = Math.floor((chars / standardWordLength) / minutes) || 0;
      }
    }
    
    const maxReasonableWPM = 220;
    const finalWPM = Math.min(wpm, maxReasonableWPM);
    
    const resultData = {
      wpm: finalWPM,
      accuracy, 
      errors: detailedErrors.total,
      errorDetails: detailedErrors,
      charsTyped: chars,
      correctChars: chars - detailedErrors.total,
      time: 60 - timeLeft,
      text: paragraph,
      invalidPattern: isInvalidPattern,
      date: new Date().toISOString()
    };
    
    setResults(resultData);
    
   
  };
  
  const saveResultToDatabase = async () => {
    if (!results) return;
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (results.invalidPattern) {
      setSaveError("Invalid typing pattern detected. Please type naturally.");
      return;
    }
    
    if (results.accuracy < 15) {
      setSaveError("Accuracy is too low. Please try again with more careful typing.");
      return;
    }
    
    if (results.errors > results.charsTyped * 0.7) {
      setSaveError("Too many errors compared to text length. Please try again.");
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const testData = {
        text: results.text,
        wpm: results.wpm,
        accuracy: results.accuracy,
        duration: results.time,
        errorCount: results.errors,
        characters: results.charsTyped,
        errorDetails: results.errorDetails 
      };
      
      const response = await dashboardService.saveTestResult(user.uid, testData);
      
      if (response.success) {
        setSaveSuccess(true);
        
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
    navigate('/results', { state: { results } });
  };
  
  const saveAndContinue = () => {
    getRandomParagraph();
  };
  

  const formatParagraphLines = (text, charsPerLine = 60) => {
    const lines = [];
    let currentLine = '';
    
    const words = text.split(' ');
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length > charsPerLine && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
      }
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    return lines;
  };
  
  const formattedLines = useMemo(() => formatParagraphLines(paragraph), [paragraph]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      
      <div className="max-w-4xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {results ? 'Your Results' : 'Typing Test'}
        </h1>
        
        {!results ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
            
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <div 
                  ref={paragraphContainerRef}
                  className="font-mono text-md border-2 rounded-lg p-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 overflow-y-auto overflow-x-hidden"
                  style={{ 
                    height: "240px",
                    maxHeight: "50vh",
                    lineHeight: "1.8",
                    width: "100%",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    userSelect: "none"
                  }}
                  onCopy={handleCopy}
                  onContextMenu={handleContextMenu}
                >
                  <div style={{ maxWidth: "100%" }}>
                    {paragraph.split('').map((char, index) => {
                      let bgColor = '';
                      let textColor = '';
                      let cursorClass = '';
                      
                      if (index < input.length) {
                        if (char === input[index]) {
                          textColor = 'text-green-600 dark:text-green-400';
                        } else {
                          textColor = 'text-red-600 dark:text-red-400';
                          bgColor = 'bg-red-100 dark:bg-red-900/30';
                        }
                      } else if (index === input.length) {
                        bgColor = 'bg-gray-200 dark:bg-gray-600'; 
                        cursorClass = 'cursor-position';
                      }
                      
                      return (
                        <span 
                          key={index} 
                          className={`${textColor} ${bgColor} ${cursorClass}`}
                          style={{ 
                            display: "inline", 
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word"
                          }}
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(input.length / paragraph.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{Math.round((input.length / paragraph.length) * 100)}% complete</span>
                  <span>{input.length}/{paragraph.length} characters</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onPaste={handlePaste}
                onCopy={handleCopy}
                onCut={handleCut}
                onContextMenu={handleContextMenu}
                placeholder="Start typing here..."
                className="w-full h-24 p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white font-mono resize-none"
                disabled={timeLeft === 0}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                autoFocus
              />
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-center">
                  <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                    <FaTachometerAlt className="mr-1" />
                    <span className="text-xs uppercase font-semibold">Speed</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {isActive 
                      ? Math.floor((input.split(' ').filter(word => word.length > 0).length / ((60 - timeLeft) / 60)) || 0) 
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
            
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {isActive 
                ? "Keep typing! Your time will automatically end after 60 seconds."
                : "Start typing to begin the test. You'll have 60 seconds to type as much as you can."}
            </div>
          </div>
        ) : (
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
                
                {saveError && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400">
                    <p className="font-medium">Error!</p>
                    <p>{saveError}</p>
                    <p className="text-sm mt-1">Please try again or contact support if the problem persists.</p>
                  </div>
                )}
                
                {saveSuccess && (
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md text-center border-l-4 border-green-500">
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      Results saved successfully! Redirecting to dashboard...
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={saveAndContinue}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
                
                
              </div>
              
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
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onContinueAsGuest={handleGuestContinue}
      />
    </div>
  );
};

const calculateDetailedErrors = (originalText, typedText) => {
  const errors = {
    total: 0,
    substitutions: 0, 
    insertions: 0,    
    deletions: 0,     
    transpositions: 0, 
    misspelled: 0,     
    punctuation: 0,    
    capitalization: 0, 
    common: {}         
  };
  
  if (!originalText || !typedText) {
    return errors;
  }
  
  const originalChars = originalText.split('');
  const typedChars = typedText.split('');
  
  let i = 0;
  let j = 0;
  
  while (i < originalChars.length || j < typedChars.length) {
    if (j >= typedChars.length && i < originalChars.length) {
      errors.deletions++;
      errors.total++;
      i++;
      continue;
    }
    
    if (i >= originalChars.length && j < typedChars.length) {
      errors.insertions++;
      errors.total++;
      j++;
      continue;
    }
    
    if (originalChars[i] === typedChars[j]) {
      i++;
      j++;
      continue;
    }
    
    if (i + 1 < originalChars.length && j + 1 < typedChars.length &&
        originalChars[i] === typedChars[j + 1] && 
        originalChars[i + 1] === typedChars[j]) {
      errors.transpositions++;
      errors.total++;
      i += 2;
      j += 2;
      continue;
    }
    
    if (originalChars[i].toLowerCase() === typedChars[j].toLowerCase() && 
        originalChars[i] !== typedChars[j]) {
      errors.capitalization++;
      errors.total++;
      i++;
      j++;
      continue;
    }
    
    if (isPunctuation(originalChars[i]) || isPunctuation(typedChars[j])) {
      errors.punctuation++;
      errors.total++;
      i++;
      j++;
      continue;
    }
    
    errors.substitutions++;
    errors.total++;
    
    const errorPair = `${originalChars[i]} → ${typedChars[j]}`;
    errors.common[errorPair] = (errors.common[errorPair] || 0) + 1;
    
    i++;
    j++;
  }
  
  const originalWords = originalText.split(/\s+/);
  const typedWords = typedText.split(/\s+/);
  
  for (let w = 0; w < Math.min(originalWords.length, typedWords.length); w++) {
    if (originalWords[w] !== typedWords[w] && 
        !isPunctuation(originalWords[w]) && 
        !isPunctuation(typedWords[w])) {
      errors.misspelled++;
    }
  }
  
  return errors;
};

const isPunctuation = (char) => {
  return /[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g.test(char);
};


const handleCopy = (e) => {
  e.preventDefault();
  return false;
};

const handlePaste = (e) => {
  e.preventDefault();
  return false;
};

const handleCut = (e) => {
  e.preventDefault();
  return false;
};

const handleContextMenu = (e) => {
  e.preventDefault();
  return false;
};

export default TypingTest;