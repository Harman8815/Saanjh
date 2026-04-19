'use client';

import { motion } from 'framer-motion';
import { Globe, Palette, Layout, Share2 } from 'lucide-react';

export default function InvitationBuilderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Invitation Builder</h1>
          <p className="text-text-secondary">Create beautiful wedding invitations and share them with your guests</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Builder Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-text-primary mb-2">
                  Invitation Builder Studio
                </h2>
                <p className="text-text-secondary mb-6">
                  Design and customize your perfect wedding invitation
                </p>
                <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Start Creating
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <Palette className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-text-primary mb-2">Design Tools</h3>
              <p className="text-text-secondary text-sm">Customize colors, fonts, and layouts</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <Layout className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-text-primary mb-2">Templates</h3>
              <p className="text-text-secondary text-sm">Choose from professional templates</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <Share2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-text-primary mb-2">Share & Send</h3>
              <p className="text-text-secondary text-sm">Easily share invitations with guests</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
