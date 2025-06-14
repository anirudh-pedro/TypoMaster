const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TestResult = require('../models/TestResult');

// GET /api/leaderboard - Get leaderboard data
router.get('/', async (req, res) => {
  try {
    const { timeframe = 'all', sortBy = 'wpm', limit = 50 } = req.query;

    // For now, return mock data - implement real database queries later
    const mockLeaderboard = [
      { 
        id: 1, 
        username: 'SpeedTyper Pro', 
        wpm: 120, 
        accuracy: 98.5, 
        tests: 150, 
        avgWpm: 115, 
        date: '2023-06-10',
        rank: 1 
      },
      { 
        id: 2, 
        username: 'KeyboardMaster', 
        wpm: 115, 
        accuracy: 97.2, 
        tests: 89, 
        avgWpm: 110, 
        date: '2023-06-09',
        rank: 2 
      },
      { 
        id: 3, 
        username: 'TypeWizard', 
        wpm: 110, 
        accuracy: 96.8, 
        tests: 203, 
        avgWpm: 105, 
        date: '2023-06-08',
        rank: 3 
      },
      { 
        id: 4, 
        username: 'FastFingers', 
        wpm: 108, 
        accuracy: 95.9, 
        tests: 67, 
        avgWpm: 102, 
        date: '2023-06-07',
        rank: 4 
      },
      { 
        id: 5, 
        username: 'TypingNinja', 
        wpm: 105, 
        accuracy: 97.5, 
        tests: 134, 
        avgWpm: 100, 
        date: '2023-06-06',
        rank: 5 
      }
    ];

    // Apply sorting based on sortBy parameter
    let sortedData = [...mockLeaderboard];
    if (sortBy === 'accuracy') {
      sortedData.sort((a, b) => b.accuracy - a.accuracy);
    } else if (sortBy === 'tests') {
      sortedData.sort((a, b) => b.tests - a.tests);
    } else {
      sortedData.sort((a, b) => b.wpm - a.wpm);
    }

    // Apply limit
    const limitedData = sortedData.slice(0, parseInt(limit));

    res.json({
      success: true,
      leaderboard: limitedData,
      total: sortedData.length,
      timeframe,
      sortBy
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

module.exports = router;