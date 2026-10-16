'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Upload, 
  Download, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  Armchair,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

import AddGuestModal from '../../../../components/dashboard/AddGuestModal';
import DeleteGuestModal from '../../../../components/dashboard/DeleteGuestModal';
import GuestLayoutSkeleton from '../../../../components/dashboard/GuestLayoutSkeleton';
import { 
  GuestTable, 
  GuestFilters, 
  BulkActionBar, 
  GuestImportModal, 
  DuplicateMergeModal 
} from '../../../../components/dashboard/guests';
import { Guest, GuestGroup, Table } from '../../../../types/api';
import { GuestService } from '../../../../services/guests';

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<GuestGroup[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting & Filtering
  const [sortField, setSortField] = useState('last_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    rsvpStatus: string;
    relationship: string;
    dietaryRestrictions: string;
    groupId?: string;
  }>({
    rsvpStatus: 'all',
    relationship: 'all',
    dietaryRestrictions: '',
    groupId: 'all',
  });
  const [selectedTable, setSelectedTable] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'graph'>('table');

  // Selection
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modals
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Initial load & options
  const fetchOptions = async () => {
    try {
      const [groupsData, tablesData] = await Promise.all([
        GuestService.getGroups(),
        GuestService.getAllTables(),
      ]);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setTables(Array.isArray(tablesData) ? tablesData : []);
    } catch (err) {
      console.error('Error fetching guest options:', err);
    }
  };

  const fetchGuests = async () => {
    try {
      setIsLoading(true);
      const ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
      const response = await GuestService.getGuests(
        1,
        1000,
        ordering,
        searchQuery,
        filters.rsvpStatus,
        filters.relationship,
        selectedTable
      );
      const guestsArray = Array.isArray(response) ? response : (response.results || []);
      setGuests(guestsArray);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching guests:', err);
      setError(err.message || 'Failed to load guests');
      setGuests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [sortField, sortOrder, searchQuery, filters.rsvpStatus, filters.relationship, selectedTable]);

  // Client-side filtering by group (if groupId is set)
  const filteredGuests = useMemo(() => {
    if (!filters.groupId || filters.groupId === 'all') {
      return guests;
    }
    const gId = Number(filters.groupId);
    return guests.filter((g) => g.group_id === gId || g.group?.id === gId);
  }, [guests, filters.groupId]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGuests = filteredGuests.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectGuest = (id: number) => {
    setSelectedGuests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map((g) => g.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedGuests([]);
  };

  // Bulk Actions
  const handleBulkRsvpUpdate = async (status: string) => {
    if (selectedGuests.length === 0) return;
    try {
      await GuestService.bulkUpdate(selectedGuests, { rsvp_status: status as any });
      toast.success(`Updated RSVP status for ${selectedGuests.length} guests`);
      setSelectedGuests([]);
      fetchGuests();
    } catch (err) {
      toast.error('Failed to update RSVP status');
    }
  };

  const handleBulkTableAssign = async (tableId: number | null) => {
    if (selectedGuests.length === 0) return;
    try {
      await GuestService.bulkUpdate(selectedGuests, { table_id: tableId });
      toast.success(`Updated table assignment for ${selectedGuests.length} guests`);
      setSelectedGuests([]);
      fetchGuests();
      fetchOptions();
    } catch (err) {
      toast.error('Failed to update table assignment');
    }
  };

  const handleBulkGroupAssign = async (groupId: number | null) => {
    if (selectedGuests.length === 0) return;
    try {
      await GuestService.bulkUpdate(selectedGuests, { group_id: groupId });
      toast.success(`Updated group for ${selectedGuests.length} guests`);
      setSelectedGuests([]);
      fetchGuests();
      fetchOptions();
    } catch (err) {
      toast.error('Failed to update guest group');
    }
  };

  const handleSendInvitations = async () => {
    if (selectedGuests.length === 0) return;
    try {
      await GuestService.sendInvitations(selectedGuests);
      toast.success(`Invitations sent to ${selectedGuests.length} guests`);
      setSelectedGuests([]);
      fetchGuests();
    } catch (err) {
      toast.error('Failed to send invitations');
    }
  };

  const handleScheduleReminders = async (scheduledFor: string) => {
    if (selectedGuests.length === 0) return;
    try {
      const res = await GuestService.scheduleReminders(selectedGuests, scheduledFor);
      toast.success(`Scheduled ${res.scheduled_count} RSVP reminder(s)`);
      setSelectedGuests([]);
    } catch (err) {
      toast.error('Failed to schedule reminders');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGuests.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedGuests.length} guests?`)) return;
    try {
      for (const id of selectedGuests) {
        await GuestService.deleteGuest(id);
      }
      toast.success(`Deleted ${selectedGuests.length} guests`);
      setSelectedGuests([]);
      fetchGuests();
    } catch (err) {
      toast.error('Failed to delete some guests');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const blob = await GuestService.exportGuests(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guests_export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported guest list as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to export guests');
    }
  };

  const handleDeleteSingle = async (guest: Guest) => {
    setGuestToDelete(guest);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!guestToDelete) return;
    try {
      await GuestService.deleteGuest(guestToDelete.id);
      toast.success('Guest removed');
      setShowDeleteModal(false);
      setGuestToDelete(null);
      fetchGuests();
    } catch (err) {
      toast.error('Failed to delete guest');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Guest List
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage invitations, RSVPs, dietary restrictions, and seating for {guests.length} guests.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDuplicateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors shadow-xs"
            title="Scan duplicate guests"
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Check Duplicates</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingGuest(null);
              setShowAddGuestModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-500 text-white transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <GuestFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
        onResetFilters={() => {
          setSearchQuery('');
          setFilters({ rsvpStatus: 'all', relationship: 'all', dietaryRestrictions: '', groupId: 'all' });
          setSelectedTable('all');
        }}
        selectedTable={selectedTable}
        onTableChange={setSelectedTable}
        groups={groups}
        tables={tables}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Guest Data Display */}
      {isLoading ? (
        <GuestLayoutSkeleton />
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchGuests}
            className="mt-3 px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-500"
          >
            Retry
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <GuestTable
          guests={paginatedGuests}
          selectedGuests={selectedGuests}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onSelectGuest={handleSelectGuest}
          onSelectAll={handleSelectAll}
          onEditGuest={(guest) => {
            setEditingGuest(guest);
            setShowAddGuestModal(true);
          }}
          onDeleteGuest={handleDeleteSingle}
        />
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedGuests.length === 0 ? (
            <div className="col-span-full p-12 text-center text-neutral-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No guests found</p>
            </div>
          ) : (
            paginatedGuests.map((guest) => {
              const isSelected = selectedGuests.includes(guest.id);
              return (
                <div
                  key={guest.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/5'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                        {guest.full_name || `${guest.first_name} ${guest.last_name}`}
                      </h3>
                      <div className="text-xs text-neutral-500 space-y-0.5 mt-1">
                        {guest.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{guest.email}</div>}
                        {guest.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{guest.phone}</div>}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {guest.rsvp_status?.name || 'Pending'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Armchair className="w-3.5 h-3.5" />
                      {guest.table ? `Table ${guest.table.table_number}` : 'No table'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGuest(guest);
                        setShowAddGuestModal(true);
                      }}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {filteredGuests.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-neutral-500">
          <div>
            Showing <span className="font-semibold text-neutral-800 dark:text-neutral-200">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {Math.min(startIndex + itemsPerPage, filteredGuests.length)}
            </span>{' '}
            of <span className="font-semibold text-neutral-800 dark:text-neutral-200">{filteredGuests.length}</span> guests
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedGuests.length}
        onClearSelection={handleClearSelection}
        onBulkRsvpUpdate={handleBulkRsvpUpdate}
        onBulkTableAssign={handleBulkTableAssign}
        onBulkGroupAssign={handleBulkGroupAssign}
        onSendInvitations={handleSendInvitations}
        onScheduleReminders={handleScheduleReminders}
        onBulkDelete={handleBulkDelete}
        tables={tables}
        groups={groups}
      />

      {/* Modals */}
      <AddGuestModal
        isOpen={showAddGuestModal}
        onClose={() => {
          setShowAddGuestModal(false);
          setEditingGuest(null);
        }}
        onGuestAdded={() => {
          fetchGuests();
          fetchOptions();
        }}
        editingGuest={editingGuest}
      />

      <DeleteGuestModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setGuestToDelete(null);
        }}
        onConfirm={confirmDelete}
        guestName={guestToDelete?.full_name || `${guestToDelete?.first_name || ''} ${guestToDelete?.last_name || ''}`}
      />

      <GuestImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          fetchGuests();
          fetchOptions();
        }}
      />

      <DuplicateMergeModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        onMerged={() => {
          fetchGuests();
        }}
      />
    </div>
  );
}
