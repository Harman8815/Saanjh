'use client';

import { motion } from 'framer-motion';
import { Image, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InvitationBuilderPage() {
  const router = useRouter();

  const invitationTypes = [
    {
      id: 'image',
      title: 'Image Invitation',
      description: 'Create beautiful, shareable image invitations perfect for social media and messaging apps',
      icon: Image,
      features: [
        'Multiple template designs',
        'Real-time preview',
        'Easy customization',
        'Download as image',
        'Social media ready'
      ],
      route: '/dashboard/invitation-builder/image',
      gradient: 'from-purple-600 to-pink-500'
    },
    {
      id: 'website',
      title: 'Website Invitation',
      description: 'Build interactive, animated website invitations with rich features and guest management',
      icon: Globe,
      features: [
        'Interactive animations',
        'Guest RSVP tracking',
        'Photo galleries',
        'Event details',
        'Mobile responsive'
      ],
      route: '/dashboard/invitation-builder/website',
      gradient: 'from-blue-600 to-cyan-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold text-text-primary mb-4">Invitation Builder</h1>
          <p className="text-text-secondary text-xl max-w-3xl mx-auto">
            Choose your invitation style and create beautiful wedding invitations that will delight your guests
          </p>
        </motion.div>

        {/* Invitation Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {invitationTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full hover:bg-white/15 transition-all duration-300 hover:shadow-xl">
                  {/* Icon and Title */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 bg-gradient-to-r ${type.gradient} rounded-xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary">{type.title}</h2>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-text-secondary mb-6 text-lg leading-relaxed">
                    {type.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {type.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></div>
                        <span className="text-text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(type.route)}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r ${type.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                  >
                    <span>Start Building</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Why Choose Our Builder?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Beautiful Designs</h4>
                <p className="text-text-secondary text-sm">Professional templates created by wedding designers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Easy to Use</h4>
                <p className="text-text-secondary text-sm">No design experience needed - just fill in your details</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Instant Sharing</h4>
                <p className="text-text-secondary text-sm">Share your invitations instantly with guests worldwide</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
