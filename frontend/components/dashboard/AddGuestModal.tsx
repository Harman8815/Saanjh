'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, UserPlus } from 'lucide-react';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
}

interface Guest {
  name: string;
  email: string;
  phone: string;
  rsvpStatus: 'confirmed' | 'pending' | 'declined';
  mealPreference?: string;
  plusOne: boolean;
  gender: 'male' | 'female';
  whatsapp?: string;
  table?: string;
  side?: 'Bride' | 'Groom';
  address?: string;
  notes?: string;
}

export default function AddGuestModal({ isOpen, onClose, onAddGuest }: AddGuestModalProps) {
  const [formData, setFormData] = useState<Omit<Guest, 'id'>>({
    name: '',
    email: '',
    phone: '',
    rsvpStatus: 'pending',
    mealPreference: '',
    plusOne: false,
    gender: 'male'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGuest: Omit<Guest, 'id'> = {
      ...formData
    };
    
    onAddGuest(newGuest);
    setFormData({
      name: '',
      email: '',
      phone: '',
      rsvpStatus: 'pending',
      mealPreference: '',
      plusOne: false,
      gender: 'male'
    });
    onClose();
  };

  const handleInputChange = (field: keyof Omit<Guest, 'id'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getGenderIcon = () => {
    switch (formData.gender) {
      case 'male':
        return <User size={20} className="text-blue-400" />;
      case 'female':
        return <User size={20} className="text-pink-400" />;
      default:
        return <UserPlus size={20} className="text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-surface border border-white/20 rounded-2xl shadow-2xl w-full max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-text-primary">
                Add New Guest
              </h2>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-white/5"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name')(e)}
                  placeholder="Enter guest name"
                  className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email')(e)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone')(e)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Gender
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={(e) => handleInputChange('gender')(e)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      {getGenderIcon()}
                      <span className="text-sm font-medium">Male</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={(e) => handleInputChange('gender')(e)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      {getGenderIcon()}
                      <span className="text-sm font-medium">Female</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* RSVP Status */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  RSVP Status
                </label>
                <select
                  value={formData.rsvpStatus}
                  onChange={(e) => handleInputChange('rsvpStatus')(e)}
                  className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              {/* Meal Preference */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Meal Preference
                </label>
                <input
                  type="text"
                  value={formData.mealPreference || ''}
                  onChange={(e) => handleInputChange('mealPreference')(e)}
                  placeholder="Enter dietary preferences (optional)"
                  className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Plus One */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.plusOne}
                    onChange={(e) => handleInputChange('plusOne')(e)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-text-primary">Plus One</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Add Guest
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
