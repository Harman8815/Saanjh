'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Utensils,
  Palette,
  Camera,
  Shirt,
  Gem,
  Gift,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  TrendingUp,
  PiggyBank
} from 'lucide-react';

type PaymentStatus = 'pending' | 'partial' | 'paid';

interface Expense {
  id: string;
  vendorName: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  date: string;
  notes?: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  allocated: number;
  expenses: Expense[];
  color: string;
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: <Clock size={14} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  partial: { label: 'Partial', icon: <AlertCircle size={14} />, color: 'text-orange-600', bg: 'bg-orange-50' },
  paid: { label: 'Paid', icon: <CheckCircle2 size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
};

const initialCategories: BudgetCategory[] = [
  {
    id: 'venue',
    name: 'Venue',
    icon: <Building2 size={24} />,
    allocated: 500000,
    color: '#8B1538',
    expenses: [
      { id: '1', vendorName: 'Taj Palace Banquet Hall', amount: 500000, paidAmount: 250000, status: 'partial', date: '2024-03-15', notes: '50% advance paid' }
    ]
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: <Utensils size={24} />,
    allocated: 300000,
    color: '#D4A853',
    expenses: [
      { id: '2', vendorName: 'Bikanervala Catering', amount: 300000, paidAmount: 100000, status: 'partial', date: '2024-03-20' }
    ]
  },
  {
    id: 'decoration',
    name: 'Decoration',
    icon: <Palette size={24} />,
    allocated: 150000,
    color: '#C8A4D4',
    expenses: [
      { id: '3', vendorName: 'Floral Dreams Decorators', amount: 120000, paidAmount: 0, status: 'pending', date: '2024-04-01' }
    ]
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: <Camera size={24} />,
    allocated: 100000,
    color: '#5B8A72',
    expenses: [
      { id: '4', vendorName: 'Shaadi Snapshots', amount: 100000, paidAmount: 100000, status: 'paid', date: '2024-02-28' }
    ]
  },
  {
    id: 'outfits',
    name: 'Outfits',
    icon: <Shirt size={24} />,
    allocated: 200000,
    color: '#E8B4B8',
    expenses: [
      { id: '5', vendorName: 'Sabyasachi Mumbai', amount: 150000, paidAmount: 75000, status: 'partial', date: '2024-03-10' },
      { id: '6', vendorName: 'Manyavar', amount: 50000, paidAmount: 50000, status: 'paid', date: '2024-03-12' }
    ]
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    icon: <Gem size={24} />,
    allocated: 400000,
    color: '#B8860B',
    expenses: [
      { id: '7', vendorName: 'Tanishq', amount: 300000, paidAmount: 300000, status: 'paid', date: '2024-02-15' }
    ]
  },
  {
    id: 'gifts',
    name: 'Gifts',
    icon: <Gift size={24} />,
    allocated: 50000,
    color: '#9B59B6',
    expenses: []
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: <MoreHorizontal size={24} />,
    allocated: 75000,
    color: '#7F8C8D',
    expenses: [
      { id: '8', vendorName: 'Wedding Invitations', amount: 25000, paidAmount: 25000, status: 'paid', date: '2024-02-20' }
    ]
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatShortCurrency = (amount: number) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
};

export default function BudgetTrackerPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['venue']);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [totalBudget, setTotalBudget] = useState(1775000);

