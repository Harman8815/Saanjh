import { apiClient } from './api';
import { 
  Guest, 
  GuestStatistics,
  BulkGuestCreate,
  BulkRSVPUpdate,
  PaginatedResponse 
} from '../types/api';

export class GuestService {
  // Get all guests
  static async getGuests(page = 1, pageSize = 20): Promise<PaginatedResponse<Guest>> {
    return apiClient.get<PaginatedResponse<Guest>>(`/guests/?page=${page}&page_size=${pageSize}`);
  }

  // Create single guest
  static async createGuest(guestData: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Promise<Guest> {
    return apiClient.post<Guest>('/guests/', guestData);
  }

  // Bulk create guests
  static async bulkCreateGuests(bulkData: BulkGuestCreate): Promise<Guest[]> {
    return apiClient.post<Guest[]>('/guests/bulk/', bulkData);
  }

  // Get guest by ID
  static async getGuest(guestId: number): Promise<Guest> {
    return apiClient.get<Guest>(`/guests/${guestId}/`);
  }

  // Update guest
  static async updateGuest(guestId: number, guestData: Partial<Guest>): Promise<Guest> {
    return apiClient.patch<Guest>(`/guests/${guestId}/`, guestData);
  }

  // Delete guest
  static async deleteGuest(guestId: number): Promise<void> {
    return apiClient.delete(`/guests/${guestId}/`);
  }

  // Bulk RSVP update
  static async bulkRSVPUpdate(bulkData: BulkRSVPUpdate): Promise<void> {
    return apiClient.post('/guests/bulk-rsvp-update/', bulkData);
  }

  // Send invitations
  static async sendInvitations(guestIds?: number[]): Promise<void> {
    const data = guestIds ? { guest_ids: guestIds } : {};
    return apiClient.post('/guests/send-invitations/', data);
  }

  // Get guest statistics
  static async getStatistics(): Promise<GuestStatistics> {
    return apiClient.get<GuestStatistics>('/guests/statistics/');
  }

  // Export guests
  static async exportGuests(format = 'csv'): Promise<Blob> {
    return apiClient.get(`/guests/export/?format=${format}`, {
      responseType: 'blob'
    });
  }

  // Search guests
  static async searchGuests(query: string): Promise<Guest[]> {
    return apiClient.get<Guest[]>(`/guests/?search=${query}`);
  }

  // Filter guests by RSVP status
  static async filterGuestsByRSVP(rsvpStatus: string): Promise<Guest[]> {
    return apiClient.get<Guest[]>(`/guests/?rsvp_status=${rsvpStatus}`);
  }
}

export default GuestService;
