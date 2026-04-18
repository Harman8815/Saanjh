'use client';

import Modal from '../../../components/common/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, eventTitle }: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Event"
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <p className="text-text-primary mb-2">
          Are you sure you want to delete this event?
        </p>
        <p className="text-lg font-medium text-text-primary mb-4">
          &ldquo;{eventTitle}&rdquo;
        </p>
        <p className="text-sm text-text-muted">
          This action cannot be undone. The event will be permanently removed from your timeline.
        </p>
      </div>
    </Modal>
  );
}
