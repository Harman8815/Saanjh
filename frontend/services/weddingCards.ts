import { apiClient } from './api';
import { 
  WeddingCard, 
  WeddingCardGuest,
  WeddingCardAnalytics,
  PaginatedResponse 
} from '../types/api';

export class WeddingCardService {
  // Get all wedding cards
  static async getWeddingCards(page = 1, pageSize = 20): Promise<PaginatedResponse<WeddingCard>> {
    return apiClient.get<PaginatedResponse<WeddingCard>>(`/wedding-cards/?page=${page}&page_size=${pageSize}`);
  }

  // Create new wedding card
  static async createWeddingCard(cardData: Omit<WeddingCard, 'id' | 'created_at' | 'updated_at'>): Promise<WeddingCard> {
    return apiClient.post<WeddingCard>('/wedding-cards/', cardData);
  }

  // Get wedding card by ID
  static async getWeddingCard(cardId: number): Promise<WeddingCard> {
    return apiClient.get<WeddingCard>(`/wedding-cards/${cardId}/`);
  }

  // Update wedding card
  static async updateWeddingCard(cardId: number, cardData: Partial<WeddingCard>): Promise<WeddingCard> {
    return apiClient.patch<WeddingCard>(`/wedding-cards/${cardId}/`, cardData);
  }

  // Delete wedding card
  static async deleteWeddingCard(cardId: number): Promise<void> {
    return apiClient.delete(`/wedding-cards/${cardId}/`);
  }

  // Get wedding card guests
  static async getWeddingCardGuests(cardId: number, page = 1, pageSize = 20): Promise<PaginatedResponse<WeddingCardGuest>> {
    return apiClient.get<PaginatedResponse<WeddingCardGuest>>(`/wedding-cards/${cardId}/guests/?page=${page}&page_size=${pageSize}`);
  }

  // Add guest to wedding card
  static async addGuestToWeddingCard(cardId: number, guestData: Omit<WeddingCardGuest, 'id' | 'created_at'>): Promise<WeddingCardGuest> {
    return apiClient.post<WeddingCardGuest>(`/wedding-cards/${cardId}/guests/`, guestData);
  }

  // Get wedding card guest by ID
  static async getWeddingCardGuest(cardId: number, guestId: number): Promise<WeddingCardGuest> {
    return apiClient.get<WeddingCardGuest>(`/wedding-cards/${cardId}/guests/${guestId}/`);
  }

  // Update wedding card guest
  static async updateWeddingCardGuest(cardId: number, guestId: number, guestData: Partial<WeddingCardGuest>): Promise<WeddingCardGuest> {
    return apiClient.patch<WeddingCardGuest>(`/wedding-cards/${cardId}/guests/${guestId}/`, guestData);
  }

  // Delete wedding card guest
  static async deleteWeddingCardGuest(cardId: number, guestId: number): Promise<void> {
    return apiClient.delete(`/wedding-cards/${cardId}/guests/${guestId}/`);
  }

  // Upload photo for wedding card guest
  static async uploadGuestPhoto(cardId: number, guestId: number, photoFile: File): Promise<WeddingCardGuest> {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return apiClient.post<WeddingCardGuest>(`/wedding-cards/${cardId}/guests/${guestId}/upload-photo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get wedding card analytics
  static async getWeddingCardAnalytics(cardId: number): Promise<WeddingCardAnalytics> {
    return apiClient.get<WeddingCardAnalytics>(`/wedding-cards/${cardId}/analytics/`);
  }

  // Export wedding card guests
  static async exportWeddingCardGuests(cardId: number, format = 'csv'): Promise<Blob> {
    return apiClient.get(`/wedding-cards/${cardId}/export/?format=${format}`, {
      responseType: 'blob'
    });
  }

  // Get public wedding card by shareable link
  static async getPublicWeddingCard(shareableLink: string): Promise<WeddingCard> {
    return apiClient.get<WeddingCard>(`/public/cards/${shareableLink}/`);
  }

  // Get public wedding card guests
  static async getPublicWeddingCardGuests(shareableLink: string): Promise<WeddingCardGuest[]> {
    return apiClient.get<WeddingCardGuest[]>(`/public/cards/${shareableLink}/guests/`);
  }

  // Public photo upload (for guests)
  static async uploadPublicGuestPhoto(shareableLink: string, guestId: number, photoFile: File): Promise<WeddingCardGuest> {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return apiClient.post<WeddingCardGuest>(`/public/cards/${shareableLink}/guests/${guestId}/upload-photo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default WeddingCardService;
