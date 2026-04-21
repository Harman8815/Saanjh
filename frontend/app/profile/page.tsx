'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useDateFormat } from '../../hooks/useDateFormat';

// TODO: Create user profile management page
// TODO: Add personal information editing
// TODO: Implement wedding details management
// TODO: Add partner information management
// TODO: Create account settings and preferences
// TODO: Add subscription management
// TODO: Implement privacy settings
// TODO: Add notification preferences
// TODO: Create account deletion option

export default function ProfilePage() {
  const { user, wedding, setCurrentPage } = useAppStore();
  const { formatDateForDisplay, formatDateForInput } = useDateFormat();

  // TODO: Fetch user profile data
  // TODO: Load wedding details
  // TODO: Get subscription information
  // TODO: Load user preferences and settings

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Profile Settings
          </h1>
          <p className="text-text-secondary">
            Manage your account and wedding information
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* TODO: Add personal information section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Personal Information
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-text-secondary mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name || 'TODO: First Name'}
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      // TODO: Add form validation and update
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="TODO: Last Name"
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      // TODO: Add form validation and update
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-text-secondary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'TODO: email@example.com'}
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    // TODO: Add email validation and update
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="TODO: Phone Number"
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    // TODO: Add phone validation and update
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button type="button" className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>

            {/* TODO: Add wedding details section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Wedding Details
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-text-secondary mb-2">
                    Couple Names
                  </label>
                  <input
                    type="text"
                    defaultValue={wedding?.brideName && wedding?.groomName ? `${wedding.brideName} & ${wedding.groomName}` : 'TODO: Couple Names'}
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    placeholder="Partner 1 & Partner 2"
                    // TODO: Add form validation and update
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Wedding Date
                    </label>
                    <input
                      type="date"
                      defaultValue={wedding?.weddingDate || ''}
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      // TODO: Add date validation and update
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Expected Guest Count
                    </label>
                    <input
                      type="number"
                      defaultValue={wedding?.guestCount || ''}
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      placeholder="Number of guests"
                      // TODO: Add number validation and update
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary mb-2">
                    Wedding Venue
                  </label>
                  <input
                    type="text"
                    defaultValue={wedding?.venue || ''}
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    placeholder="Venue name and location"
                    // TODO: Add venue validation and update
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-2">
                    Budget
                  </label>
                  <input
                    type="number"
                    defaultValue={wedding?.budget || ''}
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    placeholder="Total wedding budget"
                    // TODO: Add budget validation and update
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    Save Wedding Details
                  </button>
                  <button type="button" className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>

            {/* TODO: Add partner information section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Partner Information
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Partner First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="TODO: Partner First Name"
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      // TODO: Add form validation and update
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Partner Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="TODO: Partner Last Name"
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      // TODO: Add form validation and update
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary mb-2">
                    Partner Email
                  </label>
                  <input
                    type="email"
                    defaultValue="TODO: partner@example.com"
                    className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    // TODO: Add email validation and update
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-2">
                    Partner Phone
                  </label>
                    <input
                      type="tel"
                      defaultValue="TODO: Partner Phone"
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      // TODO: Add phone validation and update
                    />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    Save Partner Info
                  </button>
                  <button type="button" className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* TODO: Add account settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Account Settings
              </h3>
              <div className="space-y-4">
                <button className="w-full btn-secondary text-left">
                  Change Password
                </button>
                <button className="w-full btn-secondary text-left">
                  Two-Factor Authentication
                </button>
                <button className="w-full btn-secondary text-left">
                  Login History
                </button>
                <button className="w-full btn-secondary text-left">
                  Connected Accounts
                </button>
              </div>
            </motion.div>

            {/* TODO: Add subscription management */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Subscription
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {user?.subscriptionTier || 'Free Plan'}
                  </div>
                  <p className="text-text-secondary mb-4">
                    TODO: Subscription details and benefits
                  </p>
                  <button className="btn-primary w-full">
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </motion.div>

            {/* TODO: Add notification preferences */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Email Notifications</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">SMS Notifications</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Push Notifications</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Marketing Emails</span>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </motion.div>

            {/* TODO: Add privacy settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Privacy
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Public Profile</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Share with Vendors</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Analytics Tracking</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
              </div>
            </motion.div>

            {/* TODO: Add account actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Account Actions
              </h3>
              <div className="space-y-4">
                <button className="w-full btn-secondary">
                  Export Data
                </button>
                <button className="w-full btn-secondary">
                  Download Wedding Info
                </button>
                <button className="w-full btn-secondary text-red-500 hover:bg-red-500/10">
                  Deactivate Account
                </button>
                <button className="w-full btn-secondary text-red-500 hover:bg-red-500/10">
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* TODO: Add password change modal */}
      {/* TODO: Implement 2FA setup */}
      {/* TODO: Add data export functionality */}
      {/* TODO: Create account deactivation flow */}
    </div>
  );
}
