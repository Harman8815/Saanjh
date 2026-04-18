'use client';

import { motion } from 'framer-motion';
import { Camera, UtensilsCrossed, Palette, Store } from 'lucide-react';
import { VendorCategory, VENDOR_CATEGORY_CONFIG } from '../../../types/vendor';

const iconMap = {
  Camera,
  UtensilsCrossed,
  Palette,
  Store,
};

interface CategoryTabsProps {
  activeCategory: VendorCategory | 'all';
  onCategoryChange: (category: VendorCategory | 'all') => void;
  counts?: Record<VendorCategory | 'all', number>;
}

export default function CategoryTabs({ activeCategory, onCategoryChange, counts }: CategoryTabsProps) {
  const categories: (VendorCategory | 'all')[] = ['all', 'photographer', 'catering', 'decoration', 'others'];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category, index) => {
        const config = category === 'all' 
          ? { label: 'All Vendors', icon: 'Store', description: 'View all vendors', color: 'primary' }
          : VENDOR_CATEGORY_CONFIG[category];
        
        const Icon = iconMap[config.icon as keyof typeof iconMap] || Store;
        const isActive = activeCategory === category;
        const count = counts?.[category] || 0;

        return (
          <motion.button
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onCategoryChange(category)}
            className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              isActive
                ? `bg-${config.color === 'primary' ? 'primary' : config.color}-500 text-white shadow-lg shadow-${config.color === 'primary' ? 'primary' : config.color}-500/25`
                : 'bg-surface border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            <span>{config.label}</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-white/10 text-text-muted'
            }`}>
              {count}
            </span>
            
            {isActive && (
              <motion.div
                layoutId="activeCategoryTab"
                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
