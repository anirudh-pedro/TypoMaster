const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { checkAchievements } = require('../controllers/achievementController');

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
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
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
    // User is already attached from middleware
    const user = req.user;
    
    // Get recent test results
    const recentTests = await TestResult.find({ user: user._id })
      .sort({ date: -1 })
      .limit(10);
    
    // Calculate recent progress (last 6 results)
    const progressData = await TestResult.find({ user: user._id })
      .sort({ date: -1 })
      .limit(30);
    
    // Calculate WPM change (from 30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldTests = await TestResult.find({ 
      user: user._id, 
      date: { $lt: thirtyDaysAgo } 
    }).sort({ date: -1 }).limit(5);
    
    const newTests = await TestResult.find({ 
      user: user._id,
      date: { $gt: thirtyDaysAgo } 
    }).sort({ date: -1 }).limit(5);
    
    // Calculate WPM change
    const oldAvgWpm = oldTests.length > 0 
      ? oldTests.reduce((sum, test) => sum + test.wpm, 0) / oldTests.length 
      : user.stats.avgWpm;
    
    const newAvgWpm = newTests.length > 0 
      ? newTests.reduce((sum, test) => sum + test.wpm, 0) / newTests.length 
      : user.stats.avgWpm;
    
    const wpmChange = newAvgWpm - oldAvgWpm;
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
    
    console.log('Saving test result for user:', uid);
    console.log('Test data:', req.body);
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const user = await User.findOne({ firebaseUid: uid });
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const { wpm, accuracy, text, duration, errorCount, characters } = req.body;

    if (!wpm || !accuracy || !text || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    if (accuracy < 15 && wpm > 60) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result: high speed with extremely low accuracy'
      });
    }
    
    if (errorCount >= characters * 0.9) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result: error count too high'
      });
    }
    
    let maxWpm = 220;
    if (accuracy < 50) {
      maxWpm = 120; 
    }
    const validatedWpm = Math.min(wpm, maxWpm);
    
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
    
    console.log('Saving test result with data:', {
      wpm,
      accuracy,
      text: text.substring(0, 20) + '...',
      duration,
      errorCount,
      characters,
      userId: user._id
    });
    
    await testResult.save();
    console.log('Test result saved successfully');
    
    let unlockedAchievements = [];
    try {
      if (typeof checkAchievements === 'function') {
        console.log('Checking achievements for user');
        unlockedAchievements = await checkAchievements(uid);
        console.log('Unlocked achievements:', unlockedAchievements);
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
    
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const tests = await TestResult.find({
      user: user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
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