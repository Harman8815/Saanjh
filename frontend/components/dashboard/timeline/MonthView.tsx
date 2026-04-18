'use client';

import { motion } from 'framer-motion';

interface Event {
  id: number;
  title: string;
  category: 'milestone' | 'planning' | 'ceremony' | 'reception';
  color?: string;
}

// Get color classes based on event color or category
const getEventColorClasses = (event: Event): string => {
  if (event.color) {
    switch (event.color) {
      case 'rose': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'blue': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'violet': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      case 'amber': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'emerald': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'cyan': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'pink': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'orange': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'indigo': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'teal': return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default: return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  }
  // Fallback to category colors
  switch (event.category) {
    case 'milestone': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'planning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'ceremony': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
    case 'reception': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: Event[];
}

interface MonthViewProps {
  days: DayData[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function MonthView({ days, selectedDate, onSelectDate }: MonthViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 rounded-3xl"
    >
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="px-4 py-3 text-center">
            <span className="text-sm font-medium text-text-secondary">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onSelectDate(day.date)}
            className={`relative min-h-[100px] p-3 rounded-xl border transition-all duration-200 hover:scale-105 ${
              !day.isCurrentMonth ? 'opacity-40' : ''
            } ${day.isToday ? 'bg-primary/20 border-primary/30' : 'bg-surface/50 border-white/5 hover:border-white/10'} ${day.isSelected ? 'ring-2 ring-secondary' : ''}`}
          >
            <span className={`text-sm font-medium ${day.isToday ? 'text-primary' : 'text-text-primary'}`}>
              {day.date.getDate()}
            </span>
            
            {/* Events Preview */}
            <div className="mt-1 space-y-1">
              {day.events.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className={`text-xs px-2 py-0.5 rounded truncate border ${getEventColorClasses(event)}`}
                >
                  {event.title}
                </div>
              ))}
              {day.events.length > 2 && (
                <div className="text-xs text-text-secondary">+{day.events.length - 2}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
