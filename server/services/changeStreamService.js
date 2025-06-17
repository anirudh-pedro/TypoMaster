const TestResult = require('../models/TestResult');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

// Clients connected to SSE
const clients = [];

// Add a client to the SSE clients list
function addClient(req, res) {
  const clientId = Date.now();
  
  const newClient = {
    id: clientId,
    res
  };
  
  clients.push(newClient);
  
  // Remove client when connection closes
  req.on('close', () => {
    console.log(`Client ${clientId} connection closed`);
    const index = clients.findIndex(client => client.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
  
  return clientId;
}

// Initialize change streams
async function initChangeStreams() {
  try {
    console.log('Setting up MongoDB change streams');
    
    // Set up change stream on TestResult collection
    const testResultChangeStream = TestResult.watch();
    
    testResultChangeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        try {
          // Notify all connected clients about new test result
          const result = change.fullDocument;
          
          // Look up the user
          const user = await User.findById(result.user);
          
          // Format the result with user details
          const formattedResult = {
            id: result._id,
            wpm: result.wpm,
            accuracy: result.accuracy,
            date: result.date,
            userId: user?.firebaseUid || null,
            user: {
              name: user?.name || 'Anonymous',
              picture: user?.picture || null
            }
          };
          
          // Send to all connected clients
          clients.forEach(client => {
            client.res.write(`data: ${JSON.stringify({
              type: 'new-result',
              data: formattedResult
            })}\n\n`);
          });
        } catch (error) {
          console.error('Error processing test result change:', error);
        }
      }
    });
    
    // Set up change stream on Achievement collection for daily challenge updates
    const achievementChangeStream = Achievement.watch();
    
    achievementChangeStream.on('change', async (change) => {
      if (change.operationType === 'update' && 
          change.updateDescription.updatedFields && 
          Object.keys(change.updateDescription.updatedFields).some(field => field.includes('achievements.$.unlocked'))) {
        try {
          // Check if this is a daily challenge update
          const achievement = await Achievement.findById(change.documentKey._id);
          const dailyChallenge = achievement?.achievements?.find(a => a.id === 'daily_test');
          
          if (dailyChallenge && dailyChallenge.unlocked) {
            // Look up the user
            const user = await User.findOne({ firebaseUid: achievement.userId });
            
            if (user) {
              // Notify clients about daily challenge update
              clients.forEach(client => {
                client.res.write(`data: ${JSON.stringify({
                  type: 'daily-challenge-complete',
                  data: {
                    userId: achievement.userId,
                    username: user.name,
                    streak: achievement.stats.currentStreak,
                    date: dailyChallenge.date
                  }
                })}\n\n`);
              });
            }
          }
        } catch (error) {
          console.error('Error processing achievement change:', error);
        }
      }
    });
    
    console.log('MongoDB change streams initialized successfully');
    return { testResultChangeStream, achievementChangeStream };
  } catch (error) {
    console.error('Failed to set up change streams:', error);
    console.log('Falling back to polling mode for updates');
    return null;
  }
}

module.exports = {
  initChangeStreams,
  addClient,
  clients
};