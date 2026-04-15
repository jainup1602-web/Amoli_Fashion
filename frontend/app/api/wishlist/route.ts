export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch user's wishlist
export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    // For guest users, return empty wishlist
    return NextResponse.json({ 
      success: true, 
      wishlist: { items: [] } 
    });
  }

  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: authResult.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            originalPrice: true,
            specialPrice: true,
            stock: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      wishlist: { items: wishlistItems } 
    });
  } catch (error: any) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    // For guest users, return error to handle locally
    return NextResponse.json(
      { success: false, message: 'Authentication required for server wishlist' },
      { status: 401 }
    );
  }

  try {
    const { productId } = await request.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const exists = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: authResult.user.id,
          productId,
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: 'Item already in wishlist' },
        { status: 400 }
      );
    }

    await prisma.wishlist.create({
      data: {
        userId: authResult.user.id,
        productId,
      },
    });

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: authResult.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            originalPrice: true,
            specialPrice: true,
            stock: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      wishlist: { items: wishlistItems }, 
      message: 'Item added to wishlist' 
    });
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID required' },
        { status: 400 }
      );
    }

    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: authResult.user.id,
          productId,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found in wishlist' },
        { status: 404 }
      );
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: authResult.user.id,
          productId,
        },
      },
    });

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: authResult.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            originalPrice: true,
            specialPrice: true,
            stock: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      wishlist: { items: wishlistItems }, 
      message: 'Item removed from wishlist' 
    });
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
