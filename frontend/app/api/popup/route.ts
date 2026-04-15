export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch active popup for display
export async function GET(request: NextRequest) {
  try {
    console.log('🎁 Fetching popup data...');
    
    const popup = await prisma.popup.findFirst({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Popup found:', popup ? popup.title : 'No popup found');

    return NextResponse.json({
      success: true,
      popup
    });
  } catch (error) {
    console.error('❌ Error fetching popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popup' },
      { status: 500 }
    );
  }
}