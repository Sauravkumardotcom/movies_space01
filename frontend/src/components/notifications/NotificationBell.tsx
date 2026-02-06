import { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotification';
import { Bell, Loader, Trash2 } from 'lucide-react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useNotifications(page, false);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  // Safe array guard - ensure data.data is always an array
  const notifications = Array.isArray(data?.data) ? data.data : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-300 hover:text-white transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          )}

          {notifications.length === 0 && (
            <div className="text-center py-8 text-gray-400">No notifications</div>
          )}

          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-700 transition cursor-pointer ${
                  !notification.isRead ? 'bg-gray-700/50' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">
                      {notification.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {notification.message}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNotification.mutate(notification.id)}
                    className="text-gray-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead.mutate(notification.id)}
                    className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-gray-700 flex justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-3 py-1 rounded transition"
              >
                Previous
              </button>
              <span className="text-xs text-gray-400">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.totalPages}
                className="text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-3 py-1 rounded transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
