const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  careerPath: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerPath', required: true },
  skillName: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  weight: { type: Number, default: 50 }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
