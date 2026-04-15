const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders, lowStockProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { orderitem: true, user: { select: { displayName: true, email: true } } }
      }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 10 } },
        select: { id: true, name: true, sku: true, stock: true },
        take: 10, orderBy: { stock: 'asc' }
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
        totalUsers,
        lowStockCount: lowStockProducts.length,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
