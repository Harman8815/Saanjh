'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Icons as simple SVG components
const IconMapPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconStar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const IconHeart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const IconShare = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>
  </svg>
);

// Venue data type
interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  text: string;
}

interface Contact {
  phone: string;
  email: string;
  website: string;
}

interface Venue {
  id: number;
  name: string;
  type: string;
  capacity: number;
  price: number;
  location: string;
  address: string;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  description: string;
  features: string[];
  contact: Contact;
  available: boolean;
  reviews: Review[];
}

interface VenueDetailClientProps {
  venue: Venue;
}

export default function VenueDetailClient({ venue }: VenueDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <Link 
          href="/dashboard/venues" 
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
        >
          <IconArrowLeft />
          <span>Back to Venues</span>
        </Link>
      </div>

      {/* Hero Gallery */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Main Image */}
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-4">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={venue.images[selectedImage]}
                alt={`${venue.name} - Image ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Venue Name Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-3">
                {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{venue.name}</h1>
              <div className="flex items-center gap-2 text-white/80">
                <IconMapPin />
                <span>{venue.location}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full backdrop-blur-md transition-all ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <IconHeart />
              </button>
              <button className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all">
                <IconShare />
              </button>
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {venue.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all ${
                  selectedImage === idx ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Quick Stats */}
            <div className="glass-card p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                    <IconStar />
                    <span className="font-bold text-lg text-text-primary">{venue.rating}</span>
                  </div>
                  <p className="text-text-muted text-sm">{venue.reviewCount} reviews</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <IconUsers />
                    <span className="font-bold text-lg text-text-primary">{venue.capacity}</span>
                  </div>
                  <p className="text-text-muted text-sm">Guest capacity</p>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-text-primary mb-1">
                    ${venue.price.toLocaleString()}
                  </div>
                  <p className="text-text-muted text-sm">Per event</p>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    venue.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${venue.available ? 'bg-green-400' : 'bg-red-400'}`} />
                    {venue.available ? 'Available' : 'Booked'}
                  </div>
                  <p className="text-text-muted text-sm mt-1">Status</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4">About This Venue</h2>
              <p className="text-text-secondary leading-relaxed mb-6">{venue.description}</p>
              
              <h3 className="text-lg font-semibold text-text-primary mb-3">Key Features</h3>
              <div className="flex flex-wrap gap-2">
                {venue.features.map((feature, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-surface border border-white/10 rounded-full text-sm text-text-secondary"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-text-secondary">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <IconCheck />
                    </div>
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Reviews</h2>
              <div className="space-y-4">
                {venue.reviews.map((review) => (
                  <div key={review.id} className="border-b border-white/10 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-text-primary">{review.name}</span>
                      <span className="text-text-muted text-sm">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <IconStar key={i} />
                      ))}
                    </div>
                    <p className="text-text-secondary text-sm">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Booking & Contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Booking Card */}
            <div className="glass-card p-6 sticky top-6">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-primary">${venue.price.toLocaleString()}</span>
                <span className="text-text-muted"> / event</span>
              </div>
              
              <button 
                onClick={() => setShowBookingModal(true)}
                disabled={!venue.available}
                className={`w-full btn-primary mb-4 ${!venue.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {venue.available ? 'Book Now' : 'Currently Unavailable'}
              </button>
              
              <button className="w-full btn-secondary">
                Request Information
              </button>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <h3 className="font-semibold text-text-primary mb-3">Contact Venue</h3>
                <a href={`tel:${venue.contact.phone}`} className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors">
                  <IconPhone />
                  <span className="text-sm">{venue.contact.phone}</span>
                </a>
                <a href={`mailto:${venue.contact.email}`} className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors">
                  <IconMail />
                  <span className="text-sm">{venue.contact.email}</span>
                </a>
                <a href={`https://${venue.contact.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors">
                  <IconGlobe />
                  <span className="text-sm">{venue.contact.website}</span>
                </a>
              </div>

              {/* Location */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="font-semibold text-text-primary mb-3">Location</h3>
                <p className="text-text-secondary text-sm mb-3">{venue.address}</p>
                <div className="h-32 bg-surface rounded-lg flex items-center justify-center text-text-muted">
                  <span className="text-sm">Map View</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-4">Book {venue.name}</h2>
            <p className="text-text-muted mb-6">
              Ready to secure your date? Fill out the form below and we will contact you shortly.
            </p>
            <div className="space-y-4">
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-xl text-text-primary focus:outline-none focus:border-primary"
                placeholder="Preferred Date"
              />
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-xl text-text-primary focus:outline-none focus:border-primary"
                placeholder="Your Name"
              />
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-xl text-text-primary focus:outline-none focus:border-primary"
                placeholder="Email Address"
              />
              <input 
                type="tel" 
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-xl text-text-primary focus:outline-none focus:border-primary"
                placeholder="Phone Number"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowBookingModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="flex-1 btn-primary"
              >
                Submit Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
