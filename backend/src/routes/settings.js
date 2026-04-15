const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Public settings endpoint
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findMany();
    const map = {};
    settings.forEach(s => {
      try { map[s.key] = JSON.parse(s.value); } catch { map[s.key] = s.value; }
    });
    res.json({ success: true, settings: map });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
