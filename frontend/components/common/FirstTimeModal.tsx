'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { Wedding } from '../../types/api';

interface FirstTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  wedding?: Wedding | null;
  onSave?: (weddingData: Partial<Wedding>) => Promise<void>;
}

export default function FirstTimeModal({ isOpen, onClose, isEditMode = false, wedding, onSave }: FirstTimeModalProps) {
  const [formData, setFormData] = useState({
    wedding_date: wedding?.wedding_date || '',
    theme: wedding?.theme || '',
    venue_catalog_id: wedding?.venue?.id || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && wedding) {
      setFormData({
        wedding_date: wedding.wedding_date || '',
        theme: wedding.theme || '',
        venue_catalog_id: wedding.venue?.id || ''
      });
      setErrors({});
    }
  }, [isOpen, wedding]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.wedding_date.trim()) {
      newErrors.wedding_date = 'Wedding date is required';
    }

    if (!formData.theme.trim()) {
      newErrors.theme = 'Wedding theme is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      if (onSave) {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving wedding data:', error);
      setErrors({ submit: 'Failed to save wedding details. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
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
              {/* Wedding Date */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Wedding Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.wedding_date}
                  onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                  className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
                    errors.wedding_date ? 'border-red-500' : ''
                  }`}
                  placeholder="Select your wedding date"
                />
                {errors.wedding_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.wedding_date}</p>
                )}
              </div>

              {/* Wedding Theme */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Wedding Theme <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
                    errors.theme ? 'border-red-500' : ''
                  }`}
                  placeholder="e.g., Rustic, Modern, Traditional"
                />
                {errors.theme && (
                  <p className="mt-1 text-sm text-red-500">{errors.theme}</p>
                )}
              </div>

              {/* Venue Selection */}
              <div className="md:col-span-2">
                <label className="block text-text-primary font-medium mb-2">
                  Venue (Optional)
                </label>
                <select
                  value={formData.venue_catalog_id}
                  onChange={(e) => setFormData({ ...formData, venue_catalog_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="">Select a venue</option>
                  <option value="1">Grand Ballroom</option>
                  <option value="2">Garden Paradise</option>
                  <option value="3">Beach Resort</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-text-primary font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : (isEditMode ? 'Update Details' : 'Continue')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
