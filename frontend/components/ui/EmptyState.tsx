'use client';

import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Dark-theme empty state for lists, tabs, and search results.
 *
 * The previous component in components/ui/loading-states.tsx used light-theme
 * classes (bg-gray-100, text-gray-900) that clash with the strict dark theme;
 * this is the theme-correct replacement going forward.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-text-secondary">
        {icon ?? <Inbox className="h-7 w-7" aria-hidden />}
      </div>
      <h3 className="heading-data text-data-lg text-text-primary">{title}</h3>
      {description && (
        <p className="body-data mt-2 max-w-sm text-data-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
