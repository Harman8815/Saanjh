'use client';

import { motion } from 'framer-motion';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'milestone' | 'planning';
}

interface ChecklistViewProps {
  events: Event[];
  getStatusColor: (status: string) => string;
}

export default function ChecklistView({ events, getStatusColor }: ChecklistViewProps) {
  return (
    <motion.div
      key="checklist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
            event.status === 'completed'
              ? 'bg-slate-900/30 border-white/5'
              : 'bg-surface/50 border-white/10 hover:border-primary/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={event.status === 'completed'}
              className="w-5 h-5 rounded border-white/20 bg-surface text-primary focus:ring-primary"
              readOnly
            />
            <div className="flex-1">
              <h4 className={`font-medium ${event.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                {event.title}
              </h4>
              <p className="text-sm text-text-muted">{event.date} · {event.location}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
