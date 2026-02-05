import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse } from '../types';

// ============================================
// TYPES
// ============================================

export interface Music {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  duration: number;
  coverUrl?: string;
  plays: number;
  likes: number;
  createdAt: string;
}

export interface MusicDetails extends Music {
  streamUrl: string;
  ratings: Array<{
    id: string;
    userId: string;
    score: number;
    comment?: string;
    createdAt: string;
  }>;
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  songs: Music[];
  _count?: { songs: number };
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistPreview {
  id: string;
  title: string;
  description?: string;
  songs: Array<Pick<Music, 'id' | 'title' | 'artist' | 'duration'>>;
  _count: { songs: number };
  createdAt: string;
  updatedAt: string;
}

export interface Upload {
  id: string;
  title: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  status: 'processing' | 'ready' | 'failed';
  streamUrl?: string;
  createdAt: string;
}

export interface UploadStats {
  total: number;
  processing: number;
  ready: number;
  failed: number;
  totalSize: number;
  totalSizeMB: number;
}

// ============================================
// MUSIC SERVICE
// ============================================

/**
 * Get paginated music with optional filters
 */
export const getMusic = async (
  artist?: string,
  genre?: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<Music>>> => {
  const params = new URLSearchParams();
  if (artist) params.append('artist', artist);
  if (genre) params.append('genre', genre);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  return apiClient.get(`/music?${params}`);
};

/**
 * Get single music with details
 */
export const getMusicById = async (id: string): Promise<ApiResponse<MusicDetails>> => {
  return apiClient.get(`/music/${id}`);
};

/**
 * Search music
 */
export const searchMusic = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<Music>>> => {
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  return apiClient.get(`/music/search?${params}`);
};

/**
 * Get trending music
 */
export const getTrendingMusic = async (
  limit: number = 10
): Promise<ApiResponse<{ data: Music[] }>> => {
  return apiClient.get(`/music/trending?limit=${limit}`);
};

/**
 * Get all artists
 */
export const getArtists = async (): Promise<ApiResponse<{ data: string[] }>> => {
  return apiClient.get('/music/artists');
};

/**
 * Get all genres
 */
export const getGenres = async (): Promise<ApiResponse<{ data: string[] }>> => {
  return apiClient.get('/music/genres');
};

// ============================================
// PLAYLIST SERVICE
// ============================================

/**
 * Get user's playlists
 */
export const getUserPlaylists = async (
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<PlaylistPreview>>> => {
  return apiClient.get(`/music/playlists?page=${page}&limit=${limit}`);
};

/**
 * Get playlist details with all songs
 */
export const getPlaylistById = async (id: string): Promise<ApiResponse<Playlist>> => {
  return apiClient.get(`/music/playlists/${id}`);
};

/**
 * Create new playlist
 */
export const createPlaylist = async (title: string, description?: string): Promise<ApiResponse<Playlist>> => {
  return apiClient.post('/music/playlists', {
    title,
    description,
  });
};

/**
 * Update playlist
 */
export const updatePlaylist = async (
  id: string,
  title?: string,
  description?: string
): Promise<ApiResponse<Playlist>> => {
  return apiClient.put(`/music/playlists/${id}`, {
    title,
    description,
  });
};

/**
 * Delete playlist
 */
export const deletePlaylist = async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiClient.delete(`/music/playlists/${id}`);
};

/**
 * Add song to playlist
 */
export const addSongToPlaylist = async (
  playlistId: string,
  musicId: string
): Promise<ApiResponse<{ success: boolean }>> => {
  return apiClient.post(`/music/playlists/${playlistId}/songs`, {
    musicId,
  });
};

/**
 * Remove song from playlist
 */
export const removeSongFromPlaylist = async (
  playlistId: string,
  musicId: string
): Promise<ApiResponse<{ success: boolean }>> => {
  return apiClient.delete(`/music/playlists/${playlistId}/songs/${musicId}`);
};

// ============================================
// UPLOAD SERVICE
// ============================================

/**
 * Create upload record
 */
export const createUpload = async (
  title: string,
  duration: number,
  fileSize: number,
  mimeType: string
): Promise<ApiResponse<Upload>> => {
  return apiClient.post('/music/uploads', {
    title,
    duration,
    fileSize,
    mimeType,
  });
};

/**
 * Get user's uploads
 */
export const getUserUploads = async (
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<Upload>>> => {
  return apiClient.get(`/music/uploads?page=${page}&limit=${limit}`);
};

/**
 * Get upload details
 */
export const getUploadById = async (id: string): Promise<ApiResponse<Upload>> => {
  return apiClient.get(`/music/uploads/${id}`);
};

/**
 * Update upload status
 */
export const updateUploadStatus = async (
  id: string,
  status: 'processing' | 'ready' | 'failed',
  streamUrl?: string
): Promise<ApiResponse<Upload>> => {
  return apiClient.put(`/music/uploads/${id}/status`, {
    status,
    streamUrl,
  });
};

/**
 * Delete upload
 */
export const deleteUpload = async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiClient.delete(`/music/uploads/${id}`);
};

/**
 * Get upload statistics
 */
export const getUploadStats = async (): Promise<ApiResponse<UploadStats>> => {
  return apiClient.get('/music/uploads/stats');
};
