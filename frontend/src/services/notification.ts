import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/notifications`,
  withCredentials: true,
});

// Add auth token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error handling to responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Notification API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const notificationService = {
  /**
   * Get user notifications with safe error handling
   * Always returns a valid NotificationsResponse, never crashes
   */
  async getUserNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    try {
      const res = await API.get('/', {
        params: { page, limit, unreadOnly },
      });

      // Validate response structure
      const data = res.data?.data;
      if (
        data &&
        typeof data === 'object' &&
        Array.isArray(data.data)
      ) {
        return data as NotificationsResponse;
      }

      // Return safe fallback if response is invalid
      return {
        data: Array.isArray(data) ? data : [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty array wrapped in safe structure
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  /**
   * Get unread count with error handling
   */
  async getUnreadCount() {
    try {
      const res = await API.get('/unread-count');
      return res.data?.data?.count ?? 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Mark notification as read with error handling
   */
  async markAsRead(notificationId: string) {
    try {
      const res = await API.put(`/${notificationId}/read`);
      return res.data?.data ?? null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all as read with error handling
   */
  async markAllAsRead() {
    try {
      const res = await API.put('/read-all');
      return res.data ?? { updated: 0 };
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Delete notification with error handling
   */
  async deleteNotification(notificationId: string) {
    try {
      const res = await API.delete(`/${notificationId}`);
      return res.data ?? { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};
