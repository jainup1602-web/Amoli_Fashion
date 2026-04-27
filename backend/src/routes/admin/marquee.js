const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

// Get all marquee items (admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const items = await prisma.marqueeitem.findMany({
      orderBy: [{ row: 'asc' }, { order: 'asc' }],
    });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Fetch marquee error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create marquee item
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { text, categoryId, filterSlug, hoverImage, row, order, isActive } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const item = await prisma.marqueeitem.create({
      data: {
        text: text.trim(),
        categoryId: categoryId || null,
        filterSlug: filterSlug || null,
        hoverImage: hoverImage || null,
        row: row || 1,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.json({ success: true, item });
  } catch (error) {
    console.error('Create marquee error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update marquee item
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, categoryId, filterSlug, hoverImage, row, order, isActive } = req.body;

    const item = await prisma.marqueeitem.update({
      where: { id },
      data: {
        ...(text !== undefined && { text: text.trim() }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(filterSlug !== undefined && { filterSlug: filterSlug || null }),
        ...(hoverImage !== undefined && { hoverImage: hoverImage || null }),
        ...(row !== undefined && { row }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, item });
  } catch (error) {
    console.error('Update marquee error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete marquee item
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.marqueeitem.delete({ where: { id } });
    res.json({ success: true, message: 'Marquee item deleted' });
  } catch (error) {
    console.error('Delete marquee error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
