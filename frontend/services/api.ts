import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: Array<(token: string | null) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API Client initialized with baseURL:', API_BASE_URL);

    // Request interceptor: attach the JWT access token as a Bearer credential.
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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

    // Response interceptor: refresh expired access tokens transparently.
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isAuthEndpoint = originalRequest?.url?.includes('auth/refresh');

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
          const refreshed = await this.handleUnauthorized(originalRequest);
          if (refreshed) {
            return refreshed;
          }
        }

        if (error.response?.status === 401) {
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Rotate the access token using the stored refresh token.
   *
   * Concurrent 401s are queued so only one refresh request is in flight; the
   * resulting token (or null on failure) is handed back to every waiter.
   */
  private async handleUnauthorized(originalRequest: AxiosRequestConfig): Promise<any> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push((token) => {
          if (!token) {
            reject(new Error('Session expired'));
            return;
          }
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          this.client(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    this.isRefreshing = true;
    try {
      const newToken = await this.refreshAccessToken();
      this.refreshQueue.forEach((resolve) => resolve(newToken));
      this.refreshQueue = [];

      if (!newToken) {
        this.clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Session expired'));
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return this.client(originalRequest);
    } catch (refreshError) {
      this.refreshQueue.forEach((resolve) => resolve(null));
      this.refreshQueue = [];
      this.clearAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      this.isRefreshing = false;
    }
  }

  /** Call the refresh endpoint and return the new access token, or null. */
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      // Bypass interceptors so a failed refresh cannot recurse into itself.
      const response = await this.client.post(
        'auth/refresh/',
        { refresh: refreshToken },
        { _retry: true } as AxiosRequestConfig
      );
      const data = response.data?.data ?? response.data;
      if (data?.access) {
        this.setAuthToken(data.access);
      }
      return data?.access ?? null;
    } catch {
      return null;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  /** Store an access token along with its optional refresh token. */
  public setAuthToken(token: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      console.log('Auth token stored');
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
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
