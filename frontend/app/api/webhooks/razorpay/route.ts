import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Only process successful payments
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ success: true, message: 'No order_id in payment entity' });
      }

      const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
        include: { orderitem: true },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // If already paid, skip to prevent double processing
      if (order.paymentStatus === 'paid') {
        return NextResponse.json({ success: true, message: 'Order already processed' });
      }

      // Update order, stock, coupon atomically
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: order.id },
          data: {
            razorpayPaymentId,
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
          },
        });

        // Decrement stock and increment sales count
        for (const item of order.orderitem) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              salesCount: { increment: item.quantity },
            },
          });
        }

        // Update coupon usage
        if (order.couponCode) {
          await tx.coupon.updateMany({
            where: { code: order.couponCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        await tx.cart.deleteMany({
          where: { userId: order.userId },
        });

        return updated;
      });

      const finalOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { orderitem: true },
      });

      // Auto-push Prepaid order to Shiprocket
      if (finalOrder) {
        try {
          const { createShiprocketOrder } = await import('@/lib/shiprocket');
          const shiprocketResult = await createShiprocketOrder(finalOrder);
          
          await (prisma.order.update as any)({
            where: { id: order.id },
            data: {
              shiprocketOrderId: shiprocketResult.order_id?.toString(),
              shipmentId: shiprocketResult.shipment_id?.toString()
            }
          });
          console.log('✅ Webhook: Prepaid Order pushed to Shiprocket:', shiprocketResult.order_id);
        } catch (shipError: any) {
          console.error('❌ Webhook: Shiprocket Prepaid push failed:', shipError.message);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
