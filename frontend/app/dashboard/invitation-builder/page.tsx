'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Palette, Share2, Download, Mail, MessageCircle, Check } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import TemplateCard from '../../../components/invitation-builder/TemplateCard';
import SharingPanel from '../../../components/invitation-builder/SharingPanel';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  features: string[];
}

const templates: Template[] = [
  {
    id: 'elegant-classic',
    name: 'Elegant Classic',
    description: 'Timeless and sophisticated design with traditional typography and delicate details',
    category: 'Classic',
    preview: '/templates/elegant-classic.jpg',
    features: [
      'Classic typography',
      'Gold accents',
      'Traditional layout',
      'Elegant borders',
      'Customizable colors'
    ]
  },
  {
    id: 'modern-animated',
    name: 'Modern Animated',
    description: 'Contemporary design with smooth animations and interactive elements',
    category: 'Modern',
    preview: '/templates/modern-animated.jpg',
    features: [
      'Animated elements',
      'Modern typography',
      'Interactive components',
      'Gradient effects',
      'Responsive design'
    ]
  }
];

export default function InvitationBuilderPage() {
  const { wedding, setWedding } = useAppStore();
  
  // Hard coded values for development phase
  const hardCodedWedding = {
    brideName: 'Sarah Johnson',
    groomName: 'Michael Smith',
    weddingDate: '2025-06-15',
    venue: 'Grand Garden Estate',
    selectedTemplate: 'elegant-classic'
  };
  
  // Use hard coded values instead of store for development
  const [selectedTemplate, setSelectedTemplate] = useState<string>(hardCodedWedding.selectedTemplate);
  const [showSharingPanel, setShowSharingPanel] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Commented out for development - using hard coded values
    // setWedding({
    //   ...wedding,
    //   selectedTemplate: templateId
    // });
  };

  const handleShare = () => {
    setShowSharingPanel(true);
  };
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
              <div className="bg-white rounded-lg shadow-xl aspect-[3/4] max-w-md mx-auto overflow-hidden">
                {selectedTemplate === 'elegant-classic' ? (
                  <div className="h-full bg-gradient-to-b from-amber-50 to-white p-8 text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 border-4 border-amber-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-amber-600 font-serif text-2xl">S&M</span>
                      </div>
                      <h3 className="text-2xl font-serif text-amber-800 mb-2">Sarah & Michael</h3>
                      <p className="text-amber-600 italic">Together forever</p>
                    </div>
                    <div className="space-y-3 text-gray-700">
                      <p className="text-sm">Saturday, June 15th, 2025</p>
                      <p className="text-sm">Grand Garden Estate</p>
                      <p className="text-xs mt-6 text-gray-500">Join us as we begin our forever</p>
                    </div>
                  </div>
                ) : selectedTemplate === 'modern-animated' ? (
                  <div className="h-full bg-gradient-to-br from-purple-600 to-pink-500 p-8 text-white flex flex-col justify-center">
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold mb-2">Sarah & Michael</h3>
                      <div className="w-20 h-1 bg-white mx-auto mb-4"></div>
                      <p className="text-lg opacity-90">Are getting married!</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>June 15, 2025</p>
                      <p>Grand Garden Estate</p>
                    </div>
                  </div>
                ) : (
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
                )}
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
              
              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <TemplateCard
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onSelect={handleTemplateSelect}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Template Selection Info */}
              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-8 p-6 bg-primary/10 border border-primary/30 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      Template Selected: {templates.find(t => t.id === selectedTemplate)?.name}
                    </h3>
                  </div>
                  <p className="text-text-secondary">
                    Great choice! You can now customize this template with your wedding details and personal touches.
                  </p>
                </motion.div>
              )}
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
                <button 
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.02] text-left group"
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Share2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary group-hover:text-primary transition-colors duration-200">Generate Link & QR Code</div>
                    <div className="text-sm text-text-muted">Create shareable invitation link</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.02] text-left group">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary group-hover:text-primary transition-colors duration-200">Email Invitations</div>
                    <div className="text-sm text-text-muted">Send directly to guest emails</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.02] text-left group">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Download className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary group-hover:text-primary transition-colors duration-200">Download PDF</div>
                    <div className="text-sm text-text-muted">Print-ready version</div>
                  </div>
                </button>
              </div>
              
              {/* Share Status */}
              {selectedTemplate && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-primary" />
                    <p className="text-sm text-primary font-medium">Ready to Share!</p>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Your invitation is ready. Generate a link to share with your guests.
                  </p>
                </div>
              )}
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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
                >
                  Save Draft
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2 bg-white/10 text-text-primary rounded-lg hover:bg-white/20 transition-all duration-200 hover:shadow-md"
                  onClick={() => window.open('/dashboard/invitation-preview', '_blank')}
                >
                  Preview Fullscreen
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      
      {/* Sharing Panel */}
      <SharingPanel
        isOpen={showSharingPanel}
        onClose={() => setShowSharingPanel(false)}
        invitationData={{
          brideName: hardCodedWedding.brideName,
          groomName: hardCodedWedding.groomName,
          weddingDate: hardCodedWedding.weddingDate,
          venue: hardCodedWedding.venue,
          selectedTemplate: hardCodedWedding.selectedTemplate
        }}
      />
      </motion.div>
    </div>
  );
}
