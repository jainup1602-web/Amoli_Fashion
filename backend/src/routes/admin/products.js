// Admin products — re-uses public products router with admin auth
const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } }, subcategory: { select: { name: true } } },
      }),
      prisma.product.count(),
    ]);
    const parsed = products.map(p => ({ ...p, images: (() => { try { return JSON.parse(p.images); } catch { return []; } })() }));
    res.json({ success: true, products: parsed, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
