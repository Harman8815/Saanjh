'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useAppStore } from '../../../store/useAppStore';

// TODO: Create detailed venue page with image gallery
// TODO: Add venue availability calendar
// TODO: Implement booking form with date selection
// TODO: Add venue reviews and ratings
// TODO: Create venue comparison feature
// TODO: Add venue contact and inquiry system
// TODO: Implement virtual tour integration
// TODO: Add venue package options and pricing

export default function VenueDetailPage() {
  const params = useParams();
  const { setCurrentPage } = useAppStore();
  const venueId = params.id as string;

  // TODO: Fetch venue details by ID
  // TODO: Load venue images and gallery
  // TODO: Get venue availability data
  // TODO: Fetch venue reviews and ratings

  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add venue hero section with image gallery */}
      <div className="relative h-96 bg-surface">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-text-secondary">TODO: Add venue hero gallery</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* TODO: Add venue details section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-8 mb-8"
            >
              <h1 className="text-3xl font-bold text-text-primary mb-4">
                TODO: Venue Name - {venueId}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-primary font-semibold">$$$$</span>
                <span className="text-text-secondary">TODO: Rating</span>
                <span className="text-text-secondary">TODO: Capacity</span>
              </div>
              <p className="text-text-secondary mb-6">
                TODO: Add detailed venue description, amenities, and features
              </p>
              
              {/* TODO: Add venue features and amenities */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-text-secondary">TODO: Amenity 1</span>
                  <span className="text-text-secondary">TODO: Amenity 2</span>
                  <span className="text-text-secondary">TODO: Amenity 3</span>
                  <span className="text-text-secondary">TODO: Amenity 4</span>
                </div>
              </div>

              {/* TODO: Add venue description and details */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  About This Venue
                </h3>
                <p className="text-text-secondary">
                  TODO: Add comprehensive venue description, history, and unique features
                </p>
              </div>
            </motion.div>

            {/* TODO: Add venue gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Gallery
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-surface rounded-lg flex items-center justify-center">
                    <span className="text-text-secondary">Gallery Image {i}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* TODO: Add venue reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Reviews
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-text-primary">User {i}</span>
                      <span className="text-primary">TODO: Stars</span>
                    </div>
                    <p className="text-text-secondary">
                      TODO: Add review content and rating system
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* TODO: Add booking form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-6 mb-6 sticky top-24"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Book This Venue
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-text-secondary mb-2">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    // TODO: Add date picker with availability checking
                  />
                </div>
                <div>
                  <label className="block text-text-secondary mb-2">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    placeholder="Number of guests"
                    // TODO: Add guest count validation
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary"
                  // TODO: Implement booking submission
                >
                  Check Availability
                </button>
              </form>
            </motion.div>

            {/* TODO: Add venue contact info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Contact Information
              </h3>
              <div className="space-y-2 text-text-secondary">
                <p>TODO: Venue Address</p>
                <p>TODO: Phone Number</p>
                <p>TODO: Email Address</p>
                <p>TODO: Website</p>
              </div>
            </motion.div>

            {/* TODO: Add similar venues */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Similar Venues
              </h3>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface rounded-lg flex items-center justify-center">
                      <span className="text-text-secondary text-xs">Img {i}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-text-primary">Similar Venue {i}</h4>
                      <p className="text-text-secondary text-sm">TODO: Brief description</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* TODO: Add venue inquiry modal */}
      {/* TODO: Implement virtual tour modal */}
      {/* TODO: Add venue comparison feature */}
    </div>
  );
}
