const express = require('express');
const Tutorial = require('../models/Tutorial');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminAuth');
const router = express.Router();

// GET /api/tutorials/:pathId
router.get('/:pathId', async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ careerPath: req.params.pathId });
    res.json({ tutorials });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tutorials (admin)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { careerPathId, title, url, summary } = req.body;
    const tutorial = await Tutorial.create({
      careerPath: careerPathId,
      title,
      url,
      summary
    });
    res.status(201).json({ tutorial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tutorials/:id (admin)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    await Tutorial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tutorial deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
