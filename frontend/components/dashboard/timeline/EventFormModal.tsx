'use client';

import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import { Calendar, Clock, MapPin, FileText, Tag, AlertCircle } from 'lucide-react';
import { TimelineEvent, TimelineEventCreateRequest } from '../../../types/api';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: TimelineEventCreateRequest | TimelineEvent) => void | Promise<void>;
  event?: TimelineEvent | null;
  mode: 'create' | 'edit';
}

type FormData = TimelineEventCreateRequest & { id?: number };

const initialFormData: FormData = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  type: 'event',
  priority: 'medium',
  location: '',
  description: '',
  notes: '',
  attendees: []
};

export default function EventFormModal({ isOpen, onClose, onSubmit, event, mode }: EventFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time || '09:00',
        type: event.type,
        priority: event.priority || 'medium',
        location: event.location || '',
        description: event.description || '',
        notes: event.notes || '',
        attendees: event.attendees || []
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [event, mode, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (mode === 'edit' && event) {
        // Merge form data with existing event to create a complete TimelineEvent
        const updatedEvent: TimelineEvent = {
          ...event,
          ...formData,
          id: event.id,
          status: event.status,
          created_at: event.created_at,
          updated_at: event.updated_at
        };
        await onSubmit(updatedEvent);
      } else {
        await onSubmit(formData);
      }
      onClose();
    }
  };

  const handleChange = (field: keyof FormData, value: string | number | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const inputClasses = (field: string) => `
    w-full px-4 py-2.5 bg-white/5 border rounded-xl text-text-primary placeholder-text-muted
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
    transition-all ${errors[field] ? 'border-red-500/50' : 'border-white/10'}
  `;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Event' : 'Edit Event'}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            {mode === 'create' ? 'Create Event' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <FileText size={16} />
            Event Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Wedding Ceremony"
            className={inputClasses('title')}
          />
          {errors.title && (
            <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
              <AlertCircle size={12} /> {errors.title}
            </p>
          )}
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <Calendar size={16} />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={inputClasses('date')}
            />
            {errors.date && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                <AlertCircle size={12} /> {errors.date}
              </p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <Clock size={16} />
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className={inputClasses('time')}
            />
            {errors.time && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                <AlertCircle size={12} /> {errors.time}
              </p>
            )}
          </div>
        </div>

        {/* Type & Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <Tag size={16} />
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value as any)}
              className={inputClasses('type')}
            >
              <option value="event">Event</option>
              <option value="meeting">Meeting</option>
              <option value="payment">Payment</option>
              <option value="deadline">Deadline</option>
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <AlertCircle size={16} />
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as any)}
              className={inputClasses('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <MapPin size={16} />
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., Grand Ballroom"
            className={inputClasses('location')}
          />
          {errors.location && (
            <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
              <AlertCircle size={12} /> {errors.location}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <FileText size={16} />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Add event details..."
            rows={3}
            className={`${inputClasses('description')} resize-none`}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <FileText size={16} />
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes..."
            rows={2}
            className={`${inputClasses('notes')} resize-none`}
          />
        </div>
      </form>
    </Modal>
  );
}
