'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Map as MapIcon,
  List,
  Search,
  Bookmark,
  BookmarkCheck,
  Scale,
  Locate,
  Loader2,
  X,
  Star,
  Users,
} from 'lucide-react';
import { DataLoadingState, EmptyState } from '../../../components/ui/loading-states';
import VenueComparisonModal from '../../../components/venues/VenueComparisonModal';
import VenueService from '../../../services/venues';
import { useSavedVenues, useToggleSavedVenue } from '../../../hooks/useWeddings';
import { VenueCatalog } from '../../../types/api';
import toast from 'react-hot-toast';

// Leaflet touches `window` at import time, so the map must never be bundled
// for the server render.
const VenueMap = dynamic(() => import('../../../components/venues/VenueMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-xl bg-surface animate-pulse flex items-center justify-center">
      <Loader2 className="animate-spin text-text-muted" />
    </div>
  ),
});

const RADIUS_OPTIONS = [5, 10, 25, 50];

/** Great-circle distance in kilometres between two coordinates. */
function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Venues come from the shared catalog endpoint rather than inline mock data.
  const [venues, setVenues] = useState<VenueCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Location based filtering
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  // Comparison selection
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Saved venue shortlist
  const { savedVenues } = useSavedVenues();
  const toggleSavedVenue = useToggleSavedVenue();
  const savedIds = useMemo(() => new Set(savedVenues.map(v => v.id)), [savedVenues]);

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
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(venues.map(venue => venue.type))).sort()],
    [venues]
  );

  // Attach a distance to each geocoded venue once a location is known.
  const venuesWithDistance = useMemo(() => {
    if (!userLocation) return venues.map(venue => ({ venue, distance: null as number | null }));
    return venues.map(venue => {
      if (typeof venue.latitude !== 'number' || typeof venue.longitude !== 'number') {
        return { venue, distance: null };
      }
      const distance = distanceKm(userLocation, {
        lat: venue.latitude,
        lng: venue.longitude,
      });
      return { venue, distance };
    });
  }, [venues, userLocation]);

  const filteredVenues = venuesWithDistance.filter(({ venue, distance }) => {
    const matchesCategory = selectedCategory === 'all' || venue.type === selectedCategory;
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase());
    // A venue without coordinates is only excluded when the user explicitly
    // picked a radius, since it simply has not been geocoded yet.
    const matchesRadius =
      radiusKm === null || (distance !== null && distance <= radiusKm);
    return matchesCategory && matchesSearch && matchesRadius;
  });

  const compareVenues = compareIds
    .map(id => venues.find(venue => venue.id === id))
    .filter((venue): venue is VenueCatalog => Boolean(venue));

  const geocodedVenues = venues.filter(
    venue => typeof venue.latitude === 'number' && typeof venue.longitude === 'number'
  );

  const formatPrice = (value: number) => `$${Number(value).toLocaleString()}`;

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setRadiusKm(prev => prev ?? 25);
        setLocating(false);
        toast.success('Found your location');
      },
      () => {
        setLocating(false);
        toast.error('Could not get your location');
      },
      { timeout: 10000 }
    );
  };

  const clearLocation = () => {
    setUserLocation(null);
    setRadiusKm(null);
  };

  const toggleCompare = (venueId: number) => {
    setCompareIds(prev => {
      if (prev.includes(venueId)) {
        return prev.filter(id => id !== venueId);
      }
      if (prev.length >= 4) {
        toast.error('You can compare up to 4 venues at once');
        return prev;
      }
      return [...prev, venueId];
    });
  };

  const handleToggleSaved = async (venueId: number) => {
    try {
      const result = await toggleSavedVenue.mutateAsync(venueId);
      toast.success(
        result.action === 'added' ? 'Venue saved to your shortlist' : 'Venue removed from shortlist'
      );
    } catch {
      toast.error('Failed to update saved venues');
    }
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
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search venues by name or location..."
                className="w-full pl-12 pr-4 py-4 bg-surface border border-white/20 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 p-1 bg-surface border border-white/20 rounded-xl self-start">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <MapIcon size={16} />
                Map
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
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

          {/* Location Filter */}
          <div className="flex flex-wrap items-center gap-3 p-4 glass-card">
            <button
              onClick={handleLocate}
              disabled={locating}
              className="btn-secondary btn-sm flex items-center gap-2"
            >
              {locating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Locate size={14} />
              )}
              {userLocation ? 'Update location' : 'Use my location'}
            </button>

            {userLocation && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-sm">Within</span>
                  {RADIUS_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => setRadiusKm(option)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        radiusKm === option
                          ? 'bg-primary text-white'
                          : 'bg-surface border border-white/20 text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {option} km
                    </button>
                  ))}
                </div>
                <button
                  onClick={clearLocation}
                  className="ml-auto flex items-center gap-1 text-text-muted hover:text-text-primary text-sm"
                >
                  <X size={14} />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Saved venues summary */}
          {savedIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <BookmarkCheck size={14} className="text-primary" />
              {savedIds.size} venue{savedIds.size === 1 ? '' : 's'} saved to your shortlist
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setRadiusKm(null);
                }}
                className="ml-2 text-primary hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Results */}
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
                    ? 'No venues in the catalog yet'
                    : 'No venues match your search'
                }
                description={
                  venues.length === 0
                    ? 'The venue catalog is empty. Venues are added by administrators.'
                    : 'Try a different search term, category, or radius.'
                }
              />
            ) : viewMode === 'map' ? (
              /* Map View */
              <div className="space-y-4">
                <div className="glass-card p-1 h-[520px] overflow-hidden">
                  {geocodedVenues.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-8">
                      <div>
                        <MapIcon size={40} className="text-text-muted mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-text-primary mb-1">
                          Map coordinates unavailable
                        </h3>
                        <p className="text-text-muted text-sm max-w-sm">
                          Venues in the catalog have not been geocoded yet. Switch to the
                          list view to browse all venues.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <VenueMap
                      venues={filteredVenues.map(item => item.venue)}
                      center={userLocation}
                      selectedVenueId={compareIds[compareIds.length - 1] ?? null}
                    />
                  )}
                </div>

                {/* Compact list under the map */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredVenues.map(({ venue, distance }) => (
                    <div key={venue.id} className="glass-card p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary truncate">{venue.name}</h4>
                        <p className="text-text-muted text-xs truncate">{venue.address}</p>
                      </div>
                      {distance !== null && (
                        <span className="text-xs text-primary shrink-0">
                          {distance.toFixed(1)} km
                        </span>
                      )}
                      <button
                        onClick={() => toggleCompare(venue.id)}
                        className={`btn-xs shrink-0 ${
                          compareIds.includes(venue.id) ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        Compare
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* List View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map(({ venue, distance }, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="glass-card p-6 hover:scale-[1.02] transition-transform"
                  >
                    <Link href={`/dashboard/venues/${venue.id}`}>
                      <div className="relative h-48 bg-surface rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                        <div className="text-center p-4">
                          <h4 className="text-lg font-semibold text-text-primary">{venue.name}</h4>
                          <p className="text-text-muted text-xs mt-1">{venue.address}</p>
                        </div>
                      </div>
                    </Link>

                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-text-primary">{venue.name}</h3>
                          <p className="text-text-muted text-sm flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs capitalize">
                              {venue.type}
                            </span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(venue.price)}
                          </div>
                          <p className="text-text-muted text-sm">per event</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-text-muted text-sm">
                        <span className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400" />
                          {venue.rating ? venue.rating.toFixed(1) : 'Not rated'}
                        </span>
                        <span>&#8226;</span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {venue.capacity_min}
                          {venue.capacity_max && venue.capacity_max !== venue.capacity_min
                            ? `-${venue.capacity_max}`
                            : ''}{' '}
                          guests
                        </span>
                        {distance !== null && (
                          <>
                            <span>&#8226;</span>
                            <span className="text-primary">{distance.toFixed(1)} km</span>
                          </>
                        )}
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

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => handleToggleSaved(venue.id)}
                          disabled={toggleSavedVenue.isPending}
                          className={`btn-sm flex-1 flex items-center justify-center gap-1 ${
                            savedIds.has(venue.id) ? 'btn-primary' : 'btn-secondary'
                          }`}
                        >
                          {savedIds.has(venue.id) ? (
                            <>
                              <BookmarkCheck size={14} />
                              Saved
                            </>
                          ) : (
                            <>
                              <Bookmark size={14} />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleCompare(venue.id)}
                          className={`btn-sm flex-1 flex items-center justify-center gap-1 ${
                            compareIds.includes(venue.id) ? 'btn-primary' : 'btn-secondary'
                          }`}
                        >
                          <Scale size={14} />
                          Compare
                        </button>
                        <Link href={`/dashboard/venues/${venue.id}`} className="flex-1">
                          <button className="btn-secondary btn-sm w-full">Details</button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </DataLoadingState>
        </motion.div>
      </div>

      {/* Floating compare bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 bg-surface border border-white/10 rounded-2xl shadow-2xl"
          >
            <Scale size={16} className="text-primary" />
            <span className="text-text-primary text-sm">
              {compareIds.length} venue{compareIds.length === 1 ? '' : 's'} selected
            </span>
            <button
              onClick={() => setCompareIds([])}
              className="text-text-muted hover:text-text-primary text-sm"
            >
              Clear
            </button>
            <button
              onClick={() => setShowComparison(true)}
              disabled={compareIds.length < 2}
              className="btn-primary btn-sm disabled:opacity-50"
            >
              Compare now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison modal */}
      <AnimatePresence>
        {showComparison && compareVenues.length > 0 && (
          <VenueComparisonModal
            venues={compareVenues}
            onClose={() => setShowComparison(false)}
            onRemove={venueId => toggleCompare(venueId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
