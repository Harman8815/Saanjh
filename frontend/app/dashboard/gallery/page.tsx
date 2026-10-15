'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, Plus, Heart, Calendar, Camera, Video, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import GalleryCard from '../../../components/gallery/GalleryCard';
import EditAlbumModal from '../../../components/gallery/EditAlbumModal';
import RenameAlbumModal from '../../../components/gallery/RenameAlbumModal';
import DeleteConfirmationModal from '../../../components/gallery/DeleteConfirmationModal';
import MediaManagementModal from '../../../components/gallery/MediaManagementModal';
import { MediaService } from '../../../services';
import { useToast, ToastContainer } from '../../../components/gallery/ToastNotification';
import { ApiErrorHelper } from '../../../utils/error-handling';
import type { Album, AlbumCreateRequest, AlbumUpdateRequest } from '../../../types/api';

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

function GalleryContent() {
  const searchParams = useSearchParams();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // Fetch albums from backend
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        let albumsData: Album[] = [];
        
        // Fetch albums based on filter
        if (selectedFilter === 'featured') {
          const featuredResponse = await MediaService.getFeaturedAlbums();
          albumsData = Array.isArray(featuredResponse) ? featuredResponse : [];
        } else if (selectedFilter === 'pre-wedding' || selectedFilter === 'wedding-day' || selectedFilter === 'post-wedding') {
          const albumsByEvent = await MediaService.getAlbumsByEvent();
          albumsData = albumsByEvent[selectedFilter]?.albums || [];
        } else {
          const albumsResponse = await MediaService.getAlbums();
          albumsData = Array.isArray(albumsResponse) ? albumsResponse : [];
        }
        
        console.log('Fetched albums:', albumsData);
        setAlbums(albumsData);
      } catch (error) {
        console.error('Error fetching albums:', error);
        const errorMessage = ApiErrorHelper.extractErrorMessage(error);
        addToast({
          type: 'error',
          title: 'Failed to Load Albums',
          message: errorMessage
        });
        setAlbums([]); // Set empty array on error to prevent iteration issues
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, [selectedFilter]);

  // Handle query parameters from sidebar navigation
  useEffect(() => {
    const filter = searchParams.get('filter');
    const sort = searchParams.get('sort');
    const action = searchParams.get('action');

    if (filter) {
      setSelectedFilter(filter);
    }
    if (sort) {
      setSelectedSort(sort);
    }
    if (action) {
      // Handle specific actions like create album
      console.log(`Gallery action: ${action}`);
      // You could open a modal or trigger specific functionality here
    }
  }, [searchParams]);

  // Filter and sort albums
  useEffect(() => {
    let filtered = Array.isArray(albums) ? [...albums] : [];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(album =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.description && album.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (album.tags && album.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date-desc':
          return new Date(b.created_at || b.date || '').getTime() - new Date(a.created_at || a.date || '').getTime();
        case 'date-asc':
          return new Date(a.created_at || a.date || '').getTime() - new Date(b.created_at || b.date || '').getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredAlbums(filtered);
  }, [albums, searchQuery, selectedSort]);

  // Album management handlers
  const handleEditAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setEditModalOpen(true);
  };

  const handleRenameAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setRenameModalOpen(true);
  };

  const handleDeleteAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setDeleteModalOpen(true);
  };

  const handleSaveAlbum = async (updatedAlbum: AlbumUpdateRequest) => {
    if (!selectedAlbum) return;
    
    try {
      await MediaService.updateAlbum(selectedAlbum.id, updatedAlbum);
      setAlbums(prev => prev.map(album => 
        album.id === selectedAlbum.id ? { ...album, ...updatedAlbum } : album
      ));
      setEditModalOpen(false);
      setSelectedAlbum(null);
      addToast({
        type: 'success',
        title: 'Album Updated',
        message: 'Album has been updated successfully'
      });
    } catch (error) {
      const errorMessage = ApiErrorHelper.extractErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Failed to Update Album',
        message: errorMessage
      });
    }
  };

  const handleRenameAlbumConfirm = async (albumId: number, newTitle: string) => {
    try {
      await MediaService.updateAlbum(albumId, { title: newTitle });
      setAlbums(prev => prev.map(album => 
        album.id === albumId ? { ...album, title: newTitle } : album
      ));
      setRenameModalOpen(false);
      setSelectedAlbum(null);
      addToast({
        type: 'success',
        title: 'Album Renamed',
        message: 'Album has been renamed successfully'
      });
    } catch (error) {
      const errorMessage = ApiErrorHelper.extractErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Failed to Rename Album',
        message: errorMessage
      });
    }
  };

  const handleDeleteAlbumConfirm = async () => {
    if (!selectedAlbum) return;
    
    try {
      await MediaService.deleteAlbum(selectedAlbum.id);
      setAlbums(prev => prev.filter(album => album.id !== selectedAlbum.id));
      setDeleteModalOpen(false);
      setSelectedAlbum(null);
      addToast({
        type: 'success',
        title: 'Album Deleted',
        message: 'Album has been deleted successfully'
      });
    } catch (error) {
      const errorMessage = ApiErrorHelper.extractErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Failed to Delete Album',
        message: errorMessage
      });
    }
  };

  const handleCreateAlbum = async (albumData: AlbumCreateRequest) => {
    try {
      const newAlbum = await MediaService.createAlbum(albumData);
      setAlbums(prev => [newAlbum, ...prev]);
      addToast({
        type: 'success',
        title: 'Album Created',
        message: 'Album has been created successfully'
      });
    } catch (error) {
      const errorMessage = ApiErrorHelper.extractErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Failed to Create Album',
        message: errorMessage
      });
    }
  };

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
              <button 
                onClick={() => setMediaModalOpen(true)}
                className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
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
              <span>{filteredAlbums.reduce((sum, album) => sum + album.image_count, 0)} photos</span>
              <Video size={16} className="ml-2" />
              <span>{filteredAlbums.reduce((sum, album) => sum + album.video_count, 0)} videos</span>
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
            onEdit={handleEditAlbum}
            onRename={handleRenameAlbum}
            onDelete={handleDeleteAlbum}
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
            <button 
              onClick={() => setMediaModalOpen(true)}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Create First Album
            </button>
          )}
        </motion.div>
      )}
      
      {/* Edit Album Modal */}
      <EditAlbumModal
        album={selectedAlbum}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveAlbum}
      />

      {/* Rename Album Modal */}
      <RenameAlbumModal
        album={selectedAlbum}
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        onRename={handleRenameAlbumConfirm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        itemType="album"
        itemName={selectedAlbum?.title || ''}
        itemCount={(selectedAlbum?.image_count || 0) + (selectedAlbum?.video_count || 0)}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAlbumConfirm}
      />
      
      {/* Media Upload Modal */}
      <MediaManagementModal
        albumId="new"
        albumName="New Album"
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        media={[]}
        availableAlbums={albums}
        onMediaUpdate={(updatedMedia) => {
          // Handle uploaded media - in real app, this would create album and add media
          console.log('Uploaded media:', updatedMedia);
        }}
        onAlbumCreate={async (albumData) => {
          try {
            // Create the album via API
            const newAlbum = await MediaService.createAlbum({
              title: albumData.title,
              description: albumData.description,
              event_type: 'other'
            });
            
            // Refresh albums list to include the newly created album
            const updatedAlbums = await MediaService.getAlbums();
            setAlbums(Array.isArray(updatedAlbums) ? updatedAlbums : []);
            
            console.log('Album created successfully:', newAlbum);
          } catch (error) {
            console.error('Error creating album:', error);
            addToast({
              type: 'error',
              title: 'Failed to Create Album',
              message: 'Could not create the album. Please try again.'
            });
          }
        }}
      />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted">Loading gallery...</div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
