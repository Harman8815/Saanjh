'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { BudgetCategory, Expense } from './types';
import { paymentStatusConfig } from './data';
import { formatCurrency, formatShortCurrency, getCardStyle, getCardHoverStyle, getCardLeaveStyle, getProgressBarStyle } from './utils';

interface CategoryCardProps {
  category: BudgetCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  index: number;
}

export default function CategoryCard({
  category,
  isExpanded,
  onToggle,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  index
}: CategoryCardProps) {
  const spent = category.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paid = category.expenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
  const remaining = category.allocated - spent;
  const progress = (spent / category.allocated) * 100;
  const isOverBudget = spent > category.allocated;

  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="overflow-hidden"
      style={getCardStyle()}
      onMouseEnter={getCardHoverStyle}
      onMouseLeave={getCardLeaveStyle}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: category.color }}
            >
              <Icon size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{category.name}</h3>
              <p className="text-sm text-text-muted">
                {category.expenses.length} expense{category.expenses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`font-semibold ${isOverBudget ? 'text-red-400' : 'text-text-primary'}`}>
                {formatShortCurrency(spent)}
              </p>
              <p className="text-xs text-text-muted">
                of {formatShortCurrency(category.allocated)}
              </p>
            </div>

            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              style={getProgressBarStyle(isOverBudget)}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className={isOverBudget ? 'text-red-400' : 'text-text-secondary'}>
              {Math.round(progress)}% used
            </span>
            <span className={isOverBudget ? 'text-red-400' : 'text-text-muted'}>
              {isOverBudget
                ? `Over by ${formatShortCurrency(spent - category.allocated)}`
                : `${formatShortCurrency(remaining)} left`}
            </span>
          </div>
        </div>

        {isOverBudget && (
          <div className="flex items-center gap-2 mt-3 text-sm text-red-400">
            <AlertCircle size={16} />
            <span>Over budget by {formatCurrency(spent - category.allocated)}</span>
          </div>
        )}
      </div>

      {/* Expanded Expense List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/5"
          >
            <div className="p-5 space-y-3">
              {category.expenses.length > 0 ? (
                category.expenses.map((expense) => {
                  const status = paymentStatusConfig[expense.status];
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={expense.id}
                      className="p-4 rounded-xl bg-surface/30 hover:bg-surface/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-text-primary">
                              {expense.vendorName}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                              <StatusIcon size={12} />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-text-muted">
                            {new Date(expense.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                            {expense.notes && ` • ${expense.notes}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-text-primary">
                              {formatCurrency(expense.amount)}
                            </p>
                            {expense.paidAmount > 0 && (
                              <p className="text-xs text-text-muted">
                                Paid: {formatCurrency(expense.paidAmount)}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => onEditExpense(expense)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteExpense(expense.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <p>No expenses yet</p>
                  <p className="text-sm mt-1">Click "Add Expense" to get started</p>
                </div>
              )}

              <button
                onClick={onAddExpense}
                className="w-full py-3 rounded-xl border border-dashed border-white/20 text-text-secondary hover:text-text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Expense
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
