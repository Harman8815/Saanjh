'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, Tag, FileText, Image as ImageIcon, Video } from 'lucide-react';

interface Album {
  id: string;
  title: string;
  description: string;
  date: string;
  coverImage: string;
  imageCount: number;
  videoCount: number;
  tags: string[];
  featured: boolean;
  event: string;
}

interface EditAlbumModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAlbum: Album) => void;
}

const eventOptions = [
  'Pre-Wedding',
  'Wedding Day', 
  'Post-Wedding',
  'Engagement',
  'Reception'
];

const commonTags = [
  'Ceremony', 'Traditional', 'Family', 'Friends', 'Couple', 
  'Romantic', 'Portrait', 'Music', 'Dance', 'Celebration',
  'Cultural', 'Sacred', 'Vows', 'Entertainment', 'Art'
];

export default function EditAlbumModal({ album, isOpen, onClose, onSave }: EditAlbumModalProps) {
  const [formData, setFormData] = useState<Album>({
    id: '',
    title: '',
    description: '',
    date: '',
    coverImage: '',
    imageCount: 0,
    videoCount: 0,
    tags: [],
    featured: false,
    event: ''
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when album changes
  useEffect(() => {
    if (album) {
      setFormData({ ...album });
    }
  }, [album]);

  const handleInputChange = (field: keyof Album, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !album) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-emotional font-semibold text-text-primary">
                Edit Album
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Album Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter album title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Describe this album..."
                rows={3}
              />
            </div>

            {/* Date and Event */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Event Type
                </label>
                <select
                  value={formData.event}
                  onChange={(e) => handleInputChange('event', e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  {eventOptions.map(event => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Media Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <ImageIcon size={20} className="text-primary" />
                  <div>
                    <p className="text-text-primary font-medium">{formData.imageCount}</p>
                    <p className="text-text-muted text-sm">Photos</p>
                  </div>
                </div>
              </div>
              <div className="bg-background/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Video size={20} className="text-primary" />
                  <div>
                    <p className="text-text-primary font-medium">{formData.videoCount}</p>
                    <p className="text-text-muted text-sm">Videos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
              <div>
                <p className="text-text-primary font-medium">Featured Album</p>
                <p className="text-text-muted text-sm">Display this album prominently</p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('featured', !formData.featured)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.featured ? 'bg-primary' : 'bg-surface border border-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.featured ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                <Tag size={16} className="inline mr-1" />
                Tags
              </label>
              
              {/* Add Tag Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-background/50 border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Current Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary/80 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Common Tags */}
              <div>
                <p className="text-text-muted text-sm mb-2">Common tags:</p>
                <div className="flex flex-wrap gap-2">
                  {commonTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(tag)) {
                          handleInputChange('tags', [...formData.tags, tag]);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-background/50 text-text-muted hover:text-text-primary hover:bg-background/70'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-surface border border-white/10 text-text-primary rounded-xl hover:bg-background/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
