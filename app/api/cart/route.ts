import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    // For guest users, return empty cart
    return NextResponse.json({ cart: { items: [] } });
  }

  try {
    const cartItems = await prisma.cart.findMany({
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
          },
        },
      },
    });

    return NextResponse.json({ cart: { items: cartItems } });
  } catch (error: any) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    // For guest users, return error to handle locally
    return NextResponse.json(
      { error: 'Authentication required for server cart' },
      { status: 401 }
    );
  }

  try {
    const { productId, quantity } = await request.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    const existingItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: authResult.user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cart.create({
        data: {
          userId: authResult.user.id,
          productId,
          quantity,
        },
      });
    }

    const cartItems = await prisma.cart.findMany({
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
          },
        },
      },
    });

    return NextResponse.json({ 
      cart: { items: cartItems }, 
      message: 'Item added to cart' 
    });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { productId, quantity } = await request.json();

    const item = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: authResult.user.id,
          productId,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      await prisma.cart.delete({ where: { id: item.id } });
    } else {
      await prisma.cart.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    const cartItems = await prisma.cart.findMany({
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
          },
        },
      },
    });

    return NextResponse.json({ 
      cart: { items: cartItems }, 
      message: 'Cart updated' 
    });
  } catch (error: any) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { productId } = await request.json();

    if (productId) {
      // Remove specific item from cart
      const item = await prisma.cart.findUnique({
        where: {
          userId_productId: {
            userId: authResult.user.id,
            productId,
          },
        },
      });

      if (!item) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        );
      }

      await prisma.cart.delete({ where: { id: item.id } });
    } else {
      // Clear entire cart
      await prisma.cart.deleteMany({
        where: { userId: authResult.user.id },
      });
    }

    const cartItems = await prisma.cart.findMany({
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
          },
        },
      },
    });

    return NextResponse.json({ 
      cart: { items: cartItems }, 
      message: productId ? 'Item removed from cart' : 'Cart cleared' 
    });
  } catch (error: any) {
    console.error('Cart delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
