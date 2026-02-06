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

    // Response interceptor to handle errors and logging
    this.client.interceptors.response.use(
      (response) => {
        // Log successful API calls in development
        if (import.meta.env.DEV) {
          console.log(
            `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
            response.status
          );
        }
        return response.data;
      },
      (error: AxiosError<ApiResponse<unknown>>) => {
        // Log API errors
        const status = error.response?.status;
        const url = error.config?.url;
        const method = error.config?.method?.toUpperCase();

        if (status === 404) {
          console.error(`❌ 404 Not Found: ${method} ${url}`);
        } else if (status === 500) {
          console.error(`❌ 500 Server Error: ${method} ${url}`, error.response?.data);
        } else if (status && status >= 400) {
          console.error(`⚠️ ${status} Error: ${method} ${url}`, error.response?.data);
        }

        // Handle 401 (token expired) - refresh logic would go here
        if (status === 401) {
          localStorage.removeItem('accessToken');
          // Optionally redirect to login
          // window.location.href = '/auth/login';
        }

        // Return error details but don't throw to prevent UI crashes
        const errorData = error.response?.data || {
          message: error.message || 'Network error',
          error: 'UNKNOWN_ERROR',
          statusCode: status || 0,
        };

        return Promise.reject(errorData);
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
