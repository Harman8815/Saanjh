'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, X, Users, ArrowLeft, Filter, Search, Download, Mail } from 'lucide-react';
import Link from 'next/link';
import GuestLayoutSkeleton from '../../../../components/dashboard/GuestLayoutSkeleton';
import { Guest, RsvpStatus } from '../../../../types/api';
import { GuestService } from '../../../../services/guests';
import toast from 'react-hot-toast';

export default function RSVPStatusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');
  
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvpStatuses, setRsvpStatuses] = useState<RsvpStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch guests and RSVP statuses in parallel
        const [guestsResponse, rsvpStatusesResponse] = await Promise.all([
          GuestService.getGuests(1, 1000), // Get all guests
          GuestService.getRsvpStatuses()
        ]);
        
        const guestsArray = Array.isArray(guestsResponse) ? guestsResponse : (guestsResponse.results || []);
        setGuests(guestsArray);
        setRsvpStatuses(rsvpStatusesResponse);
      } catch (err: any) {
        console.error('Error fetching RSVP data:', err);
        setError(err.message || 'Failed to load RSVP data');
        toast.error('Failed to load RSVP data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvp_status?.name === 'confirmed').length,
    pending: guests.filter(g => g.rsvp_status?.name === 'pending').length,
    declined: guests.filter(g => g.rsvp_status?.name === 'declined').length,
  };

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || guest.rsvp_status?.name === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (guestId: number, newStatus: string) => {
    try {
      // Find the RSVP status ID for the new status
      const statusObj = rsvpStatuses.find(s => s.name === newStatus);
      if (!statusObj) {
        toast.error('Invalid RSVP status');
        return;
      }

      // Update guest locally for immediate UI feedback
      setGuests(prev => prev.map(g => 
        g.id === guestId 
          ? { ...g, rsvp_status: statusObj, rsvp_status_id: statusObj.id }
          : g
      ));

      // Make actual API call to update the guest's RSVP status
      await GuestService.updateGuest(guestId, { rsvp_status_id: statusObj.id });
      
      toast.success(`RSVP status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating RSVP status:', err);
      toast.error('Failed to update RSVP status');
      
      // Revert the change on error
      const originalGuest = guests.find(g => g.id === guestId);
      if (originalGuest) {
        setGuests(prev => prev.map(g => 
          g.id === guestId ? { ...g, rsvp_status: originalGuest.rsvp_status, rsvp_status_id: originalGuest.rsvp_status_id } : g
        ));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Check size={20} className="text-green-500" />;
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'declined': return <X size={20} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'declined': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-500';
    }
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
            <span className="text-glow">RSVP Status</span>
          </h1>
          <p className="body-emotional text-emotional-xl text-text-muted max-w-3xl">
            Track and manage guest responses for your wedding
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Invited', value: stats.total, icon: <Users size={24} />, color: 'primary' },
            { label: 'Confirmed', value: stats.confirmed, icon: <Check size={24} />, color: 'green' },
            { label: 'Pending', value: stats.pending, icon: <Clock size={24} />, color: 'yellow' },
            { label: 'Declined', value: stats.declined, icon: <X size={24} />, color: 'red' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-ui text-ui-sm text-text-muted mb-1">{stat.label}</p>
                  <p className={`text-data-3xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}/20 text-${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-data text-data-lg text-text-primary">Response Rate</h3>
            <span className="text-data-xl font-bold text-primary">
              {Math.round(((stats.confirmed + stats.declined) / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full h-4 bg-surface rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(stats.confirmed / stats.total) * 100}%` }}
            />
            <div 
              className="h-full bg-yellow-500 transition-all duration-500"
              style={{ width: `${(stats.pending / stats.total) * 100}%` }}
            />
            <div 
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${(stats.declined / stats.total) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-text-muted">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-text-muted">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-text-muted">Declined</span>
            </div>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-text-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-surface border border-white/10 rounded-lg text-text-primary hover:bg-white/5 transition-colors">
            <Download size={20} />
            <span>Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Mail size={20} />
            <span>Send Reminders</span>
          </button>
        </motion.div>

        {/* Guest List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-text-muted font-medium">Guest</th>
                  <th className="text-left p-4 text-text-muted font-medium">Side</th>
                  <th className="text-left p-4 text-text-muted font-medium">Contact</th>
                  <th className="text-left p-4 text-text-muted font-medium">Current Status</th>
                  <th className="text-left p-4 text-text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                          {guest.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-text-primary font-medium">{guest.full_name || 'Unknown'}</p>
                          <p className="text-text-muted text-sm">
                            {guest.meal_preferences && guest.meal_preferences.length > 0 
                              ? guest.meal_preferences.map(mp => mp.name).join(', ')
                              : 'No dietary restrictions'
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        guest.relationship?.toLowerCase().includes('bride') ? 'bg-pink-500/20 text-pink-500' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {guest.relationship || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-text-primary">{guest.email || '--'}</p>
                      <p className="text-text-muted text-sm">{guest.phone || '--'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(guest.rsvp_status?.name || '')}`}>
                        {getStatusIcon(guest.rsvp_status?.name || '')}
                        <span className="capitalize">{guest.rsvp_status?.name || 'Unknown'}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {guest.rsvp_status?.name === 'confirmed' ? (
                          <button
                            onClick={() => handleStatusChange(guest.id, 'pending')}
                            className="p-2 rounded-lg transition-colors bg-green-500/20 text-green-500 hover:bg-green-500/30"
                            title="Change to Pending"
                          >
                            <Check size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(guest.id, 'confirmed')}
                            className="p-2 rounded-lg transition-colors bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                            title="Approve Guest"
                          >
                            <Clock size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredGuests.length === 0 && (
            <div className="p-8 text-center text-text-muted">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No guests found matching your criteria</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
