const express = require('express');
const { callGroq, extractJSON } = require('../utils/groq');
const careerSkills = require('../data/careerSkills');
const InterviewResult = require('../models/InterviewResult');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/interviews/submit — batch evaluate + save
router.post('/submit', auth, async (req, res) => {
  try {
    const { role, difficulty, questions, answers } = req.body;

    if (!role || !difficulty || !Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const skills = careerSkills[role] || '';

    let prompt = `
You are an expert interviewer and evaluator.

Career: ${role}
Skills: ${skills}
Difficulty: ${difficulty}

For each of the following questions and candidate answers, provide:
- evaluation (1–2 sentences)
- score (0–10)

Return STRICT JSON:
{
  "results": [
    {"question":"...","answer":"...","evaluation":"...","score": number},
    ...
  ],
  "overall_score": number,
  "suggestions": ["...","..."],
  "progress_level": "Beginner|Intermediate|Advanced"
}

Questions and Answers:
`;

    questions.forEach((q, i) => {
      prompt += `\nQ: ${q}\nA: ${answers[i]}\n`;
    });

    const content = await callGroq([
      { role: 'user', content: prompt }
    ], { maxTokens: 1200, temperature: 0.2 });

    const result = extractJSON(content);
    if (!result) {
      return res.status(500).json({ error: 'JSON parse error', raw: content });
    }

    // Generate session ID
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Save to DB
    if (result.results) {
      for (const r of result.results) {
        await InterviewResult.create({
          sessionId,
          user: req.user._id,
          jobRole: role,
          difficulty,
          question: r.question || '',
          userAnswer: r.answer || '',
          aiFeedback: r.evaluation || '',
          aiScore: parseInt(r.score) || 0
        });
      }
    }

    res.json({
      session_id: sessionId,
      overall_score: result.overall_score || 0,
      suggestions: result.suggestions || [],
      progress_level: result.progress_level || '',
      results: result.results || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interviews/results/:sessionId
router.get('/results/:sessionId', auth, async (req, res) => {
  try {
    const rows = await InterviewResult.find({
      user: req.user._id,
      sessionId: req.params.sessionId
    }).sort({ createdAt: 1 });

    if (!rows.length) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sum = rows.reduce((acc, r) => acc + r.aiScore, 0);
    const avg = rows.length ? Math.round((sum / rows.length) * 10) / 10 : 0;
    const level = avg >= 8 ? 'Advanced' : avg >= 5 ? 'Intermediate' : 'Beginner';

    res.json({ rows, avg, level, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interviews/history
router.get('/history', auth, async (req, res) => {
  try {
    const results = await InterviewResult.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: '$sessionId',
        jobRole: { $first: '$jobRole' },
        difficulty: { $first: '$difficulty' },
        avgScore: { $avg: '$aiScore' },
        count: { $sum: 1 },
        createdAt: { $first: '$createdAt' }
      }},
      { $sort: { createdAt: -1 } },
      { $limit: 20 }
    ]);

    res.json({ sessions: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
