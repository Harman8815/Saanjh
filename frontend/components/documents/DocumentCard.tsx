'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Download, 
  Edit3, 
  Trash2, 
  MoreVertical,
  FileText,
  File,
  Image as ImageIcon,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  FileSpreadsheet,
  Calendar,
  Tag
} from 'lucide-react';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    type: string;
    category: string;
    uploadDate: string;
    size: string;
    description: string;
    tags: string[];
    url: string;
  };
  viewMode?: 'grid' | 'list';
  index?: number;
  onPreview: (document: any) => void;
  onEdit: (document: any) => void;
  onDelete: (document: any) => void;
  onDownload: (document: any) => void;
}

// File type icon mapping
const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return <FileText size={24} className="text-red-400" />;
    case 'doc':
    case 'docx':
      return <FileText size={24} className="text-blue-400" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <ImageIcon size={24} className="text-green-400" />;
    case 'svg':
      return <FileImage size={24} className="text-purple-400" />;
    case 'mp4':
    case 'avi':
    case 'mov':
      return <FileVideo size={24} className="text-orange-400" />;
    case 'mp3':
    case 'wav':
      return <FileAudio size={24} className="text-pink-400" />;
    case 'zip':
    case 'rar':
      return <Archive size={24} className="text-yellow-400" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet size={24} className="text-emerald-400" />;
    default:
      return <File size={24} className="text-gray-400" />;
  }
};

// Category color mapping
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'contracts':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'invoices':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'ids':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'miscellaneous':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
};

export default function DocumentCard({ 
  document, 
  viewMode = 'grid', 
  index = 0, 
  onPreview, 
  onEdit, 
  onDelete, 
  onDownload 
}: DocumentCardProps) {
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
      {/* File Type Icon */}
      <div className={`relative ${viewMode === 'grid' ? 'h-32' : 'h-16'} bg-gradient-to-br from-surface/50 to-background/50 flex items-center justify-center`}>
        <div className="transform group-hover:scale-110 transition-transform duration-300">
          {getFileIcon(document.type)}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(document.category)}`}>
            {document.category}
          </div>
        </div>
      </div>

      {/* Document Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors truncate ${
              viewMode === 'grid' ? 'text-sm' : 'text-base'
            }`}>
              {document.name}
            </h3>
            <p className="text-text-muted text-xs mb-2 line-clamp-2">
              {document.description}
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
              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <MoreVertical size={16} />
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDropdown(false);
                        onPreview(document);
                      }}
                      className="w-full px-4 py-2 text-left text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3"
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDropdown(false);
                        onDownload(document);
                      }}
                      className="w-full px-4 py-2 text-left text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDropdown(false);
                        onEdit(document);
                      }}
                      className="w-full px-4 py-2 text-left text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                    
                    <div className="border-t border-white/10 my-1"></div>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDropdown(false);
                        onDelete(document);
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
            </div>
            <span>·</span>
            <span>{document.size}</span>
          </div>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && viewMode === 'grid' && (
          <div className="flex flex-wrap gap-1 mt-3">
            {document.tags.slice(0, 2).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="bg-surface/50 text-text-muted px-2 py-1 rounded text-xs">
                +{document.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Full Tags for List View */}
        {viewMode === 'list' && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ x: 5 }}
        className="group"
        onClick={() => onPreview(document)}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
      onClick={() => onPreview(document)}
    >
      {cardContent}
    </motion.div>
  );
}
