import { apiClient } from './api';
import { 
  WeddingCard, 
  WeddingCardGuest,
  WeddingCardAnalytics,
  WeddingCardCreateRequest,
  PaginatedResponse 
} from '../types/api';

export class WeddingCardService {
  // Wedding Card CRUD operations
  static async getWeddingCards(page = 1, pageSize = 20): Promise<PaginatedResponse<WeddingCard>> {
    return apiClient.get<PaginatedResponse<WeddingCard>>(`/wedding-cards/?page=${page}&page_size=${pageSize}`);
  }

  static async createWeddingCard(cardData: WeddingCardCreateRequest): Promise<WeddingCard> {
    return apiClient.post<WeddingCard>('/wedding-cards/', cardData);
  }

  static async getWeddingCard(cardId: number): Promise<WeddingCard> {
    return apiClient.get<WeddingCard>(`/wedding-cards/${cardId}/`);
  }

  static async updateWeddingCard(cardId: number, cardData: Partial<WeddingCard>): Promise<WeddingCard> {
    return apiClient.patch<WeddingCard>(`/wedding-cards/${cardId}/`, cardData);
  }

  static async deleteWeddingCard(cardId: number): Promise<void> {
    return apiClient.delete(`/wedding-cards/${cardId}/`);
  }

  // Wedding Card Guest operations
  static async getWeddingCardGuests(cardId: number, page = 1, pageSize = 20): Promise<PaginatedResponse<WeddingCardGuest>> {
    return apiClient.get<PaginatedResponse<WeddingCardGuest>>(`/wedding-cards/${cardId}/guests/?page=${page}&page_size=${pageSize}`);
  }

  static async addGuestToWeddingCard(cardId: number, guestData: Omit<WeddingCardGuest, 'id' | 'created_at'>): Promise<WeddingCardGuest> {
    return apiClient.post<WeddingCardGuest>(`/wedding-cards/${cardId}/guests/`, guestData);
  }

  static async getWeddingCardGuest(cardId: number, guestId: number): Promise<WeddingCardGuest> {
    return apiClient.get<WeddingCardGuest>(`/wedding-cards/${cardId}/guests/${guestId}/`);
  }

  static async updateWeddingCardGuest(cardId: number, guestId: number, guestData: Partial<WeddingCardGuest>): Promise<WeddingCardGuest> {
    return apiClient.patch<WeddingCardGuest>(`/wedding-cards/${cardId}/guests/${guestId}/`, guestData);
  }

  static async deleteWeddingCardGuest(cardId: number, guestId: number): Promise<void> {
    return apiClient.delete(`/wedding-cards/${cardId}/guests/${guestId}/`);
  }

  // Photo upload operations
  static async uploadGuestPhoto(cardId: number, guestId: number, photoFile: File): Promise<WeddingCardGuest> {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return apiClient.post<WeddingCardGuest>(`/wedding-cards/${cardId}/guests/${guestId}/upload-photo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Analytics operations
  static async getWeddingCardAnalytics(cardId: number): Promise<WeddingCardAnalytics> {
    return apiClient.get<WeddingCardAnalytics>(`/wedding-cards/${cardId}/analytics/`);
  }

  // Export operations
  static async exportWeddingCardGuests(cardId: number, format = 'csv'): Promise<Blob> {
    return apiClient.get(`/wedding-cards/${cardId}/export/?format=${format}`, {
      responseType: 'blob'
    });
  }

  // Public wedding card operations (for guests)
  static async getPublicWeddingCard(shareableLink: string): Promise<WeddingCard> {
    return apiClient.get<WeddingCard>(`/public/cards/${shareableLink}/`);
  }

  static async getPublicWeddingCardGuests(shareableLink: string): Promise<WeddingCardGuest[]> {
    return apiClient.get<WeddingCardGuest[]>(`/public/cards/${shareableLink}/guests/`);
  }

  static async uploadPublicGuestPhoto(shareableLink: string, guestId: number, photoFile: File): Promise<WeddingCardGuest> {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return apiClient.post<WeddingCardGuest>(`/public/cards/${shareableLink}/guests/${guestId}/upload-photo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Search and filter operations
  static async searchWeddingCards(query: string): Promise<PaginatedResponse<WeddingCard>> {
    return apiClient.get<PaginatedResponse<WeddingCard>>(`/wedding-cards/?search=${query}`);
  }

  static async filterWeddingCardsByStatus(isPublic: boolean): Promise<PaginatedResponse<WeddingCard>> {
    return apiClient.get<PaginatedResponse<WeddingCard>>(`/wedding-cards/?is_public=${isPublic}`);
  }

  static async filterWeddingCardsByPhotoUpload(allowPhotoUpload: boolean): Promise<PaginatedResponse<WeddingCard>> {
    return apiClient.get<PaginatedResponse<WeddingCard>>(`/wedding-cards/?allow_photo_upload=${allowPhotoUpload}`);
  }

  // Bulk operations
  static async bulkAddGuestsToCard(cardId: number, guestIds: number[]): Promise<WeddingCardGuest[]> {
    return apiClient.post<WeddingCardGuest[]>(`/wedding-cards/${cardId}/guests/bulk-add/`, { guest_ids: guestIds });
  }

  static async bulkRemoveGuestsFromCard(cardId: number, guestIds: number[]): Promise<void> {
    return apiClient.post(`/wedding-cards/${cardId}/guests/bulk-remove/`, { guest_ids: guestIds });
  }

  // Card sharing operations
  static async generateShareableLink(cardId: number): Promise<{ shareable_link: string }> {
    return apiClient.post<{ shareable_link: string }>(`/wedding-cards/${cardId}/generate-link/`);
  }

  static async disableShareableLink(cardId: number): Promise<void> {
    return apiClient.post(`/wedding-cards/${cardId}/disable-link/`);
  }

  static async updateShareableLink(cardId: number): Promise<{ shareable_link: string }> {
    return apiClient.post<{ shareable_link: string }>(`/wedding-cards/${cardId}/update-link/`);
  }

  // Template operations
  static async getCardTemplates(): Promise<any[]> {
    return apiClient.get<any[]>('/wedding-cards/templates/');
  }

  static async createCardFromTemplate(templateId: number, cardData: WeddingCardCreateRequest): Promise<WeddingCard> {
    return apiClient.post<WeddingCard>(`/wedding-cards/create-from-template/${templateId}/`, cardData);
  }

  // Notification operations
  static async sendInvitationEmails(cardId: number, guestIds?: number[]): Promise<void> {
    const data = guestIds ? { guest_ids: guestIds } : {};
    return apiClient.post(`/wedding-cards/${cardId}/send-invitations/`, data);
  }

  static async sendReminderEmails(cardId: number, guestIds?: number[]): Promise<void> {
    const data = guestIds ? { guest_ids: guestIds } : {};
    return apiClient.post(`/wedding-cards/${cardId}/send-reminders/`, data);
  }

  // ViewSet operations for advanced usage
  static async getAllWeddingCards(): Promise<WeddingCard[]> {
    return apiClient.get<WeddingCard[]>('/wedding-cards/cards/');
  }

  static async getAllWeddingCardGuests(): Promise<WeddingCardGuest[]> {
    return apiClient.get<WeddingCardGuest[]>('/wedding-cards/guests/');
  }
}

export default WeddingCardService;
