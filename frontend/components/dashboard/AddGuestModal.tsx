'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { Guest, GuestGroup, DietaryOption } from '../../types/api';
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
  group_id?: number | null;
  plus_one_name?: string;
  plus_one_rsvp_status_id?: number | null;
  dietary_ids?: number[];
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
    meal_ids: [],
    group_id: null,
    plus_one_name: '',
    plus_one_rsvp_status_id: null,
    dietary_ids: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [rsvpStatuses, setRsvpStatuses] = useState<RsvpStatus[]>([]);
  const [groups, setGroups] = useState<GuestGroup[]>([]);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Fetch tables, RSVP statuses, groups, and dietary options when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [tablesData, rsvpData, groupsData, dietaryData] = await Promise.all([
        GuestService.getAllTables(),
        GuestService.getRsvpStatuses(),
        GuestService.getGroups(),
        GuestService.getDietaryOptions(),
      ]);
      setTables(Array.isArray(tablesData) ? tablesData : []);
      setRsvpStatuses(Array.isArray(rsvpData) ? rsvpData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setDietaryOptions(Array.isArray(dietaryData) ? dietaryData : []);
    } catch (error) {
      console.error('Error fetching options:', error);
      setTables([]);
      setRsvpStatuses([]);
      setGroups([]);
      setDietaryOptions([]);
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
        meal_ids: editingGuest.meal_ids || [],
        group_id: editingGuest.group_id ?? editingGuest.group?.id ?? null,
        plus_one_name: editingGuest.plus_one_name || '',
        plus_one_rsvp_status_id: editingGuest.plus_one_rsvp_status_id || null,
        dietary_ids: editingGuest.dietary_ids || editingGuest.dietary_preferences?.map(d => d.id) || [],
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
        meal_ids: [],
        group_id: null,
        plus_one_name: '',
        plus_one_rsvp_status_id: null,
        dietary_ids: [],
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
      
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship,
        address: formData.address,
        dietary_restrictions: formData.dietary_restrictions,
        notes: formData.notes,
        group_id: formData.group_id,
        plus_one_name: formData.plus_one_name || undefined,
        plus_one_rsvp_status_id: formData.plus_one_rsvp_status_id || undefined,
        dietary_ids: formData.dietary_ids,
        meal_ids: formData.meal_ids,
      };

      if (editingGuest) {
        payload.rsvp_status_id = formData.rsvp_status_id;
        payload.table_id = formData.table_id;
        savedGuest = await GuestService.updateGuest(editingGuest.id, payload);
      } else {
        if (formData.rsvp_status_id) {
          payload.rsvp_status_id = formData.rsvp_status_id;
        }
        if (formData.table_id) {
          payload.table_id = formData.table_id;
        }
        savedGuest = await GuestService.createGuest(payload);
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
            className="bg-surface border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col"
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Basic Information</h3>
                  
                  {/* First Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name')(e)}
                      placeholder="Enter first name"
                      className={`w-full px-4 py-2.5 bg-surface border ${errors.first_name ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
                      required
                    />
                    {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>}
                  </div>

                  {/* Last Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name')(e)}
                      placeholder="Enter last name"
                      className={`w-full px-4 py-2.5 bg-surface border ${errors.last_name ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
                      required
                    />
                    {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name}</p>}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email')(e)}
                      placeholder="Enter email address"
                      className={`w-full px-4 py-2.5 bg-surface border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone')(e)}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-2.5 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Relationship Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Relationship
                    </label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => handleInputChange('relationship')(e)}
                      className="w-full px-4 py-2.5 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="family">Family</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Group Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Household / Group
                    </label>
                    <select
                      value={formData.group_id ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setFormData((prev) => ({ ...prev, group_id: val }));
                      }}
                      className="w-full px-4 py-2.5 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">No group assigned</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.group_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plus-One Section */}
                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <h4 className="text-sm font-semibold text-text-primary">Plus-One Details</h4>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Plus-One Guest Name
                      </label>
                      <input
                        type="text"
                        value={formData.plus_one_name || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, plus_one_name: e.target.value }))}
                        placeholder="e.g. Partner or guest name"
                        className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                    </div>
                    {formData.plus_one_name && (
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                          Plus-One RSVP Status
                        </label>
                        <select
                          value={formData.plus_one_rsvp_status_id ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : null;
                            setFormData((prev) => ({ ...prev, plus_one_rsvp_status_id: val }));
                          }}
                          className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                        >
                          <option value="">Default / Same as Guest</option>
                          {rsvpStatuses.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Seating, Dietary, Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Seating & Preferences</h3>

                  {/* RSVP Status Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      RSVP Status
                    </label>
                    <select
                      value={formData.rsvp_status_id}
                      onChange={(e) => handleInputChange('rsvp_status_id')(e)}
                      disabled={isLoadingOptions}
                      className="w-full px-4 py-2.5 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
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

                  {/* Table Assignment */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Table Assignment
                    </label>
                    <select
                      value={formData.table_id || ''}
                      onChange={(e) => handleInputChange('table_id')(e)}
                      disabled={isLoadingOptions}
                      className="w-full px-4 py-2.5 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
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

                  {/* Structured Dietary Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Dietary Preferences
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-lg border border-white/10 max-h-32 overflow-y-auto">
                      {dietaryOptions.map((opt) => {
                        const isChecked = formData.dietary_ids?.includes(opt.id);
                        return (
                          <label key={opt.id} className="flex items-center gap-2 text-xs text-text-primary cursor-pointer hover:text-primary transition-colors">
                            <input
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={(e) => {
                                const current = formData.dietary_ids || [];
                                const updated = e.target.checked
                                  ? [...current, opt.id]
                                  : current.filter((id) => id !== opt.id);
                                setFormData((prev) => ({ ...prev, dietary_ids: updated }));
                              }}
                              className="rounded border-white/20 text-primary focus:ring-primary/20"
                            />
                            <span>{opt.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dietary Restrictions (free text fallback) */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Additional Dietary Notes
                    </label>
                    <textarea
                      value={formData.dietary_restrictions || ''}
                      onChange={(e) => handleInputChange('dietary_restrictions')(e)}
                      placeholder="e.g. Severe peanut allergy"
                      rows={2}
                      className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                    />
                  </div>

                  {/* Address Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address')(e)}
                      placeholder="Enter address (optional)"
                      rows={2}
                      className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                    />
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => handleInputChange('notes')(e)}
                      placeholder="Enter notes (optional)"
                      rows={2}
                      className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-sm"
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
