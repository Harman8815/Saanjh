'use client';

import { useEffect } from 'react';
import { initializeTheme } from '../../store/themeStore';
import { initializeLocalization } from '../../store/localizationStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Initialize theme on app startup
    initializeTheme();
    // Initialize localization on app startup
    initializeLocalization();
  }, []);

  return <>{children}</>;
}
