import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import TypingTest from './pages/TypingTest';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import './App.css';

// Create the App Context
export const AppContext = createContext();

// Custom hook to use the App Context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// App Context Provider Component
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage on app start
    try {
      const savedUser = localStorage.getItem('typomaster_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [achievementNotifications, setAchievementNotifications] = useState([]);

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('typomaster_user', JSON.stringify(user));
        console.log('User saved to localStorage:', user);
      } else {
        localStorage.removeItem('typomaster_user');
        console.log('User removed from localStorage');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }, [user]);

  // Function to update user
  const updateUser = (userData) => {
    console.log('updateUser called with:', userData);
    setUser(userData);
    localStorage.setItem('typomaster_user', JSON.stringify(userData));
  };

  // Function to logout user
  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('typomaster_user');
  };

  // Add achievements to notification system
  const addAchievementNotifications = (achievements) => {
    setAchievementNotifications(achievements);
    
    // Clear notifications after 10 seconds
    setTimeout(() => {
      setAchievementNotifications([]);
    }, 10000);
  };

  // Context value
  const contextValue = {
    user,
    updateUser,
    logout,
    isLoading,
    setIsLoading,
    achievementNotifications,
    addAchievementNotifications
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// App Content Component
const AppContent = () => {
  const { user, logout, isLoading } = useAppContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="App">
      <Nav user={user} logout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TypingTest />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard user={user} logout={logout} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

// Main App Component
const App = () => {
  // Define user state at the top level so both Nav and Dashboard can access it
  const [user, setUser] = useState(null);
  const [achievementNotifications, setAchievementNotifications] = useState([]);
  
  // In your AppContext.Provider, include user and setUser
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;