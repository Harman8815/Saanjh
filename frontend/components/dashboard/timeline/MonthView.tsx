'use client';

import { motion } from 'framer-motion';

interface Event {
  id: number;
  title: string;
  category: 'milestone' | 'planning' | 'ceremony' | 'reception';
}

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
                  className={`text-xs px-2 py-0.5 rounded truncate ${
                    event.category === 'milestone'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}
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
