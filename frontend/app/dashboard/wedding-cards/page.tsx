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

  // TODO: Fetch templates from API
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

        {/* TODO: Add sharing options */}
        {/* TODO: Add QR code generation */}
        {/* TODO: Add email integration */}
        {/* TODO: Add print functionality */}
      </div>
    </div>
  );
}
