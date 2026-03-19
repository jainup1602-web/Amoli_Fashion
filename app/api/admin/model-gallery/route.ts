import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all model gallery items for admin
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const models = await prisma.modelgallery.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
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

// POST - Create new model gallery item
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { modelName, image, description, category, isActive, order } = body;

    if (!modelName || !image) {
      return NextResponse.json(
        { success: false, error: 'Model name and image are required' },
        { status: 400 }
      );
    }

    const model = await prisma.modelgallery.create({
      data: {
        modelName,
        image,
        description,
        category,
        isActive: isActive ?? true,
        order: order ?? 0
      }
    });

    return NextResponse.json({
      success: true,
      model
    });
  } catch (error) {
    console.error('Error creating model gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create model gallery item' },
      { status: 500 }
    );
  }
}

// PUT - Update model gallery item
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { id, modelName, image, description, category, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const model = await prisma.modelgallery.update({
      where: { id },
      data: {
        ...(modelName && { modelName }),
        ...(image && { image }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order })
      }
    });

    return NextResponse.json({
      success: true,
      model
    });
  } catch (error) {
    console.error('Error updating model gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update model gallery item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete model gallery item
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Model ID is required' },
        { status: 400 }
      );
    }

    await prisma.modelgallery.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Model gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting model gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete model gallery item' },
      { status: 500 }
    );
  }
}
