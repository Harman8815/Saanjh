'use client';

import { useState, useEffect, Suspense } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import DocumentCard from '../../../components/documents/DocumentCard';
import DocumentPreviewModal from '../../../components/documents/DocumentPreviewModal';
import DocumentManagementModal from '../../../components/documents/DocumentManagementModal';
import DeleteConfirmationModal from '../../../components/gallery/DeleteConfirmationModal';

// Mock data for documents
const mockDocuments = [
  {
    id: '1',
    name: 'Venue Contract - The Grand Ballroom',
    type: 'pdf',
    category: 'contracts',
    uploadDate: '2024-03-15',
    size: '2.4 MB',
    description: 'Signed venue rental agreement for wedding reception',
    tags: ['venue', 'contract', 'signed'],
    url: '/api/placeholder/400/300'
  },
  {
    id: '2',
    name: 'Photography Package Invoice',
    type: 'pdf',
    category: 'invoices',
    uploadDate: '2024-03-18',
    size: '156 KB',
    description: 'Invoice from Moments Photography Studio',
    tags: ['photography', 'invoice', 'vendor'],
    url: '/api/placeholder/400/300'
  },
  {
    id: '3',
    name: 'Marriage Certificate',
    type: 'pdf',
    category: 'ids',
    uploadDate: '2024-03-20',
    size: '1.2 MB',
    description: 'Official marriage license and certificate',
    tags: ['legal', 'certificate', 'official'],
    url: '/api/placeholder/400/300'
  },
  {
    id: '4',
    name: 'Wedding Invitation Design',
    type: 'image',
    category: 'miscellaneous',
    uploadDate: '2024-03-22',
    size: '4.8 MB',
    description: 'Final design for wedding invitations',
    tags: ['design', 'invitation', 'creative'],
    url: '/api/placeholder/400/300'
  },
  {
    id: '5',
    name: 'Catering Service Agreement',
    type: 'doc',
    category: 'contracts',
    uploadDate: '2024-03-25',
    size: '890 KB',
    description: 'Catering contract with Gourmet Delights',
    tags: ['catering', 'food', 'contract'],
    url: '/api/placeholder/400/300'
  },
  {
    id: '6',
    name: 'Florist Invoice - March',
    type: 'pdf',
    category: 'invoices',
    uploadDate: '2024-03-28',
    size: '234 KB',
    description: 'Monthly invoice from Blooms & Petals',
    tags: ['flowers', 'invoice', 'decoration'],
    url: '/api/placeholder/400/300'
  },
  {
    id: '7',
    name: 'Guest List Final',
    type: 'xlsx',
    category: 'miscellaneous',
    uploadDate: '2024-04-01',
    size: '45 KB',
    description: 'Complete guest list with contact information',
    tags: ['guests', 'planning', 'list'],
    url: '/api/placeholder/400/300'
  },
  {
    id: '8',
    name: 'Wedding Timeline',
    type: 'pdf',
    category: 'miscellaneous',
    uploadDate: '2024-04-05',
    size: '1.8 MB',
    description: 'Detailed wedding day schedule',
    tags: ['timeline', 'schedule', 'planning'],
    url: '/api/placeholder/400/300'
  }
];

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

function DocumentsContent() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState(mockDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

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

  // Filter and sort documents
  useEffect(() => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date-desc':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'date-asc':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-desc':
          return parseFloat(b.size) - parseFloat(a.size);
        case 'size-asc':
          return parseFloat(a.size) - parseFloat(b.size);
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedCategory, selectedSort]);

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

  const handleDownloadDocument = (document: any) => {
    console.log('Downloading document:', document.name);
    // Implement download functionality
  };

  const handleSaveDocument = (updatedDocument: any) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === updatedDocument.id ? updatedDocument : doc
    ));
  };

  const handleDeleteDocumentConfirm = () => {
    if (selectedDocument) {
      setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument.id));
      setDeleteModalOpen(false);
      setSelectedDocument(null);
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
              onClick={() => setManagementModalOpen(true)}
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

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
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
              onClick={() => setManagementModalOpen(true)}
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
