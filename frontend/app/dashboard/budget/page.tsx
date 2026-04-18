'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
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
  PiggyBank,
  LayoutDashboard,
  PieChartIcon,
  History,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  X
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

  // Tab state
  const [activeTab, setActiveTab] = useState<'budget' | 'demographics' | 'history'>('budget');

  // History tab filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

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

  // Prepare data for charts
  const chartData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: cat.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      color: cat.color,
      allocated: cat.allocated
    })).filter(d => d.value > 0);
  }, [categories]);

  // Prepare all expenses for history tab
  const allExpenses = useMemo(() => {
    const expenses: (Expense & { category: string; categoryColor: string })[] = [];
    categories.forEach(cat => {
      cat.expenses.forEach(exp => {
        expenses.push({ ...exp, category: cat.name, categoryColor: cat.color });
      });
    });
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [categories]);

  // Filter and sort expenses for history
  const filteredExpenses = useMemo(() => {
    let result = [...allExpenses];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.vendorName.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory);
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(e => e.status === filterStatus);
    }
    
    // Date range filter
    if (dateRange.from) {
      result = result.filter(e => e.date >= dateRange.from);
    }
    if (dateRange.to) {
      result = result.filter(e => e.date <= dateRange.to);
    }
    
    // Sort
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

  // Demographics Tab Component
  const DemographicsTab = () => {
    const totalSpent = chartData.reduce((sum, d) => sum + d.value, 0);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Pie Chart Card */}
        <div className="p-6" style={getCardStyle()}>
          <h2 className="text-lg font-semibold mb-6 text-text-primary">Expense Distribution</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e1e23', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#f5f5f0'
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    wrapperStyle={{ color: '#d4d4d0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Percentage Breakdown */}
            <div className="space-y-3">
              {chartData.map((item) => {
                const percentage = ((item.value / totalSpent) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-surface/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-text-primary">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{formatCurrency(item.value)}</p>
                      <p className="text-sm text-text-muted">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="p-6" style={getCardStyle()}>
          <h2 className="text-lg font-semibold mb-6 text-text-primary">Category Comparison</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9b9b95" 
                  tick={{ fill: '#9b9b95', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9b9b95" 
                  tick={{ fill: '#9b9b95', fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e1e23', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f5f5f0'
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  };

  // History Tab Component
  const HistoryTab = () => {
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vendor or category..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary placeholder-text-muted focus:border-primary outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
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
                onChange={(e) => setFilterCategory(e.target.value)}
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
                onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
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
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:border-primary outline-none transition-colors cursor-pointer"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
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
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-surface border border-white/10 text-text-primary text-sm focus:border-primary outline-none"
              />
              <span className="text-text-muted">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-surface border border-white/10 text-text-primary text-sm focus:border-primary outline-none"
              />
              {(dateRange.from || dateRange.to) && (
                <button
                  onClick={() => setDateRange({ from: '', to: '' })}
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
                    const statusConfig = paymentStatusConfig[expense.status];
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
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
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
                                if (cat) openEditModal(cat.id, expense);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                const cat = categories.find(c => c.name === expense.category);
                                if (cat) deleteExpense(cat.id, expense.id);
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
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('all');
                          setFilterStatus('all');
                          setDateRange({ from: '', to: '' });
                        }}
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
  };

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8"
        >
          <div className="inline-flex p-1.5 rounded-2xl bg-surface/50 border border-white/10">
            {[
              { id: 'budget', label: 'Budget', icon: LayoutDashboard },
              { id: 'demographics', label: 'Demographics', icon: PieChartIcon },
              { id: 'history', label: 'History', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-background'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Summary Cards - Only show on Budget tab */}
        {activeTab === 'budget' && (
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
        )}

        {/* Main Progress Bar */}
        {activeTab === 'budget' && (
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
        )}

        {/* Budget Tab - Category Cards */}
        {activeTab === 'budget' && (
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
        )}

        {/* Demographics Tab */}
        {activeTab === 'demographics' && <DemographicsTab />}

        {/* History Tab */}
        {activeTab === 'history' && <HistoryTab />}
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
