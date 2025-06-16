const TestResult = require('../models/TestResult');
const User = require('../models/User');

// Clients connected to SSE
const clients = [];

// Initialize change streams
async function initChangeStreams() {
  try {
    console.log('Setting up MongoDB change stream for test results');
    
    // Set up change stream on TestResult collection
    const changeStream = TestResult.watch();
    
    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        try {
          // A new test result was inserted
          const result = change.fullDocument;
          
          // Look up the user to get their details
          const user = await User.findById(result.user);
          
          // Format the test result with user details
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
          
          // Notify all connected clients
          const eventData = JSON.stringify({
            type: 'new-result',
            data: formattedResult
          });
          
          clients.forEach(client => {
            client.res.write(`data: ${eventData}\n\n`);
          });
        } catch (error) {
          console.error('Error processing change stream event:', error);
        }
      }
    });
    
    console.log('MongoDB change stream initialized successfully');
    return changeStream;
  } catch (error) {
    console.error('Failed to set up change streams:', error);
    console.log('Falling back to polling mode for leaderboard updates');
    return null;
  }
}

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

module.exports = {
  initChangeStreams,
  addClient,
  clients
};