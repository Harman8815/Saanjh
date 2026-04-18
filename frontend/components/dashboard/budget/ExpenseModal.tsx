'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee } from 'lucide-react';
import { Expense, PaymentStatus, BudgetCategory } from './types';
import { paymentStatusConfig } from './data';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> & { id?: string }) => void;
  editingExpense: Expense | null;
  category: BudgetCategory | null;
}

const initialFormData = {
  vendorName: '',
  amount: '',
  paidAmount: '',
  status: 'pending' as PaymentStatus,
  date: new Date().toISOString().split('T')[0],
  notes: ''
};

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  category
}: ExpenseModalProps) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        vendorName: editingExpense.vendorName,
        amount: editingExpense.amount.toString(),
        paidAmount: editingExpense.paidAmount.toString(),
        status: editingExpense.status,
        date: editingExpense.date,
        notes: editingExpense.notes || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingExpense, isOpen]);

  const handleSave = () => {
    if (!formData.vendorName || !formData.amount) return;

    onSave({
      id: editingExpense?.id,
      vendorName: formData.vendorName,
      amount: Number(formData.amount),
      paidAmount: Number(formData.paidAmount) || 0,
      status: formData.status,
      date: formData.date,
      notes: formData.notes
    });
    onClose();
  };

  const paidPercentage = formData.amount && formData.paidAmount
    ? Math.round((Number(formData.paidAmount) / Number(formData.amount)) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && category && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e1e23 0%, #141419 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: category.color }}
                >
                  <category.icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {editingExpense ? 'Edit Expense' : 'Add Expense'}
                  </h3>
                  <p className="text-sm text-text-muted">{category.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary"
                  placeholder="Enter vendor name"
                />
              </div>

              {/* Amount & Paid Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-secondary">
                    Total Amount *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-text-secondary">
                    Amount Paid
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                  {paidPercentage > 0 && (
                    <p className="text-xs text-text-muted mt-1">{paidPercentage}% paid</p>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  Payment Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(paymentStatusConfig) as PaymentStatus[]).map((status) => {
                    const config = paymentStatusConfig[status];
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setFormData({ ...formData, status })}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                          formData.status === status
                            ? `${config.bg} ${config.color} border-current`
                            : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-surface'
                        }`}
                      >
                        <Icon size={16} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors resize-none bg-surface text-text-primary border-white/10 focus:border-primary"
                  placeholder="Any additional details..."
                  rows={2}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors text-text-secondary hover:text-text-primary bg-surface hover:bg-surface/80"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.vendorName || !formData.amount}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium text-background bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingExpense ? 'Save Changes' : 'Add Expense'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
