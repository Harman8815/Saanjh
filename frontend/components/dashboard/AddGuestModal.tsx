'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { Guest } from '../../types/api';
import { GuestService } from '../../services/guests';
import { Table, RsvpStatus } from '../../types/api';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestAdded?: (guest: Guest) => void;
  existingGuests?: Guest[];
  editingGuest?: Guest | null;
}

interface GuestFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  relationship: string;
  address: string;
  dietary_restrictions: string;
  notes: string;
  rsvp_status_id?: number;
  table_id?: number | null;
  meal_ids?: number[];
}

export default function AddGuestModal({ isOpen, onClose, onGuestAdded, existingGuests = [], editingGuest }: AddGuestModalProps) {
  const [formData, setFormData] = useState<GuestFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    relationship: 'family',
    address: '',
    dietary_restrictions: '',
    notes: '',
    rsvp_status_id: 1, // Default to pending
    table_id: null,
    meal_ids: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [rsvpStatuses, setRsvpStatuses] = useState<RsvpStatus[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Fetch tables and RSVP statuses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [tablesData, rsvpData] = await Promise.all([
        GuestService.getAllTables(),
        GuestService.getRsvpStatuses()
      ]);
      setTables(Array.isArray(tablesData) ? tablesData : []);
      setRsvpStatuses(Array.isArray(rsvpData) ? rsvpData : []);
    } catch (error) {
      console.error('Error fetching options:', error);
      setTables([]);
      setRsvpStatuses([]);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Update form data when editing guest changes
  useEffect(() => {
    if (editingGuest) {
      setFormData({
        first_name: editingGuest.first_name || '',
        last_name: editingGuest.last_name || '',
        email: editingGuest.email || '',
        phone: editingGuest.phone || '',
        relationship: editingGuest.relationship || 'family',
        address: editingGuest.address || '',
        dietary_restrictions: editingGuest.dietary_restrictions || '',
        notes: editingGuest.notes || '',
        rsvp_status_id: editingGuest.rsvp_status_id || 1,
        table_id: editingGuest.table_id || null,
        meal_ids: editingGuest.meal_ids || []
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        relationship: 'family',
        address: '',
        dietary_restrictions: '',
        notes: '',
        rsvp_status_id: 1,
        table_id: null,
        meal_ids: []
      });
    }
    setErrors({});
  }, [editingGuest, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
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
      let savedGuest: Guest;
      
      if (editingGuest) {
        // Update existing guest - use update structure with rsvp_status_id and table_id
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          relationship: formData.relationship,
          address: formData.address,
          dietary_restrictions: formData.dietary_restrictions,
          notes: formData.notes,
          rsvp_status_id: formData.rsvp_status_id,
          table_id: formData.table_id,
          meal_ids: formData.meal_ids
        };
        savedGuest = await GuestService.updateGuest(editingGuest.id, updateData);
      } else {
        // Create new guest - use create structure without rsvp_status_id and table_id
        const createData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          relationship: formData.relationship,
          address: formData.address,
          dietary_restrictions: formData.dietary_restrictions,
          notes: formData.notes,
          meal_ids: formData.meal_ids
        };
        savedGuest = await GuestService.createGuest(createData);
      }
      
      // Callback to parent component
      if (onGuestAdded) {
        onGuestAdded(savedGuest);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving guest:', error);
      setErrors({ submit: error.message || 'Failed to save guest. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof GuestFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.type === 'number'
      ? Number(e.target.value)
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {errors.submit}
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
                  
                  {/* First Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name')(e)}
                      placeholder="Enter first name"
                      className={`w-full px-4 py-3 bg-surface border ${errors.first_name ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
                      required
                    />
                    {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>}
                  </div>

                  {/* Last Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name')(e)}
                      placeholder="Enter last name"
                      className={`w-full px-4 py-3 bg-surface border ${errors.last_name ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
                      required
                    />
                    {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name}</p>}
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
                      className={`w-full px-4 py-3 bg-surface border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
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

                  {/* Relationship Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Relationship
                    </label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => handleInputChange('relationship')(e)}
                      className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="family">Family</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* RSVP Status Selection (for editing) */}
                  {editingGuest && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        RSVP Status
                      </label>
                      <select
                        value={formData.rsvp_status_id}
                        onChange={(e) => handleInputChange('rsvp_status_id')(e)}
                        disabled={isLoadingOptions}
                        className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      >
                        {isLoadingOptions ? (
                          <option value="">Loading...</option>
                        ) : (
                          rsvpStatuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}

                  {/* Table Assignment (for editing) */}
                  {editingGuest && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Table Assignment
                      </label>
                      <select
                        value={formData.table_id || ''}
                        onChange={(e) => handleInputChange('table_id')(e)}
                        disabled={isLoadingOptions}
                        className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      >
                        <option value="">No table assigned</option>
                        {isLoadingOptions ? (
                          <option value="">Loading...</option>
                        ) : (
                          tables.map((table) => (
                            <option key={table.id} value={table.id}>
                              Table {table.table_number} (Capacity: {table.capacity})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}
                </div>

                {/* Right Column - Additional Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Additional Details</h3>
                  
                  {/* Address Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address')(e)}
                      placeholder="Enter address (optional)"
                      rows={2}
                      className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Dietary Restrictions
                    </label>
                    <textarea
                      value={formData.dietary_restrictions || ''}
                      onChange={(e) => handleInputChange('dietary_restrictions')(e)}
                      placeholder="Enter dietary restrictions (optional)"
                      rows={2}
                      className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
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
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingGuest ? 'Update Guest' : 'Add Guest'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
