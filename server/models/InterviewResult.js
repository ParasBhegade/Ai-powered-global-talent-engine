const mongoose = require('mongoose');

const interviewResultSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobRole: { type: String, required: true },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  userAnswer: { type: String, default: '' },
  aiFeedback: { type: String, default: '' },
  aiScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('InterviewResult', interviewResultSchema);
