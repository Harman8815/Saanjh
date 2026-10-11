import { apiClient } from './api';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  ApiResponse 
} from '../types/api';

const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('auth/login/', credentials);
      
      // Store access + refresh tokens and user data
      this.storeAuth(response);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('auth/register/', userData);
      
      // Store access + refresh tokens and user data
      this.storeAuth(response);
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      // Pass the refresh token so the server can blacklist it.
      await apiClient.post('auth/logout/', refreshToken ? { refresh: refreshToken } : {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear stored data
      this.clearStoredUser();
    }
  }

  // Get user profile
  static async getProfile(): Promise<User> {
    try {
      const user = await apiClient.get<User>('auth/profile/');
      this.storeUser(user);
      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await apiClient.patch<User>('auth/profile/', userData);
      this.storeUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<any> {
    try {
      return await apiClient.get('auth/stats/');
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  // Get user settings
  static async getUserSettings(): Promise<any> {
    try {
      return await apiClient.get('auth/settings/');
    } catch (error) {
      console.error('Get user settings error:', error);
      throw error;
    }
  }

  // Update user settings
  static async updateUserSettings(settings: any): Promise<any> {
    try {
      return await apiClient.patch('auth/settings/', settings);
    } catch (error) {
      console.error('Update user settings error:', error);
      throw error;
    }
  }

  // Manually refresh the access token using the stored refresh token
  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }
      const response = await apiClient.post<{ access: string; refresh?: string; expires_in?: number }>(
        'auth/refresh/',
        { refresh: refreshToken }
      );
      if (response.access) {
        apiClient.setAuthToken(response.access);
      }
      return response.access ?? null;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  // Active sessions (devices) for the current user
  static async getSessions(): Promise<any[]> {
    try {
      return await apiClient.get<any[]>('auth/sessions/');
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  }

  // Revoke one session by id
  static async revokeSession(sessionId: string): Promise<void> {
    try {
      await apiClient.post(`auth/sessions/${sessionId}/revoke/`, {});
    } catch (error) {
      console.error('Revoke session error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const user = localStorage.getItem('user_data');
      return !!(token && user);
    }
    return false;
  }

  // Get stored user data
  static getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Store user data
  static storeUser(userData: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  }

  // Persist the token pair and user from an auth response
  private static storeAuth(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      if (response.access) {
        apiClient.setAuthToken(response.access, response.refresh);
      } else if (response.token) {
        // Fallback for servers that only return a single token.
        apiClient.setAuthToken(response.token);
      }
      this.storeUser(response.user);
    }
  }

  // Clear stored user data
  static clearStoredUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  // Get the stored refresh token
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  // Initialize auth state from localStorage
  static initializeAuth(): User | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const user = this.getStoredUser();
      
      if (token && user) {
        apiClient.setAuthToken(token, this.getRefreshToken() ?? undefined);
        return user;
      }
    }
    return null;
  }
}

export default AuthService;
