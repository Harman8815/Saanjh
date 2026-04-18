'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

// TODO: Implement vendor marketplace with profiles, search, and filtering
// TODO: Add vendor categories (photographers, florists, caterers, etc.)
// TODO: Create vendor detail pages with portfolios
// TODO: Implement vendor booking and messaging system
// TODO: Add vendor reviews and ratings
// TODO: Create vendor comparison features
// TODO: Add vendor availability calendar
// TODO: Implement vendor search by location and services

export default function VendorsPage() {
  const { setCurrentPage } = useAppStore();

  // TODO: Fetch vendors from API
  // TODO: Implement search and filter state
  // TODO: Add vendor categories management
  // TODO: Create vendor card components with portfolios

  const vendorCategories = [
    { id: 'photographers', name: 'Photographers', count: 0 },
    { id: 'florists', name: 'Florists', count: 0 },
    { id: 'caterers', name: 'Caterers', count: 0 },
    { id: 'djs', name: 'DJs & Music', count: 0 },
    { id: 'decorators', name: 'Decorators', count: 0 },
    { id: 'cakes', name: 'Cake Designers', count: 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add vendor search header with category filters */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Wedding Vendors
          </h1>
          <p className="text-xl text-text-secondary">
            Find the perfect vendors for your special day
          </p>
        </motion.div>

        {/* TODO: Implement vendor categories filter */}
        <div className="mb-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {vendorCategories.map((category) => (
                <button
                  key={category.id}
                  className="glass p-4 text-center hover:bg-white/10 transition-colors"
                  // TODO: Add category filtering functionality
                >
                  <div className="text-2xl mb-2">TODO</div>
                  <div className="text-sm text-text-primary">{category.name}</div>
                  <div className="text-xs text-text-secondary">{category.count} vendors</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TODO: Implement vendor search bar and filters */}
        <div className="mb-8">
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search vendors..."
                className="p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                // TODO: Add search functionality
              />
              <select className="p-3 bg-surface border border-white/20 rounded-lg text-text-primary">
                <option>TODO: Location</option>
              </select>
              <select className="p-3 bg-surface border border-white/20 rounded-lg text-text-primary">
                <option>TODO: Price Range</option>
              </select>
              <select className="p-3 bg-surface border border-white/20 rounded-lg text-text-primary">
                <option>TODO: Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* TODO: Implement vendor listings grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for vendor cards */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6 hover:transform hover:scale-105 transition-transform">
              <div className="h-48 bg-surface rounded-lg mb-4 flex items-center justify-center">
                <span className="text-text-secondary">Vendor Portfolio {i}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-text-primary">
                  Vendor Name {i}
                </h3>
                <span className="text-primary text-sm">TODO: Rating</span>
              </div>
              <p className="text-text-secondary text-sm mb-2">
                TODO: Vendor Category
              </p>
              <p className="text-text-secondary mb-4">
                TODO: Add vendor description and services
              </p>
              <div className="flex justify-between items-center">
                <span className="text-primary font-semibold">$X,XXX</span>
                <button className="btn-primary btn-sm">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TODO: Add pagination component */}
        <div className="mt-12 text-center">
          <div className="glass-card inline-block p-4">
            <p className="text-text-secondary">TODO: Add pagination</p>
          </div>
        </div>
      </div>

      {/* TODO: Add vendor comparison sidebar */}
      {/* TODO: Implement vendor messaging system */}
      {/* TODO: Add vendor booking flow */}
    </div>
  );
}
