import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';
import { generateOrderId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { shippingAddress, couponCode, paymentMethod: reqPaymentMethod } = await request.json();
    const isCOD = reqPaymentMethod === 'cod';

    const cartItems = await prisma.cart.findMany({
      where: { userId: authResult.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name}` },
          { status: 400 }
        );
      }
    }

    let subtotal = 0;
    const orderItems = cartItems.map((item) => {
      const price = item.product.specialPrice || item.product.originalPrice;
      subtotal += price * item.quantity;

      let firstImage = '';
      try {
        const imgs = typeof item.product.images === 'string'
          ? JSON.parse(item.product.images)
          : item.product.images;
        firstImage = Array.isArray(imgs) ? imgs[0] || '' : '';
      } catch { firstImage = ''; }

      return {
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price,
        image: firstImage,
        subtotal: price * item.quantity,
      };
    });

    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });
      if (coupon && subtotal >= (coupon.minOrderValue || 0)) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          } else {
            discount = coupon.discountValue;
          }
        }
      }
    }

    const shippingCharges = subtotal > 500 ? 0 : 50;

    // Fetch GST settings
    const taxSettings = await prisma.settings.findMany({
      where: { key: { in: ['taxEnabled', 'taxRate'] } }
    });
    const taxEnabledSetting = taxSettings.find(s => s.key === 'taxEnabled');
    const taxRateSetting = taxSettings.find(s => s.key === 'taxRate');
    const taxEnabled = taxEnabledSetting ? JSON.parse(taxEnabledSetting.value) : false;
    const taxRate = taxRateSetting ? JSON.parse(taxRateSetting.value) : 0;
    const taxableAmount = subtotal - discount;
    const tax = taxEnabled ? Math.round((taxableAmount * taxRate) / 100 * 100) / 100 : 0;

    const total = taxableAmount + shippingCharges + tax;
    const orderNumber = generateOrderId();

    // COD — no Razorpay needed
    if (isCOD) {
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: authResult.user.id,
          customerName: shippingAddress.name,
          customerEmail: authResult.user.email || '',
          customerPhone: shippingAddress.phone,
          shippingAddress: JSON.stringify(shippingAddress),
          subtotal,
          discount,
          shippingCharges,
          tax,
          total,
          couponCode: couponCode?.toUpperCase(),
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          orderStatus: 'confirmed',
          orderitem: { create: orderItems },
        },
        include: { orderitem: true },
      });

      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
        });
      }

      if (couponCode) {
        await prisma.coupon.updateMany({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }

      await prisma.cart.deleteMany({ where: { userId: authResult.user.id } });
      return NextResponse.json({ order, message: 'Order placed successfully' });
    }

    // Razorpay flow — lazy import to avoid crash when keys are missing
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please use Cash on Delivery.' },
        { status: 503 }
      );
    }

    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: orderNumber,
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: authResult.user.id,
        customerName: shippingAddress.name,
        customerEmail: authResult.user.email || '',
        customerPhone: shippingAddress.phone,
        shippingAddress: JSON.stringify(shippingAddress),
        subtotal,
        discount,
        shippingCharges,
        tax,
        total,
        couponCode: couponCode?.toUpperCase(),
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
        orderitem: { create: orderItems },
      },
      include: { orderitem: true },
    });

    return NextResponse.json({
      order,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      key: razorpayKeyId,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
