export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET — List wallet transactions across users
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search'); // email or name

    const where: any = {};
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search } },
          { displayName: { contains: search } },
        ]
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.wallettransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { displayName: true, email: true } },
        },
      }),
      prisma.wallettransaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin wallet fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet transactions' },
      { status: 500 }
    );
  }
}

// POST — Manual credit/debit by admin
export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { userId, type, amount, description } = await request.json(); // type: 'credit' | 'debit'

    if (!userId || !type || !amount || amount <= 0 || !description) {
      return NextResponse.json(
        { error: 'User ID, valid type (credit/debit), positive amount, and description are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'debit' && user.walletBalance < amount) {
      return NextResponse.json(
        { error: `User only has ₹${user.walletBalance} in wallet` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: type === 'credit' 
            ? { increment: amount } 
            : { decrement: amount },
        },
      });

      const transaction = await tx.wallettransaction.create({
        data: {
          userId,
          type,
          amount,
          balance: updatedUser.walletBalance,
          description: description + ' (Admin Adjustment)',
          referenceType: type === 'credit' ? 'admin_credit' : 'admin_debit',
        },
      });

      return { transaction, newBalance: updatedUser.walletBalance };
    });

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      newBalance: result.newBalance,
      message: `Successfully ${type}ed ₹${amount}`,
    });
  } catch (error: any) {
    console.error('Admin wallet adjustment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adjust wallet balance' },
      { status: 500 }
    );
  }
}
