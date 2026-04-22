import { apiClient } from './api';
import { 
  Wedding, 
  WeddingDashboard, 
  TimelineEvent,
  ApiResponse 
} from '../types/api';

export class WeddingService {
  // Get wedding details
  static async getWedding(): Promise<Wedding> {
    return apiClient.get<Wedding>('/weddings/');
  }

  // Create new wedding
  static async createWedding(weddingData: Omit<Wedding, 'id' | 'created_at' | 'updated_at'>): Promise<Wedding> {
    return apiClient.post<Wedding>('/weddings/create/', weddingData);
  }

  // Update wedding
  static async updateWedding(weddingData: Partial<Wedding>): Promise<Wedding> {
    return apiClient.patch<Wedding>('/weddings/', weddingData);
  }

  // Get wedding dashboard
  static async getDashboard(): Promise<WeddingDashboard> {
    return apiClient.get<WeddingDashboard>('/weddings/dashboard/');
  }

  // Get wedding timeline
  static async getTimeline(): Promise<TimelineEvent[]> {
    return apiClient.get<TimelineEvent[]>('/weddings/timeline/');
  }

  // Add timeline event
  static async addTimelineEvent(eventData: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    return apiClient.post<TimelineEvent>('/weddings/timeline/', eventData);
  }

  // Update timeline event
  static async updateTimelineEvent(eventId: number, eventData: Partial<TimelineEvent>): Promise<TimelineEvent> {
    return apiClient.patch<TimelineEvent>(`/weddings/timeline/${eventId}/`, eventData);
  }

  // Delete timeline event
  static async deleteTimelineEvent(eventId: number): Promise<void> {
    return apiClient.delete(`/weddings/timeline/${eventId}/`);
  }
}

export default WeddingService;
