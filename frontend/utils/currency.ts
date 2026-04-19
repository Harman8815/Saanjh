import { useLocalizationStore, currencies } from '../store/localizationStore';

/**
 * Global currency utility functions
 * These can be used outside of React components
 */

/**
 * Format currency amount using the current locale settings
 * @param amount - The amount to format
 * @param currencyCode - Optional currency code override
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode?: string): string {
  const store = useLocalizationStore.getState();
  const currency = currencyCode 
    ? currencies.find((c: any) => c.code === currencyCode) || store.getCurrentCurrency()
    : store.getCurrentCurrency();
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency.symbol}${amount.toLocaleString(currency.locale, {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    })}`;
  }
}

/**
 * Get currency symbol for the current or specified currency
 * @param currencyCode - Optional currency code override
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode?: string): string {
  const store = useLocalizationStore.getState();
  const currency = currencyCode 
    ? currencies.find((c: any) => c.code === currencyCode) || store.getCurrentCurrency()
    : store.getCurrentCurrency();
  
  return currency.symbol;
}

/**
 * Get currency information object
 * @param currencyCode - Optional currency code override
 * @returns Currency object
 */
export function getCurrencyInfo(currencyCode?: string) {
  const store = useLocalizationStore.getState();
  return currencyCode 
    ? currencies.find((c: any) => c.code === currencyCode) || store.getCurrentCurrency()
    : store.getCurrentCurrency();
}

/**
 * Convert amount from one currency to another
 * Note: This is a placeholder for actual exchange rate integration
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // This is a placeholder implementation
  // In a real app, you would integrate with an exchange rate API
  const store = useLocalizationStore.getState();
  const from = currencies.find((c: any) => c.code === fromCurrency);
  const to = currencies.find((c: any) => c.code === toCurrency);
  
  if (!from || !to) return amount;
  
  // Placeholder conversion rates (would come from API)
  const conversionRates: Record<string, number> = {
    'INR': 1,
    'USD': 0.012, // 1 INR = 0.012 USD
    'EUR': 0.011, // 1 INR = 0.011 EUR
  };
  
  const fromRate = conversionRates[fromCurrency] || 1;
  const toRate = conversionRates[toCurrency] || 1;
  
  return (amount / fromRate) * toRate;
}

/**
 * Parse currency string back to number
 * @param currencyString - Formatted currency string
 * @param currencyCode - Currency code to use for parsing
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string, currencyCode?: string): number {
  const store = useLocalizationStore.getState();
  const currency = currencyCode 
    ? currencies.find((c: any) => c.code === currencyCode) || store.getCurrentCurrency()
    : store.getCurrentCurrency();
  
  // Remove currency symbol and other non-numeric characters
  const cleanString = currencyString
    .replace(new RegExp(`[^0-9.,\\-]`, 'g'), '')
    .replace(/,/g, '.');
  
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format amount with currency symbol (short format)
 * @param amount - Amount to format
 * @param currencyCode - Optional currency code override
 * @returns Short formatted string (e.g., "Rs. 50K")
 */
export function formatCurrencyShort(amount: number, currencyCode?: string): string {
  const store = useLocalizationStore.getState();
  const currency = currencyCode 
    ? currencies.find((c: any) => c.code === currencyCode) || store.getCurrentCurrency()
    : store.getCurrentCurrency();
  
  if (amount >= 1000000) {
    return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
  } else {
    return `${currency.symbol}${amount.toFixed(currency.decimalPlaces)}`;
  }
}

/**
 * Check if two amounts are equal within a small tolerance
 * @param amount1 - First amount
 * @param amount2 - Second amount
 * @param tolerance - Tolerance for comparison (default: 0.01)
 * @returns True if amounts are approximately equal
 */
export function areAmountsEqual(amount1: number, amount2: number, tolerance: number = 0.01): boolean {
  return Math.abs(amount1 - amount2) <= tolerance;
}

/**
 * Calculate percentage of budget used
 * @param spent - Amount spent
 * @param total - Total budget
 * @returns Percentage as number (0-100)
 */
export function calculateBudgetPercentage(spent: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((spent / total) * 100, 100);
}

/**
 * Get currency display format for forms
 * @param currencyCode - Optional currency code override
 * @returns Format object for input fields
 */
export function getCurrencyInputFormat(currencyCode?: string) {
  const currency = getCurrencyInfo(currencyCode);
  
  return {
    prefix: currency.symbol,
    decimalPlaces: currency.decimalPlaces,
    locale: currency.locale,
    code: currency.code,
  };
}
