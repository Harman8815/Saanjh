'use client';

import React from 'react';
import { Search, Filter, X, Users, RefreshCw, LayoutList, LayoutGrid } from 'lucide-react';
import { GuestGroup, Table } from '../../../types/api';

interface GuestFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    rsvpStatus: string;
    relationship: string;
    dietaryRestrictions: string;
    groupId?: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  selectedTable: string;
  onTableChange: (tableId: string) => void;
  groups?: GuestGroup[];
  tables?: Table[];
  viewMode: 'table' | 'card' | 'graph';
  onViewModeChange: (mode: 'table' | 'card' | 'graph') => void;
}

export default function GuestFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
  selectedTable,
  onTableChange,
  groups = [],
  tables = [],
  viewMode,
  onViewModeChange,
}: GuestFiltersProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filters.rsvpStatus !== 'all' ||
    filters.relationship !== 'all' ||
    (filters.groupId && filters.groupId !== 'all') ||
    selectedTable !== 'all';

  return (
    <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search guests by name, email..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View toggles and Reset */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}

          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Table view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('card')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Selects */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        {/* RSVP Filter */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            RSVP Status
          </label>
          <select
            value={filters.rsvpStatus}
            onChange={(e) => onFilterChange('rsvpStatus', e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All RSVP Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Relationship Filter */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            Relationship
          </label>
          <select
            value={filters.relationship}
            onChange={(e) => onFilterChange('relationship', e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Relationships</option>
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="colleague">Colleague</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Group Filter */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            Household / Group
          </label>
          <select
            value={filters.groupId || 'all'}
            onChange={(e) => onFilterChange('groupId', e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id.toString()}>
                {group.name} ({group.guest_count || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Table Filter */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            Seating Table
          </label>
          <select
            value={selectedTable}
            onChange={(e) => onTableChange(e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Tables</option>
            <option value="unassigned">Unassigned Only</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id.toString()}>
                Table {t.table_number} ({t.assigned_guests || 0}/{t.capacity || 8})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
