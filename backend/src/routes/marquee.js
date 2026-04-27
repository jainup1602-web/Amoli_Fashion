const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Get active marquee items (public)
router.get('/', async (req, res) => {
  try {
    const items = await prisma.marqueeitem.findMany({
      where: { isActive: true },
      orderBy: [{ row: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        text: true,
        categoryId: true,
        filterSlug: true,
        hoverImage: true,
        row: true,
        order: true,
      },
    });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Fetch marquee error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
