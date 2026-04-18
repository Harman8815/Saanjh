'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

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
}

export default function DayView({ currentDate, timeSlots, events, getEventsForDate, getStatusColor }: DayViewProps) {
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
                        className={`absolute left-0 right-0 rounded-xl p-3 mx-2 border ${getEventColorClasses(event)}`}
                        style={{ height: `90%`, top:'5%' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary">{event.title}</span>
                          <span className="text-xs text-text-secondary">{event.time}</span>
                        </div>
                        <div className="text-sm text-text-secondary my-1 flex items-center gap-2">
                          <MapPin size={12} />
                          {event.location}
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
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-text-primary text-sm">{event.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
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
