import { useCallback } from 'react';
import { format as formatDateFns, parseISO, isValid } from 'date-fns';
import { useI18nLocalization } from './useI18nLocalization';

// Date format configurations
export const dateFormats = [
  {
    code: 'mdy',
    name: 'MM/DD/YYYY',
    example: '12/31/2023',
    description: 'Month/Day/Year format (US)',
  },
  {
    code: 'dmy',
    name: 'DD/MM/YYYY',
    example: '31/12/2023',
    description: 'Day/Month/Year format (European)',
  },
  {
    code: 'ymd',
    name: 'YYYY-MM-DD',
    example: '2023-12-31',
    description: 'Year-Month-Day format (ISO)',
  },
];

export interface DateFormat {
  code: string;
  name: string;
  example: string;
  description: string;
}

/**
 * Hook for date formatting using date-fns library
 * Provides consistent date formatting across the application
 */
export function useDateFormat() {
  const { formatDate, currentLanguage } = useI18nLocalization();

  // Format date with current language and timezone
  const formatDateWithCurrentSettings = useCallback((
    date: Date | string,
    formatString?: string,
    timezoneCode?: string
  ): string => {
    try {
      // If date is string, parse it first
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      
      return formatDate(dateObj, formatString || 'PPP', {
        locale: currentLanguage === 'hi' ? 'hi-IN' : 'en-US',
        timeZone: timezoneCode || undefined,
      });
    } catch (error) {
      console.error('Failed to format date:', error);
      return typeof date === 'string' ? date : date.toLocaleDateString();
    }
  }, [formatDate, currentLanguage]);

  // Parse date string to Date object
  const parseDateString = useCallback((dateString: string): Date | null => {
    try {
      const parsed = parseISO(dateString);
      return isValid(parsed) ? parsed : null;
    } catch {
      console.error('Failed to parse date string:', dateString);
      return null;
    }
  }, []);

  // Format relative time
  const formatRelativeTime = useCallback((
    date: Date,
    baseDate?: Date,
    timezoneCode?: string
  ): string => {
    try {
      const now = new Date();
      const targetDate = date || now;
      const base = baseDate || now;
      
      const diffInMs = targetDate.getTime() - base.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else if (diffInDays < 30) {
        return `${Math.floor(diffInDays / 7)} weeks ago`;
      } else if (diffInDays < 365) {
        return `${Math.floor(diffInDays / 30)} months ago`;
      } else {
        return `${Math.floor(diffInDays / 365)} years ago`;
      }
    } catch (error) {
      console.error('Failed to format relative time:', error);
      return date.toLocaleDateString();
    }
  }, []);

  // Get current date format info
  const getCurrentDateFormat = useCallback((): DateFormat => {
    const storedFormat = localStorage.getItem('date-format');
    const format = dateFormats.find(df => df.code === storedFormat) || dateFormats[0];
    return format;
  }, []);

  // Set date format
  const setDateFormat = useCallback((formatCode: string) => {
    localStorage.setItem('date-format', formatCode);
  }, []);

  // Format date for display
  const formatDateForDisplay = useCallback((date: Date): string => {
    return formatDateWithCurrentSettings(date, 'MMM d, yyyy');
  }, [formatDateWithCurrentSettings]);

  // Format date for input
  const formatDateForInput = useCallback((date: Date): string => {
    return formatDateWithCurrentSettings(date, 'yyyy-MM-dd');
  }, [formatDateWithCurrentSettings]);

  // Format time for display
  const formatTimeForDisplay = useCallback((time: Date): string => {
    return formatDateWithCurrentSettings(time, 'pp');
  }, [formatDateWithCurrentSettings]);

  // Format date and time for display
  const formatDateTimeForDisplay = useCallback((date: Date): string => {
    return formatDateWithCurrentSettings(date, 'PPPpp');
  }, [formatDateWithCurrentSettings]);

  // Check if date is valid
  const isValidDate = useCallback((date: any): boolean => {
    try {
      return isValid(date);
    } catch {
      return false;
    }
  }, []);

  // Get date format options
  const getDateFormats = useCallback((): DateFormat[] => {
    return dateFormats;
  }, []);

  // Format date range
  const formatDateRange = useCallback((
    startDate: Date,
    endDate: Date,
    formatString?: string
  ): string => {
    const start = formatDateWithCurrentSettings(startDate, formatString || 'MMM d, yyyy');
    const end = formatDateWithCurrentSettings(endDate, formatString || 'MMM d, yyyy');
    return `${start} - ${end}`;
  }, [formatDateWithCurrentSettings]);

  return {
    // Current format
    currentFormat: getCurrentDateFormat(),
    
    // Formatting functions
    formatDate: formatDateWithCurrentSettings,
    formatDateForDisplay,
    formatDateForInput,
    formatTimeForDisplay,
    formatDateTimeForDisplay,
    formatRelativeTime,
    formatDateRange,
    
    // Utility functions
    parseDateString,
    isValidDate,
    setDateFormat,
    getDateFormats,
    
    // Date format options
    dateFormats,
  };
}
