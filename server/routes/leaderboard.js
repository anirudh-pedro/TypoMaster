const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { authenticateUser } = require('../middleware/auth');

// Get global leaderboard data
router.get('/', leaderboardController.getGlobalLeaderboard);

// Get user's ranking
router.get('/user/:userId', authenticateUser, leaderboardController.getUserRanking);

// Get real-time leaderboard updates
router.get('/realtime', leaderboardController.getRealTimeLeaderboard);

// Add these new routes to your existing leaderboard routes
router.get('/daily-challenge', leaderboardController.getDailyChallengeLeaderboard);
router.get('/all-time-users', leaderboardController.getAllTimeUserRankings);

module.exports = router;