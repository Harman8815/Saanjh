'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'milestone' | 'planning';
}

interface CalendarViewProps {
  events: Event[];
  calendarView: 'month' | 'week' | 'day';
  setCalendarView: (view: 'month' | 'week' | 'day') => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  getStatusColor: (status: string) => string;
  getEventsForDate: (date: Date) => Event[];
}

export default function CalendarView({
  events,
  calendarView,
  setCalendarView,
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  getStatusColor,
  getEventsForDate
}: CalendarViewProps) {
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const today = new Date();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ 
        date: new Date(year, month, -i), 
        isCurrentMonth: false, 
        isToday: false, 
        isSelected: false, 
        events: [] 
      });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      });
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        events: dayEvents
      });
    }
    
    while (days.length < 42) {
      const nextDay: number = days.length - (startDayOfWeek - 1) - daysInMonth + 1;
      days.push({ 
        date: new Date(year, month + 1, nextDay), 
        isCurrentMonth: false, 
        isToday: false, 
        isSelected: false, 
        events: [] 
      });
    }
    
    return days;
  }, [currentDate, selectedDate, events]);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      });
      return { date, events: dayEvents, isToday: date.toDateString() === new Date().toDateString() };
    });
  }, [currentDate, events]);

  const formatHeaderDate = () => {
    if (calendarView === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (calendarView === 'week') {
      const start = weekDays[0].date;
      const end = weekDays[6].date;
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Calendar Header & View Switcher */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-surface/50 backdrop-blur-xl rounded-xl border border-white/5">
            {[
              { id: 'month', label: 'Month' },
              { id: 'week', label: 'Week' },
              { id: 'day', label: 'Day' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setCalendarView(view.id as 'month' | 'week' | 'day')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  calendarView === view.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2.5 rounded-xl bg-surface/50 border border-white/5 hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={20} className="text-text-secondary" />
          </button>
          <h2 className="text-lg font-semibold text-text-primary min-w-[200px] text-center">
            {formatHeaderDate()}
          </h2>
          <button
            onClick={() => navigateDate('next')}
            className="p-2.5 rounded-xl bg-surface/50 border border-white/5 hover:bg-white/10 transition-all"
          >
            <ChevronRight size={20} className="text-text-secondary" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Today
        </button>
      </div>

      {/* View Content */}
      {calendarView === 'month' && (
        <MonthView 
          days={calendarDays} 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
        />
      )}

      {calendarView === 'week' && (
        <WeekView 
          weekDays={weekDays} 
          timeSlots={timeSlots} 
        />
      )}

      {calendarView === 'day' && (
        <DayView 
          currentDate={currentDate}
          timeSlots={timeSlots}
          events={events}
          getEventsForDate={getEventsForDate}
          getStatusColor={getStatusColor}
        />
      )}
    </motion.div>
  );
}
