export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired coupon code' },
        { status: 400 }
      );
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required` },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'Coupon usage limit exceeded' },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully',
      discountAmount,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
