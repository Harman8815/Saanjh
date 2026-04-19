'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Check, AlertCircle } from 'lucide-react';

interface Album {
  id: string;
  title: string;
  description: string;
}

interface RenameAlbumModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (albumId: string, newTitle: string) => void;
}

export default function RenameAlbumModal({ 
  album, 
  isOpen, 
  onClose, 
  onRename 
}: RenameAlbumModalProps) {
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize form when album changes
  useEffect(() => {
    if (album) {
      setNewTitle(album.title);
      setError('');
    }
  }, [album]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!album) return;

    // Validation
    if (!newTitle.trim()) {
      setError('Album title cannot be empty');
      return;
    }

    if (newTitle.trim() === album.title) {
      setError('Album title has not changed');
      return;
    }

    if (newTitle.trim().length < 2) {
      setError('Album title must be at least 2 characters');
      return;
    }

    if (newTitle.trim().length > 50) {
      setError('Album title must be less than 50 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    onRename(album.id, newTitle.trim());
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNewTitle(album?.title || '');
      setError('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
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
        onKeyDown={handleKeyPress}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-white/10 rounded-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Edit3 size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-emotional font-semibold text-text-primary">
                    Rename Album
                  </h2>
                  <p className="text-text-muted text-sm">
                    {album.title}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Current Title */}
            <div>
              <label className="block text-text-muted text-sm mb-2">
                Current Title
              </label>
              <div className="px-4 py-3 bg-background/30 border border-white/10 rounded-lg text-text-muted">
                {album.title}
              </div>
            </div>

            {/* New Title */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                New Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setError('');
                  }}
                  className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 transition-all ${
                    error 
                      ? 'border-red-500/50 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-primary/50 focus:ring-primary/20'
                  }`}
                  placeholder="Enter new album title"
                  autoFocus
                  maxLength={50}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted text-xs">
                  {newTitle.length}/50
                </div>
              </div>
              
              {/* Character Count Warning */}
              {newTitle.length > 40 && (
                <p className="text-text-muted text-xs mt-1">
                  Consider keeping titles concise for better display
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <AlertCircle size={16} className="text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Suggestions */}
            <div>
              <p className="text-text-muted text-sm mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  album.title.split(' ')[0] + ' Memories',
                  album.title + ' Collection',
                  'Our ' + album.title,
                  album.title + ' Moments'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setNewTitle(suggestion);
                      setError('');
                    }}
                    className="px-3 py-1 bg-background/50 border border-white/10 rounded-lg text-text-muted hover:text-text-primary hover:border-primary/50 transition-all text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-surface border border-white/10 text-text-primary rounded-lg hover:bg-background/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim() || newTitle.trim() === album.title}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Renaming...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Rename Album
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
