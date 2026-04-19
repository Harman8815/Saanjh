import { useCallback, useMemo } from 'react';
import { useCurrency } from './useLocalization';
import { 
  formatCurrency as formatCurrencyUtil, 
  formatCurrencyShort, 
  getCurrencySymbol, 
  getCurrencyInfo,
  calculateBudgetPercentage,
  getCurrencyInputFormat
} from '../utils/currency';

/**
 * Hook for dynamic currency formatting with current locale
 * Provides reactive currency formatting that updates when currency changes
 */
export function useFormatCurrency() {
  const { currentCurrency, currentCurrencyObject, formatCurrency: formatFromStore } = useCurrency();

  // Format currency using current locale
  const formatCurrency = useCallback((amount: number, currencyCode?: string) => {
    return formatCurrencyUtil(amount, currencyCode || currentCurrency);
  }, [currentCurrency]);

  // Format currency in short form (K, M suffixes)
  const formatShort = useCallback((amount: number, currencyCode?: string) => {
    return formatCurrencyShort(amount, currencyCode || currentCurrency);
  }, [currentCurrency]);

  // Get current currency symbol
  const getSymbol = useCallback((currencyCode?: string) => {
    return getCurrencySymbol(currencyCode || currentCurrency);
  }, [currentCurrency]);

  // Get currency information
  const getInfo = useCallback((currencyCode?: string) => {
    return getCurrencyInfo(currencyCode || currentCurrency);
  }, [currentCurrency]);

  // Calculate budget percentage
  const calculatePercentage = useCallback((spent: number, total: number) => {
    return calculateBudgetPercentage(spent, total);
  }, []);

  // Get input format for forms
  const getInputFormat = useCallback((currencyCode?: string) => {
    return getCurrencyInputFormat(currencyCode || currentCurrency);
  }, [currentCurrency]);

  // Memoized currency info for performance
  const currencyInfo = useMemo(() => ({
    code: currentCurrencyObject.code,
    symbol: currentCurrencyObject.symbol,
    name: currentCurrencyObject.name,
    locale: currentCurrencyObject.locale,
    decimalPlaces: currentCurrencyObject.decimalPlaces,
  }), [currentCurrencyObject]);

  return {
    // Current state
    currentCurrency,
    currencyInfo,
    
    // Formatting functions
    formatCurrency,
    formatShort,
    getSymbol,
    getInfo,
    
    // Utility functions
    calculatePercentage,
    getInputFormat,
    
    // Legacy compatibility
    format: formatFromStore,
  };
}

/**
 * Hook for currency-specific operations with budget calculations
 * Convenient for budget and expense components
 */
export function useBudgetCurrency() {
  const { formatCurrency, formatShort, currencyInfo, calculatePercentage } = useFormatCurrency();

  // Format budget amount with percentage
  const formatBudgetAmount = useCallback((amount: number, total?: number) => {
    const formatted = formatCurrency(amount);
    if (total !== undefined) {
      const percentage = calculatePercentage(amount, total);
      return `${formatted} (${percentage.toFixed(1)}%)`;
    }
    return formatted;
  }, [formatCurrency, calculatePercentage]);

  // Format expense amount
  const formatExpense = useCallback((amount: number, description?: string) => {
    const formatted = formatCurrency(amount);
    return description ? `${description}: ${formatted}` : formatted;
  }, [formatCurrency]);

  // Format vendor pricing
  const formatVendorPrice = useCallback((amount: number, vendorName?: string) => {
    const formatted = formatCurrency(amount);
    return vendorName ? `${vendorName}: ${formatted}` : formatted;
  }, [formatCurrency]);

  // Format price range
  const formatPriceRange = useCallback((min: number, max: number) => {
    const minFormatted = formatCurrency(min);
    const maxFormatted = formatCurrency(max);
    return min === max ? minFormatted : `${minFormatted} - ${maxFormatted}`;
  }, [formatCurrency]);

  return {
    formatCurrency,
    formatShort,
    formatBudgetAmount,
    formatExpense,
    formatVendorPrice,
    formatPriceRange,
    currencyInfo,
    calculatePercentage,
  };
}

/**
 * Hook for currency conversion utilities
 * For future use when exchange rate API is integrated
 */
export function useCurrencyConverter() {
  const { currentCurrency } = useCurrency();

  // Convert amount to current currency
  const convertToCurrent = useCallback((amount: number, fromCurrency: string) => {
    // This is a placeholder - would integrate with exchange rate API
    return amount; // No conversion for now
  }, [currentCurrency]);

  // Convert amount from current currency to target
  const convertFromCurrent = useCallback((amount: number, toCurrency: string) => {
    // This is a placeholder - would integrate with exchange rate API
    return amount; // No conversion for now
  }, [currentCurrency]);

  return {
    convertToCurrent,
    convertFromCurrent,
    currentCurrency,
  };
}
