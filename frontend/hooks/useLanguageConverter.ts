import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '../lib/i18n';

// Available languages configuration
export const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    rtl: false,
  },
  // Can easily add more languages
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
  },
];

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

/**
 * Hook for language conversion and management using i18next
 */
export function useLanguageConverter() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isChanging, setIsChanging] = useState(false);

  // Change language with loading state
  const changeLanguage = async (languageCode: string) => {
    if (languageCode === currentLanguage) return;
    
    setIsChanging(true);
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      
      // Update document attributes
      document.documentElement.lang = languageCode;
      const language = languages.find(lang => lang.code === languageCode);
      if (language?.rtl) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  // Get current language info
  const getCurrentLanguageInfo = (): Language => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  // Get available languages
  const getAvailableLanguages = (): Language[] => {
    return languages;
  };

  // Check if language is RTL
  const isRTL = (languageCode?: string): boolean => {
    const lang = languages.find(lang => lang.code === (languageCode || currentLanguage));
    return lang?.rtl || false;
  };

  // Format language name with flag
  const formatLanguageName = (languageCode: string): string => {
    const language = languages.find(lang => lang.code === languageCode);
    return language ? `${language.flag} ${language.nativeName}` : languageCode;
  };

  // Auto-detect user's preferred language
  const detectUserLanguage = (): string => {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang) {
      const langCode = browserLang.split('-')[0];
      const supportedLanguage = languages.find(lang => lang.code === langCode);
      if (supportedLanguage) {
        return supportedLanguage.code;
      }
    }
    return 'en'; // fallback
  };

  // Get translation with fallback
  const translateWithFallback = (key: string, fallback?: string): string => {
    const translation = t(key);
    return translation !== key ? translation : (fallback || key);
  };

  // Get pluralized translation
  const translatePlural = (key: string, count: number, fallback?: string): string => {
    return t(key, { count });
  };

  // Check if translation exists
  const hasTranslation = (key: string): boolean => {
    return t(key) !== key;
  };

  // Get language direction for CSS
  const getLanguageDirection = (languageCode?: string): 'ltr' | 'rtl' => {
    return isRTL(languageCode) ? 'rtl' : 'ltr';
  };

  // Sync language with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('i18nextLng');
      if (savedLanguage && savedLanguage !== currentLanguage) {
        changeLanguage(savedLanguage);
      }
    }
  }, [currentLanguage, changeLanguage]);

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = getLanguageDirection();
  }, [currentLanguage]);

  return {
    // Current state
    currentLanguage,
    currentLanguageInfo: getCurrentLanguageInfo(),
    isChanging,
    isRTL: isRTL(),
    
    // Actions
    changeLanguage,
    
    // Getters
    getAvailableLanguages,
    getCurrentLanguageInfo,
    formatLanguageName,
    detectUserLanguage,
    getLanguageDirection,
    
    // Translation functions
    t: translateWithFallback,
    translate: translateWithFallback,
    tPlural: translatePlural,
    hasTranslation,
    
    // Raw i18next instance for advanced usage
    i18n,
  };
}

/**
 * Utility function to get language info by code
 */
export function getLanguageByCode(code: string): Language | undefined {
  return languages.find(lang => lang.code === code);
}

/**
 * Utility function to format date according to current language
 */
export function formatDateForLanguage(date: Date, languageCode: string): string {
  const language = getLanguageByCode(languageCode);
  if (!language) return date.toLocaleDateString();
  
  try {
    return new Intl.DateTimeFormat(languageCode, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Utility function to format number according to current language
 */
export function formatNumberForLanguage(number: number, languageCode: string): string {
  try {
    return new Intl.NumberFormat(languageCode).format(number);
  } catch {
    return number.toString();
  }
}
