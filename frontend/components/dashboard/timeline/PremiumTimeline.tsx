'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, MoreVertical } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'milestone' | 'planning' | 'ceremony' | 'reception';
  color?: string;
}

interface PremiumTimelineProps {
  events: Event[];
  selectedDate: Date;
  onEventClick?: (event: Event) => void;
}

const HOUR_HEIGHT = 80; // pixels per hour
const START_HOUR = 0; // 12 AM
const END_HOUR = 24; // 12 AM next day

// Parse time string to minutes from midnight
const parseTimeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes = minutes;
  return totalMinutes;
};

// Format minutes to time string
const formatMinutesToTime = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hrs >= 12 ? 'PM' : 'AM';
  const displayHrs = hrs % 12 || 12;
  return `${displayHrs}:${mins.toString().padStart(2, '0')} ${period}`;
};

// Get event color based on the color field or fall back to category
const getEventColorClasses = (event: Event): { border: string; bg: string; gradient: string } => {
  if (event.color) {
    // Use the custom event color
    switch (event.color) {
      case 'rose': return { border: 'border-l-rose-500', bg: 'bg-rose-500/10', gradient: 'from-rose-500 to-pink-500' };
      case 'blue': return { border: 'border-l-blue-500', bg: 'bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500' };
      case 'violet': return { border: 'border-l-violet-500', bg: 'bg-violet-500/10', gradient: 'from-violet-500 to-purple-500' };
      case 'amber': return { border: 'border-l-amber-500', bg: 'bg-amber-500/10', gradient: 'from-amber-500 to-orange-500' };
      case 'emerald': return { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500 to-teal-500' };
      case 'cyan': return { border: 'border-l-cyan-500', bg: 'bg-cyan-500/10', gradient: 'from-cyan-500 to-sky-500' };
      case 'pink': return { border: 'border-l-pink-500', bg: 'bg-pink-500/10', gradient: 'from-pink-500 to-rose-500' };
      case 'orange': return { border: 'border-l-orange-500', bg: 'bg-orange-500/10', gradient: 'from-orange-500 to-amber-500' };
      case 'indigo': return { border: 'border-l-indigo-500', bg: 'bg-indigo-500/10', gradient: 'from-indigo-500 to-violet-500' };
      case 'teal': return { border: 'border-l-teal-500', bg: 'bg-teal-500/10', gradient: 'from-teal-500 to-emerald-500' };
      default: return { border: 'border-l-rose-500', bg: 'bg-rose-500/10', gradient: 'from-rose-500 to-pink-500' };
    }
  }
  // Fallback to category colors
  switch (event.category) {
    case 'milestone': return { border: 'border-l-rose-500', bg: 'bg-rose-500/10', gradient: 'from-rose-500 to-pink-500' };
    case 'planning': return { border: 'border-l-blue-500', bg: 'bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500' };
    case 'ceremony': return { border: 'border-l-violet-500', bg: 'bg-violet-500/10', gradient: 'from-violet-500 to-purple-500' };
    case 'reception': return { border: 'border-l-amber-500', bg: 'bg-amber-500/10', gradient: 'from-amber-500 to-orange-500' };
    default: return { border: 'border-l-slate-500', bg: 'bg-slate-500/10', gradient: 'from-slate-500 to-gray-500' };
  }
};

// Keep category colors for legend
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'milestone': return 'from-rose-500 to-pink-500';
    case 'planning': return 'from-blue-500 to-cyan-500';
    case 'ceremony': return 'from-violet-500 to-purple-500';
    case 'reception': return 'from-amber-500 to-orange-500';
    default: return 'from-slate-500 to-gray-500';
  }
};

