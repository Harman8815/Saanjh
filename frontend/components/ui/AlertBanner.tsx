'use client';

import Link from 'next/link';
import { AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { AlertSeverity, WeddingAlert } from '../../types/api';

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { container: string; icon: string; Icon: typeof Info }
> = {
  critical: {
    container: 'bg-red-500/10 border-red-500/30',
    icon: 'text-red-400',
    Icon: AlertOctagon,
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/30',
    icon: 'text-amber-400',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-violet-500/10 border-violet-500/30',
    icon: 'text-violet-400',
    Icon: Info,
  },
};

export interface AlertBannerProps {
  alerts: WeddingAlert[];
  /** Called after an alert is dismissed locally. */
  onDismiss?: (alertId: string) => void;
  /** Hide the banner when there is nothing to say. Default true. */
  hideWhenEmpty?: boolean;
  className?: string;
}

/**
 * Server-computed alert list for the dashboard and module pages.
 *
 * Alerts are produced once in utils/wedding_insights.py so every surface shows
 * identical rules. Dismissal is local state only — the server recomputes the
 * list on the next fetch.
 */
export function AlertBanner({
  alerts,
  onDismiss,
  hideWhenEmpty = true,
  className = '',
}: AlertBannerProps) {
  if (hideWhenEmpty && alerts.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`} role="region" aria-label="Wedding alerts">
      <AnimatePresence initial={false}>
        {alerts.map((alert) => {
          const styles = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info;
          const { Icon } = styles;

          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 rounded-xl border p-4 ${styles.container}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <h4 className="heading-data text-data-sm text-text-primary">
                  {alert.title}
                </h4>
                <p className="body-data mt-1 text-data-sm text-text-secondary">
                  {alert.message}
                </p>
                {alert.action_label && alert.action_url && (
                  <Link
                    href={alert.action_url}
                    className="mt-2 inline-block text-data-sm font-semibold text-primary hover:underline"
                  >
                    {alert.action_label} &rarr;
                  </Link>
                )}
              </div>
              {onDismiss && (
                <button
                  type="button"
                  onClick={() => onDismiss(alert.id)}
                  className="rounded-full p-1 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
                  aria-label={`Dismiss ${alert.title}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default AlertBanner;
