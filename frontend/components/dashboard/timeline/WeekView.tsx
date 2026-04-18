'use client';

import { motion } from 'framer-motion';

interface Event {
  id: number;
  title: string;
  time: string;
  category: 'milestone' | 'planning' | 'ceremony' | 'reception';
  color?: string;
}

// Get color classes based on event color or category
const getEventColorClasses = (event: Event): string => {
  if (event.color) {
    switch (event.color) {
      case 'rose': return 'bg-rose-500/20 border-rose-500/30 text-rose-300';
      case 'blue': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'violet': return 'bg-violet-500/20 border-violet-500/30 text-violet-300';
      case 'amber': return 'bg-amber-500/20 border-amber-500/30 text-amber-300';
      case 'emerald': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300';
      case 'cyan': return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300';
      case 'pink': return 'bg-pink-500/20 border-pink-500/30 text-pink-300';
      case 'orange': return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
      case 'indigo': return 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300';
      case 'teal': return 'bg-teal-500/20 border-teal-500/30 text-teal-300';
      default: return 'bg-rose-500/20 border-rose-500/30 text-rose-300';
    }
  }
  // Fallback to category colors
  switch (event.category) {
    case 'milestone': return 'bg-rose-500/20 border-rose-500/30 text-rose-300';
    case 'planning': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    case 'ceremony': return 'bg-violet-500/20 border-violet-500/30 text-violet-300';
    case 'reception': return 'bg-amber-500/20 border-amber-500/30 text-amber-300';
    default: return 'bg-slate-500/20 border-slate-500/30 text-slate-300';
  }
};

interface WeekDay {
  date: Date;
  events: Event[];
  isToday: boolean;
}

interface WeekViewProps {
  weekDays: WeekDay[];
  timeSlots: number[];
}

export default function WeekView({ weekDays, timeSlots }: WeekViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 rounded-3xl overflow-hidden"
    >
      <div className="grid grid-cols-8 border-b border-white/10 pb-4 mb-4">
        <div className="text-center">
          <span className="text-sm text-text-secondary">Time</span>
        </div>
        {weekDays.map((day, i) => (
          <div key={i} className={`text-center p-2 rounded-lg ${day.isToday ? 'bg-primary/20' : ''}`}>
            <div className="text-sm text-text-secondary">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className={`text-lg font-semibold ${day.isToday ? 'text-primary' : 'text-text-primary'}`}>
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="relative h-[500px] overflow-y-auto">
        <div className="grid grid-cols-8">
          {/* Time Column */}
          <div className="border-r border-white/10">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-16 flex items-start justify-center pt-1">
                <span className="text-xs text-text-secondary">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-white/10 min-h-[384px]">
              {timeSlots.map((hour) => (
                <div key={hour} className="h-16 border-b border-white/5" />
              ))}

              {/* Events */}
              {day.events.map((event) => {
                const [hours, minutes] = event.time.split(':').map(Number);
                const startHour = hours + (minutes / 60);
                const durationHours = 2;
                return (
                  <div
                    key={event.id}
                    className={`absolute left-1 right-1 rounded-lg p-2 text-xs border ${getEventColorClasses(event)}`}
                    style={{ top: `${startHour * 64}px`, height: `${durationHours * 64}px` }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-text-secondary">{event.time}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
