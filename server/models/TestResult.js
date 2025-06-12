const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  wpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  errorCount: {
    type: Number,
    default: 0
  },
  characters: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'testresults',
  timestamps: true
});

module.exports = mongoose.model('TestResult', TestResultSchema);