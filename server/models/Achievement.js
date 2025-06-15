const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: String,
  achievements: [{
    id: String,
    title: String,
    description: String,
    icon: String,
    category: String,
    unlocked: Boolean,
    progress: Number,
    date: Date,
    rarity: String,
    xp: Number
  }],
  stats: {
    totalXP: Number,
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastTestDate: Date,
    nextMilestone: String
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);