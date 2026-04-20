'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Palette, Type, Calendar, MapPin, Users, Download, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Hardcoded data structures
const weddingData = {
  brideName: 'Sarah Johnson',
  groomName: 'Michael Smith',
  weddingDate: '2025-06-15',
  venue: 'Grand Garden Estate',
  guests: 150,
  ceremonyTime: '4:00 PM',
  receptionTime: '6:00 PM',
  address: '123 Garden Lane, Beverly Hills, CA 90210',
  dressCode: 'Formal Attire',
  rsvpDeadline: '2025-05-15',
  parents: {
    brideParents: 'Mr. and Mrs. Robert Johnson',
    groomParents: 'Mr. and Mrs. David Smith'
  }
};

const imageTemplates = [
  {
    id: 'elegant-classic',
    name: 'Elegant Classic',
    description: 'Timeless and sophisticated design',
    preview: '/templates/elegant-classic.jpg',
    colors: ['amber', 'gold', 'cream']
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean and contemporary design',
    preview: '/templates/modern-minimal.jpg',
    colors: ['gray', 'white', 'black']
  },
  {
    id: 'romantic-floral',
    name: 'Romantic Floral',
    description: 'Soft and romantic with floral elements',
    preview: '/templates/romantic-floral.jpg',
    colors: ['pink', 'rose', 'white']
  },
  {
    id: 'bold-artistic',
    name: 'Bold Artistic',
    description: 'Creative and eye-catching design',
    preview: '/templates/bold-artistic.jpg',
    colors: ['purple', 'blue', 'gold']
  }
];

export default function ImageInvitationBuilder() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'templates' | 'data'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState('elegant-classic');
  const [formData, setFormData] = useState(weddingData);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleDataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderTemplatePreview = () => {
    const template = imageTemplates.find(t => t.id === selectedTemplate);
    
    switch (selectedTemplate) {
      case 'elegant-classic':
        return (
          <div className="h-full bg-gradient-to-b from-amber-50 to-white p-8 text-center flex flex-col justify-center">
            <div className="mb-8">
              <div className="w-24 h-24 border-4 border-amber-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-amber-600 font-serif text-3xl">S&M</span>
              </div>
              <h2 className="text-3xl font-serif text-amber-800 mb-3">{formData.brideName} & {formData.groomName}</h2>
              <p className="text-amber-600 italic text-lg">Together forever</p>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg font-medium">{formData.weddingDate}</p>
              <p className="text-lg">{formData.venue}</p>
              <p className="text-sm">{formData.ceremonyTime}</p>
              <div className="w-16 h-0.5 bg-amber-400 mx-auto my-6"></div>
              <p className="text-sm text-gray-600 italic">Join us as we begin our forever</p>
              <p className="text-xs text-gray-500 mt-8">Reception to follow at {formData.receptionTime}</p>
            </div>
          </div>
        );
      case 'modern-minimal':
        return (
          <div className="h-full bg-white p-8 text-center flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-4xl font-light text-gray-900 mb-2">{formData.brideName}</h2>
              <div className="text-2xl text-gray-400 mb-2">&</div>
              <h2 className="text-4xl font-light text-gray-900 mb-6">{formData.groomName}</h2>
              <div className="w-20 h-0.5 bg-gray-300 mx-auto mb-6"></div>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="text-sm uppercase tracking-wider">{formData.weddingDate}</p>
              <p className="text-lg">{formData.venue}</p>
              <p className="text-sm text-gray-500">{formData.ceremonyTime}</p>
              <p className="text-xs text-gray-400 mt-8 uppercase tracking-wider">RSVP by {formData.rsvpDeadline}</p>
            </div>
          </div>
        );
      case 'romantic-floral':
        return (
          <div className="h-full bg-gradient-to-b from-pink-50 to-white p-8 text-center flex flex-col justify-center relative overflow-hidden">
            {/* Decorative floral elements */}
            <div className="absolute top-4 left-4 w-16 h-16 border-2 border-pink-200 rounded-full opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-20 h-20 border-2 border-pink-200 rounded-full opacity-50"></div>
            
            <div className="mb-8 relative z-10">
              <h2 className="text-3xl font-serif text-pink-800 mb-2">{formData.brideName} & {formData.groomName}</h2>
              <p className="text-pink-600 italic">Are getting married</p>
            </div>
            <div className="space-y-3 text-gray-700 relative z-10">
              <p className="text-lg font-medium">{formData.weddingDate}</p>
              <p className="text-md">{formData.venue}</p>
              <p className="text-sm text-pink-600 mt-4">{formData.ceremonyTime}</p>
              <div className="w-16 h-0.5 bg-pink-300 mx-auto my-4"></div>
              <p className="text-sm text-gray-600 italic">With love and joy</p>
            </div>
          </div>
        );
      case 'bold-artistic':
        return (
          <div className="h-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 p-8 text-white text-center flex flex-col justify-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="mb-8 relative z-10">
              <h2 className="text-4xl font-bold mb-4">{formData.brideName} & {formData.groomName}</h2>
              <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
              <p className="text-xl opacity-90">Are getting married!</p>
            </div>
            <div className="space-y-3 relative z-10">
              <p className="text-lg">{formData.weddingDate}</p>
              <p className="text-lg">{formData.venue}</p>
              <p className="text-sm opacity-80 mt-6">{formData.ceremonyTime}</p>
              <p className="text-xs opacity-60 mt-8">Join us in celebration</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a template to preview</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Image Invitation Builder</h1>
                <p className="text-sm text-gray-600">Create beautiful image invitations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/invitation-preview/image')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Full Preview
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {/* Left Panel - Controls */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Templates
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'data'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Type className="w-4 h-4 inline mr-2" />
                Data
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'templates' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Template</h3>
                {imageTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <Palette className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bride Name</label>
                    <input
                      type="text"
                      value={formData.brideName}
                      onChange={(e) => handleDataChange('brideName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Groom Name</label>
                    <input
                      type="text"
                      value={formData.groomName}
                      onChange={(e) => handleDataChange('groomName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Date</label>
                    <input
                      type="text"
                      value={formData.weddingDate}
                      onChange={(e) => handleDataChange('weddingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => handleDataChange('venue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ceremony Time</label>
                    <input
                      type="text"
                      value={formData.ceremonyTime}
                      onChange={(e) => handleDataChange('ceremonyTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reception Time</label>
                    <input
                      type="text"
                      value={formData.receptionTime}
                      onChange={(e) => handleDataChange('receptionTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden"
            style={{ width: '400px', height: '600px' }}
          >
            {renderTemplatePreview()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
