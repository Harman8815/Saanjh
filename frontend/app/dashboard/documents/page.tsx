'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  Upload, 
  FileText, 
  Calendar,
  Tag,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Edit3,
  File,
  Image as ImageIcon,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  FileSpreadsheet,
  Loader2,
  AlertCircle
} from 'lucide-react';
import DocumentCard from '../../../components/documents/DocumentCard';
import DocumentPreviewModal from '../../../components/documents/DocumentPreviewModal';
import DocumentManagementModal from '../../../components/documents/DocumentManagementModal';
import DeleteConfirmationModal from '../../../components/gallery/DeleteConfirmationModal';
import { useDocuments, useSearchDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '../../../hooks/useDocuments';
import type { Document } from '../../../types/api';

const categories = [
  { value: 'all', label: 'All Documents' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'invoices', label: 'Invoices/Bills' },
  { value: 'ids', label: 'IDs & Personal Docs' },
  { value: 'miscellaneous', label: 'Miscellaneous' }
];

const sortOptions = [
  { value: 'date-desc', label: 'Most Recent' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'size-desc', label: 'Largest First' },
  { value: 'size-asc', label: 'Smallest First' }
];

function formatDocumentForDisplay(doc: Document) {
  return {
    id: String(doc.id),
    name: doc.name,
    type: doc.file_type,
    category: doc.category,
    uploadDate: doc.uploaded_at,
    size: doc.file_size_display || '0 B',
    description: doc.description || '',
    tags: doc.tags.map(t => t.name),
    url: doc.file_url
  };
}

function DocumentsContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // API hooks
  const { documents, isLoading, error, mutate } = useDocuments(1, 100, selectedCategory);
  const { documents: searchResults, isLoading: isSearching } = useSearchDocuments(searchQuery, selectedCategory);
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  // Handle query parameters
  useEffect(() => {
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    const action = searchParams.get('action');

    if (category) {
      setSelectedCategory(category);
    }
    if (sort) {
      setSelectedSort(sort);
    }
    if (action === 'upload') {
      setManagementModalOpen(true);
    }
  }, [searchParams]);

  // Get filtered and sorted documents
  const filteredDocuments = useMemo(() => {
    let docs = searchQuery ? searchResults : documents;
    
    if (!docs) return [];
    
    // Apply sorting
    const sorted = [...docs].sort((a: Document, b: Document) => {
      switch (selectedSort) {
        case 'date-desc':
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
        case 'date-asc':
          return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-desc':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'size-asc':
          return (a.file_size || 0) - (b.file_size || 0);
        default:
          return 0;
      }
    });
    
    return sorted.map(formatDocumentForDisplay);
  }, [documents, searchResults, searchQuery, selectedSort]);

  // Document management handlers
  const handlePreviewDocument = (document: any) => {
    setSelectedDocument(document);
    setPreviewModalOpen(true);
  };

  const handleEditDocument = (document: any) => {
    setSelectedDocument(document);
    setManagementModalOpen(true);
  };

  const handleDeleteDocument = (document: any) => {
    setSelectedDocument(document);
    setDeleteModalOpen(true);
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      const response = await fetch(document.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleSaveDocument = async (updatedDocument: any) => {
    try {
      if (updatedDocument.id) {
        // Update existing document
        const documentId = parseInt(updatedDocument.id);
        if (isNaN(documentId)) {
          throw new Error('Invalid document ID');
        }
        
        await updateDocument.mutateAsync({
          documentId: documentId,
          documentData: {
            name: updatedDocument.name,
            description: updatedDocument.description,
            category: updatedDocument.category,
            tag_names: updatedDocument.tags
          }
        });
      } else {
        // Create new document
        const file = updatedDocument.file;
        if (file) {
          await createDocument.mutateAsync({
            name: updatedDocument.name,
            description: updatedDocument.description,
            category: updatedDocument.category,
            file: file,
            tag_names: updatedDocument.tags
          });
        }
      }
      
      // Refresh the documents list
      mutate();
      setManagementModalOpen(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleDeleteDocumentConfirm = async () => {
    if (selectedDocument) {
      try {
        const documentId = parseInt(selectedDocument.id);
        if (isNaN(documentId)) {
          throw new Error('Invalid document ID');
        }
        
        await deleteDocument.mutateAsync(documentId);
        mutate();
        setDeleteModalOpen(false);
        setSelectedDocument(null);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading documents...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-red-400">
          <AlertCircle className="w-12 h-12" />
          <p>Failed to load documents</p>
          <button 
            onClick={() => mutate()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-emotional font-bold text-text-primary mb-4">
            Document Management
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Organize and manage all your important wedding documents in one place
          </p>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-surface border border-white/10 rounded-2xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all w-64"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-background/50 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-4 py-2 bg-background/50 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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

            {/* Upload Button */}
            <button
              onClick={() => {
                setSelectedDocument(null);
                setManagementModalOpen(true);
              }}
              className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Upload size={18} />
              Upload Document
            </button>
          </div>
        </motion.div>
      </div>

      {/* Documents Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }
      >
        {filteredDocuments.map((document, index) => (
          <DocumentCard
            key={document.id}
            document={document}
            viewMode={viewMode}
            index={index}
            onPreview={handlePreviewDocument}
            onEdit={handleEditDocument}
            onDelete={handleDeleteDocument}
            onDownload={handleDownloadDocument}
          />
        ))}
      </motion.div>

      {/* Loading Indicator */}
      {(isLoading || isSearching) && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isSearching && filteredDocuments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <FileText size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No documents found
          </h3>
          <p className="text-text-muted mb-6">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by uploading your first wedding document'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <button
              onClick={() => {
                setSelectedDocument(null);
                setManagementModalOpen(true);
              }}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Upload First Document
            </button>
          )}
        </motion.div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={selectedDocument}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />

      {/* Document Management Modal */}
      <DocumentManagementModal
        document={selectedDocument}
        isOpen={managementModalOpen}
        onClose={() => {
          setManagementModalOpen(false);
          setSelectedDocument(null);
        }}
        onSave={handleSaveDocument}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        itemType="document"
        itemName={selectedDocument?.name || ''}
        itemCount={1}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteDocumentConfirm}
      />
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted">Loading documents...</div>
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  );
}
