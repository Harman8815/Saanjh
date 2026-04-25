'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar as CalendarIcon, ListTodo, Plus } from 'lucide-react';
import TimelineView from '../../../components/dashboard/timeline/TimelineView';
import CalendarView from '../../../components/dashboard/timeline/CalendarView';
import ChecklistView from '../../../components/dashboard/timeline/ChecklistView';
import EventFormModal from '../../../components/dashboard/timeline/EventFormModal';
import ViewEventModal from '../../../components/dashboard/timeline/ViewEventModal';
import DeleteConfirmModal from '../../../components/dashboard/timeline/DeleteConfirmModal';
import { TimelineEvent, TimelineEventCreateRequest } from '../../../types/api';
import { TimelineService } from '../../../services/timeline';

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
  const [selectedEventData, setSelectedEventData] = useState<TimelineEvent | null>(null);

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch timeline events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Calculate date range based on current view and date
        let startDate: string;
        let endDate: string;
        
        if (calendarView === 'month') {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          startDate = new Date(year, month, 1).toISOString().split('T')[0];
          endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        } else if (calendarView === 'week') {
          const startOfWeek = new Date(currentDate);
          const dayOfWeek = startOfWeek.getDay();
          startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
          startDate = startOfWeek.toISOString().split('T')[0];
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          endDate = endOfWeek.toISOString().split('T')[0];
        } else {
          // Day view
          startDate = currentDate.toISOString().split('T')[0];
          endDate = startDate;
        }
        
        const response = await TimelineService.filterTimelineEventsByDateRange(startDate, endDate);
        setEvents(response.results);
      } catch (err: any) {
        console.error('Error fetching timeline events:', err);
        setError(err.message || 'Failed to load timeline events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate, calendarView]);

  // CRUD Functions
  const handleCreateEvent = async (newEvent: TimelineEventCreateRequest) => {
    try {
      const created = await TimelineService.createTimelineEvent(newEvent);
      setEvents(prev => [...prev, created]);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('Error creating event:', err);
      alert(err.message || 'Failed to create event');
    }
  };

  const handleEditEvent = async (updatedEvent: TimelineEvent) => {
    try {
      const updated = await TimelineService.updateTimelineEvent(updatedEvent.id, updatedEvent);
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updated : e));
      setIsEditModalOpen(false);
      setSelectedEventData(null);
    } catch (err: any) {
      console.error('Error updating event:', err);
      alert(err.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEventData) {
      try {
        await TimelineService.deleteTimelineEvent(selectedEventData.id);
        setEvents(prev => prev.filter(e => e.id !== selectedEventData.id));
        setIsDeleteModalOpen(false);
        setSelectedEventData(null);
      } catch (err: any) {
        console.error('Error deleting event:', err);
        alert(err.message || 'Failed to delete event');
      }
    }
  };

  const openViewModal = (event: TimelineEvent) => {
    setSelectedEventData(event);
    setIsViewModalOpen(true);
  };

  const openEditModal = (event: TimelineEvent) => {
    setSelectedEventData(event);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted">Loading timeline events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
