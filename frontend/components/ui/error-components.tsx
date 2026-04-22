'use client';

import { AlertTriangle } from 'lucide-react';

// Error boundary fallback component
export function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            onClick={resetError}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

// Error display component for API errors
export function ErrorDisplay({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message || 'An unexpected error occurred.'}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
