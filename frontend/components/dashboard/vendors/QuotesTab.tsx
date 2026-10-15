'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { VendorService } from '../../../services/vendors';
import { VendorQuote } from '../../../types/api';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';

interface QuotesTabProps {
  vendorId: number | string;
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  draft: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', icon: Clock },
  sent: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock },
  accepted: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
  rejected: { bg: 'bg-rose-500/20', text: 'text-rose-400', icon: XCircle },
  expired: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: AlertCircle },
};

export default function QuotesTab({ vendorId }: QuotesTabProps) {
  const numericId = typeof vendorId === 'number' ? vendorId : parseInt(vendorId, 10);
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { formatCurrency } = useFormatCurrency();

  // New quote form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [statusVal, setStatusVal] = useState<'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'>('draft');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadQuotes = async () => {
    if (isNaN(numericId)) return;
    try {
      setLoading(true);
      const res = await VendorService.getQuotes(numericId);
      setQuotes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [numericId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || isNaN(numericId)) return;
    try {
      setSubmitting(true);
      await VendorService.createQuote({
        vendor: numericId,
        title,
        amount: parseFloat(amount),
        valid_until: validUntil || null,
        status: statusVal,
        notes,
      });
      setShowAddModal(false);
      setTitle('');
      setAmount('');
      setValidUntil('');
      setNotes('');
      setStatusVal('draft');
      await loadQuotes();
    } catch (err) {
      console.error('Failed to create quote:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (quoteId: number, nextStatus: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') => {
    try {
      await VendorService.updateQuote(quoteId, { status: nextStatus });
      await loadQuotes();
    } catch (err) {
      console.error('Failed to update quote status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Vendor Quotes</h3>
          <p className="text-sm text-text-muted">Track quotes, estimates, and proposal versions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        >
          <Plus size={16} />
          Add Quote
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-8 rounded-2xl text-center text-text-muted">
          Loading quotes...
        </div>
      ) : quotes.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3">
          <FileText className="mx-auto text-text-muted/40" size={48} />
          <h4 className="text-lg font-medium text-text-primary">No quotes recorded yet</h4>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Log vendor quotes to compare offers, track expiration dates, and lock in approved pricing.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary px-4 py-2 text-sm rounded-xl"
          >
            Create first quote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((quote) => {
            const config = statusColors[quote.status] || statusColors.draft;
            const Icon = config.icon;
            return (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 rounded-2xl border border-white/5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-text-primary">{quote.title}</h4>
                    {quote.valid_until && (
                      <p className="text-xs text-text-muted mt-0.5">
                        Valid until: {new Date(quote.valid_until).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                    <Icon size={12} />
                    {quote.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(quote.amount)}
                </div>

                {quote.notes && (
                  <p className="text-xs text-text-muted bg-white/5 p-3 rounded-xl">
                    {quote.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    Created: {new Date(quote.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {quote.status !== 'accepted' && (
                      <button
                        onClick={() => handleStatusChange(quote.id, 'accepted')}
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      >
                        Accept
                      </button>
                    )}
                    {quote.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(quote.id, 'rejected')}
                        className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Quote Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-4"
          >
            <h3 className="text-xl font-bold text-text-primary">Add Vendor Quote</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Quote Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Day Photography Package"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="3500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Status</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Notes / Terms</label>
                <textarea
                  rows={3}
                  placeholder="Included hours, deliverables, deposit conditions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Quote'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
