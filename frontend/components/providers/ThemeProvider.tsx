'use client';

import { useEffect } from 'react';
import { initializeTheme } from '../../store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Only apply theme changes after hydration is complete
    const timer = setTimeout(() => {
      initializeTheme();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
