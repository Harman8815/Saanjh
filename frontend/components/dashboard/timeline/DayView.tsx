'use client';

import { motion } from 'framer-motion';
import { MapPin, Eye, Edit3, Trash2 } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'milestone' | 'planning' | 'ceremony' | 'reception';
  color?: string;
}

// Get color classes based on event color or category
const getEventColorClasses = (event: Event): string => {
  if (event.color) {
    switch (event.color) {
      case 'rose': return 'bg-rose-500/20 border-rose-500/30';
      case 'blue': return 'bg-blue-500/20 border-blue-500/30';
      case 'violet': return 'bg-violet-500/20 border-violet-500/30';
      case 'amber': return 'bg-amber-500/20 border-amber-500/30';
      case 'emerald': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'cyan': return 'bg-cyan-500/20 border-cyan-500/30';
      case 'pink': return 'bg-pink-500/20 border-pink-500/30';
      case 'orange': return 'bg-orange-500/20 border-orange-500/30';
      case 'indigo': return 'bg-indigo-500/20 border-indigo-500/30';
      case 'teal': return 'bg-teal-500/20 border-teal-500/30';
      default: return 'bg-rose-500/20 border-rose-500/30';
    }
  }
  // Fallback to category colors
  switch (event.category) {
    case 'milestone': return 'bg-rose-500/20 border-rose-500/30';
    case 'planning': return 'bg-blue-500/20 border-blue-500/30';
    case 'ceremony': return 'bg-violet-500/20 border-violet-500/30';
    case 'reception': return 'bg-amber-500/20 border-amber-500/30';
    default: return 'bg-slate-500/20 border-slate-500/30';
  }
};

interface DayViewProps {
  currentDate: Date;
  timeSlots: number[];
  events: Event[];
  getEventsForDate: (date: Date) => Event[];
  getStatusColor: (status: string) => string;
  onEventClick?: (event: Event) => void;
  onEventView?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (event: Event) => void;
}

export default function DayView({ currentDate, timeSlots, events, getEventsForDate, getStatusColor, onEventClick, onEventView, onEventEdit, onEventDelete }: DayViewProps) {
  const handleEventClick = (event: Event) => {
    onEventClick?.(event);
  };

  const handleView = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    onEventView?.(event);
  };

  const handleEdit = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    onEventEdit?.(event);
  };

  const handleDelete = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    onEventDelete?.(event);
  };
  const dayEvents = getEventsForDate(currentDate);
  const formatTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    return time;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Time Schedule */}
      <div className="col-span-2 glass-card p-6 rounded-3xl">
        <div className="p-4 border-b border-white/10 mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
        </div>
        <div className="relative h-[600px] overflow-y-auto">
          <div className="relative">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-20 border-b border-white/5 flex">
                <span className="text-xs text-text-secondary w-12 pt-2">{formatTime(`${hour}:00`)}</span>
                <div className="flex-1 relative">
                  {(() => {
                    const hourEvents = dayEvents.filter(event => {
                      const eventHour = parseInt(event.time.split(':')[0]);
                      return eventHour === hour;
                    });
                    return hourEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`absolute left-0 right-0 rounded-xl p-3 mx-2 border cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between ${getEventColorClasses(event)}`}
                        style={{ height: `90%`, top:'5%' }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-text-primary truncate flex-1">{event.title}</span>
                            <span className="text-xs text-text-secondary ml-2 flex-shrink-0">{event.time}</span>
                          </div>
                          <div className="text-sm text-text-secondary flex items-center gap-2">
                            <MapPin size={12} />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        {/* Action Icons */}
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <button
                            onClick={(e) => handleView(e, event)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={(e) => handleEdit(e, event)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, event)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-text-secondary hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day Sidebar */}
      <div className="space-y-4 w-full col-span-2 lg:col-span-1">
        <div className="glass-card p-6 rounded-3xl w-full">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Day Overview</h4>
          {dayEvents.length > 0 ? (
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-text-primary text-sm">{event.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleView(e, event)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => handleEdit(e, event)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, event)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-text-secondary hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">{event.time} · {event.location}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No events for this day</p>
          )}
        </div>

        <div className="glass-card p-6 rounded-3xl w-full">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Statistics</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Events</span>
              <span className="text-2xl font-bold text-text-primary">{dayEvents.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Milestones</span>
              <span className="text-2xl font-bold text-rose-400">
                {dayEvents.filter(e => e.category === 'milestone').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
