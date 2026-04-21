'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'button' | 'image' | 'list';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  type = 'text', 
  count = 1, 
  className = '' 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`glass-card p-6 ${className}`}>
            <div className="animate-pulse">
              <div className="h-48 bg-surface rounded-lg mb-4"></div>
              <div className="h-4 bg-surface rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-surface rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-surface rounded w-full mb-2"></div>
              <div className="h-3 bg-surface rounded w-5/6"></div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`space-y-3 ${className}`}>
            <div className="animate-pulse">
              <div className="h-4 bg-surface rounded w-3/4"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-surface rounded w-1/2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-surface rounded w-5/6"></div>
            </div>
          </div>
        );
      
      case 'button':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-10 bg-surface rounded-lg w-24"></div>
          </div>
        );
      
      case 'image':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-48 bg-surface rounded-lg"></div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-12 w-12 bg-surface rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface rounded w-3/4"></div>
                  <div className="h-3 bg-surface rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-surface rounded w-3/4"></div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {[...Array(count)].map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </motion.div>
  );
}
