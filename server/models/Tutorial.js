const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  careerPath: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerPath', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  summary: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Tutorial', tutorialSchema);
