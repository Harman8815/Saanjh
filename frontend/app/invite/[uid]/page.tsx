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
      message: 'We can\'t wait to celebrate our special day with you!',
      selectedTemplate: 'elegant-classic'
    },
    'xyz789': {
      uid: 'xyz789',
      brideName: 'Emma',
      groomName: 'James',
      weddingDate: '2024-09-20',
      venue: 'Sunset Beach Resort',
      message: 'Join us as we begin our forever together.',
      selectedTemplate: 'modern-animated'
    }
  };

  return mockInvitations[uid] || null;
};

// Elegant Classic Template Component
const ElegantClassicTemplate = ({ data }: { data: InvitationData }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex items-center justify-center p-6 md:p-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-100/50 overflow-hidden"
        >
          {/* Hero Section - Names + Date */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative px-8 md:px-16 py-16 md:py-24 text-center bg-gradient-to-br from-amber-50/50 to-rose-50/50"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent"></div>
            
            {/* Names */}
            <div className="space-y-8">
              <motion.h1 
                className="text-6xl md:text-7xl font-serif text-amber-950 tracking-wide leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {data.brideName}
              </motion.h1>
              
              <motion.div
                className="text-4xl md:text-5xl text-amber-700 font-light tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                &
              </motion.div>
              
              <motion.h1 
                className="text-6xl md:text-7xl font-serif text-amber-950 tracking-wide leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {data.groomName}
              </motion.h1>
            </div>

            {/* Date in Hero */}
            <motion.div
              className="mt-12 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <p className="text-amber-700 text-lg font-light tracking-wide uppercase">Together with their families</p>
              <p className="text-amber-600 text-xl font-medium">invite you to celebrate their wedding</p>
            </motion.div>
          </motion.div>

          {/* Event Details Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="px-8 md:px-16 py-12 md:py-16 border-b border-amber-100/30"
          >
            <div className="text-center space-y-8">
              {/* Date */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="space-y-4"
              >
                <h2 className="text-amber-700 text-sm font-medium tracking-widest uppercase">Date</h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-0.5 bg-amber-300"></div>
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <div className="w-8 h-0.5 bg-amber-300"></div>
                </div>
                <p className="text-2xl md:text-3xl text-amber-900 font-light leading-relaxed">
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
            className="px-8 md:px-16 py-12 md:py-16 border-b border-amber-100/30"
          >
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                className="space-y-4"
              >
                <h2 className="text-amber-700 text-sm font-medium tracking-widest uppercase">Venue</h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-0.5 bg-amber-300"></div>
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <div className="w-8 h-0.5 bg-amber-300"></div>
                </div>
                <p className="text-2xl md:text-3xl text-amber-900 font-light leading-relaxed">
                  {data.venue}
                </p>
              </motion.div>
            </div>
          </motion.div>

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
                  <h2 className="text-amber-700 text-sm font-medium tracking-widest uppercase">A Message</h2>
                  <div className="max-w-2xl mx-auto">
                    <div className="relative">
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-200"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-200"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-200"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-200"></div>
                      
                      <p className="text-gray-700 text-lg md:text-xl italic leading-relaxed px-8 py-6 font-light">
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
            className="px-8 md:px-16 py-8 md:py-12 bg-gradient-to-br from-amber-50/30 to-rose-50/30 text-center"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-300"></div>
                <Heart className="w-6 h-6 text-amber-600" />
                <div className="w-16 h-0.5 bg-gradient-to-r from-amber-300 to-transparent"></div>
              </div>
              <p className="text-amber-700 text-sm font-light tracking-wide">With joy and anticipation</p>
              <p className="text-amber-600 text-xs">We look forward to celebrating with you</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Modern Animated Template Component
const ModernAnimatedTemplate = ({ data }: { data: InvitationData }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-white/5 rounded-full blur-xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-white/20"
        >
          {/* Modern Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-2 border-white/30 rounded-full mx-auto"
            />
          </motion.div>

          {/* Names with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-8"
          >
            <motion.h1 
              className="text-6xl font-bold text-white mb-4"
              animate={{ textShadow: ["0 0 20px rgba(255,255,255,0.5)", "0 0 30px rgba(255,255,255,0.8)", "0 0 20px rgba(255,255,255,0.5)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {data.brideName}
            </motion.h1>
            <motion.div
              className="text-3xl text-white/80 mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              &
            </motion.div>
            <motion.h1 
              className="text-6xl font-bold text-white mb-4"
              animate={{ textShadow: ["0 0 20px rgba(255,255,255,0.5)", "0 0 30px rgba(255,255,255,0.8)", "0 0 20px rgba(255,255,255,0.5)"] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              {data.groomName}
            </motion.h1>
            <p className="text-xl text-white/70">invite you to celebrate their wedding</p>
          </motion.div>

          {/* Date with Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Calendar className="w-6 h-6 text-blue-300" />
            </motion.div>
            <p className="text-xl text-white font-medium">
              {new Date(data.weddingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </motion.div>

          {/* Venue with Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <MapPin className="w-6 h-6 text-purple-300" />
            </motion.div>
            <p className="text-xl text-white font-medium">{data.venue}</p>
          </motion.div>

          {/* Message with Animation */}
          {data.message && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MessageSquare className="w-5 h-5 text-blue-300" />
                </motion.div>
                <p className="text-sm text-blue-300 uppercase tracking-wide">A Message</p>
              </div>
              <motion.p 
                className="text-white/90 italic leading-relaxed"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                "{data.message}"
              </motion.p>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center"
          >
            <motion.div
              className="w-32 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-4"
              animate={{ scaleX: [0, 1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className="text-sm text-white/70">With joy and anticipation</p>
          </motion.div>
        </motion.div>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (error || !invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The invitation you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Render the appropriate template
  switch (invitationData.selectedTemplate) {
    case 'elegant-classic':
      return <ElegantClassicTemplate data={invitationData} />;
    case 'modern-animated':
      return <ModernAnimatedTemplate data={invitationData} />;
    default:
      return <ElegantClassicTemplate data={invitationData} />;
  }
}
