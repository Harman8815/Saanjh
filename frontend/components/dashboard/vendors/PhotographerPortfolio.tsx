'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Image as ImageIcon, Grid, List, X, ZoomIn } from 'lucide-react';
import { PhotographerVendor, PhotoItem } from '../../../types/vendor';

interface PhotographerPortfolioProps {
  vendor: PhotographerVendor;
}

export default function PhotographerPortfolio({ vendor }: PhotographerPortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'engagement', label: 'Engagement' },
    { id: 'portrait', label: 'Portrait' },
    { id: 'event', label: 'Event' },
    { id: 'commercial', label: 'Commercial' },
  ];

  const filteredPortfolio = selectedCategory === 'all' 
    ? vendor.portfolio 
    : vendor.portfolio.filter(item => item.category === selectedCategory);

  const getCategoryCount = (category: string) => {
    return vendor.portfolio.filter(item => item.category === category).length;
  };

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category: { id: string; label: string }) => {
          const count = category.id === 'all' ? vendor.portfolio.length : getCategoryCount(category.id);
          if (count === 0 && category.id !== 'all') return null;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              {category.label} ({count})
            </button>
          );
        })}
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-surface rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-all ${
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-all ${
              viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Portfolio Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPortfolio.map((item: PhotoItem, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative aspect-square bg-surface rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedPhoto(item)}
            >
              {/* Thumbnail */}
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium text-sm">{item.title}</h4>
                      <p className="text-white/80 text-xs capitalize">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.type === 'video' && (
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play size={14} className="text-white" />
                        </div>
                      )}
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <ZoomIn size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'video' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {item.type === 'video' ? 'Video' : 'Photo'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPortfolio.map((item: PhotoItem, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card p-4 rounded-xl flex gap-4 cursor-pointer"
              onClick={() => setSelectedPhoto(item)}
            >
              {/* Thumbnail */}
              <div className="w-24 h-24 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-text-primary">{item.title}</h4>
                    <p className="text-sm text-text-muted capitalize">{item.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'video' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {item.type === 'video' ? 'Video' : 'Photo'}
                  </span>
                </div>
              </div>

              {/* Icon */}
              <div className="flex items-center">
                {item.type === 'video' ? (
                  <Play size={20} className="text-text-muted" />
                ) : (
                  <ImageIcon size={20} className="text-text-muted" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredPortfolio.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <ImageIcon size={32} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No portfolio items found</h3>
          <p className="text-text-muted">
            Try selecting a different category
          </p>
        </div>
      )}

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-primary transition-colors"
              >
                <X size={24} />
              </button>

              {/* Media */}
              {selectedPhoto.type === 'video' ? (
                <video
                  src={selectedPhoto.url}
                  controls
                  className="max-w-full max-h-[80vh] rounded-lg"
                  autoPlay
                />
              ) : (
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-[80vh] rounded-lg"
                />
              )}

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-white font-semibold text-lg mb-1">{selectedPhoto.title}</h3>
                <p className="text-white/80 text-sm capitalize">{selectedPhoto.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
