'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, ChevronDown } from 'lucide-react';
import { useCurrency } from '../../hooks/useLocalization';

interface CurrencySwitcherProps {
  variant?: 'dropdown' | 'toggle';
  showSymbol?: boolean;
  className?: string;
}

export function CurrencySwitcher({ 
  variant = 'dropdown', 
  showSymbol = true,
  className = '' 
}: CurrencySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentCurrency, currentCurrencyObject, currencies, setCurrency } = useCurrency();

  const handleCurrencySelect = (currencyCode: string) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  if (variant === 'toggle') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {currencies.map((currency) => (
          <button
            key={currency.code}
            onClick={() => handleCurrencySelect(currency.code)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentCurrency === currency.code
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-white/10'
            }`}
          >
            {showSymbol && (
              <span className="mr-2 font-bold">{currency.symbol}</span>
            )}
            {currency.code}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200"
      >
        <DollarSign size={16} className="text-text-secondary" />
        {showSymbol && (
          <span className="text-sm font-bold text-text-primary">
            {currentCurrencyObject.symbol}
          </span>
        )}
        <span className="text-sm font-medium text-text-primary">
          {currentCurrencyObject.code}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 bg-surface border border-white/20 rounded-lg shadow-lg z-50"
          >
            <div className="py-2">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-200 ${
                    currentCurrency === currency.code
                      ? 'bg-primary/20 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/10'
                  }`}
                >
                  <div className="text-base font-bold text-text-primary">
                    {currency.symbol}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-text-primary">{currency.code}</div>
                    <div className="text-xs opacity-70 text-text-secondary">{currency.name}</div>
                  </div>
                  {currentCurrency === currency.code && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
