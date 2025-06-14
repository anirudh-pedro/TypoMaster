const express = require('express');
const router = express.Router();

// Mock user data for now (since we don't have User model yet)
const mockUsers = [
  {
    id: '1',
    email: 'user1@example.com',
    name: 'John Doe',
    picture: null,
    stats: {
      testsCompleted: 25,
      bestWpm: 85,
      bestAccuracy: 98.1,
      avgWpm: 68,
      avgAccuracy: 94.2
    },
    preferences: {
      theme: 'dark',
      testDuration: 60,
      showKeyboard: true
    }
  }
];

// GET /api/users/profile/:userId - Get user profile
router.get('/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // For now, return mock data
    const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/profile/:userId - Update user profile
router.put('/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { name, preferences } = req.body;

    // For now, just return success with mock data
    res.json({
      success: true,
      user: {
        ...mockUsers[0],
        name: name || mockUsers[0].name,
        preferences: { ...mockUsers[0].preferences, ...preferences }
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// GET /api/users - Get all users
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      users: mockUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;