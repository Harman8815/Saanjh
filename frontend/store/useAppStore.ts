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
    brideName?: string;
    groomName?: string;
    weddingDate?: string;
    venue?: string;
    message?: string;
    selectedTemplate?: string;
    budget?: number;
    guestCount?: number;
    eventSections?: Array<{
      id: string;
      title: string;
      date?: string;
      time?: string;
      venue?: string;
      description?: string;
      type: 'ceremony' | 'reception' | 'cocktail' | 'dinner' | 'party' | 'other';
      order: number;
    }>;
    customColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    fontFamily?: string;
  } | null;
  
  // First-time Modal State
  isFirstTimeUser: boolean;
  showFirstTimeModal: boolean;
  
  // Navigation State
  currentPage: string;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentTheme: (theme: 'dark' | 'light') => void;
  setUser: (user: AppState['user']) => void;
  setWedding: (wedding: AppState['wedding']) => void;
  setCurrentPage: (page: string) => void;
  setShowFirstTimeModal: (show: boolean) => void;
  setFirstTimeUser: (isFirstTime: boolean) => void;
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
        isFirstTimeUser: true,
        showFirstTimeModal: false,
        currentPage: 'home',
        
        // Actions
        setLoading: (loading) => set({ isLoading: loading }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setCurrentTheme: (theme) => set({ currentTheme: theme }),
        setUser: (user) => set({ user }),
        setWedding: (wedding) => set({ wedding }),
        setCurrentPage: (page) => set({ currentPage: page }),
        setShowFirstTimeModal: (show) => set({ showFirstTimeModal: show }),
        setFirstTimeUser: (isFirstTime) => set({ isFirstTimeUser: isFirstTime }),
        reset: () => set({
          isLoading: false,
          sidebarOpen: false,
          currentTheme: 'dark',
          user: null,
          wedding: null,
          isFirstTimeUser: true,
          showFirstTimeModal: false,
          currentPage: 'home',
        }),
      }),
      {
        name: 'wedding-app-storage',
        partialize: (state) => ({
          user: state.user,
          wedding: state.wedding,
          currentTheme: state.currentTheme,
          isFirstTimeUser: state.isFirstTimeUser,
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
export const useFirstTimeUser = () => useAppStore((state) => state.isFirstTimeUser);
export const useShowFirstTimeModal = () => useAppStore((state) => state.showFirstTimeModal);
