import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Shiprocket webhook event → our order status mapping
const STATUS_MAP: Record<string, { orderStatus: string; paymentStatus?: string; label: string }> = {
  // Pickup events
  'PICKUP SCHEDULED':        { orderStatus: 'confirmed',   label: 'Pickup Scheduled' },
  'PICKUP GENERATED':        { orderStatus: 'confirmed',   label: 'Pickup Generated' },
  'PICKUP QUEUED':           { orderStatus: 'confirmed',   label: 'Pickup Queued' },
  'PICKUP ERROR':            { orderStatus: 'confirmed',   label: 'Pickup Error' },
  'PICKUP CANCELLED':        { orderStatus: 'confirmed',   label: 'Pickup Cancelled' },
  'OUT FOR PICKUP':          { orderStatus: 'processing',  label: 'Out for Pickup' },
  'PICKED UP':               { orderStatus: 'processing',  label: 'Picked Up' },

  // In-transit events
  'IN TRANSIT':              { orderStatus: 'shipped',     label: 'In Transit' },
  'REACHED AT DESTINATION HUB': { orderStatus: 'shipped', label: 'Reached Destination Hub' },
  'OUT FOR DELIVERY':        { orderStatus: 'out_for_delivery', label: 'Out for Delivery' },

  // Delivery events
  'DELIVERED':               { orderStatus: 'delivered',  paymentStatus: 'paid', label: 'Delivered' },
  'DELIVERY FAILED':         { orderStatus: 'shipped',    label: 'Delivery Failed' },
  'DELIVERY DELAYED':        { orderStatus: 'shipped',    label: 'Delivery Delayed' },

  // Return events
  'RETURN INITIATED':        { orderStatus: 'return_initiated', label: 'Return Initiated' },
  'RETURN PICKED':           { orderStatus: 'return_picked',    label: 'Return Picked' },
  'RETURN IN TRANSIT':       { orderStatus: 'return_in_transit', label: 'Return In Transit' },
  'RETURNED TO ORIGIN':      { orderStatus: 'returned',         label: 'Returned to Origin' },

  // Cancellation
  'CANCELLED':               { orderStatus: 'cancelled',   label: 'Cancelled' },
  'LOST':                    { orderStatus: 'cancelled',   label: 'Lost in Transit' },
  'DAMAGED':                 { orderStatus: 'cancelled',   label: 'Damaged' },
};

// Notification messages for customers
const NOTIFICATION_MAP: Record<string, { title: string; message: string }> = {
  'processing':        { title: 'Order Picked Up', message: 'Your order has been picked up and is being processed.' },
  'shipped':           { title: 'Order Shipped', message: 'Your order is on its way! Track it using your tracking number.' },
  'out_for_delivery':  { title: 'Out for Delivery', message: 'Your order is out for delivery today. Please be available.' },
  'delivered':         { title: 'Order Delivered', message: 'Your order has been delivered successfully. Enjoy your purchase!' },
  'return_initiated':  { title: 'Return Initiated', message: 'Your return request has been initiated.' },
  'returned':          { title: 'Return Complete', message: 'Your return has been completed and refund will be processed.' },
  'cancelled':         { title: 'Order Cancelled', message: 'Your order has been cancelled. Contact support if this is unexpected.' },
};

function verifyShiprocketSignature(payload: string, signature: string): boolean {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification if secret not configured
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-shiprocket-signature') || '';

    // Verify signature if secret is set
    if (process.env.SHIPROCKET_WEBHOOK_SECRET && !verifyShiprocketSignature(rawBody, signature)) {
      console.error('Shiprocket webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log('Shiprocket webhook received:', JSON.stringify(payload, null, 2));

    // Shiprocket sends different payload shapes — normalize them
    const event = payload.event || payload.current_status || payload.status || '';
    const awb = payload.awb || payload.awb_code || payload.tracking_data?.awb_code || '';
    const shiprocketOrderId = String(payload.order_id || payload.shipment_id || '');
    const currentStatus = (payload.current_status || payload.status || event || '').toUpperCase().trim();

    // Find our order by tracking number (AWB) or shiprocket order id stored in trackingNumber/shippingProvider
    let order = null;

    if (awb) {
      order = await prisma.order.findFirst({
        where: { trackingNumber: awb },
        include: { orderitem: true },
      });
    }

    if (!order && shiprocketOrderId) {
      // Try matching by shiprocketOrderId stored in notes or shippingProvider
      order = await prisma.order.findFirst({
        where: {
          OR: [
            { shippingProvider: { contains: shiprocketOrderId } },
            { notes: { contains: shiprocketOrderId } },
          ],
        },
        include: { orderitem: true },
      });
    }

    if (!order) {
      console.warn(`Shiprocket webhook: order not found for AWB=${awb}, shiprocketOrderId=${shiprocketOrderId}`);
      // Return 200 so Shiprocket doesn't retry
      return NextResponse.json({ received: true, warning: 'Order not found' });
    }

    // Map Shiprocket status to our status
    const mapped = STATUS_MAP[currentStatus];
    if (!mapped) {
      console.log(`Shiprocket webhook: unmapped status "${currentStatus}" for order ${order.orderNumber}`);
      return NextResponse.json({ received: true, warning: `Unmapped status: ${currentStatus}` });
    }

    // Build update payload
    const updateData: any = {
      orderStatus: mapped.orderStatus,
      updatedAt: new Date(),
    };

    // Update tracking number if AWB is new
    if (awb && !order.trackingNumber) {
      updateData.trackingNumber = awb;
    }

    // Update payment status for COD on delivery
    if (mapped.paymentStatus && order.paymentMethod === 'cod') {
      updateData.paymentStatus = mapped.paymentStatus;
    }

    // Store courier name if available
    if (payload.courier_name && !order.shippingProvider) {
      updateData.shippingProvider = payload.courier_name;
    }

    // Only update if status actually changed (avoid duplicate notifications)
    const statusChanged = order.orderStatus !== mapped.orderStatus;

    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    // Send in-app notification to customer if status changed
    if (statusChanged && NOTIFICATION_MAP[mapped.orderStatus]) {
      const notif = NOTIFICATION_MAP[mapped.orderStatus];
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: notif.title,
          message: `${notif.message} (Order #${order.orderNumber})`,
          type: 'order',
          link: `/account/orders`,
        },
      });
    }

    // Auto-update stock on delivery (mark as sold)
    if (mapped.orderStatus === 'delivered') {
      for (const item of (order as any).orderitem) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            salesCount: { increment: item.quantity },
          },
        }).catch(() => {}); // Non-critical
      }
    }

    console.log(`Shiprocket webhook: Order ${order.orderNumber} → ${mapped.orderStatus} (${mapped.label})`);

    return NextResponse.json({
      received: true,
      orderNumber: order.orderNumber,
      newStatus: mapped.orderStatus,
      label: mapped.label,
    });

  } catch (error: any) {
    console.error('Shiprocket webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Shiprocket may send GET to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'Shiprocket webhook endpoint active' });
}
