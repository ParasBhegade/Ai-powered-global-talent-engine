const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  requirementsEmbedding: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('CareerPath', careerPathSchema);
