import { apiClient } from './api';
import { 
  Guest, 
  RsvpStatus,
  Table,
  Meal,
  GuestStatistics,
  BulkGuestCreate,
  BulkRSVPUpdate,
  GuestCreateRequest,
  PaginatedResponse 
} from '../types/api';

export class GuestService {
  // Guest CRUD operations
  static async getGuests(page = 1, pageSize = 20): Promise<PaginatedResponse<Guest>> {
    return apiClient.get<PaginatedResponse<Guest>>(`/guests/?page=${page}&page_size=${pageSize}`);
  }

  static async createGuest(guestData: GuestCreateRequest): Promise<Guest> {
    return apiClient.post<Guest>('/guests/', guestData);
  }

  static async bulkCreateGuests(bulkData: BulkGuestCreate): Promise<Guest[]> {
    return apiClient.post<Guest[]>('/guests/bulk/', bulkData);
  }

  static async getGuest(guestId: number): Promise<Guest> {
    return apiClient.get<Guest>(`/guests/${guestId}/`);
  }

  static async updateGuest(guestId: number, guestData: Partial<Guest>): Promise<Guest> {
    return apiClient.patch<Guest>(`/guests/${guestId}/`, guestData);
  }

  static async deleteGuest(guestId: number): Promise<void> {
    return apiClient.delete(`/guests/${guestId}/`);
  }

  // RSVP operations
  static async bulkRSVPUpdate(bulkData: BulkRSVPUpdate): Promise<void> {
    return apiClient.post('/guests/bulk-rsvp-update/', bulkData);
  }

  // Invitation operations
  static async sendInvitations(guestIds?: number[]): Promise<void> {
    const data = guestIds ? { guest_ids: guestIds } : {};
    return apiClient.post('/guests/send-invitations/', data);
  }

  // Statistics and analytics
  static async getStatistics(): Promise<GuestStatistics> {
    return apiClient.get<GuestStatistics>('/guests/statistics/');
  }

  // Export operations
  static async exportGuests(format = 'csv'): Promise<Blob> {
    return apiClient.get(`/guests/export/?format=${format}`, {
      responseType: 'blob'
    });
  }

  // Seating chart operations
  static async getSeatingChart(): Promise<Table[]> {
    return apiClient.get<Table[]>('/guests/seating-chart/');
  }

  static async createTable(tableData: Omit<Table, 'id'>): Promise<Table> {
    return apiClient.post<Table>('/guests/tables/', tableData);
  }

  static async updateTable(tableId: number, tableData: Partial<Table>): Promise<Table> {
    return apiClient.patch<Table>(`/guests/tables/${tableId}/`, tableData);
  }

  static async deleteTable(tableId: number): Promise<void> {
    return apiClient.delete(`/guests/tables/${tableId}/`);
  }

  // Meal operations
  static async getMeals(): Promise<Meal[]> {
    return apiClient.get<Meal[]>('/guests/meals/');
  }

  static async createMeal(mealData: Omit<Meal, 'id'>): Promise<Meal> {
    return apiClient.post<Meal>('/guests/meals/', mealData);
  }

  // RSVP Status operations
  static async getRsvpStatuses(): Promise<RsvpStatus[]> {
    return apiClient.get<RsvpStatus[]>('/guests/rsvp-status/');
  }

  // Search and filter operations
  static async searchGuests(query: string): Promise<PaginatedResponse<Guest>> {
    return apiClient.get<PaginatedResponse<Guest>>(`/guests/?search=${query}`);
  }

  static async filterGuestsByRSVP(rsvpStatus: number): Promise<PaginatedResponse<Guest>> {
    return apiClient.get<PaginatedResponse<Guest>>(`/guests/?rsvp_status=${rsvpStatus}`);
  }

  static async filterGuestsByRelationship(relationship: string): Promise<PaginatedResponse<Guest>> {
    return apiClient.get<PaginatedResponse<Guest>>(`/guests/?relationship=${relationship}`);
  }

  static async filterGuestsByTable(tableId: number): Promise<PaginatedResponse<Guest>> {
    return apiClient.get<PaginatedResponse<Guest>>(`/guests/?table=${tableId}`);
  }

  // ViewSet operations for advanced usage
  static async getAllGuests(): Promise<Guest[]> {
    return apiClient.get<Guest[]>('/guests/guests/');
  }

  static async getAllRsvpStatuses(): Promise<RsvpStatus[]> {
    return apiClient.get<RsvpStatus[]>('/guests/rsvp-status/');
  }

  static async getAllTables(): Promise<Table[]> {
    return apiClient.get<Table[]>('/guests/tables/');
  }

  static async getAllMeals(): Promise<Meal[]> {
    return apiClient.get<Meal[]>('/guests/meals/');
  }
}

export default GuestService;
