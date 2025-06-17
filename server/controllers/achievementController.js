const Achievement = require('../models/Achievement');
const User = require('../models/User');
const TestResult = require('../models/TestResult');

// Default achievements template
const defaultAchievements = [
  {
    id: 'first_test',
    title: 'Getting Started',
    description: 'Complete your first typing test',
    icon: '🚀',
    xp: 10,
    criteria: { testsCompleted: 1 }
  },
  {
    id: 'daily_test',
    title: 'Daily Typist',
    description: 'Complete a typing test today',
    icon: '📆',
    xp: 5,
    criteria: { dailyTest: true },
    resetsDaily: true
  },
  {
    id: 'speed_30',
    title: 'Speed Demon I',
    description: 'Achieve 30 WPM in a test',
    icon: '⚡',
    xp: 15,
    criteria: { wpm: 30 }
  },
  // Add more achievements as needed
  {
    id: 'speed_50',
    title: 'Speed Demon II',
    description: 'Achieve 50 WPM in a test',
    icon: '🔥',
    xp: 25,
    criteria: { wpm: 50 }
  },
  {
    id: 'speed_80',
    title: 'Speed Demon III',
    description: 'Achieve 80 WPM in a test',
    icon: '⚡⚡',
    xp: 50,
    criteria: { wpm: 80 }
  },
  {
    id: 'speed_100',
    title: 'Speed Master',
    description: 'Achieve 100 WPM in a test',
    icon: '🏆',
    xp: 100,
    criteria: { wpm: 100 }
  },
  {
    id: 'accuracy_95',
    title: 'Precision Typist',
    description: 'Complete a test with 95% accuracy',
    icon: '🎯',
    xp: 30,
    criteria: { accuracy: 95 }
  },
  {
    id: 'tests_10',
    title: 'Dedicated Typist',
    description: 'Complete 10 typing tests',
    icon: '📊',
    xp: 20,
    criteria: { testsCompleted: 10 }
  },
  {
    id: 'tests_50',
    title: 'Typing Enthusiast',
    description: 'Complete 50 typing tests',
    icon: '💻',
    xp: 50,
    criteria: { testsCompleted: 50 }
  },
  {
    id: 'streak_3',
    title: 'Consistency I',
    description: 'Maintain a 3-day typing streak',
    icon: '📅',
    xp: 30,
    criteria: { streak: 3 }
  },
  {
    id: 'streak_7',
    title: 'Consistency II',
    description: 'Maintain a 7-day typing streak',
    icon: '📅📅',
    xp: 70,
    criteria: { streak: 7 }
  },
  {
    id: 'streak_30',
    title: 'Typing Dedication',
    description: 'Maintain a 30-day typing streak',
    icon: '🏅',
    xp: 200,
    criteria: { streak: 30 }
  }
];

// Get user's achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find or create user achievements
    let userAchievements = await Achievement.findOne({ userId: uid });
    
    if (!userAchievements) {
      // Create new achievements record for user
      userAchievements = new Achievement({
        userId: uid,
        achievements: defaultAchievements.map(a => ({
          ...a,
          unlocked: false,
          progress: 0,
          date: null
        })),
        stats: {
          totalXP: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastTestDate: null
        }
      });
      
      await userAchievements.save();
    }
    
    res.status(200).json({
      success: true,
      data: userAchievements
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievements',
      error: error.message
    });
  }
};

