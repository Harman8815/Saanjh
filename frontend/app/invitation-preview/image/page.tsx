'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, RotateCw } from 'lucide-react';

// Hardcoded data for image invitation preview
const weddingData = {
  brideName: 'Sarah Johnson',
  groomName: 'Michael Smith',
  weddingDate: 'June 15, 2025',
  venue: 'Grand Garden Estate',
  ceremonyTime: '4:00 PM',
  receptionTime: '6:00 PM',
  selectedTemplate: 'elegant-classic'
};

const imageTemplates = [
  {
    id: 'elegant-classic',
    name: 'Elegant Classic'
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal'
  },
  {
    id: 'romantic-floral',
    name: 'Romantic Floral'
  },
  {
    id: 'bold-artistic',
    name: 'Bold Artistic'
  }
];

export default function ImageInvitationPreview() {
  const [currentTemplate, setCurrentTemplate] = useState(weddingData.selectedTemplate);

  const switchTemplate = () => {
    const currentIndex = imageTemplates.findIndex(t => t.id === currentTemplate);
    const nextIndex = (currentIndex + 1) % imageTemplates.length;
    setCurrentTemplate(imageTemplates[nextIndex].id);
  };

  const renderInvitation = () => {
    switch (currentTemplate) {
      case 'elegant-classic':
        return (
          <div className="h-full bg-gradient-to-b from-amber-50 to-white p-8 text-center flex flex-col justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-8"
            >
              <div className="w-32 h-32 border-4 border-amber-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-amber-600 font-serif text-4xl">S&M</span>
              </div>
              <h2 className="text-4xl font-serif text-amber-800 mb-3">{weddingData.brideName} & {weddingData.groomName}</h2>
              <p className="text-amber-600 italic text-xl">Together forever</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 text-gray-700"
            >
              <p className="text-xl font-medium">{weddingData.weddingDate}</p>
              <p className="text-xl">{weddingData.venue}</p>
              <p className="text-lg">{weddingData.ceremonyTime}</p>
              <div className="w-20 h-0.5 bg-amber-400 mx-auto my-8"></div>
              <p className="text-lg text-gray-600 italic">Join us as we begin our forever</p>
              <p className="text-sm text-gray-500 mt-8">Reception to follow at {weddingData.receptionTime}</p>
            </motion.div>
          </div>
        );
      case 'modern-minimal':
        return (
          <div className="h-full bg-white p-8 text-center flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="text-5xl font-light text-gray-900 mb-4">{weddingData.brideName}</h2>
              <div className="text-3xl text-gray-400 mb-4">&</div>
              <h2 className="text-5xl font-light text-gray-900 mb-8">{weddingData.groomName}</h2>
              <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-8"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 text-gray-700"
            >
              <p className="text-sm uppercase tracking-wider">{weddingData.weddingDate}</p>
              <p className="text-xl">{weddingData.venue}</p>
              <p className="text-sm text-gray-500">{weddingData.ceremonyTime}</p>
              <div className="w-16 h-0.5 bg-gray-300 mx-auto my-8"></div>
              <p className="text-xs text-gray-400 mt-8 uppercase tracking-wider">Reception {weddingData.receptionTime}</p>
            </motion.div>
          </div>
        );
      case 'romantic-floral':
        return (
          <div className="h-full bg-gradient-to-b from-pink-50 to-white p-8 text-center flex flex-col justify-center relative overflow-hidden">
            {/* Decorative floral elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-8 left-8 w-20 h-20 border-2 border-pink-200 rounded-full opacity-30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-8 right-8 w-24 h-24 border-2 border-pink-200 rounded-full opacity-30"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 relative z-10"
            >
              <h2 className="text-4xl font-serif text-pink-800 mb-4">{weddingData.brideName} & {weddingData.groomName}</h2>
              <p className="text-pink-600 italic text-lg">Are getting married</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 text-gray-700 relative z-10"
            >
              <p className="text-xl font-medium">{weddingData.weddingDate}</p>
              <p className="text-lg">{weddingData.venue}</p>
              <p className="text-sm text-pink-600 mt-4">{weddingData.ceremonyTime}</p>
              <div className="w-20 h-0.5 bg-pink-300 mx-auto my-6"></div>
              <p className="text-lg text-gray-600 italic">With love and joy</p>
              <p className="text-sm text-gray-500 mt-6">Reception {weddingData.receptionTime}</p>
            </motion.div>
          </div>
        );
      case 'bold-artistic':
        return (
          <div className="h-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 p-8 text-white text-center flex flex-col justify-center relative overflow-hidden">
            {/* Animated background elements */}
            <motion.div
              animate={{ x: [0, 50, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            />
            <motion.div
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 relative z-10"
            >
              <h2 className="text-5xl font-bold mb-6">{weddingData.brideName} & {weddingData.groomName}</h2>
              <div className="w-32 h-1 bg-white mx-auto mb-8"></div>
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-2xl opacity-90 mb-8"
              >
                Are getting married!
              </motion.p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 relative z-10"
            >
              <p className="text-xl">{weddingData.weddingDate}</p>
              <p className="text-xl">{weddingData.venue}</p>
              <p className="text-lg opacity-90 mt-6">{weddingData.ceremonyTime}</p>
              <div className="w-24 h-0.5 bg-white/50 mx-auto my-8"></div>
              <p className="text-lg opacity-80">Join us in celebration</p>
              <p className="text-sm opacity-60 mt-6">Reception {weddingData.receptionTime}</p>
            </motion.div>
          </div>
        );
      default:
        return (
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Template preview</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100 flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTemplate}
          initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Invitation Frame */}
          <div className="bg-white shadow-2xl overflow-hidden w-[400px] h-[600px] rounded-xl">
            {renderInvitation()}
          </div>

          {/* Floating Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-4 right-4 flex gap-2"
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
