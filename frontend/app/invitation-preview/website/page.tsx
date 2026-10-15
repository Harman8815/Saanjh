'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, RotateCw, Heart, Star, Calendar, MapPin, Image } from 'lucide-react';

// Hardcoded data for website invitation preview
const websiteData = {
  couple: {
    brideName: 'Sarah Johnson',
    groomName: 'Michael Smith',
    brideBio: 'A passionate artist with a love for adventure',
    groomBio: 'A dedicated engineer with a heart of gold',
    story: 'We met during a summer festival and knew instantly that we were meant to be together. After months of dating, long walks on the beach, and countless adventures, we knew we wanted to spend forever together.'
  },
  event: {
    weddingDate: 'June 15, 2025',
    ceremonyTime: '4:00 PM',
    receptionTime: '6:00 PM',
    venue: 'Grand Garden Estate',
    address: '123 Garden Lane, Beverly Hills, CA 90210',
    dressCode: 'Formal Attire',
    rsvpDeadline: 'May 15, 2025'
  },
  gallery: {
    photos: [
      '/photos/engagement-1.jpg',
      '/photos/engagement-2.jpg',
      '/photos/couple-1.jpg',
      '/photos/couple-2.jpg',
      '/photos/couple-3.jpg',
      '/photos/couple-4.jpg'
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

const websiteTemplates = [
  {
    id: 'elegant-website',
    name: 'Elegant Website'
  },
  {
    id: 'modern-website',
    name: 'Modern Website'
  }
];

export default function WebsiteInvitationPreview() {
  const [currentTemplate, setCurrentTemplate] = useState('elegant-website');

  const switchTemplate = () => {
    const currentIndex = websiteTemplates.findIndex(t => t.id === currentTemplate);
    const nextIndex = (currentIndex + 1) % websiteTemplates.length;
    setCurrentTemplate(websiteTemplates[nextIndex].id);
  };

  const renderWebsiteContent = () => {
    if (currentTemplate === 'elegant-website') {
      return (
        <div className="h-full bg-white overflow-y-auto">
          {/* Hero Section */}
          <section className="relative h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="text-center text-white"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-8"
              >
                <Heart className="w-20 h-20 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-6xl font-serif mb-4">{websiteData.couple.brideName}</h1>
              <div className="text-4xl mb-6">&</div>
              <h1 className="text-6xl font-serif mb-8">{websiteData.couple.groomName}</h1>
              <div className="w-40 h-1 bg-white mx-auto"></div>
              <p className="text-2xl mt-8 opacity-90">Are getting married</p>
            </motion.div>
            
            {/* Scroll Indicator */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
            >
              <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
              </div>
            </motion.div>
          </section>

          {/* Story Section */}
          <section className="min-h-screen p-16 text-center bg-gradient-to-b from-purple-50 to-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-serif text-purple-800 mb-8">Our Love Story</h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl text-gray-700 leading-relaxed mb-8">{websiteData.couple.story}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mx-auto mb-4"></div>
                    <h3 className="text-2xl font-serif text-purple-800 mb-2">{websiteData.couple.brideName}</h3>
                    <p className="text-gray-600">{websiteData.couple.brideBio}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mx-auto mb-4"></div>
                    <h3 className="text-2xl font-serif text-purple-800 mb-2">{websiteData.couple.groomName}</h3>
                    <p className="text-gray-600">{websiteData.couple.groomBio}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Event Details */}
          <section className="min-h-screen p-16 bg-purple-50">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-5xl font-serif text-purple-800 mb-12">Event Details</h2>
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <p className="text-2xl font-medium text-gray-800">{websiteData.event.weddingDate}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <p className="text-2xl font-medium text-gray-800 mb-2">{websiteData.event.venue}</p>
                  <p className="text-gray-600">{websiteData.event.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <p className="text-sm text-purple-600 mb-2">Ceremony</p>
                    <p className="text-xl font-medium">{websiteData.event.ceremonyTime}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <p className="text-sm text-purple-600 mb-2">Reception</p>
                    <p className="text-xl font-medium">{websiteData.event.receptionTime}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Gallery */}
          <section className="min-h-screen p-16 bg-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-5xl font-serif text-purple-800 mb-12">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {websiteData.gallery.photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center"
                  >
                    <Image className="w-12 h-12 text-purple-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Registry */}
          <section className="min-h-screen p-16 bg-purple-50">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-5xl font-serif text-purple-800 mb-12">Registry</h2>
              <div className="max-w-2xl mx-auto space-y-4">
                {websiteData.registry.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 rounded-xl shadow-lg text-left"
                  >
                    <h3 className="text-xl font-medium text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-gray-600">{item.store}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
      );
    } else {
      // Modern Website Template
      return (
        <div className="h-full bg-gray-900 text-white overflow-y-auto">
          {/* Hero Section */}
          <section className="relative h-screen bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mb-8"
              >
                <Star className="w-20 h-20 mx-auto" />
              </motion.div>
              <h1 className="text-6xl font-bold mb-4">{websiteData.couple.brideName}</h1>
              <div className="text-4xl mb-6">+</div>
              <h1 className="text-6xl font-bold mb-8">{websiteData.couple.groomName}</h1>
              <div className="w-40 h-1 bg-white mx-auto"></div>
              <p className="text-2xl mt-8 opacity-90">June 15, 2025</p>
            </motion.div>
          </section>

          {/* Story Section */}
          <section className="min-h-screen p-16 text-center bg-gray-800">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold mb-8">Our Story</h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl text-gray-300 leading-relaxed mb-8">{websiteData.couple.story}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  <div className="bg-gray-700 p-8 rounded-xl">
                    <h3 className="text-2xl font-bold mb-4">{websiteData.couple.brideName}</h3>
                    <p className="text-gray-400">{websiteData.couple.brideBio}</p>
                  </div>
                  <div className="bg-gray-700 p-8 rounded-xl">
                    <h3 className="text-2xl font-bold mb-4">{websiteData.couple.groomName}</h3>
                    <p className="text-gray-400">{websiteData.couple.groomBio}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Event Details */}
          <section className="min-h-screen p-16 bg-gray-900">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-5xl font-bold mb-12">Event Details</h2>
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-gray-800 p-8 rounded-xl">
                  <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-2xl font-medium">{websiteData.event.weddingDate}</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-xl">
                  <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-2xl font-medium mb-2">{websiteData.event.venue}</p>
                  <p className="text-gray-400">{websiteData.event.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <p className="text-sm text-blue-400 mb-2">Ceremony</p>
                    <p className="text-xl font-medium">{websiteData.event.ceremonyTime}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <p className="text-sm text-blue-400 mb-2">Reception</p>
                    <p className="text-xl font-medium">{websiteData.event.receptionTime}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Gallery */}
          <section className="min-h-screen p-16 bg-gray-800">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-5xl font-bold mb-12">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {websiteData.gallery.photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="aspect-square bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center"
                  >
                    <Image className="w-12 h-12 text-white" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Registry */}
          <section className="min-h-screen p-16 bg-gray-900">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-5xl font-bold mb-12">Registry</h2>
              <div className="max-w-2xl mx-auto space-y-4">
                {websiteData.registry.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-left"
                  >
                    <h3 className="text-xl font-medium mb-2">{item.name}</h3>
                    <p className="text-gray-400">{item.store}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
      );
    }
  };

  return (
    <div className="h-screen bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTemplate}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className="h-full"
        >
          {renderWebsiteContent()}
        </motion.div>
      </AnimatePresence>

      {/* Floating Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-4 right-4 flex gap-2 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={switchTemplate}
          className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
          title="Switch Template"
        >
          <RotateCw className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