  const [formData, setFormData] = useState({
    vendorName: '',
    amount: '',
    paidAmount: '',
    status: 'pending' as PaymentStatus,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const totalSpent = categories.reduce((acc, cat) => acc + cat.expenses.reduce((sum, exp) => sum + exp.amount, 0), 0);
  const totalPaid = categories.reduce((acc, cat) => acc + cat.expenses.reduce((sum, exp) => sum + exp.paidAmount, 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const budgetProgress = (totalSpent / totalBudget) * 100;

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
    setFormData({
      vendorName: '',
      amount: '',
      paidAmount: '',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (categoryId: string, expense: Expense) => {
    setSelectedCategory(categoryId);
    setEditingExpense(expense);
    setFormData({
      vendorName: expense.vendorName,
      amount: expense.amount.toString(),
      paidAmount: expense.paidAmount.toString(),
      status: expense.status,
      date: expense.date,
      notes: expense.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const saveExpense = () => {
    if (!formData.vendorName || !formData.amount) return;

    const newExpense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      vendorName: formData.vendorName,
      amount: parseFloat(formData.amount),
      paidAmount: parseFloat(formData.paidAmount) || 0,
      status: formData.status,
      date: formData.date,
      notes: formData.notes
    };

    setCategories(prev => prev.map(cat => {
      if (cat.id !== selectedCategory) return cat;
      
      if (editingExpense) {
        return {
          ...cat,
          expenses: cat.expenses.map(exp => exp.id === editingExpense.id ? newExpense : exp)
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

  const getCategorySpent = (category: BudgetCategory) => {
    return category.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getCategoryPaid = (category: BudgetCategory) => {
    return category.expenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
  };

  const getCardStyle = () => ({
    background: 'rgba(30, 30, 35, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(245, 245, 240, 0.08)',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(212, 165, 116, 0.05)'
  } as React.CSSProperties);

  const getCardHoverStyle = (e: React.MouseEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(212, 165, 116, 0.1)';
    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212, 165, 116, 0.15)';
  };

  const getCardLeaveStyle = (e: React.MouseEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(212, 165, 116, 0.05)';
    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245, 245, 240, 0.08)';
  };

  const getProgressBarStyle = (isOverBudget: boolean, color: string) => ({
    width: '100%',
    height: '100%',
    borderRadius: '9999px',
    background: isOverBudget 
      ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)' 
      : `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`
  } as React.CSSProperties);

  const getMainProgressStyle = (isOverBudget: boolean) => ({
    width: '100%',
    height: '100%',
    borderRadius: '9999px',
    background: isOverBudget 
      ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)' 
      : 'linear-gradient(90deg, #d4a574 0%, #c9a97e 100%)'
  } as React.CSSProperties);

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

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Total Budget */}
          <div className="p-5" style={getCardStyle()} onMouseEnter={getCardHoverStyle} onMouseLeave={getCardLeaveStyle}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-secondary">Total Budget</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
                <IndianRupee size={16} style={{ color: '#d4a574' }} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-text-primary">{formatShortCurrency(totalBudget)}</p>
            <p className="text-xs mt-1 text-text-muted">Overall allocation</p>
          </div>

          {/* Spent */}
          <div className="p-5" style={getCardStyle()} onMouseEnter={getCardHoverStyle} onMouseLeave={getCardLeaveStyle}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-secondary">Total Spent</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
                <TrendingUp size={16} style={{ color: '#d4a574' }} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-text-primary">{formatShortCurrency(totalSpent)}</p>
            <p className={`text-xs mt-1 ${totalSpent > totalBudget ? 'text-red-400' : 'text-text-muted'}`}>
              {totalSpent > totalBudget ? 'Over budget!' : `${Math.round((totalSpent / totalBudget) * 100)}% used`}
            </p>
          </div>

          {/* Paid */}
          <div className="p-5" style={getCardStyle()} onMouseEnter={getCardHoverStyle} onMouseLeave={getCardLeaveStyle}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-secondary">Paid So Far</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)' }}>
                <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-text-primary">{formatShortCurrency(totalPaid)}</p>
            <p className="text-xs mt-1 text-text-muted">Completed payments</p>
          </div>

          {/* Remaining */}
          <div className="p-5" style={getCardStyle()} onMouseEnter={getCardHoverStyle} onMouseLeave={getCardLeaveStyle}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-secondary">Remaining</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: totalRemaining < 0 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(212, 165, 116, 0.1)' }}>
                <PiggyBank size={16} style={{ color: totalRemaining < 0 ? '#ef4444' : '#d4a574' }} />
              </div>
            </div>
            <p className={`text-2xl font-semibold ${totalRemaining < 0 ? 'text-red-400' : 'text-text-primary'}`}>
              {formatShortCurrency(Math.abs(totalRemaining))}
            </p>
            <p className={`text-xs mt-1 ${totalRemaining < 0 ? 'text-red-400' : 'text-text-muted'}`}>
              {totalRemaining < 0 ? 'Over budget' : 'Left to spend'}
            </p>
          </div>
        </motion.div>

        {/* Main Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-5 mb-8"
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
          
          {categories.map((category, index) => {
            const spent = getCategorySpent(category);
            const paid = getCategoryPaid(category);
            const remaining = category.allocated - spent;
            const progress = (spent / category.allocated) * 100;
            const isOverBudget = spent > category.allocated;
            const isExpanded = expandedCategories.includes(category.id);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="overflow-hidden"
                style={getCardStyle()}
                onMouseEnter={getCardHoverStyle}
                onMouseLeave={getCardLeaveStyle}
              >
                {/* Card Header - Always Visible */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}15`, color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{category.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                          <span>Allocated: {formatShortCurrency(category.allocated)}</span>
                          <span>•</span>
                          <span className={isOverBudget ? 'text-red-400' : 'text-text-primary'}>
                            Spent: {formatShortCurrency(spent)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className={`text-sm font-medium ${isOverBudget ? 'text-red-400' : remaining > 0 ? 'text-green-400' : 'text-text-secondary'}`}>
                          {isOverBudget ? `Over: ${formatShortCurrency(Math.abs(remaining))}` : `${formatShortCurrency(remaining)} left`}
                        </p>
                        <p className="text-xs text-text-muted">
                          {category.expenses.length} expense{category.expenses.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddModal(category.id);
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                        style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)', color: '#d4a574' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#d4a574';
                          e.currentTarget.style.color = '#0a0a0f';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.1)';
                          e.currentTarget.style.color = '#d4a574';
                        }}
                      >
                        <Plus size={20} />
                      </button>
                      {isExpanded ? <ChevronUp size={20} className="text-text-muted" /> : <ChevronDown size={20} className="text-text-muted" />}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full h-2 rounded-full overflow-hidden bg-surface">
                      <div
                        style={getProgressBarStyle(isOverBudget, category.color)}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/10">
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 py-4 mb-4 bg-surface/50 rounded-xl">
                          <div className="text-center px-4 border-r border-white/10">
                            <p className="text-xs uppercase tracking-wide mb-1 text-text-muted">Allocated</p>
                            <p className="text-lg font-semibold text-text-primary">{formatCurrency(category.allocated)}</p>
                          </div>
                          <div className="text-center px-4 border-r border-white/10">
                            <p className="text-xs uppercase tracking-wide mb-1 text-text-muted">Spent</p>
                            <p className={`text-lg font-semibold ${isOverBudget ? 'text-red-400' : 'text-text-primary'}`}>{formatCurrency(spent)}</p>
                          </div>
                          <div className="text-center px-4">
                            <p className="text-xs uppercase tracking-wide mb-1 text-text-muted">Paid</p>
                            <p className="text-lg font-semibold text-green-400">{formatCurrency(paid)}</p>
                          </div>
                        </div>

                        {/* Expenses List */}
                        {category.expenses.length > 0 ? (
                          <div className="space-y-3">
                            {category.expenses.map((expense) => {
                              const statusConfig = paymentStatusConfig[expense.status];
                              return (
                                <div
                                  key={expense.id}
                                  className="flex items-center justify-between p-4 rounded-xl transition-colors bg-surface/50 hover:bg-surface"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h4 className="font-medium text-text-primary">{expense.vendorName}</h4>
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                                      >
                                        {statusConfig.icon}
                                        {statusConfig.label}
                                      </span>
                                    </div>
                                    <p className="text-sm text-text-secondary">
                                      {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      {expense.notes && ` • ${expense.notes}`}
                                    </p>
                                  </div>
                                  <div className="text-right mr-4">
                                    <p className="font-semibold text-text-primary">{formatCurrency(expense.amount)}</p>
                                    {expense.paidAmount > 0 && expense.paidAmount !== expense.amount && (
                                      <p className="text-xs text-green-400">Paid: {formatCurrency(expense.paidAmount)}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openEditModal(category.id, expense)}
                                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-text-muted hover:text-primary"
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.1)'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => deleteExpense(category.id, expense.id)}
                                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-red-400"
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.15)'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-text-muted">
                            <p>No expenses added yet</p>
                            <button
                              onClick={() => openAddModal(category.id)}
                              className="mt-3 text-sm font-medium text-primary hover:underline"
                            >
                              Add your first expense
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6 bg-card border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-6 text-text-primary">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-secondary">Vendor Name</label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary"
                    placeholder="Enter vendor name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-secondary">Total Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-secondary">Paid Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-secondary">Payment Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                      className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors appearance-none cursor-pointer bg-surface text-text-primary border-white/10 focus:border-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-secondary">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-text-secondary">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors resize-none bg-surface text-text-primary border-white/10 focus:border-primary"
                    placeholder="Any additional details..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors text-text-secondary hover:text-text-primary bg-surface hover:bg-surface/80"
                >
                  Cancel
                </button>
                <button
                  onClick={saveExpense}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-background bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
