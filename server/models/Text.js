const mongoose = require('mongoose');

const TextSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['quote', 'paragraph', 'code', 'article', 'custom'],
    default: 'paragraph'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  author: {
    type: String,
    default: 'Unknown'
  },
  source: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'English'
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Text', TextSchema);