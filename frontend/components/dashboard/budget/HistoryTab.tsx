'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, Calendar, X, Edit2, Trash2 } from 'lucide-react';
import { BudgetCategory, Expense, PaymentStatus, SortField, SortOrder, DateRange } from './types';
import { paymentStatusConfig } from './data';
import { formatCurrency, getCardStyle } from './utils';

interface HistoryTabProps {
  categories: BudgetCategory[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  filterStatus: PaymentStatus | 'all';
  onFilterStatusChange: (status: PaymentStatus | 'all') => void;
  sortBy: SortField;
  onSortByChange: (field: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: () => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onEditExpense: (categoryId: string, expense: Expense) => void;
  onDeleteExpense: (categoryId: string, expenseId: string) => void;
}

interface ExpenseWithCategory extends Expense {
  category: string;
  categoryColor: string;
}

export default function HistoryTab({
  categories,
  searchQuery,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  dateRange,
  onDateRangeChange,
  onEditExpense,
  onDeleteExpense
}: HistoryTabProps) {
  // Prepare all expenses
  const allExpenses = useMemo(() => {
    const expenses: ExpenseWithCategory[] = [];
    categories.forEach(cat => {
      cat.expenses.forEach(exp => {
        expenses.push({ ...exp, category: cat.name, categoryColor: cat.color });
      });
    });
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [categories]);

  // Filter and sort
  const filteredExpenses = useMemo(() => {
    let result = [...allExpenses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.vendorName.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
      );
    }

    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      result = result.filter(e => e.status === filterStatus);
    }

    if (dateRange.from) {
      result = result.filter(e => e.date >= dateRange.from);
    }
    if (dateRange.to) {
      result = result.filter(e => e.date <= dateRange.to);
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    return result;
  }, [allExpenses, searchQuery, filterCategory, filterStatus, sortBy, sortOrder, dateRange]);

  const clearFilters = () => {
    onSearchChange('');
    onFilterCategoryChange('all');
    onFilterStatusChange('all');
    onDateRangeChange({ from: '', to: '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Filters Card */}
      <div className="p-5" style={getCardStyle()}>
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2 text-text-secondary">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search vendor or category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary placeholder-text-muted focus:border-primary outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium mb-2 text-text-secondary">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => onFilterCategoryChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:border-primary outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium mb-2 text-text-secondary">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value as PaymentStatus | 'all')}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:border-primary outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Sort */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium mb-2 text-text-secondary">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as SortField)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:border-primary outline-none transition-colors cursor-pointer"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <button
                onClick={onSortOrderChange}
                className="px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-text-secondary hover:text-text-primary transition-colors"
                title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
              >
                <ArrowUpDown size={18} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-text-muted" />
            <span className="text-sm text-text-secondary">Date Range:</span>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 rounded-lg bg-surface border border-white/10 text-text-primary text-sm focus:border-primary outline-none"
            />
            <span className="text-text-muted">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 rounded-lg bg-surface border border-white/10 text-text-primary text-sm focus:border-primary outline-none"
            />
            {(dateRange.from || dateRange.to) && (
              <button
                onClick={() => onDateRangeChange({ from: '', to: '' })}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-text-secondary">
          Showing <span className="text-text-primary font-semibold">{filteredExpenses.length}</span> of{' '}
          <span className="text-text-primary font-semibold">{allExpenses.length}</span> expenses
        </p>
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const config = paymentStatusConfig[expense.status];
                  const StatusIcon = config.icon;
                  const category = categories.find(c => c.name === expense.category);

                  return (
                    <tr key={expense.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {category && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          <span className="text-text-primary">{expense.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-primary">
                        <div>
                          <p className="font-medium">{expense.vendorName}</p>
                          {expense.notes && (
                            <p className="text-sm text-text-muted mt-1">{expense.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <StatusIcon size={14} />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-text-primary">{formatCurrency(expense.amount)}</p>
                        {expense.paidAmount > 0 && expense.paidAmount !== expense.amount && (
                          <p className="text-xs text-green-400 mt-1">
                            Paid: {formatCurrency(expense.paidAmount)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              const cat = categories.find(c => c.name === expense.category);
                              if (cat) onEditExpense(cat.id, expense);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const cat = categories.find(c => c.name === expense.category);
                              if (cat) onDeleteExpense(cat.id, expense.id);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <Filter size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No expenses match your filters</p>
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
