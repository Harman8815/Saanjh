'use client';

import { motion } from 'framer-motion';
import { Target, CheckSquare, Calendar, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import PremiumTimeline from './PremiumTimeline';
import { TimelineEvent } from '../../../types/api';

interface TimelineViewProps {
  events: TimelineEvent[];
  selectedEvent: number;
  onSelectEvent: (id: number) => void;
  getStatusColor: (status: string) => string;
  getCategoryIcon?: (category: string) => React.ReactNode;
}

// Transform TimelineEvent to PremiumTimeline Event format
const transformEvent = (event: TimelineEvent) => {
  // Map API type to category
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

  // Map API status to PremiumTimeline status
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
    time: event.time || '09:00 AM',
    duration: 60, // Default duration since API doesn't provide it
    location: event.location || 'TBD',
    description: event.description || '',
    status: statusMap[event.status] || 'upcoming',
    category: typeToCategory[event.type] || 'planning',
    color: undefined
  };
};

export default function TimelineView({
  events,
  selectedEvent,
  onSelectEvent,
  getStatusColor,
  getCategoryIcon: customCategoryIcon
}: TimelineViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Transform events to PremiumTimeline format
  const transformedEvents = events.map(transformEvent);

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
        events={transformedEvents}
        selectedDate={selectedDate}
        onEventClick={(event) => onSelectEvent(event.id)}
      />
    </motion.div>
  );
}
