'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckSquare, Calendar, Star, MapPin, Clock, ListTodo } from 'lucide-react';

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar' | 'checklist'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState(1);

  // TODO: Fetch timeline events from API
  const timelineEvents = [
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
      case 'milestone': return <Target size={24} />;
      case 'planning': return <CheckSquare size={24} />;
      default: return <Calendar size={24} />;
    }
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
            <Calendar size={20} />
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

        {/* Tab Content */}
        {activeTab === 'timeline' && (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary"></div>
            
            {/* Timeline Events */}
            <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative flex items-center gap-6"
              >
                {/* Timeline Dot */}
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedEvent === event.id
                      ? 'bg-primary ring-4 ring-primary/30'
                      : 'bg-surface'
                  }`}>
                    <div className="text-2xl">{getCategoryIcon(event.category)}</div>
                  </div>
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute top-16 left-8 w-0.5 h-8 bg-gradient-to-b from-primary to-secondary"></div>
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
                  onClick={() => setSelectedEvent(event.id)}
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
        </div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 min-h-[400px]"
          >
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
                <Calendar size={40} className="text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Calendar View</h3>
              <p className="text-text-muted max-w-md">
                Calendar view coming soon. This will display all your wedding events in a monthly/weekly calendar format.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'checklist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 glass-card hover:bg-white/5 transition-colors cursor-pointer"
              >
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
