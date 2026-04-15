'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/store/slices/notificationSlice';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Package, Heart, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openLoginModal'));
      router.push('/');
      return;
    }

    dispatch(fetchNotifications({ page: 1 }));
  }, [isAuthenticated, dispatch, router]);

  const handleMarkAsRead = async (notificationId: string) => {
    await dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
  };

  const handleDelete = async (notificationId: string) => {
    await dispatch(deleteNotification(notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-6 w-6 text-blue-600" />;
      case 'wishlist':
        return <Heart className="h-6 w-6 text-red-600" />;
      case 'offer':
        return <Package className="h-6 w-6 text-green-600" />;
      case 'product':
        return <Package className="h-6 w-6 text-purple-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Account', href: '/account' }, { label: 'Notifications' }]} />
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" className="text-xs h-8 px-3">
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Mark All Read
              </Button>
            )}
          </div>

          {loading && notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading notifications...</p>
            </Card>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-500">
                We'll notify you when something important happens
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification._id} className={`p-3 sm:p-5 transition hover:shadow-md ${!notification.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link href={notification.link.replace(/^["'\[]+|["'\]]+$/g, '')} onClick={() => { if (!notification.isRead) handleMarkAsRead(notification._id); }} className="block">
                          <NotificationContent notification={notification} />
                        </Link>
                      ) : (
                        <NotificationContent notification={notification} />
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1">
                      {!notification.isRead && (
                        <button onClick={() => handleMarkAsRead(notification._id)} className="p-1.5 text-gray-400 hover:text-[#B76E79] transition-colors" title="Mark as read">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(notification._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationContent({ notification }: { notification: any }) {
  return (
    <>
      <div className="flex items-center space-x-2 mb-1">
        <h3 className="text-base font-semibold text-gray-900">{notification.title}</h3>
        {!notification.isRead && (
          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
        )}
      </div>
      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span className="capitalize">{notification.type}</span>
        <span>•</span>
        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
      </div>
    </>
  );
}
