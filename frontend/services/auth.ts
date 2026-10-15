import { apiClient } from './api';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  ApiResponse 
} from '../types/api';

const USER_DATA_KEY = 'user_data';

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // The server sets HttpOnly cookies holding the tokens; only user data
      // and expiry metadata come back in the response.
      const response = await apiClient.post<AuthResponse>('auth/login/', credentials);
      this.storeUser(response.user);
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
      this.storeUser(response.user);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      // The refresh token is read from the HttpOnly cookie server-side, so
      // nothing token-related is sent from here.
      await apiClient.post('auth/logout/', {});
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

  /**
   * Rotate the access cookie using the refresh cookie.
   *
   * Both are HttpOnly, so the browser sends them automatically and nothing is
   * read from or written to script-accessible storage.
   */
  static async refreshToken(): Promise<boolean> {
    try {
      await apiClient.post('auth/refresh/', {});
      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
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

  /**
   * Whether a session is likely to exist.
   *
   * The tokens themselves are HttpOnly and invisible to JavaScript, so
   * authentication is confirmed by the server on the first API call. This is
   * only used to avoid a redirect loop on the initial render.
   */
  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem(USER_DATA_KEY);
    }
    return false;
  }

  // Get stored user data
  static getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Store user data
  static storeUser(userData: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  }

  // Clear stored user data (tokens live in HttpOnly cookies and are dropped by
  // the server on logout).
  static clearStoredUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_DATA_KEY);
    }
  }

  // Initialize auth state from storage
  static initializeAuth(): User | null {
    return this.getStoredUser();
  }
}

export default AuthService;
