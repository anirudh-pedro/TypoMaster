const TestResult = require('../models/TestResult');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

const clients = [];

function addClient(req, res) {
  const clientId = Date.now();
  
  const newClient = {
    id: clientId,
    res
  };
  
  clients.push(newClient);
  
  req.on('close', () => {
    console.log(`Client ${clientId} connection closed`);
    const index = clients.findIndex(client => client.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
  
  return clientId;
}

async function initChangeStreams() {
  try {
    console.log('Setting up MongoDB change streams');
    
    const testResultChangeStream = TestResult.watch();
    
    testResultChangeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        try {
          const result = change.fullDocument;
          
          const user = await User.findById(result.user);
          
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
    
    const achievementChangeStream = Achievement.watch();
    
    achievementChangeStream.on('change', async (change) => {
      if (change.operationType === 'update' && 
          change.updateDescription.updatedFields && 
          Object.keys(change.updateDescription.updatedFields).some(field => field.includes('achievements.$.unlocked'))) {
        try {
          const achievement = await Achievement.findById(change.documentKey._id);
          const dailyChallenge = achievement?.achievements?.find(a => a.id === 'daily_test');
          
          if (dailyChallenge && dailyChallenge.unlocked) {
            const user = await User.findOne({ firebaseUid: achievement.userId });
            
            if (user) {
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