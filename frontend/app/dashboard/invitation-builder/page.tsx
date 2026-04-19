'use client';

import { motion } from 'framer-motion';
import { Eye, Palette, Share2, Download, Mail, MessageCircle } from 'lucide-react';

export default function InvitationBuilderPage() {
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-3">Invitation Builder</h1>
          <p className="text-text-secondary text-lg max-w-3xl">
            Create stunning wedding invitations with our easy-to-use builder. Choose from beautiful templates, 
            customize every detail, and share your perfect invitation with guests.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Template Preview & Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Template Preview Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary" />
                  Preview
                </h2>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    Desktop
                  </button>
                  <button className="px-4 py-2 text-sm text-text-muted hover:text-text-secondary transition-colors">
                    Mobile
                  </button>
                </div>
              </div>
              
              {/* Preview Frame */}
              <div className="bg-white rounded-lg shadow-xl aspect-[3/4] max-w-md mx-auto flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Palette className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Invitation Preview</h3>
                  <p className="text-gray-600 mb-4">Select a template to see your invitation design</p>
                  <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Choose Template
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Template Selection Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8"
            >
              <h2 className="text-2xl font-semibold text-text-primary mb-6 flex items-center gap-3">
                <Palette className="w-6 h-6 text-primary" />
                Choose Your Template
              </h2>
              
              {/* Empty State for Template Selection */}
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Palette className="w-12 h-12 text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">Templates Coming Soon</h3>
                <p className="text-text-secondary max-w-md mx-auto mb-6">
                  We're working on beautiful wedding invitation templates. Check back soon to choose from our curated collection.
                </p>
                <div className="flex justify-center gap-3">
                  <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Get Notified
                  </button>
                  <button className="px-6 py-3 bg-white/10 text-text-primary rounded-lg hover:bg-white/20 transition-colors">
                    Browse Examples
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Share Section */}
          <div className="space-y-8">
            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-3">
                <Share2 className="w-5 h-5 text-primary" />
                Share & Send
              </h2>
              
              {/* Share Options */}
              <div className="space-y-4">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-text-primary">Email Invitations</div>
                    <div className="text-sm text-text-muted">Send directly to guest emails</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-text-primary">Share Link</div>
                    <div className="text-sm text-text-muted">Get shareable link</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left">
                  <Download className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-text-primary">Download PDF</div>
                    <div className="text-sm text-text-muted">Print-ready version</div>
                  </div>
                </button>
              </div>
              
              {/* Placeholder for additional share options */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-text-muted text-sm text-center">
                  More sharing options coming soon
                </p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Save Draft
                </button>
                <button className="w-full px-4 py-2 bg-white/10 text-text-primary rounded-lg hover:bg-white/20 transition-colors">
                  Preview Fullscreen
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
