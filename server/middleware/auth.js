const User = require('../models/User');


exports.authenticateUser = async (req, res, next) => {
  try {
    const uid = req.params.userId || req.query.uid;
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
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


exports.optionalAuth = async (req, res, next) => {
  try {
    const uid = req.params.userId || req.query.uid;
    
    if (!uid) {
      req.user = null;
      return next();
    }
    
    const user = await User.findOne({ firebaseUid: uid });
    
    req.user = user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};