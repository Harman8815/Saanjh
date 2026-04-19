'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Share2, Heart, Play } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  tags: string;
  featured: boolean;
  date: string;
  size: string;
  dimensions: string;
}

interface LightboxProps {
  media: MediaItem | null;
  currentIndex: number;
  totalItems: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function Lightbox({ 
  media, 
  currentIndex, 
  totalItems, 
  isOpen, 
  onClose, 
  onNavigate 
}: LightboxProps) {
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onNavigate('prev');
          break;
        case 'ArrowRight':
          onNavigate('next');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, onNavigate]);

  // Prevent body scroll when lightbox is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!media || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="text-white/80 text-sm">
              {currentIndex + 1} / {totalItems}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Download functionality
                  const link = document.createElement('a');
                  link.href = media.url;
                  link.download = media.title;
                  link.click();
                }}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                title="Download"
              >
                <Download size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: media.title,
                      text: media.description,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Like functionality
                }}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                title="Like"
              >
                <Heart size={20} />
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('prev');
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={totalItems <= 1}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('next');
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={totalItems <= 1}
        >
          <ChevronRight size={24} />
        </button>

        {/* Media Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl max-h-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {media.type === 'video' ? (
              <video
                src={media.url}
                controls
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={media.url}
                alt={media.title}
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
              />
            )}

            {/* Video Play Button Overlay */}
            {media.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 p-4 rounded-full shadow-lg">
                  <Play size={32} className="text-black ml-1" />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white text-lg font-medium mb-2">{media.title}</h3>
              <p className="text-white/80 text-sm mb-3">{media.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-white/60 text-xs">
                  <span>{media.dimensions}</span>
                  <span>{media.size}</span>
                  <span>{new Date(media.date).toLocaleDateString()}</span>
                  {media.featured && (
                    <span className="bg-gold/20 text-gold px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Heart size={10} />
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs">
                    {media.tags}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Click Areas for Navigation */}
        <button
          onClick={() => onNavigate('prev')}
          className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer disabled:opacity-50"
          disabled={totalItems <= 1}
          aria-label="Previous image"
        />
        <button
          onClick={() => onNavigate('next')}
          className="absolute right-0 top-0 bottom-0 w-1/4 cursor-pointer disabled:opacity-50"
          disabled={totalItems <= 1}
          aria-label="Next image"
        />
      </motion.div>
    </AnimatePresence>
  );
}
