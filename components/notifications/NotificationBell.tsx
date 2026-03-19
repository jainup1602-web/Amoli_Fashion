'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Trash2, Package, Heart, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function NotificationBell() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only fetch notifications if user is authenticated
    if (isAuthenticated) {
      dispatch(fetchNotifications({ page: 1 }));
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    // Set up polling only if authenticated
    if (isAuthenticated) {
      const interval = setInterval(() => {
        dispatch(fetchNotifications({ page: 1 }));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await dispatch(deleteNotification(notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'wishlist':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'offer':
        return <AlertCircle className="h-5 w-5 text-green-600" />;
      case 'product':
        return <Package className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
        style={{ color: '#043927' }}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: '#043927' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-50 rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm hover:opacity-80 flex items-center"
                  style={{ color: '#043927' }}
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        onClick={() => {
                          if (!notification.isRead) {
                            dispatch(markAsRead(notification._id));
                          }
                          setIsOpen(false);
                        }}
                      >
                        <NotificationContent
                          notification={notification}
                          getNotificationIcon={getNotificationIcon}
                          handleMarkAsRead={handleMarkAsRead}
                          handleDelete={handleDelete}
                        />
                      </Link>
                    ) : (
                      <NotificationContent
                        notification={notification}
                        getNotificationIcon={getNotificationIcon}
                        handleMarkAsRead={handleMarkAsRead}
                        handleDelete={handleDelete}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                href="/account/notifications"
                className="text-sm hover:opacity-80 font-medium"
                style={{ color: '#043927' }}
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationContent({
  notification,
  getNotificationIcon,
  handleMarkAsRead,
  handleDelete,
}: any) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="flex-shrink-0 flex items-center space-x-1">
        {!notification.isRead && (
          <button
            onClick={(e) => handleMarkAsRead(notification._id, e)}
            className="p-1 hover:bg-gray-100 rounded"
            style={{ color: '#043927' }}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => handleDelete(notification._id, e)}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
