'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Plus, Heart, Calendar, Camera, Video, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import GalleryCard from '../../../components/gallery/GalleryCard';

// Mock data for wedding albums
const mockAlbums = [
  {
    id: 'haldi-ceremony',
    title: 'Haldi Ceremony',
    description: 'Colorful traditions and joyful moments',
    date: '2024-03-15',
    coverImage: '/api/placeholder/400/300',
    imageCount: 124,
    videoCount: 8,
    tags: ['Ceremony', 'Traditional', 'Family'],
    featured: true,
    event: 'Pre-Wedding'
  },
  {
    id: 'mehendi-night',
    title: 'Mehendi Night',
    description: 'Intricate designs and celebration',
    date: '2024-03-16',
    coverImage: '/api/placeholder/400/300',
    imageCount: 98,
    videoCount: 5,
    tags: ['Ceremony', 'Traditional', 'Friends'],
    featured: true,
    event: 'Pre-Wedding'
  },
  {
    id: 'sangeet',
    title: 'Sangeet Night',
    description: 'Music, dance, and entertainment',
    date: '2024-03-17',
    coverImage: '/api/placeholder/400/300',
    imageCount: 156,
    videoCount: 12,
    tags: ['Entertainment', 'Dance', 'Music'],
    featured: false,
    event: 'Pre-Wedding'
  },
  {
    id: 'wedding-ceremony',
    title: 'Wedding Ceremony',
    description: 'The sacred union of hearts',
    date: '2024-03-18',
    coverImage: '/api/placeholder/400/300',
    imageCount: 203,
    videoCount: 15,
    tags: ['Ceremony', 'Sacred', 'Couple'],
    featured: true,
    event: 'Wedding Day'
  },
  {
    id: 'reception',
    title: 'Grand Reception',
    description: 'Celebration with family and friends',
    date: '2024-03-19',
    coverImage: '/api/placeholder/400/300',
    imageCount: 187,
    videoCount: 10,
    tags: ['Celebration', 'Party', 'Guests'],
    featured: true,
    event: 'Post-Wedding'
  },
  {
    id: 'couple-portraits',
    title: 'Couple Portraits',
    description: 'Intimate moments and romantic poses',
    date: '2024-03-14',
    coverImage: '/api/placeholder/400/300',
    imageCount: 76,
    videoCount: 3,
    tags: ['Couple', 'Romantic', 'Portrait'],
    featured: false,
    event: 'Pre-Wedding'
  }
];

const filterOptions = [
  { label: 'All Albums', value: 'all' },
  { label: 'Pre-Wedding', value: 'pre-wedding' },
  { label: 'Wedding Day', value: 'wedding-day' },
  { label: 'Post-Wedding', value: 'post-wedding' },
  { label: 'Featured', value: 'featured' }
];

const sortOptions = [
  { label: 'Most Recent', value: 'date-desc' },
  { label: 'Oldest First', value: 'date-asc' },
  { label: 'Most Photos', value: 'photos-desc' },
  { label: 'Most Videos', value: 'videos-desc' },
  { label: 'Alphabetical', value: 'title-asc' }
];

export default function GalleryPage() {
  const [albums, setAlbums] = useState(mockAlbums);
  const [filteredAlbums, setFilteredAlbums] = useState(mockAlbums);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort albums
  useEffect(() => {
    let filtered = [...albums];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(album =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'featured') {
        filtered = filtered.filter(album => album.featured);
      } else {
        filtered = filtered.filter(album => 
          album.event.toLowerCase().replace(' ', '-') === selectedFilter
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'photos-desc':
          return b.imageCount - a.imageCount;
        case 'videos-desc':
          return b.videoCount - a.videoCount;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredAlbums(filtered);
  }, [albums, searchQuery, selectedFilter, selectedSort]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-emotional font-bold text-text-primary mb-4">
            Wedding Gallery
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Relive the beautiful moments captured throughout our wedding journey
          </p>
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="appearance-none bg-background/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="appearance-none bg-background/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-background/50 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-white' 
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-primary text-white' 
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Add Album Button */}
              <button className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <Plus size={18} />
                <span className="hidden sm:inline">Add Album</span>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-text-muted text-sm">
              Showing {filteredAlbums.length} of {albums.length} albums
            </p>
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <Camera size={16} />
              <span>{filteredAlbums.reduce((sum, album) => sum + album.imageCount, 0)} photos</span>
              <Video size={16} className="ml-2" />
              <span>{filteredAlbums.reduce((sum, album) => sum + album.videoCount, 0)} videos</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Albums Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {filteredAlbums.map((album, index) => (
          <GalleryCard
            key={album.id}
            album={album}
            viewMode={viewMode}
            index={index}
          />
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredAlbums.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-surface/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera size={40} className="text-text-muted" />
          </div>
          <h3 className="text-xl font-emotional font-semibold text-text-primary mb-2">
            No albums found
          </h3>
          <p className="text-text-muted mb-6">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start by adding your first wedding album'
            }
          </p>
          {!searchQuery && selectedFilter === 'all' && (
            <button className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300">
              Create First Album
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
