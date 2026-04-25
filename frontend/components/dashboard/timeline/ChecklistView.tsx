'use client';

import { motion } from 'framer-motion';
import { TimelineEvent } from '../../../types/api';

interface LocalEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'milestone' | 'planning' | 'ceremony' | 'reception';
  color?: string;
}

// Transform TimelineEvent to local Event format
const transformEvent = (event: TimelineEvent): LocalEvent => {
  const typeToCategory: Record<string, 'milestone' | 'planning' | 'ceremony' | 'reception'> = {
    'milestone': 'milestone',
    'planning': 'planning',
    'ceremony': 'ceremony',
    'reception': 'reception',
    'meeting': 'planning',
    'payment': 'planning',
    'deadline': 'planning',
    'task': 'planning',
    'reminder': 'planning',
    'event': 'planning'
  };

  const statusMap: Record<string, 'completed' | 'in-progress' | 'upcoming'> = {
    'completed': 'completed',
    'pending': 'upcoming',
    'overdue': 'upcoming',
    'cancelled': 'upcoming'
  };

  return {
    id: event.id,
    title: event.title,
    date: event.date,
    location: event.location || 'TBD',
    status: statusMap[event.status] || 'upcoming',
    category: typeToCategory[event.type] || 'planning',
    color: undefined
  };
};

// Get color border class based on event color or category
const getEventBorderColor = (event: LocalEvent): string => {
  if (event.color) {
    switch (event.color) {
      case 'rose': return 'border-l-rose-500';
      case 'blue': return 'border-l-blue-500';
      case 'violet': return 'border-l-violet-500';
      case 'amber': return 'border-l-amber-500';
      case 'emerald': return 'border-l-emerald-500';
      case 'cyan': return 'border-l-cyan-500';
      case 'pink': return 'border-l-pink-500';
      case 'orange': return 'border-l-orange-500';
      case 'indigo': return 'border-l-indigo-500';
      case 'teal': return 'border-l-teal-500';
      default: return 'border-l-rose-500';
    }
  }
  // Fallback to category colors
  switch (event.category) {
    case 'milestone': return 'border-l-rose-500';
    case 'planning': return 'border-l-blue-500';
    case 'ceremony': return 'border-l-violet-500';
    case 'reception': return 'border-l-amber-500';
    default: return 'border-l-slate-500';
  }
};

interface ChecklistViewProps {
  events: TimelineEvent[];
  getStatusColor: (status: string) => string;
}

export default function ChecklistView({ events, getStatusColor }: ChecklistViewProps) {
  // Transform events to local format
  const transformedEvents = events.map(transformEvent);
  return (
    <motion.div
      key="checklist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {transformedEvents.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border border-l-4 ${getEventBorderColor(event)} transition-all duration-300 ${
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
