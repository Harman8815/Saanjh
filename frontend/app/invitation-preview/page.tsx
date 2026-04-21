'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Share2, RotateCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Hard coded values for development phase
const hardCodedWedding = {
  brideName: 'Sarah Johnson',
  groomName: 'Michael Smith',
  weddingDate: '2025-06-15',
  venue: 'Grand Garden Estate',
  selectedTemplate: 'elegant-classic'
};

export default function InvitationPreviewPage() {
  const router = useRouter();
  const [currentTemplate, setCurrentTemplate] = useState(hardCodedWedding.selectedTemplate);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const templates = [
    {
      id: 'elegant-classic',
      name: 'Elegant Classic'
    },
    {
      id: 'modern-animated',
      name: 'Modern Animated'
    }
  ];

  const switchTemplate = () => {
    const currentIndex = templates.findIndex(t => t.id === currentTemplate);
    const nextIndex = (currentIndex + 1) % templates.length;
    setCurrentTemplate(templates[nextIndex].id);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Invitation Preview</h1>
                <p className="text-sm text-gray-600">See how your invitation will look</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={switchTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                Switch Template
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTemplate}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Phone Frame */}
                <div className="relative mx-auto" style={{ width: '375px', height: '812px' }}>
                  <div className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl"></div>
                  <div className="absolute inset-2 bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-white px-6 py-2 flex items-center justify-between text-xs">
                      <span className="font-medium">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-3 border border-gray-800 rounded-sm"></div>
                        <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Invitation Content */}
                    <div className="h-full pb-20">
                      {currentTemplate === 'elegant-classic' ? (
                        <div className="h-full bg-gradient-to-b from-amber-50 to-white p-8 text-center flex flex-col justify-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mb-8"
                          >
                            <div className="w-24 h-24 border-4 border-amber-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                              <span className="text-amber-600 font-serif text-3xl">S&M</span>
                            </div>
                            <h2 className="text-3xl font-serif text-amber-800 mb-3">Sarah & Michael</h2>
                            <p className="text-amber-600 italic text-lg">Together forever</p>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4 text-gray-700"
                          >
                            <p className="text-lg font-medium">Saturday, June 15th, 2025</p>
                            <p className="text-lg">Grand Garden Estate</p>
                            <div className="w-16 h-0.5 bg-amber-400 mx-auto my-6"></div>
                            <p className="text-sm text-gray-600 italic">Join us as we begin our forever</p>
                            <p className="text-xs text-gray-500 mt-8">Reception to follow</p>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="h-full bg-gradient-to-br from-purple-600 to-pink-500 p-8 text-white flex flex-col justify-center relative overflow-hidden">
                          {/* Animated background elements */}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
                          />
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full"
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10"
                          >
                            <h2 className="text-4xl font-bold mb-4">Sarah & Michael</h2>
                            <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
                            <motion.p
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4, type: "spring" }}
                              className="text-xl opacity-90 mb-8"
                            >
                              Are getting married!
                            </motion.p>
                            
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.6 }}
                              className="space-y-3 text-lg"
                            >
                              <p>June 15, 2025</p>
                              <p>Grand Garden Estate</p>
                              <p className="text-sm opacity-80 mt-6">Join us in celebration</p>
                            </motion.div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-80 space-y-6"
          >
            {/* Template Info */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Template Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Template:</span>
                  <span className="font-medium text-purple-600">
                    {templates.find(t => t.id === currentTemplate)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Couple:</span>
                  <span className="font-medium">{hardCodedWedding.brideName} & {hardCodedWedding.groomName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">June 15, 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{hardCodedWedding.venue}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Invitation
                </motion.button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2">Preview Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click "Switch Template" to see different designs</li>
                <li>• Use fullscreen mode for better viewing</li>
                <li>• This preview shows how it will look on mobile</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
