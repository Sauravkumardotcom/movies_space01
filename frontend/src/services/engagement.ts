import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/engagement`,
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
    console.error('Engagement API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// ============================================
// Types
// ============================================

export interface Rating {
  id: string;
  userId: string;
  entityId: string;
  entityType: 'movie' | 'music' | 'short';
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingsAggregation {
  count: number;
  average: number;
  distribution: {
    [key in 1 | 2 | 3 | 4 | 5]: number;
  };
}

export interface Favorite {
  id: string;
  userId: string;
  entityId: string;
  entityType: 'movie' | 'music' | 'short';
  createdAt: string;
}

export interface FavoritesResponse {
  data: Favorite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Watchlist {
  id: string;
  userId: string;
  movieId: string;
  createdAt: string;
}

export interface WatchlistResponse {
  data: Watchlist[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface History {
  id: string;
  userId: string;
  entityId: string;
  entityType: 'movie' | 'music' | 'short';
  progress: number;
  duration: number;
  watchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  data: History[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WatchProgress {
  progress: number;
  duration: number;
  percentage: number;
  lastWatched: string;
}

export interface EngagementStats {
  favoritesCount: number;
  ratingsCount: number;
  watchlistCount: number;
  historyEntries: number;
  totalMinutesWatched: number;
}

// ============================================
// Rating Service Methods
// ============================================

export const engagementService = {
  // RATINGS
  
  /**
   * Create or update a rating
   */
  async createRating(entityId: string, entityType: string, rating: number, comment?: string) {
    const res = await API.post('/ratings', {
      entityId,
      entityType,
      rating,
      comment,
    });
    return res.data.data as Rating;
  },

  /**
   * Get user's rating for an entity
   */
  async getUserRating(entityId: string, entityType: string) {
    const res = await API.get(`/ratings/${entityId}/${entityType}`);
    return res.data.data as Rating | null;
  },

  /**
   * Delete a rating
   */
  async deleteRating(entityId: string, entityType: string) {
    const res = await API.delete(`/ratings/${entityId}/${entityType}`);
    return res.data;
  },

  /**
   * Get ratings summary for entity (average, count, distribution)
   */
  async getRatingsSummary(entityId: string, entityType: string) {
    const res = await API.get(`/ratings/${entityId}/${entityType}/summary`);
    return res.data.data as RatingsAggregation;
  },

  // FAVORITES

  /**
   * Add to favorites
   */
  async addToFavorites(entityId: string, entityType: string) {
    const res = await API.post('/favorites', {
      entityId,
      entityType,
    });
    return res.data.data as Favorite;
  },

  /**
   * Get user's favorites
   */
  async getUserFavorites(entityType?: string, page: number = 1, limit: number = 20) {
    const res = await API.get('/favorites', {
      params: {
        entityType: entityType || undefined,
        page,
        limit,
      },
    });
    return res.data.data as FavoritesResponse;
  },

  /**
   * Remove from favorites
   */
  async removeFromFavorites(entityId: string, entityType: string) {
    const res = await API.delete(`/favorites/${entityId}/${entityType}`);
    return res.data;
  },

  /**
   * Check if favorited
   */
  async isFavorited(entityId: string, entityType: string) {
    const res = await API.get(`/favorites/${entityId}/${entityType}/check`);
    return res.data.data.isFavorited as boolean;
  },

  // WATCHLIST

  /**
   * Add to watchlist
   */
  async addToWatchlist(movieId: string) {
    const res = await API.post('/watchlist', {
      movieId,
    });
    return res.data.data as Watchlist;
  },

  /**
   * Get user's watchlist
   */
  async getUserWatchlist(page: number = 1, limit: number = 20) {
    const res = await API.get('/watchlist', {
      params: { page, limit },
    });
    return res.data.data as WatchlistResponse;
  },

  /**
   * Remove from watchlist
   */
  async removeFromWatchlist(movieId: string) {
    const res = await API.delete(`/watchlist/${movieId}`);
    return res.data;
  },

  /**
   * Check if in watchlist
   */
  async isInWatchlist(movieId: string) {
    const res = await API.get(`/watchlist/${movieId}/check`);
    return res.data.data.isInWatchlist as boolean;
  },

  // HISTORY

  /**
   * Update watch history (create or update progress)
   */
  async updateHistory(entityId: string, entityType: string, progress: number, duration: number) {
    const res = await API.post('/history', {
      entityId,
      entityType,
      progress,
      duration,
    });
    return res.data.data as History;
  },

  /**
   * Get user's watch history
   */
  async getUserHistory(entityType?: string, page: number = 1, limit: number = 20) {
    const res = await API.get('/history', {
      params: {
        entityType: entityType || undefined,
        page,
        limit,
      },
    });
    return res.data.data as HistoryResponse;
  },

  /**
   * Get watch progress for specific entity
   */
  async getWatchProgress(entityId: string, entityType: string) {
    const res = await API.get(`/history/${entityId}/${entityType}`);
    return res.data.data as WatchProgress | null;
  },

  // STATS

  /**
   * Get user engagement statistics
   */
  async getEngagementStats() {
    const res = await API.get('/stats');
    return res.data.data as EngagementStats;
  },
};
