'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ChefHat, Clock, Users } from 'lucide-react';
import { CateringVendor, MenuItem } from '../../../types/vendor';

interface CateringMenuProps {
  vendor: CateringVendor;
}

const menuCategories = [
  { id: 'starter', label: 'Starters', icon: ChefHat },
  { id: 'main', label: 'Main Course', icon: ChefHat },
  { id: 'dessert', label: 'Desserts', icon: ChefHat },
  { id: 'appetizer', label: 'Appetizers', icon: ChefHat },
  { id: 'beverage', label: 'Beverages', icon: ChefHat },
];

export default function CateringMenu({ vendor }: CateringMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredMenu = selectedCategory === 'all' 
    ? vendor.menu 
    : vendor.menu.filter(item => item.category === selectedCategory);

  const getMenuCount = (category: string) => {
    return vendor.menu.filter(item => item.category === category).length;
  };

  return (
    <div className="space-y-6">
      {/* Menu Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          All Items ({vendor.menu.length})
        </button>
        {menuCategories.map((category: { id: string; label: string; icon: any }) => {
          const count = getMenuCount(category.id);
          if (count === 0) return null;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              <category.icon size={16} />
              {category.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMenu.map((item: MenuItem, index: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex gap-4">
              {/* Item Image */}
              <div className="w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat size={24} className="text-text-muted" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-text-primary">{item.name}</h4>
                    <p className="text-sm text-text-muted line-clamp-2">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {vendor.pricing.currency}{item.price}
                    </p>
                    <p className="text-xs text-text-muted">per item</p>
                  </div>
                </div>

                {/* Dietary Tags */}
                <div className="flex items-center gap-2">
                  {item.isVegetarian && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      <Leaf size={10} />
                      Vegetarian
                    </span>
                  )}
                  {item.isVegan && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                      <Leaf size={10} />
                      Vegan
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-2 py-1 bg-surface border border-white/20 rounded-full text-xs text-text-muted">
                    <Users size={10} />
                    Serves {item.serves}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMenu.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <ChefHat size={32} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No items found</h3>
          <p className="text-text-muted">
            Try selecting a different category
          </p>
        </div>
      )}
    </div>
  );
}
