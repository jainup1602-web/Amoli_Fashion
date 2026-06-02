export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';

// GET — Fetch wallet balance + transaction history
export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // "credit" | "debit" | null

    // Fetch current balance
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: { walletBalance: true },
    });

    // Build filter
    const where: any = { userId: authResult.user.id };
    if (type && (type === 'credit' || type === 'debit')) {
      where.type = type;
    }

    // Fetch transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.wallettransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.wallettransaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      walletBalance: user?.walletBalance || 0,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
