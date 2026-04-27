'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, ArrowLeft, Plus, Trash2, Edit2, Download, UserPlus, Search, Filter, Armchair, LayoutGrid, Settings } from 'lucide-react';
import Link from 'next/link';
import GuestLayoutSkeleton from '../../../../components/dashboard/GuestLayoutSkeleton';
import { Guest, Table as ApiTable } from '../../../../types/api';
import { GuestService } from '../../../../services/guests';
import toast from 'react-hot-toast';

interface LocalTable {
  id: number;
  name: string;
  capacity: number;
  assigned_guests: number;
  shape: 'round' | 'rectangular';
  position: { x: number; y: number };
}

export default function SeatingChartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manage' | 'visual'>('manage');
  const [selectedTable, setSelectedTable] = useState<LocalTable | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnassigned, setFilterUnassigned] = useState(false);

  const [tables, setTables] = useState<LocalTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch tables and guests in parallel
        const [tablesResponse, guestsResponse] = await Promise.all([
          GuestService.getAllTables(),
          GuestService.getGuests(1, 1000) // Get all guests
        ]);
        
        const guestsArray = Array.isArray(guestsResponse) ? guestsResponse : (guestsResponse.results || []);
        // Convert API tables to local table format
        const localTables = tablesResponse.map((table: ApiTable) => ({
          id: table.id,
          name: `Table ${table.table_number}`,
          capacity: table.capacity || 8,
          assigned_guests: guests.filter(g => g.table_id === table.id).length,
          shape: 'round' as const,
          position: { x: 0, y: 0 }
        }));
        
        setTables(localTables);
        setGuests(guestsArray);
      } catch (err: any) {
        console.error('Error fetching seating data:', err);
        setError(err.message || 'Failed to load seating data');
        toast.error('Failed to load seating data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate unassigned guests from API data
  const unassignedGuests = guests.filter((guest: Guest) => 
    !guest.table_id && guest.rsvp_status?.name === 'confirmed'
  );

  // Calculate stats
  const stats = {
    totalTables: tables.length,
    totalSeats: tables.reduce((sum, t) => sum + (t.capacity || 0), 0),
    assignedGuests: guests.filter(g => g.table_id && g.rsvp_status?.name === 'confirmed').length,
    unassignedCount: unassignedGuests.length,
    availableSeats: tables.reduce((sum, t) => sum + ((t.capacity || 0) - (t.assigned_guests || 0)), 0),
  };

  const handleAddGuestToTable = async (tableId: number, guest: Guest) => {
    try {
      // TODO: Call API to assign guest to table
      // await GuestService.assignGuestToTable(guest.id, tableId);
      
      // Update local state for immediate UI feedback
      setGuests(prev => prev.map(g => 
        g.id === guest.id ? { ...g, table_id: tableId } : g
      ));
      
      toast.success(`${guest.full_name} assigned to table`);
    } catch (err: any) {
      console.error('Error assigning guest to table:', err);
      toast.error('Failed to assign guest to table');
    }
  };

  const handleRemoveGuestFromTable = async (tableId: number, guestId: number) => {
    try {
      // TODO: Call API to remove guest from table
      // await GuestService.removeGuestFromTable(guestId);
      
      // Update local state for immediate UI feedback
      setGuests(prev => prev.map(g => 
        g.id === guestId ? { ...g, table_id: null } : g
      ));
      
      toast.success('Guest removed from table');
    } catch (err: any) {
      console.error('Error removing guest from table:', err);
      toast.error('Failed to remove guest from table');
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    try {
      // TODO: Call API to delete table
      // await GuestService.deleteTable(tableId);
      
      // Update local state for immediate UI feedback
      setTables(prev => prev.filter(t => t.id !== tableId));
      setSelectedTable(null);
      
      toast.success('Table deleted successfully');
    } catch (err: any) {
      console.error('Error deleting table:', err);
      toast.error('Failed to delete table');
    }
  };

  const filteredUnassigned = unassignedGuests.filter((guest: Guest) => 
    guest.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTableColor = (table: LocalTable) => {
    const occupancy = table.assigned_guests || 0;
    const capacity = table.capacity || 0;
    const occupancyRate = capacity > 0 ? occupancy / capacity : 0;
    
    if (occupancyRate === 0) return 'border-gray-500/50 bg-gray-500/10';
    if (occupancyRate < 0.5) return 'border-green-500/50 bg-green-500/10';
    if (occupancyRate < 0.8) return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-red-500/50 bg-red-500/10';
  };

  if (isLoading) {
    return <GuestLayoutSkeleton />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href="/dashboard/guests"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Guest Management</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="heading-emotional text-emotional-4xl text-text-primary mb-4">
            <span className="text-glow">Seating Chart</span>
          </h1>
          <p className="body-emotional text-emotional-xl text-text-muted max-w-3xl">
            Organize guest seating arrangements for your reception
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="flex gap-2 mb-8"
        >
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'manage'
                ? 'bg-primary text-white'
                : 'bg-surface border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Settings size={20} />
            <span>Manage & Edit</span>
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'visual'
                ? 'bg-primary text-white'
                : 'bg-surface border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <LayoutGrid size={20} />
            <span>Visual Layout</span>
          </button>
        </motion.div>

        {/* Stats Cards - Show in both tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          {[
            { label: 'Tables', value: stats.totalTables, icon: <Armchair size={20} />, color: 'primary' },
            { label: 'Total Seats', value: stats.totalSeats, icon: <Users size={20} />, color: 'blue' },
            { label: 'Assigned', value: stats.assignedGuests, icon: <UserPlus size={20} />, color: 'green' },
            { label: 'Unassigned', value: stats.unassignedCount, icon: <Users size={20} />, color: 'yellow' },
            { label: 'Available', value: stats.availableSeats, icon: <Armchair size={20} />, color: 'secondary' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-ui text-ui-xs text-text-muted mb-1">{stat.label}</p>
                  <p className={`text-data-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-2 rounded-full bg-${stat.color}/20 text-${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {activeTab === 'manage' ? (
          <>
            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <button
                onClick={() => setShowAddTableModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={20} />
                <span>Add Table</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-surface border border-white/10 rounded-lg text-text-primary hover:bg-white/5 transition-colors">
                <Download size={20} />
                <span>Export Layout</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-surface border border-white/10 rounded-lg text-text-primary hover:bg-white/5 transition-colors">
                <MapPin size={20} />
                <span>Auto-Arrange</span>
              </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Seating Layout */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="lg:col-span-2"
              >
                <div className="glass-card p-6 min-h-[600px]">
                  <h2 className="heading-data text-data-xl text-text-primary mb-6">Venue Layout</h2>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-green-500/50 bg-green-500/10" />
                      <span className="text-text-muted">Low occupancy (&lt;50%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-yellow-500/50 bg-yellow-500/10" />
                      <span className="text-text-muted">Medium occupancy (50-80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-red-500/50 bg-red-500/10" />
                      <span className="text-text-muted">High occupancy (&gt;80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-500/50 bg-gray-500/10" />
                      <span className="text-text-muted">Empty</span>
                    </div>
                  </div>

                  {/* Tables Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tables.map((table) => (
                      <motion.div
                        key={table.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedTable(table)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                          selectedTable?.id === table.id 
                            ? 'border-primary bg-primary/20' 
                            : getTableColor(table)
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-text-primary">{table.name}</h3>
                          {table.shape === 'round' ? (
                            <div className="w-8 h-8 rounded-full border-2 border-current opacity-50" />
                          ) : (
                            <div className="w-8 h-6 border-2 border-current opacity-50" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">Occupancy</span>
                            <span className="text-text-primary font-medium">
                              {table.assigned_guests}/{table.capacity}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${(table.assigned_guests / table.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {guests.filter(g => g.table_id === table.id).slice(0, 3).map((guest: Guest, idx: number) => (
                            <span 
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-white/10 text-text-muted truncate max-w-[80px]"
                            >
                              {guest.full_name?.split(' ')[0] || 'Guest'}
                            </span>
                          ))}
                          {guests.filter(g => g.table_id === table.id).length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-text-muted">
                              +{guests.filter(g => g.table_id === table.id).length - 3}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Sidebar - Table Details or Unassigned Guests */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {selectedTable ? (
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="heading-data text-data-xl text-text-primary">{selectedTable.name}</h2>
                      <button
                        onClick={() => setSelectedTable(null)}
                        className="text-text-muted hover:text-text-primary"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Shape</span>
                        <span className="text-text-primary capitalize">{selectedTable.shape}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Capacity</span>
                        <span className="text-text-primary">{selectedTable.capacity} seats</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Occupancy</span>
                        <span className="text-text-primary">{selectedTable.assigned_guests}/{selectedTable.capacity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Available</span>
                        <span className="text-green-500">{selectedTable.capacity - selectedTable.assigned_guests} seats</span>
                      </div>
                    </div>

                    <h3 className="text-text-primary font-medium mb-3">Assigned Guests</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                      {guests.filter(g => g.table_id === selectedTable.id).map((guest: Guest) => (
                        <div 
                          key={guest.id}
                          className="flex items-center justify-between p-3 bg-surface rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                              {guest.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-text-primary text-sm font-medium">{guest.full_name || 'Unknown'}</p>
                              <p className="text-text-muted text-xs">{guest.relationship}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveGuestFromTable(selectedTable.id, guest.id)}
                            className="p-1 text-text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {guests.filter(g => g.table_id === selectedTable.id).length === 0 && (
                        <p className="text-text-muted text-center py-4">No guests assigned</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg text-text-primary hover:bg-white/5 transition-colors">
                        <Edit2 size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTable(selectedTable.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-6">
                    <h2 className="heading-data text-data-xl text-text-primary mb-4">Unassigned Guests</h2>
                    
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input
                        type="text"
                        placeholder="Search guests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary text-sm"
                      />
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredUnassigned.map((guest) => (
                        <div 
                          key={guest.id}
                          className="flex items-center justify-between p-3 bg-surface rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                              {guest.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-text-primary text-sm font-medium">{guest.full_name || 'Unknown'}</p>
                              <p className="text-text-muted text-xs">{guest.relationship} · {guest.rsvp_status?.name || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {tables.map((table) => (
                              <button
                                key={table.id}
                                onClick={() => handleAddGuestToTable(table.id, guest)}
                                disabled={table.assigned_guests >= table.capacity}
                                title={`Add to ${table.name}`}
                                className="p-1 text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {filteredUnassigned.length === 0 && (
                        <p className="text-text-muted text-center py-8">
                          {searchQuery ? 'No matching guests found' : 'All guests have been assigned'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        ) : (
          /* Visual Layout Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-8 min-h-[600px]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-data text-data-2xl text-text-primary">Visual Seating Layout</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm">
                  Coming Soon
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-6">
                <LayoutGrid size={48} className="text-text-muted" />
              </div>
              <h3 className="heading-emotional text-emotional-2xl text-text-primary mb-3">
                Interactive Visual Layout
              </h3>
              <p className="body-emotional text-emotional-lg text-text-muted max-w-xl mb-6">
                This feature will provide a drag-and-drop visual interface where you can see tables 
                positioned in the venue and arrange guests around each table.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
                <div className="p-4 bg-surface rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <h4 className="text-text-primary font-medium mb-1">Drag & Drop</h4>
                  <p className="text-text-muted text-sm">Move guests between tables visually</p>
                </div>
                <div className="p-4 bg-surface rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                    <Users size={24} className="text-secondary" />
                  </div>
                  <h4 className="text-text-primary font-medium mb-1">Seat Assignment</h4>
                  <p className="text-text-muted text-sm">Assign specific seats at each table</p>
                </div>
                <div className="p-4 bg-surface rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                    <Armchair size={24} className="text-accent" />
                  </div>
                  <h4 className="text-text-primary font-medium mb-1">Table Designer</h4>
                  <p className="text-text-muted text-sm">Customize table shapes and sizes</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
