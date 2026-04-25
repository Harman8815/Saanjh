import { apiClient } from './api';
import { 
  Vendor, 
  VendorCatalog,
  VendorCategory,
  VendorStatus,
  VendorStatistics,
  BulkVendorStatusUpdate,
  VendorCreateRequest,
  PaginatedResponse 
} from '../types/api';

export class VendorService {
  // Vendor CRUD operations
  static async getVendors(page = 1, pageSize = 20): Promise<PaginatedResponse<Vendor>> {
    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors/?page=${page}&page_size=${pageSize}`);
  }

  static async createVendor(vendorData: VendorCreateRequest): Promise<Vendor> {
    return apiClient.post<Vendor>('/vendors/', vendorData);
  }

  static async getVendor(vendorId: number): Promise<Vendor> {
    return apiClient.get<Vendor>(`/vendors/${vendorId}/`);
  }

  static async updateVendor(vendorId: number, vendorData: Partial<Vendor>): Promise<Vendor> {
    return apiClient.patch<Vendor>(`/vendors/${vendorId}/`, vendorData);
  }

  static async deleteVendor(vendorId: number): Promise<void> {
    return apiClient.delete(`/vendors/${vendorId}/`);
  }

  // Bulk operations
  static async bulkStatusUpdate(bulkData: BulkVendorStatusUpdate): Promise<void> {
    return apiClient.post('/vendors/bulk-status-update/', bulkData);
  }

  // Statistics and analytics
  static async getStatistics(): Promise<VendorStatistics> {
    return apiClient.get<VendorStatistics>('/vendors/statistics/');
  }

  // Follow-up operations
  static async getFollowUps(): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>('/vendors/follow-ups/');
  }

  static async markAsContacted(vendorId: number): Promise<Vendor> {
    return apiClient.post<Vendor>(`/vendors/${vendorId}/mark-contacted/`);
  }

  // Catalog operations
  static async getVendorCatalog(): Promise<VendorCatalog[]> {
    return apiClient.get<VendorCatalog[]>('/vendors/vendor-catalog/');
  }

  static async getVendorCatalogById(id: number): Promise<VendorCatalog> {
    return apiClient.get<VendorCatalog>(`/vendors/vendor-catalog/${id}/`);
  }

  static async searchVendorCatalog(params?: {
    category?: number;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
  }): Promise<VendorCatalog[]> {
    return apiClient.get<VendorCatalog[]>('/vendors/vendor-catalog/', { params });
  }

  // Category operations
  static async getVendorCategories(): Promise<VendorCategory[]> {
    return apiClient.get<VendorCategory[]>('/vendors/vendor-categories/');
  }

  static async createVendorCategory(categoryData: Omit<VendorCategory, 'id'>): Promise<VendorCategory> {
    return apiClient.post<VendorCategory>('/vendors/vendor-categories/', categoryData);
  }

  static async updateVendorCategory(categoryId: number, categoryData: Partial<VendorCategory>): Promise<VendorCategory> {
    return apiClient.patch<VendorCategory>(`/vendors/vendor-categories/${categoryId}/`, categoryData);
  }

  static async deleteVendorCategory(categoryId: number): Promise<void> {
    return apiClient.delete(`/vendors/vendor-categories/${categoryId}/`);
  }

  // Status operations
  static async getVendorStatuses(): Promise<VendorStatus[]> {
    return apiClient.get<VendorStatus[]>('/vendors/vendor-status/');
  }

  static async createVendorStatus(statusData: Omit<VendorStatus, 'id'>): Promise<VendorStatus> {
    return apiClient.post<VendorStatus>('/vendors/vendor-status/', statusData);
  }

  static async updateVendorStatus(statusId: number, statusData: Partial<VendorStatus>): Promise<VendorStatus> {
    return apiClient.patch<VendorStatus>(`/vendors/vendor-status/${statusId}/`, statusData);
  }

  static async deleteVendorStatus(statusId: number): Promise<void> {
    return apiClient.delete(`/vendors/vendor-status/${statusId}/`);
  }

  // Search and filter operations
  static async searchVendors(query: string): Promise<PaginatedResponse<Vendor>> {
    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors/?search=${query}`);
  }

  static async filterVendorsByCategory(categoryId: number): Promise<PaginatedResponse<Vendor>> {
    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors/?category=${categoryId}`);
  }

  static async filterVendorsByStatus(statusId: number): Promise<PaginatedResponse<Vendor>> {
    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors/?status=${statusId}`);
  }

  static async filterVendorsByPriceRange(minPrice?: number, maxPrice?: number): Promise<PaginatedResponse<Vendor>> {
    const params = new URLSearchParams();
    if (minPrice) params.append('min_price', minPrice.toString());
    if (maxPrice) params.append('max_price', maxPrice.toString());
    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors/?${params.toString()}`);
  }

  // ViewSet operations for advanced usage
  static async getAllVendors(): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>('/vendors/vendors/');
  }

  static async getAllVendorCatalog(): Promise<VendorCatalog[]> {
    return apiClient.get<VendorCatalog[]>('/vendors/vendor-catalog/');
  }

  static async getAllVendorCategories(): Promise<VendorCategory[]> {
    return apiClient.get<VendorCategory[]>('/vendors/vendor-categories/');
  }

  static async getAllVendorStatuses(): Promise<VendorStatus[]> {
    return apiClient.get<VendorStatus[]>('/vendors/vendor-status/');
  }
}

export default VendorService;
