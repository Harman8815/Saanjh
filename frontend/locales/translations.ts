export interface TranslationKeys {
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    settings: string;
    dashboard: string;
    profile: string;
    logout: string;
    yes: string;
    no: string;
    ok: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    update: string;
    close: string;
  };
  
  // Navigation
  nav: {
    dashboard: string;
    timeline: string;
    venues: string;
    guests: string;
    budget: string;
    vendors: string;
    tasks: string;
    gallery: string;
    documents: string;
    website: string;
    settings: string;
  };
  
  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    welcome: string;
    daysUntilWedding: string;
    budgetUsed: string;
    guestRsvps: string;
    tasksComplete: string;
    weddingTimeline: string;
    recentActivity: string;
    upcomingTasks: string;
    budgetOverview: string;
    vendorStatus: string;
    quickActions: string;
    weddingWebsite: string;
  };
  
  // Settings
  settings: {
    title: string;
    subtitle: string;
    appearance: string;
    appearanceDescription: string;
    preferences: string;
    preferencesDescription: string;
    localization: string;
    localizationDescription: string;
    system: string;
    systemDescription: string;
    theme: string;
    themeDescription: string;
    animations: string;
    animationsDescription: string;
    compactMode: string;
    compactModeDescription: string;
    notifications: string;
    notificationsDescription: string;
    emailUpdates: string;
    emailUpdatesDescription: string;
    defaultView: string;
    defaultViewDescription: string;
    language: string;
    languageDescription: string;
    currency: string;
    currencyDescription: string;
    timezone: string;
    timezoneDescription: string;
    dateFormat: string;
    dateFormatDescription: string;
    autoSave: string;
    autoSaveDescription: string;
    clearCache: string;
    clearCacheDescription: string;
    exportData: string;
    exportDataDescription: string;
    resetSettings: string;
    resetSettingsDescription: string;
  };
  
  // Guests
  guests: {
    title: string;
    addGuest: string;
    guestList: string;
    rsvpStatus: string;
    seatingChart: string;
    mealPreferences: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    dietary: string;
    plusOne: string;
    confirmed: string;
    pending: string;
    declined: string;
    invited: string;
    attending: string;
  };
  
  // Budget
  budget: {
    title: string;
    totalBudget: string;
    spent: string;
    remaining: string;
    category: string;
    amount: string;
    date: string;
    vendor: string;
    notes: string;
    addExpense: string;
    expenses: string;
    overview: string;
    progress: string;
  };
  
  // Vendors
  vendors: {
    title: string;
    addVendor: string;
    vendorList: string;
    category: string;
    contact: string;
    email: string;
    phone: string;
    website: string;
    status: string;
    booked: string;
    pending: string;
    contacted: string;
    notes: string;
    venue: string;
    photographer: string;
    caterer: string;
    florist: string;
    music: string;
  };
  
  // Tasks
  tasks: {
    title: string;
    addTask: string;
    taskList: string;
    checklists: string;
    deadlines: string;
    completed: string;
    taskName: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    high: string;
    medium: string;
    low: string;
    todo: string;
    inProgress: string;
    done: string;
  };
  
  // Wedding specific terms
  wedding: {
    bride: string;
    groom: string;
    wedding: string;
    marriage: string;
    ceremony: string;
    reception: string;
    venue: string;
    date: string;
    time: string;
    guests: string;
    budget: string;
    planning: string;
  };
  
  // Currency and formatting
  currency: {
    inr: string;
    usd: string;
    eur: string;
  };
  
  // Errors and messages
  errors: {
    required: string;
    invalid: string;
    network: string;
    server: string;
    notFound: string;
    unauthorized: string;
  };
  
  messages: {
    saved: string;
    updated: string;
    deleted: string;
    added: string;
    success: string;
    warning: string;
    info: string;
  };
}

