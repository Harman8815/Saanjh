'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { Plus, Heart, Camera, Share2, BarChart3, Download, Edit, Eye, Users, Clock, Check, X, Star } from 'lucide-react';
import Link from 'next/link';

interface CardTemplate {
  id: number;
  name: string;
  category: string;
  preview: string;
  features: string[];
  popularity: number;
}

interface SavedCard {
  id: string;
  name: string;
  template: number;
  coupleNames: string;
  weddingDate: string;
  status: 'draft' | 'sent' | 'completed';
  views: number;
  rsvps: number;
  confirmed: number;
  createdDate: string;
  shareableLink: string;
}

export default function WeddingCardsPage() {
  const { setCurrentPage } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock card templates data - ready for API integration
  const cardTemplates: CardTemplate[] = [
    { 
      id: 1, 
      name: 'Classic Romance', 
      category: 'Traditional',
      preview: 'classic-romance',
      features: ['Elegant Design', 'Gold Accents', 'Traditional Fonts'],
      popularity: 95
    },
    { 
      id: 2, 
      name: 'Modern Minimal', 
      category: 'Contemporary',
      preview: 'modern-minimal',
      features: ['Clean Lines', 'Minimal Design', 'Modern Fonts'],
      popularity: 88
    },
    { 
      id: 3, 
      name: 'Garden Party', 
      category: 'Outdoor',
      preview: 'garden-party',
      features: ['Floral Elements', 'Nature Theme', 'Soft Colors'],
      popularity: 92
    },
    { 
      id: 4, 
      name: 'Beach Sunset', 
      category: 'Destination',
      preview: 'beach-sunset',
      features: ['Ocean Theme', 'Sunset Colors', 'Tropical Elements'],
      popularity: 85
    },
    { 
      id: 5, 
      name: 'Vintage Elegance', 
      category: 'Vintage',
      preview: 'vintage-elegance',
      features: ['Ornate Design', 'Classic Fonts', 'Antique Style'],
      popularity: 90
    },
    { 
      id: 6, 
      name: 'Floral Dreams', 
      category: 'Romantic',
      preview: 'floral-dreams',
      features: ['Floral Patterns', 'Soft Colors', 'Romantic Fonts'],
      popularity: 87
    },
  ];

  // Mock saved cards data - ready for API integration
  const savedCards: SavedCard[] = [
    {
      id: 'card-1',
      name: 'Main Wedding Invitation',
      template: 1,
      coupleNames: 'Sarah & Michael',
      weddingDate: '2024-06-15',
      status: 'sent',
      views: 156,
      rsvps: 89,
      confirmed: 67,
      createdDate: '2024-01-15',
      shareableLink: 'https://wedding-app.com/card/sarah-michael'
    },
    {
      id: 'card-2',
      name: 'Rehearsal Dinner',
      template: 3,
      coupleNames: 'Sarah & Michael',
      weddingDate: '2024-06-14',
      status: 'draft',
      views: 0,
      rsvps: 0,
      confirmed: 0,
      createdDate: '2024-01-20',
      shareableLink: 'https://wedding-app.com/card/rehearsal-dinner'
    },
    {
      id: 'card-3',
      name: 'Save the Date',
      template: 2,
      coupleNames: 'Sarah & Michael',
      weddingDate: '2024-06-15',
      status: 'completed',
      views: 234,
      rsvps: 156,
      confirmed: 134,
      createdDate: '2024-01-10',
      shareableLink: 'https://wedding-app.com/card/save-the-date'
    }
  ];

  const categories = ['all', 'Traditional', 'Contemporary', 'Outdoor', 'Destination', 'Vintage', 'Romantic'];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? cardTemplates 
    : cardTemplates.filter(t => t.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/20 text-yellow-500';
      case 'sent': return 'bg-blue-500/20 text-blue-500';
      case 'completed': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit size={16} />;
      case 'sent': return <Share2 size={16} />;
      case 'completed': return <Check size={16} />;
      default: return null;
    }
  };

  
  return (
    <div className="min-h-screen bg-background">
      {/* Wedding Cards Header with Creation Options */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Digital Wedding Cards
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Create beautiful, shareable digital wedding invitations
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Create New Card
          </button>
        </motion.div>

        {/* Card Creation Options */}
        <div className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Choose Template
                </h3>
                <p className="text-text-secondary">
                  Select from our beautiful collection of professionally designed card templates
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Customize
                </h3>
                <p className="text-text-secondary">
                  Personalize with your photos, text, colors, and unique design preferences
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Share & Track
                </h3>
                <p className="text-text-secondary">
                  Share with guests via email, SMS, or social media and track RSVPs in real-time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Template Gallery */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              Choose a Template
            </h2>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-white/20 text-text-primary hover:bg-white/5'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="glass-card p-6 hover:transform hover:scale-105 transition-transform">
                <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
                  <div className="relative z-10 text-center">
                    <Heart size={32} className="text-purple-500 mx-auto mb-2" />
                    <span className="text-lg font-semibold text-gray-800">{template.name}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full">
                      <Star size={12} className="text-yellow-500" />
                      <span className="text-xs font-medium">{template.popularity}%</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {template.name}
                </h3>
                <p className="text-text-secondary mb-4">
                  {template.category}
                </p>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href={`/wedding-cards/new?template=${template.id}`}>
                  <button className="btn-primary w-full">
                    Use This Template
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* User's Saved Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Your Wedding Cards ({savedCards.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedCards.map((card) => (
              <div key={card.id} className="glass-card p-6">
                <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
                  <div className="relative z-10 text-center p-4">
                    <Heart size={32} className="text-purple-500 mx-auto mb-2" />
                    <h4 className="text-lg font-semibold text-gray-800">{card.coupleNames}</h4>
                    <p className="text-sm text-gray-600">{card.weddingDate}</p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(card.status)}`}>
                      {getStatusIcon(card.status)}
                      {card.status}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {card.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Views</span>
                    <span className="text-text-primary font-medium">{card.views}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">RSVPs</span>
                    <span className="text-text-primary font-medium">{card.rsvps}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Confirmed</span>
                    <span className="text-green-500 font-medium">{card.confirmed}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/wedding-cards/${card.id}`} className="flex-1">
                    <button className="btn-secondary w-full flex items-center justify-center gap-1">
                      <Eye size={16} />
                      View
                    </button>
                  </Link>
                  <Link href={`/wedding-cards/${card.id}`} className="flex-1">
                    <button className="btn-primary w-full flex items-center justify-center gap-1">
                      <Edit size={16} />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Features and Benefits */}
        <div className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Features & Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Shareable Links</h3>
                <p className="text-text-secondary">
                  Unique, customizable links for each invitation with QR code generation
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">RSVP Tracking</h3>
                <p className="text-text-secondary">
                  Real-time guest response tracking with automatic reminders and follow-ups
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Photo Upload</h3>
                <p className="text-text-secondary">
                  Add your personal photos with easy upload and image editing tools
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Analytics</h3>
                <p className="text-text-secondary">
                  Track engagement, views, and RSVP rates with detailed analytics dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Create New Wedding Card</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-text-primary mb-3 font-medium">Choose Template</label>
                <div className="grid grid-cols-2 gap-4">
                  {cardTemplates.slice(0, 4).map((template) => (
                    <div key={template.id} className="border border-white/20 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                      <div className="h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded mb-2 flex items-center justify-center">
                        <Heart size={24} className="text-purple-500" />
                      </div>
                      <h4 className="font-medium text-text-primary">{template.name}</h4>
                      <p className="text-sm text-text-secondary">{template.category}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-text-primary mb-3 font-medium">Card Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border border-white/20 rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-medium text-text-primary">Main Invitation</h4>
                    <p className="text-sm text-text-secondary">Primary wedding invitation</p>
                  </button>
                  <button className="p-4 border border-white/20 rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-medium text-text-primary">Save the Date</h4>
                    <p className="text-sm text-text-secondary">Early announcement card</p>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Link href="/wedding-cards/new" className="flex-1">
                <button className="btn-primary w-full">Start Creating</button>
              </Link>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
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
