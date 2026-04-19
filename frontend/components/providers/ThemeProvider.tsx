'use client';

import { useEffect } from 'react';
import { initializeTheme } from '../../store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Initialize theme on app startup
    initializeTheme();
  }, []);

  return <>{children}</>;
}
