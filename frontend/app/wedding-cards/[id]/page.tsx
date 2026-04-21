'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useAppStore } from '../../../store/useAppStore';
import { Heart, Camera, Share2, BarChart3, Settings, Download, Mail, MessageSquare, Copy, Users, Check, X, Clock, Upload, Edit, Trash2 } from 'lucide-react';

interface CardData {
  id: string;
  template: number;
  coupleNames: string;
  weddingDetails: string;
  primaryColor: string;
  fontStyle: string;
  photos: string[];
  allowGuestPhotos: boolean;
  requireRSVP: boolean;
  sendReminders: boolean;
}

interface Guest {
  id: number;
  name: string;
  email: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  addedDate: string;
}

interface Analytics {
  views: number;
  rsvps: number;
  confirmed: number;
  declined: number;
  shareableLink: string;
}

export default function WeddingCardDetailPage() {
  const params = useParams();
  const { setCurrentPage } = useAppStore();
  const cardId = params.id as string;

  // Mock card data - ready for API integration
  const [cardData, setCardData] = useState<CardData>({
    id: cardId,
    template: 1,
    coupleNames: 'Sarah & Michael',
    weddingDetails: 'Join us as we celebrate our love and begin our journey together. Your presence is the greatest gift we could ask for.',
    primaryColor: '#8B5CF6',
    fontStyle: 'elegant',
    photos: [],
    allowGuestPhotos: true,
    requireRSVP: true,
    sendReminders: true
  });

  // Mock guest data - ready for API integration
  const [guests, setGuests] = useState<Guest[]>([
    { id: 1, name: 'Emma Johnson', email: 'emma@email.com', rsvpStatus: 'confirmed', addedDate: '2024-01-15' },
    { id: 2, name: 'David Smith', email: 'david@email.com', rsvpStatus: 'pending', addedDate: '2024-01-16' },
    { id: 3, name: 'Lisa Chen', email: 'lisa@email.com', rsvpStatus: 'declined', addedDate: '2024-01-17' }
  ]);

  // Mock analytics data - ready for API integration
  const [analytics] = useState<Analytics>({
    views: 156,
    rsvps: 89,
    confirmed: 67,
    declined: 22,
    shareableLink: `https://wedding-app.com/card/${cardId}`
  });

  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '' });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Editor */}
          <div className="lg:col-span-2">
            {/* TODO: Add card preview and editing interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-8 mb-8"
            >
              <h1 className="text-2xl font-bold text-text-primary mb-6">
                Edit Wedding Card - {cardId}
              </h1>
              
              {/* Card Preview */}
              <div className="mb-8">
                <div className="h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
                  <div className="relative z-10 text-center p-8">
                    <div className="mb-6">
                      <Heart size={48} className="text-purple-500 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ color: cardData.primaryColor }}>
                        {cardData.coupleNames}
                      </h2>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {cardData.weddingDetails}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Customization Options */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Template
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        onClick={() => setCardData({...cardData, template: i})}
                        className={`h-24 bg-surface rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                          cardData.template === i ? 'ring-2 ring-purple-500 bg-purple-500/20' : 'hover:bg-white/10'
                        }`}
                      >
                        <span className="text-sm font-medium">Template {i}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Text Content
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Couple Names"
                      value={cardData.coupleNames}
                      onChange={(e) => setCardData({...cardData, coupleNames: e.target.value})}
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    />
                    <textarea
                      placeholder="Wedding Details"
                      value={cardData.weddingDetails}
                      onChange={(e) => setCardData({...cardData, weddingDetails: e.target.value})}
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-32 bg-surface rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">Upload Photo {i}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Colors & Fonts
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary mb-2">Primary Color</label>
                      <input
                        type="color"
                        value={cardData.primaryColor}
                        onChange={(e) => setCardData({...cardData, primaryColor: e.target.value})}
                        className="w-full h-10 bg-surface border border-white/20 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-2">Font Style</label>
                      <select 
                        value={cardData.fontStyle}
                        onChange={(e) => setCardData({...cardData, fontStyle: e.target.value})}
                        className="w-full p-2 bg-surface border border-white/20 rounded-lg text-text-primary"
                      >
                        <option value="elegant">Elegant</option>
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="playful">Playful</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Guest List Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Guest List
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Manage Guests ({guests.length})
                  </h3>
                  <button 
                    onClick={() => setShowAddGuestModal(true)}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <Users size={16} />
                    Add Guest
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 text-text-primary">Name</th>
                        <th className="text-left p-2 text-text-primary">Email</th>
                        <th className="text-left p-2 text-text-primary">RSVP</th>
                        <th className="text-left p-2 text-text-primary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((guest) => (
                        <tr key={guest.id} className="border-b border-white/10">
                          <td className="p-2 text-text-primary">{guest.name}</td>
                          <td className="p-2 text-text-secondary">{guest.email}</td>
                          <td className="p-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              guest.rsvpStatus === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                              guest.rsvpStatus === 'declined' ? 'bg-red-500/20 text-red-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {guest.rsvpStatus === 'confirmed' && <Check size={12} />}
                              {guest.rsvpStatus === 'declined' && <X size={12} />}
                              {guest.rsvpStatus === 'pending' && <Clock size={12} />}
                              {guest.rsvpStatus}
                            </span>
                          </td>
                          <td className="p-2">
                            <button className="btn-secondary btn-xs flex items-center gap-1">
                              <Edit size={12} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Card Sharing Options */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Share Card
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary mb-2">
                    Shareable Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={analytics.shareableLink}
                      readOnly
                      className="flex-1 p-2 bg-surface border border-white/20 rounded-lg text-text-secondary"
                    />
                    <button className="btn-primary btn-sm flex items-center gap-1">
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-text-secondary mb-2">
                    QR Code
                  </label>
                  <div className="h-32 bg-surface rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-black rounded-lg flex items-center justify-center mb-2">
                        <span className="text-white text-2xl">QR</span>
                      </div>
                      <p className="text-xs text-text-secondary">Scan to view card</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                    <Mail size={16} />
                    Email
                  </button>
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                    <MessageSquare size={16} />
                    SMS
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Card Analytics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Analytics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Views</span>
                  <span className="text-primary font-semibold">{analytics.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">RSVPs</span>
                  <span className="text-primary font-semibold">{analytics.rsvps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Confirmed</span>
                  <span className="text-green-500 font-semibold">{analytics.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Declined</span>
                  <span className="text-red-500 font-semibold">{analytics.declined}</span>
                </div>
              </div>
            </motion.div>

            {/* Card Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Settings
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Allow Guest Photos</span>
                  <input 
                    type="checkbox" 
                    checked={cardData.allowGuestPhotos}
                    onChange={(e) => setCardData({...cardData, allowGuestPhotos: e.target.checked})}
                    className="toggle" 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Require RSVP</span>
                  <input 
                    type="checkbox" 
                    checked={cardData.requireRSVP}
                    onChange={(e) => setCardData({...cardData, requireRSVP: e.target.checked})}
                    className="toggle" 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Send Reminders</span>
                  <input 
                    type="checkbox" 
                    checked={cardData.sendReminders}
                    onChange={(e) => setCardData({...cardData, sendReminders: e.target.checked})}
                    className="toggle" 
                  />
                </div>
              </div>
            </motion.div>

            {/* Export Options */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Export Options
              </h3>
              <div className="space-y-2">
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <Download size={16} />
                  Download as PDF
                </button>
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <Camera size={16} />
                  Print Card
                </button>
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <Users size={16} />
                  Export Guest List
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-text-primary mb-4">Add New Guest</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary mb-2">Name</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                  className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                  placeholder="Enter guest name"
                />
              </div>
              <div>
                <label className="block text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                  className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                  placeholder="Enter guest email"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (newGuest.name && newGuest.email) {
                    setGuests([...guests, {
                      id: Date.now(),
                      name: newGuest.name,
                      email: newGuest.email,
                      rsvpStatus: 'pending',
                      addedDate: new Date().toISOString().split('T')[0]
                    }]);
                    setNewGuest({ name: '', email: '' });
                    setShowAddGuestModal(false);
                  }
                }}
                className="flex-1 btn-primary"
              >
                Add Guest
              </button>
              <button
                onClick={() => {
                  setShowAddGuestModal(false);
                  setNewGuest({ name: '', email: '' });
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
