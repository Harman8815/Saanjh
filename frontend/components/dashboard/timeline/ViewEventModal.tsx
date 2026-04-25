'use client';

import Modal from '../../../components/common/Modal';
import { Calendar, Clock, MapPin, FileText, Tag, CheckCircle2, Loader2, Circle, Edit3, Trash2 } from 'lucide-react';
import { TimelineEvent } from '../../../types/api';

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TimelineEvent | null;
  onEdit: (event: TimelineEvent) => void;
  onDelete: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'completed':
      return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Completed' };
    case 'overdue':
      return { icon: Circle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Overdue' };
    case 'cancelled':
      return { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Cancelled' };
    default:
      return { icon: Circle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Pending' };
  }
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'meeting':
      return { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Meeting' };
    case 'payment':
      return { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Payment' };
    case 'deadline':
      return { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Deadline' };
    case 'task':
      return { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Task' };
    case 'reminder':
      return { color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Reminder' };
    default:
      return { color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Event' };
  }
};

const getPriorityConfig = (priority?: string) => {
  switch (priority) {
    case 'high':
      return { color: 'text-red-400', bg: 'bg-red-500/10', label: 'High' };
    case 'medium':
      return { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Medium' };
    case 'low':
      return { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Low' };
    default:
      return { color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'None' };
  }
};

export default function ViewEventModal({ isOpen, onClose, event, onEdit, onDelete }: ViewEventModalProps) {
  if (!event) return null;

  const statusConfig = getStatusConfig(event.status);
  const typeConfig = getTypeConfig(event.type);
  const priorityConfig = getPriorityConfig(event.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Details"
      size="md"
      footer={
        <>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors mr-auto"
          >
            <Trash2 size={18} />
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(event)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Edit3 size={18} />
            Edit Event
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Title & Status */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">{event.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                <Tag size={12} />
                {typeConfig.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                <StatusIcon size={12} />
                {statusConfig.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
                {priorityConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4">
          {/* Date */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Calendar size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Date</p>
              <p className="text-text-primary font-medium">
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Time */}
          {event.time && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Time</p>
                <p className="text-text-primary font-medium">{event.time}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Location</p>
                <p className="text-text-primary font-medium">{event.location}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Description</p>
                <p className="text-text-primary">{event.description}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Notes</p>
                <p className="text-text-primary">{event.notes}</p>
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Tag size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Attendees</p>
                <p className="text-text-primary">{event.attendees.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
