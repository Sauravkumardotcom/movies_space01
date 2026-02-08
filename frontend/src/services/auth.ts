import { apiClient } from './api';
import type { ApiResponse } from '../types';

// ============================================
// TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  role?: 'user' | 'admin'; // Optional role for admin features
  createdAt: string;
}

export interface UserProfile extends User {
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
  };
}

export interface SignupInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ProfileUpdateInput {
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface PasswordChangeInput {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

// ============================================
// AUTH SERVICE
// ============================================

/**
 * Signup new user
 */
export const signup = async (input: SignupInput): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post('/auth/signup', input);

  if (response.status === 'success' && response.data?.accessToken) {
    // Store tokens and user
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Login user
 */
export const login = async (input: LoginInput): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post('/auth/login', input);

  if (response.status === 'success' && response.data?.accessToken) {
    // Store tokens and user
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Logout user
 */
export const logout = async (): Promise<ApiResponse<any>> => {
  // Clear local storage first (always succeeds even if API call fails)
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  try {
    const response = await apiClient.post('/auth/logout', {});
    return response;
  } catch (error) {
    // Even if logout API call fails, local storage is cleared
    return { status: 'success', message: 'Logged out' } as any;
  }
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Set current user in localStorage
 */
export const setCurrentUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getCurrentUser();
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> => {
  const response = await apiClient.post('/auth/refresh', {});

  if (response.status === 'success' && response.data?.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
  }

  return response;
};

// ============================================
// PROFILE OPERATIONS
// ============================================

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<ApiResponse<UserProfile>> => {
  return apiClient.get('/auth/me');
};

/**
 * Update user profile
 */
export const updateProfile = async (input: ProfileUpdateInput): Promise<ApiResponse<User>> => {
  const response = await apiClient.put('/auth/profile', input);

  if (response.status === 'success' && response.data) {
    setCurrentUser(response.data);
  }

  return response;
};

/**
 * Change user password
 */
export const changePassword = async (input: PasswordChangeInput): Promise<ApiResponse<any>> => {
  return apiClient.post('/auth/change-password', input);
};
