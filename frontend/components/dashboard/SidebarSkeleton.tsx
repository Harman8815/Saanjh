'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SidebarSkeleton() {
  return (
    <div className="fixed left-0 top-0 h-full bg-surface border-r border-white/10 z-40 transition-all duration-300 overflow-y-auto overflow-x-hidden w-64">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Skeleton circle width={40} height={40} baseColor="#374151" highlightColor="#4b5563" />
          <div className="flex-1">
            <Skeleton height={20} width={120} baseColor="#374151" highlightColor="#4b5563" />
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="py-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="px-4 py-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
              <Skeleton circle width={20} height={20} baseColor="#374151" highlightColor="#4b5563" />
              <Skeleton height={16} width={100} baseColor="#374151" highlightColor="#4b5563" />
              {i <= 2 && (
                <Skeleton height={16} width={20} baseColor="#374151" highlightColor="#4b5563" borderRadius={10} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
          <Skeleton circle width={20} height={20} baseColor="#374151" highlightColor="#4b5563" />
          <Skeleton height={16} width={80} baseColor="#374151" highlightColor="#4b5563" />
        </div>
      </div>
    </div>
  );
}
