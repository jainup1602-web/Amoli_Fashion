export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all popups
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const popups = await (prisma as any).popup.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      popups
    });
  } catch (error) {
    console.error('Error fetching popups:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch popups' },
      { status: 500 }
    );
  }
}

// POST - Create new popup
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
    const { 
      title, 
      subtitle, 
      description, 
      image, 
      offerText, 
      buttonText, 
      buttonLink, 
      isActive, 
      showDelay 
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    const popup = await (prisma as any).popup.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        image: image || null,
        offerText: offerText || null,
        buttonText: buttonText || 'Shop Now',
        buttonLink: buttonLink || '/products',
        isActive: isActive !== undefined ? isActive : true,
        showDelay: showDelay || 2000
      }
    });

    return NextResponse.json({
      success: true,
      popup
    });
  } catch (error) {
    console.error('Error creating popup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create popup' },
      { status: 500 }
    );
  }
}

// PUT - Update popup
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
    const { 
      id, 
      title, 
      subtitle, 
      description, 
      image, 
      offerText, 
      buttonText, 
      buttonLink, 
      isActive, 
      showDelay 
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Popup ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (offerText !== undefined) updateData.offerText = offerText;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (buttonLink !== undefined) updateData.buttonLink = buttonLink;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (showDelay !== undefined) updateData.showDelay = showDelay;

    const popup = await (prisma as any).popup.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      popup
    });
  } catch (error) {
    console.error('Error updating popup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update popup' },
      { status: 500 }
    );
  }
}

// DELETE - Delete popup
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
        { success: false, message: 'Popup ID is required' },
        { status: 400 }
      );
    }

    await (prisma as any).popup.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Popup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting popup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete popup' },
      { status: 500 }
    );
  }
}