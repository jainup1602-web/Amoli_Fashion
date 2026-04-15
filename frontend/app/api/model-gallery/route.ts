import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch active model gallery items for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    const models = await prisma.modelgallery.findMany({
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
      models
    });
  } catch (error) {
    console.error('Error fetching model gallery:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch model gallery' },
      { status: 500 }
    );
  }
}