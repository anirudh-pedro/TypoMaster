const TestResult = require('../models/TestResult');
const User = require('../models/User');
const mongoose = require('mongoose');
const { addClient } = require('../services/changeStreamService');

/**
 * Get global leaderboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    // Extract query parameters for pagination and filtering
    const { limit = 20, timeframe = 'all', page = 1, sort = 'wpm' } = req.query;
    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;

    // Build query
    let query = {};
    
    // Apply time filter if specified
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch(timeframe) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (startDate) {
        query.date = { $gte: startDate };
      }
    }

    // Create aggregation pipeline
    const aggregationPipeline = [
      { $match: query },
      {
        $sort: sort === 'wpm' ? { wpm: -1 } : 
               sort === 'accuracy' ? { accuracy: -1 } : 
               { date: -1 }
      },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $addFields: {
          userInfo: {
            $cond: {
              if: { $gt: [{ $size: '$userDetails' }, 0] },
              then: {
                name: { $arrayElemAt: ['$userDetails.name', 0] },
                picture: { $arrayElemAt: ['$userDetails.picture', 0] },
                firebaseUid: { $arrayElemAt: ['$userDetails.firebaseUid', 0] }
              },
              else: {
                name: 'Anonymous',
                picture: null,
                firebaseUid: null
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          wpm: 1,
          accuracy: 1,
          errorCount: 1,
          date: 1,
          text: { $substr: ["$text", 0, 50] },
          userInfo: 1
        }
      }
    ];

    // Execute the aggregation
    const results = await TestResult.aggregate(aggregationPipeline);

    // Get total count for pagination
    const totalItems = await TestResult.countDocuments(query);

    // Return the response
    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize)
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leaderboard data', 
      error: error.message 
    });
  }
};

/**
 * Get user's ranking position in the global leaderboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserRanking = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // First find the user by Firebase UID
    const user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's best WPM score
    const bestResult = await TestResult.findOne({ 
      user: user._id 
    }).sort({ wpm: -1 });

    if (!bestResult) {
      return res.status(404).json({
        success: false,
        message: 'No records found for this user'
      });
    }

    const userBestWpm = bestResult.wpm;

    // Count users with better WPM scores
    const rankingQuery = await TestResult.aggregate([
      { 
        $group: {
          _id: '$user',
          bestWpm: { $max: '$wpm' }
        }
      },
      {
        $match: {
          bestWpm: { $gt: userBestWpm }
        }
      },
      {
        $count: 'betterRankedUsers'
      }
    ]);
    
    const betterUsers = rankingQuery.length > 0 ? rankingQuery[0].betterRankedUsers : 0;
    const ranking = betterUsers + 1;

    res.status(200).json({
      success: true,
      data: {
        userId,
        ranking,
        bestWpm: userBestWpm,
        bestAccuracy: bestResult.accuracy
      }
    });

  } catch (error) {
    console.error('Error getting user ranking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user ranking', 
      error: error.message 
    });
  }
};

/**
 * Setup Server-Sent Events (SSE) for real-time leaderboard updates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRealTimeLeaderboard = async (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Flush the headers to establish SSE connection

  // Register client for updates
  const clientId = addClient(req, res);
  
  console.log(`Client ${clientId} connected to leaderboard stream`);

  // Send initial data
  sendInitialData(res);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatId = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', time: new Date() })}\n\n`);
  }, 30000);

  // When client disconnects, clear intervals
  req.on('close', () => {
    clearInterval(heartbeatId);
    console.log(`Client ${clientId} disconnected from leaderboard stream`);
  });
};

// Helper function to send initial leaderboard data
async function sendInitialData(res) {
  try {
    // Get initial top results
    const topResults = await TestResult.find()
      .sort({ wpm: -1 })
      .limit(20)
      .populate('user', 'name picture firebaseUid');
    
    const formattedResults = topResults.map(result => ({
      id: result._id,
      wpm: result.wpm,
      accuracy: result.accuracy,
      date: result.date,
      userId: result.user?.firebaseUid || null,
      user: {
        name: result.user?.name || 'Anonymous',
        picture: result.user?.picture || null
      }
    }));

    // Send initial data
    res.write(`data: ${JSON.stringify({ type: 'initial', data: formattedResults })}\n\n`);
  } catch (error) {
    console.error('Error sending initial data:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Error loading initial data' })}\n\n`);
  }
}