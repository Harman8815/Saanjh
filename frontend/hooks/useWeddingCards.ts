'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WeddingCardService } from '../services';
import { WeddingCard, WeddingCardGuest, WeddingCardAnalytics, PaginatedResponse } from '../types/api';

// Fetch wedding cards with pagination
export function useWeddingCards(page = 1, pageSize = 20) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<WeddingCard>>(
    `wedding-cards?page=${page}&page_size=${pageSize}`,
    () => WeddingCardService.getWeddingCards(page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    weddingCards: data?.results || [],
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

// Fetch wedding card guests
export function useWeddingCardGuests(cardId: number, page = 1, pageSize = 20) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<WeddingCardGuest>>(
    cardId ? `wedding-card-${cardId}-guests?page=${page}&page_size=${pageSize}` : null,
    () => WeddingCardService.getWeddingCardGuests(cardId, page, pageSize),
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

// Fetch wedding card analytics
export function useWeddingCardAnalytics(cardId: number) {
  const { data, error, isLoading, mutate } = useSWR<WeddingCardAnalytics>(
    cardId ? `wedding-card-${cardId}-analytics` : null,
    () => WeddingCardService.getWeddingCardAnalytics(cardId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}

// Fetch public wedding card
export function usePublicWeddingCard(shareableLink: string) {
  const { data, error, isLoading, mutate } = useSWR<WeddingCard>(
    shareableLink ? `public-card-${shareableLink}` : null,
    () => WeddingCardService.getPublicWeddingCard(shareableLink),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    weddingCard: data,
    isLoading,
    error,
    mutate,
  };
}

// Fetch public wedding card guests
export function usePublicWeddingCardGuests(shareableLink: string) {
  const { data, error, isLoading, mutate } = useSWR<WeddingCardGuest[]>(
    shareableLink ? `public-card-${shareableLink}-guests` : null,
    () => WeddingCardService.getPublicWeddingCardGuests(shareableLink),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    guests: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Create wedding card mutation
export function useCreateWeddingCard() {
  const queryClient = useQueryClient();

  return useMutation<WeddingCard, Error, Omit<WeddingCard, 'id' | 'created_at' | 'updated_at'>>({
    mutationFn: (cardData) => WeddingCardService.createWeddingCard(cardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-cards'] });
    },
  });
}

// Update wedding card mutation
export function useUpdateWeddingCard() {
  const queryClient = useQueryClient();

  return useMutation<WeddingCard, Error, { cardId: number; cardData: Partial<WeddingCard> }>({
    mutationFn: ({ cardId, cardData }) => WeddingCardService.updateWeddingCard(cardId, cardData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wedding-cards'] });
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-analytics`] });
    },
  });
}

// Delete wedding card mutation
export function useDeleteWeddingCard() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (cardId) => WeddingCardService.deleteWeddingCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-cards'] });
    },
  });
}

// Add guest to wedding card mutation
export function useAddGuestToWeddingCard() {
  const queryClient = useQueryClient();

  return useMutation<WeddingCardGuest, Error, { cardId: number; guestData: Omit<WeddingCardGuest, 'id' | 'created_at'> }>({
    mutationFn: ({ cardId, guestData }) => WeddingCardService.addGuestToWeddingCard(cardId, guestData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-guests`] });
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-analytics`] });
    },
  });
}

// Update wedding card guest mutation
export function useUpdateWeddingCardGuest() {
  const queryClient = useQueryClient();

  return useMutation<WeddingCardGuest, Error, { cardId: number; guestId: number; guestData: Partial<WeddingCardGuest> }>({
    mutationFn: ({ cardId, guestId, guestData }) => WeddingCardService.updateWeddingCardGuest(cardId, guestId, guestData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-guests`] });
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-analytics`] });
    },
  });
}

// Delete wedding card guest mutation
export function useDeleteWeddingCardGuest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { cardId: number; guestId: number }>({
    mutationFn: ({ cardId, guestId }) => WeddingCardService.deleteWeddingCardGuest(cardId, guestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-guests`] });
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-analytics`] });
    },
  });
}

// Upload guest photo mutation
export function useUploadGuestPhoto() {
  const queryClient = useQueryClient();

  return useMutation<WeddingCardGuest, Error, { cardId: number; guestId: number; photoFile: File }>({
    mutationFn: ({ cardId, guestId, photoFile }) => WeddingCardService.uploadGuestPhoto(cardId, guestId, photoFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-guests`] });
      queryClient.invalidateQueries({ queryKey: [`wedding-card-${variables.cardId}-analytics`] });
    },
  });
}

// Upload public guest photo mutation
export function useUploadPublicGuestPhoto() {
  const queryClient = useQueryClient();

  return useMutation<WeddingCardGuest, Error, { shareableLink: string; guestId: number; photoFile: File }>({
    mutationFn: ({ shareableLink, guestId, photoFile }) => WeddingCardService.uploadPublicGuestPhoto(shareableLink, guestId, photoFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`public-card-${variables.shareableLink}-guests`] });
    },
  });
}

// Export wedding card guests mutation
export function useExportWeddingCardGuests() {
  return useMutation<Blob, Error, { cardId: number; format: string }>({
    mutationFn: ({ cardId, format }) => WeddingCardService.exportWeddingCardGuests(cardId, format),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wedding_card_guests_export.${variables.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
