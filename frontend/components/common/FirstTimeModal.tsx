'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface FirstTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
}

export default function FirstTimeModal({ isOpen, onClose, isEditMode = false }: FirstTimeModalProps) {
  const { wedding, setWedding, setFirstTimeUser, setShowFirstTimeModal } = useAppStore();
  
  const [formData, setFormData] = useState({
    brideName: wedding?.brideName || '',
    groomName: wedding?.groomName || '',
    weddingDate: wedding?.weddingDate || '',
    venue: wedding?.venue || '',
    message: wedding?.message || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        brideName: wedding?.brideName || '',
        groomName: wedding?.groomName || '',
        weddingDate: wedding?.weddingDate || '',
        venue: wedding?.venue || '',
        message: wedding?.message || ''
      });
      setErrors({});
    }
  }, [isOpen, wedding]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.brideName.trim()) {
      newErrors.brideName = 'Bride name is required';
    }

    if (!formData.groomName.trim()) {
      newErrors.groomName = 'Groom name is required';
    }

    if (!formData.weddingDate.trim()) {
      newErrors.weddingDate = 'Wedding date is required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Update wedding data in store
    setWedding({
      ...wedding,
      ...formData
    });

    // Mark as not first-time user anymore
    if (!isEditMode) {
      setFirstTimeUser(false);
    }

    // Close modal
    onClose();
  };

  const handleClose = () => {
    setShowFirstTimeModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative bg-surface border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-white/20 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  {isEditMode ? 'Edit Wedding Details' : 'Welcome to Your Wedding Planner!'}
                </h2>
                <p className="text-text-secondary text-sm">
                  {isEditMode 
                    ? 'Update your wedding information'
                    : 'Let\'s start by getting to know your special day'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bride Name */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Bride Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                  className={`w-full px-4 py-3 bg-white/10 border ${errors.brideName ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  placeholder="Enter bride's name"
                />
                {errors.brideName && (
                  <p className="mt-1 text-sm text-red-500">{errors.brideName}</p>
                )}
              </div>

              {/* Groom Name */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Groom Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                  className={`w-full px-4 py-3 bg-white/10 border ${errors.groomName ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  placeholder="Enter groom's name"
                />
                {errors.groomName && (
                  <p className="mt-1 text-sm text-red-500">{errors.groomName}</p>
                )}
              </div>

              {/* Wedding Date */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Wedding Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border ${errors.weddingDate ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  />
                </div>
                {errors.weddingDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.weddingDate}</p>
                )}
              </div>

              {/* Venue */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Venue <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border ${errors.venue ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                    placeholder="Enter venue name or location"
                  />
                </div>
                {errors.venue && (
                  <p className="mt-1 text-sm text-red-500">{errors.venue}</p>
                )}
              </div>
            </div>

            {/* Message (Optional) */}
            <div className="mt-6">
              <label className="block text-text-primary font-medium mb-2">
                Personal Message <span className="text-text-muted">(Optional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Add a personal message to your wedding invitations..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-white/10 text-text-primary rounded-lg hover:bg-white/20 transition-colors font-medium"
              >
                {isEditMode ? 'Cancel' : 'Skip for Now'}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-primary/90 hover:to-secondary/90 transition-all font-medium shadow-lg shadow-primary/25"
              >
                {isEditMode ? 'Save Changes' : 'Get Started'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
