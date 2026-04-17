'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Upload, Info, Filter, ChevronRight, Edit2, Trash2, UserPlus, CheckSquare, Square } from 'lucide-react';
import GuestRelationshipGraph from '../../../../components/dashboard/GuestRelationshipGraph';
import AddGuestModal from '../../../../components/dashboard/AddGuestModal';
import { Guest } from '../../../../types/guest';

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([
    { 
      id: 1, 
      name: 'Emily Johnson', 
      email: 'emily@email.com', 
      phone: '+1-555-0123', 
      whatsapp: '+1-555-0123',
      table: 'A1', 
      side: 'Bride', 
      plusOne: true,
      rsvpStatus: 'confirmed',
      mealPreference: 'vegetarian',
      address: '123 Main St, City, State 12345',
      notes: 'Bridesmaid - needs special dietary accommodations'
    },
    { 
      id: 2, 
      name: 'Michael Smith', 
      email: 'michael@email.com', 
      phone: '+1-555-0456', 
      whatsapp: '',
      table: 'A2', 
      side: 'Groom', 
      plusOne: false,
      rsvpStatus: 'pending',
      mealPreference: 'none',
      address: '456 Oak Ave, City, State 67890'
    },
    { 
      id: 3, 
      name: 'Jessica Davis', 
      email: 'jessica@email.com', 
      phone: '+1-555-0789', 
      whatsapp: '',
      table: 'A3', 
      side: 'Bride', 
      plusOne: false,
      rsvpStatus: 'declined',
      mealPreference: 'gluten-free',
      address: '789 Pine St, City, State 54321'
    },
    { 
      id: 4, 
      name: 'Robert Wilson', 
      email: 'robert@email.com', 
      phone: '+1-555-0321', 
      whatsapp: '',
      table: 'B1', 
      side: 'Groom', 
      plusOne: false,
      rsvpStatus: 'pending',
      mealPreference: 'vegan',
      address: '321 Elm St, City, State 98765'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    rsvpStatus: 'all',
    side: 'all',
    table: 'all',
    plusOne: 'all',
    mealPreference: 'all'
  });

  // Filter guests based on search, table assignment, and advanced filters
  const filteredGuests = guests.filter((guest: Guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.phone.includes(searchQuery);
    const matchesTable = selectedTable === 'all' || guest.table === selectedTable;
    
    // Advanced filters
    const matchesRSVP = filters.rsvpStatus === 'all' || guest.rsvpStatus === filters.rsvpStatus;
    const matchesSide = filters.side === 'all' || guest.side === filters.side;
    const matchesPlusOne = filters.plusOne === 'all' || 
      (filters.plusOne === 'yes' && guest.plusOne) || 
      (filters.plusOne === 'no' && !guest.plusOne);
    const matchesMeal = filters.mealPreference === 'all' || 
      guest.mealPreference?.toLowerCase().includes(filters.mealPreference.toLowerCase());
    
    return matchesSearch && matchesTable && matchesRSVP && matchesSide && matchesPlusOne && matchesMeal;
  });

  // Additional filtering for table view
  const tableFilteredGuests = filteredGuests.filter((guest: Guest) => {
    const matchesTableSearch = !tableSearchQuery || 
      guest.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
      guest.phone.includes(tableSearchQuery);
    return matchesTableSearch;
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
        guest.name.toLowerCase().includes(keyword) ||
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
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    tentative: 0
  };

  const handleAddGuest = () => {
    setEditingGuest({
      id: guests.length + 1,
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      table: 'A1',
      side: 'Bride',
      plusOne: false,
      rsvpStatus: 'pending',
      mealPreference: '',
      address: '',
      notes: ''
    });
    setShowAddGuestModal(true);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setShowAddGuestModal(true);
  };

  const handleSaveGuest = (guest: Omit<Guest, 'id'>) => {
    if (editingGuest) {
      setGuests(guests.map(g => g.id === editingGuest.id ? { ...guest, id: editingGuest.id } : g));
    } else {
      setGuests([...guests, { ...guest, id: guests.length + 1 }]);
    }
    setShowAddGuestModal(false);
    setEditingGuest(null);
  };

  const handleDeleteGuest = (guestId: number) => {
    setGuests(guests.filter(g => g.id !== guestId));
    if (editingGuest?.id === guestId) {
      setEditingGuest(null);
      setShowAddGuestModal(false);
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

  const handleBulkDelete = () => {
    if (selectedGuests.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedGuests.length} guest(s)?`)) {
      setGuests(guests.filter(g => !selectedGuests.includes(g.id)));
      setSelectedGuests([]);
    }
  };

  const handleBulkRearrange = (newTable: string) => {
    if (selectedGuests.length === 0) return;
    
    setGuests(guests.map(g => 
      selectedGuests.includes(g.id) ? { ...g, table: newTable } : g
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

        {/* Stats and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Import/Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">Import/Export</h3>
            <div className="flex gap-3">
              <button className="flex-1 btn-secondary">
                <Download size={16} className="mr-2" />
                Import CSV
              </button>
              <button className="flex-1 btn-secondary">
                <Upload size={16} className="mr-2" />
                Export CSV
              </button>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">Search Guests</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
            />
          </motion.div>

          {/* Table Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">Table Assignment</h3>
            <div className="flex gap-2">
              {['all', 'A1', 'A2', 'A3', 'B1'].map((table) => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTable === table
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {table === 'all' ? 'All Tables' : `Table ${table.slice(1)}`}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Guest Grouping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Guest Grouping</h3>
              <div className="relative group">
                <Info size={16} className="text-text-muted cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-surface border border-white/20 rounded-lg text-sm text-text-secondary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="font-semibold mb-2">Examples of grouping keywords:</div>
                  <ul className="space-y-1">
                    <li>• Family name: "Smith", "Johnson"</li>
                    <li>• Location: "New York", "California"</li>
                    <li>• Relationship: "friend", "colleague"</li>
                    <li>• Custom group: "college", "work"</li>
                  </ul>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-surface border-r border-t border-white/20"></div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={groupKeyword}
                  onChange={(e) => setGroupKeyword(e.target.value)}
                  placeholder="Enter grouping keyword..."
                  className="flex-1 px-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => setGroupByKeyword(!groupByKeyword)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    groupByKeyword && groupKeyword.trim()
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {groupByKeyword ? 'Grouped' : 'Group'}
                </button>
              </div>
              {groupByKeyword && groupKeyword.trim() && (
                <div className="text-sm text-text-muted">
                  Grouping by keyword: <span className="text-primary font-medium">"{groupKeyword}"</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

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
              className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <span className="hidden xs:inline">Table</span>
              <span className="xs:hidden">Tbl</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${
                viewMode === 'card'
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
              className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${
                viewMode === 'graph'
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
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-text-primary">
                Guest List ({filteredGuests.length})
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
                      const table = e.target.value;
                      if (table && table !== '') {
                        handleBulkRearrange(table);
                      }
                    }}
                    className="px-3 py-1 bg-surface border border-white/20 rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="">Move to table...</option>
                    {['A1', 'A2', 'A3', 'B1'].map(table => (
                      <option key={table} value={table}>Table {table.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleAddGuest}
                className="btn-secondary"
              >
                <UserPlus size={16} className="mr-2" />
                Add Guest
              </button>
              <button 
                onClick={() => setShowFilterModal(true)}
                className="btn-secondary"
              >
                <Filter size={16} className="mr-2" />
                Filters
              </button>
              <button 
                onClick={handleSelectAll}
                className="btn-secondary"
              >
                {selectedGuests.length === filteredGuests.length ? (
                  <><Square size={16} className="mr-2" />Deselect All</>
                ) : (
                  <><CheckSquare size={16} className="mr-2" />Select All</>
                )}
              </button>
            </div>
          </div>

          {/* Guest Display */}
          {viewMode === 'table' ? (
            <div className="space-y-6">
              {/* Table Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  placeholder="Search guests in table..."
                  className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
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
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">Name</th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">Email</th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">Phone</th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">Table</th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">Side</th>
                          <th className="text-left px-6 py-3 text-text-primary font-semibold">+1</th>
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
                            className={`border-b border-white/10 hover:bg-white/5 ${
                              selectedGuests.includes(guest.id) ? 'bg-primary/10' : ''
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
                                    {guest.name.charAt(0)}
                                  </span>
                                </div>
                                <span className="text-text-primary">{guest.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-text-muted">{guest.email}</td>
                            <td className="px-6 py-4 text-text-muted">{guest.phone}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-primary">
                                {guest.table}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                guest.side === 'Bride' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {guest.side}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {guest.plusOne && (
                                <span className="px-3 py-1 bg-gold text-white rounded-full text-xs">
                                  +1
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
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${guest.name}?`)) {
                                      handleDeleteGuest(guest.id);
                                    }
                                  }}
                                  className="btn-secondary btn-sm text-red-400 hover:text-red-300"
                                >
                                  <Trash2 size={14} className="mr-1" />
                                  Delete
                                </button>
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
            /* Card View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-3 lg:gap-6">
              {Object.entries(getGroupedGuests()).map(([groupName, groupGuests]) => (
                <motion.div
                  key={groupName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="glass-card p-4 sm:p-3 lg:p-6 hover:shadow-lg transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      {groupName}
                      <span className="text-sm text-text-muted ml-2">({groupGuests.length})</span>
                    </h3>
                    <button
                      onClick={() => setExpandedCard(expandedCard === groupName ? null : groupName)}
                      className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
                      title={expandedCard === groupName ? "Collapse" : "Expand"}
                    >
                      {expandedCard === groupName ? <ChevronRight size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>

                  {/* Guest Cards Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {groupGuests.slice(0, expandedCard === groupName ? 6 : 5).map((guest, index) => (
                      <motion.div
                        key={guest.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-surface border border-white/20 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          handleEditGuest(guest);
                          setExpandedCard(null);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {guest.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-text-primary truncate">{guest.name}</div>
                            <div className="text-sm text-text-muted truncate">{guest.table}</div>
                            <div className="text-xs text-text-muted truncate">
                              {guest.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {guest.plusOne && (
                            <span className="px-2 py-1 bg-gold text-white rounded-full text-xs">
                              +1
                            </span>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${guest.name}?`)) {
                                handleDeleteGuest(guest.id);
                              }
                            }}
                            className="text-text-muted hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                            title="Delete guest"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Show More/Less Button */}
                  {groupGuests.length > (expandedCard === groupName ? 6 : 5) && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setExpandedCard(expandedCard === groupName ? null : groupName)}
                        className="text-primary hover:text-primary/80 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                      >
                        {expandedCard === groupName ? 'Show Less' : 'Show ' + (groupGuests.length - (expandedCard === groupName ? 6 : 5)) + ' More'}
                      </button>
                    </div>
                  )}
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
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1 
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
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      page === currentPage
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
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages 
                    ? 'bg-surface text-text-muted cursor-not-allowed' 
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </motion.div>

        {/* TODO: Add seating chart integration */}
        {/* TODO: Add meal preference management */}
        {/* TODO: Add RSVP tracking */}
        {/* TODO: Add guest grouping */}
        {/* TODO: Add address management */}
      </div>
      
      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={showAddGuestModal}
        onClose={() => {
          setShowAddGuestModal(false);
          setEditingGuest(null);
        }}
        onAddGuest={handleSaveGuest}
        existingGuests={guests}
        editingGuest={editingGuest}
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
              <GuestRelationshipGraph />
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
            className="bg-surface border border-white/20 rounded-xl max-w-2xl w-full max-h-[45vh] flex flex-col"
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
            
            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Status & Assignment</h3>
                
                {/* RSVP Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    RSVP Status
                  </label>
                  <select
                    value={filters.rsvpStatus}
                    onChange={(e) => handleFilterChange('rsvpStatus', e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                
                {/* Side Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Side
                  </label>
                  <select
                    value={filters.side}
                    onChange={(e) => handleFilterChange('side', e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Sides</option>
                    <option value="Bride">Bride</option>
                    <option value="Groom">Groom</option>
                  </select>
                </div>
                
                {/* Table Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Table Assignment
                  </label>
                  <select
                    value={filters.table}
                    onChange={(e) => handleFilterChange('table', e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Tables</option>
                    <option value="A1">Table A1</option>
                    <option value="A2">Table A2</option>
                    <option value="A3">Table A3</option>
                    <option value="B1">Table B1</option>
                  </select>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Additional Filters</h3>
                
                {/* Plus One Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Plus One
                  </label>
                  <select
                    value={filters.plusOne}
                    onChange={(e) => handleFilterChange('plusOne', e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Guests</option>
                    <option value="yes">With Plus One</option>
                    <option value="no">Without Plus One</option>
                  </select>
                </div>
                
                {/* Meal Preference Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Meal Preference
                  </label>
                  <input
                    type="text"
                    value={filters.mealPreference === 'all' ? '' : filters.mealPreference}
                    onChange={(e) => handleFilterChange('mealPreference', e.target.value || 'all')}
                    placeholder="Enter meal preference..."
                    className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
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
                          {guest.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">
                          {guest.name}
                        </h3>
                        <div className="text-sm text-text-muted space-y-1">
                          <div>{guest.email}</div>
                          <div>{guest.phone}</div>
                          {guest.whatsapp && <div>WhatsApp: {guest.whatsapp}</div>}
                          {guest.address && <div>{guest.address}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-primary">
                          {guest.table}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          guest.side === 'Bride' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {guest.side}
                        </span>
                      </div>
                      {guest.plusOne && (
                        <span className="px-3 py-1 bg-gold text-white rounded-full text-xs">
                          +1
                        </span>
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            handleEditGuest(guest);
                            setExpandedCard(null);
                          }}
                          className="btn-secondary btn-sm"
                        >
                          <Edit2 size={14} className="mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${guest.name}?`)) {
                              handleDeleteGuest(guest.id);
                              setExpandedCard(null);
                            }
                          }}
                          className="btn-secondary btn-sm text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {guest.mealPreference && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className="text-sm text-text-muted">Meal Preference: </span>
                      <span className="text-sm text-text-primary">{guest.mealPreference}</span>
                    </div>
                  )}
                  
                  {guest.notes && (
                    <div className="mt-2">
                      <span className="text-sm text-text-muted">Notes: </span>
                      <span className="text-sm text-text-primary">{guest.notes}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      guest.rsvpStatus === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      guest.rsvpStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      RSVP: {guest.rsvpStatus}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
