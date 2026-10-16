'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  CheckSquare, 
  Square, 
  Mail, 
  Phone, 
  Users, 
  UtensilsCrossed, 
  UserCheck 
} from 'lucide-react';
import { Guest, GuestGroup } from '../../../types/api';

interface GuestTableProps {
  guests: Guest[];
  selectedGuests: number[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onSelectGuest: (id: number) => void;
  onSelectAll: () => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (guest: Guest) => void;
  onViewGuestDetail?: (guest: Guest) => void;
}

export default function GuestTable({
  guests,
  selectedGuests,
  sortField,
  sortOrder,
  onSort,
  onSelectGuest,
  onSelectAll,
  onEditGuest,
  onDeleteGuest,
  onViewGuestDetail,
}: GuestTableProps) {
  const isAllSelected = guests.length > 0 && selectedGuests.length === guests.length;
  const isPartiallySelected = selectedGuests.length > 0 && selectedGuests.length < guests.length;

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1 text-primary-500" />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1 text-primary-500" />
    );
  };

  const getRsvpBadgeClass = (statusName?: string) => {
    switch (statusName?.toLowerCase()) {
      case 'confirmed':
      case 'attending':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'declined':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 uppercase text-xs tracking-wider">
          <tr>
            <th className="p-4 w-12 text-center">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-neutral-500 hover:text-primary-600 focus:outline-none"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-primary-600" />
                ) : isPartiallySelected ? (
                  <div className="w-4 h-4 rounded border-2 border-primary-600 bg-primary-600/30 flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-primary-600" />
                  </div>
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
            </th>
            <th
              onClick={() => onSort('last_name')}
              className="p-4 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Guest Name {renderSortIcon('last_name')}
            </th>
            <th
              onClick={() => onSort('rsvp_status')}
              className="p-4 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              RSVP {renderSortIcon('rsvp_status')}
            </th>
            <th
              onClick={() => onSort('relationship')}
              className="p-4 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Relationship {renderSortIcon('relationship')}
            </th>
            <th className="p-4">Group</th>
            <th className="p-4">Plus-One</th>
            <th className="p-4">Dietary</th>
            <th
              onClick={() => onSort('table')}
              className="p-4 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Table {renderSortIcon('table')}
            </th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {guests.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-12 text-center text-neutral-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-base font-medium">No guests found</p>
                <p className="text-xs text-neutral-500 mt-1">Try adjusting your filters or search criteria.</p>
              </td>
            </tr>
          ) : (
            guests.map((guest) => {
              const isSelected = selectedGuests.includes(guest.id);
              const rsvpLabel = guest.rsvp_status?.name || 'Pending';

              return (
                <tr
                  key={guest.id}
                  className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${
                    isSelected ? 'bg-primary-500/5 dark:bg-primary-500/10' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectGuest(guest.id)}
                      className="text-neutral-400 hover:text-primary-600 focus:outline-none"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => onViewGuestDetail?.(guest)}
                    >
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {guest.full_name || `${guest.first_name} ${guest.last_name}`}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {guest.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {guest.email}
                          </span>
                        )}
                        {guest.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {guest.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRsvpBadgeClass(rsvpLabel)}`}>
                      {rsvpLabel}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-300 capitalize">
                    {guest.relationship || '—'}
                  </td>
                  <td className="p-4">
                    {guest.group ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        <Users className="w-3 h-3 text-neutral-500" />
                        {guest.group.name}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {guest.plus_one_name ? (
                      <div className="flex items-center gap-1 text-xs text-neutral-700 dark:text-neutral-300">
                        <UserCheck className="w-3.5 h-3.5 text-primary-500" />
                        <span>{guest.plus_one_name}</span>
                        {guest.plus_one_rsvp_status && (
                          <span className="text-[10px] text-neutral-400">({guest.plus_one_rsvp_status.name})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {guest.dietary_preferences && guest.dietary_preferences.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {guest.dietary_preferences.map((d) => (
                          <span
                            key={d.id}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          >
                            <UtensilsCrossed className="w-2.5 h-2.5" />
                            {d.name}
                          </span>
                        ))}
                      </div>
                    ) : guest.dietary_restrictions ? (
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[120px] block" title={guest.dietary_restrictions}>
                        {guest.dietary_restrictions}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {guest.table ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Table {guest.table.table_number || guest.table_id}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditGuest(guest)}
                        title="Edit guest"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteGuest(guest)}
                        title="Delete guest"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
