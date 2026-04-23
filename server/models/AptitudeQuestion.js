const mongoose = require('mongoose');

const aptitudeQuestionSchema = new mongoose.Schema({
  careerPath: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerPath', required: true },
  question: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },
  correctOption: { type: String, enum: ['A', 'B', 'C', 'D'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
