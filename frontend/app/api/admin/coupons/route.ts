export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const couponData = await request.json();

    const coupon = await prisma.coupon.create({
      data: couponData,
    });

    return NextResponse.json(
      { success: true, coupon, message: 'Coupon created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Coupon creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error('Coupon deletion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
