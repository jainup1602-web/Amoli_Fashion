const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res) => {
  try {
    const showcases = await prisma.showcase.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
    res.json({ success: true, showcases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
