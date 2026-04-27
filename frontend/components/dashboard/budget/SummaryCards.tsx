'use client';

import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, CheckCircle2, PiggyBank } from 'lucide-react';
import { formatShortCurrency, getCardStyle, getCardHoverStyle, getCardLeaveStyle } from './utils';

interface SummaryCardsProps {
  totalBudget: number;
  totalSpent: number;
  totalPaid: number;
  totalRemaining: number;
}

export default function SummaryCards({
  totalBudget,
  totalSpent,
  totalPaid,
  totalRemaining
}: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Budget',
      value: totalBudget,
      subtext: 'Overall allocation',
      icon: IndianRupee,
      iconColor: '#d4a574',
      valueColor: 'text-text-primary'
    },
    {
      label: 'Total Spent',
      value: totalSpent,
      subtext: totalBudget > 0 ? (totalSpent > totalBudget ? 'Over budget!' : `${Math.round((totalSpent / totalBudget) * 100)}% used`) : 'No budget set',
      icon: TrendingUp,
      iconColor: '#d4a574',
      valueColor: totalSpent > totalBudget ? 'text-red-400' : 'text-text-primary',
      subtextColor: totalSpent > totalBudget ? 'text-red-400' : 'text-text-muted'
    },
    {
      label: 'Paid So Far',
      value: totalPaid,
      subtext: 'Completed payments',
      icon: CheckCircle2,
      iconColor: '#22c55e',
      valueColor: 'text-text-primary'
    },
    {
      label: totalRemaining < 0 ? 'Over Budget' : 'Remaining',
      value: Math.abs(totalRemaining),
      subtext: totalRemaining < 0 ? 'Over budget' : 'Left to spend',
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
      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
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
