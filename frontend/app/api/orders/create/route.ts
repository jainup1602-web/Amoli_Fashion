export const dynamic = 'force-dynamic'
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
    const { shippingAddress, couponCode, paymentMethod: reqPaymentMethod, walletAmountToUse = 0 } = await request.json();
    const isCOD = reqPaymentMethod === 'cod';

    // Verify wallet amount is valid
    const userWallet = await prisma.user.findUnique({ where: { id: authResult.user.id }, select: { walletBalance: true } });
    const availableWallet = userWallet?.walletBalance || 0;
    
    if (walletAmountToUse > availableWallet) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

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
    
    // Calculate final payable amount after wallet deduction
    const walletUsed = Math.min(Number(walletAmountToUse), total);
    const payableAmount = total - walletUsed;
    const isFullyPaidByWallet = walletUsed > 0 && payableAmount <= 0;

    // Helper function to handle wallet deduction
    const handleWalletDeduction = async (tx: any, orderId: string) => {
      if (walletUsed > 0) {
        const updatedUser = await tx.user.update({
          where: { id: authResult.user.id },
          data: { walletBalance: { decrement: walletUsed } },
        });
        await tx.wallettransaction.create({
          data: {
            userId: authResult.user.id,
            type: 'debit',
            amount: walletUsed,
            balance: updatedUser.walletBalance,
            description: `Used for order ${orderNumber}`,
            referenceId: orderId,
            referenceType: 'order_payment',
          },
        });
      }
    };

    // Fully paid by wallet (No Razorpay/COD needed)
    if (isFullyPaidByWallet) {
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
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
            walletAmountUsed: walletUsed,
            couponCode: couponCode?.toUpperCase(),
            paymentMethod: 'wallet',
            paymentStatus: 'completed', // Fully paid
            orderStatus: 'confirmed',
            orderitem: { create: orderItems },
          },
          include: { orderitem: true },
        });

        await handleWalletDeduction(tx, order.id);

        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
          });
        }

        if (couponCode) {
          await tx.coupon.updateMany({
            where: { code: couponCode.toUpperCase() },
            data: { usedCount: { increment: 1 } },
          });
        }
        
        await tx.cart.deleteMany({ where: { userId: authResult.user.id } });
        return order;
      });
      
      // Auto-push Wallet-paid order to Shiprocket
      try {
        const { createShiprocketOrder } = await import('@/lib/shiprocket');
        const shiprocketResult = await createShiprocketOrder(result);
        
        await (prisma.order.update as any)({
          where: { id: result.id },
          data: {
            shiprocketOrderId: shiprocketResult.order_id?.toString(),
            shipmentId: shiprocketResult.shipment_id?.toString()
          }
        });
      } catch (shipError: any) {
        console.error('❌ Shiprocket push failed:', shipError.message);
      }

      return NextResponse.json({ order: result, message: 'Order placed successfully using wallet' });
    }

    // COD — no Razorpay needed
    if (isCOD) {
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
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
            walletAmountUsed: walletUsed,
            couponCode: couponCode?.toUpperCase(),
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderStatus: 'confirmed',
            orderitem: { create: orderItems },
          },
          include: { orderitem: true },
        });

        await handleWalletDeduction(tx, order.id);

        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
          });
        }

        if (couponCode) {
          await tx.coupon.updateMany({
            where: { code: couponCode.toUpperCase() },
            data: { usedCount: { increment: 1 } },
          });
        }

        await tx.cart.deleteMany({ where: { userId: authResult.user.id } });
        return order;
      });

      // Auto-push COD order to Shiprocket
      try {
        const { createShiprocketOrder } = await import('@/lib/shiprocket');
        const shiprocketResult = await createShiprocketOrder(result);
        
        await (prisma.order.update as any)({
          where: { id: result.id },
          data: {
            shiprocketOrderId: shiprocketResult.order_id?.toString(),
            shipmentId: shiprocketResult.shipment_id?.toString()
          }
        });
        console.log('✅ COD Order pushed to Shiprocket:', shiprocketResult.order_id);
      } catch (shipError: any) {
        console.error('❌ Shiprocket COD push failed:', shipError.message);
      }

      return NextResponse.json({ order: result, message: 'Order placed successfully' });
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
      amount: Math.round(payableAmount * 100), // Create Razorpay order for ONLY the remaining payable amount
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
        walletAmountUsed: walletUsed,
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
      amount: payableAmount,
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
