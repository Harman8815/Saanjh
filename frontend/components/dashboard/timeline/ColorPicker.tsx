'use client';

import { useState, useEffect } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { EVENT_COLORS, suggestColorFromKeywords, getEventColor } from '../../../types/event';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  title?: string;
  description?: string;
}

export default function ColorPicker({ value, onChange, title, description }: ColorPickerProps) {
  const [suggestedColor, setSuggestedColor] = useState<string | null>(null);

  // Auto-suggest color based on title/description
  useEffect(() => {
    if (title || description) {
      const combinedText = `${title || ''} ${description || ''}`;
      const suggestion = suggestColorFromKeywords(combinedText);
      setSuggestedColor(suggestion);
    }
  }, [title, description]);

  const selectedColor = getEventColor(value);

  const handleSuggest = () => {
    if (suggestedColor) {
      onChange(suggestedColor);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Palette size={16} />
          Event Color
        </label>
        {suggestedColor && suggestedColor !== value && (
          <button
            type="button"
            onClick={handleSuggest}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Sparkles size={12} />
            Suggest: {getEventColor(suggestedColor).name}
          </button>
        )}
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-5 gap-2">
        {EVENT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`
              relative group w-full aspect-square rounded-xl transition-all duration-200
              ${color.value === value 
                ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' 
                : 'hover:scale-105 hover:shadow-lg'
              }
            `}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {/* Selected indicator */}
            {color.value === value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-white drop-shadow-md" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Hover tooltip */}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-text-secondary 
              opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {color.name}
            </span>
          </button>
        ))}
      </div>

      {/* Selected color info */}
      <div className="flex items-center gap-2 pt-2">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: selectedColor.hex }}
        />
        <span className="text-sm text-text-secondary">
          Selected: <span className="text-text-primary font-medium">{selectedColor.name}</span>
        </span>
      </div>

      {/* Keyword hints */}
      <div className="text-xs text-text-muted pt-1">
        <p className="mb-1">Colors auto-assigned for:</p>
        <div className="flex flex-wrap gap-1">
          <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">ceremony</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">dinner</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">meeting</span>
          <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400">photo</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">hair</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">travel</span>
        </div>
      </div>
    </div>
  );
}
