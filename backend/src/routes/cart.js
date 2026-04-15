const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await prisma.cart.findMany({
      where: { userId: req.user.id },
      include: { product: { select: { id: true, name: true, slug: true, images: true, originalPrice: true, specialPrice: true, stock: true } } },
    });
    const parsed = items.map(i => ({
      ...i,
      product: { ...i.product, images: (() => { try { return JSON.parse(i.product.images); } catch { return []; } })() },
    }));
    res.json({ success: true, items: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const item = await prisma.cart.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user.id, productId, quantity },
    });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (quantity <= 0) {
      await prisma.cart.delete({ where: { userId_productId: { userId: req.user.id, productId } } });
    } else {
      await prisma.cart.update({ where: { userId_productId: { userId: req.user.id, productId } }, data: { quantity } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/', verifyToken, async (req, res) => {
  try {
    const { productId } = req.query;
    if (productId) {
      await prisma.cart.delete({ where: { userId_productId: { userId: req.user.id, productId } } });
    } else {
      await prisma.cart.deleteMany({ where: { userId: req.user.id } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
