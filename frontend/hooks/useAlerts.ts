'use client';

import useSWR from 'swr';

import { WeddingService } from '../services/weddings';
import { Readiness, WeddingAlert, WeddingDashboard, WeddingMetrics } from '../types/api';

/**
 * SWR hook over the dashboard payload — the one place alerts, readiness, and
 * metrics are computed server-side (utils/wedding_insights.py).
 *
 * Reads use SWR (like the other read hooks); no mutations live here. The
 * legacy guest/vendor/expense stat blocks stay on the same payload, so a
 * single fetch feeds the metric cards, the alert banner, and the sidebar.
 */
export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR<WeddingDashboard>(
    'wedding-dashboard',
    () => WeddingService.getDashboard(),
    {
      revalidateOnFocus: false,
      // Alerts are derived from data that changes slowly (RSVPs, payments),
      // so a short dedupe window is enough.
      dedupingInterval: 60000,
    }
  );

  return {
    dashboard: data,
    alerts: data?.alerts ?? [],
    readiness: data?.readiness ?? null,
    metrics: data?.metrics ?? null,
    isLoading,
    error,
    refresh: mutate,
  };
}

export type { Readiness, WeddingAlert, WeddingMetrics };

export default useAlerts;
