const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require('../config/firebase-service-account.json');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
}

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/auth/firebase - Login with Firebase
router.post('/firebase', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    // Find or create user in database
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || email.split('@')[0],
        picture: picture || null // Make sure to save the picture
      });
      await user.save();
    } else {
      // Update user info including picture
      user.name = name || user.name;
      user.picture = picture || user.picture; // Update picture if available
      user.lastLogin = new Date();
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        uid: user.firebaseUid,
        email: user.email,
        name: user.name,
        picture: user.picture, // Return the picture
        photoURL: user.picture, // Also as photoURL for compatibility
        stats: user.stats,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', (req, res) => {
  // For now, just return success - implement JWT refresh logic if needed
  res.json({ success: true, message: 'Token refreshed' });
});

// POST /api/auth/logout - Logout
router.post('/logout', (req, res) => {
  // Clear any server-side session data if needed
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/firebase-test - Test Firebase connection
router.get('/firebase-test', (req, res) => {
  try {
    const isInitialized = admin.apps.length > 0;
    res.json({ 
      firebaseInitialized: isInitialized,
      message: isInitialized ? 'Firebase Admin SDK is initialized' : 'Firebase Admin SDK not initialized'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;