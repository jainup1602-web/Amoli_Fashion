export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma, executeWithRetry } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all banners (admin)
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const banners = await executeWithRetry(async () => {
      return await prisma.banner.findMany({
        orderBy: { order: 'asc' },
      });
    });

    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.code === 'P1017' 
        ? 'Database connection lost. Please ensure MySQL is running and try again.' 
        : error.message 
    }, { status: 500 });
  }
}

// POST - Create banner
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { title, subtitle, description, image, link, buttonText, order, isActive } = body;

    if (!title || !image) {
      return NextResponse.json({ success: false, message: 'Title and image required' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        description,
        image,
        link,
        buttonText,
        order: order ? parseInt(order) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - Update banner
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
    const { id, title, subtitle, description, image, link, buttonText, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Banner ID required' }, { status: 400 });
    }

    // Use retry mechanism for database operation
    const banner = await executeWithRetry(async () => {
      return await prisma.banner.update({
        where: { id },
        data: { 
          title, 
          subtitle, 
          description, 
          image, 
          link, 
          buttonText, 
          order: order ? parseInt(order) : 0, 
          isActive 
        },
      });
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.code === 'P1017' 
        ? 'Database connection lost. Please ensure MySQL is running and try again.' 
        : error.message 
    }, { status: 500 });
  }
}

// DELETE - Delete banner
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
      return NextResponse.json({ success: false, message: 'Banner ID required' }, { status: 400 });
    }

    await prisma.banner.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
