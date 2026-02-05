import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '@types/api';

// API base URL with /api/v1 path included
// VITE_API_URL should be set to the full API path including /api/v1
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiResponse<unknown>>) => {
        // Handle 401 (token expired) - refresh logic would go here
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  async get<T>(url: string, params?: unknown): Promise<ApiResponse<T>> {
    return this.client.get(url, { params }) as Promise<ApiResponse<T>>;
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.client.post(url, data) as Promise<ApiResponse<T>>;
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.client.patch(url, data) as Promise<ApiResponse<T>>;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.client.delete(url) as Promise<ApiResponse<T>>;
  }
}

export const apiClient = new ApiClient();
