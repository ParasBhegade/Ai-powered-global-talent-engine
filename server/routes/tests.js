const express = require('express');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const UserScore = require('../models/UserScore');
const CareerPath = require('../models/CareerPath');
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/tests/questions/:pathId — adaptive ordering based on previous weak topics
router.get('/questions/:pathId', auth, async (req, res) => {
  try {
    const questions = await AptitudeQuestion.find({ careerPath: req.params.pathId });

    // Fetch user's latest score to get weak topics for adaptive ordering
    let weakTopics = [];
    try {
      const lastScore = await UserScore.findOne({
        user: req.user._id,
        careerPath: req.params.pathId
      }).sort({ createdAt: -1 });

      if (lastScore && lastScore.weakTopics) {
        weakTopics = lastScore.weakTopics.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      }
    } catch { /* ignore — just use default order */ }

    // Sanitize (never send correct answers to client)
    let sanitized = questions.map(q => ({
      _id: q._id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD
    }));

    // Adaptive: put questions matching weak topics first
    if (weakTopics.length > 0) {
      const isWeak = (q) => weakTopics.some(t => q.question.toLowerCase().includes(t));
      const weakQ = sanitized.filter(isWeak);
      const otherQ = sanitized.filter(q => !isWeak(q));
      sanitized = [...weakQ, ...otherQ];
    }

    res.json({ questions: sanitized, total: sanitized.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tests/submit
router.post('/submit', auth, async (req, res) => {
  try {
    const { careerPathId, answers } = req.body;
    // answers = [{ questionId, selected }, ...]
    
    if (!careerPathId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Fetch correct answers from DB
    const questionIds = answers.map(a => a.questionId);
    const questions = await AptitudeQuestion.find({ _id: { $in: questionIds } });
    const correctMap = {};
    questions.forEach(q => { correctMap[q._id.toString()] = q.correctOption; });

    let score = 0;
    const weakTopics = [];

    answers.forEach((a, i) => {
      const correct = correctMap[a.questionId];
      if (a.selected === correct) {
        score++;
      } else {
        weakTopics.push(`Q${i + 1}`);
      }
    });

    const total = answers.length;
    const weakList = weakTopics.join(', ');

    const userScore = await UserScore.create({
      user: req.user._id,
      careerPath: careerPathId,
      score,
      total,
      weakTopics: weakList
    });

    res.json({
      scoreId: userScore._id,
      score,
      total,
      weakTopics: weakList,
      percentage: total > 0 ? Math.round((score / total) * 100 * 10) / 10 : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tests/results (latest for user)
router.get('/results', auth, async (req, res) => {
  try {
    const results = await UserScore.find({ user: req.user._id })
      .populate('careerPath')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tests/results/:id
router.get('/results/:id', auth, async (req, res) => {
  try {
    const result = await UserScore.findOne({ _id: req.params.id, user: req.user._id })
      .populate('careerPath');
    
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    // Load skills for charts
    const skills = await Skill.find({ careerPath: result.careerPath._id })
      .sort({ weight: -1 })
      .limit(8);

    res.json({ result, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
