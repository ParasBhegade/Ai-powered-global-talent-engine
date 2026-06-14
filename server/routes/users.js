const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const resumeUpload = require('../middleware/resumeUpload');
const { parseResume } = require('../utils/resumeParser');
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
    const { fullname, phone, education, experience, skills, resumeRaw, resumeParsed } = req.body;
    const updates = { fullname, phone, education, experience, skills };
    
    // Check if profile is completed
    if (fullname && phone) {
      updates.profileCompleted = true;
    }

    if (resumeRaw !== undefined) updates.resumeRaw = resumeRaw;
    if (resumeParsed !== undefined) updates.resumeParsed = resumeParsed;

    // Compute semantic embedding of the user's skills and experience
    const { embedText } = require('../utils/embeddings');
    const profileText = `Skills: ${skills || ''}. Experience: ${experience || ''}. Education: ${education || ''}.`;
    updates.skillsEmbedding = await embedText(profileText);

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

// POST /api/users/resume/preview — AI-powered in-memory resume parsing
router.post('/resume/preview', auth, (req, res, next) => {
  // Wrap multer in a handler so file-type/size errors return JSON
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No resume file uploaded. Please upload a PDF, DOCX, or TXT file.' });
    }

    // Process file entirely in memory
    const { rawText, parsedData } = await parseResume(req.file.buffer, req.file.mimetype);

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({ error: 'Could not extract sufficient text from the resume. Please try a different file.' });
    }

    // Return extracted fields WITHOUT saving to DB
    res.json({
      rawText,
      parsedData,
      message: 'Resume preview generated successfully'
    });

  } catch (err) {
    console.error('Resume preview error:', err.message);
    res.status(500).json({ error: 'Failed to preview resume. ' + err.message });
  }
});

module.exports = router;

