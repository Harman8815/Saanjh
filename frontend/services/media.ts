import { apiClient } from './api';
import type { 
  Media, 
  MediaType,
  MediaStatistics,
  PaginatedResponse,
  Album,
  AlbumCreateRequest,
  AlbumUpdateRequest
} from '../types/api';

export class MediaService {
  // Media CRUD operations
  static async getMedia(page = 1, pageSize = 20): Promise<PaginatedResponse<Media>> {
    return apiClient.get<PaginatedResponse<Media>>(`/media/media/?page=${page}&page_size=${pageSize}`);
  }

  static async uploadMedia(file: File, title?: string, description?: string, tags?: string[]): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (tags && tags.length > 0) {
      tags.forEach(tag => formData.append('tags', tag));
    }
    
    return apiClient.post<Media>('/media/media/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async getMediaItem(mediaId: number): Promise<Media> {
    return apiClient.get<Media>(`/media/media/${mediaId}/`);
  }

  static async updateMediaItem(mediaId: number, mediaData: Partial<Media>): Promise<Media> {
    return apiClient.patch<Media>(`/media/media/${mediaId}/`, mediaData);
  }

  static async deleteMediaItem(mediaId: number): Promise<void> {
    return apiClient.delete(`/media/media/${mediaId}/`);
  }

  // Media Type operations
  static async getMediaTypes(): Promise<MediaType[]> {
    return apiClient.get<MediaType[]>('/media/media-types/');
  }

  static async createMediaType(mediaTypeData: Omit<MediaType, 'id'>): Promise<MediaType> {
    return apiClient.post<MediaType>('/media/media-types/', mediaTypeData);
  }

  static async getMediaType(typeId: number): Promise<MediaType> {
    return apiClient.get<MediaType>(`/media/media-types/${typeId}/`);
  }

  static async updateMediaType(typeId: number, mediaTypeData: Partial<MediaType>): Promise<MediaType> {
    return apiClient.patch<MediaType>(`/media/media-types/${typeId}/`, mediaTypeData);
  }

  static async deleteMediaType(typeId: number): Promise<void> {
    return apiClient.delete(`/media/media-types/${typeId}/`);
  }

  // Statistics and analytics
  static async getMediaStatistics(): Promise<MediaStatistics> {
    return apiClient.get<MediaStatistics>('/media/statistics/');
  }

  // Search and filter operations
  static async searchMedia(query: string): Promise<PaginatedResponse<Media>> {
    return apiClient.get<PaginatedResponse<Media>>(`/media/media/?search=${query}`);
  }

  static async filterMediaByType(typeId: number): Promise<PaginatedResponse<Media>> {
    return apiClient.get<PaginatedResponse<Media>>(`/media/media/?media_type=${typeId}`);
  }

  static async filterMediaByTags(tags: string[]): Promise<PaginatedResponse<Media>> {
    const params = new URLSearchParams();
    tags.forEach(tag => params.append('tags', tag));
    return apiClient.get<PaginatedResponse<Media>>(`/media/media/?${params.toString()}`);
  }

  static async filterMediaByDateRange(startDate: string, endDate: string): Promise<PaginatedResponse<Media>> {
    return apiClient.get<PaginatedResponse<Media>>(`/media/media/?start_date=${startDate}&end_date=${endDate}`);
  }

  static async filterMediaByPublicStatus(isPublic: boolean): Promise<PaginatedResponse<Media>> {
    return apiClient.get<PaginatedResponse<Media>>(`/media/media/?is_public=${isPublic}`);
  }

  static async filterMediaBySizeRange(minSize?: number, maxSize?: number): Promise<PaginatedResponse<Media>> {
    const params = new URLSearchParams();
    if (minSize) params.append('min_size', minSize.toString());
    if (maxSize) params.append('max_size', maxSize.toString());
    return apiClient.get<PaginatedResponse<Media>>(`/media/media/?${params.toString()}`);
  }

  // Bulk operations
  static async bulkDeleteMedia(mediaIds: number[]): Promise<void> {
    return apiClient.post('/media/media/bulk-delete/', { media_ids: mediaIds });
  }

  static async bulkUpdateTags(mediaIds: number[], tags: string[]): Promise<Media[]> {
    return apiClient.post<Media[]>('/media/media/bulk-update-tags/', {
      media_ids: mediaIds,
      tags
    });
  }

  static async bulkUpdatePublicStatus(mediaIds: number[], isPublic: boolean): Promise<Media[]> {
    return apiClient.post<Media[]>('/media/media/bulk-update-public/', {
      media_ids: mediaIds,
      is_public: isPublic
    });
  }

  // Gallery operations
  static async getWeddingGallery(weddingId?: number): Promise<Media[]> {
    const url = weddingId 
      ? `/media/wedding/${weddingId}/gallery/`
      : '/media/my-wedding/gallery/';
    
    return apiClient.get<Media[]>(url);
  }

  static async createGallery(title: string, description?: string): Promise<{ id: number; title: string; description: string }> {
    return apiClient.post('/media/galleries/', { title, description });
  }

  static async addMediaToGallery(galleryId: number, mediaIds: number[]): Promise<void> {
    return apiClient.post(`/media/galleries/${galleryId}/add-media/`, { media_ids: mediaIds });
  }

  static async removeMediaFromGallery(galleryId: number, mediaIds: number[]): Promise<void> {
    return apiClient.post(`/media/galleries/${galleryId}/remove-media/`, { media_ids: mediaIds });
  }

