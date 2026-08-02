const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  totalPlayers: {
    type: Number,
    default: 0
  },
  activePlayers: {
    type: Number,
    default: 0
  },
  totalGamesPlayed: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  mostPlayedScene: String,
  successRate: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  newRegistrations: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Statistics', statisticsSchema);
