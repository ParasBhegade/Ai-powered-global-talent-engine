const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  selectedPath: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerPath', default: null },
  fullname: { type: String, default: '' },
  phone: { type: String, default: '' },
  education: { type: String, default: '' },
  experience: { type: String, default: '' },
  skills: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  profileCompleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
