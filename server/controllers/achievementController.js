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
  {
    id: 'daily_test',
    title: 'Daily Practice',
    description: 'Complete a typing test today',
    icon: 'calendar-check',
    category: 'habit',
    rarity: 'common',
    xp: 25,
    checkCondition: async (userId) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) return 0;
      
      // Get current date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get tomorrow's date at midnight
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Check if any test was completed today
      const test = await TestResult.findOne({ 
        user: user._id,
        date: { 
          $gte: today,
          $lt: tomorrow
        }
      });
      
      // If test exists for today, mark as 100% complete, otherwise 0%
      const completed = test ? true : false;
      console.log(`Daily test challenge: completed today? ${completed} (Current time: ${new Date().toISOString()})`);
      return completed ? 100 : 0;
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

    // If force refresh requested, recalculate all achievements
    if (refresh === 'true') {
      console.log(`Force refreshing achievements for user ${uid}`);
      
      // Check each achievement
      for (const achievementDef of achievementDefinitions) {
        const existingAchievement = userAchievements.achievements.find(a => a.id === achievementDef.id);
        
        if (existingAchievement) {
          try {
            // Recalculate progress
            const progress = await achievementDef.checkCondition(uid);
            
            // Update progress
            existingAchievement.progress = progress;
            
            // Check if needs to be unlocked
            if (progress >= 100 && !existingAchievement.unlocked) {
              existingAchievement.unlocked = true;
              existingAchievement.date = new Date();
              console.log(`Achievement unlocked: ${existingAchievement.title}`);
            }
          } catch (error) {
            console.error(`Error refreshing achievement ${achievementDef.id}:`, error);
          }
        }
      }
      
      // Recalculate total XP
      let totalXP = 0;
      userAchievements.achievements.forEach(a => {
        if (a.unlocked) totalXP += a.xp;
      });
      userAchievements.stats.totalXP = totalXP;
      
      // Update level and other stats
      userAchievements.stats.unlockedAchievements = 
        userAchievements.achievements.filter(a => a.unlocked).length;
      userAchievements.stats.totalAchievements = userAchievements.achievements.length;
      
      // Find next milestone
      const nextAchievement = userAchievements.achievements
        .filter(a => !a.unlocked)
        .sort((a, b) => b.progress - a.progress)[0];
        
      if (nextAchievement) {
        userAchievements.stats.nextMilestone = nextAchievement.description;
      }
      
      // Save updated data
      await userAchievements.save();
      console.log('Achievements refreshed and saved successfully');
    }

    // Return user achievements
    return res.json({
      success: true,
      data: {
        achievements: userAchievements.achievements,
        stats: {
          ...userAchievements.stats,
          unlockedAchievements: userAchievements.achievements.filter(a => a.unlocked).length,
          totalAchievements: userAchievements.achievements.length
        }
      }
    });
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
          // Always recheck daily challenge regardless of current status
          if (achievementDef.id === 'daily_test' || !existingAchievement.unlocked) {
            const progress = await achievementDef.checkCondition(userId);
            
            // Update progress
            existingAchievement.progress = progress;
            
            // For daily challenge, update unlocked status based on current day
            if (achievementDef.id === 'daily_test') {
              existingAchievement.unlocked = progress >= 100;
              if (existingAchievement.unlocked) {
                existingAchievement.date = new Date();
              }
            } 
            // For other achievements, unlock if completed and not already unlocked
            else if (progress >= 100 && !existingAchievement.unlocked) {
              existingAchievement.unlocked = true;
              existingAchievement.date = new Date();
              newlyUnlocked.push(existingAchievement.title);
              console.log(`Achievement unlocked: ${existingAchievement.title}`);
            }
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