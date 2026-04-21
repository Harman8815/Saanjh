'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, MessageSquare, X } from 'lucide-react';

// Mock data structure - in production this would come from API/database
interface InvitationData {
  uid: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  message?: string;
  selectedTemplate: 'elegant-classic' | 'modern-animated';
  eventSections?: EventSection[];
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  fontFamily?: string;
}

interface EventSection {
  id: string;
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  description?: string;
  type: 'ceremony' | 'reception' | 'cocktail' | 'dinner' | 'party' | 'other';
  order: number;
}

// Mock function to fetch invitation data by UID
const fetchInvitationData = async (uid: string): Promise<InvitationData | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data - in production this would be a database call
  const mockInvitations: Record<string, InvitationData> = {
    'abc123': {
      uid: 'abc123',
      brideName: 'Sarah',
      groomName: 'Michael',
      weddingDate: '2024-06-15',
      venue: 'Grand Garden Estate',
      message: 'We can\'t wait to celebrate our special day with you! Your presence means the world to us as we begin this new chapter together.',
      selectedTemplate: 'elegant-classic',
      eventSections: [
        {
          id: 'ceremony',
          title: 'Wedding Ceremony',
          date: '2024-06-15',
          time: '3:00 PM',
          venue: 'St. Mary\'s Cathedral',
          description: 'Join us for the sacred ceremony where we exchange our vows.',
          type: 'ceremony',
          order: 1
        },
        {
          id: 'reception',
          title: 'Wedding Reception',
          date: '2024-06-15',
          time: '6:00 PM',
          venue: 'Grand Garden Estate',
          description: 'Celebrate with us at an elegant reception with dinner, dancing, and celebration.',
          type: 'reception',
          order: 2
        }
      ],
      customColors: {
        primary: '#d97706',
        secondary: '#dc2626',
        accent: '#f59e0b'
      },
      fontFamily: 'serif'
    },
    'xyz789': {
      uid: 'xyz789',
      brideName: 'Emma',
      groomName: 'James',
      weddingDate: '2024-09-20',
      venue: 'Sunset Beach Resort',
      message: 'Join us as we begin our forever together under the stars. Love is in the air and we want you there!',
      selectedTemplate: 'modern-animated',
      eventSections: [
        {
          id: 'cocktail',
          title: 'Cocktail Hour',
          date: '2024-09-20',
          time: '4:00 PM',
          venue: 'Sunset Beach Resort - Terrace',
          description: 'Welcome drinks and appetizers as we watch the sunset together.',
          type: 'cocktail',
          order: 1
        },
        {
          id: 'ceremony',
          title: 'Beach Ceremony',
          date: '2024-09-20',
          time: '5:30 PM',
          venue: 'Sunset Beach Resort - Beach',
          description: 'An intimate beach ceremony with the ocean as our witness.',
          type: 'ceremony',
          order: 2
        },
        {
          id: 'reception',
          title: 'Dinner & Dancing',
          date: '2024-09-20',
          time: '7:00 PM',
          venue: 'Sunset Beach Resort - Ballroom',
          description: 'Join us for a magical evening of dining, dancing, and celebration.',
          type: 'reception',
          order: 3
        }
      ],
      customColors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#ec4899'
      },
      fontFamily: 'sans-serif'
    }
  };

  return mockInvitations[uid] || null;
};

