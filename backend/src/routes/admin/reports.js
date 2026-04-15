const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

// GET /api/admin/reports/top-selling
router.get('/top-selling', verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10');
    const period = req.query.period || 'all'; // all | 7d | 30d | 90d

    let dateFilter = {};
    if (period !== 'all') {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      dateFilter = { createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } };
    }

    // Aggregate order items grouped by product
    const topProducts = await prisma.orderitem.groupBy({
      by: ['productId', 'name'],
      where: {
        order: { paymentStatus: 'paid', ...dateFilter },
      },
      _sum: { quantity: true, subtotal: true },
      _count: { orderId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    // Get product details for each
    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, slug: true, images: true, stock: true, originalPrice: true, specialPrice: true },
    });

    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = {
        ...p,
        images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(),
      };
    });

    const result = topProducts.map((item, index) => ({
      rank: index + 1,
      productId: item.productId,
      name: item.name,
      totalSold: item._sum.quantity || 0,
      totalRevenue: item._sum.subtotal || 0,
      orderCount: item._count.orderId || 0,
      image: productMap[item.productId]?.images?.[0] || null,
      slug: productMap[item.productId]?.slug || '',
      stock: productMap[item.productId]?.stock || 0,
      price: productMap[item.productId]?.specialPrice || productMap[item.productId]?.originalPrice || 0,
    }));

    // Summary stats
    const totalRevenue = result.reduce((s, p) => s + p.totalRevenue, 0);
    const totalUnitsSold = result.reduce((s, p) => s + p.totalSold, 0);

    res.json({ success: true, products: result, summary: { totalRevenue, totalUnitsSold, period } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
