'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Save, 
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
  Plus,
  Trash2
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

interface DocumentManagementModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Document) => void;
}

const categories = [
  { value: 'contracts', label: 'Contracts' },
  { value: 'invoices', label: 'Invoices/Bills' },
  { value: 'ids', label: 'IDs & Personal Docs' },
  { value: 'miscellaneous', label: 'Miscellaneous' }
];

const commonTags = [
  'wedding', 'contract', 'invoice', 'vendor', 'venue', 'catering', 'photography', 'music', 'decoration', 'legal', 'official', 'draft', 'signed', 'paid', 'pending'
];

const supportedFileTypes = [
  { type: 'pdf', icon: <FileText size={16} className="text-red-400" />, label: 'PDF' },
  { type: 'doc', icon: <FileText size={16} className="text-blue-400" />, label: 'Word' },
  { type: 'docx', icon: <FileText size={16} className="text-blue-400" />, label: 'Word' },
  { type: 'jpg', icon: <ImageIcon size={16} className="text-green-400" />, label: 'JPEG' },
  { type: 'jpeg', icon: <ImageIcon size={16} className="text-green-400" />, label: 'JPEG' },
  { type: 'png', icon: <ImageIcon size={16} className="text-green-400" />, label: 'PNG' },
  { type: 'gif', icon: <ImageIcon size={16} className="text-green-400" />, label: 'GIF' },
  { type: 'svg', icon: <FileImage size={16} className="text-purple-400" />, label: 'SVG' },
  { type: 'mp4', icon: <FileVideo size={16} className="text-orange-400" />, label: 'MP4' },
  { type: 'avi', icon: <FileVideo size={16} className="text-orange-400" />, label: 'AVI' },
  { type: 'mov', icon: <FileVideo size={16} className="text-orange-400" />, label: 'MOV' },
  { type: 'mp3', icon: <FileAudio size={16} className="text-pink-400" />, label: 'MP3' },
  { type: 'wav', icon: <FileAudio size={16} className="text-pink-400" />, label: 'WAV' },
  { type: 'zip', icon: <Archive size={16} className="text-yellow-400" />, label: 'ZIP' },
  { type: 'rar', icon: <Archive size={16} className="text-yellow-400" />, label: 'RAR' },
  { type: 'xls', icon: <FileSpreadsheet size={16} className="text-emerald-400" />, label: 'Excel' },
  { type: 'xlsx', icon: <FileSpreadsheet size={16} className="text-emerald-400" />, label: 'Excel' }
];

export default function DocumentManagementModal({ 
  document, 
  isOpen, 
  onClose, 
  onSave 
}: DocumentManagementModalProps) {
  const [formData, setFormData] = useState<Document>({
    id: '',
    name: '',
    type: '',
    category: 'miscellaneous',
    uploadDate: new Date().toISOString().split('T')[0],
    size: '',
    description: '',
    tags: [],
    url: ''
  });
  const [newTag, setNewTag] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Initialize form data when document changes
  useEffect(() => {
    if (document) {
      setFormData({ ...document });
    } else {
      // Reset for new document
      setFormData({
        id: '',
        name: '',
        type: '',
        category: 'miscellaneous',
        uploadDate: new Date().toISOString().split('T')[0],
        size: '',
        description: '',
        tags: [],
        url: ''
      });
      setUploadedFiles([]);
    }
  }, [document]);

  const handleInputChange = (field: keyof Document, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      return supportedFileTypes.some(type => type.type === fileExtension);
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Set form data from first file if no existing document
    if (!document && validFiles.length > 0) {
      const file = validFiles[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileSize = (file.size / 1024 / 1024).toFixed(1) + ' MB';
      
      setFormData(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: fileExtension,
        size: fileSize,
        uploadDate: new Date().toISOString().split('T')[0]
      }));
    }
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Set uploading state for new documents
    if (!document && uploadedFiles.length > 0) {
      setIsUploading(true);
    }

    try {
      // Prepare document data for parent component
      // For new uploads, include the file; for edits, just metadata
      const savedDocument = {
        ...formData,
        id: document?.id || '', // Empty string for new documents
        url: document?.url || (uploadedFiles.length > 0 ? URL.createObjectURL(uploadedFiles[0]) : '/api/placeholder/400/300'),
        file: uploadedFiles.length > 0 ? uploadedFiles[0] : undefined,
        tags: formData.tags
      };

      onSave(savedDocument);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isUploading) {
      setUploadedFiles([]);
      setNewTag('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-emotional font-semibold text-text-primary">
                {document ? 'Edit Document' : 'Upload Document'}
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting || isUploading}
                className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* File Upload Area */}
            {!document && (
              <div 
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5"
              >
                <Upload size={48} className="text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Drag & Drop Files Here
                </h3>
                <p className="text-text-muted mb-4">
                  or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={supportedFileTypes.map(type => `.${type.type}`).join(',')}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Choose Files
                </button>
                
                {/* Supported File Types */}
                <div className="mt-6">
                  <p className="text-text-muted text-sm mb-3">Supported file types:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {supportedFileTypes.map((fileType) => (
                      <div
                        key={fileType.type}
                        className="flex items-center gap-1 px-2 py-1 bg-background/50 rounded-lg text-xs"
                      >
                        {fileType.icon}
                        <span className="text-text-muted">{fileType.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div>
                <h3 className="text-text-primary font-medium mb-3">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const fileType = supportedFileTypes.find(type => 
                            type.type === file.name.split('.').pop()?.toLowerCase()
                          );
                          return fileType?.icon || <File size={16} className="text-gray-400" />;
                        })()}
                        <div>
                          <p className="text-text-primary text-sm font-medium">{file.name}</p>
                          <p className="text-text-muted text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter document name"
                  required
                />
              </div>

              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Describe this document..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">
                Tags
              </label>
              
              {/* Add Tag Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-background/50 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Current Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary/80 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Common Tags */}
              <div>
                <p className="text-text-muted text-sm mb-2">Common tags:</p>
                <div className="flex flex-wrap gap-2">
                  {commonTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(tag)) {
                          handleInputChange('tags', [...formData.tags, tag]);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-background/50 text-text-muted hover:text-text-primary hover:bg-background/70'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isUploading}
                className="flex-1 px-6 py-3 bg-surface border border-white/10 text-text-primary rounded-lg hover:bg-background/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || (!document && uploadedFiles.length === 0)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(isSubmitting || isUploading) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isUploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {document ? 'Update Document' : 'Upload Document'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
