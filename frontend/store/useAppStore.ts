import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // UI State
  isLoading: boolean;
  sidebarOpen: boolean;
  currentTheme: 'dark' | 'light';
  
  // User State
  user: {
    id?: string;
    name?: string;
    email?: string;
    isSubscribed?: boolean;
    subscriptionTier?: 'starter' | 'romantic' | 'ultimate';
  } | null;
  
  // Wedding State
  wedding: {
    coupleName?: string;
    weddingDate?: string;
    venue?: string;
    budget?: number;
    guestCount?: number;
  } | null;
  
  // Navigation State
  currentPage: string;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentTheme: (theme: 'dark' | 'light') => void;
  setUser: (user: AppState['user']) => void;
  setWedding: (wedding: AppState['wedding']) => void;
  setCurrentPage: (page: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        isLoading: false,
        sidebarOpen: false,
        currentTheme: 'dark',
        user: null,
        wedding: null,
        currentPage: 'home',
        
        // Actions
        setLoading: (loading) => set({ isLoading: loading }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setCurrentTheme: (theme) => set({ currentTheme: theme }),
        setUser: (user) => set({ user }),
        setWedding: (wedding) => set({ wedding }),
        setCurrentPage: (page) => set({ currentPage: page }),
        reset: () => set({
          isLoading: false,
          sidebarOpen: false,
          currentTheme: 'dark',
          user: null,
          wedding: null,
          currentPage: 'home',
        }),
      }),
      {
        name: 'wedding-app-storage',
        partialize: (state) => ({
          user: state.user,
          wedding: state.wedding,
          currentTheme: state.currentTheme,
        }),
      }
    )
  )
);

// Selectors
export const useUser = () => useAppStore((state) => state.user);
export const useWedding = () => useAppStore((state) => state.wedding);
export const useLoading = () => useAppStore((state) => state.isLoading);
export const useTheme = () => useAppStore((state) => state.currentTheme);
export const useCurrentPage = () => useAppStore((state) => state.currentPage);
