const Achievement = require('../models/Achievement');
const TestResult = require('../models/TestResult');
const User = require('../models/User');

// Define all possible achievements - now just four specific challenges
const achievementDefinitions = [
  {
    id: 'test_50',
    title: 'Dedicated Practitioner',
    description: 'Complete 50 typing tests',
    icon: 'check-double',
    category: 'milestone',
    rarity: 'uncommon',
    xp: 100,
    checkCondition: async (userId) => {
      try {
        // First find the user to get their MongoDB _id
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
          console.log(`No user found with Firebase UID: ${userId}`);
          return 0;
        }
        
        // Use that _id to count tests (with detailed logging)
        console.log(`Counting tests for user ${userId} with MongoDB ID: ${user._id}`);
        const count = await TestResult.countDocuments({ user: user._id });
        console.log(`Found ${count} completed tests for user`);
        
        const progress = Math.min(100, Math.round((count / 50) * 100));
        console.log(`50 Tests challenge: ${count}/50 tests, progress: ${progress}%`);
        return progress;
      } catch (error) {
        console.error("Error checking test_50 achievement:", error);
        return 0;
      }
    }
  },
  {
    id: 'test_100',
    title: '100 Tests Completed',
    description: 'Complete 100 typing tests',
    icon: 'check-double',
    category: 'milestone',
    rarity: 'rare', 
    xp: 250,
    checkCondition: async (userId) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) return 0;
      
      const count = await TestResult.countDocuments({ user: user._id });
      const progress = Math.min(100, Math.round((count / 100) * 100));
      console.log(`100 Tests challenge: ${count}/100 tests, progress: ${progress}%`);
      return progress;
    }
  },
  {
    id: 'speed_60wpm',
    title: '60 WPM Speed',
    description: 'Reach 60 WPM in a typing test',
    icon: 'trophy',
    category: 'speed',
    rarity: 'uncommon',
    xp: 150,
    checkCondition: async (userId) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) return 0;
      
      // Check if any test has 60+ WPM
      const test = await TestResult.findOne({ 
        user: user._id, 
        wpm: { $gte: 60 } 
      });
      
      if (!test) {
        // Calculate progress based on best test
        const bestTest = await TestResult.findOne({ user: user._id }).sort({ wpm: -1 });
        const progress = bestTest ? Math.min(100, Math.round((bestTest.wpm / 60) * 100)) : 0;
        console.log(`60 WPM challenge: best ${bestTest?.wpm || 0} WPM, progress: ${progress}%`);
        return progress;
      }
      
      console.log('60 WPM challenge: completed with test:', test.wpm);
      return 100;
    }
  },
  // Update the daily_test achievement definition with better date checking
  {
    id: 'daily_test',
    title: 'Daily Practice',
    description: 'Complete a typing test today',
    icon: 'calendar-check',
    category: 'habit',
    rarity: 'common',
    xp: 25,
    checkCondition: async (userId) => {
      try {
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) return 0;
        
        // Get current date and time
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0); // Midnight today
        
        // Tomorrow midnight
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // ALWAYS check for reset first, regardless of anything else
        console.log(`Checking daily challenge at ${now.toISOString()}, today: ${today.toISOString()}`);
        
        const achievementDoc = await Achievement.findOne({ 
          userId,
          'achievements.id': 'daily_test'
        });
        
        if (achievementDoc) {
          const dailyChallenge = achievementDoc.achievements.find(a => a.id === 'daily_test');
          
          if (dailyChallenge) {
            // If unlocked, check if it's from a previous day
            if (dailyChallenge.unlocked && dailyChallenge.date) {
              const unlockDate = new Date(dailyChallenge.date);
              const unlockDay = new Date(unlockDate);
              unlockDay.setHours(0, 0, 0, 0);
              
              // If unlocked on a previous day, ALWAYS reset it
              if (unlockDay < today) {
                console.log(`RESETTING daily challenge from ${unlockDay.toISOString()}`);
                dailyChallenge.unlocked = false;
                dailyChallenge.progress = 0;
                await achievementDoc.save();
              }
            }
            
            // If no unlock date or invalid date but it's unlocked, reset as safety measure
            if (dailyChallenge.unlocked && (!dailyChallenge.date || isNaN(new Date(dailyChallenge.date).getTime()))) {
              console.log('RESETTING daily challenge with missing/invalid date');
              dailyChallenge.unlocked = false;
              dailyChallenge.progress = 0;
              await achievementDoc.save();
            }
          }
        }
        
        // Now check if any test was completed today
        const test = await TestResult.findOne({ 
          user: user._id,
          date: { 
            $gte: today,
            $lt: tomorrow
          }
        });
        
        const completed = test ? true : false;
        console.log(`Daily test completed today? ${completed}`);
        return completed ? 100 : 0;
      } catch (error) {
        console.error("Error checking daily test achievement:", error);
        return 0;
      }
    }
  }
];

