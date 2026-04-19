'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useAppStore } from '../../../store/useAppStore';

// TODO: Implement vendor availability calendar
// TODO: Create vendor inquiry and booking system
// TODO: Add vendor messaging/chat functionality
// TODO: Implement vendor comparison feature

export default function VendorDetailPage() {
  const params = useParams();
  const { setCurrentPage } = useAppStore();
  const vendorId = params.id as string;

  // TODO: Fetch vendor details by ID
  // TODO: Load vendor portfolio images and videos
  // TODO: Get vendor availability and pricing
  // TODO: Fetch vendor reviews and testimonials
  // TODO: Load vendor services and packages

  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add vendor hero section with profile image */}
      <div className="relative h-64 bg-surface">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-text-secondary">TODO: Add vendor hero with profile</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* TODO: Add vendor details section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-8 mb-8"
            >
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center">
                  <span className="text-text-secondary">Logo</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    TODO: Vendor Name - {vendorId}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-semibold">TODO: Rating Stars</span>
                    <span className="text-text-secondary">TODO: Category</span>
                    <span className="text-text-secondary">TODO: Location</span>
                  </div>
                </div>
              </div>
              
              <p className="text-text-secondary mb-6">
                TODO: Add comprehensive vendor description, experience, and unique selling points
              </p>
              
              {/* TODO: Add vendor services */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Services Offered
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-text-secondary">TODO: Service 1</span>
                  <span className="text-text-secondary">TODO: Service 2</span>
                  <span className="text-text-secondary">TODO: Service 3</span>
                  <span className="text-text-secondary">TODO: Service 4</span>
                </div>
              </div>

              {/* TODO: Add vendor about section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  About
                </h3>
                <p className="text-text-secondary">
                  TODO: Add detailed vendor story, experience, and philosophy
                </p>
              </div>
            </motion.div>

            {/* TODO: Add vendor portfolio gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Portfolio
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-32 bg-surface rounded-lg flex items-center justify-center">
                    <span className="text-text-secondary">Portfolio {i}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* TODO: Add vendor packages and pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Packages & Pricing
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-white/10 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-text-primary">Package {i}</h4>
                      <span className="text-primary font-semibold">$X,XXX</span>
                    </div>
                    <p className="text-text-secondary text-sm">
                      TODO: Add package description and inclusions
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* TODO: Add vendor reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Reviews & Testimonials
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-text-primary">Client {i}</span>
                      <span className="text-primary">TODO: Stars</span>
                      <span className="text-text-secondary text-sm">TODO: Date</span>
                    </div>
                    <p className="text-text-secondary">
                      TODO: Add review content and client feedback
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* TODO: Add booking/inquiry form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-6 mb-6 sticky top-24"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Contact Vendor
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-text-secondary mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    placeholder="Your name"
                    // TODO: Add form validation
                  />
                </div>
                <div>
                  <label className="block text-text-secondary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    placeholder="your@email.com"
                    // TODO: Add email validation
                  />
                </div>
                <div>
                  <label className="block text-text-secondary mb-2">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    // TODO: Add date picker
                  />
                </div>
                <div>
                  <label className="block text-text-secondary mb-2">
                    Message
                  </label>
                  <textarea
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    rows={4}
                    placeholder="Tell us about your wedding..."
                    // TODO: Add message validation
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary"
                  // TODO: Implement inquiry submission
                >
                  Send Inquiry
                </button>
              </form>
            </motion.div>

            {/* TODO: Add vendor contact info */}
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
                <p>TODO: Phone Number</p>
                <p>TODO: Email Address</p>
                <p>TODO: Website</p>
                <p>TODO: Social Media Links</p>
              </div>
            </motion.div>

            {/* TODO: Add vendor availability */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Availability
              </h3>
              <div className="text-text-secondary">
                <p>TODO: Add availability calendar</p>
                <p>TODO: Show available dates</p>
                <p>TODO: Display booking status</p>
              </div>
            </motion.div>

            {/* TODO: Add similar vendors */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Similar Vendors
              </h3>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface rounded-lg flex items-center justify-center">
                      <span className="text-text-secondary text-xs">Img {i}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-text-primary">Similar Vendor {i}</h4>
                      <p className="text-text-secondary text-sm">TODO: Brief description</p>
                      <span className="text-primary text-sm">TODO: Price</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* TODO: Add vendor chat/messaging modal */}
      {/* TODO: Implement vendor booking flow */}
      {/* TODO: Add vendor comparison feature */}
    </div>
  );
}
