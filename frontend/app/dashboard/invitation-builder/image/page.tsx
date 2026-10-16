'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Palette, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  IMAGE_TEMPLATES,
  ImageInvitationTemplate,
  templateIdForCard,
  type ImageInvitationData,
} from '../../../../components/invitations/ImageInvitationTemplate';

// Defaults for a card that has not been customised yet.
const defaultWeddingData = {
  brideName: 'Sarah Johnson',
  groomName: 'Michael Smith',
  weddingDate: 'June 15, 2025',
  venue: 'Grand Garden Estate',
  ceremonyTime: '4:00 PM',
  receptionTime: '6:00 PM',
  address: '123 Garden Lane, Beverly Hills, CA 90210',
  dressCode: 'Formal Attire',
  rsvpDeadline: 'May 15, 2025',
  parents: {
    brideParents: 'Mr. and Mrs. Robert Johnson',
    groomParents: 'Mr. and Mrs. David Smith'
  }
};

export default function ImageInvitationBuilder() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'templates' | 'data'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState('elegant-classic');
  const [formData, setFormData] = useState(defaultWeddingData);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleDataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // The preview renders through the shared template component so it matches
  // exactly what /invitation-preview/image/[id] shows.
  const invitationData: ImageInvitationData = {
    brideName: formData.brideName,
    groomName: formData.groomName,
    weddingDate: formData.weddingDate,
    venue: formData.venue,
    ceremonyTime: formData.ceremonyTime,
    receptionTime: formData.receptionTime,
    rsvpDeadline: formData.rsvpDeadline,
    selectedTemplate,
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
                onClick={() => router.push('/invitation-preview/image')}
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
                {IMAGE_TEMPLATES.map((template) => (
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
            <ImageInvitationTemplate data={invitationData} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
