'use client';

import { motion } from 'framer-motion';
import { Target, CheckSquare, Calendar, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import PremiumTimeline from './PremiumTimeline';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'milestone' | 'planning' | 'ceremony' | 'reception';
  duration?: number;
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
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Convert events to include duration if not present
  const eventsWithDuration = events.map(event => ({
    ...event,
    duration: (event as any).duration || 60, // default 1 hour
    category: (event.category === 'milestone' || event.category === 'planning') 
      ? event.category 
      : 'planning' as const
  }));

  return (
    <motion.div
      key="timeline"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <PremiumTimeline 
        events={eventsWithDuration}
        selectedDate={selectedDate}
        onEventClick={(event) => onSelectEvent(event.id)}
      />
    </motion.div>
  );
}
