'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MediaService } from '../services';
import type { Album, Media, PaginatedResponse, AlbumCreateRequest, AlbumUpdateRequest } from '../types/api';

// Fetch albums
export function useAlbums(eventType?: string) {
  const { data, error, isLoading, mutate } = useSWR<Album[]>(
    `albums${eventType ? `-${eventType}` : ''}`,
    () => MediaService.getAlbums(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    albums: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Fetch single album
export function useAlbum(albumId: number) {
  const { data, error, isLoading, mutate } = useSWR<Album>(
    albumId ? `album-${albumId}` : null,
    () => MediaService.getAlbum(albumId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    album: data,
    isLoading,
    error,
    mutate,
  };
}

// Fetch albums by event type
export function useAlbumsByEvent() {
  const { data, error, isLoading, mutate } = useSWR<Record<string, {
    name: string;
    count: number;
    albums: Album[];
  }>>
(
    'albums-by-event',
    () => MediaService.getAlbumsByEvent(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    albumsByEvent: data,
    isLoading,
    error,
    mutate,
  };
}

// Fetch featured albums
export function useFeaturedAlbums() {
  const { data, error, isLoading, mutate } = useSWR<Album[]>(
    'featured-albums',
    () => MediaService.getFeaturedAlbums(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    albums: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Create album mutation
export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation<Album, Error, AlbumCreateRequest>({
    mutationFn: (albumData) => MediaService.createAlbum(albumData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['albums-by-event'] });
      queryClient.invalidateQueries({ queryKey: ['featured-albums'] });
    },
  });
}

// Update album mutation
export function useUpdateAlbum() {
  const queryClient = useQueryClient();

  return useMutation<Album, Error, { albumId: number; albumData: AlbumUpdateRequest }>({
    mutationFn: ({ albumId, albumData }) => MediaService.updateAlbum(albumId, albumData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['albums-by-event'] });
      queryClient.invalidateQueries({ queryKey: ['featured-albums'] });
      queryClient.invalidateQueries({ queryKey: [`album-${variables.albumId}`] });
    },
  });
}

// Delete album mutation
export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (albumId) => MediaService.deleteAlbum(albumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['albums-by-event'] });
      queryClient.invalidateQueries({ queryKey: ['featured-albums'] });
    },
  });
}

// Add media to album mutation
export function useAddMediaToAlbum() {
  const queryClient = useQueryClient();

  return useMutation<{ added_count: number }, Error, { albumId: number; mediaIds: number[] }>({
    mutationFn: ({ albumId, mediaIds }) => MediaService.addMediaToAlbum(albumId, mediaIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`album-${variables.albumId}`] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

// Remove media from album mutation
export function useRemoveMediaFromAlbum() {
  const queryClient = useQueryClient();

  return useMutation<{ removed_count: number }, Error, { albumId: number; mediaIds: number[] }>({
    mutationFn: ({ albumId, mediaIds }) => MediaService.removeMediaFromAlbum(albumId, mediaIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`album-${variables.albumId}`] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

// Fetch wedding gallery
export function useWeddingGallery(weddingId?: number) {
  const { data, error, isLoading, mutate } = useSWR<Media[]>(
    weddingId ? `wedding-gallery-${weddingId}` : 'my-wedding-gallery',
    () => MediaService.getWeddingGallery(weddingId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    media: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Fetch media
export function useMedia(page = 1, pageSize = 20) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Media>>(
    `media?page=${page}`,
    () => MediaService.getMedia(page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    media: data?.results || [],
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

// Upload media mutation
export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation<Media, Error, { file: File; title?: string; description?: string; tags?: string[] }>({
    mutationFn: ({ file, title, description, tags }) => 
      MediaService.uploadMedia(file, title, description, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['wedding-gallery'] });
    },
  });
}

// Delete media mutation
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (mediaId) => MediaService.deleteMediaItem(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['wedding-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}
