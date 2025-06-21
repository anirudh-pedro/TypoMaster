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

router.post('/firebase', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || email.split('@')[0],
        picture: picture || null 
      });
      await user.save();
    } else {
      user.name = name || user.name;
      user.picture = picture || user.picture; 
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
        picture: user.picture, 
        photoURL: user.picture, 
        stats: user.stats,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.post('/refresh', (req, res) => {
  res.json({ success: true, message: 'Token refreshed' });
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

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