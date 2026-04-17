'use client';

import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

// Only import CSS on client side to avoid SSR issues
if (typeof window !== 'undefined') {
  import('react-loading-skeleton/dist/skeleton.css');
}

interface GuestSkeletonProps {
  count?: number;
  viewMode?: 'table' | 'card' | 'graph';
}

export default function GuestSkeleton({ count = 5, viewMode = 'table' }: GuestSkeletonProps) {
  if (viewMode === 'graph') {
    // Graph view skeleton
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton height={32} width={200} baseColor="#374151" highlightColor="#4b5563" />
          <Skeleton height={36} width={120} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
        </div>
        <div className="h-96 bg-surface/50 border border-white/10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Skeleton width={64} height={64} baseColor="#374151" highlightColor="#4b5563" className="mx-auto mb-4 rounded-lg" />
            <Skeleton height={20} width={160} baseColor="#374151" highlightColor="#4b5563" className="mx-auto mb-2" />
            <Skeleton height={16} width={120} baseColor="#374151" highlightColor="#4b5563" className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={viewMode === 'card' ? 'glass-card p-6' : ''}>
          {viewMode === 'table' ? (
            // Table view skeleton
            <div className="flex items-center gap-4 p-4 border border-white/10 rounded-lg">
              <Skeleton width={20} height={20} baseColor="#374151" highlightColor="#4b5563" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                <Skeleton height={20} width={120} baseColor="#374151" highlightColor="#4b5563" />
                <Skeleton height={20} width={150} baseColor="#374151" highlightColor="#4b5563" />
                <Skeleton height={20} width={100} baseColor="#374151" highlightColor="#4b5563" />
                <Skeleton height={20} width={80} baseColor="#374151" highlightColor="#4b5563" />
                <Skeleton height={20} width={60} baseColor="#374151" highlightColor="#4b5563" />
                <div className="flex gap-2">
                  <Skeleton width={32} height={32} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
                  <Skeleton width={32} height={32} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
                </div>
              </div>
            </div>
          ) : (
            // Card view skeleton
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton circle width={40} height={40} baseColor="#374151" highlightColor="#4b5563" />
                  <div>
                    <Skeleton height={20} width={120} baseColor="#374151" highlightColor="#4b5563" />
                    <Skeleton height={16} width={150} baseColor="#374151" highlightColor="#4b5563" className="mt-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton width={32} height={32} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
                  <Skeleton width={32} height={32} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton height={16} width={80} baseColor="#374151" highlightColor="#4b5563" />
                <Skeleton height={16} width={100} baseColor="#374151" highlightColor="#4b5563" />
                <Skeleton height={16} width={90} baseColor="#374151" highlightColor="#4b5563" />
                <Skeleton height={16} width={70} baseColor="#374151" highlightColor="#4b5563" />
              </div>
              <Skeleton height={16} width="100%" baseColor="#374151" highlightColor="#4b5563" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Stats cards skeleton
export function GuestStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton circle width={48} height={48} baseColor="#374151" highlightColor="#4b5563" />
            <Skeleton height={20} width={60} baseColor="#374151" highlightColor="#4b5563" />
          </div>
          <Skeleton height={32} width={80} baseColor="#374151" highlightColor="#4b5563" className="mb-2" />
          <Skeleton height={16} width={100} baseColor="#374151" highlightColor="#4b5563" />
        </div>
      ))}
    </div>
  );
}

// Search and filters skeleton
export function GuestSearchSkeleton() {
  return (
    <div className="space-y-6 mb-8">
      {/* Search bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Skeleton height={48} width="100%" baseColor="#374151" highlightColor="#4b5563" borderRadius={12} />
        </div>
        <div className="flex gap-2">
          <Skeleton height={48} width={120} baseColor="#374151" highlightColor="#4b5563" borderRadius={12} />
          <Skeleton height={48} width={120} baseColor="#374151" highlightColor="#4b5563" borderRadius={12} />
        </div>
      </div>
      
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} height={36} width={80} baseColor="#374151" highlightColor="#4b5563" borderRadius={20} />
        ))}
      </div>
    </div>
  );
}

// Import/Export controls skeleton
export function GuestImportExportSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="glass-card p-6">
          <Skeleton height={24} width={140} baseColor="#374151" highlightColor="#4b5563" className="mb-4" />
          <Skeleton height={16} width="100%" baseColor="#374151" highlightColor="#4b5563" className="mb-4" />
          <div className="flex gap-2">
            <Skeleton height={40} width={100} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
            <Skeleton height={40} width={100} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Pagination skeleton
export function GuestPaginationSkeleton() {
  return (
    <div className="flex items-center justify-between mt-8">
      <Skeleton height={16} width={120} baseColor="#374151" highlightColor="#4b5563" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} width={40} height={40} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
        ))}
      </div>
      <Skeleton height={16} width={80} baseColor="#374151" highlightColor="#4b5563" />
    </div>
  );
}
