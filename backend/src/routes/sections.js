const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET all active sections
router.get('/', async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      where: { isActive: true }
    });
    res.json({ success: true, sections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET section by location
router.get('/:location', async (req, res) => {
  try {
    const section = await prisma.section.findFirst({
      where: { location: req.params.location, isActive: true }
    });
    res.json({ success: true, section });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
