export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { total: true },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 10 }, isActive: true },
        select: { id: true, name: true, sku: true, stock: true },
        take: 10,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { displayName: true, email: true },
          },
        },
      }),
    ]);

    // Get monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'paid',
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyRevenueMap = new Map();
    orders.forEach(order => {
      const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth() + 1}`;
      if (!monthlyRevenueMap.has(key)) {
        monthlyRevenueMap.set(key, { revenue: 0, orders: 0, year: order.createdAt.getFullYear(), month: order.createdAt.getMonth() + 1 });
      }
      const data = monthlyRevenueMap.get(key);
      data.revenue += order.total;
      data.orders += 1;
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
      monthlyRevenue,
    });
  } catch (error: any) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
