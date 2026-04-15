const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res) => {
  try {
    const popup = await prisma.popup.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, popup });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