export const translations: Record<string, TranslationKeys> = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      settings: 'Settings',
      dashboard: 'Dashboard',
      profile: 'Profile',
      logout: 'Logout',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      update: 'Update',
      close: 'Close',
    },
    
    nav: {
      dashboard: 'Dashboard',
      timeline: 'Timeline',
      venues: 'Venues & Booking',
      guests: 'Guests',
      budget: 'Budget',
      vendors: 'Vendors',
      tasks: 'Tasks',
      gallery: 'Gallery',
      documents: 'Documents',
      website: 'Website',
      settings: 'Settings',
    },
    
    dashboard: {
      title: 'Wedding Dashboard',
      subtitle: 'Manage your wedding planning journey',
      welcome: 'Welcome to your wedding planning dashboard',
      daysUntilWedding: 'Days Until Wedding',
      budgetUsed: 'Budget Used',
      guestRsvps: 'Guest RSVPs',
      tasksComplete: 'Tasks Complete',
      weddingTimeline: 'Wedding Timeline',
      recentActivity: 'Recent Activity',
      upcomingTasks: 'Upcoming Tasks',
      budgetOverview: 'Budget Overview',
      vendorStatus: 'Vendor Status',
      quickActions: 'Quick Actions',
      weddingWebsite: 'Wedding Website',
    },
    
    settings: {
      title: 'Settings',
      subtitle: 'Manage your dashboard preferences and configuration',
      appearance: 'Appearance',
      appearanceDescription: 'Customize the look and feel of your dashboard',
      preferences: 'Preferences',
      preferencesDescription: 'Configure your personal dashboard preferences',
      localization: 'Localization',
      localizationDescription: 'Set your language and regional preferences',
      system: 'System',
      systemDescription: 'Manage system settings and data',
      theme: 'Theme',
      themeDescription: 'Choose your preferred color scheme',
      animations: 'Animations',
      animationsDescription: 'Enable smooth transitions and micro-interactions',
      compactMode: 'Compact Mode',
      compactModeDescription: 'Reduce spacing and padding for a denser layout',
      notifications: 'Push Notifications',
      notificationsDescription: 'Receive notifications about important updates',
      emailUpdates: 'Email Updates',
      emailUpdatesDescription: 'Get weekly summaries and important announcements',
      defaultView: 'Default Dashboard View',
      defaultViewDescription: 'Choose which view loads first',
      language: 'Language',
      languageDescription: 'Choose your preferred language',
      currency: 'Currency',
      currencyDescription: 'Select your preferred currency for display',
      timezone: 'Timezone',
      timezoneDescription: 'Set your local timezone',
      dateFormat: 'Date Format',
      dateFormatDescription: 'Choose how dates are displayed',
      autoSave: 'Auto-save',
      autoSaveDescription: 'Automatically save changes every 30 seconds',
      clearCache: 'Clear Cache',
      clearCacheDescription: 'Remove temporary files and cached data',
      exportData: 'Export Data',
      exportDataDescription: 'Download all your wedding planning data',
      resetSettings: 'Reset Settings',
      resetSettingsDescription: 'Restore all settings to default values',
    },
    
    guests: {
      title: 'Guest Management',
      addGuest: 'Add Guest',
      guestList: 'Guest List',
      rsvpStatus: 'RSVP Status',
      seatingChart: 'Seating Chart',
      mealPreferences: 'Meal Preferences',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      dietary: 'Dietary Restrictions',
      plusOne: 'Plus One',
      confirmed: 'Confirmed',
      pending: 'Pending',
      declined: 'Declined',
      invited: 'Invited',
      attending: 'Attending',
    },
    
    budget: {
      title: 'Budget Management',
      totalBudget: 'Total Budget',
      spent: 'Spent',
      remaining: 'Remaining',
      category: 'Category',
      amount: 'Amount',
      date: 'Date',
      vendor: 'Vendor',
      notes: 'Notes',
      addExpense: 'Add Expense',
      expenses: 'Expenses',
      overview: 'Overview',
      progress: 'Progress',
    },
    
    vendors: {
      title: 'Vendor Management',
      addVendor: 'Add Vendor',
      vendorList: 'Vendor List',
      category: 'Category',
      contact: 'Contact',
      email: 'Email',
      phone: 'Phone',
      website: 'Website',
      status: 'Status',
      booked: 'Booked',
      pending: 'Pending',
      contacted: 'Contacted',
      notes: 'Notes',
      venue: 'Venue',
      photographer: 'Photographer',
      caterer: 'Caterer',
      florist: 'Florist',
      music: 'Music',
    },
    
    tasks: {
      title: 'Task Management',
      addTask: 'Add Task',
      taskList: 'Task List',
      checklists: 'Checklists',
      deadlines: 'Deadlines',
      completed: 'Completed',
      taskName: 'Task Name',
      description: 'Description',
      dueDate: 'Due Date',
      priority: 'Priority',
      status: 'Status',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      todo: 'To Do',
      inProgress: 'In Progress',
      done: 'Done',
    },
    
    wedding: {
      bride: 'Bride',
      groom: 'Groom',
      wedding: 'Wedding',
      marriage: 'Marriage',
      ceremony: 'Ceremony',
      reception: 'Reception',
      venue: 'Venue',
      date: 'Date',
      time: 'Time',
      guests: 'Guests',
      budget: 'Budget',
      planning: 'Planning',
    },
    
    currency: {
      inr: 'Indian Rupee',
      usd: 'US Dollar',
      eur: 'Euro',
    },
    
    errors: {
      required: 'This field is required',
      invalid: 'Invalid input',
      network: 'Network error occurred',
      server: 'Server error occurred',
      notFound: 'Page not found',
      unauthorized: 'Unauthorized access',
    },
    
    messages: {
      saved: 'Saved successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
      added: 'Added successfully',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
    },
  },
  
  hi: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      settings: 'Settings',
      dashboard: 'Dashboard',
      profile: 'Profile',
      logout: 'Logout',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      update: 'Update',
      close: 'Close',
    },
    
    nav: {
      dashboard: 'Dashboard',
      timeline: 'Timeline',
      venues: 'Venues & Booking',
      guests: 'Guests',
      budget: 'Budget',
      vendors: 'Vendors',
      tasks: 'Tasks',
      gallery: 'Gallery',
      documents: 'Documents',
      website: 'Website',
      settings: 'Settings',
    },
    
    dashboard: {
      title: 'Wedding Dashboard',
      subtitle: 'Manage your wedding planning journey',
      welcome: 'Welcome to your wedding planning dashboard',
      daysUntilWedding: 'Days Until Wedding',
      budgetUsed: 'Budget Used',
      guestRsvps: 'Guest RSVPs',
      tasksComplete: 'Tasks Complete',
      weddingTimeline: 'Wedding Timeline',
      recentActivity: 'Recent Activity',
      upcomingTasks: 'Upcoming Tasks',
      budgetOverview: 'Budget Overview',
      vendorStatus: 'Vendor Status',
      quickActions: 'Quick Actions',
      weddingWebsite: 'Wedding Website',
    },
    
    settings: {
      title: 'Settings',
      subtitle: 'Manage your dashboard preferences and configuration',
      appearance: 'Appearance',
      appearanceDescription: 'Customize the look and feel of your dashboard',
      preferences: 'Preferences',
      preferencesDescription: 'Configure your personal dashboard preferences',
      localization: 'Localization',
      localizationDescription: 'Set your language and regional preferences',
      system: 'System',
      systemDescription: 'Manage system settings and data',
      theme: 'Theme',
      themeDescription: 'Choose your preferred color scheme',
      animations: 'Animations',
      animationsDescription: 'Enable smooth transitions and micro-interactions',
      compactMode: 'Compact Mode',
      compactModeDescription: 'Reduce spacing and padding for a denser layout',
      notifications: 'Push Notifications',
      notificationsDescription: 'Receive notifications about important updates',
      emailUpdates: 'Email Updates',
      emailUpdatesDescription: 'Get weekly summaries and important announcements',
      defaultView: 'Default Dashboard View',
      defaultViewDescription: 'Choose which view loads first',
      language: 'Language',
      languageDescription: 'Choose your preferred language',
      currency: 'Currency',
      currencyDescription: 'Select your preferred currency for display',
      timezone: 'Timezone',
      timezoneDescription: 'Set your local timezone',
      dateFormat: 'Date Format',
      dateFormatDescription: 'Choose how dates are displayed',
      autoSave: 'Auto-save',
      autoSaveDescription: 'Automatically save changes every 30 seconds',
      clearCache: 'Clear Cache',
      clearCacheDescription: 'Remove temporary files and cached data',
      exportData: 'Export Data',
      exportDataDescription: 'Download all your wedding planning data',
      resetSettings: 'Reset Settings',
      resetSettingsDescription: 'Restore all settings to default values',
    },
    
    guests: {
      title: 'Guest Management',
      addGuest: 'Add Guest',
      guestList: 'Guest List',
      rsvpStatus: 'RSVP Status',
      seatingChart: 'Seating Chart',
      mealPreferences: 'Meal Preferences',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      dietary: 'Dietary Restrictions',
      plusOne: 'Plus One',
      confirmed: 'Confirmed',
      pending: 'Pending',
      declined: 'Declined',
      invited: 'Invited',
      attending: 'Attending',
    },
    
    budget: {
      title: 'Budget Management',
      totalBudget: 'Total Budget',
      spent: 'Spent',
      remaining: 'Remaining',
      category: 'Category',
      amount: 'Amount',
      date: 'Date',
      vendor: 'Vendor',
      notes: 'Notes',
      addExpense: 'Add Expense',
      expenses: 'Expenses',
      overview: 'Overview',
      progress: 'Progress',
    },
    
    vendors: {
      title: 'Vendor Management',
      addVendor: 'Add Vendor',
      vendorList: 'Vendor List',
      category: 'Category',
      contact: 'Contact',
      email: 'Email',
      phone: 'Phone',
      website: 'Website',
      status: 'Status',
      booked: 'Booked',
      pending: 'Pending',
      contacted: 'Contacted',
      notes: 'Notes',
      venue: 'Venue',
      photographer: 'Photographer',
      caterer: 'Caterer',
      florist: 'Florist',
      music: 'Music',
    },
    
    tasks: {
      title: 'Task Management',
      addTask: 'Add Task',
      taskList: 'Task List',
      checklists: 'Checklists',
      deadlines: 'Deadlines',
      completed: 'Completed',
      taskName: 'Task Name',
      description: 'Description',
      dueDate: 'Due Date',
      priority: 'Priority',
      status: 'Status',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      todo: 'To Do',
      inProgress: 'In Progress',
      done: 'Done',
    },
    
    wedding: {
      bride: 'Bride',
      groom: 'Groom',
      wedding: 'Wedding',
      marriage: 'Marriage',
      ceremony: 'Ceremony',
      reception: 'Reception',
      venue: 'Venue',
      date: 'Date',
      time: 'Time',
      guests: 'Guests',
      budget: 'Budget',
      planning: 'Planning',
    },
    
    currency: {
      inr: 'Indian Rupee',
      usd: 'US Dollar',
      eur: 'Euro',
    },
    
    errors: {
      required: 'This field is required',
      invalid: 'Invalid input',
      network: 'Network error occurred',
      server: 'Server error occurred',
      notFound: 'Page not found',
      unauthorized: 'Unauthorized access',
    },
    
    messages: {
      saved: 'Saved successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
      added: 'Added successfully',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
    },
  },
};

/**
 * Hook for accessing translations
 */
export function useTranslation(language: string = 'en') {
  const t = translations[language] || translations['en'];
  
  return {
    t,
    // Helper function to get nested translation
    get: (key: string) => {
      const keys = key.split('.');
      let value: any = t;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
    },
  };
}
