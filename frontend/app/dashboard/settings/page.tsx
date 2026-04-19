'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  Monitor,
  Moon,
  Sun,
  Languages,
  Volume2,
  Wifi,
  Database,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'button' | 'theme-selector';
  defaultValue?: any;
  options?: { label: string; value: string }[];
  action?: () => void;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  preview: {
    bg: string;
    card: string;
    primary: string;
    accent: string;
  };
}

const themes: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Elegant dark theme with subtle accents',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      accent: '#f59e0b'
    },
    preview: {
      bg: 'bg-gray-900',
      card: 'bg-gray-800',
      primary: 'bg-indigo-500',
      accent: 'bg-amber-500'
    }
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white minimal design',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      accent: '#0ea5e9'
    },
    preview: {
      bg: 'bg-white',
      card: 'bg-gray-50',
      primary: 'bg-blue-500',
      accent: 'bg-sky-500'
    }
  },
  {
    id: 'blue-gradient',
    name: 'Blue Gradient',
    description: 'Premium modern blue gradient theme',
    colors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      accent: '#0284c7'
    },
    preview: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      card: 'bg-white/80',
      primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
      accent: 'bg-blue-400'
    }
  },
  {
    id: 'ivory-gold',
    name: 'Ivory & Gold',
    description: 'Luxurious wedding premium theme',
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      background: '#fefce8',
      surface: '#fef3c7',
      text: '#78350f',
      accent: '#fbbf24'
    },
    preview: {
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      card: 'bg-white/90',
      primary: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      accent: 'bg-yellow-400'
    }
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description: 'Gentle pink and peach wedding feel',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      background: '#fdf2f8',
      surface: '#fce7f3',
      text: '#831843',
      accent: '#f9a8d4'
    },
    preview: {
      bg: 'bg-gradient-to-br from-pink-50 to-orange-50',
      card: 'bg-white/90',
      primary: 'bg-gradient-to-r from-pink-400 to-pink-500',
      accent: 'bg-orange-300'
    }
  }
];

