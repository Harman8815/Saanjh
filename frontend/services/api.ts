import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const CSRF_COOKIE_NAME = 'csrftoken';

class ApiClient {
  private client: AxiosInstance;

  // Access tokens are short-lived (15 min); schedule refreshes a bit early.
  private refreshIntervalMs = 13 * 60 * 1000;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      // Tokens live in HttpOnly cookies set by the server. They are attached
      // automatically by the browser and cannot be read by scripts.
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API Client initialized with baseURL:', API_BASE_URL);

    this.client.interceptors.request.use(
      (config) => {
        // Unsafe requests must present the CSRF header matching our cookie.
        const method = (config.method || 'get').toLowerCase();
        if (!['get', 'head', 'options'].includes(method)) {
          const csrfToken = this.getCsrfToken();
          if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
          }
        }

        // Add cache-busting parameter to GET and PATCH requests
        if (method === 'get' || method === 'patch') {
          config.params = {
            ...config.params,
            _t: Date.now()
          };
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isRefreshRequest = originalRequest?.url?.includes('auth/refresh');

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
          originalRequest._retry = true;

          // A stale/expired access cookie can be rotated transparently, as the
          // refresh cookie travels sent automatically with the request.
          try {
            await this.client.post('auth/refresh/', {});
            return this.client(originalRequest);
          } catch {
            this.handleSessionExpired();
          }
        }

        if (error.response?.status === 401) {
          this.handleSessionExpired();
        }
        return Promise.reject(error);
      }
    );

    // Refresh the access cookie proactively before it expires.
    if (typeof window !== 'undefined') {
      setInterval(() => {
        // The tokens are HttpOnly, so a cached profile is the only hint that a
        // session may exist. Skip the call entirely for anonymous visitors.
        if (!localStorage.getItem('user_data')) {
          return;
        }
        void this.client.post('auth/refresh/', {}).catch(() => {
          // The 401 interceptor handles the session-redirect on real expiry.
        });
      }, this.refreshIntervalMs);
    }
  }

  private handleSessionExpired(): void {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /** Read the CSRF cookie (it is intentionally not HttpOnly). */
  private getCsrfToken(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }
    const match = document.cookie.match(
      new RegExp('(^|;\\s*)' + CSRF_COOKIE_NAME + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[2]) : null;
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
