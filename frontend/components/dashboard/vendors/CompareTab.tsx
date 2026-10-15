'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, DollarSign, FileCheck, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { VendorService } from '../../../services/vendors';
import { Vendor, VendorComparisonItem } from '../../../types/api';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';

interface CompareTabProps {
  initialVendorId?: number | string;
}

export default function CompareTab({ initialVendorId }: CompareTabProps) {
  const numericInitialId = initialVendorId ? (typeof initialVendorId === 'number' ? initialVendorId : parseInt(initialVendorId, 10)) : null;
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(numericInitialId && !isNaN(numericInitialId) ? [numericInitialId] : []);
  const [comparedVendors, setComparedVendors] = useState<VendorComparisonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatCurrency } = useFormatCurrency();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await VendorService.getAllVendors();
        setAllVendors(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching vendors for comparison picker:', err);
      }
    };
    fetchList();
  }, []);

  const runComparison = async (ids: number[]) => {
    if (ids.length === 0) {
      setComparedVendors([]);
      return;
    }
    try {
      setLoading(true);
      const res = await VendorService.compareVendors(ids);
      setComparedVendors(res.vendors || []);
    } catch (err) {
      console.error('Error running vendor comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIds.length > 0) {
      runComparison(selectedIds);
    }
  }, [selectedIds]);

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 3) {
        return; // max 3
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary">Side-by-Side Vendor Comparison</h3>
          <p className="text-sm text-text-muted">Compare up to 3 vendors on cost estimates, contracts, quotes, and milestone status</p>
        </div>
        <button
          onClick={() => runComparison(selectedIds)}
          disabled={loading || selectedIds.length === 0}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Vendor Selector Pill Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Select Vendors to Compare ({selectedIds.length}/3 selected):
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {allVendors.map((v) => {
            const isSelected = selectedIds.includes(v.id);
            const name = v.vendor_catalog?.name || `Vendor #${v.id}`;
            const category = v.vendor_catalog?.category?.name;
            return (
              <button
                key={v.id}
                onClick={() => toggleSelect(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/40 shadow-sm'
                    : 'bg-white/5 text-text-muted border-white/5 hover:border-white/20'
                }`}
              >
                {isSelected && <Check size={12} />}
                <span>{name}</span>
                {category && <span className="opacity-60">({category})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {loading ? (
        <div className="glass-card p-12 rounded-3xl text-center text-text-muted">
          Loading comparison data...
        </div>
      ) : comparedVendors.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-text-muted space-y-2">
          <Layers className="mx-auto text-text-muted/40" size={40} />
          <p className="text-sm">Select at least one vendor from above to view side-by-side details.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full glass-card rounded-3xl overflow-hidden border border-white/10 text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-xs font-bold text-text-muted uppercase w-48">Feature</th>
                {comparedVendors.map((v) => (
                  <th key={v.id} className="p-4 text-text-primary font-bold min-w-[240px]">
                    <div className="text-base">{v.name}</div>
                    <div className="text-xs font-normal text-text-muted">{v.category}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Status & Rating */}
              <tr>
                <td className="p-4 text-xs font-semibold text-text-muted">Status & Rating</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                        {v.status || 'Active'}
                      </span>
                      {v.rating ? (
                        <div className="flex items-center gap-1 text-gold text-xs">
                          <Star size={14} className="fill-current" />
                          <span>{v.rating}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">No rating</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Estimated vs Actual Cost */}
              <tr>
                <td className="p-4 text-xs font-semibold text-text-muted">Cost Overview</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="p-4 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Estimate:</span>
                      <span className="font-semibold text-text-primary">
                        {v.cost_estimate != null ? formatCurrency(v.cost_estimate) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Actual:</span>
                      <span className="font-semibold text-primary">
                        {v.actual_cost != null ? formatCurrency(v.actual_cost) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Variance:</span>
                      <span className={`font-semibold ${v.cost_variance && v.cost_variance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {v.cost_variance != null ? formatCurrency(v.cost_variance) : '—'}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Quotes */}
              <tr>
                <td className="p-4 text-xs font-semibold text-text-muted">Quotes & Proposals</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="p-4 space-y-1">
                    <div className="text-xs text-text-primary">
                      {v.quotes.total_count} quote(s) logged
                    </div>
                    {v.quotes.has_accepted ? (
                      <div className="text-xs text-emerald-400 font-medium">
                        Accepted: {formatCurrency(v.quotes.accepted_amount || 0)}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-400">
                        Latest: {v.quotes.latest_status || 'None'}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Contract & Deposit */}
              <tr>
                <td className="p-4 text-xs font-semibold text-text-muted">Contract & Deposit</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="p-4 space-y-1 text-xs">
                    {v.contract ? (
                      <>
                        <div className="text-text-primary">
                          {v.contract.signed_date ? `Signed: ${new Date(v.contract.signed_date).toLocaleDateString()}` : 'Unsigned Draft'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted">Deposit:</span>
                          <span className="font-semibold">{formatCurrency(v.contract.deposit_amount)}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${v.contract.deposit_paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {v.contract.deposit_paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-text-muted">No contract recorded</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Milestones */}
              <tr>
                <td className="p-4 text-xs font-semibold text-text-muted">Payment Milestones</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="p-4 space-y-1 text-xs">
                    <div className="text-text-primary">
                      {v.milestones.paid_count} / {v.milestones.total_count} paid
                    </div>
                    <div className="text-text-muted">
                      Paid: <span className="text-emerald-400 font-semibold">{formatCurrency(v.milestones.paid_amount)}</span> / {formatCurrency(v.milestones.total_amount)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Total Expenses Logged */}
              <tr>
                <td className="p-4 text-xs font-semibold text-text-muted">Linked Expenses</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="p-4 space-y-1 text-xs">
                    <div className="text-text-primary font-bold">
                      {formatCurrency(v.expenses.total)}
                    </div>
                    <div className="text-text-muted">
                      Cash Paid: {formatCurrency(v.expenses.paid)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Follow-up Date */}
              <tr>
                <td className="p-4 text-xs font-semibold text-text-muted">Follow-up Due</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="p-4 text-xs">
                    {v.follow_up_date ? (
                      <span className="text-amber-400 font-medium">
                        {new Date(v.follow_up_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-text-muted">None scheduled</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
