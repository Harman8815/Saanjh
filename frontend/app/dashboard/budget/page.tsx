'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

import {
  TabNavigation,
  BudgetTab,
  DemographicsTab,
  HistoryTab,
  ExpenseModal,
  TabType,
  PaymentStatus,
  Expense,
  BudgetCategory,
  initialCategories,
  totalBudget,
  formatCurrency,
  formatShortCurrency
} from '../../../components/dashboard/budget';

export default function BudgetTrackerPage() {
  // State
  const [categories, setCategories] = useState<BudgetCategory[]>(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTotalBudget, setCurrentTotalBudget] = useState(totalBudget);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('budget');

  // History tab filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  // Computed values
  const { totalSpent, totalPaid, totalRemaining, budgetProgress } = useMemo(() => {
    const spent = categories.reduce((acc, cat) => acc + cat.expenses.reduce((sum, exp) => sum + exp.amount, 0), 0);
    const paid = categories.reduce((acc, cat) => acc + cat.expenses.reduce((sum, exp) => sum + exp.paidAmount, 0), 0);
    return {
      totalSpent: spent,
      totalPaid: paid,
      totalRemaining: currentTotalBudget - spent,
      budgetProgress: (spent / currentTotalBudget) * 100
    };
  }, [categories, currentTotalBudget]);

  // Handlers
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const openAddModal = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (categoryId: string, expense: Expense) => {
    setSelectedCategory(categoryId);
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  const saveExpense = (expenseData: Omit<Expense, 'id'> & { id?: string }) => {
    const newExpense: Expense = {
      id: expenseData.id || Date.now().toString(),
      vendorName: expenseData.vendorName,
      amount: expenseData.amount,
      paidAmount: expenseData.paidAmount,
      status: expenseData.status,
      date: expenseData.date,
      notes: expenseData.notes
    };

    setCategories(prev => prev.map(cat => {
      if (cat.id !== selectedCategory) return cat;
      
      if (expenseData.id) {
        return {
          ...cat,
          expenses: cat.expenses.map(exp => exp.id === expenseData.id ? newExpense : exp)
        };
      }
      return { ...cat, expenses: [...cat.expenses, newExpense] };
    }));

    setIsAddModalOpen(false);
  };

  const deleteExpense = (categoryId: string, expenseId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, expenses: cat.expenses.filter(exp => exp.id !== expenseId) }
        : cat
    ));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Get category for modal
  const selectedCategoryData = categories.find(c => c.id === selectedCategory) || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d4a574, #c9a97e)' }}>
              <Wallet className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
                Wedding Budget
              </h1>
              <p className="text-sm text-text-muted">Plan, track, and manage your expenses</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'budget' && (
          <BudgetTab
            categories={categories}
            totalBudget={currentTotalBudget}
            totalSpent={totalSpent}
            totalPaid={totalPaid}
            totalRemaining={totalRemaining}
            budgetProgress={budgetProgress}
            expandedCategories={expandedCategories}
            onToggleCategory={toggleCategory}
            onAddExpense={openAddModal}
            onEditExpense={openEditModal}
            onDeleteExpense={deleteExpense}
          />
        )}

        {activeTab === 'demographics' && (
          <DemographicsTab categories={categories} />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            categories={categories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={toggleSortOrder}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onEditExpense={openEditModal}
            onDeleteExpense={deleteExpense}
          />
        )}
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={saveExpense}
        editingExpense={editingExpense}
        category={selectedCategoryData}
      />
    </div>
  );
}
