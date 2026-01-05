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

export const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
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

  const updateUser = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('typomaster_user');
  };

  const addAchievementNotifications = (achievements) => {
    setAchievementNotifications(achievements);
    
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
    
    setTimeout(() => {
      setAchievementNotifications([]);
    }, 10000);
  };

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

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

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