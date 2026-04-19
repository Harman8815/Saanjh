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
  Info,
  Settings
} from 'lucide-react';
import { useThemeSystem } from '../../../hooks/useTheme';
import { useI18nLocalization } from '../../../hooks/useI18nLocalization';
import { useTimezoneConverter, timezones } from '../../../hooks/useTimezoneConverter';
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
  instantApply?: boolean;
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
    description: 'Customize look and feel of your wedding planner with instant preview',
    icon: Palette,
    items: [
      {
        id: 'theme',
        label: 'Theme',
        description: 'Choose your preferred color scheme - changes apply instantly',
        type: 'theme-selector',
        defaultValue: 'dark',
        instantApply: true
      },
      {
        id: 'animations',
        label: 'Animations',
        description: 'Enable smooth transitions and micro-interactions for better user experience',
        type: 'toggle',
        defaultValue: true,
        instantApply: true
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Configure your personal preferences with smart defaults',
    icon: Settings,
    items: [
      {
        id: 'language',
        label: 'Language',
        description: 'Select your preferred language for all interface elements',
        type: 'select',
        defaultValue: 'en',
        instantApply: true,
        options: [
          { label: 'English', value: 'en' },
          { label: 'Hindi', value: 'hi' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' }
        ]
      },
      {
        id: 'currency',
        label: 'Currency',
        description: 'Choose your preferred currency for pricing and budget tracking',
        type: 'select',
        defaultValue: 'INR',
        instantApply: true,
        options: [
          { label: 'INR - Indian Rupee', value: 'INR' },
          { label: 'USD - US Dollar', value: 'USD' },
          { label: 'EUR - Euro', value: 'EUR' }
        ]
      },
      {
        id: 'timezone',
        label: 'Timezone',
        description: 'Set your local timezone for accurate time display across all features',
        type: 'select',
        defaultValue: 'utc',
        instantApply: true,
        options: timezones.map(tz => ({ label: `${tz.name} (${tz.offset})`, value: tz.code }))
      },
      {
        id: 'date-format',
        label: 'Date Format',
        description: 'Choose how dates are displayed throughout the application',
        type: 'select',
        defaultValue: 'mdy',
        instantApply: true,
        options: [
          { label: 'MM/DD/YYYY (US)', value: 'mdy' },
          { label: 'DD/MM/YYYY (European)', value: 'dmy' },
          { label: 'YYYY-MM-DD (ISO)', value: 'ymd' }
        ]
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Stay updated with important wedding planning reminders and updates',
    icon: Bell,
    items: [
      {
        id: 'email-notifications',
        label: 'Email Notifications',
        description: 'Receive wedding updates, task reminders, and vendor communications via email',
        type: 'toggle',
        defaultValue: true,
        instantApply: true
      },
      {
        id: 'push-notifications',
        label: 'Push Notifications',
        description: 'Get instant alerts on your device for urgent wedding matters',
        type: 'toggle',
        defaultValue: false,
        instantApply: true
      },
      {
        id: 'reminder-frequency',
        label: 'Reminder Frequency',
        description: 'How often to remind you about upcoming tasks and deadlines',
        type: 'select',
        defaultValue: 'weekly',
        instantApply: true,
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' }
        ]
      }
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Control your data and account security with confidence',
    icon: Shield,
    items: [
      {
        id: 'two-factor',
        label: 'Two-Factor Authentication',
        description: 'Add an extra layer of security to protect your wedding planning data',
        type: 'toggle',
        defaultValue: false,
        instantApply: true
      },
      {
        id: 'privacy-settings',
        label: 'Privacy Settings',
        description: 'Control who can see your wedding information and vendor details',
        type: 'button',
        defaultValue: undefined,
        action: () => console.log('Navigate to privacy settings')
      },
      {
        id: 'data-export',
        label: 'Export Data',
        description: 'Download all your wedding planning data in various formats',
        type: 'button',
        defaultValue: undefined,
        action: () => console.log('Export user data')
      },
      {
        id: 'account-deletion',
        label: 'Delete Account',
        description: 'Permanently delete your account and all associated data',
        type: 'button',
        defaultValue: undefined,
        action: () => console.log('Delete account')
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
    availableLanguages,
    availableCurrencies,
    changeLanguage,
    changeCurrency,
    isLanguageActive,
    isCurrencyActive,
    formatCurrency,
    t
  } = useI18nLocalization();

  // Timezone converter integration
  const {
    currentTimezone,
    currentTimezoneInfo,
    getAvailableTimezones,
    isValidTimezone,
  } = useTimezoneConverter();

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

  // Function definitions for type safety
  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setHighlightedSettings((prev: Set<string>) => new Set([...prev, 'theme']));
    setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, theme: true }));
    setTimeout(() => {
      setHighlightedSettings((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete('theme');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, theme: false }));
    }, 1000);
  };

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setHighlightedSettings((prev: Set<string>) => new Set([...prev, 'language']));
    setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, language: true }));
    setTimeout(() => {
      setHighlightedSettings((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete('language');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, language: false }));
    }, 1000);
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    await changeCurrency(currencyCode);
    setHighlightedSettings((prev: Set<string>) => new Set([...prev, 'currency']));
    setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, currency: true }));
    setTimeout(() => {
      setHighlightedSettings((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete('currency');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, currency: false }));
    }, 1000);
  };

  const handleTimezoneChange = (timezoneCode: string) => {
    setLocalSettings((prev: Record<string, any>) => ({ ...prev, timezone: timezoneCode }));
    setHighlightedSettings((prev: Set<string>) => new Set([...prev, 'timezone']));
    setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, timezone: true }));
    setTimeout(() => {
      setHighlightedSettings((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete('timezone');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, timezone: false }));
    }, 1000);
  };

  // Update local setting with instant apply or traditional update
  const updateLocalSetting = (settingId: string, value: any) => {
    const oldValue = localSettings[settingId];
    
    // Check if setting has instant apply enabled
    const setting = settingsSections
      .flatMap(section => section.items)
      .find(item => item.id === settingId);
    
    // Apply instantly or show feedback
    if (setting?.instantApply) {
      // Instant apply without confirmation
      setLocalSettings((prev: Record<string, any>) => ({
        ...prev,
        [settingId]: value
      }));
      
      // Track change for feedback
      const change: SettingChange = {
        id: settingId,
        oldValue,
        newValue: value,
        timestamp: Date.now()
      };
      
      setRecentChanges(prev => [change, ...prev.slice(0, 4)]); // Keep last 5 changes
      setHighlightedSettings((prev: Set<string>) => new Set([...prev, settingId]));
      setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, [settingId]: true }));
      
      // Clear highlight after 2 seconds
      setTimeout(() => {
        setHighlightedSettings((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.delete(settingId);
          return newSet;
        });
      }, 2000);
      
      // Clear feedback after 1 second
      setTimeout(() => {
        setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, [settingId]: false }));
      }, 1000);
    } else {
      // Traditional update with immediate local state update
      setLocalSettings((prev: Record<string, any>) => ({
        ...prev,
        [settingId]: value
      }));
    }
  };

  // Reset section to defaults
  const resetSectionToDefaults = async (sectionId: string) => {
    const section = settingsSections.find(s => s.id === sectionId);
    if (!section) return;
    
    for (const item of section.items) {
      if (item.defaultValue !== undefined) {
        if (item.id === 'theme') {
          setTheme(item.defaultValue);
        } else if (item.id === 'animations') {
          setAnimations(item.defaultValue);
        } else if (item.id === 'language') {
          await changeLanguage(item.defaultValue);
        } else if (item.id === 'currency') {
          await changeCurrency(item.defaultValue);
        } else {
          updateLocalSetting(item.id, item.defaultValue);
        }
      }
    }
    
    setHighlightedSettings((prev: Set<string>) => new Set([...prev, 'language']));
    setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, language: true }));
    setTimeout(() => {
      setHighlightedSettings((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete('language');
        return newSet;
      });
    }, 2000);
    setTimeout(() => {
      setShowFeedback((prev: Record<string, boolean>) => ({ ...prev, language: false }));
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
        id={id}
        className={`bg-surface border border-white/20 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
          isHighlighted ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''
        }`}
        whileHover={{ scale: 1.02 }}
        whileFocus={{ scale: 1.02 }}
      >
        {checked ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
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
    const baseClasses = "px-6 py-3 rounded-lg font-medium transition-colors duration-200";
    const variantClasses = {
      primary: "bg-primary text-white hover:bg-primary/600",
      secondary: "bg-surface border border-white/20 text-text-primary hover:bg-white/10",
      danger: "bg-red-500 text-white hover:bg-red-600"
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md"
                >
                  ✓
                </motion.div>
              )}
            </div>
            <div className="p-3 text-center">
              <p className="text-sm font-medium text-text-primary">{theme.name}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Settings
          </h1>
          <p className="text-text-secondary">
            Customize your wedding planning experience with instant preview and smart defaults
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {settingsSections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="glass-card p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-primary">
                    {section.title}
                  </h2>
                  <p className="text-text-secondary text-sm">
                    {section.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">
                            {item.label}
                          </label>
                          {item.description && (
                            <p className="text-xs text-text-secondary mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          {item.type === 'toggle' && (
                            <ToggleSwitch
                              id={item.id}
                              checked={getSettingValue(item.id, item.defaultValue)}
                              onChange={() => updateLocalSetting(item.id, !getSettingValue(item.id, item.defaultValue))}
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
                                } else if (item.id === 'timezone') {
                                  handleTimezoneChange(value);
                                } else {
                                  updateLocalSetting(item.id, value);
                                }
                              }}
                              options={item.options}
                              id={item.id}
                              isHighlighted={highlightedSettings.has(item.id)}
                            />
                          )}
                          {item.type === 'button' && (
                            <ActionButton
                              onClick={item.action || (() => {})}
                              label={item.label}
                              variant={item.id === 'account-deletion' ? 'danger' : 'secondary'}
                              id={item.id}
                            />
                          )}
                          {item.type === 'theme-selector' && (
                            <ThemeSelector
                              value={getSettingValue('theme', 'dark')}
                              onChange={(value) => {
                                handleThemeChange(value);
                              }}
                              isHighlighted={highlightedSettings.has('theme')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reset to Default Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => resetSectionToDefaults(section.id)}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {settingsSections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  {section.title}
                </h3>
                <div className="space-y-4">
                  {section.items
                    .filter(item => item.type === 'button')
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className="w-full btn-secondary text-left"
                        id={item.id}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