// Elegant Classic Template Component
const ElegantClassicTemplate = ({ data }: { data: InvitationData }) => {
  // Get dynamic colors or use defaults
  const colors = data.customColors || {
    primary: '#d97706',
    secondary: '#dc2626',
    accent: '#f59e0b'
  };

  // Sort event sections by order
  const sortedEventSections = data.eventSections?.sort((a, b) => a.order - b.order) || [];

  // Format date with time
  const formatEventDateTime = (date?: string, time?: string) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 md:p-8"
      style={{
        background: `linear-gradient(to bottom right, ${colors.primary}10, ${colors.secondary}10, ${colors.accent}10)`
      }}
    >
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
          style={{ borderColor: `${colors.primary}20` }}
        >
          {/* Hero Section - Names + Date */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative px-8 md:px-16 py-16 md:py-24 text-center"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)`
            }}
          >
            {/* Decorative Elements */}
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{
                background: `linear-gradient(to right, transparent, ${colors.primary}, transparent)`
              }}
            ></div>
            <div 
              className="absolute bottom-0 left-0 w-full h-1"
              style={{
                background: `linear-gradient(to right, transparent, ${colors.secondary}, transparent)`
              }}
            ></div>
            
            {/* Names */}
            <div className="space-y-6 md:space-y-8">
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide leading-tight"
                style={{ 
                  color: colors.primary,
                  fontFamily: data.fontFamily || 'serif'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {data.brideName || 'Bride'}
              </motion.h1>
              
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-light tracking-widest"
                style={{ color: colors.secondary }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                &
              </motion.div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide leading-tight"
                style={{ 
                  color: colors.primary,
                  fontFamily: data.fontFamily || 'serif'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {data.groomName || 'Groom'}
              </motion.h1>
            </div>

            {/* Date in Hero */}
            <motion.div
              className="mt-12 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <p className="text-lg font-light tracking-wide uppercase" style={{ color: colors.secondary }}>
                Together with their families
              </p>
              <p className="text-xl font-medium" style={{ color: colors.accent }}>
                invite you to celebrate their wedding
              </p>
            </motion.div>
          </motion.div>

          {/* Event Sections */}
          {sortedEventSections.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="px-8 md:px-16 py-12 md:py-16 space-y-12"
              style={{ borderBottom: `1px solid ${colors.primary}20` }}
            >
              {sortedEventSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  className="text-center space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.2 }}
                >
                  <div className="space-y-4">
                    <h2 
                      className="text-sm font-medium tracking-widest uppercase"
                      style={{ color: colors.primary }}
                    >
                      {section.title}
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                      <div 
                        className="w-8 h-0.5"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                      {section.type === 'ceremony' && <Heart className="w-5 h-5" style={{ color: colors.primary }} />}
                      {section.type === 'reception' && <Calendar className="w-5 h-5" style={{ color: colors.primary }} />}
                      {section.type === 'cocktail' && <Calendar className="w-5 h-5" style={{ color: colors.primary }} />}
                      {section.type === 'dinner' && <Calendar className="w-5 h-5" style={{ color: colors.primary }} />}
                      {section.type === 'party' && <Calendar className="w-5 h-5" style={{ color: colors.primary }} />}
                      {section.type === 'other' && <Calendar className="w-5 h-5" style={{ color: colors.primary }} />}
                      <div 
                        className="w-8 h-0.5"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                    </div>
                    
                    {/* Date and Time */}
                    <p className="text-2xl md:text-3xl font-light leading-relaxed" style={{ color: colors.primary }}>
                      {formatEventDateTime(section.date, section.time)}
                    </p>
                    
                    {/* Venue */}
                    {section.venue && (
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: colors.secondary }} />
                        <p className="text-lg font-medium" style={{ color: colors.secondary }}>
                          {section.venue}
                        </p>
                      </div>
                    )}
                    
                    {/* Description */}
                    {section.description && (
                      <p className="text-gray-700 italic leading-relaxed max-w-2xl mx-auto">
                        {section.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Fallback Event Details if no event sections */}
          {sortedEventSections.length === 0 && (
            <>
              {/* Event Details Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="px-8 md:px-16 py-12 md:py-16"
                style={{ borderBottom: `1px solid ${colors.primary}20` }}
              >
                <div className="text-center space-y-8">
                  {/* Date */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="space-y-4"
                  >
                    <h2 
                      className="text-sm font-medium tracking-widest uppercase"
                      style={{ color: colors.primary }}
                    >
                      Date
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                      <div 
                        className="w-8 h-0.5"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                      <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
                      <div 
                        className="w-8 h-0.5"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                    </div>
                    <p className="text-2xl md:text-3xl font-light leading-relaxed" style={{ color: colors.primary }}>
                      {new Date(data.weddingDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Venue Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="px-8 md:px-16 py-12 md:py-16"
                style={{ borderBottom: `1px solid ${colors.primary}20` }}
              >
                <div className="text-center space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                    className="space-y-4"
                  >
                    <h2 
                      className="text-sm font-medium tracking-widest uppercase"
                      style={{ color: colors.primary }}
                    >
                      Venue
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                      <div 
                        className="w-8 h-0.5"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                      <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                      <div 
                        className="w-8 h-0.5"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                    </div>
                    <p className="text-2xl md:text-3xl font-light leading-relaxed" style={{ color: colors.primary }}>
                      {data.venue}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}

          {/* Message Section */}
          {data.message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2 }}
              className="px-8 md:px-16 py-12 md:py-16"
            >
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.2 }}
                  className="space-y-6"
                >
                  <h2 
                    className="text-sm font-medium tracking-widest uppercase"
                    style={{ color: colors.primary }}
                  >
                    A Message
                  </h2>
                  <div className="max-w-2xl mx-auto">
                    <div className="relative">
                      <div 
                        className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2"
                        style={{ borderColor: colors.primary }}
                      ></div>
                      <div 
                        className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2"
                        style={{ borderColor: colors.primary }}
                      ></div>
                      <div 
                        className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2"
                        style={{ borderColor: colors.primary }}
                      ></div>
                      <div 
                        className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2"
                        style={{ borderColor: colors.primary }}
                      ></div>
                      
                      <p 
                        className="text-lg md:text-xl italic leading-relaxed px-8 py-6 font-light text-gray-700"
                        style={{ fontFamily: data.fontFamily || 'serif' }}
                      >
                        "{data.message}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="px-8 md:px-16 py-8 md:py-12 text-center"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primary}15, ${colors.secondary}15)`
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div 
                  className="w-16 h-0.5"
                  style={{
                    background: `linear-gradient(to right, transparent, ${colors.accent}, transparent)`
                  }}
                ></div>
                <Heart className="w-6 h-6" style={{ color: colors.primary }} />
                <div 
                  className="w-16 h-0.5"
                  style={{
                    background: `linear-gradient(to left, transparent, ${colors.accent}, transparent)`
                  }}
                ></div>
              </div>
              <p className="text-sm font-light tracking-wide" style={{ color: colors.secondary }}>
                With joy and anticipation
              </p>
              <p className="text-xs" style={{ color: colors.primary }}>
                We look forward to celebrating with you
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Modern Animated Template Component
const ModernAnimatedTemplate = ({ data }: { data: InvitationData }) => {
  // Get dynamic colors or use defaults
  const colors = data.customColors || {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899'
  };

  // Sort event sections by order
  const sortedEventSections = data.eventSections?.sort((a, b) => a.order - b.order) || [];

  // Format date with time
  const formatEventDateTime = (date?: string, time?: string) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary}, ${colors.accent})`
      }}
    >
      {/* Animated Background Layers */}
      <div className="absolute inset-0">
        {/* Parallax Layer 1 - Farthest */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`layer1-${i}`}
              className="absolute w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
              animate={{
                x: [0, 150, 0],
                y: [0, -150, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              style={{
                left: `${10 + i * 12}%`,
                top: `${5 + i * 10}%`,
              }}
            />
          ))}
        </motion.div>

        {/* Parallax Layer 2 - Middle */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`layer2-${i}`}
              className="absolute w-32 h-32 bg-gradient-to-r from-pink-500/15 to-indigo-500/15 rounded-full blur-2xl"
              animate={{
                x: [0, -100, 0],
                y: [0, 100, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
              style={{
                left: `${15 + i * 15}%`,
                top: `${10 + i * 15}%`,
              }}
            />
          ))}
        </motion.div>

        {/* Parallax Layer 3 - Closest */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`layer3-${i}`}
              className="absolute w-40 h-40 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl"
              animate={{
                x: [0, 80, 0],
                y: [0, -80, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 25 + i * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7,
              }}
              style={{
                left: `${20 + i * 20}%`,
                top: `${15 + i * 20}%`,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section - Names */}
        <motion.section
          className="flex-1 flex items-center justify-center px-6 py-16 md:py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="max-w-6xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 100, rotateX: 15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center space-y-12"
            >
              {/* Animated Heart */}
              <motion.div
                className="relative inline-block"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <div 
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-2xl"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 0 40px ${colors.secondary}50`
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Heart className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 w-24 h-24 rounded-full blur-xl opacity-50"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`
                  }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
              </motion.div>

              {/* Names with Glowing Effect */}
              <div className="space-y-6 md:space-y-8">
                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  style={{
                    fontFamily: data.fontFamily || 'sans-serif',
                    textShadow: `0 0 40px ${colors.primary}80`
                  }}
                >
                  <motion.span
                    animate={{ 
                      textShadow: [
                        `0 0 20px ${colors.primary}cc`,
                        `0 0 40px ${colors.primary}ff`,
                        `0 0 20px ${colors.primary}cc`
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {data.brideName || 'Bride'}
                  </motion.span>
                </motion.h1>

                <motion.div
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white/90 font-light tracking-widest"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  style={{ color: colors.accent }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    &
                  </motion.span>
                </motion.div>

                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  style={{
                    fontFamily: data.fontFamily || 'sans-serif',
                    textShadow: `0 0 40px ${colors.primary}80`
                  }}
                >
                  <motion.span
                    animate={{ 
                      textShadow: [
                        `0 0 20px ${colors.primary}cc`,
                        `0 0 40px ${colors.primary}ff`,
                        `0 0 20px ${colors.primary}cc`
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  >
                    {data.groomName || 'Groom'}
                  </motion.span>
                </motion.h1>
              </div>

              <motion.p
                className="text-2xl md:text-3xl text-white/80 font-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
                style={{ color: colors.accent }}
              >
                invite you to celebrate their wedding
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Event Details Section */}
        <motion.section
          className="px-6 py-16 md:py-24 bg-gradient-to-t from-black/20 to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-16">
            {/* Multiple Event Sections */}
            {sortedEventSections.length > 0 && (
              sortedEventSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex items-center justify-center gap-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      {section.type === 'ceremony' && <Heart className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'reception' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'cocktail' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'dinner' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'party' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'other' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                    </motion.div>
                    <h2 
                      className="text-3xl md:text-4xl font-bold text-white"
                      style={{ color: colors.accent }}
                    >
                      {section.title}
                    </h2>
                    <motion.div
                      animate={{ rotate: [360, 0] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      {section.type === 'ceremony' && <Heart className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'reception' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'cocktail' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'dinner' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'party' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                      {section.type === 'other' && <Calendar className="w-8 h-8" style={{ color: colors.primary }} />}
                    </motion.div>
                  </motion.div>
                  
                  {/* Date and Time */}
                  <motion.p
                    className="text-2xl md:text-3xl text-white/90 font-light"
                    animate={{ 
                      textShadow: [
                        `0 0 10px ${colors.primary}50`,
                        `0 0 20px ${colors.primary}80`,
                        `0 0 10px ${colors.primary}50`
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {formatEventDateTime(section.date, section.time)}
                  </motion.p>
                  
                  {/* Venue */}
                  {section.venue && (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <MapPin className="w-6 h-6" style={{ color: colors.secondary }} />
                      </motion.div>
                      <motion.p
                        className="text-xl text-white/80 font-medium"
                        animate={{ 
                          textShadow: [
                            `0 0 10px ${colors.secondary}50`,
                            `0 0 20px ${colors.secondary}80`,
                            `0 0 10px ${colors.secondary}50`
                          ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1 + index * 0.5 }}
                      >
                        {section.venue}
                      </motion.p>
                    </motion.div>
                  )}
                  
                  {/* Description */}
                  {section.description && (
                    <motion.p
                      className="text-white/70 italic leading-relaxed max-w-2xl mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      {section.description}
                    </motion.p>
                  )}
                </motion.div>
              ))
            )}

            {/* Fallback Event Details if no event sections */}
            {sortedEventSections.length === 0 && (
              <>
                {/* Date */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex items-center justify-center gap-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Calendar className="w-8 h-8" style={{ color: colors.primary }} />
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ color: colors.accent }}>
                      Date
                    </h2>
                    <motion.div
                      animate={{ rotate: [360, 0] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Calendar className="w-8 h-8" style={{ color: colors.primary }} />
                    </motion.div>
                  </motion.div>
                  <motion.p
                    className="text-2xl md:text-3xl text-white/90 font-light"
                    animate={{ 
                      textShadow: [
                        `0 0 10px ${colors.primary}50`,
                        `0 0 20px ${colors.primary}80`,
                        `0 0 10px ${colors.primary}50`
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    {new Date(data.weddingDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </motion.p>
                </motion.div>

                {/* Venue */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex items-center justify-center gap-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <MapPin className="w-8 h-8" style={{ color: colors.secondary }} />
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ color: colors.accent }}>
                      Venue
                    </h2>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    >
                      <MapPin className="w-8 h-8" style={{ color: colors.secondary }} />
                    </motion.div>
                  </motion.div>
                  <motion.p
                    className="text-2xl md:text-3xl text-white/90 font-light"
                    animate={{ 
                      textShadow: [
                        `0 0 10px ${colors.primary}50`,
                        `0 0 20px ${colors.primary}80`,
                        `0 0 10px ${colors.primary}50`
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                  >
                    {data.venue}
                  </motion.p>
                </motion.div>
              </>
            )}
          </div>
        </motion.section>

        {/* Message Section */}
        {data.message && (
          <motion.section
            className="px-6 py-16 md:py-24 bg-gradient-to-b from-black/20 to-transparent"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="flex items-center justify-center gap-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <MessageSquare className="w-8 h-8" style={{ color: colors.accent }} />
                  </motion.div>
                  <h2 
                    className="text-3xl md:text-4xl font-bold text-white"
                    style={{ color: colors.accent }}
                  >
                    A Message
                  </h2>
                  <motion.div
                    animate={{ 
                      rotate: [0, -15, 15, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  >
                    <MessageSquare className="w-8 h-8" style={{ color: colors.accent }} />
                  </motion.div>
                </motion.div>
                
                <motion.div
                  className="relative max-w-3xl mx-auto"
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Animated Border */}
                  <motion.div
                    className="absolute inset-0 border-2 rounded-2xl opacity-30"
                    style={{
                      borderColor: colors.accent,
                      background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`
                    }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  <motion.p
                    className="text-xl md:text-2xl text-white/90 italic leading-relaxed px-8 py-6 font-light"
                    style={{ fontFamily: data.fontFamily || 'sans-serif' }}
                    animate={{ 
                      textShadow: [
                        `0 0 10px ${colors.primary}30`,
                        `0 0 25px ${colors.primary}60`,
                        `0 0 10px ${colors.primary}30`
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: 3 }}
                  >
                    "{data.message}"
                  </motion.p>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <motion.footer
          className="px-6 py-16 md:py-24 bg-gradient-to-t from-black/30 to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              className="flex items-center justify-center gap-6"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-20 h-0.5"
                style={{
                  background: `linear-gradient(to right, transparent, ${colors.accent})`
                }}
                animate={{ scaleX: [0, 1, 0.8, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Heart className="w-8 h-8" style={{ color: colors.accent }} />
              </motion.div>
              <motion.div
                className="w-20 h-0.5"
                style={{
                  background: `linear-gradient(to left, transparent, ${colors.accent})`
                }}
                animate={{ scaleX: [0, 1, 0.8, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              />
            </motion.div>
            
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p 
                className="text-xl font-light"
                style={{ color: colors.secondary }}
              >
                With joy and anticipation
              </p>
              <motion.p
                className="text-lg"
                style={{ color: colors.primary }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, delay: 4 }}
              >
                We look forward to celebrating with you
              </motion.p>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default function InvitationPage() {
  const params = useParams();
  const uid = params.uid as string;
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setIsLoading(true);
        const data = await fetchInvitationData(uid);
        
        if (data) {
          setInvitationData(data);
          setError(null);
        } else {
          setError('Invitation not found');
        }
      } catch (err) {
        setError('Failed to load invitation');
      } finally {
        setIsLoading(false);
      }
    };

    if (uid) {
      loadInvitation();
    }
  }, [uid]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full mx-auto"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2"
          >
            <h3 className="text-lg font-medium text-gray-700">Loading Invitation</h3>
            <p className="text-sm text-gray-500">Preparing your beautiful wedding invitation...</p>
          </motion.div>
          <motion.div
            className="flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (error || !invitationData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <X className="w-8 h-8 text-red-500" />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="text-2xl font-bold text-gray-900">Invitation Not Found</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {error || 'The invitation you\'re looking for doesn\'t exist or has been removed.'}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-3"
          >
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:shadow-md"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
            >
              Go to Homepage
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Render the appropriate template with smooth transition
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {invitationData.selectedTemplate === 'elegant-classic' && (
        <ElegantClassicTemplate data={invitationData} />
      )}
      {invitationData.selectedTemplate === 'modern-animated' && (
        <ModernAnimatedTemplate data={invitationData} />
      )}
      {!invitationData.selectedTemplate && (
        <ElegantClassicTemplate data={invitationData} />
      )}
    </motion.div>
  );
}

// Export template components for use in other components
export { ElegantClassicTemplate, ModernAnimatedTemplate };
