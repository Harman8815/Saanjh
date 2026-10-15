import { apiClient } from './api';
import type { 
  Document as ApiDocument, 
  DocumentTag,
  DocumentCategory,
  DocumentStatistics,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  PaginatedResponse 
} from '../types/api';

// Type alias to avoid conflict with browser's Document type
type Document = ApiDocument;

// Type for documents grouped by category
type DocumentsByCategory = Record<string, {
  name: string;
  count: number;
  documents: Document[];
}>;

export class DocumentService {
  // Document CRUD operations
  static async getDocuments(page = 1, pageSize = 20, category?: string): Promise<PaginatedResponse<Document>> {
    let url = `/documents/documents/?page=${page}&page_size=${pageSize}`;
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    return apiClient.get<PaginatedResponse<Document>>(url);
  }

  static async uploadDocument(data: DocumentCreateRequest): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('category', data.category);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.tag_names && data.tag_names.length > 0) {
      data.tag_names.forEach(tag => formData.append('tag_names', tag));
    }
    
    return apiClient.post<Document>('/documents/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async getDocument(documentId: number): Promise<Document> {
    return apiClient.get<Document>(`/documents/documents/${documentId}/`);
  }

  static async updateDocument(documentId: number, data: DocumentUpdateRequest): Promise<Document> {
    return apiClient.patch<Document>(`/documents/documents/${documentId}/`, data);
  }

  static async deleteDocument(documentId: number): Promise<void> {
    return apiClient.delete(`/documents/documents/${documentId}/`);
  }

  // Bulk operations
  static async bulkDeleteDocuments(documentIds: number[]): Promise<{ deleted_count: number }> {
    return apiClient.post<{ deleted_count: number }>('/documents/documents/bulk_delete/', {
      document_ids: documentIds
    });
  }

  static async bulkUpdateTags(documentIds: number[], tagNames: string[]): Promise<{ updated_count: number }> {
    return apiClient.post<{ updated_count: number }>('/documents/documents/bulk_update_tags/', {
      document_ids: documentIds,
      tag_names: tagNames
    });
  }

  // Download
  static async downloadDocument(documentId: number): Promise<Blob> {
    return apiClient.get(`/documents/documents/${documentId}/download/`, {
      responseType: 'blob'
    });
  }

  // Statistics
  static async getStatistics(): Promise<DocumentStatistics> {
    return apiClient.get<DocumentStatistics>('/documents/statistics/');
  }

  // Categories
  static async getCategories(): Promise<DocumentCategory[]> {
    return apiClient.get<DocumentCategory[]>('/documents/categories/');
  }

  static async createCategory(data: Omit<DocumentCategory, 'id'>): Promise<DocumentCategory> {
    return apiClient.post<DocumentCategory>('/documents/categories/', data);
  }

  static async updateCategory(categoryId: number, data: Partial<DocumentCategory>): Promise<DocumentCategory> {
    return apiClient.patch<DocumentCategory>(`/documents/categories/${categoryId}/`, data);
  }

  static async deleteCategory(categoryId: number): Promise<void> {
    return apiClient.delete(`/documents/categories/${categoryId}/`);
  }

  // Tags
  static async getTags(): Promise<DocumentTag[]> {
    return apiClient.get<DocumentTag[]>('/documents/tags/');
  }

  static async createTag(name: string): Promise<DocumentTag> {
    return apiClient.post<DocumentTag>('/documents/tags/', { name });
  }

  static async updateTag(tagId: number, name: string): Promise<DocumentTag> {
    return apiClient.patch<DocumentTag>(`/documents/tags/${tagId}/`, { name });
  }

  static async deleteTag(tagId: number): Promise<void> {
    return apiClient.delete(`/documents/tags/${tagId}/`);
  }

  // Search and filter operations
  static async searchDocuments(query: string, category?: string): Promise<PaginatedResponse<Document>> {
    let url = `/documents/documents/?search=${encodeURIComponent(query)}`;
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    return apiClient.get<PaginatedResponse<Document>>(url);
  }

  static async filterByTags(tags: string[]): Promise<PaginatedResponse<Document>> {
    const params = new URLSearchParams();
    tags.forEach(tag => params.append('tags', tag));
    return apiClient.get<PaginatedResponse<Document>>(`/documents/documents/?${params.toString()}`);
  }

  static async getDocumentsByCategory(): Promise<DocumentsByCategory> {
    return apiClient.get<DocumentsByCategory>('/documents/documents/by_category/');
  }

  // ViewSet operations
  static async getAllDocuments(): Promise<Document[]> {
    return apiClient.get<Document[]>('/documents/documents/');
  }
}

export default DocumentService;

