const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const { initChangeStreams } = require('./services/changeStreamService');

// Updated CORS configuration to handle both development servers
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Create React App default
    'http://localhost:5173',  // Vite default
    'http://localhost:4173',  // Vite preview
    process.env.CLIENT_URL    // Custom client URL from environment
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));
app.use(express.json());

// Add this middleware for debugging CORS issues
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Routes - wrap in try-catch to handle missing files
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.error('Error loading auth routes:', error.message);
}

try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
} catch (error) {
  console.error('Error loading dashboard routes:', error.message);
}

try {
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
} catch (error) {
  console.error('Error loading user routes:', error.message);
}

try {
  const leaderboardRoutes = require('./routes/leaderboard');
  app.use('/api/leaderboard', leaderboardRoutes);
} catch (error) {
  console.error('Error loading leaderboard routes:', error.message);
}

// Add this to your existing routes
const achievementRoutes = require('./routes/achievement');
app.use('/api/achievements', achievementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: 'enabled',
    allowedOrigins: corsOptions.origin
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/typomaster';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed origins:`, corsOptions.origin);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Firebase test: http://localhost:${PORT}/api/auth/firebase-test`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// This schedules a job to run at 12:01 AM every day
cron.schedule('1 0 * * *', async () => {
  try {
    console.log('Running daily achievement reset job...');
    
    // Find all users with the daily challenge unlocked
    const achievements = await Achievement.find({
      'achievements.id': 'daily_test',
      'achievements.unlocked': true
    });
    
    console.log(`Found ${achievements.length} users with daily challenge to reset`);
    
    // Reset daily challenge for each user
    for (const userAchievement of achievements) {
      const dailyChallenge = userAchievement.achievements.find(a => a.id === 'daily_test');
      if (dailyChallenge) {
        dailyChallenge.unlocked = false;
        dailyChallenge.progress = 0;
        await userAchievement.save();
      }
    }
    
    console.log('Daily challenge reset completed');
  } catch (error) {
    console.error('Error in daily achievement reset job:', error);
  }
});

// Daily achievement reset helper
let lastResetDay = new Date().getDate(); // Store current day

// Check if we need to reset daily challenges every 15 minutes
const dailyResetInterval = setInterval(async () => {
  try {
    const now = new Date();
    const currentDay = now.getDate();
    
    // If the day has changed
    if (currentDay !== lastResetDay) {
      console.log(`Day changed from ${lastResetDay} to ${currentDay}, resetting daily challenges at ${now.toISOString()}`);
      lastResetDay = currentDay;
      
      // Reset all daily challenges
      const Achievement = require('./models/Achievement');
      
      const result = await Achievement.updateMany(
        { 'achievements.id': 'daily_test', 'achievements.unlocked': true },
        { 
          $set: { 
            'achievements.$.unlocked': false,
            'achievements.$.progress': 0
          }
        }
      );
      
      console.log(`Reset ${result.modifiedCount} daily challenges`);
    }
  } catch (error) {
    console.error('Error in daily challenge reset interval:', error);
  }
}, 900000); // Check every 15 minutes (900,000 ms)

// Add this interval after MongoDB connects
// Set up periodic check for stale daily challenges (every 30 minutes)
const periodicResetCheck = setInterval(async () => {
  try {
    console.log('Running periodic check for stale daily challenges...');
    const Achievement = require('./models/Achievement');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const staleAchievements = await Achievement.find({
      'achievements.id': 'daily_test',
      'achievements.unlocked': true,
      'achievements.date': { $lt: today }
    });
    
    if (staleAchievements.length > 0) {
      console.log(`Found ${staleAchievements.length} stale daily challenges to reset`);
      
      for (const achievement of staleAchievements) {
        const dailyChallenge = achievement.achievements.find(a => a.id === 'daily_test');
        if (dailyChallenge) {
          dailyChallenge.unlocked = false;
          dailyChallenge.progress = 0;
          await achievement.save();
        }
      }
      console.log('Stale daily challenges reset complete');
    }
  } catch (error) {
    console.error('Error in periodic reset check:', error);
  }
}, 1800000); // Every 30 minutes

// Clean up interval on server shutdown
process.on('SIGINT', () => {
  clearInterval(dailyResetInterval);
  clearInterval(periodicResetCheck);
  process.exit(0);
});

// Initialize change streams for real-time updates
mongoose.connection.once('open', async () => {
  console.log('MongoDB connected successfully');
  
  // Initialize change streams for real-time updates
  await initChangeStreams();
});

startServer();