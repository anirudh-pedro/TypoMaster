const User = require('../models/User');

/**
 * Authenticate user based on Firebase UID
 */
exports.authenticateUser = async (req, res, next) => {
  try {
    // Get UID from request params or query
    const uid = req.params.userId || req.query.uid;
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Find the user in the database
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

/**
 * Optional authentication - doesn't fail if no auth provided
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    // Get UID from request (if provided)
    const uid = req.params.userId || req.query.uid;
    
    if (!uid) {
      req.user = null;
      return next();
    }
    
    // Find the user in the database
    const user = await User.findOne({ firebaseUid: uid });
    
    // Attach user to request (might be null)
    req.user = user;
    next();
  } catch (error) {
    // Just continue without user on error
    req.user = null;
    next();
  }
};