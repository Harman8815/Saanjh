'use client';

import { motion } from 'framer-motion';
import { Target, CheckSquare, Calendar, MapPin, Star } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'milestone' | 'planning';
}

interface TimelineViewProps {
  events: Event[];
  selectedEvent: number;
  onSelectEvent: (id: number) => void;
  getStatusColor: (status: string) => string;
  getCategoryIcon?: (category: string) => React.ReactNode;
}

export default function TimelineView({ 
  events, 
  selectedEvent, 
  onSelectEvent,
  getStatusColor,
  getCategoryIcon: customCategoryIcon 
}: TimelineViewProps) {
  const getCategoryIcon = (category: string) => {
    if (customCategoryIcon) return customCategoryIcon(category);
    switch (category) {
      case 'milestone': return <Target size={24} className="text-rose-400" />;
      case 'planning': return <CheckSquare size={24} className="text-blue-400" />;
      default: return <Calendar size={24} className="text-text-muted" />;
    }
  };
  return (
    <motion.div
      key="timeline"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary" />
      
      {/* Timeline Events */}
      <div className="space-y-8">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative flex items-center gap-6"
          >
            {/* Timeline Dot */}
            <div className="relative">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                selectedEvent === event.id
                  ? 'bg-primary ring-4 ring-primary/30'
                  : 'bg-surface'
              }`}>
                <div className="text-2xl">{getCategoryIcon(event.category)}</div>
              </div>
              {index < events.length - 1 && (
                <div className="absolute top-16 left-8 w-0.5 h-8 bg-gradient-to-b from-primary to-secondary" />
              )}
            </div>

            {/* Event Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              className={`flex-1 glass-card p-6 cursor-pointer hover:scale-105 transition-transform ${
                selectedEvent === event.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectEvent(event.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">{event.title}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted">{event.date}</span>
                    <span className="text-muted">{event.time}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-gold"><Star size={20} /></div>
              </div>
              
              <p className="text-text-muted mb-4">{event.description}</p>
              
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted"><MapPin size={16} className="mr-1" />{event.location}</span>
                <button className="btn-secondary btn-sm">
                  View Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
