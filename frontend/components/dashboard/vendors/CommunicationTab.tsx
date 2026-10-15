'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Users, MessageSquare, Plus, Calendar, Bell, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { VendorService } from '../../../services/vendors';
import { VendorCommunication } from '../../../types/api';

interface CommunicationTabProps {
  vendorId: number | string;
}

const typeIcons: Record<string, any> = {
  email: Mail,
  call: Phone,
  meeting: Users,
  note: MessageSquare,
};

export default function CommunicationTab({ vendorId }: CommunicationTabProps) {
  const numericId = typeof vendorId === 'number' ? vendorId : parseInt(vendorId, 10);
  const [communications, setCommunications] = useState<VendorCommunication[]>([]);
  const [loading, setLoading] = useState(true);

  // New communication modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [commType, setCommType] = useState<'email' | 'call' | 'meeting' | 'note'>('email');
  const [commDirection, setCommDirection] = useState<'inbound' | 'outbound'>('outbound');
  const [commSubject, setCommSubject] = useState('');
  const [commBody, setCommBody] = useState('');
  const [commOccurredAt, setCommOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [commFollowUpDate, setCommFollowUpDate] = useState('');
  const [loggingComm, setLoggingComm] = useState(false);

  // Schedule follow-up quick modal
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpChannel, setFollowUpChannel] = useState<'email' | 'in_app'>('email');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [schedulingFollowUp, setSchedulingFollowUp] = useState(false);
  const [followUpSuccess, setFollowUpSuccess] = useState<string | null>(null);

  const loadCommunications = async () => {
    if (isNaN(numericId)) return;
    try {
      setLoading(true);
      const res = await VendorService.getCommunications(numericId);
      setCommunications(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching vendor communications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunications();
  }, [numericId]);

  const handleLogCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commSubject || isNaN(numericId)) return;
    try {
      setLoggingComm(true);
      await VendorService.createCommunication({
        vendor: numericId,
        type: commType,
        direction: commDirection,
        subject: commSubject,
        body: commBody,
        occurred_at: new Date(commOccurredAt).toISOString(),
        follow_up_date: commFollowUpDate || null,
      });

      // Also if follow_up_date is set, schedule follow-up
      if (commFollowUpDate) {
        await VendorService.scheduleFollowUp(numericId, {
          follow_up_date: commFollowUpDate,
          notes: `Follow up regarding: ${commSubject}`,
          channel: 'email',
        });
      }

      setShowLogModal(false);
      setCommSubject('');
      setCommBody('');
      setCommFollowUpDate('');
      await loadCommunications();
    } catch (err) {
      console.error('Error logging communication:', err);
    } finally {
      setLoggingComm(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate || isNaN(numericId)) return;
    try {
      setSchedulingFollowUp(true);
      const res = await VendorService.scheduleFollowUp(numericId, {
        follow_up_date: followUpDate,
        channel: followUpChannel,
        notes: followUpNotes,
      });
      setFollowUpSuccess('Follow-up scheduled and reminder queued successfully!');
      setTimeout(() => {
        setShowFollowUpModal(false);
        setFollowUpSuccess(null);
        setFollowUpDate('');
        setFollowUpNotes('');
      }, 1500);
    } catch (err) {
      console.error('Error scheduling follow-up:', err);
    } finally {
      setSchedulingFollowUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Communication History</h3>
          <p className="text-sm text-text-muted">Keep an audit trail of calls, emails, and upcoming follow-ups</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <Bell size={16} />
            Schedule Follow-up
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <Plus size={16} />
            Log Interaction
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 rounded-2xl text-center text-text-muted">
          Loading communications...
        </div>
      ) : communications.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3">
          <MessageSquare className="mx-auto text-text-muted/40" size={48} />
          <h4 className="text-lg font-medium text-text-primary">No communications logged yet</h4>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Log emails, discovery calls, and meetings with this vendor to coordinate timelines and expectations.
          </p>
          <button
            onClick={() => setShowLogModal(true)}
            className="btn-primary px-4 py-2 text-sm rounded-xl"
          >
            Log first interaction
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {communications.map((comm) => {
            const Icon = typeIcons[comm.type] || MessageSquare;
            return (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 rounded-2xl border border-white/5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">{comm.subject}</h4>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                        <span className="capitalize">{comm.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {comm.direction === 'inbound' ? (
                            <>
                              <ArrowDownLeft size={12} className="text-emerald-400" />
                              Received
                            </>
                          ) : (
                            <>
                              <ArrowUpRight size={12} className="text-blue-400" />
                              Sent
                            </>
                          )}
                        </span>
                        <span>•</span>
                        <span>{new Date(comm.occurred_at).toLocaleString()}</span>
                        {comm.created_by_name && (
                          <>
                            <span>•</span>
                            <span>By {comm.created_by_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {comm.follow_up_date && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                      <Calendar size={12} />
                      Follow up: {new Date(comm.follow_up_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {comm.body && (
                  <p className="text-sm text-text-secondary bg-white/5 p-3 rounded-xl whitespace-pre-wrap">
                    {comm.body}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Log Interaction Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-lg w-full p-6 rounded-3xl border border-white/10 space-y-4"
          >
            <h3 className="text-xl font-bold text-text-primary">Log Vendor Interaction</h3>
            <form onSubmit={handleLogCommunication} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Type</label>
                  <select
                    value={commType}
                    onChange={(e) => setCommType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="call">Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Internal Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Direction</label>
                  <select
                    value={commDirection}
                    onChange={(e) => setCommDirection(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="outbound">Outbound (Sent)</option>
                    <option value="inbound">Inbound (Received)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discussed final guest headcount and tasting session"
                  value={commSubject}
                  onChange={(e) => setCommSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Details & Notes</label>
                <textarea
                  rows={4}
                  placeholder="Summary of what was agreed, action items, or questions..."
                  value={commBody}
                  onChange={(e) => setCommBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Interaction Date & Time</label>
                  <input
                    type="datetime-local"
                    value={commOccurredAt}
                    onChange={(e) => setCommOccurredAt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Next Follow-Up Date (Optional)</label>
                  <input
                    type="date"
                    value={commFollowUpDate}
                    onChange={(e) => setCommFollowUpDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loggingComm}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {loggingComm ? 'Saving...' : 'Save Interaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-4"
          >
            <h3 className="text-xl font-bold text-text-primary">Schedule Vendor Follow-Up</h3>
            {followUpSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 text-sm text-center">
                {followUpSuccess}
              </div>
            ) : (
              <form onSubmit={handleScheduleFollowUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Follow-up Date *</label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Notification Channel</label>
                  <select
                    value={followUpChannel}
                    onChange={(e) => setFollowUpChannel(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="in_app">In-App Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Reminder Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Check if signed contract and revised quote arrived"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFollowUpModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={schedulingFollowUp}
                    className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {schedulingFollowUp ? 'Scheduling...' : 'Set Reminder'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
