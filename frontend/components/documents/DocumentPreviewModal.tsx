'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Edit3, 
  Share2, 
  Eye,
  Maximize2,
  ExternalLink,
  FileText,
  File,
  Image as ImageIcon,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  FileSpreadsheet,
  Calendar,
  Tag,
  Info
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  size: string;
  description: string;
  tags: string[];
  url: string;
}

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

// File type icon mapping
const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return <FileText size={48} className="text-red-400" />;
    case 'doc':
    case 'docx':
      return <FileText size={48} className="text-blue-400" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <ImageIcon size={48} className="text-green-400" />;
    case 'svg':
      return <FileImage size={48} className="text-purple-400" />;
    case 'mp4':
    case 'avi':
    case 'mov':
      return <FileVideo size={48} className="text-orange-400" />;
    case 'mp3':
    case 'wav':
      return <FileAudio size={48} className="text-pink-400" />;
    case 'zip':
    case 'rar':
      return <Archive size={48} className="text-yellow-400" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet size={48} className="text-emerald-400" />;
    default:
      return <File size={48} className="text-gray-400" />;
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

export default function DocumentPreviewModal({ 
  document, 
  isOpen, 
  onClose 
}: DocumentPreviewModalProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'details'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    if (document) {
      console.log('Downloading document:', document.name);
      // Implement download functionality
    }
  };

  const handleShare = () => {
    if (document) {
      console.log('Sharing document:', document.name);
      // Implement share functionality
    }
  };

  const handleEdit = () => {
    if (document) {
      console.log('Editing document:', document.name);
      // Implement edit functionality
    }
  };

  const handleOpenInNewTab = () => {
    if (document) {
      console.log('Opening document in new tab:', document.name);
      // Implement open in new tab functionality
    }
  };

  if (!isOpen || !document) return null;

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
          className={`bg-surface border border-white/10 rounded-2xl overflow-hidden ${
            isFullscreen ? 'w-full h-full max-w-none m-0 rounded-none' : 'max-w-5xl w-full max-h-[90vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-background/50 rounded-xl">
                  {getFileIcon(document.type)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-emotional font-semibold text-text-primary mb-1">
                    {document.name}
                  </h2>
                  <div className="flex items-center gap-3 text-text-muted text-sm">
                    <span>{document.type.toUpperCase()}</span>
                    <span>·</span>
                    <span>{document.size}</span>
                    <span>·</span>
                    <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenInNewTab}
                  className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} />
                </button>
                <button
                  onClick={handleShare}
                  className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <X size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`flex ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'max-h-[60vh]'}`}>
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 p-6 overflow-y-auto">
              {/* View Mode Toggle */}
              <div className="flex bg-background/50 border border-white/10 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex-1 px-3 py-2 rounded-md transition-all ${
                    viewMode === 'preview' 
                      ? 'bg-primary text-white' 
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Eye size={16} className="inline mr-2" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('details')}
                  className={`flex-1 px-3 py-2 rounded-md transition-all ${
                    viewMode === 'details' 
                      ? 'bg-primary text-white' 
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Info size={16} className="inline mr-2" />
                  Details
                </button>
              </div>

              {/* Document Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-text-primary font-medium mb-2">Description</h3>
                  <p className="text-text-muted text-sm">{document.description}</p>
                </div>

                <div>
                  <h3 className="text-text-primary font-medium mb-2">Category</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(document.category)}`}>
                    {document.category}
                  </div>
                </div>

                <div>
                  <h3 className="text-text-primary font-medium mb-2">File Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Type:</span>
                      <span className="text-text-primary">{document.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Size:</span>
                      <span className="text-text-primary">{document.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Uploaded:</span>
                      <span className="text-text-primary">{new Date(document.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-text-primary font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              {viewMode === 'preview' ? (
                <div className="w-full h-full flex items-center justify-center">
                  {document.type.toLowerCase().match(/jpg|jpeg|png|gif|svg/) ? (
                    <img
                      src={document.url}
                      alt={document.name}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mb-4">
                        {getFileIcon(document.type)}
                      </div>
                      <p className="text-text-muted mb-4">
                        Preview not available for this file type
                      </p>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                      >
                        <Download size={16} />
                        Download to View
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-2xl">
                  <h3 className="text-text-primary font-medium mb-4">Document Details</h3>
                  <div className="bg-background/30 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-text-muted text-sm mb-1">File Name</p>
                        <p className="text-text-primary font-medium">{document.name}</p>
                      </div>
                      <div>
                        <p className="text-text-muted text-sm mb-1">File Type</p>
                        <p className="text-text-primary font-medium">{document.type.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-text-muted text-sm mb-1">Category</p>
                        <p className="text-text-primary font-medium">{document.category}</p>
                      </div>
                      <div>
                        <p className="text-text-muted text-sm mb-1">File Size</p>
                        <p className="text-text-primary font-medium">{document.size}</p>
                      </div>
                      <div>
                        <p className="text-text-muted text-sm mb-1">Upload Date</p>
                        <p className="text-text-primary font-medium">{new Date(document.uploadDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-text-muted text-sm mb-1">Document ID</p>
                        <p className="text-text-primary font-medium">{document.id}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-text-muted text-sm mb-2">Description</p>
                      <p className="text-text-primary">{document.description}</p>
                    </div>
                    
                    <div>
                      <p className="text-text-muted text-sm mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-background/50 border border-white/10 text-text-primary rounded-lg hover:bg-background/70 transition-colors flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-surface border border-white/10 text-text-primary rounded-lg hover:bg-background/50 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
