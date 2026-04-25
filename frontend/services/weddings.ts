import { apiClient } from './api';
import { 
  Wedding, 
  WeddingStatus,
  Venue,
  VenueCatalog,
  VenueAmenity,
  WeddingDashboard, 
  TimelineEvent,
  WeddingCreateRequest,
  ApiResponse 
} from '../types/api';

export class WeddingService {
  // Wedding CRUD operations
  static async getWedding(): Promise<Wedding> {
    return apiClient.get<Wedding>('/weddings/');
  }

  static async createWedding(weddingData: WeddingCreateRequest): Promise<Wedding> {
    return apiClient.post<Wedding>('/weddings/create/', weddingData);
  }

  static async updateWedding(weddingData: Partial<Wedding>): Promise<Wedding> {
    return apiClient.patch<Wedding>('/weddings/', weddingData);
  }

  // Wedding Status operations
  static async getWeddingStatuses(): Promise<WeddingStatus[]> {
    return apiClient.get<WeddingStatus[]>('/weddings/wedding-status/');
  }

  // Venue operations
  static async getVenues(): Promise<Venue[]> {
    return apiClient.get<Venue[]>('/weddings/venues/');
  }

  static async getVenueCatalog(): Promise<VenueCatalog[]> {
    return apiClient.get<VenueCatalog[]>('/weddings/venue-catalog/');
  }

  static async searchVenues(params?: {
    type?: string;
    min_capacity?: number;
    max_price?: number;
  }): Promise<VenueCatalog[]> {
    return apiClient.get<VenueCatalog[]>('/weddings/venue-search/', { params });
  }

  static async getVenueAmenities(): Promise<VenueAmenity[]> {
    return apiClient.get<VenueAmenity[]>('/weddings/venue-amenities/');
  }

  // Dashboard and analytics
  static async getDashboard(): Promise<WeddingDashboard> {
    return apiClient.get<WeddingDashboard>('/weddings/dashboard/');
  }

  // Timeline operations
  static async getTimeline(): Promise<TimelineEvent[]> {
    return apiClient.get<TimelineEvent[]>('/weddings/timeline/');
  }

  static async addTimelineEvent(eventData: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at'>): Promise<TimelineEvent> {
    return apiClient.post<TimelineEvent>('/timeline/timeline-events/', eventData);
  }

  static async updateTimelineEvent(eventId: number, eventData: Partial<TimelineEvent>): Promise<TimelineEvent> {
    return apiClient.patch<TimelineEvent>(`/timeline/timeline-events/${eventId}/`, eventData);
  }

  static async deleteTimelineEvent(eventId: number): Promise<void> {
    return apiClient.delete(`/timeline/timeline-events/${eventId}/`);
  }

  // ViewSet operations for advanced usage
  static async getAllWeddings(): Promise<Wedding[]> {
    return apiClient.get<Wedding[]>('/weddings/weddings/');
  }

  static async getWeddingById(id: number): Promise<Wedding> {
    return apiClient.get<Wedding>(`/weddings/weddings/${id}/`);
  }

  static async updateWeddingById(id: number, weddingData: Partial<Wedding>): Promise<Wedding> {
    return apiClient.patch<Wedding>(`/weddings/weddings/${id}/`, weddingData);
  }

  static async deleteWedding(id: number): Promise<void> {
    return apiClient.delete(`/weddings/weddings/${id}/`);
  }
}

export default WeddingService;
