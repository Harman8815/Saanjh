'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  UserPlus, 
  Search, 
  Armchair, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  GripVertical
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import GuestLayoutSkeleton from '../../../../components/dashboard/GuestLayoutSkeleton';
import { Guest, Table as ApiTable } from '../../../../types/api';
import { GuestService } from '../../../../services/guests';

interface LocalTable {
  id: number;
  name: string;
  table_number: number;
  capacity: number;
  assigned_guests: number;
  shape: 'round' | 'rectangular';
}

export default function SeatingChartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<LocalTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedTable, setSelectedTable] = useState<LocalTable | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState(1);
  const [newTableCapacity, setNewTableCapacity] = useState(8);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOverTableId, setDragOverTableId] = useState<number | 'unassigned' | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tablesResponse, guestsResponse] = await Promise.all([
        GuestService.getAllTables(),
        GuestService.getGuests(1, 1000),
      ]);

      const guestsArray = Array.isArray(guestsResponse) ? guestsResponse : (guestsResponse.results || []);
      const localTables: LocalTable[] = tablesResponse.map((table: ApiTable) => ({
        id: table.id,
        name: `Table ${table.table_number}`,
        table_number: table.table_number,
        capacity: table.capacity || 8,
        assigned_guests: guestsArray.filter((g: Guest) => g.table_id === table.id).length,
        shape: 'round',
      }));

      // Next available table number
      const maxNumber = localTables.reduce((max, t) => Math.max(max, t.table_number), 0);
      setNewTableNumber(maxNumber + 1);

      setTables(localTables);
      setGuests(guestsArray);
    } catch (err: any) {
      console.error('Error fetching seating data:', err);
      toast.error('Failed to load seating chart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered unassigned guests
  const unassignedGuests = guests.filter(
    (g) => !g.table_id && (!g.rsvp_status || g.rsvp_status.name?.toLowerCase() !== 'declined')
  );

  const filteredUnassigned = unassignedGuests.filter(
    (g) =>
      g.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalTables = tables.length;
  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const assignedCount = guests.filter((g) => g.table_id).length;
  const unassignedCount = unassignedGuests.length;
  const availableSeats = Math.max(0, totalSeats - assignedCount);

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, guestId: number, fromTableId?: number | null) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ guestId, fromTableId: fromTableId || null }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: number | 'unassigned') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTableId !== targetId) {
      setDragOverTableId(targetId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTableId(null);
  };

  const handleDropOnTable = async (e: React.DragEvent, targetTable: LocalTable) => {
    e.preventDefault();
    setDragOverTableId(null);

    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { guestId, fromTableId } = JSON.parse(dataStr);

      if (fromTableId === targetTable.id) return; // Dropped on same table

      const currentAssigned = guests.filter((g) => g.table_id === targetTable.id).length;
      if (currentAssigned >= targetTable.capacity) {
        toast.error(`Table ${targetTable.table_number} is already full (${targetTable.capacity}/${targetTable.capacity})!`, {
          icon: '⚠️',
        });
        return;
      }

      // Optimistically update
      setGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, table_id: targetTable.id } : g))
      );
      setTables((prev) =>
        prev.map((t) => {
          if (t.id === targetTable.id) return { ...t, assigned_guests: t.assigned_guests + 1 };
          if (t.id === fromTableId) return { ...t, assigned_guests: Math.max(0, t.assigned_guests - 1) };
          return t;
        })
      );

      await GuestService.bulkAssignTable(targetTable.id, [guestId]);
      toast.success(`Seated at Table ${targetTable.table_number}`);
    } catch (err: any) {
      console.error('Error assigning guest:', err);
      toast.error('Failed to assign guest to table');
      fetchData(); // Rollback
    }
  };

  const handleDropOnUnassigned = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTableId(null);

    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { guestId, fromTableId } = JSON.parse(dataStr);

      if (!fromTableId) return; // Already unassigned

      // Optimistically update
      setGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, table_id: null } : g))
      );
      setTables((prev) =>
        prev.map((t) => (t.id === fromTableId ? { ...t, assigned_guests: Math.max(0, t.assigned_guests - 1) } : t))
      );

      await GuestService.updateGuest(guestId, { table_id: null });
      toast.success('Guest unassigned from table');
    } catch (err: any) {
      console.error('Error unassigning guest:', err);
      toast.error('Failed to unassign guest');
      fetchData(); // Rollback
    }
  };

  const handleRemoveGuest = async (guestId: number, tableId: number) => {
    try {
      setGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, table_id: null } : g))
      );
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, assigned_guests: Math.max(0, t.assigned_guests - 1) } : t))
      );
      await GuestService.updateGuest(guestId, { table_id: null });
      toast.success('Guest removed from table');
    } catch (err) {
      toast.error('Failed to remove guest');
      fetchData();
    }
  };

  const handleAutoAssign = async () => {
    try {
      setIsAutoAssigning(true);
      const res = await GuestService.autoAssignSeating();
      toast.success(`Auto-assigned ${res.assigned} guests across tables!`);
      if (res.unassigned > 0) {
        toast(`Remaining unassigned: ${res.unassigned} (venue capacity reached)`, { icon: 'ℹ️' });
      }
      fetchData();
    } catch (err: any) {
      console.error('Auto-assign failed:', err);
      toast.error(err.response?.data?.error || 'Auto-assign failed');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingTable(true);
      const created = await GuestService.createTable({
        table_number: newTableNumber,
        capacity: newTableCapacity,
      });
      toast.success(`Table ${created.table_number} added`);
      setShowAddTableModal(false);
      fetchData();
    } catch (err: any) {
      console.error('Failed to create table:', err);
      toast.error('Failed to create table');
    } finally {
      setIsCreatingTable(false);
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!window.confirm('Delete this table? Guests assigned to it will become unassigned.')) return;
    try {
      await GuestService.deleteTable(tableId);
      toast.success('Table deleted');
      setSelectedTable(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete table');
    }
  };

  if (isLoading) {
    return <GuestLayoutSkeleton />;
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/dashboard/guests/list"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Guest List</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              Interactive Seating Chart
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Drag and drop guests between tables or the unassigned tray.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isAutoAssigning || unassignedCount === 0}
              onClick={handleAutoAssign}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              {isAutoAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Auto-Assign Seating</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddTableModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-500 text-white transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 block">Total Tables</span>
          <span className="text-xl font-bold text-neutral-900 dark:text-white">{totalTables}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 block">Total Seats</span>
          <span className="text-xl font-bold text-neutral-900 dark:text-white">{totalSeats}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">Assigned Guests</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{assignedCount}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block">Unassigned</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{unassignedCount}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 block">Available Seats</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{availableSeats}</span>
        </div>
      </div>

      {/* Main Seating Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Tables Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Tables Layout ({tables.length})
            </h2>
            <span className="text-xs text-neutral-500">Drag guest chips directly onto any table</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tables.map((table) => {
              const assignedGuests = guests.filter((g) => g.table_id === table.id);
              const occupancyPct = Math.round((assignedGuests.length / (table.capacity || 1)) * 100);
              const isFull = assignedGuests.length >= table.capacity;
              const isOver = assignedGuests.length > table.capacity;
              const isTargeted = dragOverTableId === table.id;

              const getBarColor = () => {
                if (isOver) return 'bg-rose-500';
                if (isFull) return 'bg-primary-600';
                if (occupancyPct >= 70) return 'bg-amber-500';
                return 'bg-emerald-500';
              };

              return (
                <div
                  key={table.id}
                  onDragOver={(e) => handleDragOver(e, table.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDropOnTable(e, table)}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isTargeted
                      ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
                      : selectedTable?.id === table.id
                      ? 'border-primary-600 bg-white dark:bg-neutral-900 shadow-md'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-neutral-300'
                  }`}
                >
                  {/* Table Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-700 dark:text-neutral-300">
                        #{table.table_number}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                          Table {table.table_number}
                        </h3>
                        <span className="text-[11px] text-neutral-500">
                          {assignedGuests.length} / {table.capacity} seats ({occupancyPct}%)
                        </span>
                      </div>
                    </div>
                    {isFull && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-500/10 text-primary-600">
                        FULL
                      </span>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${getBarColor()} transition-all duration-300`}
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    />
                  </div>

                  {/* Guest Chips inside Table */}
                  <div className="min-h-[64px] flex flex-wrap gap-1.5 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                    {assignedGuests.length === 0 ? (
                      <span className="text-xs text-neutral-400 m-auto py-2">Drop guests here</span>
                    ) : (
                      assignedGuests.map((guest) => (
                        <div
                          key={guest.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, guest.id, table.id)}
                          className="group inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-2xs cursor-grab active:cursor-grabbing hover:border-primary-500"
                        >
                          <GripVertical className="w-3 h-3 text-neutral-400 opacity-60" />
                          <span className="truncate max-w-[100px]">{guest.full_name || `${guest.first_name}`}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveGuest(guest.id, table.id);
                            }}
                            className="text-neutral-400 hover:text-rose-500 ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Unassigned Tray & Detail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Unassigned Tray ({unassignedGuests.length})
            </h2>
          </div>

          <div
            onDragOver={(e) => handleDragOver(e, 'unassigned')}
            onDragLeave={handleDragLeave}
            onDrop={handleDropOnUnassigned}
            className={`p-4 rounded-xl border-2 transition-all bg-white dark:bg-neutral-900 shadow-sm ${
              dragOverTableId === 'unassigned'
                ? 'border-amber-500 bg-amber-500/5'
                : 'border-neutral-200 dark:border-neutral-800'
            }`}
          >
            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter unassigned guests..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Tray list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredUnassigned.length === 0 ? (
                <div className="text-center py-10 text-neutral-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    No unassigned guests!
                  </p>
                  <p className="text-[11px]">All guests have been placed at a table.</p>
                </div>
              ) : (
                filteredUnassigned.map((guest) => (
                  <div
                    key={guest.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, guest.id, null)}
                    className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-neutral-400" />
                      <div>
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
                          {guest.full_name || `${guest.first_name} ${guest.last_name}`}
                        </span>
                        <span className="text-[11px] text-neutral-500 capitalize">
                          {guest.relationship || 'Guest'}
                          {guest.plus_one_name ? ` · +1 (${guest.plus_one_name})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddTableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Armchair className="w-5 h-5 text-primary-500" />
                  Add Reception Table
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTable} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Table Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTableModal(false)}
                    className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingTable}
                    className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50"
                  >
                    {isCreatingTable ? 'Creating...' : 'Create Table'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
