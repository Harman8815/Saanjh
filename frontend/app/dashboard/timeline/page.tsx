'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckSquare, Calendar, Star, MapPin } from 'lucide-react';

export default function TimelinePage() {
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

        {/* Timeline */}
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

        {/* TODO: Add event creation */}
        {/* TODO: Add calendar view */}
        {/* TODO: Add task integration */}
        {/* TODO: Add reminder notifications */}
        {/* TODO: Add photo upload for events */}
      </div>
    </div>
  );
}
