export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET — List all return requests (Admin)
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const [returns, total] = await Promise.all([
      prisma.returnrequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { displayName: true, email: true, phoneNumber: true } },
          order: { select: { orderNumber: true, paymentMethod: true } },
        },
      }),
      prisma.returnrequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      returns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin returns fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch return requests' },
      { status: 500 }
    );
  }
}
