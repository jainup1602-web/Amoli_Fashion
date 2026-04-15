const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    const subcategories = await prisma.subcategory.findMany({ where, orderBy: { order: 'asc' } });
    res.json({ success: true, subcategories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
