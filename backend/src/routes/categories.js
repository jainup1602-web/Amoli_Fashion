const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, slug, description, image, order } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Name and slug required' });
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) return res.status(400).json({ success: false, message: 'Slug already exists' });
    const category = await prisma.category.create({ data: { name, slug, description, image, order: order || 0, isActive: true } });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { id, ...data } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'ID required' });
    const category = await prisma.category.update({ where: { id }, data });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID required' });
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
