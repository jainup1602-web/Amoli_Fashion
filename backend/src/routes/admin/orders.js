const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const { status, search } = req.query;
    const where = {};
    if (status) where.orderStatus = status;
    if (search) where.OR = [{ orderNumber: { contains: search } }, { customerName: { contains: search } }];
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { orderitem: true } }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { orderitem: true, user: { select: { email: true, displayName: true } } } });
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { orderStatus, trackingNumber, shippingProvider, notes } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { orderStatus, trackingNumber, shippingProvider, notes } });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
