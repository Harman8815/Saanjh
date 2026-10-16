'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar as CalendarIcon, ListTodo, Plus, AlertTriangle, Download } from 'lucide-react';
import TimelineView from '../../../components/dashboard/timeline/TimelineView';
import CalendarView from '../../../components/dashboard/timeline/CalendarView';
import ChecklistView from '../../../components/dashboard/timeline/ChecklistView';
import EventFormModal from '../../../components/dashboard/timeline/EventFormModal';
import ViewEventModal from '../../../components/dashboard/timeline/ViewEventModal';
import DeleteConfirmModal from '../../../components/dashboard/timeline/DeleteConfirmModal';
import DayEventModal from '../../../components/dashboard/timeline/DayEventModal';
import { TimelineConflict, TimelineEvent, TimelineEventCreateRequest } from '../../../types/api';
import { TimelineService } from '../../../services/timeline';
import type { LocalEvent } from '../../../components/dashboard/timeline/CalendarView';

const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

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
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState<TimelineEvent | null>(null);

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [conflicts, setConflicts] = useState<TimelineConflict[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch timeline events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsCalendarLoading(true);

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
          // Adjust so Monday is day 0 (getDay returns 0 for Sunday)
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          startOfWeek.setDate(startOfWeek.getDate() - adjustedDay);
          startDate = startOfWeek.toISOString().split('T')[0];
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          endDate = endOfWeek.toISOString().split('T')[0];
        } else {
          // Day view
          startDate = currentDate.toISOString().split('T')[0];
          endDate = startDate;
        }

        const [response, conflictData] = await Promise.all([
          TimelineService.filterTimelineEventsByDateRange(startDate, endDate),
          TimelineService.getConflicts(),
        ]);
        const conflictIds = new Set(conflictData.flatMap(conflict => conflict.events.map(event => event.id)));
        setConflicts(conflictData);
        setEvents(response.results.map(event => ({ ...event, has_conflict: conflictIds.has(event.id) })));
      } catch (err: unknown) {
        console.error('Error fetching timeline events:', err);
        setError(getErrorMessage(err, 'Failed to load timeline events'));
      } finally {
        setIsCalendarLoading(false);
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
    } catch (err: unknown) {
      console.error('Error creating event:', err);
      alert(getErrorMessage(err, 'Failed to create event'));
    }
  };

  const handleEditEvent = async (updatedEvent: TimelineEventCreateRequest | TimelineEvent) => {
    try {
      // Type guard to ensure we have a TimelineEvent with an id
      if ('id' in updatedEvent) {
        const updated = await TimelineService.updateTimelineEvent(updatedEvent.id, updatedEvent);
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updated : e));
        setIsEditModalOpen(false);
        setSelectedEventData(null);
      }
    } catch (err: unknown) {
      console.error('Error updating event:', err);
      alert(getErrorMessage(err, 'Failed to update event'));
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEventData && selectedEventData.id) {
      try {
        await TimelineService.deleteTimelineEvent(selectedEventData.id);
        setEvents(prev => prev.filter(e => e.id !== selectedEventData.id));
        setIsDeleteModalOpen(false);
        setSelectedEventData(null);
      } catch (err: unknown) {
        console.error('Error deleting event:', err);
        alert(getErrorMessage(err, 'Failed to delete event'));
      }
    }
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

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const handleEventClick = (event: LocalEvent) => {
    setSelectedDate(new Date(event.date));
    setIsDayModalOpen(true);
  };

  const findEventForCalendar = (event: LocalEvent) => events.find(item => item.id === event.id);

  const handleDayModalCreate = () => {
    setIsDayModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleDayModalView = (event: TimelineEvent) => {
    setSelectedEventData(event);
    // Keep day modal open and show details
  };

  const handleDayModalEdit = (event: TimelineEvent) => {
    setSelectedEventData(event);
    setIsDayModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDayModalDelete = (event: TimelineEvent) => {
    setSelectedEventData(event);
    setIsDayModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleCalendarExport = async () => {
    try {
      const file = await TimelineService.exportCalendarFile();
      const url = URL.createObjectURL(file);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = 'wedding-timeline.ics';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to export timeline');
    }
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
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
    return filteredEvents;
  };

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
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
          <div role="tablist" aria-label="Timeline view" className="flex border border-white/15">
            {[
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'checklist', label: 'Checklist', icon: ListTodo },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id as 'timeline' | 'calendar' | 'checklist')}
                className={`flex items-center gap-2 px-3 py-2 text-sm ${activeTab === id ? 'bg-primary text-white' : 'text-text-secondary hover:bg-white/10'}`}
              >
                <Icon size={16} />{label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCalendarExport}
              aria-label="Export timeline calendar"
              title="Export timeline calendar"
              className="border border-white/15 px-3 py-2 text-text-primary hover:bg-white/10"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Plus size={18} />
              Add Event
            </button>
          </div>
        </motion.div>

        {conflicts.length > 0 && (
          <section role="status" className="mb-6 border-l-2 border-amber-400 bg-amber-400/10 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              {conflicts.length} timeline conflict{conflicts.length === 1 ? '' : 's'}
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              {conflicts.slice(0, 4).map((conflict, index) => (
                <li key={`${conflict.date}-${index}`}>
                  {conflict.events.map(event => event.title).join(' / ')} on {conflict.date} at {conflict.overlap_start}
                </li>
              ))}
            </ul>
          </section>
        )}

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
              isLoading={isCalendarLoading}
              onDayClick={handleDayClick}
              onEventView={(event) => { const actual = findEventForCalendar(event); if (actual) handleDayModalView(actual); }}
              onEventEdit={(event) => { const actual = findEventForCalendar(event); if (actual) handleDayModalEdit(actual); }}
              onEventDelete={(event) => { const actual = findEventForCalendar(event); if (actual) handleDayModalDelete(actual); }}
              onEventClick={handleEventClick}
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
        key={`create-${isCreateModalOpen}`}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        mode="create"
      />

      <EventFormModal
        key={`edit-${selectedEventData?.id || 'none'}-${isEditModalOpen}`}
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

      <DayEventModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        selectedDate={selectedDate}
        events={getEventsForDate(selectedDate)}
        onCreateEvent={handleDayModalCreate}
        onViewEvent={handleDayModalView}
        onEditEvent={handleDayModalEdit}
        onDeleteEvent={handleDayModalDelete}
      />
    </div>
  );
}
