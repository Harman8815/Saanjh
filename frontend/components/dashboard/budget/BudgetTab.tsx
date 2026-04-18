'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { BudgetCategory, Expense } from './types';
import SummaryCards from './SummaryCards';
import CategoryCard from './CategoryCard';
import { formatCurrency, getCardStyle, getCardHoverStyle, getCardLeaveStyle, getMainProgressStyle } from './utils';

interface BudgetTabProps {
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  totalPaid: number;
  totalRemaining: number;
  budgetProgress: number;
  expandedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onAddExpense: (categoryId: string) => void;
  onEditExpense: (categoryId: string, expense: Expense) => void;
  onDeleteExpense: (categoryId: string, expenseId: string) => void;
}

export default function BudgetTab({
  categories,
  totalBudget,
  totalSpent,
  totalPaid,
  totalRemaining,
  budgetProgress,
  expandedCategories,
  onToggleCategory,
  onAddExpense,
  onEditExpense,
  onDeleteExpense
}: BudgetTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <SummaryCards
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        totalPaid={totalPaid}
        totalRemaining={totalRemaining}
      />

      {/* Main Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="p-5"
        style={getCardStyle()}
        onMouseEnter={getCardHoverStyle}
        onMouseLeave={getCardLeaveStyle}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-text-secondary">Budget Utilization</span>
          <span className={`text-sm font-semibold ${budgetProgress > 100 ? 'text-red-400' : 'text-primary'}`}>
            {Math.round(budgetProgress)}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden bg-surface">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budgetProgress, 100)}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={getMainProgressStyle(budgetProgress > 100)}
          />
        </div>
        {budgetProgress > 100 && (
          <div className="flex items-center gap-2 mt-3 text-sm text-red-400">
            <AlertCircle size={16} />
            <span>You&apos;ve exceeded your total budget by {formatCurrency(totalSpent - totalBudget)}</span>
          </div>
        )}
      </motion.div>

      {/* Category Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold mb-4 text-text-primary">Expense Categories</h2>

        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            isExpanded={expandedCategories.includes(category.id)}
            onToggle={() => onToggleCategory(category.id)}
            onAddExpense={() => onAddExpense(category.id)}
            onEditExpense={(expense) => onEditExpense(category.id, expense)}
            onDeleteExpense={(expenseId) => onDeleteExpense(category.id, expenseId)}
            index={index}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
