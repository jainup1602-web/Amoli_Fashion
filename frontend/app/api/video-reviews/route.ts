export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch active video reviews for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const videoReviews = await prisma.videoreview.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return NextResponse.json({
      success: true,
      videoReviews
    });
  } catch (error) {
    console.error('Error fetching video reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video reviews' },
      { status: 500 }
    );
  }
}