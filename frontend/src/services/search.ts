import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/search`,
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
    console.error('Search API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export interface SearchResult {
  id: string;
  title: string;
  type: 'movie' | 'music' | 'short';
  posterUrl?: string;
  coverUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  artist?: string;
}

export interface SearchResponse {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const searchService = {
  /**
   * Search content
   */
  async search(query: string, type?: string, page: number = 1, limit: number = 20) {
    const res = await API.get('/', {
      params: { q: query, type, page, limit },
    });
    return res.data.data as SearchResponse;
  },

  /**
   * Get trending movies
   */
  async getTrendingMovies(page: number = 1, limit: number = 20) {
    const res = await API.get('/trending/movies', {
      params: { page, limit },
    });
    return res.data.data as SearchResponse;
  },

  /**
   * Get trending music
   */
  async getTrendingMusic(page: number = 1, limit: number = 20) {
    const res = await API.get('/trending/music', {
      params: { page, limit },
    });
    return res.data.data as SearchResponse;
  },

  /**
   * Get recommendations
   */
  async getRecommendations(page: number = 1, limit: number = 20) {
    const res = await API.get('/recommendations', {
      params: { page, limit },
    });
    return res.data.data as SearchResponse;
  },
};
