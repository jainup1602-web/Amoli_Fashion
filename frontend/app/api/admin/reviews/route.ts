import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all reviews (admin)
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');

    const where: any = {};
    if (status === 'pending') where.isApproved = false;
    if (status === 'approved') where.isApproved = true;
    if (rating) where.rating = parseInt(rating);

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, slug: true },
        },
        user: {
          select: { displayName: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - Update review status
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { id, isApproved } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Review ID required' }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - Delete review
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Review ID required' }, { status: 400 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
