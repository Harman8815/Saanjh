'use client';

import Skeleton from 'react-loading-skeleton';

// Only import CSS on client side to avoid SSR issues
if (typeof window !== 'undefined') {
  import('react-loading-skeleton/dist/skeleton.css');
}

export default function GuestLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-surface border-r border-white/10 h-screen fixed left-0 top-0 z-40">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface/50 rounded-lg animate-pulse"></div>
              <div className="w-24 h-6 bg-surface/50 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-8 h-8 bg-surface/50 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="p-4">
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-3 rounded-lg">
                <div className="w-5 h-5 bg-surface/50 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-surface/50 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-center">
            <div className="w-12 h-12 bg-surface/50 rounded-full mx-auto mb-3 animate-pulse"></div>
            <div className="h-4 w-20 bg-surface/50 rounded-lg mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton - Match exact layout structure */}
      <div className="flex-1 transition-all duration-300 overflow-x-hidden md:ml-64 ml-0">
        <div className="container mx-auto px-4 py-8 transition-all duration-300 max-w-[calc(100vw-16rem)]">
          {/* Breadcrumbs and Back Button Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 bg-surface/50 rounded-lg animate-pulse"></div>
              <div className="h-4 w-16 bg-surface/50 rounded-lg animate-pulse"></div>
              <div className="h-4 w-4 bg-surface/50 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg">
              <div className="w-4 h-4 bg-surface/50 rounded-lg animate-pulse"></div>
              <div className="h-4 w-8 bg-surface/50 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Search Bar Skeleton */}
          <div className="mb-8">
            <div className="h-12 w-full bg-surface border border-white/20 rounded-lg animate-pulse"></div>
          </div>

          {/* Page Content Skeleton */}
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center">
              <div className="h-12 w-64 bg-surface/50 rounded-lg mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 w-96 bg-surface/50 rounded-lg mx-auto animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-surface/50 rounded-lg animate-pulse"></div>
                    <div className="h-6 w-16 bg-surface/50 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="h-8 w-20 bg-surface/50 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 w-32 bg-surface/50 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Guest List Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-white/10 rounded-lg">
                  <div className="w-5 h-5 bg-surface/50 rounded-lg animate-pulse"></div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="h-5 w-24 bg-surface/50 rounded-lg animate-pulse"></div>
                    <div className="h-5 w-32 bg-surface/50 rounded-lg animate-pulse"></div>
                    <div className="h-5 w-28 bg-surface/50 rounded-lg animate-pulse"></div>
                    <div className="h-5 w-16 bg-surface/50 rounded-lg animate-pulse"></div>
                    <div className="h-5 w-12 bg-surface/50 rounded-lg animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-surface/50 rounded-lg animate-pulse"></div>
                      <div className="w-8 h-8 bg-surface/50 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
