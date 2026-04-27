import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API Client initialized with baseURL:', API_BASE_URL);

    // Request interceptor for adding auth token and cache busting
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }

        // Add cache-busting parameter to GET and PATCH requests
        if (config.method === 'get' || config.method === 'patch') {
          config.params = {
            ...config.params,
            _t: Date.now()
          };
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.clearAuthToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      console.log('Auth token stored:', token);
    }
  }

  // HTTP methods
  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config).then(response => {
      // Unwrap APIResponse format if present
      const data = response.data;
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        return data.data as T;
      }
      return data as T;
    });
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config).then(response => {
      // Unwrap APIResponse format if present
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData && 'success' in responseData) {
        return responseData.data as T;
      }
      return responseData as T;
    });
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config).then(response => {
      // Unwrap APIResponse format if present
      const data = response.data;
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        return data.data as T;
      }
      return data as T;
    });
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config).then(response => {
      // Unwrap APIResponse format if present
      const data = response.data;
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        return data.data as T;
      }
      return data as T;
    });
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config).then(response => {
      // Unwrap APIResponse format if present
      const data = response.data;
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        return data.data as T;
      }
      return data as T;
    });
  }
}

export const apiClient = new ApiClient();
