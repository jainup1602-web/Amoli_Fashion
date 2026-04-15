import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    // Verify payment signature
    const crypto = require('crypto');
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');
    const isValid = generatedSignature === razorpaySignature;

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId },
      include: { orderitem: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayPaymentId,
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      },
    });

    // Update product stock
    for (const item of order.orderitem) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity },
        },
      });
    }

    // Update coupon usage
    if (order.couponCode) {
      await prisma.coupon.updateMany({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Clear cart
    await prisma.cart.deleteMany({
      where: { userId: authResult.user.id },
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { orderitem: true },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Payment verified and order confirmed',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
