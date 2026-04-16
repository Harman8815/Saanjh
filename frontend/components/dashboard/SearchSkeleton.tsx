'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SearchSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <Skeleton 
          height={64} 
          baseColor="#374151" 
          highlightColor="#4b5563" 
          borderRadius={16} 
          className="w-full" 
        />
        
        {/* Search Icon Skeleton */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Skeleton 
            circle 
            width={24} 
            height={24} 
            baseColor="#374151" 
            highlightColor="#4b5563" 
          />
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {['Tasks', 'Guests', 'Vendors', 'Expenses'].map((label, index) => (
          <div key={label} className="flex items-center gap-2 px-4 py-2">
            <Skeleton 
              circle 
              width={16} 
              height={16} 
              baseColor="#374151" 
              highlightColor="#4b5563" 
            />
            <Skeleton 
              height={14} 
              width={60} 
              baseColor="#374151" 
              highlightColor="#4b5563" 
            />
            <Skeleton 
              circle 
              width={20} 
              height={20} 
              baseColor="#374151" 
              highlightColor="#4b5563" 
              borderRadius={10} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
