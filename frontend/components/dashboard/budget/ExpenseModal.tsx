import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, Upload, FileText, Calendar, Bell, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Expense, PaymentStatus, BudgetCategory } from './types';
import { paymentStatusConfig } from './data';

interface PaymentScheduleRow {
  dueDate: string;
  amount: number;
  status: PaymentStatus;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> & { 
    id?: string;
    dueDate?: string;
    scheduleReminder?: boolean;
    schedules?: PaymentScheduleRow[];
    receiptFile?: File | null;
  }) => void;
  editingExpense: Expense | null;
  category: BudgetCategory | null;
}

const initialFormData = {
  vendorName: '',
  amount: '',
  paidAmount: '',
  status: 'pending' as PaymentStatus,
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  scheduleReminder: false,
  notes: '',
};

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  category
}: ExpenseModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [schedules, setSchedules] = useState<PaymentScheduleRow[]>([]);
  const [showScheduleBuilder, setShowScheduleBuilder] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        vendorName: editingExpense.vendorName,
        amount: editingExpense.amount.toString(),
        paidAmount: editingExpense.paidAmount.toString(),
        status: editingExpense.status,
        date: editingExpense.date,
        dueDate: (editingExpense as any).dueDate || '',
        scheduleReminder: false,
        notes: editingExpense.notes || ''
      });
      setReceiptFile(null);
      setSchedules([]);
    } else {
      setFormData(initialFormData);
      setReceiptFile(null);
      setSchedules([]);
    }
  }, [editingExpense, isOpen]);

  const handleAddScheduleRow = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14 * (schedules.length + 1));
    const totalAmt = Number(formData.amount) || 0;
    const splitAmount = schedules.length === 0 ? Math.round(totalAmt / 2) : 0;
    setSchedules((prev) => [
      ...prev,
      {
        dueDate: nextDate.toISOString().split('T')[0],
        amount: splitAmount,
        status: 'pending',
      },
    ]);
  };

  const handleRemoveScheduleRow = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!formData.vendorName || !formData.amount) return;

    onSave({
      id: editingExpense?.id,
      vendorName: formData.vendorName,
      amount: Number(formData.amount),
      paidAmount: Number(formData.paidAmount) || 0,
      status: formData.status,
      date: formData.date,
      dueDate: formData.dueDate,
      scheduleReminder: formData.scheduleReminder,
      schedules: schedules.length > 0 ? schedules : undefined,
      receiptFile,
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
            className="relative w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden max-h-[85vh] flex flex-col"
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
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">
                  Vendor / Expense Title *
                </label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary text-sm"
                  placeholder="e.g. Wedding Photographer Deposit"
                />
              </div>

              {/* Amount & Paid Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-secondary">
                    Total Amount *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-text-secondary">
                    Amount Paid
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary text-sm"
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
                <label className="block text-sm font-medium mb-1 text-text-secondary">
                  Payment Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(paymentStatusConfig) as PaymentStatus[]).map((status) => {
                    const config = paymentStatusConfig[status];
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({ ...formData, status })}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          formData.status === status
                            ? `${config.bg} ${config.color} border-current`
                            : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-surface'
                        }`}
                      >
                        <Icon size={14} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expense Date & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-secondary">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-secondary">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none transition-colors bg-surface text-text-primary border-white/10 focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Reminder scheduling */}
              {formData.dueDate && (
                <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                  <input
                    type="checkbox"
                    checked={formData.scheduleReminder}
                    onChange={(e) => setFormData({ ...formData, scheduleReminder: e.target.checked })}
                    className="rounded border-white/20 text-primary focus:ring-primary/20"
                  />
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send reminder notification before payment due date</span>
                </label>
              )}

              {/* Payment Schedule Rows */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">
                    Payment Schedule / Installments
                  </label>
                  <button
                    type="button"
                    onClick={handleAddScheduleRow}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Installment
                  </button>
                </div>

                {schedules.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {schedules.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <input
                          type="date"
                          value={row.dueDate}
                          onChange={(e) => {
                            const updated = [...schedules];
                            updated[idx].dueDate = e.target.value;
                            setSchedules(updated);
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface border border-white/10 text-text-primary"
                        />
                        <div className="relative w-28">
                          <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
                          <input
                            type="number"
                            value={row.amount}
                            onChange={(e) => {
                              const updated = [...schedules];
                              updated[idx].amount = Number(e.target.value);
                              setSchedules(updated);
                            }}
                            className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-surface border border-white/10 text-text-primary"
                            placeholder="Amount"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveScheduleRow(idx)}
                          className="p-1.5 text-text-muted hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Receipt Upload */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Receipt / Invoice Document
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-surface hover:bg-white/5 text-xs text-text-secondary font-medium transition-colors">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>{receiptFile ? 'Change File' : 'Upload Receipt'}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setReceiptFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {receiptFile && (
                    <div className="flex items-center gap-1.5 text-xs text-text-primary">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate max-w-[180px]">{receiptFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setReceiptFile(null)}
                        className="text-text-muted hover:text-red-400 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border outline-none transition-colors resize-none bg-surface text-text-primary border-white/10 focus:border-primary text-xs"
                  placeholder="Any additional details or terms..."
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
