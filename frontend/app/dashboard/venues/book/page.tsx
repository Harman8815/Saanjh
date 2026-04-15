'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function VenueBookingPage() {
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  const [budget, setBudget] = useState(5000);

  // TODO: Fetch venues from API
  const venues = [
    {
      id: 1,
      name: 'Grand Ballroom',
      capacity: 200,
      price: 3000,
      image: '/venues/ballroom.jpg',
      features: ['Dance Floor', 'Catering Kitchen', 'Parking', 'AV Equipment'],
      availability: 'Available'
    },
    {
      id: 2,
      name: 'Garden Pavilion',
      capacity: 150,
      price: 2000,
      image: '/venues/garden.jpg',
      features: ['Outdoor Setting', 'Garden Views', 'Tent Coverage', 'Restrooms'],
      availability: 'Limited'
    },
    {
      id: 3,
      name: 'Beach Resort',
      capacity: 100,
      price: 4000,
      image: '/venues/beach.jpg',
      features: ['Ocean View', 'Beach Access', 'Resort Amenities', 'Catering'],
      availability: 'Available'
    }
  ];

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
            <span className="text-glow">Book Your Perfect Venue</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Find and book the ideal venue for your special day
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-text-primary mb-2">Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Guest Count</label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Budget Range</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Availability</label>
              <select className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary">
                <option value="">All Venues</option>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Venue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              className="glass-card p-6 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedVenue(venue)}
            >
              {/* Venue Image */}
              <div className="w-full h-48 bg-surface rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl text-text-muted">🏪</span>
              </div>

              {/* Venue Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-text-primary">{venue.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    venue.availability === 'Available' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {venue.availability}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted">Capacity:</span>
                    <span className="text-text-primary ml-2">{venue.capacity} guests</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Price:</span>
                    <span className="text-primary ml-2">${venue.price}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-text-primary font-medium mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button className="flex-1 btn-secondary">
                  View Details
                </button>
                <button className="flex-1 btn-primary">
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TODO: Add pagination */}
        {/* TODO: Add sorting options */}
        {/* TODO: Add venue comparison */}
        {/* TODO: Add booking calendar integration */}
        {/* TODO: Add saved venues section */}
      </div>
    </div>
  );
}
