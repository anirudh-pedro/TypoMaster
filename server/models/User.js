const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String
  },
  firebaseUid: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  stats: {
    testsCompleted: {
      type: Number,
      default: 0
    },
    avgWpm: {
      type: Number,
      default: 0
    },
    avgAccuracy: {
      type: Number,
      default: 0
    },
    bestWpm: {
      type: Number,
      default: 0
    },
    bestAccuracy: {
      type: Number,
      default: 0
    },
    totalTypingTime: {
      type: Number, // in seconds
      default: 0
    },
    rank: {
      type: Number,
      default: 0
    },
    percentile: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    keyboardSound: {
      type: Boolean,
      default: true
    },
    showLiveWpm: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('user', UserSchema);