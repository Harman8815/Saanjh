'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Heart, 
  Grid3x3, 
  List, 
  Filter,
  Search,
  Play,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Camera,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import Lightbox from '../../../../components/gallery/Lightbox';

// Mock data for album media
const generateMockMedia = (albumId: string, count: number): MediaItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${albumId}-${i + 1}`,
    type: (i % 7 === 0 ? 'video' : 'image') as 'image' | 'video', // Every 7th item is a video
    url: `/api/placeholder/${400 + (i % 3) * 100}/${300 + (i % 2) * 100}`,
    thumbnail: `/api/placeholder/${400 + (i % 3) * 100}/${300 + (i % 2) * 100}`,
    title: `Media ${i + 1}`,
    description: `Beautiful moment from the wedding`,
    tags: ['couple', 'ceremony', 'romantic'][i % 3],
    featured: i % 10 === 0,
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
    dimensions: `${1920 + (i % 3) * 200}x${1080 + (i % 2) * 200}`
  }));
};

const albumData = {
  'haldi-ceremony': {
    title: 'Haldi Ceremony',
    description: 'Colorful traditions and joyful moments filled with laughter, love, and turmeric blessings',
    date: '2024-03-15',
    event: 'Pre-Wedding',
    coverImage: '/api/placeholder/1200/600',
    imageCount: 124,
    videoCount: 8,
    tags: ['Ceremony', 'Traditional', 'Family', 'Joyful', 'Cultural']
  },
  'mehendi-night': {
    title: 'Mehendi Night',
    description: 'Intricate henna designs and celebration with close friends and family',
    date: '2024-03-16',
    event: 'Pre-Wedding',
    coverImage: '/api/placeholder/1200/600',
    imageCount: 98,
    videoCount: 5,
    tags: ['Ceremony', 'Traditional', 'Friends', 'Art', 'Music']
  },
  'wedding-ceremony': {
    title: 'Wedding Ceremony',
    description: 'The sacred union of hearts in a beautiful traditional ceremony',
    date: '2024-03-18',
    event: 'Wedding Day',
    coverImage: '/api/placeholder/1200/600',
    imageCount: 203,
    videoCount: 15,
    tags: ['Ceremony', 'Sacred', 'Couple', 'Vows', 'Tradition']
  }
};

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

// Generate static params for static export
export async function generateStaticParams() {
  // Return the known album IDs for static generation
  return [
    { id: 'haldi-ceremony' },
    { id: 'mehendi-night' },
    { id: 'sangeet' },
    { id: 'wedding-ceremony' },
    { id: 'reception' },
    { id: 'couple-portraits' }
  ];
}

export default function AlbumPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;
  
  const [album, setAlbum] = useState(albumData[albumId as keyof typeof albumData]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load album data and media
  useEffect(() => {
    if (albumId && album) {
      setIsLoading(true);
      const totalMedia = album.imageCount + album.videoCount;
      const mockMedia = generateMockMedia(albumId, Math.min(totalMedia, 50)); // Limit to 50 for demo
      setMedia(mockMedia);
      setFilteredMedia(mockMedia);
      setIsLoading(false);
    }
  }, [albumId, album]);

  // Filter media
  useEffect(() => {
    let filtered = [...media];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'images') {
        filtered = filtered.filter(item => item.type === 'image');
      } else if (selectedFilter === 'videos') {
        filtered = filtered.filter(item => item.type === 'video');
      } else if (selectedFilter === 'featured') {
        filtered = filtered.filter(item => item.featured);
      }
    }

    setFilteredMedia(filtered);
  }, [media, searchQuery, selectedFilter]);

  const openLightbox = (mediaItem: MediaItem, index: number) => {
    setSelectedMedia(mediaItem);
    setCurrentMediaIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentMediaIndex - 1 + filteredMedia.length) % filteredMedia.length
      : (currentMediaIndex + 1) % filteredMedia.length;
    
    setCurrentMediaIndex(newIndex);
    setSelectedMedia(filteredMedia[newIndex]);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedMedia) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateMedia('prev');
      if (e.key === 'ArrowRight') navigateMedia('next');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedMedia, currentMediaIndex, filteredMedia]);

  if (!album) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-emotional font-semibold text-text-primary mb-4">
            Album Not Found
          </h2>
          <p className="text-text-muted mb-6">
            The album you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            href="/dashboard/gallery"
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Album Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative h-64 md:h-80 overflow-hidden"
      >
        {/* Cover Image */}
        <div className="absolute inset-0">
          <img
            src={album.coverImage}
            alt={album.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
          <div className="max-w-4xl">
            {/* Back Button */}
            <Link
              href="/dashboard/gallery"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Gallery
            </Link>

            {/* Album Info */}
            <h1 className="text-3xl md:text-5xl font-emotional font-bold text-white mb-3">
              {album.title}
            </h1>
            <p className="text-lg text-white/90 mb-4 max-w-2xl">
              {album.description}
            </p>
            
            {/* Album Stats */}
            <div className="flex flex-wrap gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(album.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera size={16} />
                <span>{album.imageCount} photos</span>
              </div>
              <div className="flex items-center gap-2">
                <Video size={16} />
                <span>{album.videoCount} videos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                  {album.event}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="sticky top-0 z-30 bg-surface/80 backdrop-blur-lg border-b border-white/10"
      >
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Filter Dropdown */}
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">All Media</option>
                <option value="images">Images Only</option>
                <option value="videos">Videos Only</option>
                <option value="featured">Featured</option>
              </select>

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
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'masonry' 
                      ? 'bg-primary text-white' 
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  title="Masonry View"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Action Buttons */}
              <button className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-text-primary hover:bg-background/70 transition-all flex items-center gap-2">
                <Download size={18} />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-text-primary hover:bg-background/70 transition-all flex items-center gap-2">
                <Share2 size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-text-muted text-sm">
              Showing {filteredMedia.length} of {media.length} items
            </p>
            <div className="flex gap-2">
              {album.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Media Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-muted">Loading media...</p>
            </div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-surface/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera size={40} className="text-text-muted" />
            </div>
            <h3 className="text-xl font-emotional font-semibold text-text-primary mb-2">
              No media found
            </h3>
            <p className="text-text-muted">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4'
            }
          >
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => openLightbox(item, index)}
                className={`relative group cursor-pointer overflow-hidden rounded-xl ${
                  viewMode === 'masonry' ? 'break-inside-avoid mb-4' : ''
                }`}
              >
                {/* Media Thumbnail */}
                <div className="relative aspect-square">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Video Overlay */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play size={20} className="text-black ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      <p className="text-white/80 text-xs truncate">{item.description}</p>
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {item.featured && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-gold text-white p-1.5 rounded-full">
                        <Heart size={12} />
                      </div>
                    </div>
                  )}

                  {/* Media Type Icon */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-black/50 text-white p-1.5 rounded-full">
                      {item.type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        media={selectedMedia}
        currentIndex={currentMediaIndex}
        totalItems={filteredMedia.length}
        isOpen={!!selectedMedia}
        onClose={closeLightbox}
        onNavigate={navigateMedia}
      />
    </div>
  );
}
