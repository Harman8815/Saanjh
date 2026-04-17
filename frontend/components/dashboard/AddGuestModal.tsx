'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, UserPlus } from 'lucide-react';
import { Guest, NewGuest } from '../../types/guest';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (guest: NewGuest) => void;
  existingGuests?: Guest[];
  editingGuest?: Guest | null;
}

export default function AddGuestModal({ isOpen, onClose, onAddGuest, existingGuests = [], editingGuest }: AddGuestModalProps) {
  const [formData, setFormData] = useState<NewGuest>({
    name: '',
    email: '',
    phone: '',
    rsvpStatus: 'pending',
    mealPreference: '',
    plusOne: false,
    gender: 'male'
  });

  // Update form data when editing guest changes
  useEffect(() => {
    if (editingGuest) {
      setFormData({
        name: editingGuest.name,
        email: editingGuest.email,
        phone: editingGuest.phone,
        rsvpStatus: editingGuest.rsvpStatus,
        mealPreference: editingGuest.mealPreference || '',
        plusOne: editingGuest.plusOne,
        gender: editingGuest.gender || 'male'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        rsvpStatus: 'pending',
        mealPreference: '',
        plusOne: false,
        gender: 'male'
      });
    }
  }, [editingGuest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate guest (only for new guests, not when editing)
    if (!editingGuest) {
      const isDuplicate = existingGuests.some(guest => 
        guest.name.toLowerCase().trim() === formData.name.toLowerCase().trim() ||
        guest.email.toLowerCase().trim() === formData.email.toLowerCase().trim() ||
        guest.phone.replace(/\D/g, '') === formData.phone.replace(/\D/g, '')
      );
      
      if (isDuplicate) {
        alert('A guest with this name, email, or phone number already exists. Please check the existing guest list.');
        return;
      }
    }
    
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
            className="bg-surface border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[45vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-text-primary">
                {editingGuest ? 'Edit Guest' : 'Add New Guest'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
                  
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Name *
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
                      Email *
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
                </div>

                {/* Right Column - Additional Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Additional Details</h3>
                  
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
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-surface border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.plusOne}
                        onChange={(e) => handleInputChange('plusOne')(e)}
                        className="w-5 h-5 text-primary bg-surface border-white/20 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium text-text-primary">Plus One</span>
                    </label>
                  </div>

                  {/* Table Assignment */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Table Assignment
                    </label>
                    <select
                      value={formData.table || ''}
                      onChange={(e) => handleInputChange('table')(e)}
                      className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select table...</option>
                      <option value="A1">Table A1</option>
                      <option value="A2">Table A2</option>
                      <option value="A3">Table A3</option>
                      <option value="B1">Table B1</option>
                    </select>
                  </div>

                  {/* Side Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Side
                    </label>
                    <select
                      value={formData.side || ''}
                      onChange={(e) => handleInputChange('side')(e)}
                      className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select side...</option>
                      <option value="Bride">Bride</option>
                      <option value="Groom">Groom</option>
                    </select>
                  </div>

                  {/* WhatsApp Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp || ''}
                      onChange={(e) => handleInputChange('whatsapp')(e)}
                      placeholder="Enter WhatsApp number (optional)"
                      className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Address Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address')(e)}
                      placeholder="Enter address (optional)"
                      className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => handleInputChange('notes')(e)}
                      placeholder="Enter notes (optional)"
                      rows={3}
                      className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
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
                  {editingGuest ? 'Update Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
