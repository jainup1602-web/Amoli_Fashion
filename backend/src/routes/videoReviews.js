const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const videoReviews = await prisma.videoreview.findMany({
      where: { isActive: true }, orderBy: { order: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
    res.json({ success: true, videoReviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
