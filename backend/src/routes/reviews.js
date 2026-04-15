const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    const where = { isApproved: true };
    if (productId) where.productId = productId;
    const reviews = await prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;
    const review = await prisma.review.create({
      data: { productId, userId: req.user.id, userName: req.user.displayName || 'User', rating, comment, images: JSON.stringify(images || []) },
    });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