// Single, comprehensive implementation of checkAchievements
exports.checkAchievements = async (uid) => {
  try {
    if (!uid) return [];
    
    // Find user first
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      console.log('User not found for achievement checking');
      return [];
    }
    
    // Get user's achievement document or create one
    let userAchievements = await Achievement.findOne({ userId: uid });
    if (!userAchievements) {
      userAchievements = new Achievement({
        userId: uid,
        achievements: defaultAchievements.map(a => ({
          ...a,
          unlocked: false,
          progress: 0,
          date: null
        })),
        stats: {
          totalXP: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastTestDate: null,
          nextMilestone: 'Complete 5 tests'
        }
      });
    }
    
    // Get user's test history
    const testResults = await TestResult.find({ user: user._id }).sort({ date: -1 });
    const totalTests = testResults.length;
    
    // Track newly unlocked achievements
    const newlyUnlocked = [];
    let xpGained = 0;
    
    // Get the daily challenge achievement
    const dailyChallenge = userAchievements.achievements.find(a => a.id === 'daily_test');
    
    // Check if a test was completed today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hasTestToday = testResults.some(test => test.date >= today);
    
    // Check if daily challenge was previously unlocked today
    const wasDailyChallengeUnlockedToday = dailyChallenge && 
                                          dailyChallenge.unlocked && 
                                          dailyChallenge.date && 
                                          new Date(dailyChallenge.date) >= today;
    
    // Get last test date
    const lastTestDate = userAchievements.stats.lastTestDate ? 
                        new Date(userAchievements.stats.lastTestDate) : null;
    
    // Calculate days since last test if available
    const daysSinceLastTest = lastTestDate ? 
      Math.floor((today - new Date(lastTestDate.getFullYear(), lastTestDate.getMonth(), lastTestDate.getDate())) / (1000 * 60 * 60 * 24)) : null;
    
    // Update the streak only when a test is completed today AND daily challenge wasn't already unlocked today
    if (hasTestToday) {
      // Update last test date to today
      userAchievements.stats.lastTestDate = now;
      
      // Check if this is the first test that unlocks the daily challenge today
      if (!wasDailyChallengeUnlockedToday && hasTestToday) {
        // Unlock daily challenge
        if (dailyChallenge) {
          dailyChallenge.unlocked = true;
          dailyChallenge.progress = 100;
          dailyChallenge.date = now;
          
          // Only add XP if it wasn't already unlocked today
          if (!wasDailyChallengeUnlockedToday) {
            xpGained += dailyChallenge.xp;
            newlyUnlocked.push(dailyChallenge);
          }
          
          // Update streak - only if this is the first time unlocking today
          // Streak continues if last test was yesterday or this is first test
          if (daysSinceLastTest === 1 || daysSinceLastTest === null) {
            userAchievements.stats.currentStreak++;
          } else if (daysSinceLastTest > 1) {
            // Streak broken (more than 1 day since last test)
            userAchievements.stats.currentStreak = 1;
          }
          
          // Update best streak if current is higher
          if (userAchievements.stats.currentStreak > userAchievements.stats.bestStreak) {
            userAchievements.stats.bestStreak = userAchievements.stats.currentStreak;
          }
        }
      }
    }
    
    // Check first test achievement
    const firstTestAch = userAchievements.achievements.find(a => a.id === 'first_test');
    if (firstTestAch && !firstTestAch.unlocked && totalTests > 0) {
      firstTestAch.unlocked = true;
      firstTestAch.progress = 100;
      firstTestAch.date = now;
      xpGained += firstTestAch.xp;
      newlyUnlocked.push(firstTestAch);
    }
    
    // Check tests completed achievements
    const testsCompletedAchievements = userAchievements.achievements.filter(a => 
      a.criteria && a.criteria.testsCompleted && !a.unlocked
    );
    
    testsCompletedAchievements.forEach(achievement => {
      const target = achievement.criteria.testsCompleted;
      const progress = Math.min(100, Math.floor((totalTests / target) * 100));
      achievement.progress = progress;
      
      if (totalTests >= target) {
        achievement.unlocked = true;
        achievement.date = now;
        xpGained += achievement.xp;
        newlyUnlocked.push(achievement);
      }
    });
    
    // Check WPM achievements
    if (testResults.length > 0) {
      const bestWpm = Math.max(...testResults.map(test => test.wpm));
      const wpmAchievements = userAchievements.achievements.filter(a => 
        a.criteria && a.criteria.wpm && !a.unlocked
      );
      
      wpmAchievements.forEach(achievement => {
        const target = achievement.criteria.wpm;
        const progress = Math.min(100, Math.floor((bestWpm / target) * 100));
        achievement.progress = progress;
        
        if (bestWpm >= target) {
          achievement.unlocked = true;
          achievement.date = now;
          xpGained += achievement.xp;
          newlyUnlocked.push(achievement);
        }
      });
      
      // Check accuracy achievements
      const bestAccuracy = Math.max(...testResults.map(test => test.accuracy));
      const accuracyAchievements = userAchievements.achievements.filter(a => 
        a.criteria && a.criteria.accuracy && !a.unlocked
      );
      
      accuracyAchievements.forEach(achievement => {
        const target = achievement.criteria.accuracy;
        const progress = Math.min(100, Math.floor((bestAccuracy / target) * 100));
        achievement.progress = progress;
        
        if (bestAccuracy >= target) {
          achievement.unlocked = true;
          achievement.date = now;
          xpGained += achievement.xp;
          newlyUnlocked.push(achievement);
        }
      });
    }
    
    // Check streak achievements
    const streakAchievements = userAchievements.achievements.filter(a => 
      a.criteria && a.criteria.streak && !a.unlocked
    );
    
    streakAchievements.forEach(achievement => {
      const target = achievement.criteria.streak;
      const currentStreak = userAchievements.stats.currentStreak;
      const progress = Math.min(100, Math.floor((currentStreak / target) * 100));
      achievement.progress = progress;
      
      if (currentStreak >= target) {
        achievement.unlocked = true;
        achievement.date = now;
        xpGained += achievement.xp;
        newlyUnlocked.push(achievement);
      }
    });
    
    // Update total XP
    userAchievements.stats.totalXP += xpGained;
    
    // Save changes
    await userAchievements.save();
    
    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Process test result and check for achievements
exports.processTestResult = async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Check achievements
    const newlyUnlocked = await exports.checkAchievements(uid);
    
    res.status(200).json({
      success: true,
      data: {
        newAchievements: newlyUnlocked
      }
    });
  } catch (error) {
    console.error('Error processing test result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process test result',
      error: error.message
    });
  }
};