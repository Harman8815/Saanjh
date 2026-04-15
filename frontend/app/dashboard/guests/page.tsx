'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RSVPManagementPage() {
  const [selectedTab, setSelectedTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Fetch guests from API
  const guests = [
    {
      id: 1,
      name: 'Emily Johnson',
      email: 'emily@email.com',
      phone: '+1-555-0123',
      rsvpStatus: 'confirmed',
      mealPreference: 'vegetarian',
      plusOne: true
    },
    {
      id: 2,
      name: 'Michael Smith',
      email: 'michael@email.com',
      phone: '+1-555-0456',
      rsvpStatus: 'pending',
      mealPreference: 'none',
      plusOne: false
    },
    {
      id: 3,
      name: 'Jessica Davis',
      email: 'jessica@email.com',
      phone: '+1-555-0789',
      rsvpStatus: 'declined',
      mealPreference: 'gluten-free',
      plusOne: false
    }
  ];

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length
  };

  const filteredGuests = guests.filter((guest: any) => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span className="text-glow">RSVP Management</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Track and manage your wedding guest responses
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Guests', value: stats.total, icon: '👥', color: 'primary' },
            { label: 'Confirmed', value: stats.confirmed, icon: '✅', color: 'green' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: 'yellow' },
            { label: 'Declined', value: stats.declined, icon: '❌', color: 'red' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-3xl font-bold text-${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-text-muted text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass-card p-2 mb-8"
        >
          <div className="flex gap-4">
            {['list', 'seating', 'meals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedTab === tab
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guests by name or email..."
            className="w-full px-6 py-4 bg-surface border border-white/20 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
          />
        </motion.div>

        {/* Guest List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="glass-card p-8"
        >
          <div className="space-y-4">
            {filteredGuests.map((guest, index) => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {guest.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-text-primary font-medium">{guest.name}</h4>
                    <p className="text-text-muted text-sm">{guest.email}</p>
                    <p className="text-text-muted text-sm">{guest.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    guest.rsvpStatus === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    guest.rsvpStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                  </span>
                  {guest.mealPreference && (
                    <span className="px-3 py-1 bg-surface border border-white/20 rounded-full text-xs text-text-muted">
                      {guest.mealPreference}
                    </span>
                  )}
                  {guest.plusOne && (
                    <span className="px-3 py-1 bg-gold text-white rounded-full text-xs">
                      +1
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* TODO: Add pagination */}
        {/* TODO: Add export functionality */}
        {/* TODO: Add seating chart integration */}
        {/* TODO: Add meal preference management */}
      </div>
    </div>
  );
}
