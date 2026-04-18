export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'milestone' | 'planning' | 'ceremony' | 'reception';
  color?: string;
}

// Predefined color palette for events
export const EVENT_COLORS = [
  { name: 'Rose', value: 'rose', twClass: 'bg-rose-500', borderClass: 'border-rose-500', hex: '#f43f5e' },
  { name: 'Blue', value: 'blue', twClass: 'bg-blue-500', borderClass: 'border-blue-500', hex: '#3b82f6' },
  { name: 'Violet', value: 'violet', twClass: 'bg-violet-500', borderClass: 'border-violet-500', hex: '#8b5cf6' },
  { name: 'Amber', value: 'amber', twClass: 'bg-amber-500', borderClass: 'border-amber-500', hex: '#f59e0b' },
  { name: 'Emerald', value: 'emerald', twClass: 'bg-emerald-500', borderClass: 'border-emerald-500', hex: '#10b981' },
  { name: 'Cyan', value: 'cyan', twClass: 'bg-cyan-500', borderClass: 'border-cyan-500', hex: '#06b6d4' },
  { name: 'Pink', value: 'pink', twClass: 'bg-pink-500', borderClass: 'border-pink-500', hex: '#ec4899' },
  { name: 'Orange', value: 'orange', twClass: 'bg-orange-500', borderClass: 'border-orange-500', hex: '#f97316' },
  { name: 'Indigo', value: 'indigo', twClass: 'bg-indigo-500', borderClass: 'border-indigo-500', hex: '#6366f1' },
  { name: 'Teal', value: 'teal', twClass: 'bg-teal-500', borderClass: 'border-teal-500', hex: '#14b8a6' },
] as const;

// Keyword to color mapping for auto-assignment
export const KEYWORD_COLOR_MAP: Record<string, string> = {
  // Ceremony related
  'ceremony': 'violet',
  'vow': 'violet',
  'wedding': 'rose',
  'marriage': 'rose',
  // Reception related
  'reception': 'amber',
  'dinner': 'amber',
  'food': 'amber',
  'party': 'amber',
  'dance': 'amber',
  // Planning related
  'planning': 'blue',
  'meeting': 'blue',
  'call': 'blue',
  // Milestone related
  'milestone': 'emerald',
  'booking': 'emerald',
  'book': 'emerald',
  // Photography
  'photo': 'pink',
  'photography': 'pink',
  'video': 'pink',
  'shoot': 'pink',
  // Beauty/Prep
  'hair': 'cyan',
  'makeup': 'cyan',
  'spa': 'cyan',
  'yoga': 'cyan',
  'meditation': 'cyan',
  // Travel
  'travel': 'indigo',
  'flight': 'indigo',
  'hotel': 'indigo',
  'pickup': 'indigo',
};

// Helper function to get color by value
export const getEventColor = (colorValue?: string) => {
  return EVENT_COLORS.find(c => c.value === colorValue) || EVENT_COLORS[0];
};

// Helper function to suggest color based on title/description
export const suggestColorFromKeywords = (text: string): string => {
  const lowerText = text.toLowerCase();
  for (const [keyword, color] of Object.entries(KEYWORD_COLOR_MAP)) {
    if (lowerText.includes(keyword)) {
      return color;
    }
  }
  return 'rose'; // default color
};
