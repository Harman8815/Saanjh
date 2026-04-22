'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GuestService } from '../services';
import { Guest, GuestStatistics, BulkGuestCreate, BulkRSVPUpdate, PaginatedResponse } from '../types/api';

// Fetch guests with pagination
export function useGuests(page = 1, pageSize = 20) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Guest>>(
    `guests?page=${page}&page_size=${pageSize}`,
    () => GuestService.getGuests(page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    guests: data?.results || [],
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

// Fetch guest statistics
export function useGuestStatistics() {
  const { data, error, isLoading, mutate } = useSWR<GuestStatistics>(
    'guest-statistics',
    () => GuestService.getStatistics(),
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

// Search guests
export function useSearchGuests(query: string) {
  const { data, error, isLoading, mutate } = useSWR<Guest[]>(
    query ? `search-guests-${query}` : null,
    () => GuestService.searchGuests(query),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    guests: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Filter guests by RSVP status
export function useFilterGuestsByRSVP(rsvpStatus: string) {
  const { data, error, isLoading, mutate } = useSWR<Guest[]>(
    rsvpStatus ? `guests-filter-rsvp-${rsvpStatus}` : null,
    () => GuestService.filterGuestsByRSVP(rsvpStatus),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    guests: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Create guest mutation
export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation<Guest, Error, Omit<Guest, 'id' | 'created_at' | 'updated_at'>>({
    mutationFn: (guestData) => GuestService.createGuest(guestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest-statistics'] });
    },
  });
}

// Bulk create guests mutation
export function useBulkCreateGuests() {
  const queryClient = useQueryClient();

  return useMutation<Guest[], Error, BulkGuestCreate>({
    mutationFn: (bulkData) => GuestService.bulkCreateGuests(bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest-statistics'] });
    },
  });
}

// Update guest mutation
export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation<Guest, Error, { guestId: number; guestData: Partial<Guest> }>({
    mutationFn: ({ guestId, guestData }) => GuestService.updateGuest(guestId, guestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest-statistics'] });
    },
  });
}

// Delete guest mutation
export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (guestId) => GuestService.deleteGuest(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest-statistics'] });
    },
  });
}

// Bulk RSVP update mutation
export function useBulkRSVPUpdate() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, BulkRSVPUpdate>({
    mutationFn: (bulkData) => GuestService.bulkRSVPUpdate(bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest-statistics'] });
    },
  });
}

// Send invitations mutation
export function useSendInvitations() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number[] | undefined>({
    mutationFn: (guestIds) => GuestService.sendInvitations(guestIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}

// Export guests mutation
export function useExportGuests() {
  return useMutation<Blob, Error, string>({
    mutationFn: (format: string = 'csv') => GuestService.exportGuests(format),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `guests_export.${variables}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
