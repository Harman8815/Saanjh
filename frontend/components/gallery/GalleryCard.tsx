'use client';

import { motion } from 'framer-motion';
import { Heart, Calendar, Camera, Video, Image as ImageIcon, MoreVertical } from 'lucide-react';
import Link from 'next/link';

interface GalleryCardProps {
  album: {
    id: string;
    title: string;
    description: string;
    date: string;
    coverImage: string;
    imageCount: number;
    videoCount: number;
    tags: string[];
    featured: boolean;
    event: string;
  };
  viewMode?: 'grid' | 'list';
  index?: number;
}

export default function GalleryCard({ album, viewMode = 'grid', index = 0 }: GalleryCardProps) {
  const cardContent = (
    <div className="glass-card h-full overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
      {/* Cover Image */}
      <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10" />
        <img
          src={album.coverImage}
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
                <span className="text-sm">{album.imageCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Video size={16} />
                <span className="text-sm">{album.videoCount}</span>
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
          {viewMode === 'list' && (
            <button className="text-text-muted hover:text-text-primary transition-colors p-1">
              <MoreVertical size={18} />
            </button>
          )}
        </div>

        {/* Date and Event */}
        <div className="flex items-center gap-3 text-text-muted text-sm mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{new Date(album.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>
          <span>•</span>
          <span className="text-primary font-medium">{album.event}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {album.tags.slice(0, viewMode === 'list' ? 4 : 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-medium"
            >
              {tag}
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
                <span>{album.imageCount} photos</span>
              </div>
              <div className="flex items-center gap-1">
                <Video size={16} />
                <span>{album.videoCount} videos</span>
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
