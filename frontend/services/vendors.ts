import { apiClient } from './api';
import { 
  Vendor, 
  VendorStatistics,
  BulkVendorStatusUpdate,
  PaginatedResponse 
} from '../types/api';

export class VendorService {
  // Get all vendors
  static async getVendors(page = 1, pageSize = 20): Promise<PaginatedResponse<Vendor>> {
    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors/?page=${page}&page_size=${pageSize}`);
  }

  // Create new vendor
  static async createVendor(vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> {
    return apiClient.post<Vendor>('/vendors/', vendorData);
  }

  // Get vendor by ID
  static async getVendor(vendorId: number): Promise<Vendor> {
    return apiClient.get<Vendor>(`/vendors/${vendorId}/`);
  }

  // Update vendor
  static async updateVendor(vendorId: number, vendorData: Partial<Vendor>): Promise<Vendor> {
    return apiClient.patch<Vendor>(`/vendors/${vendorId}/`, vendorData);
  }

  // Delete vendor
  static async deleteVendor(vendorId: number): Promise<void> {
    return apiClient.delete(`/vendors/${vendorId}/`);
  }

  // Bulk status update
  static async bulkStatusUpdate(bulkData: BulkVendorStatusUpdate): Promise<void> {
    return apiClient.post('/vendors/bulk-status-update/', bulkData);
  }

  // Get vendor statistics
  static async getStatistics(): Promise<VendorStatistics> {
    return apiClient.get<VendorStatistics>('/vendors/statistics/');
  }

  // Get follow-ups
  static async getFollowUps(): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>('/vendors/follow-ups/');
  }

  // Mark vendor as contacted
  static async markAsContacted(vendorId: number): Promise<Vendor> {
    return apiClient.post<Vendor>(`/vendors/${vendorId}/mark-contacted/`);
  }

  // Search vendors
  static async searchVendors(query: string): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>(`/vendors/?search=${query}`);
  }

  // Filter vendors by category
  static async filterVendorsByCategory(category: string): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>(`/vendors/?category=${category}`);
  }

  // Filter vendors by status
  static async filterVendorsByStatus(status: string): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>(`/vendors/?status=${status}`);
  }
}

export default VendorService;
