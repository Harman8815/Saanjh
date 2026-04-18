'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

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

  return (
    <div className="w-full">
      <div className="relative h-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full h-10 px-4 pl-10 pr-10 bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all duration-200 text-sm"
        />

        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
          <Search size={16} />
        </div>

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-white/5"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
