'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar as CalendarIcon, ListTodo, Plus } from 'lucide-react';
import TimelineView from '../../../components/dashboard/timeline/TimelineView';
import CalendarView from '../../../components/dashboard/timeline/CalendarView';
import ChecklistView from '../../../components/dashboard/timeline/ChecklistView';
import EventFormModal from '../../../components/dashboard/timeline/EventFormModal';
import ViewEventModal from '../../../components/dashboard/timeline/ViewEventModal';
import DeleteConfirmModal from '../../../components/dashboard/timeline/DeleteConfirmModal';
import { Event } from '../../../types/event';

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar' | 'checklist'>('calendar');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState<Event | null>(null);

  // Get today's date string for demo
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: 'Morning Yoga & Meditation',
      date: today,
      time: '7:00 AM',
      duration: 60,
      location: 'Garden Terrace',
      description: 'Start the day with peaceful yoga session',
      status: 'completed',
      category: 'planning'
    },
    {
      id: 2,
      title: 'Breakfast with Family',
      date: today,
      time: '8:30 AM',
      duration: 90,
      location: 'Main Dining Hall',
      description: 'Intimate breakfast with close family members',
      status: 'completed',
      category: 'milestone'
    },
    {
      id: 3,
      title: 'Hair & Makeup Session',
      date: today,
      time: '10:00 AM',
      duration: 180,
      location: 'Bridal Suite',
      description: 'Professional styling for the bride and bridesmaids',
      status: 'in-progress',
      category: 'planning'
    },
    {
      id: 4,
      title: 'Photography Session',
      date: today,
      time: '1:00 PM',
      duration: 120,
      location: 'Rose Garden',
      description: 'Pre-ceremony photos with wedding party',
      status: 'upcoming',
      category: 'planning'
    },
    {
      id: 5,
      title: 'Wedding Ceremony',
      date: today,
      time: '4:00 PM',
      duration: 60,
      location: 'Grand Ballroom',
      description: 'The main ceremony - exchanging vows',
      status: 'upcoming',
      category: 'ceremony'
    },
    {
      id: 6,
      title: 'Cocktail Hour',
      date: today,
      time: '5:30 PM',
      duration: 90,
      location: 'Sunset Terrace',
      description: 'Drinks and appetizers while couple takes photos',
      status: 'upcoming',
      category: 'reception'
    },
    {
      id: 7,
      title: 'Reception & Dinner',
      date: today,
      time: '7:00 PM',
      duration: 240,
      location: 'Grand Ballroom',
      description: 'Dinner, speeches, dancing, and celebration',
      status: 'upcoming',
      category: 'reception'
    }
  ]);

  // CRUD Functions
  const handleCreateEvent = (newEvent: Omit<Event, 'id'>) => {
    const eventWithId = { ...newEvent, id: Date.now() };
    setEvents(prev => [...prev, eventWithId as Event]);
    setIsCreateModalOpen(false);
  };

  const handleEditEvent = (updatedEvent: Omit<Event, 'id'> & { id?: number }) => {
    if (!updatedEvent.id) return;
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent as Event : e));
    setIsEditModalOpen(false);
    setSelectedEventData(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEventData) {
      setEvents(prev => prev.filter(e => e.id !== selectedEventData.id));
      setIsDeleteModalOpen(false);
      setSelectedEventData(null);
    }
  };

  const openViewModal = (event: Event) => {
    setSelectedEventData(event);
    setIsViewModalOpen(true);
  };

  const openEditModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = () => {
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
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
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-end mb-6"
        >
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Plus size={18} />
            Add Event
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'timeline' && (
            <TimelineView
              events={events}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              getStatusColor={getStatusColor}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              events={events}
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
              events={events}
              getStatusColor={getStatusColor}
            />
          )}
        </AnimatePresence>
      </div>

      {/* CRUD Modals */}
      <EventFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        mode="create"
      />

      <EventFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditEvent}
        event={selectedEventData}
        mode="edit"
      />

      <ViewEventModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        event={selectedEventData}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEvent}
        eventTitle={selectedEventData?.title || ''}
      />
    </div>
  );
}
