'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function WeddingCardsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [cardData, setCardData] = useState({
    coupleNames: 'Sarah & John',
    weddingDate: 'June 15, 2024',
    venue: 'Grand Ballroom',
    time: '4:00 PM',
    dressCode: 'Formal Attire',
    rsvpDate: 'May 1, 2024'
  });

  // Mock templates data - ready for API integration
  const templates = [
    {
      id: 1,
      name: 'Classic Elegance',
      preview: '/templates/classic.jpg',
      category: 'Traditional'
    },
    {
      id: 2,
      name: 'Modern Minimal',
      preview: '/templates/modern.jpg',
      category: 'Contemporary'
    },
    {
      id: 3,
      name: 'Romantic Garden',
      preview: '/templates/garden.jpg',
      category: 'Outdoor'
    },
    {
      id: 4,
      name: 'Vintage Charm',
      preview: '/templates/vintage.jpg',
      category: 'Retro'
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
          <h1 className="heading-emotional text-emotional-4xl text-text-primary mb-4">
            <span className="text-glow">Digital Wedding Cards</span>
          </h1>
          <p className="body-emotional text-emotional-xl text-text-muted max-w-3xl mx-auto">
            Create beautiful, shareable wedding invitations for your special day
          </p>
        </motion.div>

        {/* Template Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="heading-emotional text-emotional-2xl text-text-primary mb-6">Choose Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative cursor-pointer rounded-lg overflow-hidden ${
                  selectedTemplate === template.id 
                    ? 'ring-2 ring-primary' 
                    : 'hover:scale-105'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="aspect-square bg-surface flex items-center justify-center">
                  <Heart size={48} className="text-text-muted" />
                </div>
                <div className="p-3">
                  <h3 className="text-text-primary font-medium">{template.name}</h3>
                  <p className="text-text-muted text-sm">{template.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Card Customization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 glass-card p-8"
          >
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Card Preview</h2>
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 text-center">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-text-primary">
                  {cardData.coupleNames}
                </h3>
                <p className="text-lg text-text-muted">are getting married</p>
                <div className="text-xl text-text-primary">
                  {cardData.weddingDate}
                </div>
                <p className="text-text-muted">{cardData.venue}</p>
                <p className="text-text-muted">{cardData.time}</p>
              </div>
            </div>
          </motion.div>

          {/* Customization Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold text-text-primary mb-6">Customize Card</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-text-primary mb-2">Couple Names</label>
                <input
                  type="text"
                  value={cardData.coupleNames}
                  onChange={(e) => setCardData({...cardData, coupleNames: e.target.value})}
                  className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-text-primary mb-2">Wedding Date</label>
                <input
                  type="text"
                  value={cardData.weddingDate}
                  onChange={(e) => setCardData({...cardData, weddingDate: e.target.value})}
                  className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-text-primary mb-2">Venue</label>
                <input
                  type="text"
                  value={cardData.venue}
                  onChange={(e) => setCardData({...cardData, venue: e.target.value})}
                  className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-text-primary mb-2">Time</label>
                <input
                  type="text"
                  value={cardData.time}
                  onChange={(e) => setCardData({...cardData, time: e.target.value})}
                  className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-text-primary mb-2">Dress Code</label>
                <input
                  type="text"
                  value={cardData.dressCode}
                  onChange={(e) => setCardData({...cardData, dressCode: e.target.value})}
                  className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-text-primary mb-2">RSVP Date</label>
                <input
                  type="text"
                  value={cardData.rsvpDate}
                  onChange={(e) => setCardData({...cardData, rsvpDate: e.target.value})}
                  className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button className="flex-1 btn-secondary">
                Save Draft
              </button>
              <button className="flex-1 btn-primary">
                Generate Card
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sharing Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Share Your Card</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'WhatsApp', icon: '💬', color: 'bg-green-500/20 text-green-500' },
              { name: 'Facebook', icon: '📘', color: 'bg-blue-500/20 text-blue-500' },
              { name: 'Twitter', icon: '🐦', color: 'bg-sky-500/20 text-sky-500' },
              { name: 'Instagram', icon: '📷', color: 'bg-pink-500/20 text-pink-500' },
              { name: 'Email', icon: '✉️', color: 'bg-purple-500/20 text-purple-500' },
              { name: 'Copy Link', icon: '🔗', color: 'bg-gray-500/20 text-gray-500' },
              { name: 'Download', icon: '💾', color: 'bg-orange-500/20 text-orange-500' },
              { name: 'More', icon: '⋯', color: 'bg-indigo-500/20 text-indigo-500' }
            ].map((option, index) => (
              <button
                key={option.name}
                className={`p-4 rounded-lg ${option.color} hover:opacity-80 transition-opacity`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <p className="text-sm font-medium">{option.name}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* QR Code Generation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">QR Code for Your Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-surface rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white text-4xl">QR</span>
                  </div>
                  <p className="text-text-muted text-sm">Scan to view invitation</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Download QR Code
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">QR Code Features</h3>
              <ul className="space-y-2 text-text-muted">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Direct link to your wedding invitation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Works with any smartphone camera</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Perfect for physical invitations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Track scan analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Email Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Email Invitations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Send to Guests</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-text-primary mb-2">Recipient Emails</label>
                  <textarea
                    className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                    rows={4}
                    placeholder="Enter email addresses, separated by commas..."
                  />
                </div>
                <div>
                  <label className="block text-text-primary mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                    defaultValue="You're Invited! {cardData.coupleNames} Wedding"
                  />
                </div>
                <div>
                  <label className="block text-text-primary mb-2">Message</label>
                  <textarea
                    className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                    rows={3}
                    defaultValue="We're so excited to celebrate our special day with you!"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Email Preview</h3>
              <div className="bg-surface rounded-lg p-4">
                <div className="border-b border-white/10 pb-3 mb-3">
                  <p className="text-text-primary font-medium">Subject: You're Invited! {cardData.coupleNames} Wedding</p>
                </div>
                <div className="space-y-2">
                  <p className="text-text-muted">Dear Guest,</p>
                  <p className="text-text-muted">We're so excited to celebrate our special day with you!</p>
                  <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg p-4 text-center">
                    <p className="text-text-primary font-semibold">{cardData.coupleNames}</p>
                    <p className="text-text-muted">{cardData.weddingDate}</p>
                    <p className="text-text-muted">{cardData.venue}</p>
                  </div>
                  <p className="text-text-muted">View the full invitation and RSVP details.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="flex-1 btn-secondary">Save as Draft</button>
            <button className="flex-1 btn-primary">Send Emails</button>
          </div>
        </motion.div>

        {/* Print Functionality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Print Your Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-surface rounded-lg">
              <h3 className="text-text-primary font-medium mb-3">Standard Print</h3>
              <div className="space-y-2 mb-4">
                <p className="text-text-muted text-sm">• 5" x 7" card size</p>
                <p className="text-text-muted text-sm">• Premium cardstock</p>
                <p className="text-text-muted text-sm">• Full color printing</p>
                <p className="text-text-muted text-sm">• Envelopes included</p>
              </div>
              <div className="text-lg font-semibold text-primary mb-2">$2.50 per card</div>
              <button className="w-full btn-secondary">Order Standard</button>
            </div>
            <div className="p-4 bg-surface rounded-lg">
              <h3 className="text-text-primary font-medium mb-3">Premium Print</h3>
              <div className="space-y-2 mb-4">
                <p className="text-text-muted text-sm">• 6" x 8" card size</p>
                <p className="text-text-muted text-sm">• Luxury cardstock</p>
                <p className="text-text-muted text-sm">• Metallic accents</p>
                <p className="text-text-muted text-sm">• Matching envelopes</p>
              </div>
              <div className="text-lg font-semibold text-primary mb-2">$4.99 per card</div>
              <button className="w-full btn-secondary">Order Premium</button>
            </div>
            <div className="p-4 bg-surface rounded-lg">
              <h3 className="text-text-primary font-medium mb-3">DIY Print</h3>
              <div className="space-y-2 mb-4">
                <p className="text-text-muted text-sm">• High-res PDF download</p>
                <p className="text-text-muted text-sm">• Print at home</p>
                <p className="text-text-muted text-sm">• Multiple formats</p>
                <p className="text-text-muted text-sm">• Print unlimited</p>
              </div>
              <div className="text-lg font-semibold text-primary mb-2">$9.99 one-time</div>
              <button className="w-full btn-primary">Download PDF</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
