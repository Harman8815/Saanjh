import { apiClient } from './api';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  ApiResponse 
} from '../types/api';

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', credentials.username);
      const response = await apiClient.post<AuthResponse>('auth/login/', credentials);
      console.log('Login response:', response);
      
      // Store token and user data
      if (response.token) {
        apiClient.setAuthToken(response.token);
        this.storeUser(response.user);
      }
      
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
      
      // Store token and user data
      if (response.token) {
        apiClient.setAuthToken(response.token);
        this.storeUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await apiClient.post('auth/logout/');
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
      return await apiClient.get('auth/settings-detail/');
    } catch (error) {
      console.error('Get user settings error:', error);
      throw error;
    }
  }

  // Update user settings
  static async updateUserSettings(settings: any): Promise<any> {
    try {
      return await apiClient.post('auth/settings-detail/', settings);
    } catch (error) {
      console.error('Update user settings error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
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

  // Clear stored user data
  static clearStoredUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
    }
  }

  // Initialize auth state from localStorage
  static initializeAuth(): User | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const user = this.getStoredUser();
      
      if (token && user) {
        apiClient.setAuthToken(token);
        return user;
      }
    }
    return null;
  }
}

export default AuthService;
