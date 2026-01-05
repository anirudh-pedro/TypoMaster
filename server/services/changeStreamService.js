const TestResult = require('../models/TestResult');
const User = require('../models/User');

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
    
    console.log('MongoDB change streams initialized successfully');
    return { testResultChangeStream };
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