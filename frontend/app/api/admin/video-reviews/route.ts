export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all video reviews
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const videoReviews = await prisma.videoreview.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      videoReviews
    });
  } catch (error) {
    console.error('Error fetching video reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch video reviews' },
      { status: 500 }
    );
  }
}

// POST - Create new video review
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { customerName, customerLocation, rating, videoUrl, thumbnailUrl, isActive, order } = body;

    // Validate required fields
    if (!customerName || !rating || !videoUrl) {
      return NextResponse.json(
        { success: false, message: 'Customer name, rating, and video URL are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const videoReview = await prisma.videoreview.create({
      data: {
        customerName,
        customerLocation: customerLocation || null,
        rating: parseInt(rating),
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order ? parseInt(order) : 0
      }
    });

    return NextResponse.json({
      success: true,
      videoReview
    });
  } catch (error) {
    console.error('Error creating video review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create video review' },
      { status: 500 }
    );
  }
}

// PUT - Update video review
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { id, customerName, customerLocation, rating, videoUrl, thumbnailUrl, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Video review ID is required' },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerLocation !== undefined) updateData.customerLocation = customerLocation;
    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = parseInt(order);

    const videoReview = await prisma.videoreview.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      videoReview
    });
  } catch (error) {
    console.error('Error updating video review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update video review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete video review
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Video review ID is required' },
        { status: 400 }
      );
    }

    await prisma.videoreview.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Video review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete video review' },
      { status: 500 }
    );
  }
}
