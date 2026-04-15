'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DashboardSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function DashboardSearch({ onSearch, placeholder = "Search dashboard..." }: DashboardSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const quickFilters = [
    { label: 'Tasks', icon: '📋', count: 5 },
    { label: 'Guests', icon: '👥', count: 12 },
    { label: 'Vendors', icon: '🏪', count: 3 },
    { label: 'Expenses', icon: '💳', count: 8 },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative transition-all duration-300 ${
          isFocused ? 'scale-105' : 'scale-100'
        }`}
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full px-6 py-4 pl-14 bg-surface border border-white/20 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-lg"
          />
          
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <motion.div
              animate={{ rotate: isFocused ? 360 : 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl text-text-secondary"
            >
              🔍
            </motion.div>
          </div>

          {/* Clear Button */}
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-white/5"
            >
              ✕
            </motion.button>
          )}
        </div>

        {/* Search Suggestions */}
        {isFocused && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/20 rounded-2xl shadow-xl z-50"
          >
            <div className="p-4">
              <p className="text-text-secondary text-sm mb-3">Recent searches</p>
              <div className="space-y-2">
                {['Venue booking', 'Guest list', 'Budget tracker', 'Timeline'].map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="w-full text-left px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔍</span>
                      <span>{term}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6 flex flex-wrap gap-3 justify-center"
      >
        {quickFilters.map((filter, index) => (
          <motion.button
            key={filter.label}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
            onClick={() => handleSearch(filter.label.toLowerCase())}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/20 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-300 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">
              {filter.icon}
            </span>
            <span className="text-sm font-medium">{filter.label}</span>
            {filter.count > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {filter.count}
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
