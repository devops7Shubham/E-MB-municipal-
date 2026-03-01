import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiError } from '@/types';

const BASE_URL = 'http://127.0.0.1:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject({
      message,
      status: error.response?.status,
    });
  }
);

export default apiClient;