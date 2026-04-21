import { useCallback } from 'react';
import { useThemeStore, themes, type Theme } from '../store/themeStore';

/**
 * Hook for managing theme selection and application
 * Provides access to current theme, theme list, and theme manipulation functions
 */
export function useTheme() {
  const {
    currentTheme,
    setTheme,
    getThemeColors,
  } = useThemeStore();

  // Get current theme object
  const currentThemeObject = useCallback(() => {
    return themes.find(theme => theme.id === currentTheme) || themes[0];
  }, [currentTheme]);

  // Get all available themes
  const availableThemes = themes;

  // Check if a specific theme is active
  const isThemeActive = useCallback((themeId: string) => {
    return currentTheme === themeId;
  }, [currentTheme]);

  // Get theme color by name
  const getThemeColor = useCallback((colorName: keyof Theme['colors']) => {
    const colors = getThemeColors();
    return colors[colorName];
  }, [getThemeColors]);

  // Apply theme with optional callback
  const applyTheme = useCallback((themeId: string, callback?: () => void) => {
    setTheme(themeId);
    callback?.();
  }, [setTheme]);

  return {
    // Current state
    currentTheme,
    currentThemeObject: currentThemeObject(),
    currentThemeColors: getThemeColors(),
    
    // Available options
    themes: availableThemes,
    
    // Actions
    setTheme: applyTheme,
    
    // Utilities
    isThemeActive,
    getThemeColor,
    getThemeColors,
  };
}

/**
 * Hook for managing animation settings
 * Provides access to animation state and toggle functions
 */
export function useAnimation() {
  const {
    animationsEnabled,
    toggleAnimations,
    setAnimations,
  } = useThemeStore();

  // Toggle animations with optional callback
  const toggle = useCallback((callback?: (enabled: boolean) => void) => {
    const newState = !animationsEnabled;
    toggleAnimations();
    callback?.(newState);
  }, [animationsEnabled, toggleAnimations]);

  // Set animations with optional callback
  const set = useCallback((enabled: boolean, callback?: (enabled: boolean) => void) => {
    setAnimations(enabled);
    callback?.(enabled);
  }, [setAnimations]);

  return {
    // Current state
    animationsEnabled,
    
    // Actions
    toggleAnimations: toggle,
    setAnimations: set,
    
    // Utilities
    isAnimationEnabled: animationsEnabled,
  };
}

/**
 * Combined hook for both theme and animation management
 * Convenient for components that need both
 */
export function useThemeSystem() {
  const theme = useTheme();
  const animation = useAnimation();

  return {
    ...theme,
    ...animation,
    
    // Combined utilities
    resetToDefaults: () => {
      useThemeStore.getState().resetToDefaults();
    },
    
    // Export current settings
    exportSettings: () => ({
      theme: theme.currentTheme,
      animations: animation.animationsEnabled,
    }),
    
    // Import settings
    importSettings: (settings: { theme?: string; animations?: boolean }) => {
      if (settings.theme) {
        theme.setTheme(settings.theme);
      }
      if (typeof settings.animations === 'boolean') {
        animation.setAnimations(settings.animations);
      }
    },
  };
}
