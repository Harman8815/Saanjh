'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, Palette, Type, Calendar, MapPin, MessageSquare, Heart, X, Save, RotateCcw, Download, Eye } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// Import templates
import ElegantClassicTemplate from '@/app/invite/[uid]/page';
import ModernAnimatedTemplate from '@/app/invite/[uid]/page';

interface PreviewSettings {
  device: 'desktop' | 'mobile';
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontFamily: 'serif' | 'sans-serif';
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  message: string;
  selectedTemplate: 'elegant-classic' | 'modern-animated';
}

const defaultSettings: PreviewSettings = {
  device: 'desktop',
  theme: {
    primary: '#d97706',
    secondary: '#dc2626',
    accent: '#f59e0b'
  },
  fontFamily: 'serif',
  brideName: 'Emma',
  groomName: 'James',
  weddingDate: '2024-06-15',
  venue: 'Grand Ballroom, Sunset Hotel',
  message: 'Together with their families, they joyfully invite you to celebrate their wedding day and share in the beginning of their new journey together.',
  selectedTemplate: 'elegant-classic'
};

const colorPresets = [
  { name: 'Sunset', primary: '#d97706', secondary: '#dc2626', accent: '#f59e0b' },
  { name: 'Ocean', primary: '#0891b2', secondary: '#0e7490', accent: '#06b6d4' },
  { name: 'Forest', primary: '#059669', secondary: '#047857', accent: '#10b981' },
  { name: 'Royal', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' },
  { name: 'Rose', primary: '#e11d48', secondary: '#be123c', accent: '#f43f5e' },
  { name: 'Midnight', primary: '#1e293b', secondary: '#334155', accent: '#475569' }
];

const fontFamilies = [
  { name: 'Elegant Serif', value: 'serif' },
  { name: 'Modern Sans', value: 'sans-serif' },
  { name: 'Classic Georgia', value: 'Georgia, serif' },
  { name: 'Clean Arial', value: 'Arial, sans-serif' }
];

export default function PreviewPage() {
  const [settings, setSettings] = useState<PreviewSettings>(defaultSettings);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'details' | 'layout'>('theme');
  const { wedding, setWedding } = useAppStore();

  useEffect(() => {
    // Load wedding data if available
    if (wedding) {
      setSettings(prev => ({
        ...prev,
        brideName: wedding.brideName || prev.brideName,
        groomName: wedding.groomName || prev.groomName,
        weddingDate: wedding.weddingDate || prev.weddingDate,
        venue: wedding.venue || prev.venue,
        message: wedding.message || prev.message,
        selectedTemplate: (wedding.selectedTemplate as any) || prev.selectedTemplate
      }));
    }
  }, [wedding]);

  const updateSettings = (updates: Partial<PreviewSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateTheme = (colorType: keyof PreviewSettings['theme'], value: string) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, [colorType]: value }
    }));
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent
      }
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const saveSettings = () => {
    setWedding({
      brideName: settings.brideName,
      groomName: settings.groomName,
      weddingDate: settings.weddingDate,
      venue: settings.venue,
      message: settings.message,
      selectedTemplate: settings.selectedTemplate
    });
  };

  // Create mock invitation data for preview
  const mockInvitationData = {
    uid: 'preview',
    brideName: settings.brideName,
    groomName: settings.groomName,
    weddingDate: settings.weddingDate,
    venue: settings.venue,
    message: settings.message,
    selectedTemplate: settings.selectedTemplate,
    customColors: settings.theme,
    fontFamily: settings.fontFamily
  };

  const deviceWidth = settings.device === 'mobile' ? '375px' : '100%';
  const deviceHeight = settings.device === 'mobile' ? '812px' : '100%';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Invitation Preview</h1>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => updateSettings({ device: 'desktop' })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    settings.device === 'desktop' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
                <button
                  onClick={() => updateSettings({ device: 'mobile' })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    settings.device === 'mobile' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Palette className="w-4 h-4" />
                Customize
              </button>
              <button
                onClick={saveSettings}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Preview Area */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex justify-center">
            <div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
              style={{ 
                width: deviceWidth,
                height: deviceHeight,
                maxWidth: settings.device === 'desktop' ? '1200px' : '375px'
              }}
            >
              {settings.device === 'mobile' && (
                <div className="bg-gray-900 h-6 flex items-center justify-center">
                  <div className="w-16 h-4 bg-black rounded-full"></div>
                </div>
              )}
              
              <div className="h-full overflow-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={settings.selectedTemplate}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {settings.selectedTemplate === 'elegant-classic' && (
                      <ElegantClassicTemplate data={mockInvitationData} />
                    )}
                    {settings.selectedTemplate === 'modern-animated' && (
                      <ModernAnimatedTemplate data={mockInvitationData} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        <AnimatePresence>
          {isCustomizing && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-96 bg-white shadow-xl border-l border-gray-200 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Panel Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Customize Invitation</h2>
                    <button
                      onClick={() => setIsCustomizing(false)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('theme')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'theme'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Palette className="w-4 h-4 inline mr-2" />
                    Theme
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'details'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Type className="w-4 h-4 inline mr-2" />
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('layout')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'layout'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    Layout
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'theme' && (
                    <div className="p-6 space-y-6">
                      {/* Color Presets */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Color Presets</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {colorPresets.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => applyColorPreset(preset)}
                              className="p-3 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors"
                            >
                              <div className="flex gap-1 mb-2">
                                <div 
                                  className="w-6 h-6 rounded" 
                                  style={{ backgroundColor: preset.primary }}
                                />
                                <div 
                                  className="w-6 h-6 rounded" 
                                  style={{ backgroundColor: preset.secondary }}
                                />
                                <div 
                                  className="w-6 h-6 rounded" 
                                  style={{ backgroundColor: preset.accent }}
                                />
                              </div>
                              <div className="text-xs text-gray-600">{preset.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Colors */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Custom Colors</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Primary</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={settings.theme.primary}
                                onChange={(e) => updateTheme('primary', e.target.value)}
                                className="w-12 h-8 rounded border border-gray-300"
                              />
                              <input
                                type="text"
                                value={settings.theme.primary}
                                onChange={(e) => updateTheme('primary', e.target.value)}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Secondary</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={settings.theme.secondary}
                                onChange={(e) => updateTheme('secondary', e.target.value)}
                                className="w-12 h-8 rounded border border-gray-300"
                              />
                              <input
                                type="text"
                                value={settings.theme.secondary}
                                onChange={(e) => updateTheme('secondary', e.target.value)}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Accent</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={settings.theme.accent}
                                onChange={(e) => updateTheme('accent', e.target.value)}
                                className="w-12 h-8 rounded border border-gray-300"
                              />
                              <input
                                type="text"
                                value={settings.theme.accent}
                                onChange={(e) => updateTheme('accent', e.target.value)}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Font Family */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Font Family</h3>
                        <select
                          value={settings.fontFamily}
                          onChange={(e) => updateSettings({ fontFamily: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          {fontFamilies.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div className="p-6 space-y-6">
                      {/* Names */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Names</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bride Name</label>
                            <input
                              type="text"
                              value={settings.brideName}
                              onChange={(e) => updateSettings({ brideName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Groom Name</label>
                            <input
                              type="text"
                              value={settings.groomName}
                              onChange={(e) => updateSettings({ groomName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Event Details</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Wedding Date</label>
                            <input
                              type="date"
                              value={settings.weddingDate}
                              onChange={(e) => updateSettings({ weddingDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Venue</label>
                            <input
                              type="text"
                              value={settings.venue}
                              onChange={(e) => updateSettings({ venue: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Message</h3>
                        <textarea
                          value={settings.message}
                          onChange={(e) => updateSettings({ message: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                          placeholder="Enter your personal message..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'layout' && (
                    <div className="p-6 space-y-6">
                      {/* Template Selection */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Template</h3>
                        <div className="space-y-2">
                          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="template"
                              value="elegant-classic"
                              checked={settings.selectedTemplate === 'elegant-classic'}
                              onChange={(e) => updateSettings({ selectedTemplate: e.target.value as any })}
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium text-gray-900">Elegant Classic</div>
                              <div className="text-sm text-gray-500">Traditional and timeless design</div>
                            </div>
                          </label>
                          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="template"
                              value="modern-animated"
                              checked={settings.selectedTemplate === 'modern-animated'}
                              onChange={(e) => updateSettings({ selectedTemplate: e.target.value as any })}
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium text-gray-900">Modern Animated</div>
                              <div className="text-sm text-gray-500">Contemporary with animations</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
                        <div className="space-y-2">
                          <button
                            onClick={resetToDefaults}
                            className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reset to Defaults
                          </button>
                          <button
                            onClick={saveSettings}
                            className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
