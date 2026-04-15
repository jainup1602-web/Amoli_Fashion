export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch user notifications
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    
    if ('error' in authResult) {
      // For guest users, return empty notifications
      return NextResponse.json({
        success: true,
        notifications: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          pages: 0,
        },
        unreadCount: 0,
      });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = { userId: authResult.user.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { userId: authResult.user.id, isRead: false } 
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications: notifications.map(n => ({
        ...n,
        // Sanitize link — strip accidental JSON encoding (quotes/brackets)
        link: n.link ? n.link.replace(/^["'\[]+|["'\]]+$/g, '') : n.link,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create notification (admin or system)
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { userId, type, title, message, link: rawLink } = body;
    // Sanitize link — strip accidental quotes/brackets from JSON serialization
    const link = rawLink ? String(rawLink).replace(/^["'\[]+|["'\]]+$/g, '') : undefined;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type || 'system',
        title,
        message,
        link,
      },
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Mark notification(s) as read
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId: authResult.user.id, isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } else if (notificationId) {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        notification,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing notificationId or markAllAsRead' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
      await prisma.notification.deleteMany({
        where: {
          userId: authResult.user.id,
          isRead: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All read notifications deleted',
      });
    } else if (notificationId) {
      await prisma.notification.delete({
        where: { id: notificationId },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification deleted',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing notification ID or deleteAll parameter' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
