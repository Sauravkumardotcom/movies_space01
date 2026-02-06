import { useState } from 'react';
import { useNotifications, useMarkAllAsRead } from '../hooks/useNotification';
import { Loader } from 'lucide-react';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page, false);
  const markAllAsRead = useMarkAllAsRead();

  // Safe array guard - ensure data.data is always an array
  const notifications = Array.isArray(data?.data) ? data.data : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length || 0;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No notifications</p>
          </div>
        )}

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition ${
                !notification.isRead
                  ? 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/50'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">
                    {notification.title}
                  </h3>
                  <p className="text-gray-300 mt-1">{notification.message}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full ml-4 mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
            >
              Previous
            </button>
            <span className="text-gray-400 py-2">
              Page {page} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.totalPages}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
