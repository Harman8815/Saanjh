'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import CategoryTabs from '../../../components/dashboard/vendors/CategoryTabs';
import VendorCard from '../../../components/dashboard/vendors/VendorCard';
import { VendorCatalog } from '../../../types/api';
import { VendorService } from '../../../services/vendors';

type CategoryType = 'photographer' | 'catering' | 'decoration' | 'others' | 'all';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch vendor catalog from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const catalog = await VendorService.getVendorCatalog();
        setVendors(catalog);
      } catch (err: any) {
        console.error('Error fetching vendor catalog:', err);
        setError(err.message || 'Failed to load vendors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = { all: vendors.length, photographer: 0, catering: 0, decoration: 0, others: 0 };
    vendors.forEach(vendor => {
      const catName = vendor.category?.name?.toLowerCase() || 'others';
      if (catName.includes('photo')) counts.photographer++;
      else if (catName.includes('cater')) counts.catering++;
      else if (catName.includes('decor')) counts.decoration++;
      else counts.others++;
    });
    return counts;
  }, [vendors]);

  // Filter vendors based on category and search
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const catName = vendor.category?.name?.toLowerCase() || 'others';
      const category: CategoryType = catName.includes('photo') ? 'photographer' :
                      catName.includes('cater') ? 'catering' :
                      catName.includes('decor') ? 'decoration' : 'others';

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.contact && vendor.contact.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, vendors]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted">Loading vendors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            <span className="text-glow">Wedding Vendors</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl">
            Discover and connect with the perfect vendors for your special day
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <CategoryTabs 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={categoryCounts}
          />
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card p-4 mb-8 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors by name, description, or location..."
                className="w-full pl-12 pr-4 py-3 bg-surface border border-white/20 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10'
                }`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-text-muted">
            Showing <span className="text-text-primary font-medium">{filteredVendors.length}</span> vendor{filteredVendors.length !== 1 ? 's' : ''}
            {activeCategory !== 'all' && (
              <span> in <span className="text-primary font-medium capitalize">{activeCategory}</span></span>
            )}
            {searchQuery && (
              <span> matching <span className="text-primary font-medium">&quot;{searchQuery}&quot;</span></span>
            )}
          </p>
        </motion.div>

        {/* Vendor Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }
        >
          {filteredVendors.map((vendor, index) => (
            <VendorCard 
              key={vendor.id} 
              vendor={vendor} 
              index={index}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredVendors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <Filter size={32} className="text-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No vendors found</h3>
            <p className="text-text-muted">
              Try adjusting your search or category filter
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
