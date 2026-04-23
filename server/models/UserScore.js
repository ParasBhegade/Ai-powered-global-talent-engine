const mongoose = require('mongoose');

const userScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerPath: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerPath', required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  weakTopics: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('UserScore', userScoreSchema);
