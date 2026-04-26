'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Upload, Info, Filter, ChevronRight, Edit2, Trash2, UserPlus, CheckSquare, Square } from 'lucide-react';
// import GuestRelationshipGraph from '../../../../components/dashboard/GuestRelationshipGraph';
import AddGuestModal from '../../../../components/dashboard/AddGuestModal';
import DeleteGuestModal from '../../../../components/dashboard/DeleteGuestModal';
import GuestLayoutSkeleton from '../../../../components/dashboard/GuestLayoutSkeleton';
import { Guest } from '../../../../types/api';
import { GuestService } from '../../../../services/guests';

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiPage, setApiPage] = useState(1);
  const [totalGuests, setTotalGuests] = useState(0);
  const [sortField, setSortField] = useState('last_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch guests from API
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setIsLoading(true);
        const ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
        // Fetch all guests at once for client-side pagination
        const response = await GuestService.getGuests(1, 1000, ordering, searchQuery);
        // API returns a plain array, not a paginated response
        const guestsArray = Array.isArray(response) ? response : (response.results || []);
        setGuests(guestsArray);
        setTotalGuests(guestsArray.length);
      } catch (err: any) {
        console.error('Error fetching guests:', err);
        setError(err.message || 'Failed to load guests');
        setGuests([]); // Set empty array on error to prevent filter errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuests();
  }, [sortField, sortOrder, searchQuery]);
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [groupKeyword, setGroupKeyword] = useState('');
  const [groupByKeyword, setGroupByKeyword] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'graph'>('table');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [showGuestDetailModal, setShowGuestDetailModal] = useState(false);
  const [selectedGuestForDetail, setSelectedGuestForDetail] = useState<Guest | null>(null);
  const [showGroupGuestsModal, setShowGroupGuestsModal] = useState(false);
  const [selectedGroupForModal, setSelectedGroupForModal] = useState<{ name: string; guests: Guest[] } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    rsvpStatus: 'all',
    side: 'all',
    table: 'all',
    plusOne: 'all',
    mealPreference: 'all'
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle between asc and desc if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to asc
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter guests based on table assignment and advanced filters
  const filteredGuests = (guests || []).filter((guest: Guest) => {
    const matchesTable = selectedTable === 'all' || guest.table?.id?.toString() === selectedTable;

    // Advanced filters
    const matchesRSVP = filters.rsvpStatus === 'all' || guest.rsvp_status?.name === filters.rsvpStatus;
    const matchesSide = filters.side === 'all'; // Side is not in the backend model anymore
    const matchesPlusOne = filters.plusOne === 'all'; // PlusOne is not in the backend model anymore
    const matchesMeal = filters.mealPreference === 'all' ||
      guest.dietary_restrictions?.toLowerCase().includes(filters.mealPreference.toLowerCase());

    return matchesTable && matchesRSVP && matchesSide && matchesPlusOne && matchesMeal;
  });

  // Additional filtering for table view
  const tableFilteredGuests = filteredGuests.filter((guest: Guest) => {
    const matchesTable = selectedTable === 'all' || guest.table?.id?.toString() === selectedTable;
    return matchesTable;
  });

  // Pagination logic
  const totalPages = Math.ceil(tableFilteredGuests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGuests = tableFilteredGuests.slice(startIndex, endIndex);

  // Group guests by keyword
  const getGroupedGuests = () => {
    if (!groupByKeyword || !groupKeyword.trim()) {
      return { 'All Guests': filteredGuests };
    }

    const keyword = groupKeyword.toLowerCase().trim();
    const groups: { [key: string]: Guest[] } = {
      [`Matches "${groupKeyword}"`]: [],
      'Others': []
    };

    filteredGuests.forEach(guest => {
      const matchesKeyword =
        guest.full_name.toLowerCase().includes(keyword) ||
        guest.email.toLowerCase().includes(keyword) ||
        (guest.address && guest.address.toLowerCase().includes(keyword)) ||
        (guest.notes && guest.notes.toLowerCase().includes(keyword));

      if (matchesKeyword) {
        groups[`Matches "${groupKeyword}"`].push(guest);
      } else {
        groups['Others'].push(guest);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  };

  // Calculate statistics
  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvp_status?.name === 'confirmed').length,
    pending: guests.filter(g => g.rsvp_status?.name === 'pending').length,
    declined: guests.filter(g => g.rsvp_status?.name === 'declined').length,
    tentative: 0
  };

  // Calculate table counts
  const tableCounts = guests.reduce((acc, guest) => {
    const table = guest.table ? `Table ${guest.table.table_number}` : 'Unassigned';
    acc[table] = (acc[table] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAddGuest = () => {
    setEditingGuest(null); // null indicates we're adding a new guest
    setShowAddGuestModal(true);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setShowAddGuestModal(true);
  };

  const handleSaveGuest = async (guest: Guest) => {
    // Refetch guest list to get complete data including full_name from backend
    try {
      setIsLoading(true);
      const ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
      // Fetch all guests at once for client-side pagination
      const response = await GuestService.getGuests(1, 1000, ordering, searchQuery);
      const guestsArray = Array.isArray(response) ? response : (response.results || []);
      setGuests(guestsArray);
      setTotalGuests(guestsArray.length);
    } catch (err: any) {
      console.error('Error refetching guests:', err);
      // Fallback to updating local state if refetch fails
      if (editingGuest) {
        setGuests(guests.map(g => g.id === editingGuest.id ? guest : g));
      } else {
        setGuests([...guests, guest]);
      }
    } finally {
      setIsLoading(false);
    }
    setShowAddGuestModal(false);
    setEditingGuest(null);
  };

  const handleDeleteGuest = (guest: Guest) => {
    setGuestToDelete(guest);
    setShowDeleteModal(true);
  };

  const confirmDeleteGuest = async () => {
    if (!guestToDelete) return;

    setIsDeleting(true);
    try {
      await GuestService.deleteGuest(guestToDelete.id);
      setGuests(guests.filter(g => g.id !== guestToDelete.id));
      if (editingGuest?.id === guestToDelete.id) {
        setEditingGuest(null);
        setShowAddGuestModal(false);
      }
      setShowDeleteModal(false);
      setGuestToDelete(null);
    } catch (err: any) {
      console.error('Error deleting guest:', err);
      alert(err.message || 'Failed to delete guest');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleGuestSelection = (guestId: number) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map(g => g.id));
    }
  };

  const handleRemoveGuest = (guestId: number) => {
    if (confirm(`Are you sure you want to remove ${guestId} from the list?`)) {
      setGuests(prev => prev.filter(g => g.id !== guestId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedGuests.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedGuests.length} guest(s)?`)) {
      setGuests(guests.filter(g => !selectedGuests.includes(g.id)));
      setSelectedGuests([]);
    }
  };

  const handleBulkRearrange = (newTableId: number) => {
    if (selectedGuests.length === 0) return;

    setGuests(guests.map(g =>
      selectedGuests.includes(g.id) ? { ...g, table_id: newTableId } : g
    ));
    setSelectedGuests([]);
  };

  // Pagination navigation functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Filter handling functions
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const clearFilters = () => {
    setFilters({
      rsvpStatus: 'all',
      side: 'all',
      table: 'all',
      plusOne: 'all',
      mealPreference: 'all'
    });
    setCurrentPage(1);
  };

  if (isLoading) {
    return <GuestLayoutSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            <span className="text-glow">Guest List Manager</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Organize and manage your wedding guest list efficiently
          </p>
        </motion.div>


        {/* View Toggle Segmented Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center mb-8 px-4"
        >
          <div className="inline-flex bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${viewMode === 'table'
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
            >
              <span className="hidden xs:inline">Table</span>
              <span className="xs:hidden">Tbl</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${viewMode === 'card'
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
            >
              <span className="hidden xs:inline">Card</span>
              <span className="xs:hidden">Crd</span>
            </button>
            <button
              onClick={() => {
                if (viewMode === 'graph') {
                  setShowGraphModal(true);
                } else {
                  setViewMode('graph');
                }
              }}
              className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${viewMode === 'graph'
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
            >
              <span className="hidden xs:inline">Graph</span>
              <span className="xs:hidden">Grph</span>
            </button>
          </div>
        </motion.div>

        {/* Guest List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-card p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">
                Guests
              </h2>
              {selectedGuests.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">
                    {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="btn-secondary btn-sm text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete Selected
                  </button>
                  <select
                    onChange={(e) => {
                      const tableId = Number(e.target.value);
                      if (!isNaN(tableId)) {
                        handleBulkRearrange(tableId);
                      }
                    }}
                    className="px-3 py-1 bg-surface border border-white/20 rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="">Move to table...</option>
                    {[1, 2, 3].map(tableId => (
                      <option key={tableId} value={tableId}>Table {tableId}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={handleAddGuest}
                  className="btn-secondary flex items-center gap-1 px-2 py-1 text-sm"
                >
                  <UserPlus size={12} className="mr-1" />
                  Add Guest
                </button>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="btn-secondary flex items-center gap-1 px-2 py-1 text-sm"
                >
                  <Filter size={12} className="mr-1" />
                  Filters
                </button>
                <button
                  onClick={handleSelectAll}
                  className="btn-secondary flex items-center gap-1 px-2 py-1 text-sm"
                >
                  {selectedGuests.length === filteredGuests.length ? (
                    <><Square size={12} className="mr-1" />Deselect All</>
                  ) : (
                    <><CheckSquare size={12} className="mr-1" />Select All</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Guest Display */}
          {viewMode === 'table' ? (
            <div className="space-y-6">
              {/* Items per page control */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-muted">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className="px-3 py-2 bg-surface border border-white/20 rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-text-muted">per page</span>
                </div>

                {/* Search bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search guests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 bg-surface border border-white/20 rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary w-64"
                  />
                </div>

                {/* Pagination info */}
                <div className="text-sm text-text-muted">
                  Showing {paginatedGuests.length} of {tableFilteredGuests.length} guests
                </div>
              </div>

              {Object.entries(getGroupedGuests()).map(([groupName, groupGuests], groupIndex) => (
                <div key={groupName}>
                  {Object.keys(getGroupedGuests()).length > 1 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {groupName} ({groupGuests.length})
                      </h3>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">
                            <button
                              onClick={handleSelectAll}
                              className="flex items-center gap-2 hover:text-primary transition-colors"
                            >
                              {selectedGuests.length === filteredGuests.length && filteredGuests.length > 0 ? (
                                <CheckSquare size={18} />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                          </th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">
                            <button
                              onClick={() => handleSort('full_name')}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              Name
                              {sortField === 'full_name' && (
                                <span className="text-xs">
                                  {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">
                            <button
                              onClick={() => handleSort('email')}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              Email
                              {sortField === 'email' && (
                                <span className="text-xs">
                                  {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">
                            <button
                              onClick={() => handleSort('phone')}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              Phone
                              {sortField === 'phone' && (
                                <span className="text-xs">
                                  {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">
                            <button
                              onClick={() => handleSort('table')}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              Table
                              {sortField === 'table' && (
                                <span className="text-xs">
                                  {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">
                            <button
                              onClick={() => handleSort('rsvp_status')}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              RSVP
                              {sortField === 'rsvp_status' && (
                                <span className="text-xs">
                                  {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">Meals</th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedGuests.map((guest, index) => (
                          <motion.tr
                            key={guest.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`border-b border-white/10 hover:bg-white/5 ${selectedGuests.includes(guest.id) ? 'bg-primary/10' : ''
                              }`}
                          >
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleGuestSelection(guest.id)}
                                className="flex items-center gap-2 hover:text-primary transition-colors"
                              >
                                {selectedGuests.includes(guest.id) ? (
                                  <CheckSquare size={18} className="text-primary" />
                                ) : (
                                  <Square size={18} className="text-text-muted" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {guest.full_name?.charAt(0) || '?'}
                                  </span>
                                </div>
                                <span className="text-text-primary">{guest.full_name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-text-muted">{guest.email}</td>
                            <td className="px-6 py-4 text-text-muted">{guest.phone}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-primary">
                                {guest.table ? `Table ${guest.table.table_number}` : 'Unassigned'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                guest.rsvp_status?.name === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                guest.rsvp_status?.name === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                guest.rsvp_status?.name === 'declined' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {guest.rsvp_status?.name ? guest.rsvp_status.name.charAt(0).toUpperCase() + guest.rsvp_status.name.slice(1) : 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {guest.meal_preferences && guest.meal_preferences.length > 0 && (
                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">
                                  {guest.meal_preferences.length} meal{guest.meal_preferences.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditGuest(guest)}
                                  className="btn-secondary btn-sm"
                                >
                                  <Edit2 size={14} className="mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteGuest(guest)}
                                  className="btn-secondary btn-sm text-red-400 hover:text-red-300"
                                >
                                  <Trash2 size={14} className="mr-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <p className="text-sm text-text-secondary">Rearrange to:</p>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleBulkRearrange(1)}
                                    className="px-3 py-1 bg-surface border border-white/20 rounded-lg text-sm hover:bg-white/10 transition-colors"
                                  >
                                    Table 1
                                  </button>
                                  <button
                                    onClick={() => handleBulkRearrange(2)}
                                    className="px-3 py-1 bg-surface border border-white/20 rounded-lg text-sm hover:bg-white/10 transition-colors"
                                  >
                                    Table 2
                                  </button>
                                  <button
                                    onClick={() => handleBulkRearrange(3)}
                                    className="px-3 py-1 bg-surface border border-white/20 rounded-lg text-sm hover:bg-white/10 transition-colors"
                                  >
                                    Table 3
                                  </button>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Card View - Simplified Group Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-3 lg:gap-6">
              {Object.entries(getGroupedGuests()).map(([groupName, groupGuests]) => (
                <motion.div
                  key={groupName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="glass-card p-4 sm:p-3 lg:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedGroupForModal({ name: groupName, guests: groupGuests });
                    setShowGroupGuestsModal(true);
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      {groupName}
                    </h3>
                    <span className="text-sm text-text-muted bg-white/10 px-2 py-1 rounded-full">
                      {groupGuests.length} guests
                    </span>
                  </div>

                  {/* Top 3 Guest Names Only */}
                  <div className="space-y-2">
                    {groupGuests.slice(0, 3).map((guest, index) => (
                      <div key={guest.id} className="flex items-center gap-2 text-text-primary">
                        <span className="text-text-muted text-sm">{index + 1}.</span>
                        <span className="font-medium">{guest.full_name || 'Unknown'}</span>
                      </div>
                    ))}
                    {groupGuests.length > 3 && (
                      <div className="text-text-muted text-sm italic pt-1">
                        +{groupGuests.length - 3} more guests...
                      </div>
                    )}
                  </div>

                  {/* Click hint */}
                  <div className="mt-4 pt-3 border-t border-white/10 text-center">
                    <span className="text-sm text-primary">Click to view all</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
                    ? 'bg-surface text-text-muted cursor-not-allowed'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${page === currentPage
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-surface text-text-muted cursor-not-allowed'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </motion.div>

      </div>

      {/* Absolute Positioned Import/Export Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowImportExportModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Import/Export</span>
          <span className="sm:hidden">I/E</span>
        </button>
      </div>

      {/* Import/Export Modal */}
      {showImportExportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowImportExportModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-white/20 rounded-xl max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-text-primary">
                Import/Export Options
              </h2>
              <button
                onClick={() => setShowImportExportModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Import Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Import Guests</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Choose CSV File
                      </label>
                      <input
                        type="file"
                        accept=".csv"
                        className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <button className="btn-primary w-full">
                      <Upload size={16} className="mr-2" />
                      Upload CSV
                    </button>
                  </div>
                </div>

                {/* Export Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Export Guests</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Export Format
                      </label>
                      <select className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <option value="csv">CSV File</option>
                        <option value="json">JSON File</option>
                        <option value="excel">Excel File</option>
                      </select>
                    </div>
                    <button className="btn-primary w-full">
                      <Download size={16} className="mr-2" />
                      Download Guest List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={showAddGuestModal}
        onClose={() => {
          setShowAddGuestModal(false);
          setEditingGuest(null);
        }}
        onGuestAdded={handleSaveGuest}
        existingGuests={guests}
        editingGuest={editingGuest}
      />

      {/* Delete Guest Modal */}
      <DeleteGuestModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setGuestToDelete(null);
        }}
        onConfirm={confirmDeleteGuest}
        guestName={guestToDelete?.full_name || ''}
        isDeleting={isDeleting}
      />

      {/* Graph Modal */}
      {showGraphModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowGraphModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-white/20 rounded-xl max-w-6xl w-full max-h-[45vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-text-primary">
                Guest Relationship Graph
              </h2>
              <button
                onClick={() => setShowGraphModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* <GuestRelationshipGraph /> */}
              <div className="text-center text-text-muted">
                Graph view temporarily disabled for build
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Guest Detail Modal */}
      {showGuestDetailModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowGuestDetailModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-white/20 rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-text-primary">
                Guest Details
              </h2>
              <button
                onClick={() => setShowGuestDetailModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Guest Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                      {selectedGuestForDetail?.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {selectedGuestForDetail?.full_name}
                    </h3>
                    <div className="text-sm text-text-muted space-y-2">
                      <div>Guest #{selectedGuestForDetail?.id}</div>
                      <div>Email: {selectedGuestForDetail?.email}</div>
                      <div>Phone: {selectedGuestForDetail?.phone}</div>
                      <div>Table: {selectedGuestForDetail?.table ? `Table ${selectedGuestForDetail.table.table_number}` : 'Unassigned'}</div>
                      <div>RSVP: {selectedGuestForDetail?.rsvp_status?.name}</div>
                      <div>Relationship: {selectedGuestForDetail?.relationship}</div>
                      {selectedGuestForDetail?.dietary_restrictions && <div>Dietary Restrictions: {selectedGuestForDetail?.dietary_restrictions}</div>}
                      {selectedGuestForDetail?.meal_preferences && selectedGuestForDetail.meal_preferences.length > 0 && (
                        <div>Meals: {selectedGuestForDetail.meal_preferences.map(m => m.name).join(', ')}</div>
                      )}
                      {selectedGuestForDetail?.address && <div>Address: {selectedGuestForDetail?.address}</div>}
                      {selectedGuestForDetail?.notes && <div>Notes: {selectedGuestForDetail?.notes}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    if (selectedGuestForDetail) {
                      handleDeleteGuest(selectedGuestForDetail);
                      setShowGuestDetailModal(false);
                      setSelectedGuestForDetail(null);
                    }
                  }}
                  className="btn-secondary text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Guest
                </button>
                <button
                  onClick={() => {
                    if (selectedGuestForDetail) {
                      handleEditGuest(selectedGuestForDetail);
                    }
                    setShowGuestDetailModal(false);
                    setSelectedGuestForDetail(null);
                  }}
                  className="btn-secondary"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit Guest
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowFilterModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-text-primary">
                Filter Guests
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>



            {/* Filter Actions */}
            <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Expanded Card Modal */}
      {expandedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedCard(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-white/20 rounded-xl max-w-2xl w-full max-h-[45vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-text-primary">
                {expandedCard}
              </h2>
              <button
                onClick={() => setExpandedCard(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {getGroupedGuests()[expandedCard]?.map((guest) => (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {guest.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">
                            {guest.full_name || 'Unknown'}
                          </h3>
                          <div className="text-sm text-text-muted space-y-1">
                            <div>{guest.email}</div>
                            <div>{guest.phone}</div>
                            {guest.address && <div>{guest.address}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-primary">
                            {guest.table ? `Table ${guest.table.table_number}` : 'Unassigned'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            guest.rsvp_status?.name === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            guest.rsvp_status?.name === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            guest.rsvp_status?.name === 'declined' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {guest.rsvp_status?.name ? guest.rsvp_status.name.charAt(0).toUpperCase() + guest.rsvp_status.name.slice(1) : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleDeleteGuest(guest);
                              setExpandedCard(null);
                            }}
                            className="btn-secondary btn-sm text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {guest.dietary_restrictions && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <span className="text-sm text-text-muted">Dietary Restrictions: </span>
                        <span className="text-sm text-text-primary">{guest.dietary_restrictions}</span>
                      </div>
                    )}

                    {guest.notes && (
                      <div className="mt-2">
                        <span className="text-sm text-text-muted">Notes: </span>
                        <span className="text-sm text-text-primary">{guest.notes}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Group Guests Modal */}
      {showGroupGuestsModal && selectedGroupForModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowGroupGuestsModal(false);
            setSelectedGroupForModal(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-white/20 rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-text-primary">
                {selectedGroupForModal.name}
                <span className="text-lg text-text-muted ml-2">
                  ({selectedGroupForModal.guests.length} guests)
                </span>
              </h2>
              <button
                onClick={() => {
                  setShowGroupGuestsModal(false);
                  setSelectedGroupForModal(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} className="text-text-muted" />
              </button>
            </div>

            {/* Guest List */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedGroupForModal.guests.map((guest, index) => (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {guest.full_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary truncate">
                          {guest.full_name || 'Unknown'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            guest.rsvp_status?.name === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            guest.rsvp_status?.name === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            guest.rsvp_status?.name === 'declined' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {guest.rsvp_status?.name ? guest.rsvp_status.name.charAt(0).toUpperCase() + guest.rsvp_status.name.slice(1) : 'Unknown'}
                          </span>
                        </div>
                        <div className="text-sm text-text-muted mt-1">
                          {guest.table ? `Table ${guest.table.table_number}` : 'Unassigned'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => {
                  setShowGroupGuestsModal(false);
                  setSelectedGroupForModal(null);
                }}
                className="w-full btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
