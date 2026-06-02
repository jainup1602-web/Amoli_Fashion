export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';

// GET — Fetch user's return requests
export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const returns = await prisma.returnrequest.findMany({
      where: { userId: authResult.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: { orderNumber: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({ success: true, returns });
  } catch (error: any) {
    console.error('Returns fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

// POST — Create a return request
export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { orderId, orderItemId, reason } = await request.json();

    if (!orderId || !orderItemId || !reason?.trim()) {
      return NextResponse.json(
        { error: 'Order ID, item ID, and reason are required' },
        { status: 400 }
      );
    }

    // 1. Verify order exists, belongs to user, and is delivered
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: authResult.user.id,
      },
      include: { orderitem: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.orderStatus !== 'delivered') {
      return NextResponse.json(
        { error: 'Returns can only be requested for delivered orders' },
        { status: 400 }
      );
    }

    // 2. Check 2-day return window (from the order's updatedAt which reflects delivery date)
    const deliveryDate = new Date(order.updatedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 2) {
      return NextResponse.json(
        { error: 'Return window has expired. Returns must be requested within 2 days of delivery.' },
        { status: 400 }
      );
    }

    // 3. Find the order item
    const orderItem = order.orderitem.find((item) => item.id === orderItemId);
    if (!orderItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    // 4. Check if already returned
    const existingReturn = await prisma.returnrequest.findFirst({
      where: {
        orderId,
        orderItemId,
        status: { notIn: ['rejected'] }, // Allow re-request if rejected
      },
    });

    if (existingReturn) {
      return NextResponse.json(
        { error: 'A return request already exists for this item' },
        { status: 400 }
      );
    }

    // 5. Create return request
    const returnRequest = await prisma.returnrequest.create({
      data: {
        orderId,
        orderItemId,
        userId: authResult.user.id,
        productName: orderItem.name,
        productImage: orderItem.image,
        quantity: orderItem.quantity,
        reason: reason.trim(),
        refundAmount: orderItem.subtotal,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      returnRequest,
      message: 'Return request submitted successfully',
    });
  } catch (error: any) {
    console.error('Return request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create return request' },
      { status: 500 }
    );
  }
}
