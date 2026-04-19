'use client';

import { useEffect } from 'react';
import { useLocalizationStore } from '../../store/localizationStore';

interface LocalizationProviderProps {
  children: React.ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const { currentLanguage, setLanguage } = useLocalizationStore();

  useEffect(() => {
    // Only apply DOM changes after hydration is complete
    const applyLocalization = () => {
      const language = useLocalizationStore.getState();
      if (language.currentLanguage !== 'en') {
        setLanguage(language.currentLanguage);
      }
    };

    // Apply after a short delay to ensure hydration is complete
    const timer = setTimeout(applyLocalization, 100);
    return () => clearTimeout(timer);
  }, [setLanguage]);

  return <>{children}</>;
}
