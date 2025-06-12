import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import TypingTest from './pages/TypingTest';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Results from './pages/Results';
import NotFound from './pages/NotFound';

// Create context for global state
export const AppContext = createContext();

// Auth popup component
const AuthPromptModal = ({ isOpen, onClose, onLogin, onGuest }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div 
          className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          style={{ position: 'relative', zIndex: 60 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Sign in to track your progress
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sign in to save your test results, track your progress over time, and compete on the leaderboard. Or continue as a guest to try out the typing test without an account.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onLogin}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onGuest}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Continue as Guest
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route component
const ProtectedTestRoute = ({ user }) => {
  const [showAuthPrompt, setShowAuthPrompt] = useState(!user);
  const navigate = useNavigate();
  
  // If user is already authenticated, don't show the prompt
  useEffect(() => {
    if (user) {
      setShowAuthPrompt(false);
    }
  }, [user]);
  
  const handleLogin = () => {
    setShowAuthPrompt(false);
    navigate('/login');
  };
  
  const handleGuest = () => {
    setShowAuthPrompt(false);
    // Continue to test as guest
  };
  
  const handleClose = () => {
    setShowAuthPrompt(false);
    navigate('/');
  };
  
  return (
    <>
      <AuthPromptModal 
        isOpen={showAuthPrompt} 
        onClose={handleClose} 
        onLogin={handleLogin} 
        onGuest={handleGuest} 
      />
      <TypingTest user={user} />
    </>
  );
};

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    avgWpm: 0,
    avgAccuracy: 0,
    testsCompleted: 0
  });

  // Check if user is logged in on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    
    // Load recent tests from localStorage
    const storedTests = localStorage.getItem('recentTests');
    if (storedTests) {
      try {
        setRecentTests(JSON.parse(storedTests));
      } catch (error) {
        console.error('Error parsing stored tests:', error);
      }
    }
  }, []);

  // Save tests to localStorage whenever they change
  useEffect(() => {
    if (recentTests.length > 0) {
      localStorage.setItem('recentTests', JSON.stringify(recentTests));
      
      // Update global stats
      const totalWpm = recentTests.reduce((sum, test) => sum + test.wpm, 0);
      const totalAccuracy = recentTests.reduce((sum, test) => sum + test.accuracy, 0);
      
      setGlobalStats({
        avgWpm: Math.round(totalWpm / recentTests.length),
        avgAccuracy: (totalAccuracy / recentTests.length).toFixed(1),
        testsCompleted: recentTests.length
      });
    }
  }, [recentTests]);

  // Add a new test result
  const addTestResult = (result) => {
    const newTest = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...result
    };
    
    setRecentTests(prev => [newTest, ...prev].slice(0, 50)); // Keep last 50 tests
    
    // Navigate to results page with the test data
    navigate('/results', { state: { results: newTest } });
  };

  // Logout function
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/'); // Redirect to home page after logout
  };

  // Login function
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/dashboard'); // Redirect to dashboard after login
  };

  // Context value
  const contextValue = {
    user,
    recentTests,
    globalStats,
    addTestResult,
    setUser: handleLogin,
    logout: handleLogout  // Add this line
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Routes>
        <Route path="/" element={<Home user={user} logout={handleLogout} />} />
        <Route path="/login" element={<Login setUser={handleLogin} />} />
        <Route path="/test" element={<ProtectedTestRoute user={user} />} />
        <Route path="/results" element={<Results user={user} recentTests={recentTests} />} />
        <Route path="/dashboard" element={<Dashboard user={user} logout={handleLogout} recentTests={recentTests} globalStats={globalStats} />} />
        <Route path="/leaderboard" element={<Leaderboard user={user} globalStats={globalStats} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;