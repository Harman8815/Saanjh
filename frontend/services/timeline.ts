import { apiClient } from './api';
import { 
  Timeline, 
  TimelineEvent,
  TimelineStatus,
  TimelineEventCreateRequest,
  PaginatedResponse 
} from '../types/api';

export class TimelineService {
  // Timeline CRUD operations
  static async getTimelines(page = 1, pageSize = 20): Promise<PaginatedResponse<Timeline>> {
    return apiClient.get<PaginatedResponse<Timeline>>(`/timeline/timelines/?page=${page}&page_size=${pageSize}`);
  }

  static async createTimeline(timelineData: Omit<Timeline, 'id'>): Promise<Timeline> {
    return apiClient.post<Timeline>('/timeline/timelines/', timelineData);
  }

  static async getTimeline(timelineId: number): Promise<Timeline> {
    return apiClient.get<Timeline>(`/timeline/timelines/${timelineId}/`);
  }

  static async updateTimeline(timelineId: number, timelineData: Partial<Timeline>): Promise<Timeline> {
    return apiClient.patch<Timeline>(`/timeline/timelines/${timelineId}/`, timelineData);
  }

  static async deleteTimeline(timelineId: number): Promise<void> {
    return apiClient.delete(`/timeline/timelines/${timelineId}/`);
  }

  // My timeline (user-specific)
  static async getMyTimeline(): Promise<Timeline> {
    return apiClient.get<Timeline>('/timeline/my-timeline/');
  }

  // Timeline Event CRUD operations
  static async getTimelineEvents(page = 1, pageSize = 20): Promise<PaginatedResponse<TimelineEvent>> {
    return apiClient.get<PaginatedResponse<TimelineEvent>>(`/timeline/timeline-events/?page=${page}&page_size=${pageSize}`);
  }

  static async createTimelineEvent(eventData: TimelineEventCreateRequest): Promise<TimelineEvent> {
    return apiClient.post<TimelineEvent>('/timeline/timeline-events/', eventData);
  }

  static async getTimelineEvent(eventId: number): Promise<TimelineEvent> {
    return apiClient.get<TimelineEvent>(`/timeline/timeline-events/${eventId}/`);
  }

  static async updateTimelineEvent(eventId: number, eventData: Partial<TimelineEvent>): Promise<TimelineEvent> {
    return apiClient.patch<TimelineEvent>(`/timeline/timeline-events/${eventId}/`, eventData);
  }

  static async deleteTimelineEvent(eventId: number): Promise<void> {
    return apiClient.delete(`/timeline/timeline-events/${eventId}/`);
  }

  // Timeline Status operations
  static async getTimelineStatuses(): Promise<TimelineStatus[]> {
    return apiClient.get<TimelineStatus[]>('/timeline/timeline-status/');
  }

  static async createTimelineStatus(statusData: Omit<TimelineStatus, 'id'>): Promise<TimelineStatus> {
    return apiClient.post<TimelineStatus>('/timeline/timeline-status/', statusData);
  }

  static async updateTimelineStatus(statusId: number, statusData: Partial<TimelineStatus>): Promise<TimelineStatus> {
    return apiClient.patch<TimelineStatus>(`/timeline/timeline-status/${statusId}/`, statusData);
  }

  static async deleteTimelineStatus(statusId: number): Promise<void> {
    return apiClient.delete(`/timeline/timeline-status/${statusId}/`);
  }

  // Search and filter operations
  static async searchTimelineEvents(query: string): Promise<PaginatedResponse<TimelineEvent>> {
    return apiClient.get<PaginatedResponse<TimelineEvent>>(`/timeline/timeline-events/?search=${query}`);
  }

  static async filterTimelineEventsByType(type: string): Promise<PaginatedResponse<TimelineEvent>> {
    return apiClient.get<PaginatedResponse<TimelineEvent>>(`/timeline/timeline-events/?type=${type}`);
  }

  static async filterTimelineEventsByStatus(status: string): Promise<PaginatedResponse<TimelineEvent>> {
    return apiClient.get<PaginatedResponse<TimelineEvent>>(`/timeline/timeline-events/?status=${status}`);
  }

  static async filterTimelineEventsByPriority(priority: string): Promise<PaginatedResponse<TimelineEvent>> {
    return apiClient.get<PaginatedResponse<TimelineEvent>>(`/timeline/timeline-events/?priority=${priority}`);
  }

  static async filterTimelineEventsByDateRange(startDate: string, endDate: string): Promise<PaginatedResponse<TimelineEvent>> {
    return apiClient.get<PaginatedResponse<TimelineEvent>>(`/timeline/timeline-events/?start_date=${startDate}&end_date=${endDate}`);
  }

