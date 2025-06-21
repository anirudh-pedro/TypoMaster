const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { authenticateUser } = require('../middleware/auth');

router.get('/', leaderboardController.getGlobalLeaderboard);

router.get('/user/:userId', authenticateUser, leaderboardController.getUserRanking);

router.get('/realtime', leaderboardController.getRealTimeLeaderboard);

router.get('/daily-challenge', leaderboardController.getDailyChallengeLeaderboard);
router.get('/all-time-users', leaderboardController.getAllTimeUserRankings);

module.exports = router;