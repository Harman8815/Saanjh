'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SidebarSkeleton from './SidebarSkeleton';
import SearchSkeleton from './SearchSkeleton';

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Sidebar Skeleton */}
      <SidebarSkeleton />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 transition-all duration-300 overflow-x-hidden">
        <div className="container mx-auto px-4 py-8">
          {/* Search Bar Skeleton */}
          <div className="mb-8">
            <SearchSkeleton />
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton height={20} width={120} baseColor="#374151" highlightColor="#4b5563" />
              <Skeleton circle width={32} height={32} baseColor="#374151" highlightColor="#4b5563" />
            </div>
            <Skeleton height={36} width={80} baseColor="#374151" highlightColor="#4b5563" />
            <Skeleton height={16} width={100} baseColor="#374151" highlightColor="#4b5563" className="mt-2" />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline Skeleton */}
            <div className="glass-card p-8">
              <Skeleton height={32} width={200} baseColor="#374151" highlightColor="#4b5563" className="mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton circle width={16} height={16} baseColor="#374151" highlightColor="#4b5563" />
                    <div className="flex-1">
                      <Skeleton height={16} width={120} baseColor="#374151" highlightColor="#4b5563" />
                      <Skeleton height={14} width={200} baseColor="#374151" highlightColor="#4b5563" className="mt-1" />
                    </div>
                    <Skeleton height={14} width={60} baseColor="#374151" highlightColor="#4b5563" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Activity Skeleton */}
            <div className="glass-card p-8">
              <Skeleton height={32} width={180} baseColor="#374151" highlightColor="#4b5563" className="mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b border-white/10">
                    <Skeleton circle width={40} height={40} baseColor="#374151" highlightColor="#4b5563" />
                    <div className="flex-1">
                      <Skeleton height={16} width={100} baseColor="#374151" highlightColor="#4b5563" />
                      <Skeleton height={14} width={180} baseColor="#374151" highlightColor="#4b5563" className="mt-1" />
                    </div>
                    <Skeleton height={12} width={50} baseColor="#374151" highlightColor="#4b5563" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tasks Skeleton */}
            <div className="glass-card p-8">
              <div className="flex justify-between items-center mb-6">
                <Skeleton height={32} width={160} baseColor="#374151" highlightColor="#4b5563" />
                <Skeleton height={36} width={80} baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton width={20} height={20} baseColor="#374151" highlightColor="#4b5563" />
                    <div className="flex-1">
                      <Skeleton height={16} width={80} baseColor="#374151" highlightColor="#4b5563" />
                      <Skeleton height={14} width={160} baseColor="#374151" highlightColor="#4b5563" className="mt-1" />
                    </div>
                    <Skeleton height={14} width={40} baseColor="#374151" highlightColor="#4b5563" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="space-y-8">
            {/* Budget Overview Skeleton */}
            <div className="glass-card p-6">
              <Skeleton height={28} width={140} baseColor="#374151" highlightColor="#4b5563" className="mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton height={16} width={80} baseColor="#374151" highlightColor="#4b5563" />
                    <Skeleton height={16} width={60} baseColor="#374151" highlightColor="#4b5563" />
                  </div>
                ))}
                <Skeleton height={8} width="100%" baseColor="#374151" highlightColor="#4b5563" borderRadius={4} />
              </div>
            </div>
            
            {/* Vendor Status Skeleton */}
            <div className="glass-card p-6">
              <Skeleton height={28} width={120} baseColor="#374151" highlightColor="#4b5563" className="mb-4" />
              <div className="space-y-3">
                {['Venue', 'Photographer', 'Caterer', 'Florist'].map((vendor, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton height={16} width={70} baseColor="#374151" highlightColor="#4b5563" />
                    <Skeleton height={14} width={50} baseColor="#374151" highlightColor="#4b5563" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Actions Skeleton */}
            <div className="glass-card p-6">
              <Skeleton height={28} width={110} baseColor="#374151" highlightColor="#4b5563" className="mb-4" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={40} width="100%" baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
                ))}
              </div>
            </div>
            
            {/* Wedding Website Skeleton */}
            <div className="glass-card p-6">
              <Skeleton height={28} width={130} baseColor="#374151" highlightColor="#4b5563" className="mb-4" />
              <div className="space-y-4">
                <div className="text-center">
                  <Skeleton width={64} height={64} baseColor="#374151" highlightColor="#4b5563" className="mx-auto mb-4 rounded-lg" />
                  <Skeleton height={14} width={160} baseColor="#374151" highlightColor="#4b5563" className="mx-auto mb-4" />
                  <Skeleton height={40} width="100%" baseColor="#374151" highlightColor="#4b5563" borderRadius={8} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
