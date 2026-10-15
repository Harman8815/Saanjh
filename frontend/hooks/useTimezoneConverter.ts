import { useCallback, useEffect } from 'react';
import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format as formatDateFns } from 'date-fns';

// Timezone configuration
export const timezones = [
  {
    code: 'utc',
    name: 'UTC',
    offset: '+00:00',
    description: 'Coordinated Universal Time',
  },
  {
    code: 'est',
    name: 'Eastern Time (EST)',
    offset: '-05:00',
    description: 'Eastern Standard Time (New York, Toronto)',
  },
  {
    code: 'pst',
    name: 'Pacific Time (PST)',
    offset: '-08:00',
    description: 'Pacific Standard Time (Los Angeles, Seattle)',
  },
  {
    code: 'gmt',
    name: 'Greenwich Mean Time (GMT)',
    offset: '+00:00',
    description: 'Greenwich Mean Time (London)',
  },
  {
    code: 'cet',
    name: 'Central European Time (CET)',
    offset: '+01:00',
    description: 'Central European Time (Paris, Berlin)',
  },
  {
    code: 'ist',
    name: 'India Standard Time (IST)',
    offset: '+05:30',
    description: 'India Standard Time (New Delhi, Mumbai)',
  },
  {
    code: 'jst',
    name: 'Japan Standard Time (JST)',
    offset: '+09:00',
    description: 'Japan Standard Time (Tokyo, Osaka)',
  },
  {
    code: 'aest',
    name: 'Australian Eastern Time (AEST)',
    offset: '+10:00',
    description: 'Australian Eastern Time (Sydney, Melbourne)',
  },
];

export interface Timezone {
  code: string;
  name: string;
  offset: string;
  description: string;
}

/**
 * Hook for timezone conversion and management
 */
export function useTimezoneConverter() {
  // Get user's timezone from browser
  const detectUserTimezone = useCallback((): string => {
    if (typeof Intl !== 'undefined') {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'utc';
      } catch {
        return 'utc';
      }
    }
    return 'utc';
  }, []);

  // Convert date to specific timezone
  const convertToTimezone = useCallback((date: Date, timezoneCode: string): Date => {
    try {
      const zonedDate = toZonedTime(date, timezoneCode);
      return zonedDate;
    } catch (error) {
      console.error('Failed to convert timezone:', error);
      return date;
    }
  }, []);

  // Convert date from timezone to UTC
  const convertFromTimezone = useCallback((date: Date, timezoneCode: string): Date => {
    try {
      const utcDate = fromZonedTime(date, timezoneCode);
      return utcDate;
    } catch (error) {
      console.error('Failed to convert from timezone:', error);
      return date;
    }
  }, []);

  // Format date with timezone
  const formatDateWithTimezone = useCallback((
    date: Date, 
    formatString: string = 'PPP',
    timezoneCode?: string
  ): string => {
    try {
      const targetTimezone = timezoneCode || detectUserTimezone();
      const zonedDate = convertToTimezone(date, targetTimezone);
      
      return format(zonedDate, formatString, {
        timeZone: targetTimezone,
      });
    } catch (error) {
      console.error('Failed to format date with timezone:', error);
      return formatDateFns(date, formatString);
    }
  }, [detectUserTimezone, convertToTimezone]);

  // Get timezone info by code
  const getTimezoneByCode = useCallback((code: string): Timezone | undefined => {
    return timezones.find(tz => tz.code === code);
  }, []);

  // Get current timezone info
  const getCurrentTimezoneInfo = useCallback((): Timezone => {
    const userTimezone = detectUserTimezone();
    return getTimezoneByCode(userTimezone) || timezones[0];
  }, [detectUserTimezone, getTimezoneByCode]);

  // Get all available timezones
  const getAvailableTimezones = useCallback((): Timezone[] => {
    return timezones;
  }, []);

  // Check if timezone is valid
  const isValidTimezone = useCallback((timezoneCode: string): boolean => {
    return timezones.some(tz => tz.code === timezoneCode);
  }, []);

  // Get timezone offset
  const getTimezoneOffset = useCallback((timezoneCode: string): string => {
    const timezone = getTimezoneByCode(timezoneCode);
    return timezone?.offset || '+00:00';
  }, [getTimezoneByCode]);

  // Format time with timezone
  const formatTimeWithTimezone = useCallback((
    time: Date,
    formatString: string = 'pp',
    timezoneCode?: string
  ): string => {
    try {
      const targetTimezone = timezoneCode || detectUserTimezone();
      const zonedTime = convertToTimezone(time, targetTimezone);
      
      return format(zonedTime, formatString, {
        timeZone: targetTimezone,
      });
    } catch (error) {
      console.error('Failed to format time with timezone:', error);
      return time.toLocaleTimeString();
    }
  }, [detectUserTimezone, convertToTimezone]);

  // Convert between timezones
  const convertBetweenTimezones = useCallback((
    date: Date,
    fromTimezone: string,
    toTimezone: string
  ): Date => {
    try {
      // First convert to UTC
      const utcDate = convertFromTimezone(date, fromTimezone);
      // Then convert to target timezone
      const targetDate = convertToTimezone(utcDate, toTimezone);
      return targetDate;
    } catch (error) {
      console.error('Failed to convert between timezones:', error);
      return date;
    }
  }, [convertFromTimezone, convertToTimezone]);

  // Get relative time in timezone
  const getRelativeTimeInTimezone = useCallback((
    date: Date,
    timezoneCode?: string,
    baseDate?: Date
  ): string => {
    try {
      const targetTimezone = timezoneCode || detectUserTimezone();
      const zonedDate = convertToTimezone(date, targetTimezone);
      const base = baseDate || new Date();
      
      // Format relative time
      const now = new Date();
      const diffInMs = zonedDate.getTime() - base.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else if (diffInDays < 30) {
        return `${Math.floor(diffInDays / 7)} weeks ago`;
      } else {
        return format(zonedDate, 'MMM d, yyyy', {
          timeZone: targetTimezone,
        });
      }
    } catch (error) {
      console.error('Failed to get relative time:', error);
      return date.toLocaleDateString();
    }
  }, [detectUserTimezone, convertToTimezone]);

  // Auto-detect and set user timezone
  const autoDetectAndSetTimezone = useCallback((setTimezone: (timezone: string) => void) => {
    const detectedTimezone = detectUserTimezone();
    if (detectedTimezone && isValidTimezone(detectedTimezone)) {
      setTimezone(detectedTimezone);
    }
  }, [detectUserTimezone, isValidTimezone]);

  return {
    // Current state
    currentTimezone: detectUserTimezone(),
    currentTimezoneInfo: getCurrentTimezoneInfo(),
    getCurrentTimezoneInfo,
    
    // Conversion functions
    convertToTimezone,
    convertFromTimezone,
    convertBetweenTimezones,
    
    // Formatting functions
    formatDateWithTimezone,
    formatTimeWithTimezone,
    getRelativeTimeInTimezone,
    
    // Utility functions
    getTimezoneByCode,
    getAvailableTimezones,
    isValidTimezone,
    getTimezoneOffset,
    detectUserTimezone,
    autoDetectAndSetTimezone,
  };
}