// Get all achievements for a user
exports.getAchievements = async (req, res) => {
  try {
    const { uid, refresh } = req.query;
    
    if (!uid) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    console.log(`Getting achievements for user ${uid}${refresh === 'true' ? ' with force refresh' : ''}`);

    // Find or create user achievements
    let userAchievements = await Achievement.findOne({ userId: uid });
    
    // Initialize if not found
    if (!userAchievements) {
      userAchievements = new Achievement({
        userId: uid,
        achievements: achievementDefinitions.map(def => ({
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          category: def.category,
          unlocked: false,
          progress: 0,
          rarity: def.rarity,
          xp: def.xp
        })),
        stats: {
          totalXP: 0,
          level: 1,
          nextMilestone: 'Complete your first test'
        }
      });
      await userAchievements.save();
    }

    // If force refresh, perform extra checks
    if (refresh === 'true') {
      console.log("Forcing refresh of achievements, including daily challenge check");
      
      // Check daily challenge specifically
      const dailyChallenge = userAchievements.achievements.find(a => a.id === 'daily_test');
      
      if (dailyChallenge && dailyChallenge.unlocked && dailyChallenge.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const unlockDate = new Date(dailyChallenge.date);
        const unlockDay = new Date(unlockDate);
        unlockDay.setHours(0, 0, 0, 0);
        
        // If it was unlocked on a previous day, reset it
        if (unlockDay < today) {
          console.log(`Daily challenge from ${unlockDay.toISOString()} is stale, resetting`);
          dailyChallenge.unlocked = false;
          dailyChallenge.progress = 0;
          await userAchievements.save();
        }
      }
      
      // Now run the standard achievement check process
      await exports.checkAchievements(uid);
      
      // Reload the updated achievements
      userAchievements = await Achievement.findOne({ userId: uid });
    }

    // Return user achievements
    if (userAchievements) {
      return res.json({
        success: true,
        data: {
          achievements: userAchievements.achievements || [],
          stats: userAchievements.stats || {}
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Achievements not found for user'
      });
    }
  } catch (error) {
    console.error('Error in achievements:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Check and update achievements after a test
exports.checkAchievements = async (userId) => {
  try {
    console.log("Checking achievements for Firebase UID:", userId);

    // Find or create user achievements
    let userAchievements = await Achievement.findOne({ userId });
    
    if (!userAchievements) {
      // Initialize empty achievements for new user
      userAchievements = new Achievement({
        userId,
        achievements: achievementDefinitions.map(def => ({
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          category: def.category,
          unlocked: false,
          progress: 0,
          rarity: def.rarity,
          xp: def.xp
        })),
        stats: {
          totalXP: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastTestDate: null,
          nextMilestone: 'Complete your first test'
        }
      });
    }

    // Check if the user has completed a test today to update streak
    const user = await User.findOne({ firebaseUid: userId });
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Find today's test
      const todayTest = await TestResult.findOne({
        user: user._id,
        date: {
          $gte: today,
          $lt: tomorrow
        }
      });

      // Find if there was a test yesterday
      const yesterdayTest = await TestResult.findOne({
        user: user._id,
        date: {
          $gte: yesterday,
          $lt: today
        }
      });

      // Get the last test date from user stats
      const lastTestDate = userAchievements.stats.lastTestDate 
        ? new Date(userAchievements.stats.lastTestDate)
        : null;
      
      // Update streak logic
      if (todayTest) {
        // Save today as the last test date
        userAchievements.stats.lastTestDate = today;
        
        // If last test was yesterday or this is the first test of a new streak
        if (yesterdayTest || !lastTestDate || 
            (lastTestDate && lastTestDate < yesterday && lastTestDate >= new Date(yesterday.getTime() - 86400000))) {
          // Continue or start streak
          userAchievements.stats.currentStreak += 1;
          
          // Update best streak if current is better
          if (userAchievements.stats.currentStreak > userAchievements.stats.bestStreak) {
            userAchievements.stats.bestStreak = userAchievements.stats.currentStreak;
          }
        }
        // If no test yesterday but there's a test today, and it's been more than 1 day
        else if (!yesterdayTest && lastTestDate && lastTestDate < yesterday) {
          // Reset streak but count today
          userAchievements.stats.currentStreak = 1;
        }
        // Otherwise we just keep the existing streak (already tested today)
      }
      // If no test today but last test was over a day ago, reset streak if not already reset
      else if (lastTestDate && lastTestDate < yesterday && userAchievements.stats.currentStreak > 0) {
        userAchievements.stats.currentStreak = 0;
      }
    }

    let totalXP = 0;
    let newlyUnlocked = [];

    // Check each achievement
    for (const achievementDef of achievementDefinitions) {
      const existingAchievement = userAchievements.achievements.find(a => a.id === achievementDef.id);
      
      if (existingAchievement) {
        try {
          // Always check the daily challenge status regardless of unlock state
          if (achievementDef.id === 'daily_test') {
            const progress = await achievementDef.checkCondition(userId);
            existingAchievement.progress = progress;
            
            // Update unlocked status - it could be either newly unlocked or reset from a previous day
            const wasUnlocked = existingAchievement.unlocked;
            existingAchievement.unlocked = progress >= 100;
            
            // If it just got unlocked today, set the date and notify
            if (!wasUnlocked && existingAchievement.unlocked) {
              existingAchievement.date = new Date();
              newlyUnlocked.push(existingAchievement.title);
              console.log(`Daily challenge unlocked on ${existingAchievement.date.toISOString()}`);
            }
          } 
          // For other non-daily achievements, only check if not already unlocked
          else if (!existingAchievement.unlocked) {
            const progress = await achievementDef.checkCondition(userId);
            existingAchievement.progress = progress;
            
            if (progress >= 100) {
              existingAchievement.unlocked = true;
              existingAchievement.date = new Date();
              newlyUnlocked.push(existingAchievement.title);
              console.log(`Achievement unlocked: ${existingAchievement.title}`);
            }
          }
          
          // Add XP if unlocked
          if (existingAchievement.unlocked) {
            totalXP += existingAchievement.xp;
          }
        } catch (error) {
          console.error(`Error checking achievement ${achievementDef.id}:`, error);
        }
      }
    }
    
    // Update stats
    userAchievements.stats.totalXP = totalXP;
    userAchievements.stats.level = Math.floor(totalXP / 500) + 1; // Simple level calculation
    
    // Find next milestone
    const nextAchievement = userAchievements.achievements
      .filter(a => !a.unlocked)
      .sort((a, b) => b.progress - a.progress)[0];
      
    if (nextAchievement) {
      userAchievements.stats.nextMilestone = nextAchievement.description;
    }

    // Save changes
    await userAchievements.save();
    
    // Return newly unlocked achievements
    return newlyUnlocked;
  } catch (error) {
    console.error('Detailed achievement error:', error);
    // Return empty array but don't crash
    return [];
  }
};

// Add this function to force reset the daily challenge
exports.resetDailyChallenge = async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Find user's achievements
    const achievement = await Achievement.findOne({ userId: uid });
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'User achievements not found'
      });
    }
    
    // Find and reset the daily challenge
    const dailyChallenge = achievement.achievements.find(a => a.id === 'daily_test');
    
    if (dailyChallenge) {
      const wasUnlocked = dailyChallenge.unlocked;
      dailyChallenge.unlocked = false;
      dailyChallenge.progress = 0;
      await achievement.save();
      
      return res.json({
        success: true,
        message: `Daily challenge has been reset. Was previously ${wasUnlocked ? 'unlocked' : 'locked'}.`,
        data: {
          achievement: dailyChallenge
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Daily challenge not found'
      });
    }
  } catch (error) {
    console.error('Error resetting daily challenge:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while resetting daily challenge' 
    });
  }
};