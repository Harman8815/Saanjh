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
  type: 'toggle' | 'select' | 'button';
  defaultValue?: any;
  options?: { label: string; value: string }[];
  action?: () => void;
}

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
        type: 'select',
        defaultValue: 'light',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'Auto', value: 'auto' }
        ]
      },
      {
        id: 'compact-mode',
        label: 'Compact Mode',
        description: 'Reduce spacing and padding for a denser layout',
        type: 'toggle',
        defaultValue: false
      },
      {
        id: 'animations',
        label: 'Animations',
        description: 'Enable smooth transitions and micro-interactions',
        type: 'toggle',
        defaultValue: true
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
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <div className="flex-1">
                    <label htmlFor={item.id} className="block text-text-primary font-medium mb-1">
                      {item.label}
                    </label>
                    {item.description && (
                      <p className="text-text-secondary text-sm">{item.description}</p>
                    )}
                  </div>

                  <div className="ml-4">
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
