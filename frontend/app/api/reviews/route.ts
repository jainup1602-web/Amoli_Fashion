export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check if request is from logged-in user (to show their pending review too)
    let currentUserId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const authResult = await verifyAuth(request);
        if (!('error' in authResult)) currentUserId = authResult.user.id;
      } catch {}
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        OR: [
          { isApproved: true },
          // Show user's own pending review too
          ...(currentUserId ? [{ userId: currentUserId }] : []),
        ],
      },
      include: {
        user: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { productId, rating, comment, images } = await request.json();

    // Check if user has a delivered order containing this product
    const deliveredOrder = await prisma.orderitem.findFirst({
      where: {
        productId,
        order: {
          userId: authResult.user.id,
          orderStatus: 'delivered',
        },
      },
    });

    if (!deliveredOrder) {
      return NextResponse.json(
        { error: 'You can only review products from delivered orders' },
        { status: 403 }
      );
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: authResult.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: authResult.user.id,
        userName: authResult.user.displayName || 'Anonymous',
        rating,
        comment,
        images: JSON.stringify(images || []),
        isVerified: true, // verified purchase
        isApproved: false,
      },
    });

    return NextResponse.json(
      { review, message: 'Review submitted for approval' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}
