const express = require('express');
const { callGroq, extractJSON } = require('../utils/groq');
const careerSkills = require('../data/careerSkills');
const Skill = require('../models/Skill');
const UserScore = require('../models/UserScore');
const InterviewResult = require('../models/InterviewResult');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/ai/chat — floating AI assistant
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.json({ reply: "I didn't receive any message." });
    }

    const content = await callGroq([
      { role: 'system', content: 'You are an AI Career Assistant. Answer ANY question clearly and helpfully.' },
      { role: 'user', content: message }
    ], { temperature: 0.7, maxTokens: 500 });

    res.json({ reply: content || 'No response.' });
  } catch (err) {
    res.json({ reply: 'Sorry, AI could not respond.' });
  }
});

// GET /api/ai/questions — generate interview questions
router.get('/questions', auth, async (req, res) => {
  try {
    const { role, difficulty, count = 5 } = req.query;
    if (!role || !difficulty) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const skills = careerSkills[role];
    if (!skills) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const prompt = `Generate EXACTLY ${count} interview questions as a JSON array for the following career.
Career: ${role}
Skills: ${skills}
Difficulty: ${difficulty}

Return STRICT JSON like:
{ "questions": ["q1","q2", ...] }`;

    const content = await callGroq([
      { role: 'user', content: prompt }
    ], { temperature: 0.7, maxTokens: 600 });

    const parsed = extractJSON(content);
    if (parsed && parsed.questions) {
      return res.json(parsed);
    }
    res.json({ error: 'Could not extract JSON', raw: content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const CareerPath = require('../models/CareerPath');
const User = require('../models/User');
const { embedText, cosineSimilarity } = require('../utils/embeddings');

// GET /api/ai/recommendations/matches — Vector-based career matching
router.get('/recommendations/matches', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let userVector = user.skillsEmbedding;

    // Generate embedding on the fly if missing
    if (!userVector || userVector.length === 0) {
      const profileText = `Skills: ${user.skills || ''}. Experience: ${user.experience || ''}. Education: ${user.education || ''}.`;
      userVector = await embedText(profileText);
      user.skillsEmbedding = userVector;
      await user.save();
    }

    if (!userVector || userVector.length === 0) {
      return res.status(400).json({ error: 'Not enough profile data to generate recommendations.' });
    }

    const paths = await CareerPath.find({});
    if (!paths.length) {
      return res.status(404).json({ error: 'No career paths available.' });
    }

    // Rank paths by cosine similarity
    const matches = paths.map(path => {
      const score = path.requirementsEmbedding && path.requirementsEmbedding.length > 0 
        ? cosineSimilarity(userVector, path.requirementsEmbedding) 
        : 0;
      return { path, score };
    }).sort((a, b) => b.score - a.score);

    const topMatches = matches.slice(0, 3);

    // Provide Groq with the top matches for explanation
    const prompt = `
You are an expert AI Career Coach. 
A candidate has the following profile:
Name: ${user.fullname || user.name}
Skills: ${user.skills || 'None explicitly listed'}
Experience: ${user.experience || 'None explicitly listed'}
Education: ${user.education || 'None explicitly listed'}

We have mathematically matched them to the following 3 career paths based on semantic similarity:
1. ${topMatches[0]?.path.name} (Match Score: ${(topMatches[0]?.score * 100).toFixed(1)}%)
2. ${topMatches[1]?.path.name} (Match Score: ${(topMatches[1]?.score * 100).toFixed(1)}%)
3. ${topMatches[2]?.path.name} (Match Score: ${(topMatches[2]?.score * 100).toFixed(1)}%)

Write a concise, encouraging 2-paragraph explanation of WHY these careers are the best mathematical and semantic fit for their specific skills and experience. Do NOT output JSON, just output the plain text explanation.
`;

    let explanation = "Based on your profile, these are your top matching careers.";
    try {
      const content = await callGroq([
        { role: 'system', content: 'You are an encouraging AI career coach providing insight into career matches.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.7, maxTokens: 400 });
      if (content) explanation = content;
    } catch (apiError) {
      console.warn('Groq API Error in matches explanation:', apiError.message);
    }

    res.json({
      matches: topMatches.map(m => ({
        _id: m.path._id,
        name: m.path.name,
        description: m.path.description,
        score: m.score
      })),
      explanation
    });

  } catch (err) {
    console.error('Error generating matches:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/recommendations — generate AI recommendations (Gap Analysis)
router.post('/recommendations', auth, async (req, res) => {
  try {
    const { careerName, score, total, skillList } = req.body;

    // Fetch granular historical data to feed the AI
    const recentScore = await UserScore.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const weakTopics = recentScore ? recentScore.weakTopics : '';

    const recentInterviews = await InterviewResult.find({ user: req.user._id, cheatingFlag: null }).sort({ createdAt: -1 }).limit(5);
    const interviewFeedback = recentInterviews.length 
      ? recentInterviews.map(r => `Q: ${r.question} | Feedback: ${r.aiFeedback}`).join('\n')
      : 'No recent mock interviews available.';

    const prompt = `
You are an expert AI Career Coach performing a comprehensive Skill Gap Analysis.
Analyze the user's specific test and interview performance to generate a highly personalized, actionable roadmap.
Do not use generic advice. Use concrete examples from their weak topics and interview feedback (e.g., "You struggled with React hooks", "Focus on SQL joins").

You MUST return ONLY valid JSON — no markdown, no commentary, no extra text.
Return JSON exactly in this format:

{
  "summary": "text (mention specific weak topics or interview feedback)",
  "weak_skills": {"Specific Skill Name": number (0-100), ...},
  "learning_priority": {"Specific Skill Name": number (0-100), ...},
  "improvement_points": ["point1", "point2"],
  "roadmap": ["Week 1: ...","Week 2: ...","Week 3: ...","Week 4: ..."],
  "projects": ["project1","project2"]
}

User data:
Career: ${careerName}
Aptitude Score: ${score} / ${total}
Required Skills: ${(skillList || []).join(', ')}
Failed Test Topics: ${weakTopics || 'None available'}
Recent Interview Feedback:
${interviewFeedback}
`;

    let content = '';
    try {
      content = await callGroq([
        { role: 'system', content: 'You output ONLY strict JSON, nothing else.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.0, maxTokens: 700 });
    } catch (apiError) {
      console.warn('Groq API Error in recommendations:', apiError.message);
    }

    const parsed = extractJSON(content);

    if (parsed && parsed.summary && parsed.summary.length > 8) {
      return res.json({ ai: parsed, source: 'groq' });
    }

    // Fallback
    const fallbackWeak = {};
    const fallbackPriority = {};
    const skills = skillList || [];
    const n = skills.length || 1;
    skills.forEach((sk, i) => {
      fallbackPriority[sk] = Math.max(20, Math.floor(70 - (i * (50 / n))));
      fallbackWeak[sk] = Math.max(8, Math.floor(40 - (i * (30 / n))));
    });

    res.json({
      ai: {
        summary: 'Here is a personalized performance summary generated for you.',
        weak_skills: Object.keys(fallbackWeak).length ? fallbackWeak : { Fundamentals: 35, Practice: 25 },
        learning_priority: Object.keys(fallbackPriority).length ? fallbackPriority : { Fundamentals: 60, Projects: 40 },
        improvement_points: [
          'Revise core fundamentals for 20–30 minutes daily.',
          'Follow one structured tutorial focused on your weakest skill and build a mini-project.',
          'Practice debugging and add basic unit tests to small projects.',
          'Use Git for version control and push regular commits.'
        ],
        roadmap: [
          'Week 1: Strengthen fundamentals + short exercises (30 min/day).',
          'Week 2: Follow tutorial and implement a focused mini-project.',
          'Week 3: Add tests, debug, and document your code.',
          'Week 4: Polish project, record a short demo, and seek feedback.'
        ],
        projects: [
          'Mini CRUD app with persistent storage and Git tracking.',
          'REST API with simple authentication and documented endpoints.',
          'Small data dashboard that reads CSV and visualizes insights.'
        ]
      },
      source: 'fallback'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
