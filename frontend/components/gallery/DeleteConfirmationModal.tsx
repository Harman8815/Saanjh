'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, Check } from 'lucide-react';

interface DeleteConfirmationModalProps {
  itemType: 'album' | 'media' | 'document';
  itemName: string;
  itemCount?: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({ 
  itemType, 
  itemName, 
  itemCount, 
  isOpen, 
  onClose, 
  onConfirm,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const requiredConfirmText = itemType === 'album' ? 'DELETE' : itemType === 'media' ? 'DELETE MEDIA' : 'DELETE DOCUMENT';
  const isConfirmed = itemType === 'album' 
    ? confirmText === requiredConfirmText && isChecked
    : isChecked;

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    
    onConfirm();
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      setIsChecked(false);
      onClose();
    }
  };

  if (!isOpen) return null;

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
          className="bg-surface border border-white/10 rounded-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-emotional font-semibold text-text-primary">
                    Delete {itemType === 'album' ? 'Album' : 'Media'}
                  </h2>
                  <p className="text-text-muted text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Warning Message */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium mb-1">
                    {itemType === 'album' ? 'Album Deletion Warning' : itemType === 'media' ? 'Media Deletion Warning' : 'Document Deletion Warning'}
                  </p>
                  <p className="text-red-300 text-sm">
                    {itemType === 'album' 
                      ? `Deleting "${itemName}" will permanently remove the album and all its ${itemCount || 0} media items. This action cannot be undone.`
                      : itemType === 'media'
                      ? `This will permanently delete the selected media item${itemCount && itemCount > 1 ? `s (${itemCount} items)` : ''}. This action cannot be undone.`
                      : `This will permanently delete the document "${itemName}". This action cannot be undone.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="bg-background/30 rounded-lg p-4">
              <p className="text-text-primary font-medium">{itemName}</p>
              {itemCount && (
                <p className="text-text-muted text-sm">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} will be deleted
                </p>
              )}
            </div>

            {/* Album Confirmation (Additional Security) */}
            {itemType === 'album' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-text-primary font-medium mb-2">
                    Type "DELETE" to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="Type DELETE"
                    className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-3 bg-background/30 rounded-lg">
              <button
                type="button"
                onClick={() => setIsChecked(!isChecked)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? 'bg-red-500 border-red-500'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {isChecked && <Check size={12} className="text-white" />}
              </button>
              <label className="text-text-muted text-sm cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
                I understand that this action is permanent and cannot be undone
              </label>
            </div>

            {/* Additional Warning */}
            <div className="text-center">
              <p className="text-text-muted text-xs">
                {itemType === 'album' 
                  ? 'All photos, videos, and album data will be permanently deleted'
                  : itemType === 'media'
                  ? 'Media files will be permanently removed from the album'
                  : 'The document file will be permanently deleted from your storage'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-surface border border-white/10 text-text-primary rounded-lg hover:bg-background/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isConfirmed || isDeleting}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete {itemType === 'album' ? 'Album' : itemType === 'media' ? 'Media' : 'Document'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
