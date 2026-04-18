'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Star } from 'lucide-react';

export default function VendorsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Fetch vendors from API
  const vendors = [
    {
      id: 1,
      name: 'Elegant Events',
      category: 'Venue',
      rating: 4.8,
      price: '$$$',
      image: '/vendors/elegant-events.jpg',
      services: ['Full Service Planning', 'Decor', 'Coordination'],
      available: true
    },
    {
      id: 2,
      name: 'Bloom Florists',
      category: 'Flowers',
      rating: 4.9,
      price: '$$',
      image: '/vendors/bloom.jpg',
      services: ['Bridal Bouquets', 'Centerpieces', 'Decorations'],
      available: true
    },
    {
      id: 3,
      name: 'Capture Moments',
      category: 'Photography',
      rating: 5.0,
      price: '$$$',
      image: '/vendors/capture.jpg',
      services: ['Wedding Photography', 'Videography', 'Photo Albums'],
      available: true
    },
    {
      id: 4,
      name: 'Delicious Catering',
      category: 'Catering',
      rating: 4.7,
      price: '$$',
      image: '/vendors/delicious.jpg',
      services: ['Full Menu Planning', 'Dietary Options', 'Bar Service'],
      available: true
    },
    {
      id: 5,
      name: 'Sweet Harmony',
      category: 'Music',
      rating: 4.6,
      price: '$',
      image: '/vendors/sweet-harmony.jpg',
      services: ['DJ Services', 'Live Band', 'Lighting'],
      available: false
    }
  ];

  const categories = ['all', 'Venue', 'Photography', 'Flowers', 'Catering', 'Music', 'Decor'];

  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <span className="text-glow">Vendor Marketplace</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Find and connect with the perfect wedding vendors
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-primary mb-2">Search Vendors</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or service..."
                className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              className="glass-card p-6 cursor-pointer hover:scale-105 transition-transform"
            >
              {/* Vendor Image */}
              <div className="w-full h-48 bg-surface rounded-lg mb-4 flex items-center justify-center">
                <Store size={48} className="text-text-muted" />
              </div>

              {/* Vendor Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-text-primary">{vendor.name}</h3>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-gold fill-current" />
                    <span className="text-text-primary">{vendor.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                    {vendor.category}
                  </span>
                  <span className="text-text-muted">Price Range:</span>
                  <span className="text-primary font-medium">{vendor.price}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-text-primary font-medium mb-2">Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.services.map((service, idx) => (
                      <span key={idx} className="px-3 py-1 bg-surface border border-white/20 rounded-full text-xs text-text-muted">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    vendor.available 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {vendor.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button className="flex-1 btn-secondary">
                  View Profile
                </button>
                <button className="flex-1 btn-primary" disabled={!vendor.available}>
                  {vendor.available ? 'Contact' : 'Unavailable'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TODO: Add pagination */}
        {/* TODO: Add sorting options */}
        {/* TODO: Add vendor comparison */}
        {/* TODO: Add saved vendors */}
      </div>
    </div>
  );
}