const settingsSections: SettingSection[] = [
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the look and feel of your dashboard',
    icon: Palette,
    items: [
      {
        id: 'theme',
        label: 'Theme',
        description: 'Choose your preferred color scheme',
        type: 'theme-selector',
        defaultValue: 'light'
      },
      {
        id: 'animations',
        label: 'Animations',
        description: 'Enable smooth transitions and micro-interactions',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'compact-mode',
        label: 'Compact Mode',
        description: 'Reduce spacing and padding for a denser layout',
        type: 'toggle',
        defaultValue: false
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Configure your personal dashboard preferences',
    icon: Bell,
    items: [
      {
        id: 'notifications',
        label: 'Push Notifications',
        description: 'Receive notifications about important updates',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'email-updates',
        label: 'Email Updates',
        description: 'Get weekly summaries and important announcements',
        type: 'toggle',
        defaultValue: false
      },
      {
        id: 'default-view',
        label: 'Default Dashboard View',
        description: 'Choose which view loads first',
        type: 'select',
        defaultValue: 'table',
        options: [
          { label: 'Table View', value: 'table' },
          { label: 'Card View', value: 'card' },
          { label: 'Graph View', value: 'graph' }
        ]
      }
    ]
  },
  {
    id: 'localization',
    title: 'Localization',
    description: 'Set your language and regional preferences',
    icon: Globe,
    items: [
      {
        id: 'language',
        label: 'Language',
        description: 'Choose your preferred language',
        type: 'select',
        defaultValue: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Italian', value: 'it' }
        ]
      },
      {
        id: 'timezone',
        label: 'Timezone',
        description: 'Set your local timezone',
        type: 'select',
        defaultValue: 'utc',
        options: [
          { label: 'UTC', value: 'utc' },
          { label: 'EST (Eastern)', value: 'est' },
          { label: 'PST (Pacific)', value: 'pst' },
          { label: 'GMT (London)', value: 'gmt' },
          { label: 'CET (Central Europe)', value: 'cet' }
        ]
      },
      {
        id: 'date-format',
        label: 'Date Format',
        description: 'Choose how dates are displayed',
        type: 'select',
        defaultValue: 'mdy',
        options: [
          { label: 'MM/DD/YYYY', value: 'mdy' },
          { label: 'DD/MM/YYYY', value: 'dmy' },
          { label: 'YYYY-MM-DD', value: 'ymd' }
        ]
      }
    ]
  },
  {
    id: 'system',
    title: 'System',
    description: 'Manage system settings and data',
    icon: Shield,
    items: [
      {
        id: 'auto-save',
        label: 'Auto-save',
        description: 'Automatically save changes every 30 seconds',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'cache',
        label: 'Clear Cache',
        description: 'Remove temporary files and cached data',
        type: 'button',
        action: () => console.log('Clear cache clicked')
      },
      {
        id: 'export-data',
        label: 'Export Data',
        description: 'Download all your wedding planning data',
        type: 'button',
        action: () => console.log('Export data clicked')
      },
      {
        id: 'reset-settings',
        label: 'Reset Settings',
        description: 'Restore all settings to default values',
        type: 'button',
        action: () => console.log('Reset settings clicked')
      }
    ]
  }
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const initialSettings: Record<string, any> = {};
    settingsSections.forEach(section => {
      section.items.forEach(item => {
        if (item.defaultValue !== undefined) {
          initialSettings[item.id] = item.defaultValue;
        }
      });
    });
    return initialSettings;
  });

  const updateSetting = (settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  };

  const ToggleSwitch = ({ checked, onChange, id }: { checked: boolean; onChange: (value: boolean) => void; id: string }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-surface'
      }`}
      id={id}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SelectDropdown = ({ value, onChange, options, id }: {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    id: string;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      id={id}
      className="bg-surface border border-white/20 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const ActionButton = ({ onClick, label, variant = 'secondary', id }: {
    onClick: () => void;
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
    id: string;
  }) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
    const variantClasses = {
      primary: "bg-primary text-white hover:bg-primary/90",
      secondary: "bg-surface border border-white/20 text-text-primary hover:bg-white/10",
      danger: "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]}`}
        id={id}
      >
        {label}
      </button>
    );
  };

  const ThemeSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {themes.map((theme) => (
        <motion.button
          key={theme.id}
          onClick={() => onChange(theme.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
            value === theme.id
              ? 'border-primary shadow-lg shadow-primary/25 ring-2 ring-primary/50'
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <div className={`h-24 ${theme.preview.bg} relative`}>
            <div className={`absolute top-2 left-2 w-8 h-8 ${theme.preview.card} rounded-lg shadow-sm`}></div>
            <div className={`absolute top-2 right-2 w-6 h-6 ${theme.preview.primary} rounded-full shadow-sm`}></div>
            <div className={`absolute bottom-2 left-2 w-12 h-2 ${theme.preview.accent} rounded-full shadow-sm`}></div>
            {value === theme.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            )}
          </div>
          <div className="p-2 bg-surface/50 backdrop-blur-sm">
            <p className="text-xs font-medium text-text-primary truncate">{theme.name}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your dashboard preferences and configuration</p>
      </div>

      <div className="space-y-8">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <section.icon size={24} className="text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-text-primary">{section.title}</h2>
                <p className="text-text-secondary text-sm">{section.description}</p>
              </div>
            </div>

            <div className="space-y-6">
              {section.items.map((item, itemIndex) => (
                <div key={item.id} className={`${
                  item.type === 'theme-selector' ? 'space-y-4' : 'flex items-center justify-between'
                } py-3 border-b border-white/10 last:border-0`}>
                  {item.type !== 'theme-selector' && (
                    <div className="flex-1">
                      <label htmlFor={item.id} className="block text-text-primary font-medium mb-1">
                        {item.label}
                      </label>
                      {item.description && (
                        <p className="text-text-secondary text-sm">{item.description}</p>
                      )}
                    </div>
                  )}
                  {item.type === 'theme-selector' && (
                    <div>
                      <h3 className="text-text-primary font-medium mb-2">{item.label}</h3>
                      {item.description && (
                        <p className="text-text-secondary text-sm mb-4">{item.description}</p>
                      )}
                    </div>
                  )}

                  <div className={`${item.type === 'theme-selector' ? 'w-full' : 'ml-4'}`}>
                    {item.type === 'toggle' && (
                      <ToggleSwitch
                        checked={settings[item.id] || false}
                        onChange={(value) => updateSetting(item.id, value)}
                        id={item.id}
                      />
                    )}
                    {item.type === 'select' && item.options && (
                      <SelectDropdown
                        value={settings[item.id] || item.defaultValue || ''}
                        onChange={(value) => updateSetting(item.id, value)}
                        options={item.options}
                        id={item.id}
                      />
                    )}
                    {item.type === 'theme-selector' && (
                      <ThemeSelector
                        value={settings[item.id] || item.defaultValue || 'light'}
                        onChange={(value) => updateSetting(item.id, value)}
                      />
                    )}
                    {item.type === 'button' && item.action && (
                      <ActionButton
                        onClick={item.action}
                        label={item.label}
                        variant={item.id === 'reset-settings' ? 'danger' : 'secondary'}
                        id={item.id}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
