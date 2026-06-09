const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyAdmin } = require('../middleware/auth');

// GET - Public (fetch subcategories, optionally filtered by categoryId)
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    const subcategories = await prisma.subcategory.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { category: { select: { id: true, name: true, slug: true } } }
    });
    res.json({ success: true, subcategories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST - Admin only (create subcategory)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, slug, categoryId, description, image, order } = req.body;
    if (!name || !slug || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name, slug and categoryId are required' });
    }

    const existing = await prisma.subcategory.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Subcategory with this slug already exists' });
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        slug,
        categoryId,
        description: description || null,
        image: image || null,
        order: order || 0,
        isActive: true,
      }
    });

    res.status(201).json({ success: true, subcategory });
  } catch (err) {
    console.error('Subcategory creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Admin only (update subcategory)
router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { id, ...data } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Subcategory ID is required' });
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data,
    });

    res.json({ success: true, subcategory });
  } catch (err) {
    console.error('Subcategory update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE - Admin only (delete subcategory)
router.delete('/', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Subcategory ID is required' });
    }

    await prisma.subcategory.delete({ where: { id } });
    res.json({ success: true, message: 'Subcategory deleted' });
  } catch (err) {
    console.error('Subcategory deletion error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
