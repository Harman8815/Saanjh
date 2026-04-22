'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorService } from '../services';
import { Vendor, VendorStatistics, BulkVendorStatusUpdate, PaginatedResponse } from '../types/api';

// Fetch vendors with pagination
export function useVendors(page = 1, pageSize = 20) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Vendor>>(
    `vendors?page=${page}&page_size=${pageSize}`,
    () => VendorService.getVendors(page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    vendors: data?.results || [],
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

// Fetch vendor statistics
export function useVendorStatistics() {
  const { data, error, isLoading, mutate } = useSWR<VendorStatistics>(
    'vendor-statistics',
    () => VendorService.getStatistics(),
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

// Fetch follow-ups
export function useVendorFollowUps() {
  const { data, error, isLoading, mutate } = useSWR<Vendor[]>(
    'vendor-follow-ups',
    () => VendorService.getFollowUps(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    followUps: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Search vendors
export function useSearchVendors(query: string) {
  const { data, error, isLoading, mutate } = useSWR<Vendor[]>(
    query ? `search-vendors-${query}` : null,
    () => VendorService.searchVendors(query),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    vendors: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Filter vendors by category
export function useFilterVendorsByCategory(category: string) {
  const { data, error, isLoading, mutate } = useSWR<Vendor[]>(
    category ? `vendors-filter-category-${category}` : null,
    () => VendorService.filterVendorsByCategory(category),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    vendors: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Filter vendors by status
export function useFilterVendorsByStatus(status: string) {
  const { data, error, isLoading, mutate } = useSWR<Vendor[]>(
    status ? `vendors-filter-status-${status}` : null,
    () => VendorService.filterVendorsByStatus(status),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    vendors: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Create vendor mutation
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation<Vendor, Error, Omit<Vendor, 'id' | 'created_at' | 'updated_at'>>({
    mutationFn: (vendorData) => VendorService.createVendor(vendorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-follow-ups'] });
    },
  });
}

// Update vendor mutation
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation<Vendor, Error, { vendorId: number; vendorData: Partial<Vendor> }>({
    mutationFn: ({ vendorId, vendorData }) => VendorService.updateVendor(vendorId, vendorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-follow-ups'] });
    },
  });
}

// Delete vendor mutation
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (vendorId) => VendorService.deleteVendor(vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-follow-ups'] });
    },
  });
}

// Bulk status update mutation
export function useBulkVendorStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, BulkVendorStatusUpdate>({
    mutationFn: (bulkData) => VendorService.bulkStatusUpdate(bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-follow-ups'] });
    },
  });
}

// Mark as contacted mutation
export function useMarkVendorAsContacted() {
  const queryClient = useQueryClient();

  return useMutation<Vendor, Error, number>({
    mutationFn: (vendorId) => VendorService.markAsContacted(vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-follow-ups'] });
    },
  });
}
