import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/comments`,
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
    console.error('Comment API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export interface Comment {
  id: string;
  userId: string;
  entityId: string;
  entityType: 'movie' | 'music' | 'short';
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  replies?: Comment[];
}

export interface CommentsResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RepliesResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const commentService = {
  /**
   * Create a comment
   */
  async createComment(entityId: string, entityType: string, content: string, rating?: number) {
    const res = await API.post('/', {
      entityId,
      entityType,
      content,
      rating,
    });
    return res.data.data as Comment;
  },

  /**
   * Get comments for entity
   */
  async getEntityComments(entityId: string, entityType: string, page: number = 1, limit: number = 20) {
    const res = await API.get(`/${entityId}/${entityType}`, {
      params: { page, limit },
    });
    return res.data.data as CommentsResponse;
  },

  /**
   * Get replies for comment
   */
  async getCommentReplies(commentId: string, page: number = 1, limit: number = 10) {
    const res = await API.get(`/${commentId}/replies`, {
      params: { page, limit },
    });
    return res.data.data as RepliesResponse;
  },

  /**
   * Reply to comment
   */
  async replyToComment(commentId: string, content: string) {
    const res = await API.post(`/${commentId}/reply`, { content });
    return res.data.data as Comment;
  },

  /**
   * Update comment
   */
  async updateComment(commentId: string, content: string) {
    const res = await API.put(`/${commentId}`, { content });
    return res.data.data as Comment;
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId: string) {
    const res = await API.delete(`/${commentId}`);
    return res.data;
  },

  /**
   * Like comment
   */
  async likeComment(commentId: string) {
    const res = await API.post(`/${commentId}/like`);
    return res.data.data;
  },

  /**
   * Unlike comment
   */
  async unlikeComment(commentId: string) {
    const res = await API.delete(`/${commentId}/like`);
    return res.data;
  },

  /**
   * Get comment likes count
   */
  async getCommentLikesCount(commentId: string) {
    const res = await API.get(`/${commentId}/likes`);
    return res.data.data.count as number;
  },

  /**
   * Get user's comments
   */
  async getUserComments(page: number = 1, limit: number = 20) {
    const res = await API.get('/user/my-comments', {
      params: { page, limit },
    });
    return res.data.data as CommentsResponse;
  },
};
