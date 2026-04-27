'use client';

import { useState, useEffect, useMemo } from 'react';
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
  BudgetCategory as LocalBudgetCategory,
  formatCurrency,
  formatShortCurrency
} from '../../../components/dashboard/budget';
import { ExpenseService } from '../../../services/expenses';
import { BudgetCategory as ApiBudgetCategory } from '../../../types/api';

export default function BudgetTrackerPage() {
  // State
  const [categories, setCategories] = useState<LocalBudgetCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTotalBudget, setCurrentTotalBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform API BudgetCategory to local BudgetCategory format
  const transformApiToLocal = (apiCategory: ApiBudgetCategory, categoryExpenses: any[]): LocalBudgetCategory => {
    return {
      id: apiCategory.id.toString(),
      name: apiCategory.name,
      icon: Wallet, // Default icon, could be customized based on category
      allocated: apiCategory.allocated_amount || 0,
      expenses: categoryExpenses.map(exp => ({
        id: exp.id.toString(),
        vendorName: exp.title || 'Unknown',
        amount: exp.amount,
        paidAmount: exp.paid_amount || 0,
        status: exp.status?.name === 'paid' ? 'paid' : exp.status?.name === 'partial' ? 'partial' : 'pending',
        date: exp.expense_date || exp.date,
        notes: exp.notes
      })),
      color: '#8B5CF6' // Default color
    };
  };

  // Refresh function to reload data
  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [budgetCategories, expensesData] = await Promise.all([
        ExpenseService.getBudgetCategories(),
        ExpenseService.getExpenses(1, 100)
      ]);

      // Ensure we have valid data
      if (!budgetCategories || !Array.isArray(budgetCategories)) {
        throw new Error('Invalid budget categories data received');
      }

      const expensesArray = Array.isArray(expensesData) ? expensesData : (expensesData.results || []);

      // Group expenses by category
      const expensesByCategory: Record<number, any[]> = {};
      expensesArray.forEach(exp => {
        if (exp && exp.budget_category) {
          const categoryId = exp.budget_category.id;
          if (!expensesByCategory[categoryId]) {
            expensesByCategory[categoryId] = [];
          }
          expensesByCategory[categoryId].push(exp);
        }
      });

      // Transform categories with their expenses
      const localCategories = budgetCategories.map(cat =>
        transformApiToLocal(cat, expensesByCategory[cat.id] || [])
      );
      
      // Calculate total budget from API data
      const totalBudget = budgetCategories.reduce((sum, cat) => sum + (cat.allocated_amount || 0), 0);
      
      setCategories(localCategories);
      setCurrentTotalBudget(totalBudget);
    } catch (err: any) {
      console.error('Error refreshing budget data:', err);
      setError(err.message || 'Failed to refresh budget data');
      setCategories([]);
      setCurrentTotalBudget(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch budget categories and expenses from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [budgetCategories, expensesData] = await Promise.all([
          ExpenseService.getBudgetCategories(),
          ExpenseService.getExpenses(1, 100)
        ]);

        // Ensure we have valid data
        if (!budgetCategories || !Array.isArray(budgetCategories)) {
          throw new Error('Invalid budget categories data received');
        }

        const expensesArray = Array.isArray(expensesData) ? expensesData : (expensesData.results || []);

        // Group expenses by category
        const expensesByCategory: Record<number, any[]> = {};
        expensesArray.forEach(exp => {
          if (exp && exp.budget_category) {
            const categoryId = exp.budget_category.id;
            if (!expensesByCategory[categoryId]) {
              expensesByCategory[categoryId] = [];
            }
            expensesByCategory[categoryId].push(exp);
          }
        });

        // Transform categories with their expenses
        const localCategories = budgetCategories.map(cat =>
          transformApiToLocal(cat, expensesByCategory[cat.id] || [])
        );
        
        // Calculate total budget from API data
        const totalBudget = budgetCategories.reduce((sum, cat) => sum + (cat.allocated_amount || 0), 0);
        
        setCategories(localCategories);
        setCurrentTotalBudget(totalBudget);
      } catch (err: any) {
        console.error('Error fetching budget data:', err);
        setError(err.message || 'Failed to load budget data');
        setCategories([]); // Set empty array to prevent forEach errors
        setCurrentTotalBudget(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    const spent = categories.reduce((acc, cat) => 
      acc + cat.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0), 0
    );
    const paid = categories.reduce((acc, cat) => 
      acc + cat.expenses.reduce((sum, exp) => sum + (exp.paidAmount || 0), 0), 0
    );
    return {
      totalSpent: spent,
      totalPaid: paid,
      totalRemaining: currentTotalBudget - spent,
      budgetProgress: currentTotalBudget > 0 ? (spent / currentTotalBudget) * 100 : 0
    };
  }, [categories, currentTotalBudget]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted">Loading budget data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={refreshData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

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

  const saveExpense = async (expenseData: Omit<Expense, 'id'> & { id?: string }) => {
    try {
      const selectedCat = categories.find(c => c.id === selectedCategory);
      if (!selectedCat) {
        throw new Error('Selected category not found');
      }

      let savedExpense;
      
      if (expenseData.id) {
        // Update existing expense
        const apiExpenseData = {
          title: expenseData.vendorName,
          amount: expenseData.amount,
          paid_amount: expenseData.paidAmount,
          expense_date: expenseData.date,
          notes: expenseData.notes
        };
        
        savedExpense = await ExpenseService.updateExpense(parseInt(expenseData.id), apiExpenseData);
      } else {
        // Create new expense
        const apiExpenseData = {
          title: expenseData.vendorName,
          amount: expenseData.amount,
          expense_date: expenseData.date,
          notes: expenseData.notes,
          budget_category_id: parseInt(selectedCat.id)
        };
        
        savedExpense = await ExpenseService.createExpense(apiExpenseData);
      }

      // Refresh data to get updated state
      const [budgetCategories, expensesData] = await Promise.all([
        ExpenseService.getBudgetCategories(),
        ExpenseService.getExpenses(1, 100)
      ]);

      // Process the updated data
      const expensesArray = Array.isArray(expensesData) ? expensesData : (expensesData.results || []);
      const expensesByCategory: Record<number, any[]> = {};
      expensesArray.forEach(exp => {
        if (exp && exp.budget_category) {
          const categoryId = exp.budget_category.id;
          if (!expensesByCategory[categoryId]) {
            expensesByCategory[categoryId] = [];
          }
          expensesByCategory[categoryId].push(exp);
        }
      });

      const localCategories = budgetCategories.map(cat =>
        transformApiToLocal(cat, expensesByCategory[cat.id] || [])
      );
      
      setCategories(localCategories);
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Error saving expense:', err);
      setError(err.message || 'Failed to save expense');
    }
  };

  const deleteExpense = async (categoryId: string, expenseId: string) => {
    try {
      await ExpenseService.deleteExpense(parseInt(expenseId));
      
      // Refresh data to get updated state
      const [budgetCategories, expensesData] = await Promise.all([
        ExpenseService.getBudgetCategories(),
        ExpenseService.getExpenses(1, 100)
      ]);

      // Process the updated data
      const expensesArray = Array.isArray(expensesData) ? expensesData : (expensesData.results || []);
      const expensesByCategory: Record<number, any[]> = {};
      expensesArray.forEach(exp => {
        if (exp && exp.budget_category) {
          const categoryId = exp.budget_category.id;
          if (!expensesByCategory[categoryId]) {
            expensesByCategory[categoryId] = [];
          }
          expensesByCategory[categoryId].push(exp);
        }
      });

      const localCategories = budgetCategories.map(cat =>
        transformApiToLocal(cat, expensesByCategory[cat.id] || [])
      );
      
      setCategories(localCategories);
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      setError(err.message || 'Failed to delete expense');
    }
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
