'use client';

import { Loader2 } from 'lucide-react';

// Base loading spinner component
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Full page loading
export function FullPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto text-indigo-600" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="min-w-full divide-y divide-gray-200">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-3 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// List loading skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  loading, 
  className = '', 
  disabled = false,
  ...props 
}: { 
  children: React.ReactNode; 
  loading: boolean; 
  className?: string; 
  disabled?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center px-4 py-2 border border-transparent 
        text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 
        hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

// Form loading overlay
export function FormLoadingOverlay({ loading }: { loading: boolean }) {
  if (!loading) return null;

  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto text-indigo-600" />
        <p className="mt-2 text-gray-600">Processing...</p>
      </div>
    </div>
  );
}

// Data fetching loading state
export function DataLoadingState({ 
  loading, 
  error, 
  children, 
  skeleton 
}: { 
  loading: boolean; 
  error?: Error | null; 
  children: React.ReactNode; 
  skeleton?: React.ReactNode;
}) {
  if (loading) {
    return skeleton || <FullPageLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
            <p className="text-sm text-gray-600">{error.message || 'Something went wrong'}</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Empty state component
export function EmptyState({ 
  title, 
  description, 
  icon, 
  action 
}: { 
  title: string; 
  description?: string; 
  icon?: React.ReactNode; 
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
