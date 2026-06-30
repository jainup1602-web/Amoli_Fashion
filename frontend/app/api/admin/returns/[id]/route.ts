export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET — Single return request
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await verifyAdmin(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const returnRequest = await prisma.returnrequest.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { displayName: true, email: true, phoneNumber: true } },
        order: true,
      },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, returnRequest });
  } catch (error: any) {
    console.error('Fetch return request error:', error);
    return NextResponse.json({ error: 'Failed to fetch return request' }, { status: 500 });
  }
}

// PUT — Approve/Reject return request
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await verifyAdmin(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { action, adminNotes, adjustedRefundAmount } = await request.json(); // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject"' }, { status: 400 });
    }

    const returnRequest = await prisma.returnrequest.findUnique({
      where: { id: params.id },
      include: { user: true, order: { include: { orderitem: true } } },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    if (returnRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot ${action} because request is already ${returnRequest.status}` },
        { status: 400 }
      );
    }

    if (action === 'reject') {
      const updated = await prisma.returnrequest.update({
        where: { id: params.id },
        data: {
          status: 'rejected',
          adminNotes: adminNotes || null,
        },
      });
      return NextResponse.json({ success: true, returnRequest: updated, message: 'Return request rejected' });
    }

    // --- APPROVE FLOW ---
    const finalRefundAmount = adjustedRefundAmount !== undefined ? Number(adjustedRefundAmount) : returnRequest.refundAmount;

    // Use a transaction to ensure everything happens together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update return request status
      const updatedReturn = await tx.returnrequest.update({
        where: { id: params.id },
        data: {
          status: 'refunded',
          refundAmount: finalRefundAmount,
          adminNotes: adminNotes || null,
        },
      });



      // 4. Update order status to "returned" if all items are returned? 
      // Simplified: Just mark the order status as "returned"
      await tx.order.update({
        where: { id: returnRequest.orderId },
        data: { orderStatus: 'returned' },
      });

      // 5. Restore stock using the actual productId
      const orderItem = returnRequest.order.orderitem.find(i => i.id === returnRequest.orderItemId);
      if (orderItem) {
        await tx.product.update({
          where: { id: orderItem.productId },
          data: { stock: { increment: returnRequest.quantity } },
        });
      }

      return updatedReturn;
    });

    return NextResponse.json({
      success: true,
      returnRequest: result,
      message: `Return request approved and marked as refunded.`,
    });
  } catch (error: any) {
    console.error('Approve/Reject return error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process return request' },
      { status: 500 }
    );
  }
}
