'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Bell, 
  Trash2, 
  Users, 
  Armchair, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Calendar
} from 'lucide-react';
import { GuestGroup, Table } from '../../../types/api';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkRsvpUpdate: (status: string) => void;
  onBulkTableAssign: (tableId: number | null) => void;
  onBulkGroupAssign: (groupId: number | null) => void;
  onSendInvitations: () => void;
  onScheduleReminders: (scheduledFor: string) => void;
  onBulkDelete: () => void;
  tables?: Table[];
  groups?: GuestGroup[];
}

export default function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkRsvpUpdate,
  onBulkTableAssign,
  onBulkGroupAssign,
  onSendInvitations,
  onScheduleReminders,
  onBulkDelete,
  tables = [],
  groups = [],
}: BulkActionBarProps) {
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderDate, setReminderDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  });

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-neutral-700/60 flex flex-wrap items-center gap-3 max-w-4xl"
      >
        {/* Count & Close */}
        <div className="flex items-center gap-2 border-r border-neutral-700/80 pr-3">
          <span className="inline-flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6">
            {selectedCount}
          </span>
          <span className="text-xs font-medium text-neutral-200">Selected</span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-neutral-400 hover:text-white ml-1 p-0.5 rounded transition-colors"
            title="Deselect all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick RSVP Status */}
        <div className="flex items-center gap-1 border-r border-neutral-700/80 pr-3">
          <button
            type="button"
            onClick={() => onBulkRsvpUpdate('confirmed')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirm
          </button>
          <button
            type="button"
            onClick={() => onBulkRsvpUpdate('declined')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Decline
          </button>
        </div>

        {/* Assign Group */}
        <div className="flex items-center gap-1">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value === '') return;
              const val = e.target.value === 'null' ? null : Number(e.target.value);
              onBulkGroupAssign(val);
              e.target.value = '';
            }}
            className="text-xs bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="" disabled>Set Group...</option>
            <option value="null">No Group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assign Table */}
        <div className="flex items-center gap-1">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value === '') return;
              const val = e.target.value === 'null' ? null : Number(e.target.value);
              onBulkTableAssign(val);
              e.target.value = '';
            }}
            className="text-xs bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="" disabled>Set Table...</option>
            <option value="null">Unassign</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.table_number}
              </option>
            ))}
          </select>
        </div>

        {/* Send Invitations */}
        <button
          type="button"
          onClick={onSendInvitations}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Invite
        </button>

        {/* Reminder scheduling */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowReminderPicker(!showReminderPicker)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            Remind
          </button>

          {showReminderPicker && (
            <div className="absolute bottom-full mb-2 left-0 w-64 bg-neutral-900 border border-neutral-700 p-3 rounded-xl shadow-xl text-xs space-y-2">
              <span className="font-semibold text-neutral-200 block">Schedule RSVP Reminder</span>
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg p-1.5 focus:outline-none"
              />
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReminderPicker(false)}
                  className="px-2 py-1 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onScheduleReminders(new Date(reminderDate).toISOString());
                    setShowReminderPicker(false);
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-medium"
                >
                  Schedule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Delete */}
        <button
          type="button"
          onClick={onBulkDelete}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
