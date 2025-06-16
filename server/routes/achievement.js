const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const TestResult = require('../models/TestResult');
const User = require('../models/User');

// Get all achievements for a user
router.get('/', achievementController.getAchievements);

// Add a debug route to check test count
router.get('/debug/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    const testCount = await TestResult.countDocuments({ user: user._id });
    const tests = await TestResult.find({ user: user._id }).sort({ date: -1 }).limit(5);
    
    return res.json({
      success: true,
      data: {
        uid: uid,
        mongoId: user._id,
        testCount: testCount,
        recentTests: tests.map(t => ({
          id: t._id,
          date: t.date,
          wpm: t.wpm,
          accuracy: t.accuracy
        }))
      }
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add this route to your achievements router
router.post('/reset-daily', achievementController.resetDailyChallenge);

module.exports = router;