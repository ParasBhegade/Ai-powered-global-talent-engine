const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('selectedPath');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullname, phone, education, experience, skills } = req.body;
    const updates = { fullname, phone, education, experience, skills };
    
    // Check if profile is completed
    if (fullname && phone) {
      updates.profileCompleted = true;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/upload-photo
router.post('/upload-photo', auth, upload.single('profile_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const photoPath = `uploads/profile_photos/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: photoPath });

    res.json({ profilePhoto: photoPath, message: 'Photo uploaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/select-path
router.put('/select-path', auth, async (req, res) => {
  try {
    const { pathId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { selectedPath: pathId },
      { new: true }
    ).select('-password').populate('selectedPath');

    res.json({ user, message: 'Career path selected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
