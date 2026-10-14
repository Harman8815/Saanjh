'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  CalendarClock
} from 'lucide-react';
import { BudgetCategory, Expense } from './types';
import { formatCurrency, getCardStyle, getCardHoverStyle, getCardLeaveStyle } from './utils';

interface ProjectionTabProps {
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  totalPaid: number;
}

export default function ProjectionTab({
  categories,
  totalBudget,
  totalSpent,
  totalPaid,
}: ProjectionTabProps) {
  // Aggregate all expenses across categories
  const allExpenses = useMemo(() => {
    return categories.flatMap((c) =>
      c.expenses.map((e) => ({
        ...e,
        categoryName: c.name,
      }))
    );
  }, [categories]);

  // Projected final cost calculation
  const projectedFinalCost = useMemo(() => {
    // Committed expenses + any category minimum allocations
    return Math.max(totalSpent, totalBudget > 0 ? totalSpent : 0);
  }, [totalSpent, totalBudget]);

  const overallVariance = totalBudget - projectedFinalCost;
  const isOverBudget = overallVariance < 0;

  // Category variance breakdown
  const categoryVariances = useMemo(() => {
    return categories.map((cat) => {
      const committed = cat.expenses.reduce((sum, e) => sum + e.amount, 0);
      const paid = cat.expenses.reduce((sum, e) => sum + e.paidAmount, 0);
      const variance = cat.allocated - committed;
      const variancePct = cat.allocated > 0 ? Math.round((variance / cat.allocated) * 100) : 0;
      const isCategoryOver = committed > cat.allocated;
      const isNearLimit = cat.allocated > 0 && committed / cat.allocated >= 0.9;

      return {
        id: cat.id,
        name: cat.name,
        allocated: cat.allocated,
        committed,
        paid,
        variance,
        variancePct,
        isCategoryOver,
        isNearLimit,
      };
    });
  }, [categories]);

  // Payment schedule timeline (30 / 60 / 90 days)
  const scheduleTimeline = useMemo(() => {
    const now = new Date();
    const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const day60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const bucket30: typeof allExpenses = [];
    const bucket60: typeof allExpenses = [];
    const bucket90: typeof allExpenses = [];
    const overdue: typeof allExpenses = [];
    const later: typeof allExpenses = [];

    allExpenses.forEach((exp) => {
      if (exp.status === 'paid') return;
      const remainingDue = exp.amount - exp.paidAmount;
      if (remainingDue <= 0) return;

      const dueDate = exp.date ? new Date(exp.date) : null;
      if (!dueDate || isNaN(dueDate.getTime())) {
        bucket30.push(exp);
        return;
      }

      if (dueDate < now) {
        overdue.push(exp);
      } else if (dueDate <= day30) {
        bucket30.push(exp);
      } else if (dueDate <= day60) {
        bucket60.push(exp);
      } else if (dueDate <= day90) {
        bucket90.push(exp);
      } else {
        later.push(exp);
      }
    });

    const sumDue = (items: typeof allExpenses) =>
      items.reduce((sum, item) => sum + (item.amount - item.paidAmount), 0);

    return {
      overdue: { items: overdue, total: sumDue(overdue) },
      bucket30: { items: bucket30, total: sumDue(bucket30) },
      bucket60: { items: bucket60, total: sumDue(bucket60) },
      bucket90: { items: bucket90, total: sumDue(bucket90) },
      later: { items: later, total: sumDue(later) },
    };
  }, [allExpenses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Projection Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projected Final Cost */}
        <div
          className="p-5"
          style={getCardStyle()}
          onMouseEnter={getCardHoverStyle}
          onMouseLeave={getCardLeaveStyle}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Projected Final Cost
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(projectedFinalCost)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Committed expenses + estimated vendor contracts
          </p>
        </div>

        {/* Projected Variance */}
        <div
          className="p-5"
          style={getCardStyle()}
          onMouseEnter={getCardHoverStyle}
          onMouseLeave={getCardLeaveStyle}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Projected Variance
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isOverBudget ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {isOverBudget ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
            </div>
          </div>
          <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
            {formatCurrency(Math.abs(overallVariance))}
          </p>
          <p className={`text-xs mt-1 ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOverBudget ? 'Projected over budget' : 'Projected budget buffer remaining'}
          </p>
        </div>

        {/* Budget Health Status */}
        <div
          className="p-5"
          style={getCardStyle()}
          onMouseEnter={getCardHoverStyle}
          onMouseLeave={getCardLeaveStyle}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Budget Health
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {isOverBudget ? 'Attention Needed' : 'Healthy Control'}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {isOverBudget ? 'Expenses have exceeded allocated funds' : 'Spending is within planned tolerances'}
          </p>
        </div>
      </div>

      {/* Category Variance Analysis Table */}
      <div className="p-5" style={getCardStyle()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-text-primary">Category Variance & Projections</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Comparison between allocated budget and actual commitments with threshold warnings.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-text-secondary uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Allocated</th>
                <th className="p-3 text-right">Committed</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Variance</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categoryVariances.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-semibold text-text-primary">{cat.name}</td>
                  <td className="p-3 text-right text-text-secondary">{formatCurrency(cat.allocated)}</td>
                  <td className="p-3 text-right font-medium text-text-primary">{formatCurrency(cat.committed)}</td>
                  <td className="p-3 text-right text-emerald-400">{formatCurrency(cat.paid)}</td>
                  <td
                    className={`p-3 text-right font-bold ${
                      cat.variance < 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {cat.variance < 0 ? `- ${formatCurrency(Math.abs(cat.variance))}` : `+ ${formatCurrency(cat.variance)}`}
                  </td>
                  <td className="p-3 text-center">
                    {cat.isCategoryOver ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        <AlertTriangle className="w-3 h-3" /> Over Budget
                      </span>
                    ) : cat.isNearLimit ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        &gt; 90% Allocated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> On Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30 / 60 / 90 Day Payment Timeline */}
      <div className="p-5" style={getCardStyle()}>
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-base font-bold text-text-primary">Payment Schedule Timeline</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Projected cash outflow due over the next 30, 60, and 90 days.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overdue */}
          {scheduleTimeline.overdue.items.length > 0 && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-400 uppercase">Overdue</span>
                <Clock className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-xl font-bold text-red-400">
                {formatCurrency(scheduleTimeline.overdue.total)}
              </p>
              <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                {scheduleTimeline.overdue.items.map((exp) => (
                  <div key={exp.id} className="text-xs text-text-secondary flex justify-between">
                    <span className="truncate max-w-[120px]">{exp.vendorName}</span>
                    <span className="font-medium text-red-400">{formatCurrency(exp.amount - exp.paidAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next 30 Days */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-primary uppercase">Next 30 Days</span>
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(scheduleTimeline.bucket30.total)}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {scheduleTimeline.bucket30.items.length} payment(s) due
            </p>
            <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
              {scheduleTimeline.bucket30.items.slice(0, 4).map((exp) => (
                <div key={exp.id} className="text-xs text-text-secondary flex justify-between">
                  <span className="truncate max-w-[120px]">{exp.vendorName}</span>
                  <span className="font-medium text-text-primary">{formatCurrency(exp.amount - exp.paidAmount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 31 - 60 Days */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-primary uppercase">31 - 60 Days</span>
              <Calendar className="w-4 h-4 text-text-secondary" />
            </div>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(scheduleTimeline.bucket60.total)}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {scheduleTimeline.bucket60.items.length} payment(s) due
            </p>
            <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
              {scheduleTimeline.bucket60.items.slice(0, 4).map((exp) => (
                <div key={exp.id} className="text-xs text-text-secondary flex justify-between">
                  <span className="truncate max-w-[120px]">{exp.vendorName}</span>
                  <span className="font-medium text-text-primary">{formatCurrency(exp.amount - exp.paidAmount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 61 - 90 Days */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-primary uppercase">61 - 90 Days</span>
              <Calendar className="w-4 h-4 text-text-secondary" />
            </div>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(scheduleTimeline.bucket90.total)}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {scheduleTimeline.bucket90.items.length} payment(s) due
            </p>
            <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
              {scheduleTimeline.bucket90.items.slice(0, 4).map((exp) => (
                <div key={exp.id} className="text-xs text-text-secondary flex justify-between">
                  <span className="truncate max-w-[120px]">{exp.vendorName}</span>
                  <span className="font-medium text-text-primary">{formatCurrency(exp.amount - exp.paidAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
