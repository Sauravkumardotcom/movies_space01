import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin`,
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
    console.error('Admin API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface UsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  comments: number;
  ratings: number;
  favorites: number;
  watchlist: number;
  history: number;
  uploads: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalMovies: number;
  totalMusic: number;
  totalShorts: number;
  totalComments: number;
  totalRatings: number;
  totalContent: number;
}

export interface ModerationLog {
  id: string;
  action: string;
  targetId: string;
  targetType: string;
  reason?: string;
  createdAt: string;
}

export interface ModLogsResponse {
  data: ModerationLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Report {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  reason: string;
  status: string;
  resolvedAt?: string;
  resolution?: string;
  resolutionNotes?: string;
  createdAt: string;
  user: { username: string; email: string };
}

export interface ReportsResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminService = {
  /**
   * Get all users
   */
  async getAllUsers(page: number = 1, limit: number = 20) {
    const res = await API.get('/users', {
      params: { page, limit },
    });
    return res.data.data as UsersResponse;
  },

  /**
   * Get user stats
   */
  async getUserStats(userId: string) {
    const res = await API.get(`/users/${userId}/stats`);
    return res.data.data as UserStats;
  },

  /**
   * Get platform stats
   */
  async getPlatformStats() {
    const res = await API.get('/platform/stats');
    return res.data.data as PlatformStats;
  },

  /**
   * Ban user
   */
  async banUser(userId: string, reason?: string) {
    const res = await API.post(`/users/${userId}/ban`, { reason });
    return res.data.data;
  },

  /**
   * Unban user
   */
  async unbanUser(userId: string) {
    const res = await API.delete(`/users/${userId}/ban`);
    return res.data;
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId: string, reason?: string) {
    const res = await API.delete(`/comments/${commentId}`, {
      data: { reason },
    });
    return res.data;
  },

  /**
   * Get moderation logs
   */
  async getModerationLogs(page: number = 1, limit: number = 20) {
    const res = await API.get('/moderation-logs', {
      params: { page, limit },
    });
    return res.data.data as ModLogsResponse;
  },

  /**
   * Report content
   */
  async reportContent(contentId: string, contentType: string, reason: string) {
    const res = await API.post('/reports', {
      contentId,
      contentType,
      reason,
    });
    return res.data.data as Report;
  },

  /**
   * Get reports
   */
  async getReports(page: number = 1, limit: number = 20, status?: string) {
    const res = await API.get('/reports', {
      params: { page, limit, status },
    });
    return res.data.data as ReportsResponse;
  },

  /**
   * Resolve report
   */
  async resolveReport(reportId: string, action: string, notes?: string) {
    const res = await API.put(`/reports/${reportId}`, {
      action,
      notes,
    });
    return res.data.data as Report;
  },
};
