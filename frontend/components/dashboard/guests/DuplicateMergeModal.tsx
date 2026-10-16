'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DuplicateCluster, Guest } from '../../../types/api';
import { GuestService } from '../../../services/guests';

interface DuplicateMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMerged: () => void;
}

export default function DuplicateMergeModal({
  isOpen,
  onClose,
  onMerged,
}: DuplicateMergeModalProps) {
  const [clusters, setClusters] = useState<DuplicateCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDuplicates();
    }
  }, [isOpen]);

  const fetchDuplicates = async () => {
    try {
      setIsLoading(true);
      const res = await GuestService.getDuplicates();
      setClusters(res.clusters || []);
    } catch (err: any) {
      console.error('Error fetching duplicate clusters:', err);
      toast.error('Failed to analyze duplicates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMergeCluster = async (cluster: DuplicateCluster) => {
    try {
      setIsMerging(true);
      // Delete the non-primary guests in the cluster
      const nonPrimary = cluster.guests.filter((g) => g.id !== cluster.suggested_primary);
      for (const guest of nonPrimary) {
        await GuestService.deleteGuest(guest.id);
      }
      toast.success('Duplicate guests resolved successfully');
      setClusters((prev) => prev.filter((c) => c.cluster_id !== cluster.cluster_id));
      onMerged();
    } catch (err: any) {
      console.error('Error resolving duplicates:', err);
      toast.error('Failed to merge duplicate cluster');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDismissCluster = (clusterId: number) => {
    setClusters((prev) => prev.filter((c) => c.cluster_id !== clusterId));
    toast('Cluster dismissed for this session', { icon: 'ℹ️' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Duplicate Detection & Resolution
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Identifies potential duplicate guests based on normalized email, phone, and name matching.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary-500" />
              <span className="text-sm">Scanning for duplicate guest profiles...</span>
            </div>
          ) : clusters.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-2">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">All Clean!</h3>
              <p className="text-xs text-neutral-400">
                No duplicate guests detected in your guest list.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Found <strong>{clusters.length}</strong> possible duplicate cluster(s)</span>
              </div>

              {clusters.map((cluster) => {
                const primary = cluster.guests.find((g) => g.id === cluster.suggested_primary) || cluster.guests[0];
                const duplicates = cluster.guests.filter((g) => g.id !== primary.id);
                const scorePercent = Math.round(cluster.match_score * 100);

                return (
                  <div
                    key={cluster.cluster_id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {scorePercent}% Match
                        </span>
                        <span className="text-xs text-neutral-500">{cluster.reason}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDismissCluster(cluster.cluster_id)}
                          className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        >
                          Ignore
                        </button>
                        <button
                          type="button"
                          disabled={isMerging}
                          onClick={() => handleMergeCluster(cluster)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Keep Primary & Merge
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Primary Guest */}
                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-emerald-500/30">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">
                          Primary (To Keep)
                        </span>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {primary.full_name || `${primary.first_name} ${primary.last_name}`}
                        </p>
                        <p className="text-neutral-500">{primary.email || 'No email'}</p>
                        <p className="text-neutral-500">{primary.phone || 'No phone'}</p>
                      </div>

                      {/* Duplicate Guest(s) */}
                      {duplicates.map((dup) => (
                        <div
                          key={dup.id}
                          className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-rose-500/20"
                        >
                          <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">
                            Duplicate (To Remove)
                          </span>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {dup.full_name || `${dup.first_name} ${dup.last_name}`}
                          </p>
                          <p className="text-neutral-500">{dup.email || 'No email'}</p>
                          <p className="text-neutral-500">{dup.phone || 'No phone'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
