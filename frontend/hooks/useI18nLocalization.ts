import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizationStore, currencies, type Currency } from '../store/localizationStore';
import { languages as i18nLanguages, getLanguageByCode } from './useLanguageConverter';
import { useTimezoneConverter, timezones, type Timezone } from './useTimezoneConverter';
import i18n from '../lib/i18n';

/**
 * Enhanced localization hook using i18next library
 * Provides robust language conversion and translation functionality
 */
export function useI18nLocalization() {
  const { t, i18n } = useTranslation();
  const {
    currentCurrency,
    setCurrency,
    getCurrentCurrency,
    formatCurrency,
    formatDate,
    resetToDefaults,
  } = useLocalizationStore();

  // Timezone converter integration
  const {
    currentTimezone,
    getCurrentTimezoneInfo,
    formatDateWithTimezone,
    formatTimeWithTimezone,
    getRelativeTimeInTimezone,
    autoDetectAndSetTimezone,
    getAvailableTimezones,
    isValidTimezone,
  } = useTimezoneConverter();

  // Get current language from i18next
  const currentLanguage = i18n.language;

  // Change language using i18next
  const changeLanguage = useCallback(async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      // Update document attributes
      document.documentElement.lang = languageCode;
      // Force LTR direction
      document.documentElement.dir = 'ltr';
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, []);

  // Change currency
  const changeCurrency = useCallback((currencyCode: string, callback?: () => void) => {
    setCurrency(currencyCode);
    callback?.();
  }, [setCurrency]);

  // Get current language object
  const getCurrentLanguageObject = useCallback(() => {
    return getLanguageByCode(currentLanguage) || i18nLanguages[0];
  }, [currentLanguage]);

  // Get current currency object
  const getCurrentCurrencyObject = useCallback(() => {
    return getCurrentCurrency();
  }, [getCurrentCurrency]);

  // Get all available languages
  const availableLanguages = i18nLanguages;

  // Get all available currencies
  const availableCurrencies = currencies;

  // Check if a specific language is active
  const isLanguageActive = useCallback((languageCode: string) => {
    return currentLanguage === languageCode;
  }, [currentLanguage]);

  // Check if a specific currency is active
  const isCurrencyActive = useCallback((currencyCode: string) => {
    return currentCurrency === currencyCode;
  }, [currentCurrency]);

  // Enhanced translation function with fallback
  const translate = useCallback((key: string, options?: any) => {
    const translation = t(key, options);
    return translation;
  }, [t]);

  // Get translation with fallback
  const translateWithFallback = useCallback((key: string, fallback?: string) => {
    const translation = t(key);
    return translation !== key ? translation : (fallback || key);
  }, [t]);

  // Get pluralized translation
  const translatePlural = useCallback((key: string, count: number, options?: any) => {
    return t(key, { count, ...options });
  }, [t]);

  // Check if translation exists
  const hasTranslation = useCallback((key: string) => {
    return t(key) !== key;
  }, [t]);

  // Format date according to current language
  const formatDateForCurrentLanguage = useCallback((date: Date) => {
    try {
      return new Intl.DateTimeFormat(currentLanguage, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }, [currentLanguage]);

  // Format number according to current language
  const formatNumberForCurrentLanguage = useCallback((number: number) => {
    try {
      return new Intl.NumberFormat(currentLanguage).format(number);
    } catch {
      return number.toString();
    }
  }, [currentLanguage]);

  // Get language direction
  const getLanguageDirection = useCallback((languageCode?: string) => {
    const lang = getLanguageByCode(languageCode || currentLanguage);
    return lang?.rtl ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  // Auto-detect user's preferred language
  const detectUserLanguage = useCallback(() => {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang) {
      const langCode = browserLang.split('-')[0];
      const supportedLanguage = i18nLanguages.find(lang => lang.code === langCode);
      if (supportedLanguage) {
        return supportedLanguage.code;
      }
    }
    return 'en'; // fallback
  }, []);

  // Apply language with optional callback
  const applyLanguage = useCallback(async (languageCode: string, callback?: () => void) => {
    await changeLanguage(languageCode);
    callback?.();
  }, [changeLanguage]);

  // Apply currency with optional callback
  const applyCurrency = useCallback((currencyCode: string, callback?: () => void) => {
    changeCurrency(currencyCode, callback);
  }, [changeCurrency]);

  // Reset all localization to defaults
  const resetAllToDefaults = useCallback(() => {
    changeLanguage('en');
    changeCurrency('INR');
    resetToDefaults();
  }, [changeLanguage, changeCurrency, resetToDefaults]);

  // Sync document direction when language changes
  useEffect(() => {
    document.documentElement.dir = getLanguageDirection();
  }, [currentLanguage, getLanguageDirection]);

  return {
    // Current state
    currentLanguage,
    currentLanguageInfo: getCurrentLanguageObject(),
    currentCurrency,
    currentCurrencyInfo: getCurrentCurrencyObject(),
    
    // Actions
    changeLanguage,
    changeCurrency,
    applyLanguage,
    applyCurrency,
    resetAllToDefaults,
    
    // Getters
    availableLanguages,
    availableCurrencies,
    getCurrentLanguageObject,
    getCurrentCurrencyObject,
    isLanguageActive,
    isCurrencyActive,
    getLanguageDirection,
    detectUserLanguage,
    
    // Translation functions
    t: translate,
    translate: translateWithFallback,
    tPlural: translatePlural,
    hasTranslation,
    
    // Formatting functions
    formatCurrency,
    formatDate: formatDateForCurrentLanguage,
    formatNumber: formatNumberForCurrentLanguage,
    
    // Timezone functions
    currentTimezone,
    getCurrentTimezoneInfo,
    formatDateWithTimezone,
    formatTimeWithTimezone,
    getRelativeTimeInTimezone,
    autoDetectAndSetTimezone,
    getAvailableTimezones,
    isValidTimezone,
    
    // Raw instances
    i18n,
  };
}

/**
 * Hook for language-specific functionality
 */
export function useLanguage() {
  const { currentLanguage, currentLanguageInfo, changeLanguage, applyLanguage, availableLanguages, isLanguageActive, getLanguageDirection } = useI18nLocalization();
  
  return {
    currentLanguage,
    currentLanguageInfo,
    changeLanguage,
    applyLanguage,
    availableLanguages,
    isLanguageActive,
    getLanguageDirection,
  };
}

/**
 * Hook for currency-specific functionality
 */
export function useCurrency() {
  const { currentCurrency, currentCurrencyInfo, changeCurrency, applyCurrency, availableCurrencies, isCurrencyActive, formatCurrency } = useI18nLocalization();
  
  return {
    currentCurrency,
    currentCurrencyInfo,
    changeCurrency,
    applyCurrency,
    availableCurrencies,
    isCurrencyActive,
    formatCurrency,
  };
}

/**
 * Hook for complete localization system
 */
export function useLocalizationSystem() {
  return useI18nLocalization();
}
