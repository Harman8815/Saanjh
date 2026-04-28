'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentService } from '../services';
import type { Document, DocumentStatistics, PaginatedResponse, DocumentCreateRequest, DocumentUpdateRequest } from '../types/api';

// Fetch documents with pagination
export function useDocuments(page = 1, pageSize = 20, category?: string) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Document>>(
    `documents?page=${page}&category=${category || 'all'}`,
    () => DocumentService.getDocuments(page, pageSize, category),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    documents: data?.results || [],
    pagination: data ? {
      count: data.count,
      next: data.next,
      previous: data.previous,
      currentPage: page,
      totalPages: Math.ceil(data.count / pageSize),
    } : null,
    isLoading,
    error,
    mutate,
  };
}

// Fetch document statistics
export function useDocumentStatistics() {
  const { data, error, isLoading, mutate } = useSWR<DocumentStatistics>(
    'document-statistics',
    () => DocumentService.getStatistics(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    statistics: data,
    isLoading,
    error,
    mutate,
  };
}

// Search documents
export function useSearchDocuments(query: string, category?: string) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Document>>(
    query ? `search-documents-${query}-${category || 'all'}` : null,
    () => DocumentService.searchDocuments(query, category),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    documents: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Filter documents by tags
export function useFilterDocumentsByTags(tags: string[]) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Document>>(
    tags.length > 0 ? `documents-by-tags-${tags.join(',')}` : null,
    () => DocumentService.filterByTags(tags),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    documents: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Create document mutation
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation<Document, Error, DocumentCreateRequest>({
    mutationFn: (documentData) => DocumentService.uploadDocument(documentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-statistics'] });
    },
  });
}

// Update document mutation
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation<Document, Error, { documentId: number; documentData: DocumentUpdateRequest }>({
    mutationFn: ({ documentId, documentData }) => DocumentService.updateDocument(documentId, documentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-statistics'] });
    },
  });
}

// Delete document mutation
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (documentId) => DocumentService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-statistics'] });
    },
  });
}

// Bulk delete documents mutation
export function useBulkDeleteDocuments() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted_count: number }, Error, number[]>({
    mutationFn: (documentIds) => DocumentService.bulkDeleteDocuments(documentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-statistics'] });
    },
  });
}

// Download document
export function useDownloadDocument() {
  return useMutation<Blob, Error, number>({
    mutationFn: (documentId) => DocumentService.downloadDocument(documentId),
  });
}
