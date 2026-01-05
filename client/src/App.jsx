import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Nav from './components/Nav';
import Home from './pages/Home';
import TypingTest from './pages/TypingTest';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import 'react-toastify/dist/ReactToastify.css';

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
      } else {
        localStorage.removeItem('typomaster_user');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }, [user]);

  // Function to update user
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Function to logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('typomaster_user');
  };

  // Add achievements to notification system
  const addAchievementNotifications = (achievements) => {
    setAchievementNotifications(achievements);
    
    // Show toast notifications for new achievements
    achievements.forEach(achievement => {
      import('react-toastify').then(({ toast }) => {
        toast.success(
          `🏆 Achievement Unlocked: ${achievement.title}`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      });
    });
    
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
        {/* Catch-all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;