'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { DataLoadingState, EmptyState } from '../../../components/ui/loading-states';
import VenueService from '../../../services/venues';
import { VenueCatalog } from '../../../types/api';

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Venues come from the shared catalog endpoint rather than inline mock data.
  const [venues, setVenues] = useState<VenueCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVenues() {
      setLoading(true);
      setError(null);
      try {
        const data = await VenueService.getVenueCatalog();
        if (!cancelled) {
          setVenues(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Could not load the venue catalog')
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVenues();
    return () => {
      cancelled = true;
    };
  }, []);

  // Category options are derived from the catalog so they stay in sync with it.
  const categories = [
    'all',
    ...Array.from(new Set(venues.map((venue) => venue.type))).sort(),
  ];

  const filteredVenues = venues.filter((venue) => {
    const matchesCategory =
      selectedCategory === 'all' || venue.type === selectedCategory;
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

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
        >
          <DataLoadingState
            loading={loading}
            error={error}
            skeleton={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="glass-card p-6 animate-pulse">
                    <div className="h-48 bg-white/10 rounded-lg mb-4" />
                    <div className="h-5 bg-white/10 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            }
          >
            {filteredVenues.length === 0 ? (
              <EmptyState
                title={
                  venues.length === 0
                    ? "No venues in the catalog yet"
                    : "No venues match your search"
                }
                description={
                  venues.length === 0
                    ? "The venue catalog is empty. Venues are added by administrators."
                    : "Try a different search term or category."
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue, index) => (
                  <Link href={`/dashboard/venues/${venue.id}`} key={venue.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div className="relative h-48 bg-surface rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                        <div className="text-center p-4">
                          <h4 className="text-lg font-semibold text-text-primary">{venue.name}</h4>
                          <p className="text-text-muted text-xs mt-1">{venue.address}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-text-primary">{venue.name}</h3>
                            <p className="text-text-muted text-sm flex items-center gap-2">
                              <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                                {venue.type}
                              </span>
                              <span>{venue.address}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{formatPrice(venue.price)}</div>
                            <p className="text-text-muted text-sm">per event</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-text-muted text-sm">
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-400">&#9733;</span>
                            {venue.rating || "Not rated"}
                          </span>
                          <span>&#8226;</span>
                          <span>
                            {venue.capacity_min}
                            {venue.capacity_max && venue.capacity_max !== venue.capacity_min
                              ? `-${venue.capacity_max}`
                              : ""}{" "}
                            guests
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {venue.amenities?.slice(0, 3).map((amenity, amenityIndex) => (
                            <span
                              key={amenity.id ?? amenityIndex}
                              className="px-2 py-1 bg-surface border border-white/20 rounded-full text-xs text-text-muted"
                            >
                              {amenity.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </DataLoadingState>
        </motion.div>
      </div>
    </div>
  );
}