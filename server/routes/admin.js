const express = require('express');
const User = require('../models/User');
const UserScore = require('../models/UserScore');
const CareerPath = require('../models/CareerPath');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminAuth');
const router = express.Router();

// GET /api/admin/analytics
router.get('/analytics', auth, admin, async (req, res) => {
  try {
    const totUsers = await User.countDocuments();
    const totTests = await UserScore.countDocuments();

    // Overall average score
    const avgResult = await UserScore.aggregate([
      { $project: { pct: { $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$score', '$total'] }, 100] }] } } },
      { $group: { _id: null, avg: { $avg: '$pct' } } }
    ]);
    const avgScoreOverall = avgResult.length ? Math.round(avgResult[0].avg * 10) / 10 : 0;

    // Per career path stats
    const careers = await CareerPath.find().sort({ createdAt: 1 });
    const pathStats = [];

    for (const c of careers) {
      const avgRes = await UserScore.aggregate([
        { $match: { careerPath: c._id } },
        { $project: { pct: { $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$score', '$total'] }, 100] }] } } },
        { $group: { _id: null, avg: { $avg: '$pct' } } }
      ]);

      const userCount = await User.countDocuments({ selectedPath: c._id });

      pathStats.push({
        name: c.name,
        avgScore: avgRes.length ? Math.round(avgRes[0].avg * 10) / 10 : 0,
        userCount
      });
    }

    // Top weak topics
    const allScores = await UserScore.find({ weakTopics: { $ne: '' } }).select('weakTopics');
    const counter = {};
    allScores.forEach(s => {
      const parts = s.weakTopics.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      parts.forEach(p => { counter[p] = (counter[p] || 0) + 1; });
    });
    const topWeak = Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 12);

    // Latest tests
    const latestTests = await UserScore.find()
      .populate('user', 'name')
      .populate('careerPath', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      totUsers,
      totTests,
      avgScoreOverall,
      pathStats,
      topWeak,
      latestTests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
