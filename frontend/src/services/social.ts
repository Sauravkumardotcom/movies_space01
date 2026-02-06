import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/social`,
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
    console.error('Social API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface List {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  user: User;
  items: Array<{ id: string; entityId: string; entityType: string }>;
}

export interface ListItem {
  id: string;
  listId: string;
  entityId: string;
  entityType: string;
}

export interface ListResponse {
  list: List;
  items: ListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListsResponse {
  data: List[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FollowerStats {
  followers: number;
  following: number;
}

export const socialService = {
  /**
   * Follow a user
   */
  async followUser(userId: string) {
    const res = await API.post(`/follow/${userId}`);
    return res.data.data;
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string) {
    const res = await API.delete(`/follow/${userId}`);
    return res.data;
  },

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const res = await API.get(`/followers/${userId}`, {
      params: { page, limit },
    });
    return res.data.data as UsersResponse;
  },

  /**
   * Get user's following
   */
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const res = await API.get(`/following/${userId}`, {
      params: { page, limit },
    });
    return res.data.data as UsersResponse;
  },

  /**
   * Check if following user
   */
  async isFollowing(userId: string) {
    const res = await API.get(`/is-following/${userId}`);
    return res.data.data.isFollowing as boolean;
  },

  /**
   * Get follower stats
   */
  async getFollowerStats(userId: string) {
    const res = await API.get(`/stats/${userId}`);
    return res.data.data as FollowerStats;
  },

  /**
   * Create a list
   */
  async createList(name: string, description?: string, isPublic: boolean = true) {
    const res = await API.post('/lists', {
      name,
      description,
      isPublic,
    });
    return res.data.data as List;
  },

  /**
   * Get list with items
   */
  async getList(listId: string, page: number = 1, limit: number = 20) {
    const res = await API.get(`/lists/${listId}`, {
      params: { page, limit },
    });
    return res.data.data as ListResponse;
  },

  /**
   * Get user's lists
   */
  async getUserLists(userId: string, page: number = 1, limit: number = 20) {
    const res = await API.get(`/user-lists/${userId}`, {
      params: { page, limit },
    });
    return res.data.data as ListsResponse;
  },

  /**
   * Update list
   */
  async updateList(listId: string, name?: string, description?: string, isPublic?: boolean) {
    const res = await API.put(`/lists/${listId}`, {
      name,
      description,
      isPublic,
    });
    return res.data.data as List;
  },

  /**
   * Delete list
   */
  async deleteList(listId: string) {
    const res = await API.delete(`/lists/${listId}`);
    return res.data;
  },

  /**
   * Add item to list
   */
  async addItemToList(listId: string, entityId: string, entityType: string) {
    const res = await API.post(`/lists/${listId}/items`, {
      entityId,
      entityType,
    });
    return res.data.data as ListItem;
  },

  /**
   * Remove item from list
   */
  async removeItemFromList(listId: string, entityId: string, entityType: string) {
    const res = await API.delete(`/lists/${listId}/items/${entityId}/${entityType}`);
    return res.data;
  },
};
