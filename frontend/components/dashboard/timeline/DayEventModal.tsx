'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Edit3, Trash2, Plus, ArrowLeft, Calendar, Clock, MapPin, FileText, Tag, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { TimelineEvent } from '../../../types/api';

interface DayEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  events: TimelineEvent[];
  onCreateEvent: () => void;
  onViewEvent: (event: TimelineEvent) => void;
  onEditEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (event: TimelineEvent) => void;
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

export default function DayEventModal({
  isOpen,
  onClose,
  selectedDate,
  events,
  onCreateEvent,
  onViewEvent,
  onEditEvent,
  onDeleteEvent
}: DayEventModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const listScrollRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes or date changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedEvent(null);
      setShowDetails(false);
    }
  }, [isOpen, selectedDate]);

  // Preserve scroll position when switching views
  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleBack = () => {
    setShowDetails(false);
    setSelectedEvent(null);
  };

  const handleView = (e: React.MouseEvent, event: TimelineEvent) => {
    e.stopPropagation();
    handleEventClick(event);
  };

  const handleEdit = (e: React.MouseEvent, event: TimelineEvent) => {
    e.stopPropagation();
    onEditEvent(event);
  };

  const handleDelete = (e: React.MouseEvent, event: TimelineEvent) => {
    e.stopPropagation();
    console.log('DayEventModal handleDelete - event object:', event);
    console.log('DayEventModal handleDelete - event.id:', event.id);
    console.log('DayEventModal handleDelete - event keys:', Object.keys(event));
    onDeleteEvent(event);
  };

  const hasEvents = events.length > 0;
  
  // Modal size logic
  const modalWidth = 'w-[70%]'; // Fixed 70% width (between 60-80%)
  const modalHeight = hasEvents ? 'min-h-[75vh]' : 'aspect-square'; // Square if no events, 75% min-height if events exist

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`${modalWidth} ${modalHeight} bg-surface/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl pointer-events-auto overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {showDetails && (
                    <button
                      onClick={handleBack}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                    >
                      <ArrowLeft size={20} className="text-text-secondary" />
                    </button>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {formatDate(selectedDate)}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {hasEvents ? `${events.length} event${events.length !== 1 ? 's' : ''}` : 'No events scheduled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex">
                {/* Event List (Left Side) */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: showDetails ? '50%' : '100%' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className={`flex flex-col border-r border-white/5 ${showDetails ? 'hidden lg:flex' : 'flex'}`}
                >
                  {/* Add Event Button */}
                  <div className="p-4 border-b border-white/5 flex-shrink-0">
                    <button
                      onClick={onCreateEvent}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
                    >
                      <Plus size={18} />
                      Add Event
                    </button>
                  </div>

                  {/* Events List */}
                  <div ref={listScrollRef} className="flex-1 overflow-y-auto p-4">
                    {hasEvents ? (
                      <div className="space-y-2">
                        {events.map((event) => {
                          const statusConfig = getStatusConfig(event.status);
                          const typeConfig = getTypeConfig(event.type);
                          const isSelected = selectedEvent?.id === event.id;
                          
                          return (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              onClick={() => handleEventClick(event)}
                              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                                isSelected
                                  ? 'bg-primary/20 border-primary/30 ring-1 ring-primary/50'
                                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-text-primary truncate">{event.title}</h4>
                                  {event.time && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                                      <Clock size={14} />
                                      {event.time}
                                    </div>
                                  )}
                                  {event.location && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                                      <MapPin size={14} />
                                      <span className="truncate">{event.location}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                                      <Tag size={10} />
                                      {typeConfig.label}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                      {statusConfig.label}
                                    </span>
                                  </div>
                                </div>

                                {/* Action Icons */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={(e) => handleView(e, event)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
                                    title="View"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => handleEdit(e, event)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
                                    title="Edit"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDelete(e, event)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-text-secondary hover:text-red-400"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Calendar size={48} className="text-text-muted mb-4" />
                        <p className="text-text-muted mb-2">No events for this day</p>
                        <p className="text-sm text-text-secondary">Click "Add Event" to create one</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Event Details (Right Side) */}
                <AnimatePresence>
                  {showDetails && selectedEvent && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '50%', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="flex flex-col bg-white/[0.02] lg:flex hidden"
                    >
                      <div className="flex-1 overflow-y-auto p-6">
                        {selectedEvent && <EventDetailContent event={selectedEvent} />}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Detail View */}
              <AnimatePresence>
                {showDetails && selectedEvent && (
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-surface/95 backdrop-blur-xl lg:hidden flex flex-col"
                  >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                      <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <ArrowLeft size={20} />
                        Back
                      </button>
                      <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <X size={20} className="text-text-secondary" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      {selectedEvent && <EventDetailContent event={selectedEvent} />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Separate component for event details content to avoid duplication
function EventDetailContent({ event }: { event: TimelineEvent }) {
  const statusConfig = getStatusConfig(event.status);
  const typeConfig = getTypeConfig(event.type);
  const priorityConfig = getPriorityConfig(event.priority);
  const StatusIcon = statusConfig.icon;

  return (
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
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
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
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
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
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
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
  );
}