  // Thumbnail operations
  static async generateThumbnail(mediaId: number): Promise<Media> {
    return apiClient.post<Media>(`/media/media/${mediaId}/generate-thumbnail/`);
  }

  static async updateThumbnail(mediaId: number, thumbnailFile: File): Promise<Media> {
    const formData = new FormData();
    formData.append('thumbnail', thumbnailFile);
    
    return apiClient.post<Media>(`/media/media/${mediaId}/update-thumbnail/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Download operations
  static async downloadMedia(mediaId: number): Promise<Blob> {
    return apiClient.get(`/media/media/${mediaId}/download/`, {
      responseType: 'blob'
    });
  }

  static async bulkDownloadMedia(mediaIds: number[]): Promise<Blob> {
    return apiClient.post('/media/media/bulk-download/', { media_ids: mediaIds }, {
      responseType: 'blob'
    });
  }

  // Sharing operations
  static async generateShareableLink(mediaId: number, expiresAt?: string): Promise<{ share_url: string; expires_at?: string }> {
    return apiClient.post<{ share_url: string; expires_at?: string }>(`/media/media/${mediaId}/share/`, {
      expires_at: expiresAt
    });
  }

  static async getSharedMedia(shareToken: string): Promise<Media> {
    return apiClient.get<Media>(`/media/shared/${shareToken}/`);
  }

  static async downloadSharedMedia(shareToken: string): Promise<Blob> {
    return apiClient.get(`/media/shared/${shareToken}/download/`, {
      responseType: 'blob'
    });
  }

  // Album operations
  static async getAlbums(): Promise<Album[]> {
    return apiClient.get<Album[]>('/media/albums/');
  }

  static async createAlbum(albumData: AlbumCreateRequest): Promise<Album> {
    return apiClient.post<Album>('/media/albums/', albumData);
  }

  static async getAlbum(albumId: number): Promise<Album> {
    return apiClient.get<Album>(`/media/albums/${albumId}/`);
  }

  static async updateAlbum(albumId: number, albumData: AlbumUpdateRequest): Promise<Album> {
    return apiClient.patch<Album>(`/media/albums/${albumId}/`, albumData);
  }

  static async deleteAlbum(albumId: number): Promise<void> {
    return apiClient.delete(`/media/albums/${albumId}/`);
  }

  static async addMediaToAlbum(albumId: number, mediaIds: number[]): Promise<{ added_count: number }> {
    return apiClient.post<{ added_count: number }>(`/media/albums/${albumId}/add-media/`, { media_ids: mediaIds });
  }

  static async removeMediaFromAlbum(albumId: number, mediaIds: number[]): Promise<{ removed_count: number }> {
    return apiClient.post<{ removed_count: number }>(`/media/albums/${albumId}/remove-media/`, { media_ids: mediaIds });
  }

  static async getAlbumsByEvent(): Promise<Record<string, {
    name: string;
    count: number;
    albums: Album[];
  }>> {
    return apiClient.get<Record<string, {
      name: string;
      count: number;
      albums: Album[];
    }>>('/media/albums/by_event/');
  }

  static async getFeaturedAlbums(): Promise<Album[]> {
    return apiClient.get<Album[]>('/media/albums/featured/');
  }

  // Processing operations
  static async processImage(mediaId: number, operations: {
    resize?: { width: number; height: number };
    crop?: { x: number; y: number; width: number; height: number };
    rotate?: number;
    filter?: string;
  }): Promise<Media> {
    return apiClient.post<Media>(`/media/media/${mediaId}/process/`, operations);
  }

  static async optimizeImage(mediaId: number): Promise<Media> {
    return apiClient.post<Media>(`/media/media/${mediaId}/optimize/`);
  }

  static async convertFormat(mediaId: number, format: string): Promise<Media> {
    return apiClient.post<Media>(`/media/media/${mediaId}/convert/`, { format });
  }

  // Metadata operations
  static async getMediaMetadata(mediaId: number): Promise<any> {
    return apiClient.get<any>(`/media/media/${mediaId}/metadata/`);
  }

  static async updateMediaMetadata(mediaId: number, metadata: any): Promise<Media> {
    return apiClient.patch<Media>(`/media/media/${mediaId}/metadata/`, metadata);
  }

  // ViewSet operations for advanced usage
  static async getAllMedia(): Promise<Media[]> {
    return apiClient.get<Media[]>('/media/media/');
  }

  static async getAllMediaTypes(): Promise<MediaType[]> {
    return apiClient.get<MediaType[]>('/media/media-types/');
  }

  // Backup operations
  static async createBackup(): Promise<{ backup_id: string; download_url: string }> {
    return apiClient.post<{ backup_id: string; download_url: string }>('/media/backup/create/');
  }

  static async restoreBackup(backupFile: File): Promise<{ restored_count: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('backup', backupFile);
    
    return apiClient.post<{ restored_count: number; errors: string[] }>('/media/backup/restore/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Storage operations
  static async getStorageInfo(): Promise<{
    total_storage: number;
    used_storage: number;
    available_storage: number;
    file_count: number;
    by_type: Record<string, number>;
  }> {
    return apiClient.get('/media/storage/info/');
  }

  static async cleanupUnusedFiles(): Promise<{ deleted_count: number; freed_space: number }> {
    return apiClient.post<{ deleted_count: number; freed_space: number }>('/media/storage/cleanup/');
  }
}

export default MediaService;
