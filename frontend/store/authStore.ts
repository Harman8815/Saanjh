import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AuthService from '../services/auth';
import { User } from '../types/api';

interface AuthState {
  // Auth state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  refreshToken: () => Promise<void>;
  initializeAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login action
        login: async (username: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await AuthService.login({ username, password });
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 
                              error.response?.data?.non_field_errors?.[0] || 
                              'Login failed';
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        // Register action
        register: async (userData: any) => {
          set({ isLoading: true, error: null });
          try {
            const response = await AuthService.register(userData);
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 
                              error.response?.data?.non_field_errors?.[0] || 
                              'Registration failed';
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        // Logout action
        logout: async () => {
          set({ isLoading: true });
          try {
            await AuthService.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Set loading state
        setLoading: (loading: boolean) => set({ isLoading: loading }),

        // Refresh token (placeholder for future implementation)
        refreshToken: async () => {
          // For now, just check if we're still authenticated
          const { user, token } = get();
          if (user && token) {
            try {
              // Could implement token refresh logic here
              // For now, just validate current session
              const currentUser = await AuthService.getProfile();
              set({ user: currentUser });
            } catch (error) {
              // Token invalid, logout
              get().logout();
            }
          }
        },

        // Initialize auth from localStorage
        initializeAuth: () => {
          const storedUser = AuthService.initializeAuth();
          if (storedUser) {
            set({
              user: storedUser,
              token: localStorage.getItem('auth_token'),
              isAuthenticated: true,
              error: null,
            });
          }
        },

        // Update user data
        updateUser: (user: User) => set({ user }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Selectors
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export default useAuthStore;
