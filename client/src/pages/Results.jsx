import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { FaKeyboard, FaTrophy, FaRedo, FaChartLine, FaCheck, FaTimes, FaClock, FaHome, FaShare, FaTwitter, FaFacebook } from 'react-icons/fa';

const Results = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [averageStats, setAverageStats] = useState({ wpm: 0, accuracy: 0 });
  const [improvement, setImprovement] = useState({ wpm: 0, accuracy: 0 });
  const [copied, setCopied] = useState(false);

  // Get results from location state or redirect to typing test
  useEffect(() => {
    if (location.state && location.state.results) {
      setResults(location.state.results);
      
      // In a real app, you would fetch user's average stats from API
      if (user) {
        // Mock average stats for demonstration
        setAverageStats({
          wpm: 68,
          accuracy: 92.5
        });
        
        // Calculate improvement
        const wpmImprovement = location.state.results.wpm - 68;
        const accuracyImprovement = location.state.results.accuracy - 92.5;
        setImprovement({
          wpm: wpmImprovement,
          accuracy: accuracyImprovement
        });
      }
    } else {
      // If no results, redirect to typing test
      navigate('/test');
    }
  }, [location, navigate, user]);

  // Determine performance level based on WPM
  const getPerformanceLevel = (wpm) => {
    if (wpm >= 100) return { label: 'Professional', color: 'text-purple-600 dark:text-purple-400' };
    if (wpm >= 80) return { label: 'Expert', color: 'text-indigo-600 dark:text-indigo-400' };
    if (wpm >= 60) return { label: 'Advanced', color: 'text-blue-600 dark:text-blue-400' };
    if (wpm >= 40) return { label: 'Intermediate', color: 'text-green-600 dark:text-green-400' };
    if (wpm >= 20) return { label: 'Beginner', color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Novice', color: 'text-red-600 dark:text-red-400' };
  };

  // Get tips based on performance
  const getTips = () => {
    if (!results) return [];

    const tips = [];
    
    if (results.wpm < 40) {
      tips.push('Focus on accuracy over speed. Speed will come with practice.');
      tips.push('Practice home row keys (asdf jkl;) to build muscle memory.');
    }
    
    if (results.wpm >= 40 && results.wpm < 60) {
      tips.push('Try to use all fingers rather than just a few.');
      tips.push('Look at the screen, not your keyboard, while typing.');
    }
    
    if (results.wpm >= 60 && results.wpm < 80) {
      tips.push('Work on maintaining a steady rhythm while typing.');
      tips.push('Practice with varied texts to improve versatility.');
    }
    
    if (results.wpm >= 80) {
      tips.push('Challenge yourself with technical texts and uncommon words.');
      tips.push('Focus on reducing errors to further improve your effective WPM.');
    }
    
    if (results.accuracy < 90) {
      tips.push('Slow down slightly to improve accuracy.');
    }
    
    return tips;
  };

  // Copy results to clipboard
  const copyResults = () => {
    if (!results) return;
    
    const text = `I just typed at ${results.wpm} WPM with ${results.accuracy}% accuracy on TypoMaster! Try to beat my score: https://typomaster.example.com`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Share on social media
  const shareOnTwitter = () => {
    if (!results) return;
    
    const text = `I just typed at ${results.wpm} WPM with ${results.accuracy}% accuracy on TypoMaster! Try to beat my score! #TypoMaster #TypingTest`;
    const url = 'https://typomaster.example.com';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    if (!results) return;
    
    const url = 'https://typomaster.example.com';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  // If no results, show loading
  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Nav user={user} />
        <div className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  const performanceLevel = getPerformanceLevel(results.wpm);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav user={user} />
      
      <div className="max-w-4xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Typing Results</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Here's how you performed in your typing test
          </p>
        </div>
        
        {/* Main Results Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col items-center">
              {/* Trophy Icon with Performance Level */}
              <div className={`h-20 w-20 rounded-full flex items-center justify-center ${
                results.wpm >= 60 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <FaTrophy className={`h-10 w-10 ${
                  results.wpm >= 60 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
              </div>
              
              <h2 className={`mt-4 text-2xl font-bold ${performanceLevel.color}`}>
                {performanceLevel.label} Typist
              </h2>
              
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {results.wpm < 40 
                  ? "Keep practicing to improve your speed and accuracy!"
                  : results.wpm < 60
                    ? "Good work! You're making great progress."
                    : results.wpm < 80
                      ? "Impressive typing skills! You're faster than most people."
                      : "Outstanding performance! You're among the top typists."}
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* WPM Stat */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.wpm}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  WPM
                </div>
                {user && (
                  <div className={`text-xs mt-1 flex items-center justify-center ${
                    improvement.wpm >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {improvement.wpm >= 0 ? (
                      <>
                        <FaChartLine className="mr-1" />
                        +{improvement.wpm.toFixed(1)} from average
                      </>
                    ) : (
                      <>
                        <FaChartLine className="mr-1" />
                        {improvement.wpm.toFixed(1)} from average
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Accuracy Stat */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.accuracy}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Accuracy
                </div>
                {user && (
                  <div className={`text-xs mt-1 flex items-center justify-center ${
                    improvement.accuracy >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {improvement.accuracy >= 0 ? (
                      <>
                        <FaChartLine className="mr-1" />
                        +{improvement.accuracy.toFixed(1)}% from average
                      </>
                    ) : (
                      <>
                        <FaChartLine className="mr-1" />
                        {improvement.accuracy.toFixed(1)}% from average
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Errors Stat */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.errors}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Errors
                </div>
              </div>
              
              {/* Time Stat */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.time || 60}s
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Time
                </div>
              </div>
            </div>
            
            {/* Typed Characters Stats */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Character Analysis
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {results.charsTyped || results.wpm * 5}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Characters Typed
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {results.correctChars || (results.wpm * 5) - results.errors}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Correct Characters
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      <FaCheck className="inline-block mr-1" />
                      {((results.correctChars || (results.wpm * 5) - results.errors) / (results.charsTyped || results.wpm * 5) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Correct Rate
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      <FaTimes className="inline-block mr-1" />
                      {results.errors}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Error Count
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tips Section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Tips to Improve
              </h3>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                <ul className="space-y-2">
                  {getTips().map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-indigo-800 dark:text-indigo-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/test"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FaRedo className="mr-2" />
                Try Again
              </Link>
              
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FaTrophy className="mr-2" />
                View Leaderboard
              </Link>
              
              <button
                onClick={() => setShowShare(!showShare)}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FaShare className="mr-2" />
                Share Results
              </button>
            </div>
            
            {/* Share Options */}
            {showShare && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center mb-3 text-gray-700 dark:text-gray-300">
                  Share your results with friends
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={copyResults}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy Results'}
                  </button>
                  
                  <button
                    onClick={shareOnTwitter}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-400 hover:bg-blue-500 transition-colors"
                  >
                    <FaTwitter className="mr-2" />
                    Twitter
                  </button>
                  
                  <button
                    onClick={shareOnFacebook}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <FaFacebook className="mr-2" />
                    Facebook
                  </button>
                </div>
              </div>
            )}
            
            {/* Login Prompt if not logged in */}
            {!user && (
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center">
                <p className="text-yellow-800 dark:text-yellow-300 mb-2">
                  Want to save your results and track your progress over time?
                </p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-yellow-700 dark:text-yellow-400 font-semibold hover:text-yellow-600 dark:hover:text-yellow-300"
                >
                  Log in or create an account <span className="ml-1 text-lg">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Back to Home Link */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
            <FaHome className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;