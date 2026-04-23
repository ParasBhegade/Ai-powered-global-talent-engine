const express = require('express');
const CareerPath = require('../models/CareerPath');
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminAuth');
const router = express.Router();

// ========== Career Paths ==========

// GET /api/careers
router.get('/', async (req, res) => {
  try {
    const careers = await CareerPath.find().sort({ createdAt: 1 });
    res.json({ careers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/careers/:id
router.get('/:id', async (req, res) => {
  try {
    const career = await CareerPath.findById(req.params.id);
    if (!career) return res.status(404).json({ error: 'Career path not found' });
    res.json({ career });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/careers (admin)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const career = await CareerPath.create({ name, description });
    res.status(201).json({ career });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/careers/:id (admin)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const career = await CareerPath.findByIdAndUpdate(
      req.params.id, { name, description }, { new: true }
    );
    res.json({ career });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/careers/:id (admin)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    await CareerPath.findByIdAndDelete(req.params.id);
    await Skill.deleteMany({ careerPath: req.params.id });
    res.json({ message: 'Career path and associated skills deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== Skills ==========

// GET /api/careers/:id/skills
router.get('/:id/skills', async (req, res) => {
  try {
    const skills = await Skill.find({ careerPath: req.params.id }).sort({ weight: -1 });
    res.json({ skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/careers/:id/skills (admin)
router.post('/:id/skills', auth, admin, async (req, res) => {
  try {
    const { skillName, category, weight } = req.body;
    const skill = await Skill.create({
      careerPath: req.params.id,
      skillName,
      category: category || 'General',
      weight: weight || 50
    });
    res.status(201).json({ skill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/skills/:id (admin)
router.put('/skills/:id', auth, admin, async (req, res) => {
  try {
    const { skillName, category, weight } = req.body;
    const skill = await Skill.findByIdAndUpdate(
      req.params.id, { skillName, category, weight }, { new: true }
    );
    res.json({ skill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/skills/:id (admin)
router.delete('/skills/:id', auth, admin, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
