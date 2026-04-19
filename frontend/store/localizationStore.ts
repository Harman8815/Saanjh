import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
}

export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'US'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'Hindi',
    flag: 'IN'
  }
];

export const currencies: Currency[] = [
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: 'Rs.',
    locale: 'en-IN',
    decimalPlaces: 0
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    decimalPlaces: 2
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: 'EUR',
    locale: 'de-DE',
    decimalPlaces: 2
  }
];

interface LocalizationState {
  currentLanguage: string;
  currentCurrency: string;
  setLanguage: (languageCode: string) => void;
  setCurrency: (currencyCode: string) => void;
  getCurrentLanguage: () => Language;
  getCurrentCurrency: () => Currency;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  resetToDefaults: () => void;
}

const defaultLanguage = 'en';
const defaultCurrency = 'INR';

export const useLocalizationStore = create<LocalizationState>()(
  persist(
    (set, get) => ({
      currentLanguage: defaultLanguage,
      currentCurrency: defaultCurrency,

      setLanguage: (languageCode: string) => {
        const language = languages.find(lang => lang.code === languageCode);
        if (language) {
          set({ currentLanguage: languageCode });
          // Update document lang attribute
          document.documentElement.lang = languageCode;
          // Update text direction if needed
          if (language.rtl) {
            document.documentElement.dir = 'rtl';
          } else {
            document.documentElement.dir = 'ltr';
          }
        }
      },

      setCurrency: (currencyCode: string) => {
        const currency = currencies.find(curr => curr.code === currencyCode);
        if (currency) {
          set({ currentCurrency: currencyCode });
        }
      },

      getCurrentLanguage: () => {
        const language = languages.find(lang => lang.code === get().currentLanguage);
        return language || languages[0];
      },

      getCurrentCurrency: () => {
        const currency = currencies.find(curr => curr.code === get().currentCurrency);
        return currency || currencies[0];
      },

      formatCurrency: (amount: number) => {
        const currency = get().getCurrentCurrency();
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
      },

      formatDate: (date: Date | string) => {
        const language = get().getCurrentLanguage();
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        try {
          const locale = language.code === 'hi' ? 'hi-IN' : 'en-US';
          return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(dateObj);
        } catch (error) {
          // Fallback formatting
          return dateObj.toLocaleDateString();
        }
      },

      resetToDefaults: () => {
        set({ currentLanguage: defaultLanguage, currentCurrency: defaultCurrency });
        document.documentElement.lang = defaultLanguage;
        document.documentElement.dir = 'ltr';
      },
    }),
    {
      name: 'localization-settings',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const language = languages.find(lang => lang.code === state.currentLanguage);
          if (language) {
            document.documentElement.lang = state.currentLanguage;
            if (language.rtl) {
              document.documentElement.dir = 'rtl';
            } else {
              document.documentElement.dir = 'ltr';
            }
          }
        }
      },
    }
  )
);

// Initialize localization on app start
export const initializeLocalization = () => {
  const state = useLocalizationStore.getState();
  const language = languages.find(lang => lang.code === state.currentLanguage);
  if (language) {
    document.documentElement.lang = state.currentLanguage;
    if (language.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }
};