export default function PremiumTimeline({ events, selectedDate, onEventClick }: PremiumTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter events for selected date
  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    }).map(event => ({
      ...event,
      startMinutes: parseTimeToMinutes(event.time),
      endMinutes: parseTimeToMinutes(event.time) + (event.duration || 60)
    }));
  }, [events, selectedDate]);

  // Calculate overlapping event groups
  const positionedEvents = useMemo(() => {
    const sorted = [...dayEvents].sort((a, b) => a.startMinutes - b.startMinutes);
    const groups: typeof sorted[] = [];
    let currentGroup: typeof sorted = [];
    
    sorted.forEach((event, i) => {
      if (currentGroup.length === 0) {
        currentGroup.push(event);
      } else {
        const lastEvent = currentGroup[currentGroup.length - 1];
        if (event.startMinutes < lastEvent.endMinutes) {
          currentGroup.push(event);
        } else {
          groups.push([...currentGroup]);
          currentGroup = [event];
        }
      }
    });
    
    if (currentGroup.length > 0) groups.push(currentGroup);
    
    // Calculate positions for each event
    const positioned: (typeof sorted[0] & { 
      top: number; 
      height: number; 
      left: number; 
      width: number;
      zIndex: number;
    })[] = [];
    
    groups.forEach(group => {
      const count = group.length;
      group.forEach((event, index) => {
        positioned.push({
          ...event,
          top: (event.startMinutes / 60) * HOUR_HEIGHT,
          height: ((event.endMinutes - event.startMinutes) / 60) * HOUR_HEIGHT,
          left: (index / count) * 100,
          width: 100 / count,
          zIndex: 10 + index
        });
      });
    });
    
    return positioned;
  }, [dayEvents]);

  // Current time position
  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (minutes / 60) * HOUR_HEIGHT;
  }, [currentTime]);

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const timeSlots = useMemo(() => {
    return Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-300px)] min-h-[600px] bg-surface/30 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
      {/* Header - Date Display */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {dayEvents.length} events scheduled
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['milestone', 'planning', 'ceremony', 'reception'].map(cat => (
            <div key={cat} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getCategoryColor(cat)}`} />
              <span className="text-xs text-text-secondary capitalize">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Container */}
      <div 
        ref={containerRef}
        className="relative flex overflow-auto"
        style={{ height: 'calc(100% - 73px)' }}
      >
        {/* Sticky Time Column */}
        <div className="sticky left-0 z-20 w-20 flex-shrink-0 bg-surface/50 backdrop-blur-xl border-r border-white/5">
          {timeSlots.map(hour => (
            <div 
              key={hour}
              className="relative flex items-start justify-end pr-3 text-xs text-text-secondary"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="-mt-2">
                {formatMinutesToTime(hour * 60)}
              </span>
            </div>
          ))}
        </div>

        {/* Event Canvas */}
        <div className="relative flex-1 min-w-[600px]">
          {/* Grid Lines */}
          <div className="absolute inset-0">
            {timeSlots.map(hour => (
              <div 
                key={hour}
                className="absolute w-full border-b border-white/5"
                style={{ top: hour * HOUR_HEIGHT }}
              />
            ))}
          </div>

          {/* Half-hour grid lines (subtler) */}
          <div className="absolute inset-0">
            {timeSlots.map(hour => (
              <div 
                key={`half-${hour}`}
                className="absolute w-full border-b border-white/[0.02]"
                style={{ top: (hour + 0.5) * HOUR_HEIGHT }}
              />
            ))}
          </div>

          {/* Current Time Indicator */}
          {isToday && (
            <motion.div 
              className="absolute left-0 right-0 z-30 pointer-events-none"
              initial={{ top: currentTimePosition }}
              animate={{ top: currentTimePosition }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1" />
                <div className="flex-1 h-px bg-gradient-to-r from-rose-500/50 via-rose-500/30 to-transparent" />
              </div>
              <div className="absolute left-2 -top-3 text-xs font-medium text-rose-400 bg-surface/80 px-1.5 py-0.5 rounded">
                {formatMinutesToTime(currentTime.getHours() * 60 + currentTime.getMinutes())}
              </div>
            </motion.div>
          )}

          {/* Events */}
          {positionedEvents.map(event => (
            <motion.div
              key={event.id}
              className={`absolute rounded-xl border-l-4 ${getEventColorClasses(event).border} ${getEventColorClasses(event).bg}
                backdrop-blur-sm cursor-pointer group transition-all duration-200
                hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02] hover:z-40`}
              style={{
                top: event.top + 2,
                height: event.height - 4,
                left: `calc(${event.left}% + 4px)`,
                width: `calc(${event.width}% - 8px)`,
                zIndex: event.zIndex
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: event.id * 0.05 }}
              onClick={() => onEventClick?.(event)}
            >
              <div className="relative h-full p-3 flex flex-col overflow-hidden">
                {/* Event Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-text-primary text-sm leading-tight line-clamp-2">
                    {event.title}
                  </h3>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                    <MoreVertical size={14} className="text-text-secondary" />
                  </button>
                </div>

                {/* Event Time */}
                <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
                  <Clock size={12} />
                  <span>
                    {formatMinutesToTime(event.startMinutes)} - {formatMinutesToTime(event.endMinutes)}
                  </span>
                </div>

                {/* Location (if space allows) */}
                {event.height > 50 && (
                  <div className="flex items-center gap-1 mt-auto text-xs text-text-muted">
                    <MapPin size={12} />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {event.status === 'completed' && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                  {event.status === 'in-progress' && (
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {dayEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} className="text-text-muted" />
                </div>
                <p className="text-text-secondary">No events scheduled</p>
                <p className="text-text-muted text-sm mt-1">Add events to see them here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
