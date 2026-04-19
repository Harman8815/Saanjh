'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Plus, 
  Search,
  Filter,
  Grid3x3,
  List,
  Download,
  Share2,
  Heart,
  MoreVertical
} from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  tags: string;
  featured: boolean;
  date: string;
  size: string;
  dimensions: string;
}

interface MediaManagementModalProps {
  albumId: string;
  albumName: string;
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  onMediaUpdate: (updatedMedia: MediaItem[]) => void;
}

export default function MediaManagementModal({ 
  albumId, 
  albumName, 
  isOpen, 
  onClose, 
  media, 
  onMediaUpdate 
}: MediaManagementModalProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter media based on search and type
  const filteredMedia = media.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    const newMedia: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (isVideo || isImage) {
        // Create mock media item (in real app, this would upload to server)
        const newMediaItem: MediaItem = {
          id: `${albumId}-new-${Date.now()}-${i}`,
          type: isVideo ? 'video' : 'image',
          url: `/api/placeholder/${400 + i * 50}/${300 + i * 30}`,
          thumbnail: `/api/placeholder/${400 + i * 50}/${300 + i * 30}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Uploaded ${new Date().toLocaleDateString()}`,
          tags: 'new',
          featured: false,
          date: new Date().toISOString(),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          dimensions: isVideo ? '1920x1080' : '1920x1280'
        };
        newMedia.push(newMediaItem);
      }
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    onMediaUpdate([...media, ...newMedia]);
    setIsUploading(false);
  };

  const handleMediaSelect = (mediaItem: MediaItem) => {
    setSelectedMedia(prev => 
      prev.some(item => item.id === mediaItem.id)
        ? prev.filter(item => item.id !== mediaItem.id)
        : [...prev, mediaItem]
    );
  };

  const handleSelectAll = () => {
    if (selectedMedia.length === filteredMedia.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(filteredMedia);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMedia.length === 0) return;

    setIsDeleting(true);
    
    // Simulate delete delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedMedia = media.filter(item => 
      !selectedMedia.some(selected => selected.id === item.id)
    );
    
    onMediaUpdate(updatedMedia);
    setSelectedMedia([]);
    setIsDeleting(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-white/10 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-emotional font-semibold text-text-primary">
                  Manage Media
                </h2>
                <p className="text-text-muted">
                  {albumName} ({media.length} items)
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div 
            className="p-6 border-b border-white/10"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30 rounded-xl p-8 text-center">
              <Upload size={48} className="text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Upload New Media
              </h3>
              <p className="text-text-muted mb-4">
                Drag and drop files here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Choose Files
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search and Filter */}
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all w-64"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 bg-background/50 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="all">All Media</option>
                  <option value="images">Images Only</option>
                  <option value="videos">Videos Only</option>
                </select>

                <div className="flex bg-background/50 border border-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-white' 
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list' 
                        ? 'bg-primary text-white' 
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-background/50 border border-white/10 text-text-primary rounded-lg hover:bg-background/70 transition-all"
                >
                  {selectedMedia.length === filteredMedia.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedMedia.length === 0 || isDeleting}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete ({selectedMedia.length})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selection Info */}
            {selectedMedia.length > 0 && (
              <div className="mt-3 text-sm text-text-muted">
                {selectedMedia.length} item{selectedMedia.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon size={48} className="text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">
                  {searchQuery || filterType !== 'all' 
                    ? 'No media found matching your criteria' 
                    : 'No media in this album yet'
                  }
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                  : 'space-y-2'
              }>
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedMedia.some(selected => selected.id === item.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:border-white/20'
                    }`}
                    onClick={() => handleMediaSelect(item)}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2">
                        <div className="bg-black/50 text-white p-1.5 rounded-full">
                          {item.type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                        </div>
                      </div>

                      {/* Selection Checkbox */}
                      <div className="absolute top-2 right-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedMedia.some(selected => selected.id === item.id)
                            ? 'bg-primary border-primary'
                            : 'bg-black/50 border-white/50'
                        }`}>
                          {selectedMedia.some(selected => selected.id === item.id) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <MoreVertical size={20} className="text-white" />
                      </div>
                    </div>

                    {/* Info (List View) */}
                    {viewMode === 'list' && (
                      <div className="p-3 bg-background/50">
                        <p className="text-text-primary font-medium truncate">{item.title}</p>
                        <p className="text-text-muted text-xs">{item.size}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex justify-between items-center">
            <p className="text-text-muted text-sm">
              {filteredMedia.length} items total
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
