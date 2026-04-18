'use client';

import Modal from '../../../components/common/Modal';
import { Calendar, Clock, MapPin, FileText, Tag, CheckCircle2, Loader2, Circle, Edit3, Trash2, Palette } from 'lucide-react';
import { Event, getEventColor } from '../../../types/event';

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: () => void;
  onDelete: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'completed':
      return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Completed' };
    case 'in-progress':
      return { icon: Loader2, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'In Progress' };
    default:
      return { icon: Circle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Upcoming' };
  }
};

const getCategoryConfig = (category: string) => {
  switch (category) {
    case 'milestone':
      return { color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Milestone' };
    case 'planning':
      return { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Planning' };
    case 'ceremony':
      return { color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Ceremony' };
    case 'reception':
      return { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Reception' };
    default:
      return { color: 'text-slate-400', bg: 'bg-slate-500/10', label: category };
  }
};

const formatTime = (time: string, duration: number): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;
  
  const formatMinutes = (mins: number): string => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatMinutes(startMinutes)} - ${formatMinutes(endMinutes)}`;
};

export default function ViewEventModal({ isOpen, onClose, event, onEdit, onDelete }: ViewEventModalProps) {
  if (!event) return null;

  const statusConfig = getStatusConfig(event.status);
  const categoryConfig = getCategoryConfig(event.category);
  const StatusIcon = statusConfig.icon;
  const eventColor = getEventColor(event.color);

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
            onClick={onEdit}
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
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.color}`}>
                <Tag size={12} />
                {categoryConfig.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                <StatusIcon size={12} className={event.status === 'in-progress' ? 'animate-spin' : ''} />
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Color Indicator */}
        {event.color && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: eventColor.hex + '20' }}
            >
              <Palette size={20} style={{ color: eventColor.hex }} />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Event Color</p>
              <p className="text-text-primary font-medium">{eventColor.name}</p>
            </div>
          </div>
        )}

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
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Time</p>
              <p className="text-text-primary font-medium">{formatTime(event.time, event.duration)}</p>
              <p className="text-xs text-text-muted">{event.duration} minutes</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Location</p>
              <p className="text-text-primary font-medium">{event.location}</p>
            </div>
          </div>

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
        </div>
      </div>
    </Modal>
  );
}
