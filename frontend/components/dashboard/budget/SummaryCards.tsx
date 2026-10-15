'use client';

import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, CheckCircle2, PiggyBank } from 'lucide-react';
import { formatShortCurrency, getCardStyle, getCardHoverStyle, getCardLeaveStyle } from './utils';

interface SummaryCardsProps {
  totalBudget: number;
  totalSpent: number;
  totalPaid: number;
  totalRemaining: number;
  committed?: number;
  outstanding?: number;
}

export default function SummaryCards({
  totalBudget,
  totalSpent,
  totalPaid,
  totalRemaining,
  committed,
  outstanding
}: SummaryCardsProps) {
  const actualCommitted = committed !== undefined ? committed : totalSpent;
  const actualOutstanding = outstanding !== undefined ? outstanding : Math.max(0, actualCommitted - totalPaid);

  const cards = [
    {
      label: 'Total Budget',
      value: totalBudget,
      subtext: 'Overall target allocation',
      icon: IndianRupee,
      iconColor: '#d4a574',
      valueColor: 'text-text-primary'
    },
    {
      label: 'Committed',
      value: actualCommitted,
      subtext: totalBudget > 0 ? (actualCommitted > totalBudget ? 'Exceeds budget!' : `${Math.round((actualCommitted / totalBudget) * 100)}% committed`) : 'No budget set',
      icon: TrendingUp,
      iconColor: '#3b82f6',
      valueColor: actualCommitted > totalBudget ? 'text-red-400' : 'text-text-primary',
      subtextColor: actualCommitted > totalBudget ? 'text-red-400' : 'text-text-muted'
    },
    {
      label: 'Paid Cash',
      value: totalPaid,
      subtext: 'Settled payments',
      icon: CheckCircle2,
      iconColor: '#22c55e',
      valueColor: 'text-text-primary'
    },
    {
      label: 'Outstanding',
      value: actualOutstanding,
      subtext: 'Due to vendors',
      icon: PiggyBank,
      iconColor: actualOutstanding > 0 ? '#f59e0b' : '#22c55e',
      valueColor: actualOutstanding > 0 ? 'text-amber-400' : 'text-text-primary',
      subtextColor: 'text-text-muted'
    },
    {
      label: totalRemaining < 0 ? 'Over Budget' : 'Remaining',
      value: Math.abs(totalRemaining),
      subtext: totalRemaining < 0 ? 'Over budget' : 'Unallocated budget',
      icon: PiggyBank,
      iconColor: totalRemaining < 0 ? '#ef4444' : '#d4a574',
      valueColor: totalRemaining < 0 ? 'text-red-400' : 'text-text-primary',
      subtextColor: totalRemaining < 0 ? 'text-red-400' : 'text-text-muted'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-5"
            style={getCardStyle()}
            onMouseEnter={getCardHoverStyle}
            onMouseLeave={getCardLeaveStyle}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-secondary">{card.label}</span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.iconColor}20` }}
              >
                <Icon size={16} style={{ color: card.iconColor }} />
              </div>
            </div>
            <p className={`text-2xl font-semibold ${card.valueColor}`}>
              {formatShortCurrency(card.value)}
            </p>
            <p className={`text-xs mt-1 ${card.subtextColor || 'text-text-muted'}`}>
              {card.subtext}
            </p>
          </div>
        );
      })}
    </motion.div>
  );
}
