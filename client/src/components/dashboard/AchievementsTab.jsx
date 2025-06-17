import React, { useState, useEffect, useCallback } from 'react';
import { FaTrophy, FaMedal, FaUnlock, FaLock, FaFire, FaClock, FaBullseye, FaCheckDouble, FaCalendarCheck, FaSync } from 'react-icons/fa';
import { dashboardService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementsTab = ({ userId, refreshTrigger = 0 }) => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const [resetMessage, setResetMessage] = useState(null);

  // Fetch achievements from database
  const fetchAchievements = useCallback(async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    try {
      console.log("Fetching achievements for user:", userId);
      
      // First check if it's after midnight and daily challenges need reset
      const now = new Date();
      const lastResetCheck = localStorage.getItem('lastDailyResetCheck');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Midnight today
      
      // If we haven't checked for resets today, force a reset check
      let shouldForceRefresh = false;
      if (!lastResetCheck || new Date(lastResetCheck) < today) {
        console.log("Checking for daily challenge reset after midnight");
        localStorage.setItem('lastDailyResetCheck', new Date().toISOString());
        shouldForceRefresh = true;
      }
      
      // Fetch achievements, with potential force refresh
      const response = await dashboardService.getAchievements(userId, shouldForceRefresh);
      
      if (response.success) {
        console.log("Achievement data received:", response.data);
        setAchievements(response.data.achievements || []);
        setStats(response.data.stats || {});
        setError(null);
      } else {
        console.error("Failed to load achievements:", response.message);
        setError('Failed to load achievements');
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Error loading achievements. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  // Initial load and when userId or refreshTrigger changes
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements, refreshTrigger]);

  // Manual refresh button handler
  const handleRefresh = () => {
    fetchAchievements();
  };
  
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'trophy': return <FaTrophy />;
      case 'medal': return <FaMedal />;
      case 'fire': return <FaFire />;
      case 'clock': return <FaClock />;
      case 'bullseye': return <FaBullseye />;
      case 'check-double': return <FaCheckDouble />;
      case 'calendar-check': return <FaCalendarCheck />;
      default: return <FaTrophy />;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'uncommon':
        return 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300';
      case 'rare':
        return 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300';
      case 'epic':
        return 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300';
      case 'legendary':
        return 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300';
      default:
        return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'speed': return 'Speed';
      case 'accuracy': return 'Accuracy';
      case 'streak': return 'Streaks';
      case 'practice': return 'Practice Time';
      case 'milestone': return 'Milestones';
      case 'habit': return 'Habits';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const filterAchievements = () => {
    if (activeCategory === 'all') {
      return achievements;
    }
    if (activeCategory === 'unlocked') {
      return achievements.filter(a => a.unlocked);
    }
    if (activeCategory === 'locked') {
      return achievements.filter(a => !a.unlocked);
    }
    return achievements.filter(a => a.category === activeCategory);
  };

  const getCategories = () => {
    const categories = [...new Set(achievements.map(a => a.category))];
    return ['all', 'unlocked', 'locked', ...categories];
  };

  const forceRefresh = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    try {
      // First check the debug endpoint
      const debugResponse = await dashboardService.debugAchievements(userId);
      console.log('Debug data:', debugResponse);
      
      // Then force a fresh fetch
      const response = await dashboardService.getAchievements(userId, true);
      
      if (response.success) {
        console.log("Achievement data received:", response.data);
        setAchievements(response.data.achievements || []);
        setStats(response.data.stats || {});
        setError(null);
      } else {
        setError('Failed to refresh achievements');
      }
    } catch (err) {
      console.error('Error refreshing achievements:', err);
      setError('Error refreshing data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add this function to your AchievementsTab component
  const forceDailyReset = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    try {
      // Call the reset endpoint
      const response = await dashboardService.resetDailyChallenge(userId);
      console.log('Daily challenge reset response:', response);
      
      if (response.success) {
        // Show success message with our own alert instead of toast
        setResetMessage({
          type: 'success',
          text: 'Daily challenge has been reset successfully'
        });
        // Clear message after 3 seconds
        setTimeout(() => setResetMessage(null), 3000);
        // Refresh achievements
        await fetchAchievements();
      } else {
        setError('Failed to reset daily challenge');
      }
    } catch (err) {
      console.error('Error resetting daily challenge:', err);
      setError('Error resetting daily challenge. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add this function to check if it's past midnight since last check
  const checkMidnightReset = useCallback(() => {
    const now = new Date();
    const lastCheck = localStorage.getItem('lastDailyCheck');
    
    // If we have a last check time
    if (lastCheck) {
      const lastCheckDate = new Date(lastCheck);
      const lastMidnight = new Date(now);
      lastMidnight.setHours(0, 0, 0, 0);
      
      // If last check was before today's midnight, force a refresh
      if (lastCheckDate < lastMidnight) {
        console.log('Past midnight since last check, forcing refresh');
        fetchAchievements();
      }
    }
    
    // Update the last check time
    localStorage.setItem('lastDailyCheck', now.toISOString());
  }, [fetchAchievements]);

  // Add this effect to check for midnight reset
  useEffect(() => {
    checkMidnightReset();
    
    // Also set up an interval to check if midnight passes while the app is open
    const midnightCheckInterval = setInterval(() => {
      checkMidnightReset();
    }, 60000); // Check every minute
    
    return () => clearInterval(midnightCheckInterval);
  }, [checkMidnightReset]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading achievements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h2>
        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={handleRefresh}
            className="absolute right-3 top-3 bg-red-200 dark:bg-red-800 rounded-full p-1"
            title="Try again"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Achievement Notifications */}
      <AnimatePresence>
        {newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 max-w-md"
          >
            <div className="bg-indigo-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center">
                <FaTrophy className="text-2xl mr-3" />
                <div>
                  <h4 className="font-bold">Achievement Unlocked!</h4>
                  <ul className="mt-2">
                    {newlyUnlocked.map(achievement => (
                      <li key={achievement.id} className="flex items-center mb-2">
                        <div className={`p-2 rounded-full mr-2 bg-white bg-opacity-20`}>
                          {getIconComponent(achievement.icon)}
                        </div>
                        <div>
                          <p className="font-semibold">{achievement.title}</p>
                          <p className="text-sm opacity-90">{achievement.description}</p>
                          <p className="text-xs mt-1">+{achievement.xp} XP</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => setNewlyUnlocked([])} 
                className="absolute top-2 right-2 text-white opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Overview */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your typing journey and unlock rewards
            </p>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0">
            {/* Streak count instead of Level */}
            <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 rounded-full px-4 py-1 mr-2">
              <div className="flex items-center">
                <FaFire className="text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {stats?.currentStreak || 0} Day Streak
                </span>
              </div>
            </div>

            {/* Refresh button */}
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full ${
                isRefreshing 
                  ? 'text-gray-400 dark:text-gray-600' 
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
              }`}
              title="Refresh achievements"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Daily Challenge Banner */}
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-full mr-3">
              <FaFire className={`${stats?.currentStreak > 0 ? 'text-amber-500' : 'text-indigo-400'}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {stats?.currentStreak || 0} Day Streak
                </h3>
                {stats?.bestStreak > 0 && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                    Best: {stats.bestStreak} days
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats?.currentStreak > 0 
                  ? `Keep practicing daily to maintain your streak!` 
                  : "Complete a test today to start your streak!"}
              </p>
              <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Daily challenge resets at midnight
              </div>
            </div>
          </div>
        </div>
        
        {/* Category filter */}
        {achievements.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="inline-flex space-x-2 pb-2">
              {getCategories().map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    activeCategory === category 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All' : 
                  category === 'unlocked' ? 'Unlocked' : 
                  category === 'locked' ? 'Locked' : 
                  getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Achievements grid */}
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterAchievements().map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-lg overflow-hidden border ${
                  achievement.unlocked 
                    ? 'border-indigo-200 dark:border-indigo-900'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`p-4 ${achievement.unlocked ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <div className="flex items-start">
                    <div className={`p-3 rounded-full mr-4 ${getRarityColor(achievement.rarity)}`}>
                      {getIconComponent(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                          {achievement.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {achievement.description}
                      </p>
                      
                      {/* Progress bar */}
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-in-out" 
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                        </div>
                        </div>
                      )}
                      
                      {/* Unlock status */}
                      <div className="mt-2 flex justify-between items-center">
                        <span className={`text-xs flex items-center ${
                          achievement.unlocked 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {achievement.unlocked 
                            ? <><FaUnlock className="mr-1" /> Unlocked {achievement.date && `on ${new Date(achievement.date).toLocaleDateString()}`}</>
                            : <><FaLock className="mr-1" /> Locked</>
                          }
                        </span>
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded">
                          +{achievement.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaTrophy className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No achievements found. Start typing tests to unlock achievements!</p>
            {/* <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800/50 flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button> */}
          </div>
        )}
        
        {/* Debug button - ONLY SHOW IN DEVELOPMENT */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-4 flex space-x-2">
            {/* <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 
                rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800/50 text-sm flex items-center"
            >
              <FaSync className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button> */}
          </div>
        )}
      </div>

      {/* Reset message alert */}
      {resetMessage && (
        <div className={`mb-4 p-3 rounded-md ${
          resetMessage.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50' 
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
        }`}>
          <div className="flex items-center">
            {resetMessage.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {resetMessage.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsTab;