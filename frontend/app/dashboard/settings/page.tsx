'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  Check,
  X,
  Info
} from 'lucide-react';
import { useThemeSystem } from '../../../hooks/useTheme';
import { useLocalizationSystem } from '../../../hooks/useLocalization';
import { themes } from '../../../store/themeStore';

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

interface SettingChange {
  id: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
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
        description: 'Choose your preferred color scheme. Changes apply instantly.',
        type: 'theme-selector',
        defaultValue: 'light'
      },
      {
        id: 'animations',
        label: 'Animations',
        description: 'Enable smooth transitions and micro-interactions for better visual feedback.',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'compact-mode',
        label: 'Compact Mode',
        description: 'Reduce spacing and padding for a denser layout. Useful for smaller screens.',
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
        description: 'Receive notifications about important updates and deadlines.',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'email-updates',
        label: 'Email Updates',
        description: 'Get weekly summaries and important announcements via email.',
        type: 'toggle',
        defaultValue: false
      },
      {
        id: 'default-view',
        label: 'Default Dashboard View',
        description: 'Choose which view loads first when you open the dashboard.',
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
        description: 'Choose your preferred language for the interface.',
        type: 'select',
        defaultValue: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Hindi', value: 'hi' }
        ]
      },
      {
        id: 'currency',
        label: 'Currency',
        description: 'Select your preferred currency for displaying prices and budgets.',
        type: 'select',
        defaultValue: 'INR',
        options: [
          { label: 'INR - Indian Rupee', value: 'INR' },
          { label: 'USD - US Dollar', value: 'USD' },
          { label: 'EUR - Euro', value: 'EUR' }
        ]
      },
      {
        id: 'timezone',
        label: 'Timezone',
        description: 'Set your local timezone for accurate time display.',
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
        description: 'Choose how dates are displayed throughout the application.',
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
        description: 'Automatically save changes every 30 seconds to prevent data loss.',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'cache',
        label: 'Clear Cache',
        description: 'Remove temporary files and cached data to free up storage space.',
        type: 'button',
        action: () => console.log('Clear cache clicked')
      },
      {
        id: 'export-data',
        label: 'Export Data',
        description: 'Download all your wedding planning data as a backup file.',
        type: 'button',
        action: () => console.log('Export data clicked')
      },
      {
        id: 'reset-settings',
        label: 'Reset Settings',
        description: 'Restore all settings to their default values. This action cannot be undone.',
        type: 'button',
        action: () => console.log('Reset settings clicked')
      }
    ]
  }
];

export default function SettingsPage() {
  const {
    currentTheme,
    themes: availableThemes,
    setTheme,
    animationsEnabled,
    toggleAnimations,
    setAnimations,
    resetToDefaults
  } = useThemeSystem();

  const {
    currentLanguage,
    currentCurrency,
    languages: availableLanguages,
    currencies: availableCurrencies,
    setLanguage,
    setCurrency,
    isLanguageActive,
    isCurrencyActive,
    formatCurrency
  } = useLocalizationSystem();

  // Local state for non-theme settings
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(() => {
    const initialSettings: Record<string, any> = {};
    settingsSections.forEach(section => {
      section.items.forEach(item => {
        if (item.id !== 'theme' && item.id !== 'animations' && item.id !== 'language' && item.id !== 'currency' && item.defaultValue !== undefined) {
          initialSettings[item.id] = item.defaultValue;
        }
      });
    });
    return initialSettings;
  });

  // State for tracking setting changes and feedback
  const [recentChanges, setRecentChanges] = useState<SettingChange[]>([]);
  const [highlightedSettings, setHighlightedSettings] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const updateLocalSetting = (settingId: string, value: any) => {
    const oldValue = localSettings[settingId];
    setLocalSettings((prev: Record<string, any>) => ({
      ...prev,
      [settingId]: value
    }));

    // Track the change for feedback
    const change: SettingChange = {
      id: settingId,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    };
    
    setRecentChanges(prev => [change, ...prev.slice(0, 4)]); // Keep last 5 changes
    setHighlightedSettings(prev => new Set([...prev, settingId]));
    setShowFeedback(prev => ({ ...prev, [settingId]: true }));

    // Clear highlight after 2 seconds
    setTimeout(() => {
      setHighlightedSettings(prev => {
        const newSet = new Set(prev);
        newSet.delete(settingId);
        return newSet;
      });
    }, 2000);

    // Clear feedback after 1 second
    setTimeout(() => {
      setShowFeedback(prev => ({ ...prev, [settingId]: false }));
    }, 1000);
  };

  // Reset section to defaults
  const resetSectionToDefaults = (sectionId: string) => {
    const section = settingsSections.find(s => s.id === sectionId);
    if (!section) return;

    section.items.forEach(item => {
      if (item.defaultValue !== undefined) {
        if (item.id === 'theme') {
          setTheme(item.defaultValue);
        } else if (item.id === 'animations') {
          setAnimations(item.defaultValue);
        } else if (item.id === 'language') {
          setLanguage(item.defaultValue);
        } else if (item.id === 'currency') {
          setCurrency(item.defaultValue);
        } else {
          updateLocalSetting(item.id, item.defaultValue);
        }
      }
    });
  };

  // Handle instant apply for theme and localization
  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setHighlightedSettings(prev => new Set([...prev, 'theme']));
    setShowFeedback(prev => ({ ...prev, theme: true }));
    setTimeout(() => {
      setHighlightedSettings(prev => {
        const newSet = new Set(prev);
        newSet.delete('theme');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback(prev => ({ ...prev, theme: false }));
    }, 1000);
  };

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    setHighlightedSettings(prev => new Set([...prev, 'language']));
    setShowFeedback(prev => ({ ...prev, language: true }));
    setTimeout(() => {
      setHighlightedSettings(prev => {
        const newSet = new Set(prev);
        newSet.delete('language');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback(prev => ({ ...prev, language: false }));
    }, 1000);
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    setHighlightedSettings(prev => new Set([...prev, 'currency']));
    setShowFeedback(prev => ({ ...prev, currency: true }));
    setTimeout(() => {
      setHighlightedSettings(prev => {
        const newSet = new Set(prev);
        newSet.delete('currency');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback(prev => ({ ...prev, currency: false }));
    }, 1000);
  };

  const handleAnimationToggle = () => {
    toggleAnimations();
    setHighlightedSettings(prev => new Set([...prev, 'animations']));
    setShowFeedback(prev => ({ ...prev, animations: true }));
    setTimeout(() => {
      setHighlightedSettings(prev => {
        const newSet = new Set(prev);
        newSet.delete('animations');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback(prev => ({ ...prev, animations: false }));
    }, 1000);
  };

  const getSettingValue = (settingId: string, defaultValue?: any) => {
    if (settingId === 'theme') return currentTheme;
    if (settingId === 'animations') return animationsEnabled;
    if (settingId === 'language') return currentLanguage;
    if (settingId === 'currency') return currentCurrency;
    return localSettings[settingId] ?? defaultValue;
  };

  const ToggleSwitch = ({ checked, onChange, id, isHighlighted }: { 
    checked: boolean; 
    onChange: (value: boolean) => void; 
    id: string;
    isHighlighted?: boolean;
  }) => (
    <div className="relative">
      <AnimatePresence>
        {showFeedback[id] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-8 left-0 bg-primary text-white text-xs px-2 py-1 rounded-md z-10"
          >
            Updated!
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
          checked ? 'bg-primary' : 'bg-surface'
        } ${
          isHighlighted ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''
        }`}
        id={id}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-md"
          animate={{
            x: checked ? 24 : 4
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );

  const SelectDropdown = ({ value, onChange, options, id, isHighlighted }: {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    id: string;
    isHighlighted?: boolean;
  }) => (
    <div className="relative">
      <AnimatePresence>
        {showFeedback[id] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-8 left-0 bg-primary text-white text-xs px-2 py-1 rounded-md z-10"
          >
            Updated!
          </motion.div>
        )}
      </AnimatePresence>
      <motion.select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id={id}
        className={`bg-surface border border-white/20 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
          isHighlighted ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''
        }`}
        whileHover={{ scale: 1.02 }}
        whileFocus={{ scale: 1.02 }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
    </div>
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

  const ThemeSelector = ({ value, onChange, isHighlighted }: { 
    value: string; 
    onChange: (value: string) => void;
    isHighlighted?: boolean;
  }) => (
    <div className="relative">
      <AnimatePresence>
        {showFeedback['theme'] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-8 left-0 bg-primary text-white text-xs px-2 py-1 rounded-md z-10"
          >
            Theme Updated!
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${
        isHighlighted ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background rounded-xl p-2' : ''
      }`}>
        {availableThemes.map((theme) => (
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
                  <Check size={10} className="text-white" />
                </motion.div>
              )}
            </div>
            <div className="p-2 bg-surface/50 backdrop-blur-sm">
              <p className="text-xs font-medium text-text-primary truncate">{theme.name}</p>
            </div>
          </motion.button>
        ))}
      </div>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <section.icon size={24} className="text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">{section.title}</h2>
                  <p className="text-text-secondary text-sm">{section.description}</p>
                </div>
              </div>
              <motion.button
                onClick={() => resetSectionToDefaults(section.id)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-surface/50 border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={14} />
                Reset to Default
              </motion.button>
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
                        checked={getSettingValue(item.id, item.defaultValue)}
                        onChange={(value) => {
                          if (item.id === 'animations') {
                            handleAnimationToggle();
                          } else {
                            updateLocalSetting(item.id, value);
                          }
                        }}
                        id={item.id}
                        isHighlighted={highlightedSettings.has(item.id)}
                      />
                    )}
                    {item.type === 'select' && item.options && (
                      <SelectDropdown
                        value={getSettingValue(item.id, item.defaultValue) || ''}
                        onChange={(value) => {
                          if (item.id === 'language') {
                            handleLanguageChange(value);
                          } else if (item.id === 'currency') {
                            handleCurrencyChange(value);
                          } else {
                            updateLocalSetting(item.id, value);
                          }
                        }}
                        options={item.options}
                        id={item.id}
                        isHighlighted={highlightedSettings.has(item.id)}
                      />
                    )}
                    {item.type === 'theme-selector' && (
                      <ThemeSelector
                        value={getSettingValue(item.id, item.defaultValue) || 'light'}
                        onChange={handleThemeChange}
                        isHighlighted={highlightedSettings.has(item.id)}
                      />
                    )}
                    {item.type === 'button' && (
                      <ActionButton
                        onClick={() => {
                          if (item.id === 'reset-settings') {
                            resetToDefaults();
                            setLocalSettings({});
                          } else {
                            item.action?.();
                          }
                        }}
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
