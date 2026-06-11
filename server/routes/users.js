const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const resumeUpload = require('../middleware/resumeUpload');
const { extractTextFromResume, deleteFile } = require('../utils/resumeParser');
const { callGroq, extractJSON } = require('../utils/groq');
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

// POST /api/users/analyze-resume — AI-powered resume parsing
router.post('/analyze-resume', auth, (req, res, next) => {
  // Wrap multer in a handler so file-type/size errors return JSON, not HTML
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    next();
  });
}, async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded. Please upload a PDF or DOCX file.' });
    }

    filePath = req.file.path;

    // 1. Extract text from the resume
    const resumeText = await extractTextFromResume(filePath);

    if (!resumeText || resumeText.trim().length < 50) {
      deleteFile(filePath);
      return res.status(400).json({ error: 'Could not extract sufficient text from the resume. Please try a different file.' });
    }

    // 2. Send to Groq for structured extraction
    const prompt = `You are a professional resume parser. Extract the following structured information from the resume text below.

RULES:
- Extract ONLY what is explicitly stated in the resume. Do NOT invent or guess information.
- For "experience", list each job/role on a new line in the format: "Role at Company (Duration)" or just "Role at Company" if no duration is found.
- For "skills", return a comma-separated list of technical and soft skills mentioned.
- For "education", combine degree, institution, and year into a single line. If multiple, separate with semicolons.
- If a field is not found, return an empty string "".

Return ONLY valid JSON in this exact format:
{
  "fullname": "Person's full name",
  "phone": "Phone number if found",
  "education": "Degree, Institution, Year",
  "experience": "Role at Company (Duration)\\nRole at Company (Duration)",
  "skills": "Skill1, Skill2, Skill3"
}

RESUME TEXT:
${resumeText.substring(0, 4000)}`;

    const content = await callGroq([
      { role: 'system', content: 'You are a precise resume data extractor. Output ONLY valid JSON, no markdown, no commentary.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.0, maxTokens: 800 });

    const parsed = extractJSON(content);

    // 3. Clean up temp file
    deleteFile(filePath);

    if (!parsed) {
      return res.status(500).json({ error: 'AI could not parse the resume. Please try again.' });
    }

    // 4. Return extracted fields
    res.json({
      extracted: {
        fullname: parsed.fullname || '',
        phone: parsed.phone || '',
        education: parsed.education || '',
        experience: parsed.experience || '',
        skills: parsed.skills || ''
      },
      message: 'Resume analyzed successfully'
    });

  } catch (err) {
    if (filePath) deleteFile(filePath);
    console.error('Resume analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze resume. ' + err.message });
  }
});

module.exports = router;

