'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Plus, CheckCircle2, Circle, Calendar, ShieldCheck, DollarSign } from 'lucide-react';
import { VendorService } from '../../../services/vendors';
import { VendorContract, VendorMilestone } from '../../../types/api';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';

interface ContractPaymentsTabProps {
  vendorId: number | string;
}

export default function ContractPaymentsTab({ vendorId }: ContractPaymentsTabProps) {
  const numericId = typeof vendorId === 'number' ? vendorId : parseInt(vendorId, 10);
  const [contract, setContract] = useState<VendorContract | null>(null);
  const [milestones, setMilestones] = useState<VendorMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useFormatCurrency();

  // Contract form state
  const [signedDate, setSignedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPaid, setDepositPaid] = useState(false);
  const [terms, setTerms] = useState('');
  const [savingContract, setSavingContract] = useState(false);

  // Milestone form modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [mName, setMName] = useState('');
  const [mAmount, setMAmount] = useState('');
  const [mDueDate, setMDueDate] = useState('');
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  const loadData = async () => {
    if (isNaN(numericId)) return;
    try {
      setLoading(true);
      const [contractsRes, milestonesRes] = await Promise.all([
        VendorService.getContracts(numericId),
        VendorService.getMilestones(numericId),
      ]);
      const activeContract = Array.isArray(contractsRes) && contractsRes.length > 0 ? contractsRes[0] : null;
      setContract(activeContract);
      if (activeContract) {
        setSignedDate(activeContract.signed_date || '');
        setExpiryDate(activeContract.expiry_date || '');
        setDepositAmount(activeContract.deposit_amount?.toString() || '');
        setDepositPaid(activeContract.deposit_paid || false);
        setTerms(activeContract.terms || '');
      }
      setMilestones(Array.isArray(milestonesRes) ? milestonesRes : []);
    } catch (err) {
      console.error('Error fetching contract and milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [numericId]);

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numericId)) return;
    try {
      setSavingContract(true);
      const payload = {
        vendor: numericId,
        signed_date: signedDate || null,
        expiry_date: expiryDate || null,
        deposit_amount: depositAmount ? parseFloat(depositAmount) : 0,
        deposit_paid: depositPaid,
        terms,
      };
      if (contract) {
        await VendorService.updateContract(contract.id, payload);
      } else {
        await VendorService.createContract(payload);
      }
      await loadData();
    } catch (err) {
      console.error('Error saving contract:', err);
    } finally {
      setSavingContract(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName || !mAmount || isNaN(numericId)) return;
    try {
      setSubmittingMilestone(true);
      await VendorService.createMilestone({
        vendor: numericId,
        name: mName,
        amount: parseFloat(mAmount),
        due_date: mDueDate || null,
        paid: false,
      });
      setShowMilestoneModal(false);
      setMName('');
      setMAmount('');
      setMDueDate('');
      await loadData();
    } catch (err) {
      console.error('Error creating milestone:', err);
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const handleToggleMilestonePaid = async (m: VendorMilestone) => {
    try {
      await VendorService.updateMilestone(m.id, {
        paid: !m.paid,
        paid_date: !m.paid ? new Date().toISOString().split('T')[0] : null,
      });
      await loadData();
    } catch (err) {
      console.error('Error toggling milestone status:', err);
    }
  };

  const totalMilestones = milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const paidMilestones = milestones.filter(m => m.paid).reduce((sum, m) => sum + Number(m.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Contract Section */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <FileCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">Contract & Deposit</h3>
              <p className="text-sm text-text-muted">Master vendor agreement, key dates, and deposit terms</p>
            </div>
          </div>
          {contract && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${contract.signed_date ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {contract.signed_date ? 'Signed' : 'Pending Signature'}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveContract} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Signed Date</label>
            <input
              type="date"
              value={signedDate}
              onChange={(e) => setSignedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Contract Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Deposit Amount ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="1000.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
              <input
                type="checkbox"
                checked={depositPaid}
                onChange={(e) => setDepositPaid(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              Deposit Paid to Vendor
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-muted mb-1">Terms & Conditions / Special Clauses</label>
            <textarea
              rows={3}
              placeholder="Cancellation window, overtime rates, deliverables..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingContract}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {savingContract ? 'Saving Contract...' : contract ? 'Update Contract' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Milestones Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-text-primary">Payment Milestones</h3>
            <p className="text-sm text-text-muted">
              Scheduled milestone installments ({formatCurrency(paidMilestones)} of {formatCurrency(totalMilestones)} paid)
            </p>
          </div>
          <button
            onClick={() => setShowMilestoneModal(true)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <Plus size={16} />
            Add Milestone
          </button>
        </div>

        {/* Milestone Progress Bar */}
        {totalMilestones > 0 && (
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((paidMilestones / totalMilestones) * 100))}%` }}
            />
          </div>
        )}

        {milestones.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-text-muted text-sm">
            No payment milestones added yet. Break down the vendor payment into installments (e.g. 50% deposit, 25% halfway, 25% day-of).
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleMilestonePaid(m)}
                    className="text-text-muted hover:text-emerald-400 transition-colors"
                  >
                    {m.paid ? (
                      <CheckCircle2 size={22} className="text-emerald-400" />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>
                  <div>
                    <h4 className={`text-sm font-semibold ${m.paid ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {m.name}
                    </h4>
                    {m.due_date && (
                      <span className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                        <Calendar size={12} />
                        Due: {new Date(m.due_date).toLocaleDateString()}
                        {m.paid_date && ` (Paid on ${new Date(m.paid_date).toLocaleDateString()})`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-bold text-primary">
                    {formatCurrency(m.amount)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {m.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-4"
          >
            <h3 className="text-xl font-bold text-text-primary">Add Payment Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% Advance on Booking"
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1500.00"
                  value={mAmount}
                  onChange={(e) => setMAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Due Date</label>
                <input
                  type="date"
                  value={mDueDate}
                  onChange={(e) => setMDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMilestone}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {submittingMilestone ? 'Adding...' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