  static async filterTimelineEventsByLocation(location: string): Promise<PaginatedResponse<TimelineEvent>> {
    return apiClient.get<PaginatedResponse<TimelineEvent>>(`/timeline/timeline-events/?location=${location}`);
  }

  // Event management operations
  static async completeTimelineEvent(eventId: number): Promise<TimelineEvent> {
    return apiClient.patch<TimelineEvent>(`/timeline/timeline-events/${eventId}/`, {
      status: 'completed'
    });
  }

  static async postponeTimelineEvent(eventId: number, newDate: string): Promise<TimelineEvent> {
    return apiClient.patch<TimelineEvent>(`/timeline/timeline-events/${eventId}/`, {
      date: newDate,
      status: 'pending'
    });
  }

  static async cancelTimelineEvent(eventId: number, reason?: string): Promise<TimelineEvent> {
    return apiClient.patch<TimelineEvent>(`/timeline/timeline-events/${eventId}/`, {
      status: 'cancelled',
      ...(reason && { notes: reason })
    });
  }

  // Bulk operations
  static async bulkUpdateEventStatus(eventIds: number[], status: string): Promise<TimelineEvent[]> {
    return apiClient.post<TimelineEvent[]>('/timeline/timeline-events/bulk-update-status/', {
      event_ids: eventIds,
      status
    });
  }

  static async bulkDeleteEvents(eventIds: number[]): Promise<void> {
    return apiClient.post('/timeline/timeline-events/bulk-delete/', { event_ids: eventIds });
  }

  // Reminder operations
  static async setEventReminder(eventId: number, reminderDate: string): Promise<TimelineEvent> {
    return apiClient.post<TimelineEvent>(`/timeline/timeline-events/${eventId}/set-reminder/`, {
      reminder_date: reminderDate
    });
  }

  static async removeEventReminder(eventId: number): Promise<TimelineEvent> {
    return apiClient.delete(`/timeline/timeline-events/${eventId}/remove-reminder/`);
  }

  // Calendar integration
  static async exportToCalendar(timelineId?: number): Promise<Blob> {
    const url = timelineId 
      ? `/timeline/timelines/${timelineId}/export-calendar/`
      : '/timeline/my-timeline/export-calendar/';
    
    return apiClient.get(url, {
      responseType: 'blob'
    });
  }

  static async importFromCalendar(calendarFile: File): Promise<TimelineEvent[]> {
    const formData = new FormData();
    formData.append('calendar', calendarFile);
    
    return apiClient.post<TimelineEvent[]>('/timeline/import-calendar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Template operations
  static async getTimelineTemplates(): Promise<any[]> {
    return apiClient.get<any[]>('/timeline/templates/');
  }

  static async createTimelineFromTemplate(templateId: number, weddingId?: number): Promise<Timeline> {
    return apiClient.post<Timeline>(`/timeline/create-from-template/${templateId}/`, {
      wedding_id: weddingId
    });
  }

  // Statistics and analytics
  static async getTimelineStatistics(timelineId?: number): Promise<{
    total_events: number;
    completed_events: number;
    upcoming_events: number;
    overdue_events: number;
    events_by_type: Record<string, number>;
    events_by_status: Record<string, number>;
    next_upcoming_event: TimelineEvent | null;
    completion_rate: number;
  }> {
    const url = timelineId 
      ? `/timeline/timelines/${timelineId}/statistics/`
      : '/timeline/my-timeline/statistics/';
    
    return apiClient.get(url);
  }

  // ViewSet operations for advanced usage
  static async getAllTimelines(): Promise<Timeline[]> {
    return apiClient.get<Timeline[]>('/timeline/timelines/');
  }

  static async getAllTimelineEvents(): Promise<TimelineEvent[]> {
    return apiClient.get<TimelineEvent[]>('/timeline/timeline-events/');
  }

  static async getAllTimelineStatuses(): Promise<TimelineStatus[]> {
    return apiClient.get<TimelineStatus[]>('/timeline/timeline-status/');
  }

  // Notification operations
  static async enableEventNotifications(eventId: number): Promise<void> {
    return apiClient.post(`/timeline/timeline-events/${eventId}/enable-notifications/`);
  }

  static async disableEventNotifications(eventId: number): Promise<void> {
    return apiClient.post(`/timeline/timeline-events/${eventId}/disable-notifications/`);
  }

  static async sendEventReminder(eventId: number): Promise<void> {
    return apiClient.post(`/timeline/timeline-events/${eventId}/send-reminder/`);
  }
}

export default TimelineService;
