'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Camera, Video, Image as ImageIcon, MoreVertical, Edit3, Trash2, FolderOpen, Settings } from 'lucide-react';
import Link from 'next/link';

interface GalleryCardProps {
  album: {
    id: number;
    title: string;
    description?: string;
    date?: string;
    cover_image?: string;
    image_count: number;
    video_count: number;
    tags: Array<{ id: number; name: string }>;
    featured: boolean;
    event_type: string;
  };
  viewMode?: 'grid' | 'list';
  index?: number;
  onEdit?: (album: any) => void;
  onRename?: (album: any) => void;
  onDelete?: (album: any) => void;
  onManageMedia?: (album: any) => void;
}

export default function GalleryCard({ 
  album, 
  viewMode = 'grid', 
  index = 0, 
  onEdit, 
  onRename, 
  onDelete, 
  onManageMedia 
}: GalleryCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const cardContent = (
    <div className="glass-card h-full overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
      {/* Cover Image */}
      <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10" />
        <img
          src={album.cover_image || '/placeholder-image.jpg'}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Featured Badge */}
        {album.featured && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-gradient-to-r from-gold to-bronze text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Heart size={12} />
              Featured
            </div>
          </div>
        )}

        {/* Overlay with Stats */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <ImageIcon size={16} />
                <span className="text-sm">{album.image_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Video size={16} />
                <span className="text-sm">{album.video_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Album Info */}
      <div className="p-5">
        <div className={`flex items-start justify-between mb-3 ${viewMode === 'list' ? 'gap-4' : ''}`}>
          <div className="flex-1">
            <h3 className={`font-emotional font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors ${
              viewMode === 'grid' ? 'text-xl' : 'text-lg'
            }`}>
              {album.title}
            </h3>
            <p className="text-text-muted text-sm mb-2">
              {album.description}
            </p>
          </div>
            
            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <MoreVertical size={18} />
              </button>
              
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      {onManageMedia && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowDropdown(false);
                            onManageMedia(album);
                          }}
                          className="w-full px-4 py-2 text-left text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3"
                        >
                          <FolderOpen size={16} />
                          Manage Media
                        </button>
                      )}
                      
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowDropdown(false);
                            onEdit(album);
                          }}
                          className="w-full px-4 py-2 text-left text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3"
                        >
                          <Edit3 size={16} />
                          Edit Details
                        </button>
                      )}
                      
                      {onRename && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowDropdown(false);
                            onRename(album);
                          }}
                          className="w-full px-4 py-2 text-left text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3"
                        >
                          <Settings size={16} />
                          Rename Album
                        </button>
                      )}
                      
                      <div className="border-t border-white/10 my-1"></div>
                      
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowDropdown(false);
                            onDelete(album);
                          }}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                        >
                          <Trash2 size={16} />
                          Delete Album
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        {/* Date and Event */}
        <div className="flex items-center gap-3 text-text-muted text-sm mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{album.date ? new Date(album.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'No date'}</span>
          </div>
          <span>•</span>
          <span className="text-primary font-medium">{album.event_type}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {album.tags.slice(0, viewMode === 'list' ? 4 : 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-medium"
            >
              {tag.name}
            </span>
          ))}
          {album.tags.length > (viewMode === 'list' ? 4 : 3) && (
            <span className="bg-surface/50 text-text-muted px-2 py-1 rounded-lg text-xs">
              +{album.tags.length - (viewMode === 'list' ? 4 : 3)} more
            </span>
          )}
        </div>

        {/* Stats for List View */}
        {viewMode === 'list' && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4 text-text-muted text-sm">
              <div className="flex items-center gap-1">
                <Camera size={16} />
                <span>{album.image_count} photos</span>
              </div>
              <div className="flex items-center gap-1">
                <Video size={16} />
                <span>{album.video_count} videos</span>
              </div>
            </div>
            <button className="text-primary hover:text-primary/80 font-medium text-sm">
              View Album →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={viewMode === 'list' ? 'w-full' : ''}
    >
      <Link href={`/dashboard/gallery/${album.id}`}>
        {cardContent}
      </Link>
    </motion.div>
  );
}
