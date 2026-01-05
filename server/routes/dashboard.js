const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { checkAchievements } = require('../controllers/achievementController');

// Helper function to update user statistics
async function updateUserStats(user, wpm, accuracy, duration, characters) {
  try {
    const newTestsCompleted = user.stats.testsCompleted + 1;
    const newTotalTime = user.stats.totalTime + duration;
    const newTotalCharacters = user.stats.totalCharacters + characters;
    
    // Calculate new averages
    const currentAvgWpmTotal = user.stats.avgWpm * user.stats.testsCompleted;
    const newAvgWpm = (currentAvgWpmTotal + wpm) / newTestsCompleted;
    
    const currentAvgAccuracyTotal = user.stats.avgAccuracy * user.stats.testsCompleted;
    const newAvgAccuracy = (currentAvgAccuracyTotal + accuracy) / newTestsCompleted;
    
    // Update user stats
    user.stats.testsCompleted = newTestsCompleted;
    user.stats.totalTime = newTotalTime;
    user.stats.totalCharacters = newTotalCharacters;
    user.stats.avgWpm = newAvgWpm;
    user.stats.avgAccuracy = newAvgAccuracy;
    
    // Update best scores if applicable
    if (wpm > user.stats.bestWpm) {
      user.stats.bestWpm = wpm;
    }
    
    if (accuracy > user.stats.bestAccuracy) {
      user.stats.bestAccuracy = accuracy;
    }
    
    await user.save();
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}

// Middleware to verify user is authenticated
const verifyUser = async (req, res, next) => {
  try {
    // Get UID from request (sent by frontend)
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Find the user in the database
    let user = await User.findOne({ firebaseUid: uid });
    
    // Auto-create user if they don't exist (handles fallback auth scenarios)
    if (!user) {
      console.log(`verifyUser: Creating new user with firebaseUid: ${uid}`);
      user = new User({
        firebaseUid: uid,
        email: `user_${uid.substring(0, 8)}@typomaster.app`,
        name: `Typist_${uid.substring(0, 6)}`,
        stats: {
          testsCompleted: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          bestWpm: 0,
          bestAccuracy: 0,
          totalTime: 0,
          totalCharacters: 0
        }
      });
      await user.save();
      console.log(`verifyUser: New user created: ${user._id}`);
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// GET /api/dashboard/stats - Get user dashboard stats
router.get('/stats', verifyUser, async (req, res) => {
  try {
    const user = req.user;
    
    // Use aggregation pipeline for efficient data retrieval
    const statsAggregation = await TestResult.aggregate([
      { $match: { user: user._id } },
      {
        $facet: {
          // Recent tests
          recentTests: [
            { $sort: { date: -1 } },
            { $limit: 10 }
          ],
          // Progress data for charts
          progressData: [
            { $sort: { date: -1 } },
            { $limit: 30 }
          ],
          // Tests from 30 days ago for comparison
          oldTests: [
            {
              $match: {
                date: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              }
            },
            { $sort: { date: -1 } },
            { $limit: 10 }
          ],
          // Overall statistics
          overallStats: [
            {
              $group: {
                _id: null,
                totalTests: { $sum: 1 },
                avgWpm: { $avg: "$wpm" },
                avgAccuracy: { $avg: "$accuracy" },
                maxWpm: { $max: "$wpm" },
                maxAccuracy: { $max: "$accuracy" }
              }
            }
          ]
        }
      }
    ]);

    const {
      recentTests,
      progressData,
      oldTests,
      overallStats
    } = statsAggregation[0];

    // Calculate WPM change
    const oldAvgWpm = oldTests.length > 0 
      ? oldTests.reduce((sum, test) => sum + test.wpm, 0) / oldTests.length 
      : user.stats.avgWpm;
    
    const recentAvgWpm = recentTests.length > 0 
      ? recentTests.reduce((sum, test) => sum + test.wpm, 0) / recentTests.length 
      : user.stats.avgWpm;
    const wpmChange = recentAvgWpm - oldAvgWpm;
    const wpmChangeFormatted = wpmChange >= 0 ? `+${wpmChange.toFixed(1)}` : wpmChange.toFixed(1);
    
    // Get user's global rank
    const betterUsers = await User.countDocuments({ 'stats.bestWpm': { $gt: user.stats.bestWpm } });
    const totalUsers = await User.countDocuments();
    const globalRank = betterUsers + 1;
    const percentile = Math.round((totalUsers - globalRank) / totalUsers * 100);
    
    const dashboardData = {
      stats: {
        testsCompleted: user.stats.testsCompleted,
        avgWpm: user.stats.avgWpm.toFixed(1),
        avgAccuracy: user.stats.avgAccuracy.toFixed(1),
        bestWpm: user.stats.bestWpm,
        bestAccuracy: user.stats.bestAccuracy.toFixed(1),
        wpmChange: wpmChangeFormatted,
        globalRank: `#${globalRank}`,
        percentile: `Top ${percentile}% of all users`
      },
      recentTests: recentTests.map(test => ({
        id: test._id,
        date: test.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        wpm: test.wpm,
        accuracy: `${test.accuracy.toFixed(1)}%`,
        text: test.text.substring(0, 50) + (test.text.length > 50 ? '...' : '')
      })),
      progressData: progressData.map(test => ({
        date: test.date.toISOString().split('T')[0],
        wpm: test.wpm,
        accuracy: test.accuracy
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

router.post('/test-result', async (req, res) => {
  try {
    const { uid } = req.query; 
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    let user = await User.findOne({ firebaseUid: uid });
    
    // Auto-create user if they don't exist (handles fallback auth scenarios)
    if (!user) {
      console.log(`Creating new user with firebaseUid: ${uid}`);
      user = new User({
        firebaseUid: uid,
        email: `user_${uid.substring(0, 8)}@typomaster.app`,
        name: `Typist_${uid.substring(0, 6)}`,
        stats: {
          testsCompleted: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          bestWpm: 0,
          bestAccuracy: 0,
          totalTime: 0,
          totalCharacters: 0
        }
      });
      await user.save();
      console.log(`New user created: ${user._id}`);
    }
    
    const { wpm, accuracy, text, duration, errorCount, characters } = req.body;

    if (!wpm || !accuracy || !text || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Consistent validation logic
    if (accuracy < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result: accuracy too low (minimum 10%)'
      });
    }
    
    if (errorCount > characters * 0.8) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result: too many errors relative to characters typed'
      });
    }
    
    // WPM validation based on accuracy
    let maxAllowedWPM = 220;
    if (accuracy < 50) {
      maxAllowedWPM = 100;
    } else if (accuracy < 70) {
      maxAllowedWPM = 150;
    } else if (accuracy < 90) {
      maxAllowedWPM = 200;
    }
    
    if (wpm > maxAllowedWPM) {
      return res.status(400).json({
        success: false,
        message: `Invalid result: WPM too high for accuracy level (max ${maxAllowedWPM} for ${accuracy.toFixed(1)}% accuracy)`
      });
    }
    
    const validatedWpm = Math.min(wpm, maxAllowedWPM);
    
    const testResult = new TestResult({
      wpm: validatedWpm,
      accuracy,
      text,
      duration,
      errorCount: errorCount || 0,
      characters,
      user: user._id,
      date: new Date()
    });
    
    await testResult.save();
    
    // Update user statistics
    await updateUserStats(user, validatedWpm, accuracy, duration, characters);
    
    let unlockedAchievements = [];
    try {
      if (typeof checkAchievements === 'function') {
        unlockedAchievements = await checkAchievements(uid);
      }
    } catch (achievementError) {
      console.error('Error checking achievements, but continuing:', achievementError);
    }
    
    res.json({
      success: true,
      result: {
        id: testResult._id,
        wpm,
        accuracy,
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        duration,
        date: testResult.date.toISOString()
      },
      message: 'Test result saved successfully',
      unlockedAchievements
    });
  } catch (error) {
    console.error('Detailed error saving test result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save test result',
      error: error.message
    });
  }
});

router.get('/history', verifyUser, async (req, res) => {
  try {
    const user = req.user;
    const { limit = 20, page = 1 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const tests = await TestResult.find({ user: user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalTests = await TestResult.countDocuments({ user: user._id });
    
    const formattedTests = tests.map(test => ({
      id: test._id,
      wpm: test.wpm,
      accuracy: `${test.accuracy.toFixed(1)}%`,
      text: test.text.substring(0, 50) + (test.text.length > 50 ? '...' : ''),
      duration: test.duration,
      errorCount: test.errorCount,
      characters: test.characters,
      date: test.date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    
    res.json({
      success: true,
      data: {
        tests: formattedTests,
        pagination: {
          total: totalTests,
          page: parseInt(page),
          pages: Math.ceil(totalTests / limit)
        }
      }
    });
  } catch (error) {
    console.error('Test history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test history',
      error: error.message
    });
  }
});

router.get('/analytics', verifyUser, async (req, res) => {
  try {
    const user = req.user;
    const { period = 'month' } = req.query;
    
    console.log('Analytics request - User:', user.firebaseUid, 'Period:', period);
    
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (period === 'all') {
      // For 'all' period, don't filter by date
      startDate.setFullYear(2020); // Set to a very old date
    }
    
    console.log('Analytics - Start date filter:', startDate);
    
    // First, check total tests for this user (for debugging)
    const totalUserTests = await TestResult.countDocuments({ user: user._id });
    console.log('Analytics - Total tests for user:', totalUserTests);
    
    const tests = await TestResult.find({
      user: user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    console.log('Analytics - Tests found in period:', tests.length);
    
    // If no tests found in the period but user has tests, try the last 3 months
    if (tests.length === 0 && totalUserTests > 0) {
      console.log('Analytics - No tests in period, expanding to 3 months');
      const extendedStartDate = new Date();
      extendedStartDate.setMonth(extendedStartDate.getMonth() - 3);
      
      const extendedTests = await TestResult.find({
        user: user._id,
        date: { $gte: extendedStartDate }
      }).sort({ date: 1 });
      
      if (extendedTests.length > 0) {
        tests.push(...extendedTests);
        console.log('Analytics - Found tests in extended period:', extendedTests.length);
      }
    }
    
    const dailyData = {};
    tests.forEach(test => {
      const day = test.date.toISOString().split('T')[0];
      
      if (!dailyData[day]) {
        dailyData[day] = {
          wpm: [],
          accuracy: [],
          tests: 0
        };
      }
      
      dailyData[day].wpm.push(test.wpm);
      dailyData[day].accuracy.push(test.accuracy);
      dailyData[day].tests++;
    });
    
    const chartData = Object.keys(dailyData).map(day => {
      const data = dailyData[day];
      const avgWpm = data.wpm.reduce((sum, val) => sum + val, 0) / data.wpm.length;
      const avgAccuracy = data.accuracy.reduce((sum, val) => sum + val, 0) / data.accuracy.length;
      
      return {
        date: day,
        wpm: avgWpm.toFixed(1),
        accuracy: avgAccuracy.toFixed(1),
        tests: data.tests
      };
    });
    
    let improvement = 0;
    if (chartData.length >= 2) {
      const firstTests = chartData.slice(0, Math.min(3, chartData.length)).map(d => parseFloat(d.wpm));
      const lastTests = chartData.slice(-Math.min(3, chartData.length)).map(d => parseFloat(d.wpm));
      
      const firstAvg = firstTests.reduce((sum, val) => sum + val, 0) / firstTests.length;
      const lastAvg = lastTests.reduce((sum, val) => sum + val, 0) / lastTests.length;
      
      improvement = ((lastAvg - firstAvg) / firstAvg * 100).toFixed(1);
    }
    
    const timeStats = {
      totalTime: (user.stats.totalTime / 60).toFixed(1), 
      avgTimePerTest: (user.stats.totalTime / user.stats.testsCompleted).toFixed(1),
      testsPerDay: tests.length > 0 ? (tests.length / (period === 'week' ? 7 : period === 'month' ? 30 : 365)).toFixed(1) : 0
    };
    
    res.json({
      success: true,
      data: {
        chartData,
        improvement: `${improvement}%`,
        periodStats: {
          avgWpm: chartData.length > 0 ? 
            (chartData.reduce((sum, day) => sum + parseFloat(day.wpm), 0) / chartData.length).toFixed(1) : 0,
          avgAccuracy: chartData.length > 0 ? 
            (chartData.reduce((sum, day) => sum + parseFloat(day.accuracy), 0) / chartData.length).toFixed(1) : 0,
          totalTests: tests.length,
          bestDay: chartData.length > 0 ? 
            chartData.reduce((best, current) => parseFloat(current.wpm) > parseFloat(best.wpm) ? current : best).date : null
        },
        timeStats
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
});

module.exports = router;