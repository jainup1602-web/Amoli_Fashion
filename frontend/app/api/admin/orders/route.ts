export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const orderStatus = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (orderStatus) where.orderStatus = orderStatus;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { displayName: true, email: true, phoneNumber: true },
          },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
