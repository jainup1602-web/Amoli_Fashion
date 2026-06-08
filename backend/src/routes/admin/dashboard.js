const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      monthlyRevenue,
      weeklyRevenue,
      paidOrdersCount,
      statusCounts,
      monthlyData,
      topProducts
    ] = await Promise.all([
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
      // Monthly revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'paid', createdAt: { gte: startOfMonth } }
      }),
      // Weekly revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'paid', createdAt: { gte: startOfWeek } }
      }),
      // Paid orders count for AOV
      prisma.order.count({ where: { paymentStatus: 'paid' } }),
      // Order status distribution
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: { id: true }
      }),
      // Monthly revenue for last 12 months (raw query via groupBy)
      getMonthlyRevenue(),
      // Top selling products
      prisma.orderitem.groupBy({
        by: ['productId', 'name'],
        where: { order: { paymentStatus: 'paid' } },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    // Get product images for top products
    const productIds = topProducts.map(p => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, images: true, slug: true, originalPrice: true, specialPrice: true, stock: true },
    });
    const productMap = {};
    productDetails.forEach(p => {
      let imgs = [];
      try { imgs = JSON.parse(p.images); } catch { imgs = []; }
      productMap[p.id] = { ...p, images: imgs };
    });

    const bestSellingProducts = topProducts.map((item, index) => ({
      rank: index + 1,
      productId: item.productId,
      name: item.name,
      totalSold: item._sum.quantity || 0,
      totalRevenue: item._sum.subtotal || 0,
      image: productMap[item.productId]?.images?.[0] || null,
      stock: productMap[item.productId]?.stock || 0,
      price: productMap[item.productId]?.specialPrice || productMap[item.productId]?.originalPrice || 0,
    }));

    // Format status distribution
    const orderStatusDistribution = {};
    statusCounts.forEach(s => {
      orderStatusDistribution[s.orderStatus] = s._count.id;
    });

    const totalRevenueValue = totalRevenue._sum.total || 0;
    const averageOrderValue = paidOrdersCount > 0 ? totalRevenueValue / paidOrdersCount : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenueValue,
        totalProducts,
        totalUsers,
        lowStockCount: lowStockProducts.length,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        weeklyRevenue: weeklyRevenue._sum.total || 0,
      },
      recentOrders,
      lowStockProducts,
      orderStatusDistribution,
      monthlyRevenueData: monthlyData,
      bestSellingProducts,
    });
  } catch (err) {
    console.error('Dashboard API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get monthly revenue for the last 12 months
 */
async function getMonthlyRevenue() {
  try {
    const now = new Date();
    const months = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      const result = await prisma.order.aggregate({
        _sum: { total: true },
        _count: { id: true },
        where: {
          paymentStatus: 'paid',
          createdAt: { gte: date, lt: nextMonth }
        }
      });
      
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        revenue: result._sum.total || 0,
        orders: result._count.id || 0,
      });
    }
    
    return months;
  } catch (err) {
    console.error('Monthly revenue error:', err);
    return [];
  }
}

module.exports = router;
