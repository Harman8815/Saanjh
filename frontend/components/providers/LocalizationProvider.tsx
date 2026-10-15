'use client';

import { useEffect } from 'react';
import { useLocalizationStore } from '../../store/localizationStore';

interface LocalizationProviderProps {
  children: React.ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const { currentLanguage, setLanguage } = useLocalizationStore();

  useEffect(() => {
    // Apply localization only after hydration is complete
    const applyLocalization = () => {
      const state = useLocalizationStore.getState();
      const language = state.currentLanguage;
      
      // Update document lang attribute only on client side
      if (typeof window !== 'undefined') {
        const htmlElement = document.documentElement;
        
        // Only update if different to prevent unnecessary DOM changes
        if (htmlElement.lang !== language) {
          htmlElement.lang = language;
        }
        
        // Update text direction if needed
        const isRTL = language === 'hi'; // Hindi is not RTL, but example for future languages
        if (htmlElement.dir !== (isRTL ? 'rtl' : 'ltr')) {
          htmlElement.dir = isRTL ? 'rtl' : 'ltr';
        }
      }
    };

    // Apply after a short delay to ensure hydration is complete
    const timer = setTimeout(applyLocalization, 100);
    return () => clearTimeout(timer);
  }, [currentLanguage]);

  return <>{children}</>;
}
