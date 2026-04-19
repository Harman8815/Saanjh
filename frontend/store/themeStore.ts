import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  preview: {
    bg: string;
    card: string;
    primary: string;
    accent: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'system',
    name: 'System Default',
    description: 'Follows your system preference (light/dark)',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      accent: '#0ea5e9'
    },
    preview: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      card: 'bg-white/90',
      primary: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      accent: 'bg-sky-400'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Elegant dark theme with subtle accents',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      accent: '#f59e0b'
    },
    preview: {
      bg: 'bg-gray-900',
      card: 'bg-gray-800',
      primary: 'bg-indigo-500',
      accent: 'bg-amber-500'
    }
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white minimal design',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      accent: '#0ea5e9'
    },
    preview: {
      bg: 'bg-white',
      card: 'bg-gray-50',
      primary: 'bg-blue-500',
      accent: 'bg-sky-500'
    }
  },
  {
    id: 'blue-gradient',
    name: 'Blue Gradient',
    description: 'Premium modern blue gradient theme',
    colors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      accent: '#0284c7'
    },
    preview: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      card: 'bg-white/80',
      primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
      accent: 'bg-blue-400'
    }
  },
  {
    id: 'ivory-gold',
    name: 'Ivory & Gold',
    description: 'Luxurious wedding premium theme',
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      background: '#fefce8',
      surface: '#fef3c7',
      text: '#78350f',
      accent: '#fbbf24'
    },
    preview: {
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      card: 'bg-white/90',
      primary: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      accent: 'bg-yellow-400'
    }
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description: 'Gentle pink and peach wedding feel',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      background: '#fdf2f8',
      surface: '#fce7f3',
      text: '#831843',
      accent: '#f9a8d4'
    },
    preview: {
      bg: 'bg-gradient-to-br from-pink-50 to-orange-50',
      card: 'bg-white/90',
      primary: 'bg-gradient-to-r from-pink-400 to-pink-500',
      accent: 'bg-orange-300'
    }
  }
];

interface ThemeState {
  currentTheme: string;
  animationsEnabled: boolean;
  setTheme: (themeId: string) => void;
  toggleAnimations: () => void;
  setAnimations: (enabled: boolean) => void;
  getThemeColors: () => Theme['colors'];
  resetToDefaults: () => void;
}

const defaultTheme = 'system';
const defaultAnimations = true;

// Function to detect system theme preference
const getSystemTheme = (): string => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: defaultTheme,
      animationsEnabled: defaultAnimations,

      setTheme: (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
          set({ currentTheme: themeId });
          // If system default, apply the actual system theme
          if (themeId === 'system') {
            const systemThemeId = getSystemTheme();
            const systemTheme = themes.find(t => t.id === systemThemeId);
            if (systemTheme) {
              applyThemeToDOM(systemTheme.colors);
            }
          } else {
            applyThemeToDOM(theme.colors);
          }
        }
      },

      toggleAnimations: () => {
        const newState = !get().animationsEnabled;
        set({ animationsEnabled: newState });
        applyAnimationsToDOM(newState);
      },

      setAnimations: (enabled: boolean) => {
        set({ animationsEnabled: enabled });
        applyAnimationsToDOM(enabled);
      },

      getThemeColors: () => {
        const currentThemeId = get().currentTheme;
        // If system default, get the actual system theme colors
        const actualThemeId = currentThemeId === 'system' ? getSystemTheme() : currentThemeId;
        const theme = themes.find(t => t.id === actualThemeId);
        return theme?.colors || themes[0].colors;
      },

      resetToDefaults: () => {
        set({ currentTheme: defaultTheme, animationsEnabled: defaultAnimations });
        // Apply system theme if default is system
        if (defaultTheme === 'system') {
          const systemThemeId = getSystemTheme();
          const systemTheme = themes.find(t => t.id === systemThemeId);
          if (systemTheme) {
            applyThemeToDOM(systemTheme.colors);
          }
        } else {
          const defaultThemeColors = themes.find(t => t.id === defaultTheme)?.colors || themes[0].colors;
          applyThemeToDOM(defaultThemeColors);
        }
        applyAnimationsToDOM(defaultAnimations);
      },
    }),
    {
      name: 'theme-settings',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // If system default, apply the actual system theme
          if (state.currentTheme === 'system') {
            const systemThemeId = getSystemTheme();
            const systemTheme = themes.find(t => t.id === systemThemeId);
            if (systemTheme) {
              applyThemeToDOM(systemTheme.colors);
            }
          } else {
            const theme = themes.find(t => t.id === state.currentTheme);
            if (theme) {
              applyThemeToDOM(theme.colors);
            }
          }
          applyAnimationsToDOM(state.animationsEnabled);
        }
      },
    }
  )
);

// Helper functions to apply theme to DOM
function applyThemeToDOM(colors: Theme['colors']) {
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-accent', colors.accent);
  
  // Apply data attributes for Tailwind classes
  root.setAttribute('data-theme', themes.find(t => t.colors === colors)?.id || 'light');
  
  // Update body background for immediate visual feedback
  document.body.style.backgroundColor = colors.background;
  document.body.style.color = colors.text;
}

function applyAnimationsToDOM(enabled: boolean) {
  const root = document.documentElement;
  
  if (enabled) {
    root.removeAttribute('data-animations-disabled');
    document.body.classList.remove('animations-disabled');
  } else {
    root.setAttribute('data-animations-disabled', 'true');
    document.body.classList.add('animations-disabled');
  }
}

// Initialize theme on app start
export const initializeTheme = () => {
  const state = useThemeStore.getState();
  const theme = themes.find(t => t.id === state.currentTheme);
  if (theme) {
    applyThemeToDOM(theme.colors);
  }
  applyAnimationsToDOM(state.animationsEnabled);
};
