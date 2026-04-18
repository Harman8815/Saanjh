'use client';

import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import { Calendar, Clock, MapPin, FileText, Tag, AlertCircle } from 'lucide-react';
import { Event, suggestColorFromKeywords } from '../../../types/event';
import ColorPicker from './ColorPicker';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<Event, 'id'> & { id?: number }) => void;
  event?: Event | null;
  mode: 'create' | 'edit';
}

type FormData = Omit<Event, 'id'> & { id?: number };

const initialFormData: FormData = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  duration: 60,
  location: '',
  description: '',
  status: 'upcoming',
  category: 'planning',
  color: undefined
};

export default function EventFormModal({ isOpen, onClose, onSubmit, event, mode }: EventFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData(event);
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
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.duration < 15) newErrors.duration = 'Minimum 15 minutes';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleChange = (field: keyof FormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Auto-suggest color when title changes (only if no color is selected)
  const handleTitleChange = (value: string) => {
    handleChange('title', value);
    if (!formData.color && value.trim()) {
      const suggestedColor = suggestColorFromKeywords(value);
      if (suggestedColor !== 'rose') { // Only auto-apply if it's a meaningful suggestion
        handleChange('color', suggestedColor);
      }
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
            onChange={(e) => handleTitleChange(e.target.value)}
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

        {/* Duration & Location Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <Clock size={16} />
              Duration (minutes)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              className={inputClasses('duration')}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>
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
        </div>

        {/* Category & Status Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <Tag size={16} />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={inputClasses('category')}
            >
              <option value="milestone">Milestone</option>
              <option value="planning">Planning</option>
              <option value="ceremony">Ceremony</option>
              <option value="reception">Reception</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <AlertCircle size={16} />
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={inputClasses('status')}
            >
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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

        {/* Color Picker */}
        <ColorPicker
          value={formData.color}
          onChange={(color) => handleChange('color', color)}
          title={formData.title}
          description={formData.description}
        />
      </form>
    </Modal>
  );
}
