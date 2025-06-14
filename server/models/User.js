const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    default: null
  },
  stats: {
    testsCompleted: {
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
    avgWpm: {
      type: Number,
      default: 0
    },
    avgAccuracy: {
      type: Number,
      default: 0
    },
    totalCharacters: {
      type: Number,
      default: 0
    },
    totalTime: {
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
    testDuration: {
      type: Number,
      default: 60
    },
    showKeyboard: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);