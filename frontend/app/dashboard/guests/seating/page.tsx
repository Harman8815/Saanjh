'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, ArrowLeft, Plus, Trash2, Edit2, Download, UserPlus, Search, Filter, Armchair } from 'lucide-react';
import Link from 'next/link';
import GuestLayoutSkeleton from '../../../../components/dashboard/GuestLayoutSkeleton';
import { Guest } from '../../../../types/guest';

interface Table {
  id: string;
  name: string;
  seats: number;
  guests: Guest[];
  shape: 'round' | 'rectangular';
  position: { x: number; y: number };
}

export default function SeatingChartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnassigned, setFilterUnassigned] = useState(false);

  const [tables, setTables] = useState<Table[]>([
    {
      id: 'table-1',
      name: 'Table 1 - VIP',
      seats: 8,
      shape: 'round',
      position: { x: 100, y: 100 },
      guests: [
        { id: 1, name: 'Emily Johnson', email: 'emily@email.com', side: 'Bride', rsvpStatus: 'confirmed' },
        { id: 5, name: 'Sarah Brown', email: 'sarah@email.com', side: 'Bride', rsvpStatus: 'confirmed' },
      ] as Guest[],
    },
    {
      id: 'table-2',
      name: 'Table 2 - Family',
      seats: 8,
      shape: 'round',
      position: { x: 300, y: 100 },
      guests: [
        { id: 2, name: 'Michael Smith', email: 'michael@email.com', side: 'Groom', rsvpStatus: 'pending' },
      ] as Guest[],
    },
    {
      id: 'table-3',
      name: 'Table 3 - Friends',
      seats: 10,
      shape: 'rectangular',
      position: { x: 500, y: 100 },
      guests: [],
    },
    {
      id: 'table-4',
      name: 'Table 4 - Colleagues',
      seats: 8,
      shape: 'round',
      position: { x: 100, y: 300 },
      guests: [
        { id: 3, name: 'Jessica Davis', email: 'jessica@email.com', side: 'Bride', rsvpStatus: 'declined' },
      ] as Guest[],
    },
  ]);

  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([
    { id: 4, name: 'Robert Wilson', email: 'robert@email.com', side: 'Groom', rsvpStatus: 'pending' },
    { id: 6, name: 'David Lee', email: 'david@email.com', side: 'Groom', rsvpStatus: 'confirmed' },
    { id: 7, name: 'Amanda Taylor', email: 'amanda@email.com', side: 'Bride', rsvpStatus: 'confirmed' },
    { id: 8, name: 'Chris Martinez', email: 'chris@email.com', side: 'Groom', rsvpStatus: 'pending' },
  ] as Guest[]);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const stats = {
    totalTables: tables.length,
    totalSeats: tables.reduce((sum, t) => sum + t.seats, 0),
    assignedGuests: tables.reduce((sum, t) => sum + t.guests.length, 0),
    unassignedCount: unassignedGuests.length,
    availableSeats: tables.reduce((sum, t) => sum + (t.seats - t.guests.length), 0),
  };

  const handleAddGuestToTable = (tableId: string, guest: Guest) => {
    setTables(prev => prev.map(t => 
      t.id === tableId 
        ? { ...t, guests: [...t.guests, guest] }
        : t
    ));
    setUnassignedGuests(prev => prev.filter(g => g.id !== guest.id));
  };

  const handleRemoveGuestFromTable = (tableId: string, guestId: number) => {
    const guest = tables.find(t => t.id === tableId)?.guests.find(g => g.id === guestId);
    if (guest) {
      setTables(prev => prev.map(t => 
        t.id === tableId 
          ? { ...t, guests: t.guests.filter(g => g.id !== guestId) }
          : t
      ));
      setUnassignedGuests(prev => [...prev, guest]);
    }
  };

  const handleDeleteTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setUnassignedGuests(prev => [...prev, ...table.guests]);
      setTables(prev => prev.filter(t => t.id !== tableId));
    }
    setSelectedTable(null);
  };

  const filteredUnassigned = unassignedGuests.filter(guest => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTableColor = (table: Table) => {
    const occupancy = table.guests.length / table.seats;
    if (occupancy === 0) return 'border-gray-500/50 bg-gray-500/10';
    if (occupancy < 0.5) return 'border-green-500/50 bg-green-500/10';
    if (occupancy < 0.8) return 'border-yellow-500/50 bg-yellow-500/10';
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

        {/* Stats Cards */}
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                          {table.guests.length}/{table.seats}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${(table.guests.length / table.seats) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {table.guests.slice(0, 3).map((guest, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-white/10 text-text-muted truncate max-w-[80px]"
                        >
                          {guest.name.split(' ')[0]}
                        </span>
                      ))}
                      {table.guests.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-text-muted">
                          +{table.guests.length - 3}
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
                    <span className="text-text-primary">{selectedTable.seats} seats</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Occupancy</span>
                    <span className="text-text-primary">{selectedTable.guests.length}/{selectedTable.seats}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Available</span>
                    <span className="text-green-500">{selectedTable.seats - selectedTable.guests.length} seats</span>
                  </div>
                </div>

                <h3 className="text-text-primary font-medium mb-3">Assigned Guests</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                  {selectedTable.guests.map((guest) => (
                    <div 
                      key={guest.id}
                      className="flex items-center justify-between p-3 bg-surface rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-text-primary text-sm font-medium">{guest.name}</p>
                          <p className="text-text-muted text-xs">{guest.side}</p>
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
                  {selectedTable.guests.length === 0 && (
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
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-text-primary text-sm font-medium">{guest.name}</p>
                          <p className="text-text-muted text-xs">{guest.side} · {guest.rsvpStatus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {tables.map((table) => (
                          <button
                            key={table.id}
                            onClick={() => handleAddGuestToTable(table.id, guest)}
                            disabled={table.guests.length >= table.seats}
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
      </div>
    </div>
  );
}
