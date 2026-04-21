'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock venues data - ready for API integration
  const venues = [
    {
      id: 1,
      name: 'Grand Ballroom',
      type: 'ballroom',
      capacity: 200,
      price: 5000,
      location: 'Downtown',
      rating: 4.8,
      image: '/api/placeholder/venue/1.jpg',
      amenities: ['Parking', 'Catering Kitchen', 'Dance Floor', 'AV Equipment'],
      available: true
    },
    {
      id: 2,
      name: 'Garden Pavilion',
      type: 'outdoor',
      capacity: 150,
      price: 3500,
      location: 'Riverside Gardens',
      rating: 4.9,
      image: '/api/placeholder/venue/2.jpg',
      amenities: ['Garden Setting', 'Tent Coverage', 'Restrooms', 'Parking'],
      available: true
    },
    {
      id: 3,
      name: 'Historic Mansion',
      type: 'mansion',
      capacity: 100,
      price: 8000,
      location: 'Old Town',
      rating: 4.7,
      image: '/api/placeholder/venue/3.jpg',
      amenities: ['Historic Charm', 'Vintage Decor', 'Photo Spots', 'Library'],
      available: false
    },
    {
      id: 4,
      name: 'Beach Resort',
      type: 'beach',
      capacity: 300,
      price: 6000,
      location: 'Sunset Beach',
      rating: 4.6,
      image: '/api/placeholder/venue/4.jpg',
      amenities: ['Ocean View', 'Beach Access', 'Event Planning', 'Resort Facilities'],
      available: true
    }
  ];

  const categories = ['all', 'ballroom', 'outdoor', 'mansion', 'beach'];

  const filteredVenues = venues.filter(venue => {
    const matchesCategory = selectedCategory === 'all' || venue.type === selectedCategory;
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchQuery.toLowerCase());
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
            <span className="text-glow">Venues & Booking</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Discover the perfect location for your special day
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues by name or location..."
              className="flex-1 px-6 py-4 bg-surface border border-white/20 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
            />
            
            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Venue Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredVenues.map((venue, index) => (
            <Link href={`/dashboard/venues/${venue.id}`} key={venue.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="relative h-48 bg-surface rounded-lg mb-4 overflow-hidden">
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                {!venue.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Not Available</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">{venue.name}</h3>
                    <p className="text-text-muted text-sm flex items-center gap-2">
                      <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                        {venue.type}
                      </span>
                      <span>{venue.location}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${venue.price.toLocaleString()}</div>
                    <p className="text-text-muted text-sm">per event</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-text-muted text-sm">
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    {venue.rating}
                  </span>
                  <span>•</span>
                  <span>{venue.capacity} guests</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {venue.amenities.slice(0, 3).map((amenity, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-surface border border-white/20 rounded-full text-xs text-text-muted"
                    >
                      {amenity}
                    </span>
                  ))}
                  {venue.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-surface border border-white/20 rounded-full text-xs text-text-muted">
                      +{venue.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6" onClick={(e) => e.preventDefault()}>
                <button className="btn-secondary flex-1" onClick={(e) => { e.preventDefault(); }}>
                  View Details
                </button>
                <button 
                  className={`btn-primary flex-1 ${!venue.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!venue.available}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/dashboard/venues/${venue.id}`; }}
                >
                  {venue.available ? 'Book Now' : 'Not Available'}
                </button>
              </div>
            </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center items-center gap-2 mt-8"
        >
          <button className="px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors">
            Previous
          </button>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`w-10 h-10 rounded-lg transition-colors ${
                  page === 1
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-white/20 text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors">
            Next
          </button>
        </motion.div>

        {/* Map View Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-card p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Venue Locations</h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm">
                Coming Soon
              </span>
            </div>
          </div>
          <div className="bg-surface rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Interactive Map View</h3>
              <p className="text-text-muted max-w-md">
                Visualize venue locations on an interactive map with filtering and search capabilities.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Saved Venues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Saved Venues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.slice(0, 2).map((venue, index) => (
              <div key={venue.id} className="p-4 bg-surface rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-text-primary font-medium">{venue.name}</h3>
                    <p className="text-text-muted text-sm">{venue.location}</p>
                  </div>
                  <button className="text-red-500 hover:text-red-600 transition-colors">
                    <span className="text-xl">♥</span>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-text-muted text-sm mb-3">
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    {venue.rating}
                  </span>
                  <span>•</span>
                  <span>{venue.capacity} guests</span>
                </div>
                <div className="text-lg font-semibold text-primary">
                  ${venue.price.toLocaleString()}
                  <span className="text-sm text-text-muted font-normal">/event</span>
                </div>
              </div>
            ))}
            <div className="p-4 bg-surface rounded-lg flex items-center justify-center">
              <div className="text-center">
                <button className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2 hover:bg-primary/30 transition-colors">
                  <span className="text-2xl">+</span>
                </button>
                <p className="text-text-muted text-sm">Browse more venues</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comparison Tool */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Compare Venues</h2>
          <div className="mb-4">
            <p className="text-text-muted mb-4">Select up to 3 venues to compare side by side:</p>
            <div className="flex flex-wrap gap-2">
              {venues.slice(0, 3).map((venue) => (
                <button
                  key={venue.id}
                  className="px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary hover:bg-white/5 transition-colors"
                >
                  {venue.name}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-surface rounded-lg p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚖️</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Venue Comparison Tool</h3>
            <p className="text-text-muted max-w-md">
              Compare venues side-by-side with detailed features, pricing, and availability.
            </p>
            <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Start Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
