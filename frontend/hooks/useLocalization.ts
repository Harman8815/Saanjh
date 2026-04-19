import { useCallback } from 'react';
import { useLocalizationStore, currencies, type Language, type Currency } from '../store/localizationStore';
import { useLanguageConverter, languages as i18nLanguages } from './useLanguageConverter';
import i18n from '../lib/i18n';

/**
 * Hook for managing localization settings (language and currency)
 * Provides access to current language/currency and manipulation functions
 */
export function useLocalization() {
  const {
    currentLanguage,
    currentCurrency,
    setLanguage,
    setCurrency,
    getCurrentLanguage,
    getCurrentCurrency,
    formatCurrency,
    formatDate,
    resetToDefaults,
  } = useLocalizationStore();

  // Get current language object
  const currentLanguageObject = useCallback(() => {
    return getCurrentLanguage();
  }, [getCurrentLanguage]);

  // Get current currency object
  const currentCurrencyObject = useCallback(() => {
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

  // Apply language with optional callback using i18next
  const applyLanguage = useCallback(async (languageCode: string, callback?: () => void) => {
    try {
      await i18n.changeLanguage(languageCode);
      setLanguage(languageCode);
      callback?.();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [setLanguage]);

  // Apply currency with optional callback
  const applyCurrency = useCallback((currencyCode: string, callback?: () => void) => {
    setCurrency(currencyCode);
    callback?.();
  }, [setCurrency]);

  // Format currency with fallback
  const formatAmount = useCallback((amount: number) => {
    return formatCurrency(amount);
  }, [formatCurrency]);

  // Format date with fallback
  const formatLocalDate = useCallback((date: Date | string) => {
    return formatDate(date);
  }, [formatDate]);

  return {
    // Current state
    currentLanguage,
    currentCurrency,
    currentLanguageObject: currentLanguageObject(),
    currentCurrencyObject: currentCurrencyObject(),
    
    // Available options
    languages: availableLanguages,
    currencies: availableCurrencies,
    
    // Actions
    setLanguage: applyLanguage,
    setCurrency: applyCurrency,
    
    // Utilities
    isLanguageActive,
    isCurrencyActive,
    formatCurrency: formatAmount,
    formatDate: formatLocalDate,
    
    // Reset
    resetToDefaults,
  };
}

/**
 * Hook specifically for language management
 * Convenient for components that only need language functionality
 */
export function useLanguage() {
  const {
    currentLanguage,
    currentLanguageObject,
    languages,
    setLanguage,
    isLanguageActive,
  } = useLocalization();

  return {
    currentLanguage,
    currentLanguageObject,
    languages,
    setLanguage,
    isLanguageActive,
  };
}

/**
 * Hook specifically for currency management
 * Convenient for components that only need currency functionality
 */
export function useCurrency() {
  const {
    currentCurrency,
    currentCurrencyObject,
    currencies,
    setCurrency,
    isCurrencyActive,
    formatCurrency,
  } = useLocalization();

  return {
    currentCurrency,
    currentCurrencyObject,
    currencies,
    setCurrency,
    isCurrencyActive,
    formatCurrency,
  };
}

/**
 * Combined hook for both language and currency management
 * Convenient for components that need both
 */
export function useLocalizationSystem() {
  const localization = useLocalization();

  return {
    ...localization,
    
    // Export current settings
    exportSettings: () => ({
      language: localization.currentLanguage,
      currency: localization.currentCurrency,
    }),
    
    // Import settings
    importSettings: (settings: { language?: string; currency?: string }) => {
      if (settings.language) {
        localization.setLanguage(settings.language);
      }
      if (settings.currency) {
        localization.setCurrency(settings.currency);
      }
    },
  };
}
