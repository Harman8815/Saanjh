'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { DecorationVendor, DecorationItem, DecorationPackage } from '../../../types/vendor';

interface DecorationServicesProps {
  vendor: DecorationVendor;
}

const decorationCategories = [
  { id: 'all', label: 'All Items', icon: Palette },
  { id: 'floral', label: 'Floral', icon: Sparkles },
  { id: 'lighting', label: 'Lighting', icon: Sparkles },
  { id: 'backdrop', label: 'Backdrops', icon: Palette },
  { id: 'table', label: 'Table Decor', icon: Palette },
  { id: 'ceiling', label: 'Ceiling', icon: Sparkles },
  { id: 'entrance', label: 'Entrance', icon: Palette },
  { id: 'centerpiece', label: 'Centerpieces', icon: Sparkles },
  { id: 'other', label: 'Other', icon: Palette },
];

export default function DecorationServices({ vendor }: DecorationServicesProps) {
  const [activeSection, setActiveSection] = useState<'items' | 'packages'>('items');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = selectedCategory === 'all' 
    ? vendor.items 
    : vendor.items.filter(item => item.category === selectedCategory);

  const getItemCount = (category: string) => {
    return vendor.items.filter(item => item.category === category).length;
  };

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('items')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'items'
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          Individual Items
        </button>
        <button
          onClick={() => setActiveSection('packages')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'packages'
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          Packages
        </button>
      </div>

      {/* Items Section */}
      {activeSection === 'items' && (
        <>
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {decorationCategories.map((category) => {
              const count = category.id === 'all' ? vendor.items.length : getItemCount(category.id);
              if (count === 0 && category.id !== 'all') return null;
              
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

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item: DecorationItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glass-card p-4 rounded-xl"
              >
                {/* Item Image */}
                <div className="aspect-video bg-surface rounded-lg overflow-hidden mb-4">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Palette size={32} className="text-text-muted" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-text-primary">{item.name}</h4>
                    <p className="text-sm text-text-muted line-clamp-2">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-surface border border-white/20 rounded-full text-text-muted capitalize">
                      {item.category}
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {vendor.pricing.currency}{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Packages Section */}
      {activeSection === 'packages' && (
        <div className="space-y-6">
          {vendor.packages.map((pkg: DecorationPackage, index: number) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">{pkg.name}</h3>
                      <p className="text-text-secondary">{pkg.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {vendor.pricing.currency}{pkg.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-surface rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-primary" />
                        <span className="text-sm font-medium text-text-primary">Setup Time</span>
                      </div>
                      <p className="text-lg font-semibold text-text-primary">{pkg.setupTime} hours</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} className="text-primary" />
                        <span className="text-sm font-medium text-text-primary">Themes</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pkg.themes.map((theme: string) => (
                          <span key={theme} className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Package Includes */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="font-medium text-text-primary mb-3">Includes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {pkg.includes.map((item: string) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-sm text-text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button className="w-full btn-primary py-3">
                  Select Package
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {activeSection === 'items' && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <Palette size={32} className="text-text-muted" />
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
