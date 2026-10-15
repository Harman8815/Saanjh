'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Sparkles, Heart, Star, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Hardcoded website templates
const websiteTemplates = [
  {
    id: 'elegant-website',
    name: 'Elegant Website',
    description: 'Sophisticated and timeless design with smooth animations',
    preview: '/templates/elegant-website.jpg',
    features: [
      'Parallax scrolling',
      'Photo galleries',
      'RSVP form',
      'Countdown timer',
      'Interactive map'
    ],
    gradient: 'from-purple-600 to-pink-500'
  },
  {
    id: 'modern-website',
    name: 'Modern Website',
    description: 'Contemporary design with bold typography and animations',
    preview: '/templates/modern-website.jpg',
    features: [
      'Animated backgrounds',
      'Video integration',
      'Guest messages',
      'Event timeline',
      'Social sharing'
    ],
    gradient: 'from-blue-600 to-cyan-500'
  }
];

export default function WebsiteInvitationPage() {
  const router = useRouter();

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/dashboard/invitation-builder/website/editor?template=${templateId}`);
  };

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
                <h1 className="text-xl font-semibold text-gray-800">Website Invitation</h1>
                <p className="text-sm text-gray-600">Choose a template for your interactive invitation</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mb-6"
            >
              <Globe className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Website Template</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select from our beautifully designed website templates and create an interactive experience for your guests
            </p>
          </div>

          {/* Template Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {websiteTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                  {/* Preview Image */}
                  <div className={`h-64 bg-gradient-to-br ${template.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-white text-center"
                      >
                        <Globe className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
                        <div className="w-20 h-1 bg-white mx-auto"></div>
                      </motion.div>
                    </div>
                    {/* Animated elements */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-10 right-10 w-8 h-8 bg-white/20 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute bottom-10 left-10 w-6 h-6 bg-white/20 rounded-full"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">{template.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{template.description}</p>
                    </div>

                    {/* Features */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-800 mb-4">Features Included:</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {template.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-3">
                            <div className={`w-2 h-2 bg-gradient-to-r ${template.gradient} rounded-full`}></div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r ${template.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                    >
                      <span>Use This Template</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Website Invitations?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Globe className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Interactive Experience</h4>
                  <p className="text-gray-600 text-sm">Engage your guests with animations, photo galleries, and interactive elements</p>
                </div>
                <div className="text-center">
                  <Heart className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Guest Management</h4>
                  <p className="text-gray-600 text-sm">Built-in RSVP tracking, guest messages, and event management tools</p>
                </div>
                <div className="text-center">
                  <Star className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Always Accessible</h4>
                  <p className="text-gray-600 text-sm">Guests can access your invitation anytime, anywhere on any device</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
