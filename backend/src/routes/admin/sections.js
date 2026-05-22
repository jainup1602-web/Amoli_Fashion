const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

// GET all sections
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { location: 'asc' }
    });
    res.json({ success: true, sections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single section by location
router.get('/:location', verifyAdmin, async (req, res) => {
  try {
    const section = await prisma.section.findUnique({
      where: { location: req.params.location }
    });
    res.json({ success: true, section });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE/UPDATE section
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { location, title, subtitle, description, image, buttonText, buttonLink, backgroundColor, isActive } = req.body;
    
    if (!location) return res.status(400).json({ success: false, message: 'Location is required' });

    const section = await prisma.section.upsert({
      where: { location },
      update: { title, subtitle, description, image, buttonText, buttonLink, backgroundColor, isActive },
      create: { location, title, subtitle, description, image, buttonText, buttonLink, backgroundColor, isActive }
    });

    res.json({ success: true, section });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE section
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.section.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
