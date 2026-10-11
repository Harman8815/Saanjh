import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AuthService from '../services/auth';
import { User } from '../types/api';

interface AuthState {
  // Auth state
  user: User | null;
  // Tokens live in HttpOnly cookies set by the server and are never held here.
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

        // Rotate the access cookie; a failure ends the session.
        refreshToken: async () => {
          const rotated = await AuthService.refreshToken();
          if (!rotated) {
            get().logout();
            return;
          }
        },

        // Restore the session from local storage.
        //
        // Tokens are HttpOnly, so only the cached user profile is available
        // here. If the cookies have expired the next API call fails and the
        // API client redirects to login.
        initializeAuth: () => {
          const storedUser = AuthService.initializeAuth();
          if (storedUser) {
            set({
              user: storedUser,
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
        // Only the cached profile is persisted; tokens stay in cookies.
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
