const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const { initChangeStreams } = require('./services/changeStreamService');

const corsOptions = {
  origin: [
    'http://localhost:3000',  
    'http://localhost:5173',  
    'http://localhost:4173', 
    'https://typo-master-alpha.vercel.app',
    process.env.CLIENT_URL    
  ].filter(Boolean), 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', apiLimiter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

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
  const leaderboardRoutes = require('./routes/leaderboard');
  app.use('/api/leaderboard', leaderboardRoutes);
} catch (error) {
  console.error('Error loading leaderboard routes:', error.message);
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: 'enabled',
    allowedOrigins: corsOptions.origin
  });
});

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

app.get('/', (req, res) => {
  res.json({ 
    message: 'TypoMaster API is running', 
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/dashboard',
      '/api/leaderboard'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

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

mongoose.connection.once('open', async () => {
  console.log('MongoDB connected');
  await initChangeStreams();
});

startServer();