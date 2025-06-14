const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const User = require('../models/User');

// GET /api/dashboard/stats - Get user dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // For now, return mock data - implement user authentication middleware later
    const mockStats = {
      testsCompleted: 25,
      avgWpm: 68,
      avgAccuracy: 94.2,
      bestWpm: 85,
      bestAccuracy: 98.1,
      recentTests: [
        { date: '2023-06-01', wpm: 65, accuracy: 92.3, text: 'Sample text...' },
        { date: '2023-05-30', wpm: 70, accuracy: 95.1, text: 'Another sample...' },
        { date: '2023-05-29', wpm: 62, accuracy: 91.8, text: 'Test passage...' }
      ],
      progressData: [
        { date: '2023-05-01', wpm: 45, accuracy: 88 },
        { date: '2023-05-15', wpm: 58, accuracy: 91 },
        { date: '2023-06-01', wpm: 68, accuracy: 94 }
      ]
    };

    res.json(mockStats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// POST /api/dashboard/test-result - Save test result
router.post('/test-result', async (req, res) => {
  try {
    const { wpm, accuracy, text, duration, errorCount, characters } = req.body;

    // For now, just return success - implement user authentication and database saving later
    const mockResult = {
      id: Date.now(),
      wpm,
      accuracy,
      text: text.substring(0, 50) + '...',
      duration,
      errorCount,
      characters,
      date: new Date().toISOString()
    };

    res.json({
      success: true,
      result: mockResult,
      message: 'Test result saved successfully'
    });
  } catch (error) {
    console.error('Save test result error:', error);
    res.status(500).json({ error: 'Failed to save test result' });
  }
});

module.exports = router;