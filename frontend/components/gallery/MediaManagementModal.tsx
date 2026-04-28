'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Album } from '../../types/api';
import { MediaService } from '../../services';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Plus, 
  Search,
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

interface PreviewFile {
  file: File;
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: string;
  dimensions?: string;
}

interface MediaManagementModalProps {
  albumId: string;
  albumName: string;
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  onMediaUpdate: (updatedMedia: MediaItem[]) => void;
  onAlbumCreate?: (albumData: { title: string; description?: string }) => void;
  availableAlbums?: Album[];
}

export default function MediaManagementModal({ 
  albumId, 
  albumName, 
  isOpen, 
  onClose, 
  media, 
  onMediaUpdate,
  onAlbumCreate,
  availableAlbums = []
}: MediaManagementModalProps) {
  const [currentStep, setCurrentStep] = useState<'album' | 'upload'>('album');
  const [isUploading, setIsUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<{ id: string; name: string } | null>(null);
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  // Create preview for selected files
  const createPreview = async (file: File): Promise<PreviewFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        
        // Get dimensions for images
        if (isImage) {
          const img = new Image();
          img.onload = () => {
            resolve({
              file,
              id: `${file.name}-${Date.now()}-${Math.random()}`,
              url,
              type: isVideo ? 'video' : 'image',
              name: file.name,
              size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
              dimensions: `${img.width}x${img.height}`
            });
          };
          img.src = url;
        } else {
          resolve({
            file,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            url,
            type: isVideo ? 'video' : 'image',
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection for preview
  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    const previews = await Promise.all(validFiles.map(file => createPreview(file)));
    setPreviewFiles(prev => [...prev, ...previews]);
  };

  // Remove file from preview
  const removePreviewFile = (id: string) => {
    setPreviewFiles(prev => prev.filter(file => file.id !== id));
  };

  // Clear all previews
  const clearPreviews = () => {
    setPreviewFiles([]);
  };

  // Album search and creation functions
  const filteredAlbums = availableAlbums?.filter((album: Album) => 
    album.title.toLowerCase().includes(albumSearchQuery.toLowerCase())
  ) || [];

  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum({ id: album.id.toString(), name: album.title });
    setAlbumSearchQuery(album.title);
    setShowNewAlbumForm(false);
  };

  const handleNewAlbumClick = () => {
    if (albumSearchQuery.trim()) {
      setNewAlbumName(albumSearchQuery.trim());
      setNewAlbumDescription('');
      setShowNewAlbumForm(true);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;

    setIsCreatingAlbum(true);
    try {
      // Create album using actual API
      const newAlbum = await MediaService.createAlbum({
        title: newAlbumName.trim(),
        description: newAlbumDescription.trim(),
        event_type: 'other'
      });
      
      if (onAlbumCreate) {
        onAlbumCreate({
          title: newAlbum.title,
          description: newAlbum.description
        });
      }
      
      // Reset form and select the newly created album
      setNewAlbumName('');
      setNewAlbumDescription('');
      setShowNewAlbumForm(false);
      setAlbumSearchQuery(newAlbum.title);
      setSelectedAlbum({ id: newAlbum.id.toString(), name: newAlbum.title });
      
      // Move to upload step
      setCurrentStep('upload');
    } catch (error) {
      console.error('Error creating album:', error);
      // You could show an error toast here
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  const handleProceedToUpload = () => {
    if (selectedAlbum) {
      setCurrentStep('upload');
    }
  };

  const handleBackToAlbum = () => {
    setCurrentStep('album');
  };

  
  const handleAlbumSearchChange = (value: string) => {
    setAlbumSearchQuery(value);
    setShowNewAlbumForm(false);
    
    // Check if exact match exists
    const exactMatch = availableAlbums?.find((album: Album) => 
      album.title.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      setSelectedAlbum({ id: exactMatch.id.toString(), name: exactMatch.title });
    } else {
      setSelectedAlbum(null);
    }
  };

  const handleFileUpload = async () => {
    if (previewFiles.length === 0) return;
    
    setIsUploading(true);
    const newMedia: MediaItem[] = [];

    for (let i = 0; i < previewFiles.length; i++) {
      const previewFile = previewFiles[i];
      const file = previewFile.file;

      // Create mock media item (in real app, this would upload to server)
      const newMediaItem: MediaItem = {
        id: `${albumId}-new-${Date.now()}-${i}`,
        type: previewFile.type,
        url: previewFile.url,
        thumbnail: previewFile.url,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: `Uploaded ${new Date().toLocaleDateString()}`,
        tags: 'new',
        featured: false,
        date: new Date().toISOString(),
        size: previewFile.size,
        dimensions: previewFile.dimensions || (previewFile.type === 'video' ? '1920x1080' : '1920x1280')
      };
      newMedia.push(newMediaItem);
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    onMediaUpdate([...media, ...newMedia]);
    clearPreviews();
    setIsUploading(false);
  };

  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
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
                  {currentStep === 'album' ? 'Select Album' : 'Upload Media'}
                </h2>
                <p className="text-text-muted">
                  {currentStep === 'album' 
                    ? 'First, select an existing album or create a new one' 
                    : `Uploading to: ${selectedAlbum?.name || 'Unknown Album'}`
                  }
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

          {/* Step 1: Album Selection */}
          {currentStep === 'album' && (
            <div className="p-6">
              {/* Album Search */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-text-primary font-medium text-lg">Select or Create Album</label>
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="Required"></div>
                </div>
                <p className="text-text-muted text-sm">You must select an existing album or create a new one before uploading media</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search for album or type new name..."
                      value={albumSearchQuery}
                      onChange={(e) => handleAlbumSearchChange(e.target.value)}
                      className="pl-10 pr-4 py-3 bg-background/50 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all w-full"
                    />
                  </div>
                  {!showNewAlbumForm && albumSearchQuery.trim() && !filteredAlbums.some(album => album.title.toLowerCase() === albumSearchQuery.toLowerCase()) && (
                    <button
                      onClick={handleNewAlbumClick}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Create New
                    </button>
                  )}
                </div>
                
                {/* Album Search Results */}
                {albumSearchQuery && filteredAlbums.length > 0 && (
                  <div className="bg-background/50 border border-white/10 rounded-lg max-h-48 overflow-y-auto">
                    {filteredAlbums.map((album) => (
                      <button
                        key={album.id}
                        onClick={() => handleAlbumSelect(album)}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between group border-b border-white/5 last:border-b-0"
                      >
                        <span className="text-text-primary">{album.title}</span>
                        {selectedAlbum?.id === album.id.toString() && (
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* New Album Form */}
                {showNewAlbumForm && (
                  <div className="bg-background/50 border border-white/10 rounded-lg p-6">
                    <h4 className="text-text-primary font-medium mb-4">Create New Album</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-text-muted text-sm mb-2">Album Name</label>
                        <input
                          type="text"
                          value={newAlbumName}
                          onChange={(e) => setNewAlbumName(e.target.value)}
                          className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Enter album name..."
                        />
                      </div>
                      <div>
                        <label className="block text-text-muted text-sm mb-2">Description (Optional)</label>
                        <textarea
                          value={newAlbumDescription}
                          onChange={(e) => setNewAlbumDescription(e.target.value)}
                          className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                          placeholder="Enter album description..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowNewAlbumForm(false)}
                          className="px-6 py-3 bg-surface border border-white/10 text-text-primary rounded-lg hover:bg-background/50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateAlbum}
                          disabled={isCreatingAlbum || !newAlbumName.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isCreatingAlbum ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Creating...
                            </>
                          ) : (
                            'Create Album & Continue'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Selected Album Display */}
                {selectedAlbum && !showNewAlbumForm && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <span className="text-text-primary font-medium">Album Ready: {selectedAlbum.name}</span>
                          <p className="text-text-muted text-sm">You can now proceed to upload media</p>
                        </div>
                      </div>
                      <button
                        onClick={handleProceedToUpload}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        Continue to Upload →
                      </button>
                    </div>
                  </div>
                )}

                {/* No Album Selected Warning */}
                {!selectedAlbum && !showNewAlbumForm && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <span className="text-text-primary font-medium">No Album Selected</span>
                        <p className="text-text-muted text-sm">Please select an existing album or create a new one to continue</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Media Upload */}
          {currentStep === 'upload' && (
            <div className="flex-1 flex flex-col">
              {/* Upload Area */}
              <div 
                className="p-6 border-b border-white/10"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">
                      Upload to: {selectedAlbum?.name || 'New Album'}
                    </h3>
                    <button
                      onClick={handleBackToAlbum}
                      className="text-primary text-sm hover:underline"
                    >
                      ← Change Album
                    </button>
                  </div>
                </div>

                {/* Upload Drop Zone */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30 rounded-xl p-8 text-center mb-4">
                  <Upload size={48} className="text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-text-muted mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} />
                    Choose Files
                  </button>
                </div>

                {/* Preview Files */}
                {previewFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-text-primary font-medium">
                        Selected Files ({previewFiles.length})
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={clearPreviews}
                          disabled={isUploading}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 text-sm"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={handleFileUpload}
                          disabled={isUploading || previewFiles.length === 0}
                          className="px-4 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm flex items-center gap-2"
                        >
                          {isUploading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              Upload All
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 bg-background/30 rounded-lg">
                      {previewFiles.map((previewFile) => (
                        <div key={previewFile.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                            {previewFile.type === 'video' ? (
                              <video
                                src={previewFile.url}
                                className="w-full h-full object-cover"
                                muted
                                controls={false}
                              />
                            ) : (
                              <img
                                src={previewFile.url}
                                alt={previewFile.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => removePreviewFile(previewFile.id)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                            
                            {/* Type Badge */}
                            <div className="absolute top-1 left-1">
                              <div className="bg-black/50 text-white p-1 rounded-full">
                                {previewFile.type === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}
                              </div>
                            </div>
                          </div>
                          
                          {/* File Info */}
                          <div className="mt-1">
                            <p className="text-xs text-text-primary truncate" title={previewFile.name}>
                              {previewFile.name}
                            </p>
                            <p className="text-xs text-text-muted">
                              {previewFile.size}
                              {previewFile.dimensions && ` • ${previewFile.dimensions}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer for Upload Step */}
              <div className="p-4 border-t border-white/10 mt-auto">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBackToAlbum}
                    className="px-6 py-2 bg-surface border border-white/10 text-text-primary rounded-lg hover:bg-background/50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
