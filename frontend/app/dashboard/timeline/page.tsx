'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar as CalendarIcon, ListTodo } from 'lucide-react';
import TimelineView from '../../../components/dashboard/timeline/TimelineView';
import CalendarView from '../../../components/dashboard/timeline/CalendarView';
import ChecklistView from '../../../components/dashboard/timeline/ChecklistView';

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

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar' | 'checklist'>('calendar');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const timelineEvents: Event[] = [
    {
      id: 1,
      title: 'Engagement Party',
      date: 'March 15, 2024',
      time: '6:00 PM',
      location: 'Rose Garden Restaurant',
      description: 'Celebrate our engagement with close friends and family',
      status: 'completed',
      category: 'milestone'
    },
    {
      id: 2,
      title: 'Venue Booking',
      date: 'April 10, 2024',
      time: '2:00 PM',
      location: 'Grand Ballroom',
      description: 'Book the perfect venue for our wedding ceremony',
      status: 'in-progress',
      category: 'planning'
    },
    {
      id: 3,
      title: 'Dress Fittings',
      date: 'May 20, 2024',
      time: '3:00 PM',
      location: 'Bridal Boutique',
      description: 'Final dress alterations and fittings',
      status: 'upcoming',
      category: 'planning'
    },
    {
      id: 4,
      title: 'Rehearsal Dinner',
      date: 'June 10, 2024',
      time: '7:00 PM',
      location: 'Grand Ballroom',
      description: 'Wedding rehearsal with wedding party',
      status: 'upcoming',
      category: 'milestone'
    },
    {
      id: 5,
      title: 'Wedding Day!',
      date: 'June 15, 2024',
      time: '4:00 PM',
      location: 'Grand Ballroom',
      description: 'The big day - our wedding ceremony and reception',
      status: 'upcoming',
      category: 'milestone'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-yellow-400';
      case 'upcoming': return 'text-blue-400';
      default: return 'text-muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milestone': return 'milestone';
      case 'planning': return 'planning';
      default: return 'default';
    }
  };

  const getEventsForDate = (date: Date) => {
    return timelineEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            <span className="text-glow">Wedding Timeline</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Plan and track every important moment leading to your special day
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'timeline'
                ? 'bg-primary text-white'
                : 'bg-surface border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Clock size={20} />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-primary text-white'
                : 'bg-surface border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <CalendarIcon size={20} />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'checklist'
                ? 'bg-primary text-white'
                : 'bg-surface border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <ListTodo size={20} />
            <span>Checklist</span>
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'timeline' && (
            <TimelineView
              events={timelineEvents}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              getStatusColor={getStatusColor}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              events={timelineEvents}
              calendarView={calendarView}
              setCalendarView={setCalendarView}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              getStatusColor={getStatusColor}
              getEventsForDate={getEventsForDate}
            />
          )}

          {activeTab === 'checklist' && (
            <ChecklistView
              events={timelineEvents}
              getStatusColor={getStatusColor}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
