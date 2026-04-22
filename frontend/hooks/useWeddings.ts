'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WeddingService } from '../services';
import { Wedding, WeddingDashboard, TimelineEvent } from '../types/api';

// Fetch wedding details
export function useWedding() {
  const { data, error, isLoading, mutate } = useSWR<Wedding>(
    'wedding',
    () => WeddingService.getWedding(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    wedding: data,
    isLoading,
    error,
    mutate,
  };
}

// Fetch wedding dashboard
export function useWeddingDashboard() {
  const { data, error, isLoading, mutate } = useSWR<WeddingDashboard>(
    'wedding-dashboard',
    () => WeddingService.getDashboard(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    dashboard: data,
    isLoading,
    error,
    mutate,
  };
}

// Fetch wedding timeline
export function useWeddingTimeline() {
  const { data, error, isLoading, mutate } = useSWR<TimelineEvent[]>(
    'wedding-timeline',
    () => WeddingService.getTimeline(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    timeline: data,
    isLoading,
    error,
    mutate,
  };
}

// Create wedding mutation
export function useCreateWedding() {
  const queryClient = useQueryClient();

  return useMutation<Wedding, Error, Omit<Wedding, 'id' | 'created_at' | 'updated_at'>>({
    mutationFn: (weddingData) => WeddingService.createWedding(weddingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding'] });
      queryClient.invalidateQueries({ queryKey: ['wedding-dashboard'] });
    },
  });
}

// Update wedding mutation
export function useUpdateWedding() {
  const queryClient = useQueryClient();

  return useMutation<Wedding, Error, Partial<Wedding>>({
    mutationFn: (weddingData) => WeddingService.updateWedding(weddingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding'] });
      queryClient.invalidateQueries({ queryKey: ['wedding-dashboard'] });
    },
  });
}

// Add timeline event mutation
export function useAddTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation<TimelineEvent, Error, Omit<TimelineEvent, 'id'>>({
    mutationFn: (eventData) => WeddingService.addTimelineEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-timeline'] });
    },
  });
}

// Update timeline event mutation
export function useUpdateTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation<TimelineEvent, Error, { eventId: number; eventData: Partial<TimelineEvent> }>({
    mutationFn: ({ eventId, eventData }) => WeddingService.updateTimelineEvent(eventId, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-timeline'] });
    },
  });
}

// Delete timeline event mutation
export function useDeleteTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (eventId) => WeddingService.deleteTimelineEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-timeline'] });
    },
  });
}
