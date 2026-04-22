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
    return apiClient.post<AuthResponse>('/auth/login/', credentials);
  }

  // Register new user
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register/', userData);
  }

  // Logout user
  static async logout(): Promise<void> {
    return apiClient.post('/auth/logout/');
  }

  // Get user profile
  static async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile/');
  }

  // Update user profile
  static async updateProfile(userData: Partial<User>): Promise<User> {
    return apiClient.patch<User>('/auth/profile/', userData);
  }

  // Get user statistics
  static async getUserStats(): Promise<any> {
    return apiClient.get('/auth/stats/');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
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
}

export default AuthService;
