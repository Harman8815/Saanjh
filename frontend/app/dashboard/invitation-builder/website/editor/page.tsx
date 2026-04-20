'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Save, Type, Calendar, MapPin, Users, Image, Music, Heart, Star } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// Hardcoded data structures for website invitations
const websiteData = {
  couple: {
    brideName: 'Sarah Johnson',
    groomName: 'Michael Smith',
    brideBio: 'A passionate artist with a love for adventure',
    groomBio: 'A dedicated engineer with a heart of gold',
    story: 'We met during a summer festival and knew instantly that we were meant to be together'
  },
  event: {
    weddingDate: '2025-06-15',
    ceremonyTime: '4:00 PM',
    receptionTime: '6:00 PM',
    venue: 'Grand Garden Estate',
    address: '123 Garden Lane, Beverly Hills, CA 90210',
    dressCode: 'Formal Attire',
    rsvpDeadline: '2025-05-15'
  },
  gallery: {
    photos: [
      '/photos/engagement-1.jpg',
      '/photos/engagement-2.jpg',
      '/photos/couple-1.jpg',
      '/photos/couple-2.jpg'
    ]
  },
  registry: {
    items: [
      { name: 'Kitchen Appliances', store: 'Williams Sonoma', link: '#' },
      { name: 'Home Decor', store: 'Pottery Barn', link: '#' },
      { name: 'Honeymoon Fund', store: 'Honeyfund', link: '#' }
    ]
  }
};

const websiteTemplates = {
  'elegant-website': {
    name: 'Elegant Website',
    colors: ['purple', 'pink', 'gold'],
    style: 'classic'
  },
  'modern-website': {
    name: 'Modern Website',
    colors: ['blue', 'cyan', 'white'],
    style: 'contemporary'
  }
};

export default function WebsiteInvitationEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') || 'elegant-website';
  
  const [activeSection, setActiveSection] = useState('couple');
  const [formData, setFormData] = useState(websiteData);
  const [selectedTemplate, setSelectedTemplate] = useState(templateId);

  const template = websiteTemplates[selectedTemplate as keyof typeof websiteTemplates];

  const handleDataChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const renderWebsitePreview = () => {
    const colors = template.colors;
    const baseColor = colors[0];
    
    if (selectedTemplate === 'elegant-website') {
      return (
        <div className="h-full bg-gradient-to-b from-purple-50 to-white overflow-y-auto">
          {/* Hero Section */}
          <div className="relative h-96 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
            <div className="text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <Heart className="w-16 h-16 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-5xl font-serif mb-4">{formData.couple.brideName}</h1>
              <div className="text-3xl mb-4">&</div>
              <h1 className="text-5xl font-serif mb-6">{formData.couple.groomName}</h1>
              <div className="w-32 h-1 bg-white mx-auto"></div>
            </div>
          </div>

          {/* Story Section */}
          <div className="p-8 text-center">
            <h2 className="text-3xl font-serif text-purple-800 mb-6">Our Love Story</h2>
            <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">{formData.couple.story}</p>
          </div>

          {/* Event Details */}
          <div className="p-8 bg-purple-50">
            <h2 className="text-3xl font-serif text-purple-800 mb-6 text-center">Event Details</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-lg font-medium">{formData.event.weddingDate}</p>
              </div>
              <div className="text-center">
                <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-lg font-medium">{formData.event.venue}</p>
                <p className="text-gray-600">{formData.event.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Ceremony</p>
                  <p className="font-medium">{formData.event.ceremonyTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reception</p>
                  <p className="font-medium">{formData.event.receptionTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="p-8">
            <h2 className="text-3xl font-serif text-purple-800 mb-6 text-center">Gallery</h2>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {formData.gallery.photos.map((photo, index) => (
                <div key={index} className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
                  <Image className="w-12 h-12 text-purple-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      // Modern Website Template
      return (
        <div className="h-full bg-gray-900 text-white overflow-y-auto">
          {/* Hero Section */}
          <div className="relative h-96 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <Star className="w-16 h-16 mx-auto" />
              </motion.div>
              <h1 className="text-5xl font-bold mb-4">{formData.couple.brideName}</h1>
              <div className="text-3xl mb-4">+</div>
              <h1 className="text-5xl font-bold mb-6">{formData.couple.groomName}</h1>
              <div className="w-32 h-1 bg-white mx-auto"></div>
            </div>
          </div>

          {/* Story Section */}
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">{formData.couple.story}</p>
          </div>

          {/* Event Details */}
          <div className="p-8 bg-gray-800">
            <h2 className="text-3xl font-bold mb-6 text-center">Event Details</h2>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-medium">{formData.event.weddingDate}</p>
              </div>
              <div className="text-center">
                <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-medium">{formData.event.venue}</p>
                <p className="text-gray-400">{formData.event.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Ceremony</p>
                  <p className="font-medium">{formData.event.ceremonyTime}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Reception</p>
                  <p className="font-medium">{formData.event.receptionTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Gallery</h2>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {formData.gallery.photos.map((photo, index) => (
                <div key={index} className="aspect-square bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Image className="w-12 h-12 text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  const sections = [
    { id: 'couple', name: 'Couple Info', icon: Heart },
    { id: 'event', name: 'Event Details', icon: Calendar },
    { id: 'gallery', name: 'Gallery', icon: Image },
    { id: 'registry', name: 'Registry', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Website Editor</h1>
                <p className="text-sm text-gray-600">Customize your {template.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/invitation-preview/website')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {/* Left Panel - Data Editor */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Section Navigation */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      activeSection === section.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{section.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Section Content */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {activeSection === 'couple' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Couple Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bride Name</label>
                      <input
                        type="text"
                        value={formData.couple.brideName}
                        onChange={(e) => handleDataChange('couple', 'brideName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Groom Name</label>
                      <input
                        type="text"
                        value={formData.couple.groomName}
                        onChange={(e) => handleDataChange('couple', 'groomName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Love Story</label>
                      <textarea
                        value={formData.couple.story}
                        onChange={(e) => handleDataChange('couple', 'story', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'event' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Date</label>
                      <input
                        type="text"
                        value={formData.event.weddingDate}
                        onChange={(e) => handleDataChange('event', 'weddingDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                      <input
                        type="text"
                        value={formData.event.venue}
                        onChange={(e) => handleDataChange('event', 'venue', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={formData.event.address}
                        onChange={(e) => handleDataChange('event', 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ceremony Time</label>
                        <input
                          type="text"
                          value={formData.event.ceremonyTime}
                          onChange={(e) => handleDataChange('event', 'ceremonyTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reception Time</label>
                        <input
                          type="text"
                          value={formData.event.receptionTime}
                          onChange={(e) => handleDataChange('event', 'receptionTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'gallery' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo Gallery</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Upload your engagement photos and couple pictures</p>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.gallery.photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      ))}
                    </div>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Add Photos
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'registry' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Registry</h3>
                  <div className="space-y-4">
                    {formData.registry.items.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...formData.registry.items];
                            newItems[index].name = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              registry: { items: newItems }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                          placeholder="Item name"
                        />
                        <input
                          type="text"
                          value={item.store}
                          onChange={(e) => {
                            const newItems = [...formData.registry.items];
                            newItems[index].store = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              registry: { items: newItems }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Store name"
                        />
                      </div>
                    ))}
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Add Registry Item
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gray-100 p-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-2xl"
            style={{ height: '800px' }}
          >
            {renderWebsitePreview()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
