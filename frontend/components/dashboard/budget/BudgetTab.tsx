'use client';

import { motion } from 'framer-motion';
import { AlertCircle, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
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
  const chartData = categories.map((cat) => {
    const committed = cat.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const paid = cat.expenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
    return {
      name: cat.name,
      Allocated: cat.allocated,
      Committed: committed,
      Paid: paid,
    };
  });

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
        committed={totalSpent}
        outstanding={Math.max(0, totalSpent - totalPaid)}
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

      {/* Budget vs Actual Chart per Category */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="p-5"
          style={getCardStyle()}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Budget vs. Actual by Category</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Allocated" fill="#71717a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Committed" fill="#d4a574" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Paid" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Category Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold mb-4 text-text-primary">Expense Categories</h2>

        {!categories || categories.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="text-lg mb-2">No budget categories found</p>
            <p className="text-sm">Create your first budget category to start tracking expenses</p>
          </div>
        ) : (
          categories.map((category, index) => (
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
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
